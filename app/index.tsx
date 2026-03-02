import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Auto-navigate to tabs after 2 seconds
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 2000);
  }, []);

  const handleGetStarted = () => {
    router.replace('/(tabs)');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  if (!isReady) {
    return (
      <View style={styles.splash}>
        <Text style={styles.logo}>🏪</Text>
        <Text style={styles.appName}>ZocaloTrade</Text>
        <Text style={styles.tagline}>Tu marketplace del Zócalo</Text>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.welcome}>
      <View style={styles.content}>
        <Text style={styles.welcomeLogo}>🏪</Text>
        <Text style={styles.welcomeTitle}>Bienvenido a</Text>
        <Text style={styles.welcomeAppName}>ZocaloTrade</Text>
        <Text style={styles.welcomeSubtitle}>
          Descubre los mejores productos y artesanías del Zócalo de Ciudad de México
        </Text>
        
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🛍️</Text>
            <Text style={styles.featureText}>Productos locales auténticos</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🚚</Text>
            <Text style={styles.featureText}>Entrega rápida en el centro</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureText}>Mejor precio garantizado</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.getStartedBtn} onPress={handleGetStarted}>
          <Text style={styles.getStartedText}>Comenzar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? Iniciar sesión</Text>
        </TouchableOpacity>
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
