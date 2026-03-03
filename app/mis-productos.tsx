import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert, TextInput } from 'react-native';
import { useStore, Producto } from '../src/store/useStore';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';

export default function MisProductosScreen() {
  const { productos, deleteProducto, updateProducto, initialized, initialize } = useStore();
  const [search, setSearch] = useState('');
  const [nombreTienda, setNombreTienda] = useState('Mi Tienda');
  const [editandoNombre, setEditandoNombre] = useState(false);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, []);

  const guardarNombreTienda = () => {
    if (nombreTienda.trim()) {
      setEditandoNombre(false);
      Alert.alert('Éxito', 'Nombre de tienda actualizado');
    }
  };

  const misProductos = productos.filter(p => p.tiendaId === 'mi_tienda');
  
  const filtered = misProductos.filter(p => 
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const handleEliminar = (producto: Producto) => {
    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro de eliminar "${producto.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteProducto(producto.id) },
      ]
    );
  };

  const handleToggleDisponible = (producto: Producto) => {
    updateProducto(producto.id, { disponible: !producto.disponible });
  };

  if (misProductos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyTitle}>Sin productos</Text>
        <Text style={styles.emptyText}>Agrega tu primer producto para comenzar a vender</Text>
        <TouchableOpacity 
          style={styles.agregarBtn}
          onPress={() => router.push('/agregar-producto')}
        >
          <Text style={styles.agregarBtnText}>+ Agregar Producto</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tiendaHeader}>
        {editandoNombre ? (
          <View style={styles.nombreTiendaEdit}>
            <TextInput
              style={styles.nombreTiendaInput}
              value={nombreTienda}
              onChangeText={setNombreTienda}
              placeholder="Nombre de tu tienda"
              autoFocus
            />
            <TouchableOpacity onPress={guardarNombreTienda} style={styles.guardarBtn}>
              <Text style={styles.guardarBtnText}>✓</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.nombreTiendaRow}
            onPress={() => setEditandoNombre(true)}
          >
            <Text style={styles.nombreTienda}>🏪 {nombreTienda}</Text>
            <Text style={styles.editarIcon}>✏️</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.tiendaSubtext}>Tus productos en ZocaloTrade</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar mis productos..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{misProductos.length}</Text>
          <Text style={styles.statLabel}>Productos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{misProductos.filter(p => p.disponible).length}</Text>
          <Text style={styles.statLabel}>Disponibles</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            ${misProductos.reduce((sum, p) => sum + p.precio, 0)}
          </Text>
          <Text style={styles.statLabel}>Valor Total</Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.productoCard}>
            <Image 
              source={{ uri: item.fotos?.[0] || item.foto }} 
              style={styles.productoImage} 
            />
            <View style={styles.productoInfo}>
              <Text style={styles.productoNombre}>{item.nombre}</Text>
              <Text style={styles.productoCategoria}>{item.categoria}</Text>
              <Text style={styles.productoPrecio}>${item.precio}</Text>
              <View style={[styles.badge, item.disponible ? styles.badgeActivo : styles.badgeInactivo]}>
                <Text style={[styles.badgeText, item.disponible ? styles.badgeTextActivo : styles.badgeTextInactivo]}>
                  {item.disponible ? 'Activo' : 'Inactivo'}
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.editarBtn]}
                onPress={() => handleToggleDisponible(item)}
              >
                <Text style={styles.actionText}>
                  {item.disponible ? '⏸️' : '▶️'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.eliminarBtn]}
                onPress={() => handleEliminar(item)}
              >
                <Text style={styles.actionText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity 
        style={styles.floatingBtn}
        onPress={() => router.push('/agregar-producto')}
      >
        <Text style={styles.floatingBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyIcon: { fontSize: 80 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 20 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10 },
  agregarBtn: { backgroundColor: '#FF6B35', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 25, marginTop: 25 },
  agregarBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  tiendaHeader: { backgroundColor: '#27ae60', padding: 20, paddingTop: 15 },
  nombreTiendaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nombreTienda: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  editarIcon: { fontSize: 20 },
  nombreTiendaEdit: { flexDirection: 'row', alignItems: 'center' },
  nombreTiendaInput: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 12, fontSize: 18, marginRight: 10 },
  guardarBtn: { backgroundColor: '#fff', padding: 12, borderRadius: 8 },
  guardarBtnText: { color: '#27ae60', fontSize: 18, fontWeight: 'bold' },
  tiendaSubtext: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 5 },
  searchContainer: { padding: 15, backgroundColor: '#fff' },
  searchInput: { backgroundColor: '#f0f0f0', borderRadius: 10, padding: 12, fontSize: 16 },
  statsRow: { flexDirection: 'row', padding: 15, backgroundColor: '#fff' },
  statCard: { flex: 1, alignItems: 'center', padding: 10 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#FF6B35' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  list: { padding: 15 },
  productoCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, elevation: 2 },
  productoImage: { width: 80, height: 80, borderRadius: 8 },
  productoInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  productoNombre: { fontSize: 16, fontWeight: 'bold' },
  productoCategoria: { fontSize: 12, color: '#666', marginTop: 2 },
  productoPrecio: { fontSize: 18, fontWeight: 'bold', color: '#FF6B35', marginTop: 5 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginTop: 5 },
  badgeActivo: { backgroundColor: '#d4edda' },
  badgeInactivo: { backgroundColor: '#f8d7da' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeTextActivo: { color: '#155724' },
  badgeTextInactivo: { color: '#721c24' },
  actions: { justifyContent: 'center' },
  actionBtn: { padding: 10, marginVertical: 3 },
  actionText: { fontSize: 18 },
  floatingBtn: { position: 'absolute', bottom: 90, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  floatingBtnText: { fontSize: 30, color: '#fff', fontWeight: 'bold' },
});
