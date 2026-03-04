import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useStore } from '../../src/store/useStore';
import { useState } from 'react';
import { Skeleton } from '../../src/components/Skeleton';

export default function ProductoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCarrito, productos, tiendas, favoritos, toggleFavorito, colors } = useStore();
  const [cantidad, setCantidad] = useState(1);
  const [imagenActual, setImagenActual] = useState(0);
  const [imgLoading, setImgLoading] = useState(true);

  const producto = (productos || []).find(p => p.id === id);
  const tienda = (tiendas || []).find(t => t.id === producto?.tiendaId);
  const isFavorite = (favoritos || []).includes(id || '');

  if (!producto) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const handleAgregarCarrito = () => {
    addToCarrito(producto, cantidad);
    const msg = `¡${cantidad} x ${producto.nombre} agregado al carrito! 🛒`;
    if (Platform.OS === 'web') alert(msg);
    else Alert.alert('Éxito', msg);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.imageContainer}>
        {imgLoading && <Skeleton width="100%" height={350} style={{ position: 'absolute', zIndex: 1 }} />}
        <Image 
          source={{ uri: producto.fotos?.[imagenActual] || 'https://picsum.photos/400/400' }} 
          style={styles.imagen} 
          onLoad={() => setImgLoading(false)}
        />
        <View style={styles.imageDots}>
          {(producto.fotos || [1]).map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dot, imagenActual === index && { backgroundColor: colors.primary, width: 20 }]}
              onPress={() => setImagenActual(index)}
            />
          ))}
        </View>
        <TouchableOpacity 
          style={[styles.backFloat, { backgroundColor: colors.card }]} 
          onPress={() => router.back()}
        >
          <Text style={{ color: colors.text }}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.nombre, { color: colors.text }]}>{producto.nombre}</Text>
            <Text style={[styles.categoria, { color: colors.primary }]}>{producto.categoria}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.favCircle, { backgroundColor: colors.card }]}
            onPress={() => toggleFavorito(producto.id)}
          >
            <Text style={styles.favorito}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.precio, { color: colors.primary }]}>${producto.precio}</Text>

        <TouchableOpacity 
          style={[styles.tiendaCard, { backgroundColor: colors.card }]} 
          onPress={() => router.push(`/tienda/${tienda?.id}`)}
        >
          <Image source={{ uri: tienda?.fotoPerfil || 'https://picsum.photos/100/100' }} style={styles.tiendaThumb} />
          <View style={styles.tiendaInfo}>
            <Text style={[styles.tiendaLabel, { color: colors.subtext }]}>Vendedor Verificado</Text>
            <Text style={[styles.tiendaNombre, { color: colors.text }]}>{tienda?.nombre || 'Tienda Zócalo'}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>⭐ {tienda?.rating || '5.0'}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Descripción del producto</Text>
          <Text style={[styles.descripcion, { color: colors.subtext }]}>{producto.descripcion}</Text>
        </View>

        <View style={styles.footerActions}>
          <View style={[styles.cantidadContainer, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setCantidad(Math.max(1, cantidad - 1))}>
              <Text style={[styles.qtyBtnText, { color: colors.text }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.cantidadText, { color: colors.text }]}>{cantidad}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setCantidad(cantidad + 1)}>
              <Text style={[styles.qtyBtnText, { color: colors.text }]}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.agregarButton, { backgroundColor: colors.primary }]} onPress={handleAgregarCarrito}>
            <Text style={styles.agregarButtonText}>Añadir al Carrito</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imagen: { width: '100%', height: 350 },
  imageContainer: { position: 'relative' },
  imageDots: { position: 'absolute', bottom: 20, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  backFloat: { position: 'absolute', top: 50, left: 20, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  content: { padding: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  nombre: { fontSize: 24, fontWeight: 'bold' },
  categoria: { fontSize: 14, marginTop: 4, fontWeight: '600', textTransform: 'uppercase' },
  favCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  favorito: { fontSize: 22 },
  precio: { fontSize: 32, fontWeight: 'bold', marginTop: 15 },
  tiendaCard: { padding: 12, borderRadius: 15, flexDirection: 'row', alignItems: 'center', marginTop: 25, elevation: 1 },
  tiendaThumb: { width: 45, height: 45, borderRadius: 23 },
  tiendaInfo: { flex: 1, marginLeft: 12 },
  tiendaLabel: { fontSize: 10, textTransform: 'uppercase' },
  tiendaNombre: { fontSize: 15, fontWeight: 'bold' },
  ratingBadge: { backgroundColor: '#27ae60', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  section: { marginTop: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  descripcion: { fontSize: 15, lineHeight: 24 },
  footerActions: { flexDirection: 'row', marginTop: 40, marginBottom: 50, gap: 15 },
  cantidadContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 15, paddingHorizontal: 10 },
  qtyBtn: { width: 40, height: 50, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 22, fontWeight: '300' },
  cantidadText: { fontSize: 18, fontWeight: 'bold', minWidth: 30, textAlign: 'center' },
  agregarButton: { flex: 1, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  agregarButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
