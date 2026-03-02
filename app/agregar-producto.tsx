import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useStore } from '../src/store/useStore';
import { generarDescripcionProducto } from '../src/services/aiService';
import { uploadImage, TABLES, TIENDAS_IDS } from '../src/services/supabase';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../src/services/supabase';

export default function AgregarProductoScreen() {
  const { addProducto, rol, user } = useStore();
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('Comida');
  const [fotos, setFotos] = useState<string[]>([]);
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  const CATEGORIAS = ['Comida', 'Bebidas', 'Artesanía', 'Ropa', 'Accesorios'];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFotos([...fotos, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitas dar permiso para usar la cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFotos([...fotos, result.assets[0].uri]);
    }
  };

  const generarDescripcion = async () => {
    if (!nombre) {
      Alert.alert('Error', 'Ingresa el nombre del producto');
      return;
    }

    setLoading(true);
    try {
      const desc = await generarDescripcionProducto(nombre, categoria);
      setDescripcion(desc);
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar la descripción');
    } finally {
      setLoading(false);
    }
  };

  const guardarProducto = async () => {
    if (!nombre || !precio || fotos.length === 0) {
      Alert.alert('Error', 'Completa todos los campos y agrega al menos una foto');
      return;
    }

    setLoading(true);
    try {
      // Subir fotos a Supabase
      const fotosUrls: string[] = [];
      for (const foto of fotos) {
        const url = await uploadImage(foto, 'productos');
        if (url) {
          fotosUrls.push(url);
        }
      }

      // Guardar en Supabase
      const { data, error } = await supabase.from(TABLES.PRODUCTOS).insert({
        nombre,
        descripcion: descripcion || `Producto de ${categoria}`,
        precio: parseFloat(precio),
        categoria,
        fotos: fotosUrls,
        tienda_id: TIENDAS_IDS.ARTESANIAS, // Por defecto
        stock: 10,
        activo: true,
        envio_incluido: false,
      }).select();

      if (error) throw error;

      const nuevoProducto = {
        id: data?.[0]?.id || Date.now().toString(),
        nombre,
        descripcion: descripcion || `Producto de ${categoria}`,
        precio: parseFloat(precio),
        categoria,
        fotos: fotosUrls,
        tiendaId: TIENDAS_IDS.ARTESANIAS,
        disponible: true,
      };

      addProducto(nuevoProducto);
      Alert.alert('¡Éxito!', 'Producto agregado correctamente');
      
      setNombre('');
      setPrecio('');
      setDescripcion('');
      setFotos([]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  if (rol !== 'vendedor') {
    return (
      <View style={styles.container}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.warningTitle}>Modo Vendedor Requerido</Text>
        <Text style={styles.warningText}>Activa el modo vendedor en tu perfil para agregar productos</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Agregar Nuevo Producto</Text>

      <View style={styles.fotosSection}>
        <Text style={styles.label}>Fotos del Producto</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fotosScroll}>
          {fotos.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.fotoPreview} />
          ))}
          <TouchableOpacity style={styles.addFotoBtn} onPress={pickImage}>
            <Text style={styles.addFotoIcon}>📷</Text>
            <Text style={styles.addFotoText}>Galería</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addFotoBtn} onPress={takePhoto}>
            <Text style={styles.addFotoIcon}>📸</Text>
            <Text style={styles.addFotoText}>Cámara</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nombre del Producto</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Tamales de Mole"
          value={nombre}
          onChangeText={setNombre}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Precio ($)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          keyboardType="numeric"
          value={precio}
          onChangeText={setPrecio}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Categoría</Text>
        <View style={styles.categoriasRow}>
          {CATEGORIAS.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoriaBtn, categoria === cat && styles.categoriaActive]}
              onPress={() => setCategoria(cat)}
            >
              <Text style={[styles.categoriaText, categoria === cat && styles.categoriaTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.descHeader}>
          <Text style={styles.label}>Descripción</Text>
          <TouchableOpacity onPress={generarDescripcion} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#FF6B35" />
            ) : (
              <Text style={styles.aiBtn}>✨ Generar con IA</Text>
            )}
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.input, styles.descInput]}
          placeholder="Describe tu producto..."
          multiline
          numberOfLines={4}
          value={descripcion}
          onChangeText={setDescripcion}
        />
      </View>

      <TouchableOpacity style={styles.guardarBtn} onPress={guardarProducto}>
        <Text style={styles.guardarBtnText}>Guardar Producto</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  warningContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  warningIcon: { fontSize: 60 },
  warningTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  warningText: { color: '#666', marginTop: 10, textAlign: 'center', padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 15, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  descInput: { height: 100, textAlignVertical: 'top' },
  fotosSection: { marginBottom: 20 },
  fotosScroll: { flexDirection: 'row' },
  fotoPreview: { width: 100, height: 100, borderRadius: 10, marginRight: 10 },
  addFotoBtn: { width: 100, height: 100, borderRadius: 10, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#ddd', borderStyle: 'dashed', marginRight: 10 },
  addFotoIcon: { fontSize: 30 },
  addFotoText: { fontSize: 12, color: '#666', marginTop: 5 },
  categoriasRow: { flexDirection: 'row', flexWrap: 'wrap' },
  categoriaBtn: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  categoriaActive: { backgroundColor: '#FF6B35' },
  categoriaText: { color: '#666' },
  categoriaTextActive: { color: '#fff' },
  descHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  aiBtn: { color: '#FF6B35', fontWeight: '600' },
  guardarBtn: { backgroundColor: '#FF6B35', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  guardarBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
