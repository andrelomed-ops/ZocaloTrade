import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '../src/services/supabase';
import { useStore } from '../src/store/useStore';

export default function SplashScreen() {
  const { setUser, initialize } = useStore();

  useEffect(() => {
    let mounted = true;

    const initApp = async () => {
      try {
        // Fallback timeout para forzar la navegación si Supabase tarda mucho
        const timeoutId = setTimeout(() => {
          if (mounted) router.replace('/(tabs)');
        }, 5000);

        await initialize();

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          const user = session.user;
          setUser({
            id: user.id,
            nombre: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
            email: user.email || '',
          });
        }

        clearTimeout(timeoutId);
        if (mounted) router.replace('/(tabs)');
        
      } catch (error) {
        console.error('Initialization error:', error);
        if (mounted) router.replace('/(tabs)');
      }
    };

    initApp();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.splash}>
      <Text style={styles.logo}>🏪</Text>
      <Text style={styles.appName}>ZocaloTrade</Text>
      <Text style={styles.tagline}>Cargando marketplace...</Text>
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
