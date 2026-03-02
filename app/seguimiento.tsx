import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useStore, Pedido } from '../src/store/useStore';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ETAPAS = [
  { 
    key: 'pago_envio', 
    titulo: 'Pago de Envío', 
    descripcion: 'El envío ha sido pagado',
    icon: '💳',
    color: '#27ae60'
  },
  { 
    key: 'confirmado', 
    titulo: 'Pedido Confirmado', 
    descripcion: 'El vendedor ha aceptado tu pedido',
    icon: '✅',
    color: '#3498db'
  },
  { 
    key: 'preparando', 
    titulo: 'Preparando Pedido', 
    descripcion: 'El vendedor está preparando tu productos',
    icon: '📦',
    color: '#f39c12'
  },
  { 
    key: 'en_camino', 
    titulo: 'En Camino', 
    descripcion: 'El repartidor está en camino',
    icon: '🚚',
    color: '#9b59b6'
  },
  { 
    key: 'entregado', 
    titulo: 'Entregado', 
    descripcion: 'Pedido entregado exitosamente',
    icon: '🎉',
    color: '#27ae60'
  },
];

export default function SeguimientoPedidoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pedidos, user, updatePedido } = useStore();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const found = pedidos.find(p => p.id === id);
    if (found) setPedido(found);
  }, [id, pedidos]);

  if (!pedido) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Pedido no encontrado</Text>
      </View>
    );
  }

  const getCurrentEtapaIndex = () => {
    if (!pedido.etapas_seguimiento) return 0;
    const index = pedido.etapas_seguimiento.findIndex(e => !e.completado);
    return index === -1 ? ETAPAS.length - 1 : index;
  };

  const currentIndex = getCurrentEtapaIndex();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 Seguimiento del Pedido</Text>
        <Text style={styles.orderId}>Orden #{pedido.id.slice(-8)}</Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusIcon}>
          {ETAPAS[currentIndex]?.icon || '📦'}
        </Text>
        <Text style={styles.statusTitle}>
          {ETAPAS[currentIndex]?.titulo || 'Estado'}
        </Text>
        <Text style={styles.statusDesc}>
          {ETAPAS[currentIndex]?.descripcion}
        </Text>
      </View>

      <View style={styles.timeline}>
        {ETAPAS.map((etapa, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <View key={etapa.key} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[
                  styles.dot,
                  isCompleted && styles.dotCompleted,
                  isCurrent && styles.dotCurrent,
                ]}>
                  {isCompleted && <Text style={styles.dotIcon}>✓</Text>}
                </View>
                {index < ETAPAS.length - 1 && (
                  <View style={[
                    styles.line,
                    isCompleted && styles.lineCompleted,
                  ]} />
                )}
              </View>
              
              <View style={[
                styles.timelineContent,
                isCurrent && styles.timelineContentCurrent,
              ]}>
                <Text style={[
                  styles.etapaTitulo,
                  isCompleted && styles.etapaTituloCompleted,
                ]}>
                  {etapa.icon} {etapa.titulo}
                </Text>
                <Text style={styles.etapaDesc}>{etapa.descripcion}</Text>
                {pedido.etapas_seguimiento && pedido.etapas_seguimiento[index]?.fecha && (
                  <Text style={styles.etapaFecha}>
                    📅 {new Date(pedido.etapas_seguimiento[index].fecha).toLocaleString('es-MX')}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.resumenCard}>
        <Text style={styles.resumenTitle}>💰 Resumen de Pago</Text>
        
        <View style={styles.resumenRow}>
          <Text style={styles.resumenLabel}>Envío pagado</Text>
          <Text style={[styles.resumenValue, { color: '#27ae60' }]}>
            ${pedido.costo_envio?.toFixed(2) || '0.00'}
          </Text>
        </View>
        
        {pedido.monto_contraentrega ? (
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>Pagar al repartidor</Text>
            <Text style={[styles.resumenValue, { color: '#e74c3c' }]}>
              ${pedido.monto_contraentrega.toFixed(2)}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.resumenRow}>
              <Text style={styles.resumenLabel}>Productos</Text>
              <Text style={styles.resumenValue}>${pedido.subtotal?.toFixed(2) || pedido.total.toFixed(2)}</Text>
            </View>
            <View style={styles.resumenRow}>
              <Text style={styles.resumenLabel}>Comisión</Text>
              <Text style={styles.resumenValue}>${pedido.comision?.toFixed(2) || '0.00'}</Text>
            </View>
          </>
        )}
        
        <View style={[styles.resumenRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            ${((pedido.subtotal || 0) + (pedido.comision || 0)).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.direccionCard}>
        <Text style={styles.direccionTitle}>📍 Dirección de Entrega</Text>
        <Text style={styles.direccionText}>{pedido.direccionEntrega}</Text>
      </View>

      <View style={styles.productosCard}>
        <Text style={styles.productosTitle}>🛍️ Productos ({pedido.productos?.length || 0})</Text>
        {pedido.productos?.map((item: any, index: number) => (
          <View key={index} style={styles.productoItem}>
            <Text style={styles.productoNombre}>{item.producto?.nombre || item.nombre}</Text>
            <Text style={styles.productoCantidad}>x{item.cantidad}</Text>
            <Text style={styles.productoPrecio}>
              ${((item.producto?.precio || item.precio) * item.cantidad).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.secondaryBtn}
          onPress={() => router.push('/pedidos')}
        >
          <Text style={styles.secondaryBtnText}>← Volver a Mis Pedidos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { 
    backgroundColor: '#FF6B35', 
    padding: 20, 
    paddingTop: 50,
  },
  headerTitle: { 
    color: '#fff', 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  orderId: { 
    color: 'rgba(255,255,255,0.8)', 
    fontSize: 14, 
    marginTop: 5 
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  statusIcon: { fontSize: 50 },
  statusTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginTop: 10,
    color: '#333'
  },
  statusDesc: { 
    color: '#666', 
    marginTop: 5,
    textAlign: 'center'
  },
  timeline: { 
    backgroundColor: '#fff', 
    marginHorizontal: 15, 
    padding: 15, 
    borderRadius: 15 
  },
  timelineItem: { flexDirection: 'row', minHeight: 70 },
  timelineLeft: { alignItems: 'center', width: 40 },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotCompleted: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  dotCurrent: {
    borderColor: '#FF6B35',
    borderWidth: 3,
  },
  dotIcon: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#ddd',
    marginVertical: 5,
  },
  lineCompleted: { backgroundColor: '#27ae60' },
  timelineContent: { 
    flex: 1, 
    paddingLeft: 15, 
    paddingBottom: 20 
  },
  timelineContentCurrent: { 
    backgroundColor: '#fff5f0', 
    padding: 10, 
    borderRadius: 10,
    marginLeft: 5,
  },
  etapaTitulo: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#999' 
  },
  etapaTituloCompleted: { color: '#333' },
  etapaDesc: { 
    fontSize: 13, 
    color: '#aaa',
    marginTop: 2
  },
  etapaFecha: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  resumenCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 15,
  },
  resumenTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  resumenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resumenLabel: { color: '#666' },
  resumenValue: { fontWeight: '600' },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#FF6B35' },
  direccionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 15,
  },
  direccionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  direccionText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  productosCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 15,
  },
  productosTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productoNombre: { flex: 1, fontSize: 14 },
  productoCantidad: { color: '#666', marginRight: 15 },
  productoPrecio: { fontWeight: '600', color: '#FF6B35' },
  actions: { padding: 15, paddingBottom: 40 },
  secondaryBtn: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  secondaryBtnText: { color: '#FF6B35', fontWeight: '600' },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});
