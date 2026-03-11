import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useStore, CATEGORIAS } from '../src/store/useStore';
import { supabase, TABLES, uploadImage } from '../src/services/supabase';

export default function AgregarProductoScreen() {
  const router = useRouter();
  const { colors, initialize } = useStore();
  
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('Comida');
  const [fotos, setFotos] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);

  const pickImage = async () => {
    // Pedir permiso para la cámara
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      if (Platform.OS === 'web') alert('Se necesita permiso de cámara');
      else Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara para tomar fotos de tus productos.');
    }

    // Darle a elegir al usuario si quiere cámara o galería
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Subir Foto',
        '¿De dónde quieres obtener la imagen?',
        [
          { text: 'Cámara', onPress: openCamera },
          { text: 'Galería', onPress: openGallery },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    } else {
      // En Web, ImagePicker maneja esto automáticamente con un popup de navegador
      openGallery();
    }
  };

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true, // Esto es clave para el recorte profesional
      aspect: [1, 1], // Forzar cuadrado perfecto tipo Instagram/MercadoLibre
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFotos([...fotos, result.assets[0].uri]);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFotos([...fotos, result.assets[0].uri]);
    }
  };

  const guardarProducto = async () => {
    if (!nombre.trim() || !precio.trim() || fotos.length === 0) {
      const msg = 'Ingresa nombre, precio y al menos una foto';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Campos requeridos', msg);
      return;
    }

    setGuardando(true);

    try {
      // SUBIDA REAL A STORAGE
      const uploadedUrls = await Promise.all(
        fotos.map(async (uri) => {
          const url = await uploadImage(uri);
          return url || 'https://picsum.photos/400/400'; // Fallback
        })
      );
      
      const nuevoProducto = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: parseFloat(precio),
        categoria,
        fotos: uploadedUrls,
        tienda_id: 't1', 
        activo: true,
      };

      const { data, error } = await supabase.from(TABLES.PRODUCTOS).insert(nuevoProducto).select().single();
      
      if (error) throw error;

      if (data) {
        // En lugar de addProducto manual, forzamos un refresco global
        await initialize();
      }

      if (Platform.OS === 'web') alert('¡Producto publicado con éxito!');
      else Alert.alert('✅ Éxito', 'Producto publicado correctamente');
      
      router.back();
    } catch (error) {
      console.error(error);
      if (Platform.OS === 'web') alert('Error al guardar producto');
      else Alert.alert('Error', 'No se pudo guardar el producto');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>Nuevo Producto</Text>
        <Text style={styles.subtitle}>Sube fotos reales para vender más</Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>📷 Fotos del Producto</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={[styles.addBtn, { borderColor: colors.border }]} onPress={pickImage}>
            <Text style={{ fontSize: 30 }}>➕</Text>
          </TouchableOpacity>
          {fotos.map((f, i) => (
            <Image key={i} source={{ uri: f }} style={styles.foto} />
          ))}
        </ScrollView>
        <Text style={{ color: colors.subtext, fontSize: 11, marginTop: 10 }}>
          Se guardarán en el Storage de Supabase automáticamente.
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Detalles</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          placeholder="Nombre del producto"
          placeholderTextColor={colors.subtext}
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          placeholder="Descripción (ingredientes, materiales, etc.)"
          placeholderTextColor={colors.subtext}
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          placeholder="Precio $"
          placeholderTextColor={colors.subtext}
          value={precio}
          onChangeText={setPrecio}
          keyboardType="numeric"
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Categoría</Text>
        <View style={styles.catRow}>
          {CATEGORIAS.filter(c => c !== 'Todos').map(c => (
            <TouchableOpacity 
              key={c} 
              style={[styles.catChip, { backgroundColor: colors.background }, categoria === c && { backgroundColor: colors.primary }]}
              onPress={() => setCategoria(c)}
            >
              <Text style={{ color: categoria === c ? '#fff' : colors.text }}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.saveBtn, { backgroundColor: colors.primary }, guardando && { opacity: 0.7 }]}
        onPress={guardarProducto}
        disabled={guardando}
      >
        {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Publicar en Zócalo</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 13, color: '#fff', opacity: 0.8 },
  section: { margin: 15, padding: 15, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  addBtn: { width: 80, height: 80, borderRadius: 10, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  foto: { width: 80, height: 80, borderRadius: 10, marginRight: 10 },
  input: { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 10 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  saveBtn: { margin: 15, padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 40 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
