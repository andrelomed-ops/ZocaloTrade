import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useStore } from '../../src/store/useStore';
import { useLocalSearchParams } from 'expo-router';

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

export default function PedidoDetalleScreen() {
  const { id } = useLocalSearchParams();
  const { pedidos } = useStore();
  
  const pedido = pedidos.find((p) => p.id === id);

  if (!pedido) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Pedido no encontrado</Text>
      </View>
    );
  }

  const pasos = ['pendiente', 'preparando', 'listo', 'en_camino', 'entregado'];
  const pasoActual = pasos.indexOf(pedido.status);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pedidoId}>Pedido #{pedido.id.slice(-6)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[pedido.status] }]}>
          <Text style={styles.statusText}>{STATUS_LABELS[pedido.status]}</Text>
        </View>
      </View>

      <View style={styles.trackingSection}>
        <Text style={styles.sectionTitle}>Seguimiento</Text>
        {pasos.map((paso, index) => (
          <View key={paso} style={styles.trackingStep}>
            <View style={[
              styles.stepCircle,
              index <= pasoActual && styles.stepActive,
              index < pasoActual && styles.stepCompleted
            ]}>
              {index < pasoActual ? (
                <Text style={styles.stepCheck}>✓</Text>
              ) : (
                <Text style={styles.stepNumber}>{index + 1}</Text>
              )}
            </View>
            <Text style={[styles.stepLabel, index <= pasoActual && styles.stepLabelActive]}>
              {STATUS_LABELS[paso]}
            </Text>
            {index < pasos.length - 1 && (
              <View style={[styles.stepLine, index < pasoActual && styles.stepLineActive]} />
            )}
          </View>
        ))}
      </View>

      <View style={styles.productosSection}>
        <Text style={styles.sectionTitle}>Productos</Text>
        {pedido.productos.map((item, index) => (
          <View key={index} style={styles.productoCard}>
            <Image source={{ uri: item.producto.foto }} style={styles.productoImage} />
            <View style={styles.productoInfo}>
              <Text style={styles.productoNombre}>{item.producto.nombre}</Text>
              <Text style={styles.productoCantidad}>Cantidad: {item.cantidad}</Text>
              <Text style={styles.productoPrecio}>${(item.producto.precio * item.cantidad).toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.direccionSection}>
        <Text style={styles.sectionTitle}>Dirección de Entrega</Text>
        <Text style={styles.direccionText}>📍 {pedido.direccionEntrega}</Text>
      </View>

      <View style={styles.resumenSection}>
        <Text style={styles.sectionTitle}>Resumen de Pago</Text>
        <View style={styles.resumenRow}>
          <Text>Subtotal</Text>
          <Text>${(pedido.total - pedido.comision).toFixed(2)}</Text>
        </View>
        <View style={styles.resumenRow}>
          <Text>Comisión (10%)</Text>
          <Text>${pedido.comision.toFixed(2)}</Text>
        </View>
        <View style={[styles.resumenRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${pedido.total.toFixed(2)}</Text>
        </View>
      </View>

      {pedido.status !== 'entregado' && pedido.status !== 'cancelado' && (
        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Cancelar Pedido</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { fontSize: 18, color: '#666' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  pedidoId: { fontSize: 20, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 15 },
  statusText: { color: '#fff', fontWeight: 'bold' },
  trackingSection: { backgroundColor: '#fff', margin: 15, padding: 20, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  trackingStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  stepCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  stepActive: { backgroundColor: '#FF6B35' },
  stepCompleted: { backgroundColor: '#27ae60' },
  stepCheck: { color: '#fff', fontWeight: 'bold' },
  stepNumber: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  stepLabel: { marginLeft: 10, color: '#999', flex: 1 },
  stepLabelActive: { color: '#333', fontWeight: '600' },
  stepLine: { position: 'absolute', left: 14, top: 35, width: 2, height: 20, backgroundColor: '#ddd' },
  stepLineActive: { backgroundColor: '#FF6B35' },
  productosSection: { backgroundColor: '#fff', marginHorizontal: 15, padding: 20, borderRadius: 12, marginBottom: 15 },
  productoCard: { flexDirection: 'row', marginBottom: 15 },
  productoImage: { width: 60, height: 60, borderRadius: 8 },
  productoInfo: { flex: 1, marginLeft: 15 },
  productoNombre: { fontWeight: 'bold' },
  productoCantidad: { color: '#666', fontSize: 12 },
  productoPrecio: { color: '#FF6B35', fontWeight: 'bold', marginTop: 5 },
  direccionSection: { backgroundColor: '#fff', marginHorizontal: 15, padding: 20, borderRadius: 12, marginBottom: 15 },
  direccionText: { fontSize: 16 },
  resumenSection: { backgroundColor: '#fff', marginHorizontal: 15, padding: 20, borderRadius: 12, marginBottom: 15 },
  resumenRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  totalRow: { borderTopWidth: 1, borderColor: '#eee', paddingTop: 10, marginTop: 10 },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#FF6B35' },
  cancelBtn: { backgroundColor: '#fff', margin: 15, padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ff4444' },
  cancelBtnText: { color: '#ff4444', fontWeight: 'bold' },
});
