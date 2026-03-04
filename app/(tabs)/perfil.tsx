import { View, Text, TouchableOpacity, StyleSheet, Switch, Alert, ScrollView, Platform } from 'react-native';
import { useStore } from '../../src/store/useStore';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '../../src/services/supabase';

export default function PerfilScreen() {
  const { user, rol, setRol, pedidos, setUser, colors, darkMode, setDarkMode } = useStore();
  const [isVendedor, setIsVendedor] = useState(rol === 'vendedor');

  const toggleRol = (value: boolean) => {
    setIsVendedor(value);
    setRol(value ? 'vendedor' : 'cliente');
    if (Platform.OS === 'web') alert(value ? '¡Ahora eres vendedor!' : '¡Ahora eres cliente!');
    else Alert.alert(value ? '¡Ahora eres vendedor!' : '¡Ahora eres cliente!');
  };

  const pedidosCount = (pedidos || []).length;
  const totalGastado = (pedidos || []).reduce((sum, p) => sum + (p.total || 0), 0);

  const handleLogout = async () => {
    const confirmed = Platform.OS === 'web' 
      ? window.confirm('¿Estás seguro?') 
      : await new Promise(resolve => {
          Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
            { text: 'No', onPress: () => resolve(false) },
            { text: 'Sí', onPress: () => resolve(true) }
          ]);
        });

    if (confirmed) {
      await supabase.auth.signOut();
      setUser(null);
      router.replace('/login');
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.avatarText, { fontSize: 80 }]}>👤</Text>
        <Text style={[styles.nombre, { color: colors.text }]}>Invitado</Text>
        <TouchableOpacity 
          style={[styles.loginRequiredBtn, { backgroundColor: colors.primary, marginTop: 20 }]}
          onPress={() => router.push('/login')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.fotoPerfil ? '🖼️' : '👤'}</Text>
        </View>
        <Text style={styles.nombre}>{user.nombre}</Text>
        <Text style={styles.email}>{user.email}</Text>
        
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{pedidosCount}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Pedidos</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.primary }]}>${totalGastado}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Gastado</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Configuración</Text>
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: colors.text }]}>Modo Vendedor</Text>
          <Switch value={isVendedor} onValueChange={toggleRol} trackColor={{ true: colors.primary }} />
        </View>
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: colors.text }]}>Modo Oscuro</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: colors.primary }} />
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.menuItem, { backgroundColor: colors.card, marginTop: 10, padding: 15 }]}
        onPress={() => router.push('/configuracion')}
      >
        <Text style={[styles.menuText, { color: colors.text }]}>⚙️ Ajustes Avanzados</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 40, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 40 },
  nombre: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 15 },
  email: { fontSize: 14, color: '#fff', opacity: 0.8 },
  logoutBtn: { marginTop: 20, backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 20 },
  logoutBtnText: { color: '#fff', fontSize: 12 },
  statsContainer: { flexDirection: 'row', margin: 15, borderRadius: 12, padding: 20, elevation: 2, marginTop: -20 },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: '100%' },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 4 },
  section: { margin: 15, borderRadius: 12, padding: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  switchLabel: { fontSize: 15 },
  menuItem: { marginHorizontal: 15, borderRadius: 12 },
  menuText: { fontSize: 16 },
  loginRequiredBtn: { padding: 15, borderRadius: 12, width: 200, alignItems: 'center' },
});
