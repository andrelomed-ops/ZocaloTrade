import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, RefreshControl, Platform, Animated } from 'react-native';
import { router } from 'expo-router';
import { CATEGORIAS, MOCK_PRODUCTOS, MOCK_TIENDAS } from '../../src/store/useStore';
import { useStore } from '../../src/store/useStore';
import { useState, useCallback, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Skeleton } from '../../src/components/Skeleton';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const { addToCarrito, favoritos, toggleFavorito, productos, tiendas, colors, initialize, initialized } = useStore();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [refreshing, setRefreshing] = useState(false);
  
  // Animación para el header
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await initialize();
    setRefreshing(false);
  }, [initialize]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return (R * c).toFixed(1);
  };

  const filteredProducts = (categoriaSeleccionada === 'Todos' 
    ? (productos || []) 
    : (productos || []).filter(p => p.categoria === categoriaSeleccionada)).slice(0, 10);

  const activeTiendas = (tiendas || []).length > 0 ? tiendas : MOCK_TIENDAS;

  const renderSkeletons = () => (
    <View style={styles.productosGrid}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={[styles.productoCard, { backgroundColor: colors.card }]}>
          <Skeleton width="100%" height={120} />
          <Skeleton width="80%" height={15} style={{ marginTop: 10 }} />
          <Skeleton width="40%" height={20} style={{ marginTop: 10 }} />
          <Skeleton width="100%" height={35} style={{ marginTop: 10 }} />
        </View>
      ))}
    </View>
  );

  return (
    <Animated.ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      <Animated.View style={[styles.header, { backgroundColor: colors.primary, opacity: headerOpacity }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.title}>ZocaloTrade</Text>
            <Text style={styles.subtitle}>{t('tu_marketplace')}</Text>
          </View>
          <TouchableOpacity 
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 20 }}
            onPress={() => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{i18n.language === 'es' ? '🇺🇸 EN' : '🇲🇽 ES'}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('categorias')}</Text>
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
        {!initialized ? (
          [1, 2, 3].map(i => <Skeleton key={i} width={120} height={130} style={{ marginHorizontal: 8, borderRadius: 12 }} />)
        ) : (
          activeTiendas.map((tienda: any) => {
            return (
              <TouchableOpacity 
                key={tienda.id} 
                style={[styles.tiendaCard, { backgroundColor: colors.card }]}
                onPress={() => router.push(`/tienda/${tienda.id}`)}
              >
                <Image source={{ uri: tienda.fotoPerfil || 'https://picsum.photos/100/100' }} style={styles.tiendaImage} />
                <Text style={[styles.tiendaNombre, { color: colors.text }]} numberOfLines={1}>{tienda.nombre || tienda.nombre_tienda}</Text>
                <Text style={[styles.tiendaRating, { color: colors.subtext }]}>
                  ⭐ {tienda.rating}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Productos Destacados</Text>
      {!initialized ? renderSkeletons() : (
        <View style={styles.productosGrid}>
          {(filteredProducts.length > 0 ? filteredProducts : MOCK_PRODUCTOS).map((producto) => {
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
      )}

      <TouchableOpacity style={[styles.promoBanner, { marginBottom: 30 }]} onPress={() => router.push('/promociones')}>
        <Text style={styles.promoTitle}>🎁 Promociones y Descuentos</Text>
        <Text style={styles.promoText}>Ver códigos de descuento disponibles</Text>
      </TouchableOpacity>
    </Animated.ScrollView>
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
