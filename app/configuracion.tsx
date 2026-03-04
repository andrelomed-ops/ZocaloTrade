import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView, Alert, Linking } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useStore } from '../src/store/useStore';
import { supabase } from '../src/services/supabase';

export default function ConfiguracionScreen() {
  const { user, setUser, darkMode, setDarkMode } = useStore();
  const [notificaciones, setNotificaciones] = useState(true);
  const [sonido, setSonido] = useState(true);
  const [vibracion, setVibracion] = useState(true);
  const [ubicacion, setUbicacion] = useState(false);
  const tema = darkMode ? 'oscuro' : 'claro';

  const handleCerrarSesion = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: async () => {
          await supabase.auth.signOut();
          setUser(null);
          router.replace('/');
        }},
      ]
    );
  };

  const toggleTema = () => {
    setDarkMode(!darkMode);
  };

  const handleEliminarCuenta = () => {
    Alert.alert(
      'Eliminar Cuenta',
      'Esta acción no se puede deshacer. ¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => {
          Alert.alert('Cuenta eliminada', 'Tu cuenta ha sido eliminada');
        }},
      ]
    );
  };

  const toggleNotificaciones = () => {
    setNotificaciones(!notificaciones);
    Alert.alert(
      notificaciones ? 'Notificaciones desactivadas' : 'Notificaciones activadas',
      notificaciones 
        ? 'Ya no recibirás notificaciones push' 
        : 'Recibirás notificaciones sobre tus pedidos'
    );
  };

  const toggleSonido = () => {
    setSonido(!sonido);
  };

  const toggleVibracion = () => {
    setVibracion(!vibracion);
  };

  const toggleUbicacion = () => {
    setUbicacion(!ubicacion);
    Alert.alert(
      ubicacion ? 'Ubicación activada' : 'Ubicación desactivada',
      ubicacion
        ? 'Puedes encontrar vendedores cercanos'
        : 'No verás vendedores cercanos'
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Notificaciones Push</Text>
            <Text style={styles.settingDesc}>Recibe alertas sobre tus pedidos</Text>
          </View>
          <Switch
            value={notificaciones}
            onValueChange={toggleNotificaciones}
            trackColor={{ false: '#ddd', true: '#FF6B35' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Sonido</Text>
            <Text style={styles.settingDesc}>Sonido al recibir notificaciones</Text>
          </View>
          <Switch
            value={sonido}
            onValueChange={toggleSonido}
            trackColor={{ false: '#ddd', true: '#FF6B35' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Vibración</Text>
            <Text style={styles.settingDesc}>Vibración al recibir notificaciones</Text>
          </View>
          <Switch
            value={vibracion}
            onValueChange={toggleVibracion}
            trackColor={{ false: '#ddd', true: '#FF6B35' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacidad</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Compartir Ubicación</Text>
            <Text style={styles.settingDesc}>Permite encontrar vendedores cercanos</Text>
          </View>
          <Switch
            value={ubicacion}
            onValueChange={toggleUbicacion}
            trackColor={{ false: '#ddd', true: '#FF6B35' }}
            thumbColor="#fff"
          />
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Datos y Privacidad', 'ZocaloTrade protege tus datos personales. No vendemos ni compartimos tu información con terceros.')}>
          <Text style={styles.menuText}>Datos y Privacidad</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Cookies', 'Utilizamos cookies para mejorar tu experiencia. Puedes gestionar tus preferencias en cualquier momento.')}>
          <Text style={styles.menuText}>Cookies</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apariencia</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Tema</Text>
            <Text style={styles.settingDesc}>Apariencia de la app</Text>
          </View>
          <View style={styles.optionsRow}>
            <TouchableOpacity 
              style={[styles.optionBtn, !darkMode && styles.optionBtnActive]}
              onPress={() => setDarkMode(false)}
            >
              <Text style={[styles.optionText, !darkMode && styles.optionTextActive]}>☀️ Claro</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.optionBtn, darkMode && styles.optionBtnActive]}
              onPress={() => setDarkMode(true)}
            >
              <Text style={[styles.optionText, darkMode && styles.optionTextActive]}>🌙 Oscuro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Región</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Moneda</Text>
            <Text style={styles.settingDesc}>Moneda para precios</Text>
          </View>
          <View style={styles.optionsRow}>
            <TouchableOpacity 
              style={[styles.optionBtn, moneda === 'MXN' && styles.optionBtnActive]}
              onPress={() => setMoneda('MXN')}
            >
              <Text style={[styles.optionText, moneda === 'MXN' && styles.optionTextActive]}>MXN</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.optionBtn, moneda === 'USD' && styles.optionBtnActive]}
              onPress={() => setMoneda('USD')}
            >
              <Text style={[styles.optionText, moneda === 'USD' && styles.optionTextActive]}>USD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acerca de</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Términos de Servicio', 'Términos y Condiciones de ZocaloTrade:\n\n1. Uso de la App\n2. Compras y Pagos\n3. Envíos y Entregas\n4. Comisiones\n5. Privacidad\n6. Contacto: soporte@zocalotrade.com')}>
          <Text style={styles.menuText}>Términos de Servicio</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Política de Privacidad', 'En Zocalotrade respetamos tu privacidad. \n\n- Tus datos están encriptados\n- No compartimos información con terceros\n- Puedes solicitar eliminación de datos\n- Contacto: privacidad@zocalotrade.com')}>
          <Text style={styles.menuText}>Política de Privacidad</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Licencias', 'ZocaloTrade usa las siguientes tecnologías de código abierto:\n\n- React Native\n- Expo\n- Supabase\n- OpenRouter AI')}>
          <Text style={styles.menuText}>Licencias</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Versión de la App</Text>
          <Text style={styles.menuValue}>1.0.0</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dangerSection}>
        <TouchableOpacity style={styles.dangerBtn} onPress={handleCerrarSesion}>
          <Text style={styles.dangerBtnText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dangerBtn} onPress={handleEliminarCuenta}>
          <Text style={[styles.dangerBtnText, styles.dangerText]}>Eliminar Cuenta</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>ZocaloTrade v1.0.0</Text>
        <Text style={styles.footerText}>© 2024 ZocaloTrade - Todos los derechos reservados</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  section: { backgroundColor: '#fff', marginTop: 15, padding: 15 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 15, textTransform: 'uppercase' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  settingInfo: { flex: 1, marginRight: 15 },
  settingLabel: { fontSize: 16 },
  settingDesc: { color: '#666', fontSize: 12, marginTop: 2 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#eee' },
  menuText: { fontSize: 16 },
  menuArrow: { color: '#999', fontSize: 18 },
  menuValue: { color: '#666', fontSize: 14 },
  optionsRow: { flexDirection: 'row' },
  optionBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginLeft: 8 },
  optionBtnActive: { backgroundColor: '#FF6B35' },
  optionText: { fontSize: 14, color: '#666' },
  optionTextActive: { color: '#fff' },
  dangerSection: { marginTop: 30, padding: 15 },
  dangerBtn: { backgroundColor: '#fff', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  dangerBtnText: { color: '#FF6B35', fontSize: 16, fontWeight: '600' },
  dangerText: { color: '#ff4444' },
  footer: { alignItems: 'center', padding: 30 },
  footerText: { color: '#999', fontSize: 12, marginTop: 5 },
});
