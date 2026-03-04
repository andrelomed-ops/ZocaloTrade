import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '../src/services/supabase';
import { useStore } from '../src/store/useStore';

export default function SplashScreen() {
  const { setUser, initialize } = useStore();

  useEffect(() => {
    const initApp = async () => {
      try {
        // 1. Cargar datos básicos
        await initialize();

        // 2. Darle un momento a Supabase para procesar tokens de la URL (especialmente en Web)
        if (Platform.OS === 'web') {
          // Pequeña espera para asegurar que el cliente de Supabase leyó el hash de la URL
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const user = session.user;
          const userEmail = user.email || '';
          const userNombre = user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split('@')[0];
          
          setUser({
            id: user.id,
            nombre: userNombre,
            email: userEmail,
          });
        }

        // 3. Navegar a la app
        router.replace('/(tabs)');
        
      } catch (error) {
        console.error('Initialization error:', error);
        router.replace('/(tabs)');
      }
    };

    initApp();
  }, []);

  return (
    <View style={styles.splash}>
      <Text style={styles.logo}>🏪</Text>
      <Text style={styles.appName}>ZocaloTrade</Text>
      <Text style={styles.tagline}>Sincronizando sesión...</Text>
      <View style={styles.loading}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: { fontSize: 100 },
  appName: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginTop: 20 },
  tagline: { fontSize: 18, color: 'rgba(255,255,255,0.9)', marginTop: 10 },
  loading: { marginTop: 50 },
});
