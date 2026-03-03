import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Switch } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Direccion {
  id: string;
  nombre: string;
  calle: string;
  numero: string;
  colonia: string;
  cp: string;
  ciudad: string;
  referencias: string;
  esPrincipal: boolean;
}

const MOCK_DIRECCIONES: Direccion[] = [
  { id: '1', nombre: 'Casa', calle: 'Av. Principal', numero: '123', colonia: 'Centro', cp: '06000', ciudad: 'Ciudad de México', referencias: 'Frente a la plaza', esPrincipal: true },
  { id: '2', nombre: 'Trabajo', calle: 'Paseo de la Reforma', numero: '500', colonia: 'Juárez', cp: '06600', ciudad: 'Ciudad de México', referencias: 'Torre empresarial', esPrincipal: false },
];

export default function DireccionesScreen() {
  const insets = useSafeAreaInsets();
  const [direcciones, setDirecciones] = useState<Direccion[]>(MOCK_DIRECCIONES);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  
  const [nombre, setNombre] = useState('');
  const [calle, setCalle] = useState('');
  const [numero, setNumero] = useState('');
  const [colonia, setColonia] = useState('');
  const [cp, setCp] = useState('');
  const [ciudad, setCiudad] = useState('Ciudad de México');
  const [referencias, setReferencias] = useState('');

  const resetForm = () => {
    setNombre('');
    setCalle('');
    setNumero('');
    setColonia('');
    setCp('');
    setCiudad('Ciudad de México');
    setReferencias('');
    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const guardarDireccion = () => {
    if (!nombre || !calle || !numero || !colonia || !cp || !ciudad) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    if (editandoId) {
      setDirecciones(prev => prev.map(d => 
        d.id === editandoId 
          ? { ...d, nombre, calle, numero, colonia, cp, ciudad, referencias }
          : d
      ));
    } else {
      const nuevaDireccion: Direccion = {
        id: Date.now().toString(),
        nombre,
        calle,
        numero,
        colonia,
        cp,
        ciudad,
        referencias,
        esPrincipal: direcciones.length === 0,
      };
      setDirecciones(prev => [...prev, nuevaDireccion]);
    }

    resetForm();
    Alert.alert('Éxito', 'Dirección guardada correctamente');
  };

  const eliminarDireccion = (id: string) => {
    Alert.alert(
      'Eliminar Dirección',
      '¿Estás seguro de eliminar esta dirección?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => {
          const nuevasDirecciones = direcciones.filter(d => d.id !== id);
          setDirecciones(nuevasDirecciones);
          Alert.alert('Dirección eliminada', 'La dirección ha sido eliminada');
        }},
      ]
    );
  };

  const establecerPrincipal = (id: string) => {
    setDirecciones(prev => prev.map(d => ({
      ...d,
      esPrincipal: d.id === id,
    })));
  };

  const editarDireccion = (direccion: Direccion) => {
    setNombre(direccion.nombre);
    setCalle(direccion.calle);
    setNumero(direccion.numero);
    setColonia(direccion.colonia);
    setCp(direccion.cp);
    setCiudad(direccion.ciudad);
    setReferencias(direccion.referencias);
    setEditandoId(direccion.id);
    setMostrarFormulario(true);
  };

  const renderDireccion = ({ item }: { item: Direccion }) => (
    <View style={styles.direccionCard}>
      <View style={styles.direccionHeader}>
        <View style={styles.direccionTitulo}>
          <Text style={styles.direccionNombre}>{item.nombre}</Text>
          {item.esPrincipal && (
            <View style={styles.principalBadge}>
              <Text style={styles.principalBadgeText}>Principal</Text>
            </View>
          )}
        </View>
        <View style={styles.direccionActions}>
          <TouchableOpacity onPress={() => editarDireccion(item)} style={styles.actionBtn}>
            <Text style={styles.actionText}>✏️ Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => eliminarDireccion(item.id)} style={[styles.actionBtn, styles.eliminarBtn]}>
            <Text style={styles.eliminarText}>🗑️ Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.direccionTexto}>{item.calle} {item.numero}</Text>
      <Text style={styles.direccionTexto}>{item.colonia}, CP {item.cp}</Text>
      <Text style={styles.direccionTexto}>{item.ciudad}</Text>
      {item.referencias && (
        <Text style={styles.direccionReferencias}>📝 {item.referencias}</Text>
      )}

      {!item.esPrincipal && (
        <TouchableOpacity 
          style={styles.principalBtn}
          onPress={() => establecerPrincipal(item.id)}
        >
          <Text style={styles.principalBtnText}>Establecer como principal</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (mostrarFormulario) {
    return (
      <View style={styles.container}>
        <View style={styles.formHeader}>
          <TouchableOpacity onPress={resetForm}>
            <Text style={styles.backBtn}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.formTitle}>
            {editandoId ? 'Editar' : 'Nueva'} Dirección
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre (Casa, Trabajo, etc.) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Casa"
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={styles.label}>Calle *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre de la calle"
                value={calle}
                onChangeText={setCalle}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>Número *</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                value={numero}
                onChangeText={setNumero}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Colonia *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre de la colonia"
              value={colonia}
              onChangeText={setColonia}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>CP *</Text>
              <TextInput
                style={styles.input}
                placeholder="06000"
                value={cp}
                onChangeText={setCp}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 2, marginLeft: 10 }]}>
              <Text style={styles.label}>Ciudad *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ciudad"
                value={ciudad}
                onChangeText={setCiudad}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Referencias (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Referencias adicionales para encontrar el lugar"
              value={referencias}
              onChangeText={setReferencias}
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity style={styles.guardarBtn} onPress={guardarDireccion}>
            <Text style={styles.guardarBtnText}>Guardar Dirección</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={direcciones}
        keyExtractor={(item) => item.id}
        renderItem={renderDireccion}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyText}>No tienes direcciones guardadas</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.floatingBtn}
        onPress={() => setMostrarFormulario(true)}
      >
        <Text style={styles.floatingBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0', paddingBottom: 80 },
  list: { padding: 15 },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 60 },
  emptyText: { fontSize: 18, color: '#666', marginTop: 15 },
  direccionCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  direccionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  direccionTitulo: { flexDirection: 'row', alignItems: 'center' },
  direccionNombre: { fontSize: 18, fontWeight: 'bold' },
  principalBadge: { backgroundColor: '#FF6B35', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginLeft: 10 },
  principalBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  direccionActions: { flexDirection: 'row', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  actionBtn: { flex: 1, padding: 8, borderRadius: 5, backgroundColor: '#f0f0f0', marginHorizontal: 4, alignItems: 'center' },
  actionText: { fontSize: 12, color: '#333' },
  eliminarBtn: { backgroundColor: '#ffebee' },
  eliminarText: { fontSize: 12, color: '#c62828' },
  direccionTexto: { color: '#333', fontSize: 14, marginTop: 3 },
  direccionReferencias: { color: '#666', fontSize: 13, marginTop: 8, fontStyle: 'italic' },
  principalBtn: { marginTop: 12, paddingVertical: 8 },
  principalBtnText: { color: '#FF6B35', fontWeight: '600' },
  floatingBtn: { position: 'absolute', bottom: 90, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  floatingBtnText: { fontSize: 30, color: '#fff', fontWeight: 'bold' },
  formHeader: { backgroundColor: '#FF6B35', padding: 20 },
  backBtn: { color: '#fff', fontSize: 16, marginBottom: 10 },
  formTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  form: { padding: 20 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 15, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  guardarBtn: { backgroundColor: '#FF6B35', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  guardarBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
