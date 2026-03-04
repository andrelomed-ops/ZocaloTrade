import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '../src/services/supabase';
import { useStore } from '../src/store/useStore';

export default function LoginScreen() {
  const { setUser, user } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!email || !password) {
      const msg = 'Por favor completa todos los campos';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Error', msg);
      return;
    }

    if (!isLogin && !nombre) {
      const msg = 'Por favor ingresa tu nombre';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Error', msg);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Correo o contraseña incorrectos');
          }
          throw error;
        }

        if (data?.session?.user) {
          const user = data.session.user;
          setUser({
            id: user.id,
            nombre: user.user_metadata?.full_name || email.split('@')[0],
            email: user.email || email,
          });
          router.replace('/(tabs)');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: nombre,
            }
          }
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            throw new Error('Este correo ya está registrado');
          }
          throw error;
        }

        if (data?.user) {
          setUser({
            id: data.user.id,
            nombre: nombre || email.split('@')[0],
            email: data.user.email || email,
          });
          
          if (Platform.OS === 'web') {
            alert('¡Cuenta creada con éxito!');
          }
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      const msg = error.message || 'Ocurrió un error';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      if (Platform.OS === 'web') alert('Ingresa tu correo'); else Alert.alert('Error', 'Ingresa tu correo');
      return;
    }
    try {
      setLoading(true);
      await supabase.auth.resetPasswordForEmail(email);
      if (Platform.OS === 'web') alert('Revisa tu correo'); else Alert.alert('Éxito', 'Revisa tu correo');
    } catch (error: any) {
      if (Platform.OS === 'web') alert('Error al enviar'); else Alert.alert('Error', 'Error al enviar');
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
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.terms}>
            Al continuar, aceptas nuestros Términos y Política de Privacidad
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
  formContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 25, elevation: 5 },
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
  submitBtn: { backgroundColor: '#FF6B35', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  submitBtnDisabled: { backgroundColor: '#ccc' },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  terms: { color: '#999', fontSize: 11, textAlign: 'center', marginTop: 20, lineHeight: 18 },
});
