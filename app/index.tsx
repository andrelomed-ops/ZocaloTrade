import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../src/services/supabase';

export default function SplashScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Wait a small bit for splash screen feel
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1500);
        
      } catch (error) {
        router.replace('/(tabs)');
      }
    };

    checkAuthAndNavigate();
  }, []);

  return (
    <View style={styles.splash}>
      <Text style={styles.logo}>🏪</Text>
      <Text style={styles.appName}>ZocaloTrade</Text>
      <Text style={styles.tagline}>Tu marketplace del Zócalo</Text>
      <View style={styles.loading}>
        <ActivityIndicator color="#fff" size="large" />
        <Text style={styles.loadingText}>Cargando...</Text>
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
  logo: {
    fontSize: 100,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 10,
  },
  loading: {
    marginTop: 50,
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
  },
  welcome: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 30,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeLogo: {
    fontSize: 80,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    color: '#666',
  },
  welcomeAppName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginTop: 5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  features: {
    marginTop: 40,
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  buttons: {
    paddingBottom: 30,
  },
  getStartedBtn: {
    backgroundColor: '#FF6B35',
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  getStartedText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginBtn: {
    marginTop: 15,
    alignItems: 'center',
  },
  loginText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '600',
  },
});
