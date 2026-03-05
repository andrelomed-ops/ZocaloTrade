import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { useStore } from '../src/store/useStore';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '../src/services/supabase';

// Solo recomendado para pantallas web/tablet
const isLargeScreen = Dimensions.get('window').width > 768;

export default function AdminWebPanelScreen() {
  const { colors, isAdmin, user } = useStore();
  const [loading, setLoading] = useState(true);
  const [pedidosRecientes, setPedidosRecientes] = useState<any[]>([]);
  const [tiendasTop, setTiendasTop] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const { data: pData } = await supabase.from('pedidos').select('*, perfiles(nombre, email)').order('created_at', { ascending: false }).limit(10);
        const { data: tData } = await supabase.from('tiendas').select('*').limit(5);
        
        if (pData) setPedidosRecientes(pData);
        if (tData) setTiendasTop(tData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sidebar de Navegación Lateral (Solo Web) */}
      {isLargeScreen && (
        <View style={[styles.sidebar, { backgroundColor: colors.card, borderRightColor: colors.border }]}>
          <Text style={[styles.sidebarTitle, { color: colors.primary }]}>ZocaloAdmin</Text>
          <TouchableOpacity style={styles.navItem}><Text style={[styles.navText, { color: colors.primary, fontWeight: 'bold' }]}>📊 Dashboard</Text></TouchableOpacity>
          <TouchableOpacity style={styles.navItem}><Text style={[styles.navText, { color: colors.text }]}>🏪 Tiendas</Text></TouchableOpacity>
          <TouchableOpacity style={styles.navItem}><Text style={[styles.navText, { color: colors.text }]}>📦 Pedidos Globales</Text></TouchableOpacity>
          <TouchableOpacity style={styles.navItem}><Text style={[styles.navText, { color: colors.text }]}>👥 Usuarios</Text></TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/')}><Text style={{ color: '#e74c3c', fontWeight: 'bold' }}>Salir</Text></TouchableOpacity>
        </View>
      )}

      {/* Contenido Principal */}
      <ScrollView style={styles.mainContent}>
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Visión General de la Plataforma</Text>
          <Text style={{ color: colors.subtext }}>Bienvenido, {user?.nombre}</Text>
        </View>

        <View style={styles.dashboardGrid}>
          {/* Tabla de Últimos Pedidos */}
          <View style={[styles.dataCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Órdenes Recientes</Text>
            <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.th, { color: colors.subtext, flex: 2 }]}>ID / Cliente</Text>
              <Text style={[styles.th, { color: colors.subtext, flex: 1 }]}>Total</Text>
              <Text style={[styles.th, { color: colors.subtext, flex: 1 }]}>Estado</Text>
            </View>
            {pedidosRecientes.map((ped) => (
              <View key={ped.id} style={[styles.tableRow, { borderBottomColor: colors.border }]}>
                <View style={{ flex: 2 }}>
                  <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 12 }}>#{ped.id.slice(0, 8)}</Text>
                  <Text style={{ color: colors.subtext, fontSize: 11 }}>{ped.perfiles?.nombre || 'Anónimo'}</Text>
                </View>
                <Text style={{ color: colors.text, flex: 1 }}>${ped.total}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: ped.status === 'entregado' ? '#27ae60' : colors.primary, fontSize: 12, fontWeight: 'bold' }}>
                    {ped.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Tabla de Tiendas */}
          <View style={[styles.dataCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Monitoreo de Tiendas</Text>
            {tiendasTop.map((tienda) => (
              <View key={tienda.id} style={[styles.tiendaRow, { borderBottomColor: colors.border }]}>
                <Text style={{ color: colors.text, flex: 1, fontWeight: '600' }}>{tienda.nombre || tienda.nombre_tienda}</Text>
                <Text style={{ color: '#f39c12', fontWeight: 'bold' }}>⭐ {tienda.rating}</Text>
                <TouchableOpacity style={{ marginLeft: 15, backgroundColor: colors.background, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 }}>
                  <Text style={{ color: colors.primary, fontSize: 11 }}>Ver Detalle</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  sidebar: { width: 250, borderRightWidth: 1, padding: 20 },
  sidebarTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 40 },
  navItem: { paddingVertical: 15 },
  navText: { fontSize: 16 },
  mainContent: { flex: 1, padding: 30 },
  header: { marginBottom: 30 },
  pageTitle: { fontSize: 28, fontWeight: 'bold' },
  dashboardGrid: { flexDirection: Platform.OS === 'web' && isLargeScreen ? 'row' : 'column', gap: 20 },
  dataCard: { flex: 1, borderRadius: 15, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  tableHeader: { flexDirection: 'row', paddingBottom: 10, borderBottomWidth: 1, marginBottom: 10 },
  th: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, alignItems: 'center' },
  tiendaRow: { flexDirection: 'row', paddingVertical: 15, borderBottomWidth: 1, alignItems: 'center' },
});
