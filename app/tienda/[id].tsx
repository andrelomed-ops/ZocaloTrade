import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { useStore, MOCK_TIENDAS, MOCK_PRODUCTOS, Tienda } from '../../src/store/useStore';
import { useLocalSearchParams, router } from 'expo-router';

export default function DetalleTiendaScreen() {
  const { id } = useLocalSearchParams();
  const { addToCarrito, productos, tiendas } = useStore();
  
  const tienda = (tiendas.length > 0 ? tiendas : MOCK_TIENDAS).find(t => t.id === id) as Tienda | undefined;
  const productosTienda = (productos.length > 0 ? productos : MOCK_PRODUCTOS).filter(p => p.tiendaId === id);

  if (!tienda) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Tienda no encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: tienda.fotoPerfil }} style={styles.fotoPortada} />
        <View style={styles.headerOverlay}>
          <View style={styles.perfilContainer}>
            <Image source={{ uri: tienda.fotoPerfil }} style={styles.fotoPerfil} />
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.tiendaNombre}>{tienda.nombre}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>⭐ {tienda.rating}</Text>
          <Text style={styles.categoria}>{tienda.categoria}</Text>
        </View>
        <Text style={styles.direccion}>📍 Entregas en todo el Zócalo, CDMX</Text>
        <Text style={styles.descripcion}>{tienda.descripcion}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{productosTienda.length}</Text>
            <Text style={styles.statLabel}>Productos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>🚚</Text>
            <Text style={styles.statLabel}>Envíos</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.contactBtn}>
          <Text style={styles.contactBtnText}>📱 Contactar Tienda</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.productosSection}>
        <Text style={styles.sectionTitle}>Productos de la tienda ({productosTienda.length})</Text>
        
        {productosTienda.length > 0 ? (
          <FlatList
            data={productosTienda}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productosList}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.productoCard}
                onPress={() => router.push(`/producto/${item.id}`)}
              >
                <Image 
                  source={{ uri: item.fotos?.[0] || item.foto }} 
                  style={styles.productoImage} 
                />
                <Text style={styles.productoNombre} numberOfLines={1}>{item.nombre}</Text>
                <Text style={styles.productoPrecio}>${item.precio}</Text>
                <TouchableOpacity 
                  style={styles.agregarBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    addToCarrito(item);
                  }}
                >
                  <Text style={styles.agregarBtnText}>Agregar</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={styles.emptyProductos}>
            <Text style={styles.emptyText}>Esta tienda no tiene productos aún</Text>
          </View>
        )}
      </View>

      <View style={styles.horarioSection}>
        <Text style={styles.sectionTitle}>🕐 Horario</Text>
        <View style={styles.horarioRow}>
          <Text style={styles.horarioDia}>Lunes - Viernes</Text>
          <Text style={styles.horarioHora}>9:00 AM - 8:00 PM</Text>
        </View>
        <View style={styles.horarioRow}>
          <Text style={styles.horarioDia}>Sábado</Text>
          <Text style={styles.horarioHora}>9:00 AM - 6:00 PM</Text>
        </View>
        <View style={styles.horarioRow}>
          <Text style={styles.horarioDia}>Domingo</Text>
          <Text style={styles.horarioHora}>10:00 AM - 4:00 PM</Text>
        </View>
      </View>

      <View style={styles.politicasSection}>
        <Text style={styles.sectionTitle}>📋 Políticas</Text>
        <Text style={styles.politicaText}>• Los pedidos se preparan en 15-30 minutos</Text>
        <Text style={styles.politicaText}>• Cancelaciones con 5 min de tolerancia</Text>
        <Text style={styles.politicaText}>• Devoluciones solo por defectos</Text>
        <Text style={styles.politicaText}>• Aceptamos efectivo y transferencias</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { fontSize: 18, color: '#666' },
  header: { height: 180, backgroundColor: '#FF6B35' },
  fotoPortada: { width: '100%', height: '100%', opacity: 0.3 },
  headerOverlay: { position: 'absolute', bottom: -40, left: 0, right: 0, alignItems: 'center' },
  perfilContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#fff', padding: 3, elevation: 5 },
  fotoPerfil: { width: '100%', height: '100%', borderRadius: 45 },
  infoSection: { marginTop: 50, padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  tiendaNombre: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  rating: { fontSize: 18, fontWeight: 'bold', color: '#f39c12' },
  categoria: { marginLeft: 10, backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontSize: 12, color: '#666' },
  direccion: { color: '#666', marginTop: 10 },
  descripcion: { color: '#444', textAlign: 'center', marginTop: 10, lineHeight: 20 },
  statsRow: { flexDirection: 'row', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderColor: '#eee', width: '100%', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#FF6B35' },
  statLabel: { color: '#666', fontSize: 12, marginTop: 4 },
  contactBtn: { backgroundColor: '#FF6B35', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25, marginTop: 20 },
  contactBtnText: { color: '#fff', fontWeight: 'bold' },
  productosSection: { marginTop: 15, backgroundColor: '#fff', padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  productosList: { paddingVertical: 5 },
  productoCard: { width: 140, marginRight: 12, backgroundColor: '#f8f8f8', borderRadius: 12, padding: 10 },
  productoImage: { width: '100%', height: 100, borderRadius: 8 },
  productoNombre: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  productoPrecio: { fontSize: 16, fontWeight: 'bold', color: '#FF6B35', marginTop: 4 },
  agregarBtn: { backgroundColor: '#FF6B35', padding: 8, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  agregarBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  emptyProductos: { padding: 30, alignItems: 'center' },
  emptyText: { color: '#666' },
  horarioSection: { marginTop: 15, backgroundColor: '#fff', padding: 15 },
  horarioRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
  horarioDia: { color: '#333', fontWeight: '600' },
  horarioHora: { color: '#666' },
  politicasSection: { marginTop: 15, marginBottom: 30, backgroundColor: '#fff', padding: 15 },
  politicaText: { color: '#666', marginBottom: 8, lineHeight: 22 },
});
