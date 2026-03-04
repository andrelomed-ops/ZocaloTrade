import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '../src/services/supabase';
import { useStore } from '../src/store/useStore';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { setUser, user } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const email = session.user.email || '';
        const nombre = email.split('@')[0];
        
        setUser({
          id: session.user.id,
          nombre: nombre,
          email: email,
        });
        router.replace('/(tabs)');
      }
    } catch (e) {
      console.log('Session check error:', e);
    }
  }

  async function upsertProfile(userId: string, userEmail: string, userNombre: string, avatarUrl?: string) {
    // Skip profile upsert for now - can be added later
    console.log('Would create profile:', userId, userEmail, userNombre);
  }

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

        if (data.user) {
          let userNombre = email.split('@')[0];
          
          try {
            const { data: perfil } = await supabase
              .from('perfiles')
              .select('nombre')
              .eq('id', data.user.id)
              .maybeSingle();

            if (perfil?.nombre) {
              userNombre = perfil.nombre;
            } else {
              await upsertProfile(data.user.id, email, userNombre);
            }
          } catch (profileError) {
            console.log('Profile error (ignoring):', profileError);
            userNombre = email.split('@')[0];
          }

          setUser({
            id: data.user.id,
            nombre: userNombre,
            email: data.user.email,
          });
          Alert.alert('¡Bienvenido!', 'Has iniciado sesión correctamente');
        }
      } else {
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

        if (data.user) {
          await upsertProfile(data.user.id, email, nombre);

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
      
      const redirectUrl = Linking.createURL('auth/callback');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });
      
      if (error) throw error;
      
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );
        
        if (result.type === 'success') {
          const url = result.url;
          const urlObj = new URL(url);
          const hashParams = new URLSearchParams(urlObj.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (sessionError) {
              Alert.alert('Error', sessionError.message);
              return;
            }

            if (sessionData?.session?.user) {
              const user = sessionData.user;
              const userEmail = user.email || '';
              const userNombre = user.user_metadata?.name || userEmail.split('@')[0];
              const avatarUrl = user.user_metadata?.avatar_url;

              await upsertProfile(user.id, userEmail, userNombre, avatarUrl);

              setUser({
                id: user.id,
                nombre: userNombre,
                email: userEmail,
              });
              
              router.replace('/(tabs)');
            }
          }
        }
      }
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo iniciar sesión con Google: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      
      const redirectUrl = Linking.createURL('auth/callback');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });
      
      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );
        
        if (result.type === 'success') {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const user = session.user;
            const userEmail = user.email || '';
            const userNombre = user.user_metadata?.name || userEmail.split('@')[0];

            await upsertProfile(user.id, userEmail, userNombre);

            setUser({
              id: user.id,
              nombre: userNombre,
              email: userEmail,
            });
            
            router.replace('/(tabs)');
          }
        }
      }
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo iniciar sesión con Facebook: ' + error.message);
    } finally {
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
        redirectTo: Linking.createURL('reset-password'),
      });
      
      if (error) throw error;
      
      Alert.alert('Correo enviado', 'Revisa tu bandeja de entrada para restablecer tu contraseña');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !email && !password) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

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
            disabled={loading}
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
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 10, fontSize: 16 },
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
