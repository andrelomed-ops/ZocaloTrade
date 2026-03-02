import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

interface Favorito {
  id: string;
  productoId: string;
  nombre: string;
  precio: number;
  foto: string;
  tienda: string;
  agregadoEn: string;
}

const MOCK_FAVORITOS: Favorito[] = [
  { id: '1', productoId: '1', nombre: 'Tamal de Mole', precio: 45, foto: 'https://picsum.photos/200/200?random=1', tienda: 'Don Juan Tamales', agregadoEn: '2024-01-15' },
  { id: '2', productoId: '3', nombre: 'Pulseras Artesanales', precio: 80, foto: 'https://picsum.photos/200/200?random=3', tienda: 'Artesanías Mex', agregadoEn: '2024-01-14' },
  { id: '3', productoId: '4', nombre: 'Alebrijes', precio: 350, foto: 'https://picsum.photos/200/200?random=4', tienda: 'Artesanías Mex', agregadoEn: '2024-01-10' },
];

export default function FavoritosScreen() {
  const [favoritos, setFavoritos] = useState<Favorito[]>(MOCK_FAVORITOS);

  const eliminarFavorito = (id: string) => {
    setFavoritos(prev => prev.filter(f => f.id !== id));
  };

  const vaciarLista = () => {
    setFavoritos([]);
  };

  const renderFavorito = ({ item }: { item: Favorito }) => (
    <View style={styles.favoritoCard}>
      <Image source={{ uri: item.foto }} style={styles.productoImage} />
      <View style={styles.productoInfo}>
        <Text style={styles.productoNombre}>{item.nombre}</Text>
        <Text style={styles.productoTienda}>{item.tienda}</Text>
        <Text style={styles.productoPrecio}>${item.precio}</Text>
        <Text style={styles.productoFecha}>Agregado: {item.agregadoEn}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => router.push(`/producto/${item.productoId}`)}
        >
          <Text style={styles.actionText}>🛒</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.eliminarBtn]}
          onPress={() => eliminarFavorito(item.id)}
        >
          <Text style={styles.actionText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>❤️ Mis Favoritos</Text>
        <Text style={styles.headerCount}>{favoritos.length} productos</Text>
      </View>

      {favoritos.length > 0 && (
        <TouchableOpacity style={styles.vaciarBtn} onPress={vaciarLista}>
          <Text style={styles.vaciarBtnText}>Vaciar lista</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={favoritos}
        keyExtractor={(item) => item.id}
        renderItem={renderFavorito}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>❤️</Text>
            <Text style={styles.emptyTitle}>Sin favoritos aún</Text>
            <Text style={styles.emptyText}>
              Agrega productos a tu lista de favoritos para verlos aquí
            </Text>
            <TouchableOpacity 
              style={styles.explorarBtn}
              onPress={() => router.push('/explorar')}
            >
              <Text style={styles.explorarBtnText}>Explorar Productos</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#FF6B35', padding: 20, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerCount: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  vaciarBtn: { backgroundColor: '#fff', padding: 12, alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  vaciarBtnText: { color: '#ff4444', fontWeight: '600' },
  list: { padding: 15 },
  favoritoCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, elevation: 2 },
  productoImage: { width: 80, height: 80, borderRadius: 8 },
  productoInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  productoNombre: { fontSize: 16, fontWeight: 'bold' },
  productoTienda: { color: '#666', fontSize: 12, marginTop: 2 },
  productoPrecio: { fontSize: 18, fontWeight: 'bold', color: '#FF6B35', marginTop: 5 },
  productoFecha: { color: '#999', fontSize: 11, marginTop: 3 },
  actions: { justifyContent: 'center' },
  actionBtn: { padding: 10 },
  actionText: { fontSize: 20 },
  eliminarBtn: { marginTop: 5 },
  emptyContainer: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 30 },
  emptyIcon: { fontSize: 80 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 20 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 10, lineHeight: 22 },
  explorarBtn: { backgroundColor: '#FF6B35', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 25, marginTop: 25 },
  explorarBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
