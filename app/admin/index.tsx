import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useStore } from '../../src/store/useStore';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '../../src/services/supabase';

export default function AdminPanelScreen() {
  const { colors, isAdmin, user, productos, tiendas, pedidos } = useStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    usuarios: 0,
    tiendas: 0,
    ventasTotales: 0,
    comisionAcumulada: 0
  });

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/');
      return;
    }

    const fetchGlobalStats = async () => {
      try {
        const { count: userCount } = await supabase.from('perfiles').select('*', { count: 'exact', head: true });
        const { count: shopCount } = await supabase.from('tiendas').select('*', { count: 'exact', head: true });
        
        const totalVentas = (pedidos || []).reduce((sum, p) => sum + (p.total || 0), 0);
        
        setStats({
          usuarios: userCount || 0,
          tiendas: shopCount || 0,
          ventasTotales: totalVentas,
          comisionAcumulada: totalVentas * 0.1
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalStats();
  }, [isAdmin]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>Panel de Control Maestro</Text>
        <Text style={styles.subtitle}>SuperAdmin: {user?.email}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={styles.statIcon}>👥</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.usuarios}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Usuarios</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={styles.statIcon}>🏪</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.tiendas}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Tiendas</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={[styles.statValue, { color: '#27ae60' }]}>${stats.ventasTotales}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Volumen Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={styles.statIcon}>🛡️</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>${stats.comisionAcumulada}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Tus Ganancias</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🛠️ Acciones Rápidas</Text>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionText}>Validar Nuevos Vendedores</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionText}>Gestionar Productos Reportados</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionText}>Configuración de Comisiones</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.backBtn, { backgroundColor: colors.primary }]}
        onPress={() => router.back()}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Salir del Panel Maestro</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 30, paddingTop: 50 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 12, color: '#fff', opacity: 0.8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10 },
  statCard: { width: '48%', margin: '1%', padding: 20, borderRadius: 12, alignItems: 'center', elevation: 2 },
  statIcon: { fontSize: 24, marginBottom: 5 },
  statValue: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 11 },
  section: { margin: 15, padding: 15, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  actionBtn: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  actionText: { color: '#3498db', fontWeight: '600' },
  backBtn: { margin: 20, padding: 15, borderRadius: 12, alignItems: 'center' },
});
