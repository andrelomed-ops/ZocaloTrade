import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, Alert, RefreshControl, Platform } from 'react-native';
import { useStore, MOCK_PRODUCTOS, CATEGORIAS } from '../../src/store/useStore';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';

export default function ExplorarScreen() {
  const { addToCarrito, productos, initialized, initialize, favoritos, toggleFavorito, colors } = useStore();
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await initialize();
    setRefreshing(false);
  }, [initialize]);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, []);

  const productosMostrar = (productos || []).length > 0 ? productos : MOCK_PRODUCTOS;

  const filtered = (productosMostrar || []).filter((p) => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoria === 'Todos' || p.categoria === categoria;
    return matchSearch && matchCat;
  });

  const handleAdd = (item: any) => {
    addToCarrito(item);
    if (Platform.OS === 'web') alert(`${item.nombre} agregado`);
    else Alert.alert('Agregado', `${item.nombre} se agregó al carrito`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.background, color: colors.text }]}
          placeholder="Buscar productos..."
          placeholderTextColor={colors.subtext}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={[styles.filtersContainer, { backgroundColor: colors.card }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIAS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton, 
                { backgroundColor: colors.background },
                categoria === item && { backgroundColor: colors.primary }
              ]}
              onPress={() => setCategoria(item)}
            >
              <Text style={[
                styles.filterText, 
                { color: colors.text },
                categoria === item && { color: '#fff' }
              ]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        renderItem={({ item }) => {
          const isFavorite = (favoritos || []).includes(item.id);
          return (
            <TouchableOpacity 
              style={[styles.productoCard, { backgroundColor: colors.card }]} 
              onPress={() => router.push(`/producto/${item.id}`)}
            >
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: item.fotos?.[0] || 'https://picsum.photos/400/400' }} 
                  style={styles.productoImage} 
                />
                <TouchableOpacity 
                  style={styles.favoriteBtn}
                  onPress={() => toggleFavorito(item.id)}
                >
                  <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.productoNombre, { color: colors.text }]} numberOfLines={1}>{item.nombre}</Text>
              <Text style={[styles.productoPrecio, { color: colors.primary }]}>${item.precio}</Text>
              <TouchableOpacity 
                style={[styles.agregarBtn, { backgroundColor: colors.primary }]} 
                onPress={() => handleAdd(item)}
              >
                <Text style={styles.agregarBtnText}>Agregar</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>No se encontraron productos</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { padding: 15 },
  searchInput: { borderRadius: 10, padding: 12, fontSize: 16 },
  filtersContainer: { paddingBottom: 10 },
  filterButton: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginHorizontal: 5, marginVertical: 5 },
  filterText: { fontSize: 13, fontWeight: '600' },
  list: { padding: 10 },
  productoCard: { flex: 1, margin: 5, padding: 10, borderRadius: 12, elevation: 2, alignItems: 'center' },
  imageContainer: { width: '100%', position: 'relative' },
  productoImage: { width: '100%', height: 100, borderRadius: 8 },
  favoriteBtn: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 15, padding: 5 },
  favoriteIcon: { fontSize: 18 },
  productoNombre: { fontSize: 14, fontWeight: 'bold', marginTop: 8 },
  productoPrecio: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  agregarBtn: { padding: 8, borderRadius: 6, alignItems: 'center', marginTop: 8, width: '100%' },
  agregarBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 60 },
  emptyText: { fontSize: 18, marginTop: 15 },
});
