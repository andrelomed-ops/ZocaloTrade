import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { supabase } from '../src/services/supabase';
import { useStore } from '../src/store/useStore';
import { View, ActivityIndicator } from 'react-native';

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
          // Cargar datos extra del usuario
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
      </Stack>
    </SafeAreaProvider>
  );
}
