import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert, RefreshControl, Platform, TextInput } from 'react-native';
import { useStore } from '../src/store/useStore';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { supabase, TABLES } from '../src/services/supabase';

export default function MisProductosScreen() {
  const { productos, colors, initialize, user } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await initialize();
    setRefreshing(false);
  }, [initialize]);

  useEffect(() => {
    initialize().finally(() => setLoading(false));
  }, []);

  // Filtrar productos que pertenecen al vendedor (tienda t1 por ahora)
  const misProductos = (productos || []).filter(p => p.tiendaId === 't1');
  const filtered = misProductos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from(TABLES.PRODUCTOS).update({ activo: !current }).eq('id', id);
      if (!error) {
        await initialize();
        if (Platform.OS === 'web') alert('Estado del producto actualizado');
      }
    } catch (e) {}
  };

  const eliminarProducto = async (id: string) => {
    const confirmed = Platform.OS === 'web' 
      ? window.confirm('¿Eliminar este producto?') 
      : await new Promise(resolve => {
          Alert.alert('Eliminar', '¿Estás seguro?', [
            { text: 'No', onPress: () => resolve(false) },
            { text: 'Sí', onPress: () => resolve(true) }
          ]);
        });

    if (confirmed) {
      try {
        const { error } = await supabase.from(TABLES.PRODUCTOS).delete().eq('id', id);
        if (!error) {
          await initialize();
          if (Platform.OS === 'web') alert('Producto eliminado');
        }
      } catch (e) {}
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Mi Inventario</Text>
        <Text style={{ color: '#fff', opacity: 0.8 }}>Gestiona tus productos en venta</Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.background, color: colors.text }]}
          placeholder="Buscar en mis productos..."
          placeholderTextColor={colors.subtext}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Image 
              source={{ uri: item.fotos?.[0] || 'https://picsum.photos/400/400' }} 
              style={styles.image} 
            />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={[styles.nombre, { color: colors.text }]}>{item.nombre}</Text>
              <Text style={[styles.precio, { color: colors.primary }]}>${item.precio}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.dot, { backgroundColor: item.disponible ? '#27ae60' : '#e74c3c' }]} />
                <Text style={{ color: colors.subtext, fontSize: 12 }}>
                  {item.disponible ? 'Activo' : 'Pausado'}
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => toggleStatus(item.id, item.disponible)} style={styles.actionBtn}>
                <Text style={{ fontSize: 20 }}>{item.disponible ? '⏸️' : '▶️'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => eliminarProducto(item.id)} style={styles.actionBtn}>
                <Text style={{ fontSize: 20 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 100 }}>
            <Text style={{ fontSize: 60 }}>📦</Text>
            <Text style={{ color: colors.subtext, marginTop: 10 }}>No hay productos coincidentes</Text>
            <TouchableOpacity 
              style={[styles.addBtn, { backgroundColor: colors.primary, marginTop: 20 }]}
              onPress={() => router.push('/agregar-producto')}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Agregar Producto</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/agregar-producto')}
      >
        <Text style={{ color: '#fff', fontSize: 30, fontWeight: 'bold' }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25, paddingTop: 50 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  searchContainer: { padding: 15 },
  searchInput: { borderRadius: 10, padding: 12, fontSize: 15 },
  card: { flexDirection: 'row', borderRadius: 15, padding: 12, marginBottom: 15, elevation: 2 },
  image: { width: 70, height: 70, borderRadius: 10 },
  nombre: { fontSize: 16, fontWeight: 'bold' },
  precio: { fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  actions: { justifyContent: 'space-between', paddingLeft: 10 },
  actionBtn: { padding: 5 },
  addBtn: { padding: 15, borderRadius: 10, paddingHorizontal: 25 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
});
