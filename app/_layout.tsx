import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { supabase } from '../src/services/supabase';
import { useStore } from '../src/store/useStore';
import '../src/services/i18n'; // Inicializa i18next

export default function RootLayout() {
  const { setUser, initialize, colors } = useStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const setupApp = async () => {
      try {
        await initialize();
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          setUser({
            id: session.user.id,
            nombre: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuario',
            email: session.user.email || '',
          });
        }
      } catch (error) {
        console.error('Safe fallback error:', error);
      } finally {
        if (mounted) setIsReady(true);
      }
    };

    setupApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && mounted) {
        setUser({
          id: session.user.id,
          nombre: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuario',
          email: session.user.email || '',
        });
      } else if (event === 'SIGNED_OUT' && mounted) {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FF6B35' }}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors?.primary || '#FF6B35' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: colors?.background || '#f8f8f8' },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="configuracion" options={{ title: 'Configuración' }} />
      <Stack.Screen name="chat-soporte" options={{ title: 'Soporte' }} />
      <Stack.Screen name="editar-perfil" options={{ title: 'Editar Perfil' }} />
      <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
      <Stack.Screen name="seguimiento" options={{ title: 'Seguimiento' }} />
      <Stack.Screen name="admin/index" options={{ title: 'Panel Maestro' }} />
      <Stack.Screen name="mis-productos" options={{ title: 'Mi Inventario' }} />
      <Stack.Screen name="pedidos-vendedor" options={{ title: 'Pedidos Recibidos' }} />
      <Stack.Screen name="estadisticas" options={{ title: 'Estadísticas' }} />
      <Stack.Screen name="notificaciones" options={{ title: 'Notificaciones' }} />
      <Stack.Screen name="promociones" options={{ title: 'Promociones' }} />
      <Stack.Screen name="ayuda" options={{ title: 'Ayuda' }} />
      <Stack.Screen name="resenas" options={{ title: 'Mis Reseñas' }} />
      <Stack.Screen name="direcciones" options={{ title: 'Direcciones' }} />
      <Stack.Screen name="metodos-pago" options={{ title: 'Pagos' }} />
      <Stack.Screen name="tienda/[id]" options={{ title: 'Tienda' }} />
      <Stack.Screen name="producto/[id]" options={{ title: 'Producto' }} />
    </Stack>
  );
}