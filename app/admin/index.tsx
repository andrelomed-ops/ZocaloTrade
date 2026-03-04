import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { useStore } from '../../src/store/useStore';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../src/services/supabase';

export default function AdminPanelScreen() {
  const { colors, isAdmin, user, initialize } = useStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [globalStats, setGlobalStats] = useState({
    usuarios: 0,
    tiendas: 0,
    productos: 0,
    pedidos: 0,
    ventasTotales: 0,
    comisiones: 0
  });

  const fetchGlobalData = async () => {
    try {
      const [u, t, p, ped] = await Promise.all([
        supabase.from('perfiles').select('*', { count: 'exact', head: true }),
        supabase.from('tiendas').select('*', { count: 'exact', head: true }),
        supabase.from('productos').select('*', { count: 'exact', head: true }),
        supabase.from('pedidos').select('total')
      ]);

      const totalVentas = (ped.data || []).reduce((sum, item) => sum + (item.total || 0), 0);

      setGlobalStats({
        usuarios: u.count || 0,
        tiendas: t.count || 0,
        productos: p.count || 0,
        pedidos: ped.data?.length || 0,
        ventasTotales: totalVentas,
        comisiones: totalVentas * 0.1
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/');
      return;
    }
    fetchGlobalData();
  }, [isAdmin]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGlobalData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>Panel Maestro Admin</Text>
        <Text style={styles.subtitle}>Control total de ZocaloTrade</Text>
      </View>

      <View style={styles.grid}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={styles.cardIcon}>👥</Text>
          <Text style={[styles.cardValue, { color: colors.text }]}>{globalStats.usuarios}</Text>
          <Text style={[styles.cardLabel, { color: colors.subtext }]}>Usuarios</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={styles.cardIcon}>🏪</Text>
          <Text style={[styles.cardValue, { color: colors.text }]}>{globalStats.tiendas}</Text>
          <Text style={[styles.cardLabel, { color: colors.subtext }]}>Tiendas</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={styles.cardIcon}>📦</Text>
          <Text style={[styles.cardValue, { color: colors.text }]}>{globalStats.productos}</Text>
          <Text style={[styles.cardLabel, { color: colors.subtext }]}>Productos</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={styles.cardIcon}>💰</Text>
          <Text style={[styles.cardValue, { color: '#27ae60' }]}>${globalStats.ventasTotales}</Text>
          <Text style={[styles.cardLabel, { color: colors.subtext }]}>Venta Bruta</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
          <Text style={styles.cardIcon}>🛡️</Text>
          <Text style={[styles.cardValue, { color: colors.primary }]}>${globalStats.comisiones}</Text>
          <Text style={[styles.cardLabel, { color: colors.subtext }]}>Comisiones (10%)</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Operaciones</Text>
        <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]}>
          <Text style={{ fontSize: 16, color: colors.text }}>Validar Vendedores</Text>
          <Text style={{ color: colors.primary }}>Pendientes: 0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]}>
          <Text style={{ fontSize: 16, color: colors.text }}>Resolver Disputas</Text>
          <Text style={{ color: colors.primary }}>Activas: 0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={{ fontSize: 16, color: colors.text }}>Configuración Global</Text>
          <Text style={{ color: colors.subtext }}>→</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.btn, { backgroundColor: colors.primary }]}
        onPress={() => router.back()}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cerrar Panel Maestro</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 30, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#fff', opacity: 0.8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10 },
  card: { width: '48%', margin: '1%', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 2 },
  cardIcon: { fontSize: 24, marginBottom: 5 },
  cardValue: { fontSize: 20, fontWeight: 'bold' },
  cardLabel: { fontSize: 11, marginTop: 4 },
  section: { margin: 15, padding: 15, borderRadius: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1 },
  btn: { margin: 15, padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 50 },
});
