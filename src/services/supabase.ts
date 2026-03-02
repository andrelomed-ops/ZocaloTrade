import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bctwviuitgqyolxabwxq.supabase.co';
const supabaseAnonKey = 'sb_publishable_YugD3h596FgRE4ZySuRmvg_zWxdpZ6e';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const TABLES = {
  PERFILES: 'perfiles',
  TIENDAS: 'tiendas',
  PRODUCTOS: 'productos',
  PEDIDOS: 'pedidos',
};

export const BUCKET_NAME = 'productos';

// Subir imagen a Supabase Storage
export async function uploadImage(uri: string, folder: string = 'productos'): Promise<string | null> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, blob);
    
    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }
    
    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

// IDs de las tiendas en Supabase
export const TIENDAS_IDS = {
  ARTESANIAS: 'f859b36a-424e-498a-a703-edc46ddeb9ac',
  SABORES: 'a132f06f-1001-41ce-9051-d596eb0842e5',
  TEXTILES: '9c1b71eb-ac5a-4aeb-bf66-ed2799e08a7e',
  JOYERIA: '2f35c01e-ca13-4e1a-a71f-2a451e2d5690',
};
