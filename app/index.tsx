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
        // 1. Inicializar datos básicos
        await initialize();

        // 2. DETECCIÓN DE GOOGLE REDIRECT (CRÍTICO PARA WEB)
        if (Platform.OS === 'web' && window.location.hash.includes('access_token')) {
          // Si hay un token en la URL, nos quedamos en el Splash hasta que Supabase lo procese
          let attempts = 0;
          while (attempts < 10) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) break;
            await new Promise(resolve => setTimeout(resolve, 300));
            attempts++;
          }
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

        // 3. Solo navegamos cuando estemos seguros de tener (o no) la sesión
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
      <Text style={styles.tagline}>Verificando seguridad...</Text>
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
