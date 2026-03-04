import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView, Alert, Linking, Platform } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useStore } from '../src/store/useStore';
import { supabase } from '../src/services/supabase';

export default function ConfiguracionScreen() {
  const { user, setUser, darkMode, setDarkMode, colors } = useStore();
  const [notificaciones, setNotificaciones] = useState(true);

  const handleCerrarSesion = async () => {
    const confirmed = Platform.OS === 'web' 
      ? window.confirm('¿Cerrar sesión?') 
      : await new Promise(resolve => {
          Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
            { text: 'No', onPress: () => resolve(false) },
            { text: 'Sí', onPress: () => resolve(true) }
          ]);
        });

    if (confirmed) {
      await supabase.auth.signOut();
      setUser(null);
      router.replace('/login');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Apariencia</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>Modo Oscuro</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: colors.primary }} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Notificaciones</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>Push Notificaciones</Text>
            <Switch value={notificaciones} onValueChange={setNotificaciones} trackColor={{ true: colors.primary }} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Cuenta</Text>
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card, alignItems: 'center' }]}
          onPress={handleCerrarSesion}
        >
          <Text style={{ color: '#ff4444', fontWeight: 'bold' }}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ color: colors.subtext, fontSize: 12 }}>ZocaloTrade v1.0.5</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { padding: 20, paddingBottom: 0 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase', opacity: 0.6 },
  card: { borderRadius: 12, padding: 15, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 16 },
});
