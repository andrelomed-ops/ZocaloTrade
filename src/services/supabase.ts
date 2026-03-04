import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Usamos EXPO_PUBLIC_ que es el estándar de Expo para asegurar que se inyecten en el cliente web
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bctwviuitgqyolxabwxq.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjdHd2aXVpdGdxeW9seGFid3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMjM4MzMsImV4cCI6MjA4Nzg5OTgzM30.PfKJ0zCIKPqSwUkyLZLTAwkbmyZOh_wSOoVbf51wd2Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true // CRÍTICO: Obliga a Supabase a buscar el token de Google en la URL
  }
});

export const TABLES: any = {
  PERFILES: 'perfiles',
  TIENDAS: 'tiendas',
  PRODUCTOS: 'productos',
  PEDIDOS: 'pedidos',
};

export const BUCKET_NAME = 'productos';

export const uploadImage = async (uri: string) => {
  try {
    if (Platform.OS === 'web') {
      // En web, convertimos la URI a Blob
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `prod_${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, blob);
        
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
      return publicUrl;
    }
    return uri; // En móvil requiere una lógica de base64/formdata distinta
  } catch (e) {
    console.error('Upload error:', e);
    return null;
  }
};
