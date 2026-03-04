import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bctwviuitgqyolxabwxq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjdHd2aXVpdGdxeW9seGFid3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMjM4MzMsImV4cCI6MjA4Nzg5OTgzM30.PfKJ0zCIKPqSwUkyLZLTAwkbmyZOh_wSOoVbf51wd2Y';

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
