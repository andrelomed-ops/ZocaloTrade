import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { useStore, MOCK_PRODUCTOS, MOCK_TIENDAS } from '../../src/store/useStore';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ProductoDetalleScreen() {
  const { id } = useLocalSearchParams();
  const { addToCarrito, productos, tiendas } = useStore();
  const [cantidad, setCantidad] = useState(1);
  const insets = useSafeAreaInsets();

  const producto = (productos.length > 0 ? productos : MOCK_PRODUCTOS).find(p => p.id === id);
  const tienda = (tiendas.length > 0 ? tiendas : MOCK_TIENDAS).find(t => t.id === producto?.tiendaId);

  if (!producto) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Producto no encontrado</Text>
      </View>
    );
  }

  const handleAgregarCarrito = () => {
    for (let i = 0; i < cantidad; i++) {
      addToCarrito(producto);
    }
    Alert.alert('Agregado', `${producto.nombre} x${cantidad} añadido al carrito`);
  };

  const restarCantidad = () => {
    if (cantidad > 1) setCantidad(cantidad - 1);
  };

  const sumarCantidad = () => {
    setCantidad(cantidad + 1);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
          {(producto.fotos || [producto.foto]).map((foto, index) => (
            <Image 
              key={index} 
              source={{ uri: foto }} 
              style={styles.productImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        <View style={styles.content}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{producto.categoria}</Text>
          </View>

          <Text style={styles.productName}>{producto.nombre}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>${producto.precio}</Text>
            {producto.disponible ? (
              <View style={styles.disponibleBadge}>
                <Text style={styles.disponibleText}>✓ Disponible</Text>
              </View>
            ) : (
              <View style={styles.noDisponibleBadge}>
                <Text style={styles.noDisponibleText}>Agotado</Text>
              </View>
            )}
          </View>

          <View style={styles.tiendaInfo}>
            <Image 
              source={{ uri: tienda?.fotoPerfil }} 
              style={styles.tiendaImage}
            />
            <View>
              <Text style={styles.tiendaLabel}>Vendido por</Text>
              <Text style={styles.tiendaName}>{tienda?.nombre}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{producto.descripcion}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Información del vendedor</Text>
          <View style={styles.vendedorCard}>
            <Text style={styles.vendedorName}>{tienda?.nombre}</Text>
            <Text style={styles.vendedorDesc}>{tienda?.descripcion}</Text>
            <Text style={styles.vendedorDireccion}>📍 {tienda?.direccion}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.rating}>⭐ {tienda?.rating}</Text>
              <Text style={styles.ratingText}>rating del vendedor</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.cantidadRow}>
          <Text style={styles.cantidadLabel}>Cantidad:</Text>
          <View style={styles.cantidadControls}>
            <TouchableOpacity style={styles.cantidadBtn} onPress={restarCantidad}>
              <Text style={styles.cantidadBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.cantidadValue}>{cantidad}</Text>
            <TouchableOpacity style={styles.cantidadBtn} onPress={sumarCantidad}>
              <Text style={styles.cantidadBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.agregarBtn, !producto.disponible && styles.agregarBtnDisabled]}
          onPress={handleAgregarCarrito}
          disabled={!producto.disponible}
        >
          <Text style={styles.agregarBtnText}>
            Agregar al Carrito - ${(producto.precio * cantidad).toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { fontSize: 18, color: '#666' },
  imageContainer: { height: 350 },
  productImage: { width, height: 350 },
  content: { padding: 20, backgroundColor: '#fff', marginTop: -20, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginBottom: 10 },
  categoryText: { color: '#666', fontSize: 12, fontWeight: '600' },
  productName: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  price: { fontSize: 28, fontWeight: 'bold', color: '#FF6B35' },
  disponibleBadge: { backgroundColor: '#d4edda', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  disponibleText: { color: '#155724', fontSize: 12, fontWeight: '600' },
  noDisponibleBadge: { backgroundColor: '#f8d7da', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  noDisponibleText: { color: '#721c24', fontSize: 12, fontWeight: '600' },
  tiendaInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  tiendaImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  tiendaLabel: { fontSize: 12, color: '#666' },
  tiendaName: { fontSize: 16, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 15, color: '#444', lineHeight: 22 },
  vendedorCard: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 12 },
  vendedorName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  vendedorDesc: { color: '#666', marginBottom: 8 },
  vendedorDireccion: { color: '#666', marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  rating: { fontSize: 16, fontWeight: 'bold', marginRight: 5 },
  ratingText: { color: '#999', fontSize: 12 },
  bottomBar: { backgroundColor: '#fff', padding: 20, paddingBottom: Math.max(20, insets.bottom + 10), borderTopWidth: 1, borderColor: '#eee', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cantidadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  cantidadLabel: { fontSize: 16, fontWeight: '600' },
  cantidadControls: { flexDirection: 'row', alignItems: 'center' },
  cantidadBtn: { width: 40, height: 40, backgroundColor: '#f0f0f0', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  cantidadBtnText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  cantidadValue: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 20 },
  agregarBtn: { backgroundColor: '#FF6B35', padding: 18, borderRadius: 12, alignItems: 'center' },
  agregarBtnDisabled: { backgroundColor: '#ccc' },
  agregarBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
