import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useStore, MOCK_PRODUCTOS, CATEGORIAS } from '../../src/store/useStore';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';

export default function ExplorarScreen() {
  const { addToCarrito, productos, initialized, initialize, favoritos, toggleFavorito } = useStore();
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('Todos');

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, []);

  const productosMostrar = productos.length > 0 ? productos : MOCK_PRODUCTOS;

  const filtered = productosMostrar.filter((p) => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoria === 'Todos' || p.categoria === categoria;
    return matchSearch && matchCat;
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar productos..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filtersContainer}>
        {CATEGORIAS.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterButton, categoria === cat && styles.filterActive]}
            onPress={() => setCategoria(cat)}
          >
            <Text style={[styles.filterText, categoria === cat && styles.filterTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.resultsCount}>{filtered.length} productos encontrados</Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isFavorite = favoritos.includes(item.id);
          return (
            <TouchableOpacity 
              style={styles.productoCard} 
              onPress={() => router.push(`/producto/${item.id}`)}
            >
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: item.fotos?.[0] || item.foto }} 
                  style={styles.productoImage} 
                />
                <TouchableOpacity 
                  style={styles.favoriteBtn}
                  onPress={() => toggleFavorito(item.id)}
                >
                  <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.productoNombre} numberOfLines={1}>{item.nombre}</Text>
              <Text style={styles.productoPrecio}>${item.precio}</Text>
              <TouchableOpacity 
                style={styles.agregarBtn} 
                onPress={() => {
                  addToCarrito(item);
                  Alert.alert('Agregado', `${item.nombre} se agregó al carrito`);
                }}
              >
                <Text style={styles.agregarBtnText}>Agregar</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No se encontraron productos</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.floatingButton} onPress={() => router.push('/agregar-producto')}>
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.advancedSearchBtn} onPress={() => router.push('/busqueda-avanzada')}>
        <Text style={styles.advancedSearchText}>🔍</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  searchContainer: { padding: 15, backgroundColor: '#ffffff' },
  searchInput: { backgroundColor: '#f0f0f0', borderRadius: 10, padding: 12, fontSize: 16 },
  filtersContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, backgroundColor: '#ffffff', paddingTop: 0 },
  filterButton: { backgroundColor: '#f0f0f0', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, margin: 5 },
  filterActive: { backgroundColor: '#FF6B35' },
  filterText: { color: '#666', fontSize: 13 },
  filterTextActive: { color: '#ffffff' },
  resultsCount: { paddingHorizontal: 15, paddingBottom: 10, color: '#666', fontSize: 13 },
  list: { padding: 10 },
  productoCard: { flex: 1, backgroundColor: '#ffffff', margin: 5, padding: 10, borderRadius: 12, elevation: 2, alignItems: 'center' },
  imageContainer: { width: '100%', position: 'relative' },
  productoImage: { width: '100%', height: 100, borderRadius: 8 },
  favoriteBtn: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 15, padding: 5 },
  favoriteIcon: { fontSize: 18 },
  productoNombre: { fontSize: 14, fontWeight: 'bold', marginTop: 8, color: '#333' },
  productoPrecio: { fontSize: 16, fontWeight: 'bold', color: '#FF6B35', marginTop: 4 },
  agregarBtn: { backgroundColor: '#FF6B35', padding: 8, borderRadius: 6, alignItems: 'center', marginTop: 8, width: '100%' },
  agregarBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 60 },
  emptyText: { fontSize: 18, color: '#666', marginTop: 15 },
  floatingButton: { position: 'absolute', bottom: 90, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  floatingButtonText: { fontSize: 30, color: '#ffffff', fontWeight: 'bold' },
  advancedSearchBtn: { position: 'absolute', bottom: 90, right: 90, width: 50, height: 50, borderRadius: 25, backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  advancedSearchText: { fontSize: 22 },
});
