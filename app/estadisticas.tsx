import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../src/store/useStore';
import { router } from 'expo-router';
import { Skeleton } from '../src/components/Skeleton';

export default function EstadisticasVendedorScreen() {
  const { pedidos, user, colors, initialize, loadPedidos, initialized } = useStore();
  const [periodo, setPeriodo] = useState('semana');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await initialize();
    if (user?.id) await loadPedidos(user.id);
    setRefreshing(false);
  }, [user, initialize, loadPedidos]);

  useEffect(() => {
    if (user?.id) {
      loadPedidos(user.id).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const ventas = (pedidos || []).filter(p => p.status === 'entregado');
  const totalIngresos = ventas.reduce((sum, v) => sum + (v.total || 0), 0);
  const comisionTotal = totalIngresos * 0.1;
  const gananciaNeta = totalIngresos - comisionTotal;
  const totalPedidos = (pedidos || []).length;

  if (loading || !initialized) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, padding: 20 }]}>
        <Skeleton width="100%" height={100} style={{ marginTop: 40 }} />
        <View style={styles.statsGrid}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} width="48%" height={120} style={{ margin: '1%' }} />)}
        </View>
        <Skeleton width="100%" height={200} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Resumen de Negocio</Text>
        <Text style={{ color: '#fff', opacity: 0.8 }}>Tu actividad comercial en tiempo real</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>${totalIngresos.toFixed(0)}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Ventas Brutas</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={styles.statIcon}>📈</Text>
          <Text style={[styles.statValue, { color: '#27ae60' }]}>${gananciaNeta.toFixed(0)}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Mi Ganancia</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={styles.statIcon}>📦</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{totalPedidos}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Pedidos</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={styles.statIcon}>⭐</Text>
          <Text style={[styles.statValue, { color: '#f1c40f' }]}>5.0</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Rating</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>📋 Últimos Movimientos</Text>
        {(pedidos || []).slice(0, 10).map((pedido) => (
          <View key={pedido.id} style={[styles.ventaItem, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.ventaProducto, { color: colors.text }]}>Pedido #{pedido.id.slice(0, 8)}</Text>
              <Text style={[styles.ventaDetalles, { color: colors.subtext }]}>
                {new Date(pedido.created_at || pedido.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.ventaMonto, { color: colors.primary }]}>${pedido.total}</Text>
              <View style={[styles.statusBadge, { backgroundColor: pedido.status === 'entregado' ? '#27ae60' : '#f39c12' }]}>
                <Text style={styles.statusText}>{pedido.status}</Text>
              </View>
            </View>
          </View>
        ))}
        {(pedidos || []).length === 0 && (
          <Text style={{ color: colors.subtext, textAlign: 'center', padding: 20 }}>Sin movimientos registrados.</Text>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.btn, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/mis-productos')}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Gestionar Productos</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25, paddingTop: 50 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10 },
  statCard: { width: '48%', margin: '1%', padding: 20, borderRadius: 12, alignItems: 'center', elevation: 2 },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 11, marginTop: 4 },
  section: { margin: 15, padding: 15, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  ventaItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  ventaProducto: { fontSize: 14, fontWeight: 'bold' },
  ventaDetalles: { fontSize: 11, marginTop: 2 },
  ventaMonto: { fontSize: 16, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginTop: 4 },
  statusText: { color: '#fff', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },
  btn: { margin: 15, padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 40 },
});
