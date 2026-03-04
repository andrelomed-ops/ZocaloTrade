import { createClient } from '@supabase/supabase-js';

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
  return null; // Mock for now
};
