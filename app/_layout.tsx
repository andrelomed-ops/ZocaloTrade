import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { supabase } from '../src/services/supabase';
import { useStore } from '../src/store/useStore';
import { View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import '../src/services/i18n';
import { useTranslation } from 'react-i18next';

export default function RootLayout() {
  const { setUser, initialize, colors, loadUserExtras, loadPedidos } = useStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const setupApp = async () => {
      try {
        await initialize();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const email = session.user.email || '';
          const nombre = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0] || 'Usuario';
          setUser({
            id: session.user.id,
            nombre: nombre,
            email: email,
          });
          await loadUserExtras(session.user.id);
          await loadPedidos(session.user.id);
        }
      } catch (error) {
        console.error('Setup error:', error);
      } finally {
        setIsReady(true);
      }
    };

    setupApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const email = session.user.email || '';
        const nombre = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0] || 'Usuario';
        setUser({
          id: session.user.id,
          nombre: nombre,
          email: email,
        });
        await loadUserExtras(session.user.id);
        await loadPedidos(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors?.primary || '#FF6B35' }}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
  );
}
