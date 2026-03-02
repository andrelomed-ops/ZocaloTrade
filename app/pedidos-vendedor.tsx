import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useStore, Pedido } from '../src/store/useStore';
import { router } from 'expo-router';
import { useState } from 'react';

const STATUS_COLORS: any = {
  pendiente: '#FFA500',
  preparando: '#3498db',
  listo: '#9b59b6',
  en_camino: '#e67e22',
  entregado: '#27ae60',
  cancelado: '#e74c3c',
};

export default function PedidosVendedorScreen() {
  const { pedidos, updatePedido, rol } = useStore();
  const [filtro, setFiltro] = useState<'todos' | 'pendiente' | 'preparando' | 'listo'>('todos');

  const misPedidos = pedidos.filter(p => p.tiendaId === 'mi_tienda');

  const pedidosFiltrados = filtro === 'todos' 
    ? misPedidos 
    : misPedidos.filter(p => p.status === filtro);

  const getStats = () => ({
    total: misPedidos.length,
    pendiente: misPedidos.filter(p => p.status === 'pendiente').length,
    preparando: misPedidos.filter(p => p.status === 'preparando').length,
    listo: misPedidos.filter(p => p.status === 'listo').length,
    entregado: misPedidos.filter(p => p.status === 'entregado').length,
  });

  const stats = getStats();

  const cambiarStatus = (pedido: Pedido, nuevoStatus: Pedido['status']) => {
    Alert.alert(
      'Cambiar Estado',
      `¿Cambiar el estado a "${nuevoStatus}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => updatePedido(pedido.id, { status: nuevoStatus }) },
      ]
    );
  };

  const getNextStatus = (current: string): Pedido['status'] | null => {
    switch (current) {
      case 'pendiente': return 'preparando';
      case 'preparando': return 'listo';
      case 'listo': return 'en_camino';
      case 'en_camino': return 'entregado';
      default: return null;
    }
  };

  const renderPedido = ({ item }: { item: Pedido }) => {
    const nextStatus = getNextStatus(item.status);
    
    return (
      <View style={styles.pedidoCard}>
        <View style={styles.pedidoHeader}>
          <Text style={styles.pedidoId}>Pedido #{item.id.slice(-6)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.pedidoFecha}>
          {new Date(item.createdAt).toLocaleString('es-MX')}
        </Text>

        <View style={styles.productosList}>
          {item.productos.map((p, i) => (
            <Text key={i} style={styles.productoItem}>
              • {p.producto.nombre} x{p.cantidad}
            </Text>
          ))}
        </View>

        <View style={styles.pedidoFooter}>
          <View>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${item.total.toFixed(2)}</Text>
            <Text style={styles.comision}>Comisión: ${item.comision.toFixed(2)}</Text>
          </View>
          {nextStatus && item.status !== 'entregado' && item.status !== 'cancelado' && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: STATUS_COLORS[nextStatus] }]}
              onPress={() => cambiarStatus(item, nextStatus)}
            >
              <Text style={styles.actionBtnText}>
                {nextStatus === 'preparando' ? 'Iniciar' : 
                 nextStatus === 'listo' ? 'Marcar Listo' : 
                 nextStatus === 'en_camino' ? 'Enviando' : 'Entregar'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {item.status === 'pendiente' && (
          <TouchableOpacity 
            style={styles.cancelBtn}
            onPress={() => cambiarStatus(item, 'cancelado')}
          >
            <Text style={styles.cancelBtnText}>Cancelar Pedido</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { borderLeftWidth: 1, borderColor: '#eee' }]}>
          <Text style={[styles.statValue, { color: STATUS_COLORS.pendiente }]}>{stats.pendiente}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={[styles.statCard, { borderLeftWidth: 1, borderColor: '#eee' }]}>
          <Text style={[styles.statValue, { color: STATUS_COLORS.entregado }]}>{stats.entregado}</Text>
          <Text style={styles.statLabel}>Entregados</Text>
        </View>
      </View>

      <View style={styles.filtrosContainer}>
        {(['todos', 'pendiente', 'preparando', 'listo'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filtroBtn, filtro === f && styles.filtroActivo]}
            onPress={() => setFiltro(f)}
          >
            <Text style={[styles.filtroText, filtro === f && styles.filtroTextActivo]}>
              {f === 'todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={pedidosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderPedido}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No hay pedidos</Text>
            <Text style={styles.emptyText}>
              {filtro === 'todos' 
                ? 'Los pedidos de tus productos aparecerán aquí'
                : 'No hay pedidos en este estado'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  statsContainer: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, elevation: 2 },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  statLabel: { color: '#666', fontSize: 12, marginTop: 4 },
  filtrosContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff' },
  filtroBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 20, marginHorizontal: 3 },
  filtroActivo: { backgroundColor: '#FF6B35' },
  filtroText: { color: '#666', fontWeight: '600', fontSize: 13 },
  filtroTextActivo: { color: '#fff' },
  list: { padding: 15 },
  pedidoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  pedidoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pedidoId: { fontSize: 16, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  pedidoFecha: { color: '#666', fontSize: 12, marginTop: 5 },
  productosList: { marginTop: 10, padding: 10, backgroundColor: '#f8f8f8', borderRadius: 8 },
  productoItem: { color: '#333', fontSize: 14 },
  pedidoFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderColor: '#eee' },
  totalLabel: { color: '#666', fontSize: 12 },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#FF6B35' },
  comision: { color: '#999', fontSize: 11 },
  actionBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  actionBtnText: { color: '#fff', fontWeight: 'bold' },
  cancelBtn: { marginTop: 10, paddingVertical: 8, alignItems: 'center' },
  cancelBtnText: { color: '#ff4444', fontSize: 13 },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 60 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 15 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 10, paddingHorizontal: 30 },
});
