import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { useStore, MOCK_TIENDAS, MOCK_PRODUCTOS, Tienda } from '../../src/store/useStore';
import { useLocalSearchParams, router } from 'expo-router';

export default function DetalleTiendaScreen() {
  const { id } = useLocalSearchParams();
  const { addToCarrito, productos, tiendas, colors } = useStore();
  
  const tienda = (tiendas.length > 0 ? tiendas : MOCK_TIENDAS).find(t => t.id === id) as Tienda | undefined;
  const productosTienda = (productos.length > 0 ? productos : MOCK_PRODUCTOS).filter(p => p.tiendaId === id);

  if (!tienda) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Tienda no encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Image source={{ uri: tienda.fotoPerfil || 'https://picsum.photos/400/400' }} style={styles.fotoPortada} />
        <View style={styles.headerOverlay}>
          <View style={[styles.perfilContainer, { backgroundColor: colors.card }]}>
            <Image source={{ uri: tienda.fotoPerfil || 'https://picsum.photos/100/100' }} style={styles.fotoPerfil} />
          </View>
        </View>
      </View>

      <View style={[styles.infoSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.tiendaNombre, { color: colors.text }]}>{tienda.nombre}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>⭐ {tienda.rating}</Text>
          <Text style={[styles.categoria, { backgroundColor: colors.background, color: colors.subtext }]}>{tienda.categoria}</Text>
        </View>
        <Text style={[styles.direccion, { color: colors.subtext }]}>📍 Zócalo, Ciudad de México</Text>
        <Text style={[styles.descripcion, { color: colors.text }]}>{tienda.descripcion}</Text>

        <View style={[styles.statsRow, { borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{productosTienda.length}</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>Productos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>4.9</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>Ventas</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.contactBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push({
            pathname: '/chat-soporte',
            params: { receptorId: tienda.id, nombreReceptor: tienda.nombre }
          })}
        >
          <Text style={styles.contactBtnText}>📱 Contactar Tienda</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.productosSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Catálogo ({productosTienda.length})</Text>
        
        {productosTienda.length > 0 ? (
          <FlatList
            data={productosTienda}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.productoCard, { backgroundColor: colors.background }]}
                onPress={() => router.push(`/producto/${item.id}`)}
              >
                <Image 
                  source={{ uri: item.fotos?.[0] || 'https://picsum.photos/400/400' }} 
                  style={styles.productoImage} 
                />
                <Text style={[styles.productoNombre, { color: colors.text }]} numberOfLines={1}>{item.nombre}</Text>
                <Text style={[styles.productoPrecio, { color: colors.primary }]}>${item.precio}</Text>
                <TouchableOpacity 
                  style={[styles.agregarBtn, { backgroundColor: colors.primary }]}
                  onPress={() => addToCarrito(item)}
                >
                  <Text style={styles.agregarBtnText}>Agregar</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={styles.emptyProductos}>
            <Text style={{ color: colors.subtext }}>No hay productos disponibles</Text>
          </View>
        )}
      </View>

      <View style={[styles.horarioSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🕐 Horario</Text>
        <View style={[styles.horarioRow, { borderColor: colors.border }]}>
          <Text style={{ color: colors.text }}>Lunes - Domingo</Text>
          <Text style={{ color: colors.subtext }}>9:00 AM - 7:00 PM</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { height: 160 },
  fotoPortada: { width: '100%', height: '100%', opacity: 0.4 },
  headerOverlay: { position: 'absolute', bottom: -30, left: 0, right: 0, alignItems: 'center' },
  perfilContainer: { width: 80, height: 80, borderRadius: 40, padding: 3, elevation: 5 },
  fotoPerfil: { width: '100%', height: '100%', borderRadius: 40 },
  infoSection: { marginTop: 40, padding: 20, alignItems: 'center' },
  tiendaNombre: { fontSize: 22, fontWeight: 'bold' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  rating: { fontSize: 16, fontWeight: 'bold', color: '#f39c12' },
  categoria: { marginLeft: 10, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontSize: 11 },
  direccion: { marginTop: 8, fontSize: 13 },
  descripcion: { textAlign: 'center', marginTop: 15, lineHeight: 20, fontSize: 14 },
  statsRow: { flexDirection: 'row', marginTop: 20, paddingTop: 15, borderTopWidth: 1, width: '100%', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 11, marginTop: 2 },
  contactBtn: { paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25, marginTop: 20 },
  contactBtnText: { color: '#fff', fontWeight: 'bold' },
  productosSection: { marginTop: 15, padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  productoCard: { width: 140, marginRight: 12, borderRadius: 12, padding: 10 },
  productoImage: { width: '100%', height: 100, borderRadius: 8 },
  productoNombre: { fontSize: 13, fontWeight: '600', marginTop: 8 },
  productoPrecio: { fontSize: 15, fontWeight: 'bold', marginTop: 4 },
  agregarBtn: { padding: 6, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  agregarBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  emptyProductos: { padding: 30, alignItems: 'center' },
  horarioSection: { marginTop: 15, padding: 15, marginBottom: 40 },
  horarioRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
});
