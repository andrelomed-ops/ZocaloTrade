import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, TextInput, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';

interface TiendaData {
  nombreTienda: string;
  descripcion: string;
  categoria: string;
  direccion: string;
  telefono: string;
  email: string;
  horarios: { dia: string; apertura: string; cierre: string }[];
}

export default function RegistroVendedorScreen() {
  const [step, setStep] = useState(1);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [tienda, setTienda] = useState<TiendaData>({
    nombreTienda: '',
    descripcion: '',
    categoria: '',
    direccion: '',
    telefono: '',
    email: '',
    horarios: [
      { dia: 'Lunes', apertura: '09:00', cierre: '20:00' },
      { dia: 'Martes', apertura: '09:00', cierre: '20:00' },
      { dia: 'Miércoles', apertura: '09:00', cierre: '20:00' },
      { dia: 'Jueves', apertura: '09:00', cierre: '20:00' },
      { dia: 'Viernes', apertura: '09:00', cierre: '20:00' },
      { dia: 'Sábado', apertura: '09:00', cierre: '18:00' },
      { dia: 'Domingo', apertura: '10:00', cierre: '16:00' },
    ],
  });

  const categorias = ['Comida', 'Bebidas', 'Artesanía', 'Ropa', 'Accesorios', 'Souvenirs'];

  const handleSiguiente = () => {
    if (step === 1) {
      if (!tienda.nombreTienda || !tienda.categoria) {
        Alert.alert('Error', 'Completa el nombre y categoría de tu tienda');
        return;
      }
    }
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleRegistrarse = () => {
    if (!aceptaTerminos) {
      Alert.alert('Error', 'Debes aceptar los términos y condiciones');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        '¡Bienvenido a ZocaloTrade! 🎉',
        'Tu cuenta de vendedor ha sido creada. Ahora puedes agregar productos.',
        [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
      );
    }, 1500);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Registro como Vendedor</Text>
        <Text style={styles.headerStep}>Paso {step} de 3</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>
      </View>

      {step === 1 && (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Información de tu Tienda</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre de la tienda *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Tamales Don Juan"
              value={tienda.nombreTienda}
              onChangeText={(text) => setTienda({ ...tienda, nombreTienda: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoría *</Text>
            <View style={styles.categoriasGrid}>
              {categorias.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoriaBtn, tienda.categoria === cat && styles.categoriaBtnActive]}
                  onPress={() => setTienda({ ...tienda, categoria: cat })}
                >
                  <Text style={[styles.categoriaText, tienda.categoria === cat && styles.categoriaTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe tu tienda..."
              value={tienda.descripcion}
              onChangeText={(text) => setTienda({ ...tienda, descripcion: text })}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      )}

      {step === 2 && (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Ubicación y Contacto</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dirección en el Zócalo *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Av. Principal 123, Centro"
              value={tienda.direccion}
              onChangeText={(text) => setTienda({ ...tienda, direccion: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              placeholder="55 1234 5678"
              value={tienda.telefono}
              onChangeText={(text) => setTienda({ ...tienda, telefono: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="tienda@email.com"
              value={tienda.email}
              onChangeText={(text) => setTienda({ ...tienda, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
      )}

      {step === 3 && (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Horario y Términos</Text>
          
          <Text style={styles.subLabel}>Horario de operación</Text>
          {tienda.horarios.map((horario, index) => (
            <View key={horario.dia} style={styles.horarioRow}>
              <Text style={styles.horarioDia}>{horario.dia}</Text>
              <TextInput
                style={styles.horarioInput}
                value={horario.apertura}
                onChangeText={(text) => {
                  const nuevosHorarios = [...tienda.horarios];
                  nuevosHorarios[index].apertura = text;
                  setTienda({ ...tienda, horarios: nuevosHorarios });
                }}
              />
              <Text>-</Text>
              <TextInput
                style={styles.horarioInput}
                value={horario.cierre}
                onChangeText={(text) => {
                  const nuevosHorarios = [...tienda.horarios];
                  nuevosHorarios[index].cierre = text;
                  setTienda({ ...tienda, horarios: nuevosHorarios });
                }}
              />
            </View>
          ))}

          <View style={styles.terminosSection}>
            <View style={styles.terminosBox}>
              <TouchableOpacity 
                style={styles.checkbox}
                onPress={() => setAceptaTerminos(!aceptaTerminos)}
              >
                <View style={[styles.checkboxBox, aceptaTerminos && styles.checkboxBoxActive]}>
                  {aceptaTerminos && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
              <Text style={styles.terminosText}>
                Acepto los Términos y Condiciones y la Política de Privacidad de ZocaloTrade
              </Text>
            </View>
            
            <View style={styles.comisionInfo}>
              <Text style={styles.comisionTitle}>📊 Comisiones ZocaloTrade</Text>
              <Text style={styles.comisionText}>• 10% por cada venta realizada</Text>
              <Text style={styles.comisionText}>• Sin mensualidad</Text>
              <Text style={styles.comisionText}>• Pagos seguros incluidos</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity style={styles.atrasBtn} onPress={() => setStep(step - 1)}>
            <Text style={styles.atrasBtnText}>Atrás</Text>
          </TouchableOpacity>
        )}
        
        {step < 3 ? (
          <TouchableOpacity style={styles.siguienteBtn} onPress={handleSiguiente}>
            <Text style={styles.siguienteBtnText}>Siguiente</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.registrarBtn, loading && styles.registrarBtnDisabled]}
            onPress={handleRegistrarse}
            disabled={loading}
          >
            <Text style={styles.registrarBtnText}>
              {loading ? 'Creando cuenta...' : 'Crear Cuenta de Vendedor'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#FF6B35', padding: 20, paddingTop: 40 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerStep: { color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, marginTop: 15 },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 2 },
  stepContent: { backgroundColor: '#fff', margin: 15, padding: 20, borderRadius: 12 },
  stepTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  subLabel: { fontSize: 14, fontWeight: '600', marginBottom: 15, color: '#333' },
  input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 15, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  categoriasGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  categoriaBtn: { backgroundColor: '#f0f0f0', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, margin: 5 },
  categoriaBtnActive: { backgroundColor: '#FF6B35' },
  categoriaText: { color: '#666', fontWeight: '600' },
  categoriaTextActive: { color: '#fff' },
  horarioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  horarioDia: { width: 80, fontSize: 14 },
  horarioInput: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 8, width: 60, textAlign: 'center', marginHorizontal: 5 },
  terminosSection: { marginTop: 20 },
  terminosBox: { flexDirection: 'row', alignItems: 'flex-start' },
  checkbox: { marginRight: 10, marginTop: 2 },
  checkboxBox: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  checkboxBoxActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  checkmark: { color: '#fff', fontWeight: 'bold' },
  terminosText: { flex: 1, fontSize: 13, color: '#666', lineHeight: 20 },
  comisionInfo: { backgroundColor: '#fff3cd', padding: 15, borderRadius: 10, marginTop: 20 },
  comisionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  comisionText: { color: '#856404', marginBottom: 5 },
  footer: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
  atrasBtn: { flex: 1, padding: 15, alignItems: 'center', marginRight: 10 },
  atrasBtnText: { color: '#666', fontWeight: '600', fontSize: 16 },
  siguienteBtn: { flex: 2, backgroundColor: '#FF6B35', padding: 15, borderRadius: 10, alignItems: 'center' },
  siguienteBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  registrarBtn: { flex: 1, backgroundColor: '#27ae60', padding: 15, borderRadius: 10, alignItems: 'center', marginLeft: 10 },
  registrarBtnDisabled: { backgroundColor: '#ccc' },
  registrarBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
