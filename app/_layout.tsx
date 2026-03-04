import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { supabase } from '../src/services/supabase';
import { useStore } from '../src/store/useStore';

export default function RootLayout() {
  const { setUser } = useStore();

  // Verificar sesión al cargar la app
  useEffect(() => {
    const handleAuth = async (session: any) => {
      if (session?.user) {
        const email = session.user.email || '';
        const nombre = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0] || 'Usuario';
        
        setUser({
          id: session.user.id,
          nombre: nombre,
          email: email,
        });
      }
    };

    // 1. Carga inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleAuth(session);
    });

    // 2. Escuchar cambios (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || session) {
        handleAuth(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FF6B35' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#f8f8f8' },
        }}
      >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="agregar-producto" options={{ title: 'Agregar Producto' }} />
      <Stack.Screen name="mis-productos" options={{ title: 'Mis Productos' }} />
      <Stack.Screen name="producto/[id]" options={{ title: 'Detalle del Producto' }} />
      <Stack.Screen name="pedido/[id]" options={{ title: 'Detalle del Pedido' }} />
      <Stack.Screen name="chat-soporte" options={{ title: 'Soporte' }} />
      <Stack.Screen name="direcciones" options={{ title: 'Mis Direcciones' }} />
      <Stack.Screen name="metodos-pago" options={{ title: 'Métodos de Pago' }} />
      <Stack.Screen name="configuracion" options={{ title: 'Configuración' }} />
      <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
      <Stack.Screen name="seguimiento" options={{ title: 'Seguimiento' }} />
      <Stack.Screen name="notificaciones" options={{ title: 'Notificaciones' }} />
      <Stack.Screen name="pedidos-vendedor" options={{ title: 'Pedidos (Vendedor)' }} />
      <Stack.Screen name="tienda/[id]" options={{ title: 'Detalle de Tienda' }} />
      <Stack.Screen name="promociones" options={{ title: 'Promociones' }} />
      <Stack.Screen name="editar-perfil" options={{ title: 'Editar Perfil' }} />
      <Stack.Screen name="busqueda-avanzada" options={{ title: 'Búsqueda' }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="registro-vendedor" options={{ title: 'Registro Vendedor' }} />
      <Stack.Screen name="favoritos" options={{ title: 'Favoritos' }} />
      <Stack.Screen name="resenas" options={{ title: 'Reseñas' }} />
      <Stack.Screen name="ayuda" options={{ title: 'Ayuda' }} />
    </Stack>
    </SafeAreaProvider>
  );
}
