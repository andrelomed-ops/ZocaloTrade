const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

export interface DireccionSugerida {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
  type: string;
}

export interface Ubicacion {
  lat: number;
  lng: number;
}

export interface CostoEnvio {
  distancia: number;
  costo: number;
  zona: string;
  tiendaId?: string;
  tiendaNombre?: string;
}

export interface InfoProducto {
  precio: number;
  cantidad?: number;
  peso?: number;
}

const TARIFAS_CLINKARGO = {
  base: 25,
  por_km: 3,
  min: 25,
  max: 500,
  umbralGratis: 800,
  descuento20: 250,
  descuento10: 150,
};

const ZOCALO_DEFAULT: Ubicacion = { lat: 19.4326, lng: -99.1332 };

export const buscarDirecciones = async (query: string): Promise<DireccionSugerida[]> => {
  if (query.length < 3) return [];
  
  try {
    const response = await fetch(
      `${NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(query + ', Ciudad de Mexico, Mexico')}&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'ZocaloTrade/1.0'
        }
      }
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.filter((item: any) => 
      item.address?.city === 'Ciudad de México' || 
      item.address?.city === 'Mexico City' ||
      item.address?.county?.includes('Ciudad de México')
    );
  } catch (error) {
    console.error('Error buscando direcciones:', error);
    return [];
  }
};

export const getCurrentLocation = (): Promise<Ubicacion | null> => {
  return new Promise((resolve) => {
    if (!navigator || !navigator.geolocation) {
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};

const toRad = (deg: number) => deg * (Math.PI / 180);

export const calcularDistancia = ( origen: Ubicacion, destino: Ubicacion): number => {
  const R = 6371;
  const dLat = toRad(destino.lat - origen.lat);
  const dLon = toRad(destino.lng - origen.lng);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(origen.lat)) * Math.cos(toRad(destino.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calcularCostoEnvio = (
  ubicacionDestino: Ubicacion, 
  tiendaUbicacion?: Ubicacion | null,
  tiendaNombre?: string,
  infoPedido?: { subtotal: number }
): CostoEnvio => {
  const origen = tiendaUbicacion || ZOCALO_DEFAULT;
  const distancia = calcularDistancia(origen, ubicacionDestino);
  const { subtotal } = infoPedido || { subtotal: 0 };
  
  let zona = 'Centro';
  if (distancia > 5) zona = 'Zona 1';
  if (distancia > 10) zona = 'Zona 2';
  if (distancia > 20) zona = 'Zona 3';
  if (distancia > 35) zona = 'Zona 4';
  if (distancia > 50) zona = 'Foráneo';
  
  let costo = TARIFAS_CLINKARGO.base + (distancia * TARIFAS_CLINKARGO.por_km);
  
  if (subtotal >= TARIFAS_CLINKARGO.umbralGratis) {
    costo = Math.min(costo, TARIFAS_CLINKARGO.base * 0.5);
  } else if (subtotal >= TARIFAS_CLINKARGO.descuento20) {
    costo = Math.round(costo * 0.8);
  } else if (subtotal >= TARIFAS_CLINKARGO.descuento10) {
    costo = Math.round(costo * 0.9);
  }
  
  costo = Math.max(TARIFAS_CLINKARGO.min, Math.min(TARIFAS_CLINKARGO.max, costo));
  
  return {
    distancia: Math.round(distancia * 10) / 10,
    costo,
    zona,
    tiendaNombre: tiendaNombre || 'ZocaloTrade'
  };
};

export const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
  try {
    const response = await fetch(
      `${NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          'User-Agent': 'ZocaloTrade/1.0'
        }
      }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.display_name;
  } catch (error) {
    console.error('Error reverse geocode:', error);
    return null;
  }
};
