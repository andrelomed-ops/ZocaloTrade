import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useStore, MOCK_PRODUCTOS, MOCK_TIENDAS } from '../src/store/useStore';

const CATEGORIAS = ['Todos', 'Comida', 'Bebidas', 'Artesanía', 'Ropa', 'Accesorios'];
const UBICACIONES = ['Zócalo', 'Centro Histórico', 'Alameda', 'Reforma', 'Santo Domingo'];
const ORDENAR_POR = [
  { id: 'relevancia', label: 'Relevancia' },
  { id: 'precio_asc', label: 'Precio: Menor a Mayor' },
  { id: 'precio_desc', label: 'Precio: Mayor a Menor' },
  { id: 'rating', label: 'Mejor Rating' },
  { id: 'nuevos', label: 'Más Recientes' },
];

export default function BusquedaAvanzadaScreen() {
  const { productos, tiendas } = useStore();
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [ubicacion, setUbicacion] = useState('');
  const [rangoPrecio, setRangoPrecio] = useState([0, 1000]);
  const [ordenarPor, setOrdenarPor] = useState('relevancia');
  const [soloDisponibles, setSoloDisponibles] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const productosMostrar = productos.length > 0 ? productos : MOCK_PRODUCTOS;

  const resultados = productosMostrar.filter(p => {
    const matchBusqueda = busqueda === '' || 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = categoria === 'Todos' || p.categoria === categoria;
    const matchPrecio = p.precio >= rangoPrecio[0] && p.precio <= rangoPrecio[1];
    const matchDisponible = !soloDisponibles || p.disponible;
    return matchBusqueda && matchCategoria && matchPrecio && matchDisponible;
  });

  const sorted = [...resultados].sort((a, b) => {
    switch (ordenarPor) {
      case 'precio_asc': return a.precio - b.precio;
      case 'precio_desc': return b.precio - a.precio;
      case 'rating': return 0;
      case 'nuevos': return b.id.localeCompare(a.id);
      default: return 0;
    }
  });

  const limpiarFiltros = () => {
    setBusqueda('');
    setCategoria('Todos');
    setUbicacion('');
    setRangoPrecio([0, 1000]);
    setOrdenarPor('relevancia');
    setSoloDisponibles(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔍 Búsqueda Avanzada</Text>
        
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos, tiendas..."
            value={busqueda}
            onChangeText={setBusqueda}
          />
          <TouchableOpacity 
            style={[styles.filterToggle, mostrarFiltros && styles.filterToggleActive]}
            onPress={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <Text style={styles.filterToggleText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {mostrarFiltros && (
        <ScrollView style={styles.filtrosContainer}>
          <Text style={styles.sectionTitle}>Categoría</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {CATEGORIAS.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, categoria === cat && styles.chipActive]}
                onPress={() => setCategoria(cat)}
              >
                <Text style={[styles.chipText, categoria === cat && styles.chipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Ubicación</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {UBICACIONES.map(ubi => (
              <TouchableOpacity
                key={ubi}
                style={[styles.chip, ubicacion === ubi && styles.chipActive]}
                onPress={() => setUbicacion(ubicacion === ubi ? '' : ubi)}
              >
                <Text style={[styles.chipText, ubicacion === ubi && styles.chipTextActive]}>{ubi}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Rango de Precio</Text>
          <View style={styles.precioRange}>
            <Text style={styles.precioText}>${rangoPrecio[0]} - ${rangoPrecio[1]}</Text>
            <View style={styles.precioSlider}>
              <TouchableOpacity 
                style={[styles.precioBtn, rangoPrecio[0] > 0 && styles.precioBtnActive]}
                onPress={() => setRangoPrecio([0, rangoPrecio[1]])}
              >
                <Text style={styles.precioBtnText}>$0</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.precioBtn, rangoPrecio[1] < 1000 && styles.precioBtnActive]}
                onPress={() => setRangoPrecio([rangoPrecio[0], 500])}
              >
                <Text style={styles.precioBtnText}>$500</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.precioBtn, rangoPrecio[1] === 1000 && styles.precioBtnActive]}
                onPress={() => setRangoPrecio([rangoPrecio[0], 1000])}
              >
                <Text style={styles.precioBtnText}>$1000+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Ordenar por</Text>
          <View style={styles.ordenarGrid}>
            {ORDENAR_POR.map(op => (
              <TouchableOpacity
                key={op.id}
                style={[styles.ordenarBtn, ordenarPor === op.id && styles.ordenarBtnActive]}
                onPress={() => setOrdenarPor(op.id)}
              >
                <Text style={[styles.ordenarText, ordenarPor === op.id && styles.ordenarTextActive]}>{op.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.checkbox}
            onPress={() => setSoloDisponibles(!soloDisponibles)}
          >
            <View style={[styles.checkboxBox, soloDisponibles && styles.checkboxBoxActive]}>
              {soloDisponibles && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Solo productos disponibles</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.limpiarBtn} onPress={limpiarFiltros}>
            <Text style={styles.limpiarBtnText}>Limpiar Filtros</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <View style={styles.resultadosHeader}>
        <Text style={styles.resultadosCount}>{sorted.length} resultados</Text>
        {busqueda && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Text style={styles.clearSearch}>Limpiar búsqueda</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
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
            <Text style={styles.productoCategoria}>{item.categoria}</Text>
            <Text style={styles.productoPrecio}>${item.precio}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptyText}>Intenta con otros filtros</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#FF6B35', padding: 20, paddingTop: 40 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  searchBox: { flexDirection: 'row' },
  searchInput: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 16 },
  filterToggle: { backgroundColor: 'rgba(255,255,255,0.3)', padding: 12, borderRadius: 10, marginLeft: 10 },
  filterToggleActive: { backgroundColor: '#fff' },
  filterToggleText: { fontSize: 18 },
  filtrosContainer: { backgroundColor: '#fff', padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  chipsScroll: { marginBottom: 10 },
  chip: { backgroundColor: '#f0f0f0', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  chipActive: { backgroundColor: '#FF6B35' },
  chipText: { color: '#666' },
  chipTextActive: { color: '#fff' },
  precioRange: { marginBottom: 15 },
  precioText: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  precioSlider: { flexDirection: 'row', justifyContent: 'space-around' },
  precioBtn: { paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#f0f0f0', borderRadius: 15 },
  precioBtnActive: { backgroundColor: '#FF6B35' },
  precioBtnText: { fontWeight: '600' },
  ordenarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  ordenarBtn: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15, margin: 3 },
  ordenarBtnActive: { backgroundColor: '#FF6B35' },
  ordenarText: { fontSize: 13, color: '#666' },
  ordenarTextActive: { color: '#fff' },
  checkbox: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  checkboxBox: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: '#ccc', marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxBoxActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  checkmark: { color: '#fff', fontWeight: 'bold' },
  checkboxLabel: { fontSize: 15 },
  limpiarBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#FF6B35', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 20, marginBottom: 10 },
  limpiarBtnText: { color: '#FF6B35', fontWeight: 'bold' },
  resultadosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff' },
  resultadosCount: { fontWeight: 'bold', fontSize: 16 },
  clearSearch: { color: '#FF6B35', fontWeight: '600' },
  list: { padding: 10 },
  productoCard: { flex: 1, backgroundColor: '#fff', margin: 5, padding: 10, borderRadius: 12, alignItems: 'center', elevation: 1 },
  productoImage: { width: '100%', height: 100, borderRadius: 8 },
  productoNombre: { fontSize: 14, fontWeight: 'bold', marginTop: 8 },
  productoCategoria: { fontSize: 11, color: '#666' },
  productoPrecio: { fontSize: 16, fontWeight: 'bold', color: '#FF6B35', marginTop: 4 },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 60 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 15 },
  emptyText: { color: '#666', marginTop: 5 },
});
