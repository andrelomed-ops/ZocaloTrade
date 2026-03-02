import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { CATEGORIAS, MOCK_PRODUCTOS, MOCK_TIENDAS } from '../../src/store/useStore';
import { useStore } from '../../src/store/useStore';
import { useState } from 'react';

export default function HomeScreen() {
  const { addToCarrito } = useStore();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');

  const productosFiltrados = categoriaSeleccionada === 'Todos' 
    ? MOCK_PRODUCTOS
    : MOCK_PRODUCTOS.filter(p => p.categoria === categoriaSeleccionada);

  const tiendasMostrar = MOCK_TIENDAS;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ZocaloTrade</Text>
        <Text style={styles.subtitle}>Tu marketplace del Zócalo</Text>
      </View>

      <Text style={styles.sectionTitle}>Categorías</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasScroll}>
        {CATEGORIAS.map((cat) => (
          <TouchableOpacity 
            key={cat} 
            style={[styles.categoriaButton, categoriaSeleccionada === cat && styles.categoriaActive]}
            onPress={() => setCategoriaSeleccionada(cat)}
          >
            <Text style={[styles.categoriaText, categoriaSeleccionada === cat && styles.categoriaTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Tiendas Populares</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tiendasScroll}>
        {tiendasMostrar.map((tienda) => (
          <TouchableOpacity key={tienda.id} style={styles.tiendaCard}>
            <Image source={{ uri: tienda.fotoPerfil }} style={styles.tiendaImage} />
            <Text style={styles.tiendaNombre}>{tienda.nombre}</Text>
            <Text style={styles.tiendaRating}>⭐ {tienda.rating}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Productos Destacados</Text>
      <View style={styles.productosGrid}>
        {productosFiltrados.slice(0, 6).map((producto) => (
          <TouchableOpacity
            key={producto.id}
            style={styles.productoCard}
            onPress={() => router.push(`/producto/${producto.id}`)}
          >
            <Image 
              source={{ uri: producto.fotos?.[0] || producto.foto }} 
              style={styles.productoImage} 
            />
            <Text style={styles.productoNombre} numberOfLines={1}>{producto.nombre}</Text>
            <Text style={styles.productoDesc} numberOfLines={2}>{producto.descripcion}</Text>
            <Text style={styles.productoPrecio}>${producto.precio}</Text>
            <TouchableOpacity 
              style={styles.agregarBtn} 
              onPress={(e) => {
                e.stopPropagation();
                addToCarrito(producto);
              }}
            >
              <Text style={styles.agregarBtnText}>Agregar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.promoBanner} onPress={() => router.push('/promociones')}>
        <Text style={styles.promoTitle}>🎁 Promociones y Descuentos</Text>
        <Text style={styles.promoText}>Ver códigos de descuento disponibles</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  header: { backgroundColor: '#FF6B35', padding: 20, paddingTop: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  subtitle: { fontSize: 16, color: '#ffffff', opacity: 0.9 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', margin: 15, marginBottom: 10, color: '#333' },
  categoriasScroll: { paddingHorizontal: 10 },
  categoriaButton: { backgroundColor: '#ffffff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginHorizontal: 5, elevation: 2 },
  categoriaActive: { backgroundColor: '#FF6B35' },
  categoriaText: { color: '#333', fontWeight: '600' },
  categoriaTextActive: { color: '#ffffff' },
  tiendasScroll: { paddingHorizontal: 10 },
  tiendaCard: { backgroundColor: '#ffffff', padding: 15, borderRadius: 12, marginHorizontal: 8, alignItems: 'center', elevation: 2, width: 120 },
  tiendaImage: { width: 60, height: 60, borderRadius: 30 },
  tiendaNombre: { marginTop: 8, fontWeight: 'bold', fontSize: 13, textAlign: 'center', color: '#333' },
  tiendaRating: { color: '#666', fontSize: 12, marginTop: 4 },
  productosGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
  productoCard: { width: '47%', backgroundColor: '#ffffff', borderRadius: 12, margin: '1.5%', padding: 10, elevation: 2 },
  productoImage: { width: '100%', height: 120, borderRadius: 8 },
  productoNombre: { fontSize: 14, fontWeight: 'bold', marginTop: 8, color: '#333' },
  productoDesc: { fontSize: 11, color: '#666', marginTop: 2 },
  productoPrecio: { fontSize: 16, fontWeight: 'bold', color: '#FF6B35', marginTop: 5 },
  agregarBtn: { backgroundColor: '#FF6B35', padding: 8, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  agregarBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  promoBanner: { backgroundColor: '#27ae60', margin: 15, padding: 20, borderRadius: 12 },
  promoTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  promoText: { color: '#ffffff', opacity: 0.9, marginTop: 5 },
});
