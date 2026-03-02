import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useState } from 'react';

interface Venta {
  id: string;
  producto: string;
  cantidad: number;
  precio: number;
  comision: number;
  fecha: string;
  status: 'completada' | 'pendiente' | 'cancelada';
}

const MOCK_VENTAS: Venta[] = [
  { id: '1', producto: 'Tamal de Mole', cantidad: 5, precio: 225, comision: 22.5, fecha: '26/02/2024', status: 'completada' },
  { id: '2', producto: 'Champurrado', cantidad: 10, precio: 250, comision: 25, fecha: '25/02/2024', status: 'completada' },
  { id: '3', producto: 'Alebrijes', cantidad: 2, precio: 700, comision: 70, fecha: '24/02/2024', status: 'completada' },
  { id: '4', producto: 'Pulseras Artesanales', cantidad: 8, precio: 640, comision: 64, fecha: '23/02/2024', status: 'pendiente' },
  { id: '5', producto: 'Atole de Vainilla', cantidad: 6, precio: 120, comision: 12, fecha: '22/02/2024', status: 'cancelada' },
];

export default function EstadisticasVendedorScreen() {
  const [periodo, setPeriodo] = useState('semana');

  const ventasCompletadas = MOCK_VENTAS.filter(v => v.status === 'completada');
  const totalVentas = ventasCompletadas.reduce((sum, v) => sum + v.precio, 0);
  const totalComision = ventasCompletadas.reduce((sum, v) => sum + v.comision, 0);
  const totalUnidades = ventasCompletadas.reduce((sum, v) => sum + v.cantidad, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completada': return '#27ae60';
      case 'pendiente': return '#f39c12';
      case 'cancelada': return '#e74c3c';
      default: return '#999';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Mis Estadísticas</Text>
        <View style={styles.periodoSelector}>
          {['dia', 'semana', 'mes', 'año'].map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodoBtn, periodo === p && styles.periodoBtnActive]}
              onPress={() => setPeriodo(p)}
            >
              <Text style={[styles.periodoText, periodo === p && styles.periodoTextActive]}>
                {p === 'dia' ? 'Hoy' : p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#FF6B35' }]}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statValue}>${totalVentas.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Ventas Totales</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#27ae60' }]}>
          <Text style={styles.statIcon}>✅</Text>
          <Text style={styles.statValue}>{ventasCompletadas.length}</Text>
          <Text style={styles.statLabel}>Pedidos Completados</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#3498db' }]}>
          <Text style={styles.statIcon}>📦</Text>
          <Text style={styles.statValue}>{totalUnidades}</Text>
          <Text style={styles.statLabel}>Unidades Vendidas</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#9b59b6' }]}>
          <Text style={styles.statIcon}>📈</Text>
          <Text style={styles.statValue}>${totalComision.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Comisión (10%)</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Últimas Ventas</Text>
        {MOCK_VENTAS.map((venta) => (
          <View key={venta.id} style={styles.ventaItem}>
            <View style={styles.ventaInfo}>
              <Text style={styles.ventaProducto}>{venta.producto}</Text>
              <Text style={styles.ventaDetalles}>x{venta.cantidad} • {venta.fecha}</Text>
            </View>
            <View style={styles.ventaderecha}>
              <Text style={styles.ventaMonto}>${venta.precio.toFixed(2)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(venta.status) }]}>
                <Text style={styles.statusText}>{venta.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Productos Más Vendidos</Text>
        <View style={styles.rankingItem}>
          <Text style={styles.rankingPos}>1</Text>
          <View style={styles.rankingInfo}>
            <Text style={styles.rankingProducto}>Tamal de Mole</Text>
            <Text style={styles.rankingVentas}>45 unidades</Text>
          </View>
          <Text style={styles.rankingMonto}>$2,025</Text>
        </View>
        <View style={styles.rankingItem}>
          <Text style={styles.rankingPos}>2</Text>
          <View style={styles.rankingInfo}>
            <Text style={styles.rankingProducto}>Alebrijes</Text>
            <Text style={styles.rankingVentas}>12 unidades</Text>
          </View>
          <Text style={styles.rankingMonto}>$4,200</Text>
        </View>
        <View style={styles.rankingItem}>
          <Text style={styles.rankingPos}>3</Text>
          <View style={styles.rankingInfo}>
            <Text style={styles.rankingProducto}>Champurrado</Text>
            <Text style={styles.rankingVentas}>38 unidades</Text>
          </View>
          <Text style={styles.rankingMonto}>$950</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          * Las estadísticas se actualizan cada hora
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#FF6B35', padding: 20, paddingTop: 40 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  periodoSelector: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 3 },
  periodoBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 18 },
  periodoBtnActive: { backgroundColor: '#fff' },
  periodoText: { color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: 13 },
  periodoTextActive: { color: '#FF6B35' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10 },
  statCard: { width: '48%', margin: '1%', padding: 20, borderRadius: 12, alignItems: 'center', elevation: 3 },
  statIcon: { fontSize: 30, marginBottom: 10 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  statLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 5 },
  section: { backgroundColor: '#fff', margin: 10, padding: 15, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  ventaItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  ventaInfo: { flex: 1 },
  ventaProducto: { fontSize: 15, fontWeight: '600' },
  ventaDetalles: { color: '#666', fontSize: 12, marginTop: 3 },
  ventaMonto: { fontSize: 16, fontWeight: 'bold', color: '#FF6B35' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginTop: 5 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textTransform: 'capitalize' },
  ventaderecha: { alignItems: 'flex-end' },
  rankingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  rankingPos: { width: 30, height: 30, backgroundColor: '#FF6B35', borderRadius: 15, textAlign: 'center', lineHeight: 30, color: '#fff', fontWeight: 'bold', overflow: 'hidden' },
  rankingInfo: { flex: 1, marginLeft: 12 },
  rankingProducto: { fontSize: 15, fontWeight: '600' },
  rankingVentas: { color: '#666', fontSize: 12, marginTop: 2 },
  rankingMonto: { fontSize: 16, fontWeight: 'bold', color: '#27ae60' },
  footer: { padding: 20, alignItems: 'center' },
  footerText: { color: '#999', fontSize: 12 },
});
