import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useStore, Pedido } from '../src/store/useStore';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { syncOrderStatus, CLINKCARGO_STATUS_MAP } from '../src/services/clinckargo';

const ETAPAS_GENERICAS = [
  { key: 'pendiente', titulo: 'Pendiente', icon: '⏳', color: '#f39c12' },
  { key: 'preparando', titulo: 'Preparando', icon: '📦', color: '#3498db' },
  { key: 'listo', titulo: 'Listo para envío', icon: '✅', color: '#9b59b6' },
  { key: 'en_camino', titulo: 'En camino', icon: '🚚', color: '#e67e22' },
  { key: 'entregado', titulo: 'Entregado', icon: '🎉', color: '#27ae60' },
];

export default function SeguimientoPedidoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pedidos, colors, updatePedidoStatus } = useStore();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [etapaClincKargo, setEtapaClincKargo] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const found = pedidos.find(p => p.id === id);
    if (found) {
      setPedido(found);
      
      // Si tiene ID de ClincKargo, sincronizar en tiempo real
      if (found.clinckargo_id) {
        const unsubscribe = syncOrderStatus(
          found.id,
          found.clinckargo_id,
          (newStatus, etapaTexto) => {
            setEtapaClincKargo(etapaTexto);
            // Si el estado cambia a completado, actualizar en Zocalo
            if (newStatus === 'completed') {
              updatePedidoStatus(found.id, 'entregado');
            } else if (newStatus === 'delivery_route') {
              updatePedidoStatus(found.id, 'en_camino');
            }
          }
        );
        return () => unsubscribe();
      }
    }
  }, [id, pedidos]);

  if (!pedido) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const currentStatusIndex = ETAPAS_GENERICAS.findIndex(e => e.key === pedido.status);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Rastreo de Pedido</Text>
        <Text style={styles.orderId}>ID: #{pedido.id.slice(0, 8)}</Text>
      </View>

      {pedido.clinckargo_id && (
        <View style={[styles.logisticsCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <Text style={[styles.logisticsTitle, { color: colors.primary }]}>Logística vía ClincKargo</Text>
          <Text style={[styles.logisticsStatus, { color: colors.text }]}>
            Estado Actual: {etapaClincKargo || 'Sincronizando...'}
          </Text>
          <Text style={{ fontSize: 10, color: colors.subtext, marginTop: 5 }}>
            ID Seguimiento: {pedido.clinckargo_id}
          </Text>
        </View>
      )}

      <View style={styles.timeline}>
        {ETAPAS_GENERICAS.map((etapa, index) => {
          const isDone = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          
          return (
            <View key={etapa.key} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[
                  styles.dot,
                  { borderColor: isDone ? colors.primary : colors.border },
                  isDone && { backgroundColor: colors.primary }
                ]}>
                  {isDone && <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>}
                </View>
                {index < ETAPAS_GENERICAS.length - 1 && (
                  <View style={[
                    styles.line,
                    { backgroundColor: isDone ? colors.primary : colors.border }
                  ]} />
                )}
              </View>
              
              <View style={[
                styles.timelineContent,
                isCurrent && { backgroundColor: colors.card, borderRadius: 12, padding: 10 }
              ]}>
                <Text style={[
                  styles.etapaTitulo,
                  { color: isDone ? colors.text : colors.subtext },
                  isCurrent && { fontWeight: 'bold' }
                ]}>
                  {etapa.icon} {etapa.titulo}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.infoTitle, { color: colors.text }]}>Detalles de Entrega</Text>
        <Text style={{ color: colors.subtext, marginTop: 5 }}>{pedido.direccion_entrega}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.backBtn, { backgroundColor: colors.primary, marginBottom: insets.bottom + 20 }]}
        onPress={() => router.push('/(tabs)/pedidos')}
      >
        <Text style={styles.backBtnText}>Volver a mis pedidos</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25, paddingTop: 40 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  orderId: { color: '#fff', opacity: 0.8, marginTop: 5 },
  logisticsCard: { margin: 15, padding: 15, borderRadius: 12, borderWidth: 1 },
  logisticsTitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  logisticsStatus: { fontSize: 16, marginTop: 5, fontWeight: '600' },
  timeline: { padding: 25 },
  timelineItem: { flexDirection: 'row', minHeight: 60 },
  timelineLeft: { alignItems: 'center', width: 30 },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  line: { width: 2, flex: 1, marginVertical: 4 },
  timelineContent: { flex: 1, paddingLeft: 15, justifyContent: 'center' },
  etapaTitulo: { fontSize: 16 },
  infoCard: { margin: 15, padding: 15, borderRadius: 12 },
  infoTitle: { fontWeight: 'bold', fontSize: 16 },
  backBtn: { margin: 15, padding: 15, borderRadius: 10, alignItems: 'center' },
  backBtnText: { color: '#fff', fontWeight: 'bold' },
});
