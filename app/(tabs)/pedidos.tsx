import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useStore } from '../../src/store/useStore';
import { router } from 'expo-router';

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
  const { pedidos } = useStore();

  const sortedPedidos = [...pedidos].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (pedidos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyText}>No tienes pedidos</Text>
        <Text style={styles.emptySubtext}>Haz tu primer pedido</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sortedPedidos}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.pedidoCard} onPress={() => router.push(`/pedido/${item.id}`)}>
          <View style={styles.pedidoHeader}>
            <Text style={styles.pedidoId}>Pedido #{item.id.slice(-6)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
              <Text style={styles.statusText}>{STATUS_LABELS[item.status]}</Text>
            </View>
          </View>

          <Text style={styles.pedidoFecha}>
            {new Date(item.createdAt).toLocaleDateString('es-MX', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            })}
          </Text>

          <View style={styles.productosPreview}>
            {item.productos.slice(0, 2).map((p, i) => (
              <Text key={i} style={styles.productoText} numberOfLines={1}>
                • {p.producto.nombre} x{p.cantidad}
              </Text>
            ))}
            {item.productos.length > 2 && (
              <Text style={styles.masText}>+{item.productos.length - 2} más</Text>
            )}
          </View>

          <View style={styles.pedidoFooter}>
            <View>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ${((item.subtotal || item.total) + (item.comision || 0)).toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.seguimientoBtn}
              onPress={() => router.push(`/seguimiento?id=${item.id}`)}
            >
              <Text style={styles.seguimientoBtnText}>📍 Rastrear</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 15 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  emptyIcon: { fontSize: 80 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 20 },
  emptySubtext: { fontSize: 16, color: '#666', marginTop: 5 },
  pedidoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  pedidoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pedidoId: { fontSize: 16, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  pedidoFecha: { color: '#666', fontSize: 12, marginTop: 5 },
  productosPreview: { marginTop: 10 },
  productoText: { color: '#333', fontSize: 14 },
  masText: { color: '#999', fontSize: 12, marginTop: 2 },
  pedidoFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderColor: '#eee' },
  totalLabel: { fontSize: 14, color: '#666' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#FF6B35' },
  seguimientoBtn: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  seguimientoBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
