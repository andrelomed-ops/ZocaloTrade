import { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../src/services/supabase';
import { useStore } from '../src/store/useStore';

export default function AuthCallback() {
  const router = useRouter();
  const { setUser } = useStore();

  useEffect(() => {
    const handleCallback = async () => {
      // Esperar un momento para que Supabase procese el hash de la URL
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session?.user) {
        const user = session.user;
        const userEmail = user.email || '';
        const userNombre = user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split('@')[0];
        
        setUser({
          id: user.id,
          nombre: userNombre,
          email: userEmail,
        });
        
        router.replace('/(tabs)/perfil');
      } else {
        // Si no hay sesión, volver al login
        router.replace('/login');
      }
    };

    handleCallback();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FF6B35' }}>
      <ActivityIndicator color="#fff" size="large" />
      <Text style={{ color: '#fff', marginTop: 10, fontWeight: 'bold' }}>Sincronizando con Google...</Text>
    </View>
  );
}
