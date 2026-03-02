import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useStore, MOCK_PRODUCTOS } from '../../src/store/useStore';

export default function FavoritosTabScreen() {
  const { favoritos, productos, toggleFavorito } = useStore();
  
  const productosFavoritos = productos.length > 0 
    ? productos.filter(p => favoritos.includes(p.id))
    : MOCK_PRODUCTOS.filter(p => favoritos.includes(p.id));

  const renderFavorito = ({ item }: { item: any }) => (
    <View style={styles.favoritoCard}>
      <Image source={{ uri: item.fotos?.[0] || item.foto }} style={styles.productoImage} />
      <View style={styles.productoInfo}>
        <Text style={styles.productoNombre}>{item.nombre}</Text>
        <Text style={styles.productoCategoria}>{item.categoria}</Text>
        <Text style={styles.productoPrecio}>${item.precio}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.comprarBtn}
          onPress={() => router.push(`/producto/${item.id}`)}
        >
          <Text style={styles.comprarBtnText}>Ver</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.eliminarBtn}
          onPress={() => toggleFavorito(item.id)}
        >
          <Text style={styles.eliminarBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={productosFavoritos}
        keyExtractor={(item) => item.id}
        renderItem={renderFavorito}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>❤️</Text>
            <Text style={styles.emptyTitle}>Sin favoritos</Text>
            <Text style={styles.emptyText}>Los productos que guardes aparecerán aquí</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 15 },
  favoritoCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, elevation: 2 },
  productoImage: { width: 70, height: 70, borderRadius: 8 },
  productoInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  productoNombre: { fontSize: 16, fontWeight: 'bold' },
  productoCategoria: { color: '#666', fontSize: 12, marginTop: 2 },
  productoPrecio: { fontSize: 18, fontWeight: 'bold', color: '#FF6B35', marginTop: 5 },
  actions: { justifyContent: 'center', alignItems: 'center' },
  comprarBtn: { backgroundColor: '#FF6B35', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15, marginBottom: 5 },
  comprarBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  eliminarBtn: { padding: 5 },
  eliminarBtnText: { color: '#ff4444', fontSize: 16 },
  emptyContainer: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 60 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 15 },
  emptyText: { color: '#666', marginTop: 10 },
});
