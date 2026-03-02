import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '../src/services/supabase';
import { useStore } from '../src/store/useStore';

export default function LoginScreen() {
  const { setUser } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);

  // Verificar sesión al cargar la página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Intentar recuperar la sesión
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session) {
          await handleSession(session);
        } else if (error) {
          console.log('No session found');
        }
        
        // También escuchar cambios en auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session) {
            await handleSession(session);
          }
        });
        
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    
    checkAuth();
  }, []);

  const handleSession = async (session: any) => {
    try {
      // Obtener o crear perfil
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      // Si no existe perfil, crearlo
      if (!perfil && session.user.email) {
        const nombre = session.user.user_metadata?.full_name || 
                      session.user.user_metadata?.name || 
                      session.user.email.split('@')[0];
        
        await supabase.from('perfiles').insert({
          id: session.user.id,
          nombre: nombre,
          email: session.user.email,
        });
      }
      
      setUser({
        id: session.user.id,
        nombre: perfil?.nombre || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuario',
        email: session.user.email,
      });
      
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error handling session:', error);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!isLogin && !nombre) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Iniciar sesión
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Correo o contraseña incorrectos');
          }
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Por favor confirma tu correo electrónico');
          }
          throw error;
        }

        // Obtener perfil
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const userData = {
          id: data.user.id,
          nombre: perfil?.nombre || email.split('@')[0],
          email: data.user.email,
        };
        
        setUser(userData);

        Alert.alert('¡Bienvenido!', 'Has iniciado sesión correctamente');
      } else {
        // Registrarse
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            throw new Error('Este correo ya está registrado');
          }
          if (error.message.includes('Password')) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
          }
          throw error;
        }

        // Crear perfil
        if (data.user) {
          await supabase.from('perfiles').insert({
            id: data.user.id,
            nombre,
            email,
          });

          setUser({
            id: data.user.id,
            nombre,
            email,
          });
        }

        Alert.alert('¡Cuenta creada!', 'Revisa tu correo para confirmar tu cuenta');
      }

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://zocalotrade.vercel.app/',
        },
      });
      
      if (error) throw error;
      
      // El redirect ocurre automáticamente
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo iniciar sesión con Google: ' + error.message);
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: 'https://zocalotrade.vercel.app/',
        },
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo iniciar sesión con Facebook: ' + error.message);
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://zocalotrade.vercel.app/',
      });
      
      if (error) throw error;
      
      Alert.alert('Correo enviado', 'Revisa tu bandeja de entrada para restablecer tu contraseña');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🏪</Text>
          <Text style={styles.appName}>ZocaloTrade</Text>
          <Text style={styles.tagline}>Tu marketplace del Zócalo</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, isLogin && styles.tabActive]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Iniciar Sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, !isLogin && styles.tabActive]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Registrarse</Text>
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Juan Pérez"
                value={nombre}
                onChangeText={setNombre}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {isLogin && (
            <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.submitBtn}
            onPress={handleSubmit}
          >
            <Text style={styles.submitBtnText}>
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o continúa con</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleLogin}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={handleFacebookLogin}>
              <Text style={styles.socialIcon}>f</Text>
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            {isLogin 
              ? 'Al iniciar sesión, aceptas nuestros Términos y Política de Privacidad'
              : 'Al registrarte, aceptas nuestros Términos y Política de Privacidad'
            }
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF6B35' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logo: { fontSize: 80 },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 10 },
  tagline: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 5 },
  formContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 25 },
  tabContainer: { flexDirection: 'row', marginBottom: 25, backgroundColor: '#f0f0f0', borderRadius: 25, padding: 4 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 20 },
  tabActive: { backgroundColor: '#FF6B35' },
  tabText: { fontWeight: '600', color: '#666' },
  tabTextActive: { color: '#fff' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 15, fontSize: 16 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotPasswordText: { color: '#FF6B35', fontWeight: '600' },
  submitBtn: { backgroundColor: '#FF6B35', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  submitBtnDisabled: { backgroundColor: '#ccc' },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#eee' },
  dividerText: { color: '#999', marginHorizontal: 15, fontSize: 12 },
  socialContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  socialBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, marginHorizontal: 5 },
  socialIcon: { fontSize: 20, fontWeight: 'bold', marginRight: 8 },
  socialText: { fontWeight: '600' },
  terms: { color: '#999', fontSize: 11, textAlign: 'center', lineHeight: 18 },
});
