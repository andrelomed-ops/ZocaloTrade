import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';

export default function EditarPerfilScreen() {
  const [nombre, setNombre] = useState('Usuario');
  const [email, setEmail] = useState('usuario@zocalotrade.com');
  const [telefono, setTelefono] = useState('55 1234 5678');
  const [guardando, setGuardando] = useState(false);

  const handleGuardar = () => {
    if (!nombre.trim() || !email.trim()) {
      Alert.alert('Error', 'Por favor completa los campos requeridos');
      return;
    }

    setGuardando(true);
    
    setTimeout(() => {
      setGuardando(false);
      Alert.alert('¡Perfil actualizado!', 'Tus cambios han sido guardados', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }, 1000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={styles.editAvatar}>
            <Text style={styles.editAvatarText}>✏️</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.changePhoto}>Cambiar foto</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre completo *</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Tu nombre"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo electrónico *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="55 1234 5678"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seguridad</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Cambiar contraseña</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Autenticación de dos factores</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Sesiones activas</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacidad</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Datos personales</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Descargar mis datos</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Eliminar cuenta</Text>
          <Text style={[styles.menuArrow, { color: '#ff4444' }]}>→</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.guardarBtn, guardando && styles.guardarBtnDisabled]}
        onPress={handleGuardar}
        disabled={guardando}
      >
        <Text style={styles.guardarBtnText}>
          {guardando ? 'Guardando...' : 'Guardar Cambios'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#FF6B35', padding: 30, alignItems: 'center' },
  avatarContainer: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 50 },
  editAvatar: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  editAvatarText: { fontSize: 16 },
  changePhoto: { color: '#fff', marginTop: 10, fontWeight: '600' },
  section: { backgroundColor: '#fff', marginTop: 15, padding: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 15, fontSize: 16 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#eee' },
  menuText: { fontSize: 16 },
  menuArrow: { color: '#999', fontSize: 18 },
  guardarBtn: { backgroundColor: '#FF6B35', margin: 20, padding: 18, borderRadius: 10, alignItems: 'center' },
  guardarBtnDisabled: { backgroundColor: '#ccc' },
  guardarBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
