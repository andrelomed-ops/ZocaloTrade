import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { CATEGORIAS, MOCK_PRODUCTOS, MOCK_TIENDAS } from '../../src/store/useStore';
import { useStore } from '../../src/store/useStore';
import { useState, useCallback } from 'react';

export default function HomeScreen() {
  const { addToCarrito, favoritos, toggleFavorito, productos, tiendas, colors, initialize } = useStore();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await initialize();
    setRefreshing(false);
  }, [initialize]);

  const filteredProducts = (categoriaSeleccionada === 'Todos' 
    ? (productos || []) 
    : (productos || []).filter(p => p.categoria === categoriaSeleccionada)).slice(0, 10);

  const activeTiendas = (tiendas || []).length > 0 ? tiendas : MOCK_TIENDAS;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>ZocaloTrade</Text>
        <Text style={styles.subtitle}>Tu marketplace del Zócalo</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Categorías</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasScroll}>
        {CATEGORIAS.map((cat) => (
          <TouchableOpacity 
            key={cat} 
            style={[
              styles.categoriaButton, 
              { backgroundColor: colors.card },
              categoriaSeleccionada === cat && { backgroundColor: colors.primary }
            ]}
            onPress={() => setCategoriaSeleccionada(cat)}
          >
            <Text style={[
              styles.categoriaText, 
              { color: colors.text },
              categoriaSeleccionada === cat && styles.categoriaTextActive
            ]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Tiendas Populares</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tiendasScroll}>
        {activeTiendas.map((tienda) => (
          <TouchableOpacity key={tienda.id} style={[styles.tiendaCard, { backgroundColor: colors.card }]}>
            <Image source={{ uri: tienda.fotoPerfil }} style={styles.tiendaImage} />
            <Text style={[styles.tiendaNombre, { color: colors.text }]}>{tienda.nombre || tienda.nombre_tienda}</Text>
            <Text style={[styles.tiendaRating, { color: colors.subtext }]}>⭐ {tienda.rating}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Productos Destacados</Text>
      <View style={styles.productosGrid}>
        {filteredProducts.map((producto) => {
          const isFavorite = (favoritos || []).includes(producto.id);
          return (
            <TouchableOpacity
              key={producto.id}
              style={[styles.productoCard, { backgroundColor: colors.card }]}
              onPress={() => router.push(`/producto/${producto.id}`)}
            >
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: producto.fotos?.[0] || 'https://picsum.photos/400/400' }} 
                  style={styles.productoImage} 
                />
                <TouchableOpacity 
                  style={styles.favoriteBtn}
                  onPress={() => toggleFavorito(producto.id)}
                >
                  <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.productoNombre, { color: colors.text }]} numberOfLines={1}>{producto.nombre}</Text>
              <Text style={[styles.productoDesc, { color: colors.subtext }]} numberOfLines={2}>{producto.descripcion}</Text>
              <Text style={[styles.productoPrecio, { color: colors.primary }]}>${producto.precio}</Text>
              <TouchableOpacity 
                style={[styles.agregarBtn, { backgroundColor: colors.primary }]} 
                onPress={(e) => {
                  e.stopPropagation();
                  addToCarrito(producto);
                }}
              >
                <Text style={styles.agregarBtnText}>Agregar</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.promoBanner} onPress={() => router.push('/promociones')}>
        <Text style={styles.promoTitle}>🎁 Promociones y Descuentos</Text>
        <Text style={styles.promoText}>Ver códigos de descuento disponibles</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  subtitle: { fontSize: 16, color: '#ffffff', opacity: 0.9 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', margin: 15, marginBottom: 10 },
  categoriasScroll: { paddingHorizontal: 10 },
  categoriaButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginHorizontal: 5, elevation: 2 },
  categoriaActive: { backgroundColor: '#FF6B35' },
  categoriaText: { fontWeight: '600' },
  categoriaTextActive: { color: '#ffffff' },
  tiendasScroll: { paddingHorizontal: 10 },
  tiendaCard: { padding: 15, borderRadius: 12, marginHorizontal: 8, alignItems: 'center', elevation: 2, width: 120 },
  tiendaImage: { width: 60, height: 60, borderRadius: 30 },
  tiendaNombre: { marginTop: 8, fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  tiendaRating: { fontSize: 12, marginTop: 4 },
  productosGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
  productoCard: { width: '47%', borderRadius: 12, margin: '1.5%', padding: 10, elevation: 2 },
  imageContainer: { position: 'relative' },
  productoImage: { width: '100%', height: 120, borderRadius: 8 },
  favoriteBtn: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 15, padding: 5 },
  favoriteIcon: { fontSize: 16 },
  productoNombre: { fontSize: 14, fontWeight: 'bold', marginTop: 8 },
  productoDesc: { fontSize: 11, marginTop: 2 },
  productoPrecio: { fontSize: 16, fontWeight: 'bold', marginTop: 5 },
  agregarBtn: { padding: 8, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  agregarBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  promoBanner: { backgroundColor: '#27ae60', margin: 15, padding: 20, borderRadius: 12 },
  promoTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  promoText: { color: '#ffffff', opacity: 0.9, marginTop: 5 },
});
