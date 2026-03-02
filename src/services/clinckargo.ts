import { createClient } from '@supabase/supabase-js';

const CLINKCARGO_SUPABASE_URL = 'https://uqxjpimokfalwewmvgxw.supabase.co';
const CLINKCARGO_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeGpwaW1va2ZhbHdld212Z3h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MTM0MTIsImV4cCI6MjA4NzE4OTQxMn0.J_-MKrYBavjK71sj2sRz8aEqcl7KQ_1IhnYveLRGcME';

const clinkcargoClient = createClient(CLINKCARGO_SUPABASE_URL, CLINKCARGO_ANON_KEY);

export interface ClincKargoOrder {
  customer_id?: string;
  status: string;
  service_type: 'shared' | 'direct';
  pickup_address: string;
  dropoff_address: string;
  price: number;
  distance: number;
  requires_cold_chain: boolean;
  waypoints: Array<{
    address: string;
    coordinates?: { lat: number; lng: number };
    type: 'pickup' | 'dropoff';
  }>;
}

export interface ZocaloToClincKargoPayload {
  pedidoId: string;
  pickupAddress: string;
  pickupCoordinates?: { lat: number; lng: number };
  dropoffAddress: string;
  dropoffCoordinates?: { lat: number; lng: number };
  items: Array<{
    name: string;
    size: 'Pequeño' | 'Mediano' | 'Grande' | 'Extra Grande';
    quantity: number;
    peso?: number;
    description?: string;
  }>;
  customerPhone?: string;
  customerName?: string;
}

const ZOCALO_PICKUP_LOCATION = {
  address: 'Zócalo de la Ciudad de México, Centro Histórico, CDMX',
  coordinates: { lat: 19.4326, lng: -99.1332 }
};

function mapProductSize(precio: number): 'Pequeño' | 'Mediano' | 'Grande' | 'Extra Grande' {
  if (precio < 200) return 'Pequeño';
  if (precio < 500) return 'Mediano';
  if (precio < 1000) return 'Grande';
  return 'Extra Grande';
}

function estimateDistance(zona: string): number {
  const zonaDistances: Record<string, number> = {
    'centro': 2,
    'alcaldias_cerca': 4,
    'alcaldias_medio': 7,
    'alcaldias_lejos': 12,
    'edomex_cerca': 15,
    'edomex_lejos': 25,
    'foraneo_cerca': 35,
    'foraneo_lejos': 50,
  };
  return zonaDistances[zona] || 10;
}

export async function createClincKargoOrder(payload: ZocaloToClincKargoPayload): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const items = payload.items.map(item => ({
      name: item.name,
      size: item.size,
      quantity: item.quantity,
      temperatureRequirement: 'none' as const
    }));

    const estimatedDistance = estimateDistance('alcaldias_medio');
    const basePrice = 150;
    const pricePerKm = 12;
    const estimatedPrice = basePrice + (estimatedDistance * pricePerKm);

    const orderData: ClincKargoOrder = {
      status: 'searching',
      service_type: 'direct',
      pickup_address: ZOCALO_PICKUP_LOCATION.address,
      dropoff_address: payload.dropoffAddress,
      price: estimatedPrice,
      distance: estimatedDistance,
      requires_cold_chain: false,
      waypoints: [
        {
          address: ZOCALO_PICKUP_LOCATION.address,
          coordinates: ZOCALO_PICKUP_LOCATION.coordinates,
          type: 'pickup'
        },
        {
          address: payload.dropoffAddress,
          coordinates: payload.dropoffCoordinates,
          type: 'dropoff'
        }
      ]
    };

    const { data, error } = await clinkcargoClient.functions.invoke('create-clinckargo-order', {
      body: {
        ...orderData,
        zocalotrade_pedido_id: payload.pedidoId,
        customer_phone: payload.customerPhone,
        customer_name: payload.customerName,
        items
      }
    });

    if (error) {
      console.error('Error creating ClincKargo order:', error);
      return { success: false, error: error.message };
    }

    return { success: true, orderId: data?.orderId };
  } catch (err) {
    console.error('ClincKargo integration error:', err);
    return { success: false, error: 'Failed to create transport order' };
  }
}

export async function getClincKargoOrderStatus(orderId: string): Promise<{
  status: string;
  eta?: number;
  driver?: {
    name: string;
    vehicle: string;
    plate: string;
  };
} | null> {
  try {
    const { data, error } = await clinkcargoClient
      .from('orders')
      .select('status, eta, driver_name, driver_vehicle, driver_plate')
      .eq('id', orderId)
      .single();

    if (error || !data) return null;

    return {
      status: data.status,
      eta: data.eta,
      driver: data.driver_name ? {
        name: data.driver_name,
        vehicle: data.driver_vehicle,
        plate: data.driver_plate
      } : undefined
    };
  } catch (err) {
    console.error('Error fetching order status:', err);
    return null;
  }
}

export const CLINKCARGO_STATUS_MAP: Record<string, string> = {
  'searching': 'Buscando conductor',
  'driver_assigned': 'Conductor asignado',
  'pickup_route': 'En camino a recolección',
  'delivery_route': 'En camino a entrega',
  'completed': 'Entregado'
};

export function syncOrderStatus(
  zocaloPedidoId: string, 
  clinkCargoOrderId: string,
  onStatusChange: (status: string, etapa: string) => void
): () => void {
  const channel = clinkcargoClient
    .channel(`clinckargo-sync-${zocaloPedidoId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${clinkCargoOrderId}`
      },
      (payload) => {
        const newStatus = payload.new.status as string;
        const etapa = CLINKCARGO_STATUS_MAP[newStatus] || newStatus;
        onStatusChange(newStatus, etapa);
      }
    )
    .subscribe();

  return () => {
    clinkcargoClient.removeChannel(channel);
  };
}
