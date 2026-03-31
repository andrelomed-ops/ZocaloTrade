import { createClient } from '@supabase/supabase-js';

const CLINKCARGO_SUPABASE_URL = 'https://dyaebyyhlscujqpnjeuf.supabase.co';
const CLINKCARGO_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5YWVieXlobHNjdWpxcG5qZXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MDk0NDUsImV4cCI6MjA5MDQ4NTQ0NX0.9xS9M6J6pQvjZymbIvmQv-daMgZaVweWCdqqvnAYlD8';
const ZOCALOTRADE_API_KEY = 'pk_live_zocalotrade_ce9d9bf3ff15a9f38e37d30c813373c82d2f40ed5b80545da73f49c5a3d151f5';

const clinkcargoClient = createClient(CLINKCARGO_SUPABASE_URL, CLINKCARGO_ANON_KEY, {
    global: {
        headers: {
            'x-api-key': ZOCALOTRADE_API_KEY,
        },
    },
});

export type VehicleType = 
    | 'motorcycle'      
    | 'bicycle'        
    | 'scooter'        
    | 'car'            
    | 'van'            
    | 'van_refrigerated'
    | 'truck_small'    
    | 'truck_medium'   
    | 'truck_large'   
    | 'crane'          
    | 'flatbed'        
    | 'tow_truck'      
    | 'special';

export type ServiceType = 'mercancia' | 'vehiculos' | 'mudanza' | 'perecedero';

export const VEHICLE_TYPES: Record<VehicleType, { name: string; basePrice: number; pricePerKm: number; maxWeightKg: number; serviceType: ServiceType }> = {
    motorcycle: { name: 'Motocicleta', basePrice: 30, pricePerKm: 8, maxWeightKg: 50, serviceType: 'mercancia' },
    bicycle: { name: 'Bicicleta', basePrice: 15, pricePerKm: 5, maxWeightKg: 20, serviceType: 'mudanza' },
    scooter: { name: 'Scooter', basePrice: 20, pricePerKm: 6, maxWeightKg: 30, serviceType: 'mudanza' },
    car: { name: 'Automóvil/Camioneta', basePrice: 50, pricePerKm: 12, maxWeightKg: 500, serviceType: 'mercancia' },
    van: { name: 'Furgoneta', basePrice: 80, pricePerKm: 18, maxWeightKg: 1000, serviceType: 'mercancia' },
    van_refrigerated: { name: 'Furgoneta Refrigerada', basePrice: 120, pricePerKm: 25, maxWeightKg: 800, serviceType: 'perecedero' },
    truck_small: { name: 'Camión 3.5 Ton', basePrice: 150, pricePerKm: 22, maxWeightKg: 3500, serviceType: 'mercancia' },
    truck_medium: { name: 'Camión 5 Ton', basePrice: 200, pricePerKm: 28, maxWeightKg: 5000, serviceType: 'mudanza' },
    truck_large: { name: 'Camión 10+ Ton', basePrice: 350, pricePerKm: 35, maxWeightKg: 15000, serviceType: 'mudanza' },
    crane: { name: 'Grúa/Plataforma', basePrice: 200, pricePerKm: 25, maxWeightKg: 2000, serviceType: 'vehiculos' },
    flatbed: { name: 'Plataforma/Madrina', basePrice: 300, pricePerKm: 30, maxWeightKg: 5000, serviceType: 'vehiculos' },
    tow_truck: { name: 'Grúa de Rescate', basePrice: 180, pricePerKm: 20, maxWeightKg: 3000, serviceType: 'vehiculos' },
    special: { name: 'Vehículo Especial', basePrice: 400, pricePerKm: 40, maxWeightKg: 20000, serviceType: 'mudanza' },
};

export interface ClincKargoOrder {
    customer_id?: string;
    status: string;
    service_type: 'shared' | 'direct';
    pickup_address: string;
    dropoff_address: string;
    price: number;
    distance: number;
    requires_cold_chain: boolean;
    vehicle_type_needed?: VehicleType;
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
    vehicleType?: VehicleType;
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

function mapProductSizeToWeight(size: string): number {
    const weightMap: Record<string, number> = {
        'Pequeño': 5,
        'Mediano': 15,
        'Grande': 40,
        'Extra Grande': 100
    };
    return weightMap[size] || 10;
}

function selectAppropriateVehicle(totalWeightKg: number): VehicleType {
    if (totalWeightKg <= 30) return 'scooter';
    if (totalWeightKg <= 50) return 'motorcycle';
    if (totalWeightKg <= 100) return 'bicycle';
    if (totalWeightKg <= 500) return 'car';
    if (totalWeightKg <= 1000) return 'van';
    if (totalWeightKg <= 3500) return 'truck_small';
    if (totalWeightKg <= 5000) return 'truck_medium';
    return 'truck_large';
}

export async function createClincKargoOrder(payload: ZocaloToClincKargoPayload): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
        const items = payload.items.map(item => ({
            name: item.name,
            size: item.size,
            quantity: item.quantity,
            weight_kg: item.peso || mapProductSizeToWeight(item.size),
            temperature_requirement: 'none'
        }));

        const totalWeight = items.reduce((sum, item) => sum + (item.weight_kg || 10) * item.quantity, 0);
        
        const vehicleType = payload.vehicleType || selectAppropriateVehicle(totalWeight);
        const vehicleConfig = VEHICLE_TYPES[vehicleType];

        const estimatedDistance = 10;
        const estimatedPrice = vehicleConfig.basePrice + (estimatedDistance * vehicleConfig.pricePerKm);

        const orderData = {
            status: 'searching',
            service_type: vehicleConfig.serviceType,
            pickup_address: payload.pickupAddress,
            dropoff_address: payload.dropoffAddress,
            pickup_coordinates: payload.pickupCoordinates,
            dropoff_coordinates: payload.dropoffCoordinates,
            price: Math.round(estimatedPrice * 116) / 100,
            distance: estimatedDistance,
            requires_cold_chain: vehicleConfig.serviceType === 'perecedero',
            vehicle_type_needed: vehicleType,
            waypoints: [
                {
                    address: payload.pickupAddress,
                    coordinates: payload.pickupCoordinates,
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
                partner_order_id: payload.pedidoId,
                customer_phone: payload.customerPhone,
                customer_name: payload.customerName,
                items
            }
        });

        if (error) {
            console.error('Error creating ClincKargo order:', error);
            return { success: false, error: error.message };
        }

        return { success: true, orderId: data?.order?.id || data?.orderId };
    } catch (err) {
        console.error('ClincKargo integration error:', err);
        return { success: false, error: 'Failed to create transport order' };
    }
}

export async function getClincKargoOrderStatus(orderId: string): Promise<{
    status: string;
    eta?: number;
    vehicleType?: VehicleType;
    driver?: {
        name: string;
        vehicle: string;
        plate: string;
    };
} | null> {
    try {
        const { data, error } = await clinkcargoClient
            .from('orders')
            .select('status, eta, vehicle_type_assigned, driver_name, driver_vehicle, driver_plate')
            .eq('id', orderId)
            .single();

        if (error || !data) return null;

        return {
            status: data.status,
            eta: data.eta,
            vehicleType: data.vehicle_type_assigned,
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
    'processing_payment': 'Procesando pago',
    'searching': 'Buscando conductor',
    'driver_assigned': 'Conductor asignado',
    'pickup_route': 'En camino a recolección',
    'delivery_route': 'En camino a entrega',
    'completed': 'Entregado',
    'cancelled': 'Cancelado'
};

export interface TransportQuote {
    price: number;
    distance: number;
    estimatedTime: number;
    vehicleType: VehicleType;
    vehicleName: string;
    breakdown: {
        basePrice: number;
        distancePrice: number;
        subtotal: number;
        iva: number;
        total: number;
    };
}

export async function quoteTransport(
    pickupCoordinates: { lat: number; lng: number },
    dropoffCoordinates: { lat: number; lng: number },
    items: Array<{ name: string; size: string; quantity: number }>
): Promise<TransportQuote | null> {
    try {
        const R = 6371;
        const dLat = (dropoffCoordinates.lat - pickupCoordinates.lat) * Math.PI / 180;
        const dLon = (dropoffCoordinates.lng - pickupCoordinates.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(pickupCoordinates.lat * Math.PI / 180) * Math.cos(dropoffCoordinates.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = Math.round(R * c);

        const totalWeight = items.reduce((sum, item) => {
            return sum + mapProductSizeToWeight(item.size) * item.quantity;
        }, 0);

        const vehicleType = selectAppropriateVehicle(totalWeight);
        const vehicleConfig = VEHICLE_TYPES[vehicleType];

        const basePrice = vehicleConfig.basePrice;
        const distancePrice = distance * vehicleConfig.pricePerKm;
        const subtotal = basePrice + distancePrice;
        const iva = subtotal * 0.16;
        const total = subtotal + iva;
        const estimatedTime = Math.round(distance / 30 * 60);

        return {
            price: Math.round(total * 100) / 100,
            distance,
            estimatedTime,
            vehicleType,
            vehicleName: vehicleConfig.name,
            breakdown: {
                basePrice,
                distancePrice,
                subtotal,
                iva,
                total: Math.round(total * 100) / 100
            }
        };
    } catch (err) {
        console.error('Quote error:', err);
        return null;
    }
}

export async function getAvailableVehicleTypes(): Promise<VehicleType[]> {
    return Object.keys(VEHICLE_TYPES) as VehicleType[];
}

export function getVehicleInfo(type: VehicleType) {
    return VEHICLE_TYPES[type];
}

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
