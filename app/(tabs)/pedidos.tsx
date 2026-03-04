import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useStore } from '../../src/store/useStore';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';

const STATUS_COLORS: any = {
  pendiente: '#FFA500',
  preparando: '#3498db',
  listo: '#9b59b6',
  en_camino: '#e67e22',
  entregado: '#27ae60',
  cancelado: '#e74c3c',
};

const STATUS_LABELS: any = {
  pendiente: 'Pendiente',
  preparando: 'Preparando',
  listo: 'Listo',
  en_camino: 'En Camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export default function PedidosScreen() {
  const { pedidos, user, loadPedidos, colors } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user?.id) await loadPedidos(user.id);
    setRefreshing(false);
  }, [user, loadPedidos]);

  useEffect(() => {
    const init = async () => {
      if (user?.id) await loadPedidos(user.id);
      setLoading(false);
    };
    init();
  }, [user]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>Inicia sesión para ver tus pedidos</Text>
        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: colors.primary, marginTop: 20 }]}
          onPress={() => router.push('/login')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ir al Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.orderCard, { backgroundColor: colors.card }]}
            onPress={() => router.push(`/pedido/${item.id}`)}
          >
            <View style={styles.orderHeader}>
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>Pedido #{item.id.slice(0, 8)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || '#999' }]}>
                <Text style={styles.statusText}>{STATUS_LABELS[item.status]?.toUpperCase() || item.status.toUpperCase()}</Text>
              </View>
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <View style={styles.orderFooter}>
              <Text style={{ color: colors.subtext }}>{new Date(item.createdAt || item.created_at).toLocaleDateString()}</Text>
              <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 18 }}>${item.total}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 100 }}>
            <Text style={{ fontSize: 60 }}>📦</Text>
            <Text style={{ color: colors.subtext, marginTop: 10 }}>Aún no tienes pedidos</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  btn: { padding: 15, borderRadius: 10, width: 200, alignItems: 'center' },
  orderCard: { borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  divider: { height: 1, marginVertical: 12 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
