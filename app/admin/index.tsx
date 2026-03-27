import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../src/store/useStore';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../src/services/supabase';

export default function AdminPanelScreen() {
  const { colors, isAdmin, user, initialize } = useStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<'dashboard' | 'pending_stores' | 'users'>('dashboard');
  const [pendingStores, setPendingStores] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
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

      if (u.error) console.warn('Error fetching perfiles count:', u.error);
      if (t.error) console.warn('Error fetching tiendas count:', t.error);
      if (p.error) console.warn('Error fetching productos count:', p.error);
      if (ped.error) console.warn('Error fetching pedidos totals:', ped.error);

      const totalVentas = (ped.data || []).reduce((sum, item) => sum + (item.total || 0), 0);

      setGlobalStats({
        usuarios: u.count || 0,
        tiendas: t.count || 0,
        productos: p.count || 0,
        pedidos: ped.data?.length || 0,
        ventasTotales: totalVentas,
        comisiones: totalVentas * 0.1
      });

      // Si estamos en la vista de pendientes, cargar tiendas
      const { data: stores } = await supabase.from('tiendas').select('*').eq('activa', false);
      if (stores) setPendingStores(stores);

      // Si estamos en la vista de usuarios, cargar perfiles
      const { data: users } = await supabase.from('perfiles').select('*').order('created_at', { ascending: false });
      if (users) setAllUsers(users);

    } catch (e) {
      console.error('Admin Panel Data Fetch Error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const approveStore = async (id: string) => {
    try {
      // 1. Obtener el usuario_id de la tienda antes de actualizar
      const { data: storeData } = await supabase.from('tiendas').select('usuario_id').eq('id', id).single();
      
      // 2. Activar la tienda
      const { error } = await supabase.from('tiendas').update({ activa: true }).eq('id', id);
      if (error) throw error;

      // 3. Asegurar que el usuario tenga el rol de vendedor
      if (storeData?.usuario_id) {
        await supabase.from('perfiles').update({ rol: 'vendedor' }).eq('id', storeData.usuario_id);
      }

      setPendingStores(prev => prev.filter(s => s.id !== id));
      fetchGlobalData();
      if (Platform.OS === 'web') alert('Tienda aprobada y rol de vendedor asignado');
      else Alert.alert('Éxito', 'Tienda aprobada y rol asignado');
    } catch (e: any) {
      if (Platform.OS === 'web') alert('Error: ' + e.message);
      else Alert.alert('Error', e.message);
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

  const renderMainDashboard = () => (
    <>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>Panel Maestro Admin</Text>
        <Text style={styles.subtitle}>Control total de ZocaloTrade</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={() => setView('users')}>
          <Text style={styles.cardIcon}>👥</Text>
          <Text style={[styles.cardValue, { color: colors.text }]}>{globalStats.usuarios}</Text>
          <Text style={[styles.cardLabel, { color: colors.subtext }]}>Usuarios</Text>
        </TouchableOpacity>
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
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
        <Text style={[styles.cardValue, { color: colors.primary, fontSize: 24 }]}>${globalStats.comisiones.toFixed(2)}</Text>
        <Text style={[styles.cardLabel, { color: colors.subtext }]}>Comisiones Totales del Proyecto (10%)</Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Operaciones Críticas</Text>
        <TouchableOpacity 
          style={[styles.row, { borderBottomColor: colors.border }]}
          onPress={() => setView('pending_stores')}
        >
          <Text style={{ fontSize: 16, color: colors.text }}>Validar Vendedores</Text>
          <Text style={{ color: colors.primary }}>Pendientes: {pendingStores.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]}>
          <Text style={{ fontSize: 16, color: colors.text }}>Resolver Disputas</Text>
          <Text style={{ color: colors.primary }}>Activas: 0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => setView('users')}>
          <Text style={{ fontSize: 16, color: colors.text }}>Gestionar Usuarios</Text>
          <Text style={{ color: colors.primary }}>Listado completo</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.btn, { backgroundColor: '#666', marginTop: 10 }]}
        onPress={() => router.replace('/tienda/mi-tienda')}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cerrar Panel Maestro</Text>
      </TouchableOpacity>
    </>
  );

  const renderPendingStores = () => (
    <View style={{ padding: 20 }}>
      <View style={styles.viewHeader}>
        <TouchableOpacity onPress={() => setView('dashboard')}>
          <Text style={{ color: colors.primary, fontSize: 18 }}>← Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 10 }]}>Tiendas por Validar</Text>
      </View>

      {pendingStores.length === 0 ? (
        <Text style={{ color: colors.subtext, textAlign: 'center', marginTop: 40 }}>No hay tiendas pendientes de validación.</Text>
      ) : (
        pendingStores.map(store => (
          <View key={store.id} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>{store.nombre}</Text>
              <Text style={{ color: colors.subtext }}>Categoría: {store.categoria}</Text>
              <Text style={{ color: colors.subtext, fontSize: 12 }}>ID: {store.id}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#27ae60' }]}
              onPress={() => approveStore(store.id)}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Aprobar</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );

  const renderUsersList = () => (
    <View style={{ padding: 20 }}>
      <View style={styles.viewHeader}>
        <TouchableOpacity onPress={() => setView('dashboard')}>
          <Text style={{ color: colors.primary, fontSize: 18 }}>← Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 10 }]}>Gestión de Usuarios</Text>
      </View>

      {allUsers.map(u => (
        <View key={u.id} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>{u.nombre || 'Sin nombre'}</Text>
            <Text style={{ color: colors.subtext, fontSize: 12 }}>{u.email}</Text>
            <Text style={{ 
              color: u.rol === 'admin' ? '#8e44ad' : (u.rol === 'vendedor' ? colors.primary : colors.subtext),
              fontWeight: 'bold',
              fontSize: 12
            }}>
              Rol: {u.rol || 'cliente'}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      {view === 'dashboard' && renderMainDashboard()}
      {view === 'pending_stores' && renderPendingStores()}
      {view === 'users' && renderUsersList()}
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
  viewHeader: { marginBottom: 20 },
  itemCard: { padding: 15, borderRadius: 12, borderWidth: 1, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
});
