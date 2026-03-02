import { View, Text, TouchableOpacity, StyleSheet, Switch, Alert, ScrollView } from 'react-native';
import { useStore } from '../../src/store/useStore';
import { router } from 'expo-router';
import { useState } from 'react';
import { supabase } from '../../src/services/supabase';

export default function PerfilScreen() {
  const { user, rol, setRol, pedidos, initialized, initialize, setUser } = useStore();
  const [isVendedor, setIsVendedor] = useState(rol === 'vendedor');

  const toggleRol = (value: boolean) => {
    setIsVendedor(value);
    setRol(value ? 'vendedor' : 'cliente');
    Alert.alert(
      value ? '¡Ahora eres vendedor!' : '¡Ahora eres cliente!',
      value 
        ? 'Puedes agregar productos al marketplace'
        : 'Solo puedes comprar productos'
    );
  };

  const pedidosCount = pedidos.length;
  const totalGastado = pedidos.reduce((sum, p) => sum + p.total, 0);

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            setUser(null);
            router.replace('/');
          }
        },
      ]
    );
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Buenos días';
    if (hour < 18) return '☀️ Buenas tardes';
    return '🌙 Buenas noches';
  };

  // Si no hay usuario logueado, mostrar botón de iniciar sesión
  if (!user) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.nombre}>Usuario Invitado</Text>
          <Text style={styles.email}>Inicia sesión para ver tu perfil</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.loginRequiredBtn}
            onPress={handleLogin}
          >
            <Text style={styles.loginRequiredBtnText}>🔐 Iniciar Sesión</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.loginRequiredBtn, { backgroundColor: '#FF6B35', marginTop: 10 }]}
            onPress={handleLogin}
          >
            <Text style={[styles.loginRequiredBtnText, { color: '#fff' }]}>📝 Regístrate</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>ZocaloTrade v1.0.0</Text>
          <Text style={styles.footerText}>Comisión: 10% por venta</Text>
          <Text style={styles.footerText}>© 2024 ZocaloTrade</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.nombre}>{user?.nombre || 'Usuario ZocaloTrade'}</Text>
        <Text style={styles.email}>{user?.email || 'usuario@zocalotrade.com'}</Text>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        
        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Text style={styles.logoutBtnText}>🚪 Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.stat} onPress={() => router.push('/pedidos')}>
          <Text style={styles.statValue}>{pedidosCount}</Text>
          <Text style={styles.statLabel}>Pedidos</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>${totalGastado.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Total Gastado</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>⭐ 5.0</Text>
          <Text style={styles.statLabel}>Calificación</Text>
        </View>
      </View>

      {isVendedor && (
        <View>
          <TouchableOpacity 
            style={[styles.vendedorBanner, { backgroundColor: '#27ae60' }]}
            onPress={() => router.push('/mis-productos')}
          >
            <View>
              <Text style={styles.vendedorBannerTitle}>🏪 Mi Tienda</Text>
              <Text style={styles.vendedorBannerText}>Gestiona tus productos</Text>
            </View>
            <Text style={styles.vendedorBannerArrow}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.vendedorBanner, { backgroundColor: '#3498db', marginTop: 10, marginHorizontal: 15 }]}
            onPress={() => router.push('/pedidos-vendedor')}
          >
            <View>
              <Text style={styles.vendedorBannerTitle}>📦 Pedidos</Text>
              <Text style={styles.vendedorBannerText}>Ver pedidos de tus productos</Text>
            </View>
            <Text style={styles.vendedorBannerArrow}>→</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Modo Vendedor</Text>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Quiero vender en ZocaloTrade</Text>
            <Text style={styles.switchDesc}>Activa para agregar productos</Text>
          </View>
          <Switch
            value={isVendedor}
            onValueChange={toggleRol}
            trackColor={{ false: '#ddd', true: '#FF6B35' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mis Compras</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/pedidos')}>
          <Text style={styles.menuIcon}>📦</Text>
          <Text style={styles.menuText}>Mis Pedidos</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/direcciones')}>
          <Text style={styles.menuIcon}>📍</Text>
          <Text style={styles.menuText}>Mis Direcciones</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/metodos-pago')}>
          <Text style={styles.menuIcon}>💳</Text>
          <Text style={styles.menuText}>Métodos de Pago</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuenta</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>🔔</Text>
          <Text style={styles.menuText}>Notificaciones</Text>
          <Text style={styles.menuArrow} onPress={() => router.push('/notificaciones')}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>Configuración</Text>
          <Text style={styles.menuArrow} onPress={() => router.push('/configuracion')}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/chat-soporte')}>
          <Text style={styles.menuIcon}>❓</Text>
          <Text style={styles.menuText}>Ayuda y Soporte</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acerca de</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📖</Text>
          <Text style={styles.menuText}>Términos y Condiciones</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>🔒</Text>
          <Text style={styles.menuText}>Política de Privacidad</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>ZocaloTrade v1.0.0</Text>
        <Text style={styles.footerText}>Comisión: 10% por venta</Text>
        <Text style={styles.footerText}>© 2024 ZocaloTrade</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  header: { backgroundColor: '#FF6B35', padding: 30, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 40 },
  nombre: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginTop: 15 },
  email: { fontSize: 14, color: '#ffffff', opacity: 0.9, marginTop: 5 },
  greeting: { fontSize: 14, color: '#ffffff', opacity: 0.8, marginTop: 10 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginTop: 10 },
  logoutBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  loginRequiredBtn: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#FF6B35', padding: 15, borderRadius: 12, alignItems: 'center' },
  loginRequiredBtnText: { color: '#FF6B35', fontSize: 16, fontWeight: 'bold' },
  statsContainer: { flexDirection: 'row', backgroundColor: '#ffffff', marginTop: -20, marginHorizontal: 15, borderRadius: 12, padding: 20, elevation: 3 },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: '#eee' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#FF6B35' },
  statLabel: { color: '#666', marginTop: 5, fontSize: 12 },
  vendedorBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#27ae60', margin: 15, padding: 20, borderRadius: 12 },
  vendedorBannerTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  vendedorBannerText: { color: '#ffffff', opacity: 0.9, marginTop: 4 },
  vendedorBannerArrow: { fontSize: 24, color: '#ffffff' },
  section: { backgroundColor: '#ffffff', marginTop: 15, padding: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { fontSize: 16, color: '#333' },
  switchDesc: { color: '#666', fontSize: 12, marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#eee' },
  menuIcon: { fontSize: 20, marginRight: 15, width: 25, textAlign: 'center' },
  menuText: { flex: 1, fontSize: 16, color: '#333' },
  menuArrow: { color: '#999', fontSize: 18 },
  footer: { alignItems: 'center', padding: 20 },
  footerText: { color: '#999', fontSize: 12, marginTop: 4 },
});
