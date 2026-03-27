import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useStore } from '../src/store/useStore';

const PRIVACY_POLICY = `
# Política de Privacidad - ZocaloTrade

**Última actualización: 20 de marzo de 2026**

En ZocaloTrade, valoramos tu privacidad. Esta política describe cómo recolectamos y usamos tu información.

## 1. Información que Recolectamos
- **Información de la Cuenta:** Nombre, correo electrónico y foto de perfil (vía Supabase Auth).
- **Ubicación:** Usamos tu ubicación para mostrarte comerciantes y productos cercanos.
- **Datos de Transacciones:** Información básica de tus pedidos (productos, montos) gestionada de forma segura.

## 2. Uso de la Información
Usamos tus datos para:
- Procesar tus pedidos y entregas.
- Mejorar la experiencia de usuario y las recomendaciones (vía nuestra IA).
- Notificarte sobre el estado de tus compras.

## 3. Compartición de Datos
No vendemos tus datos a terceros. Compartimos información solo con:
- **Proveedores de Servicios:** Mercado Pago (pagos) y Clinckargo (logística) para completar tus pedidos.
- **Sentry:** Para monitorear errores técnicos y mejorar la estabilidad de la app.

## 4. Tus Derechos
Puedes acceder, rectificar o eliminar tu información en cualquier momento desde la sección de Perfil de la aplicación.

## 5. Contacto
Si tienes dudas, contáctanos en: soporte@zocalotrade.com
`;

const TERMS_OF_SERVICE = `
# Términos de Servicio - ZocaloTrade

**Última actualización: 20 de marzo de 2026**

Al usar ZocaloTrade, aceptas los siguientes términos:

## 1. Uso de la Plataforma
ZocaloTrade es un mercado que conecta a vendedores locales con compradores. No somos responsables directos de la calidad de los productos, aunque mediamos en disputas.

## 2. Registro
Debes proporcionar información verídica al registrarte. Eres responsable de mantener la seguridad de tu cuenta.

## 3. Pagos y Comisiones
Todas las transacciones se procesan vía Mercado Pago. ZocaloTrade retiene una comisión del 10% por cada venta completada.

## 4. Cancelaciones y Devoluciones
Sujeto a las políticas de cada tienda individual, pero siempre respetando la Ley Federal de Protección al Consumidor en México.

## 5. Modificaciones
Nos reservamos el derecho de modificar estos términos en cualquier momento.
`;

export default function LegalScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const { colors } = useStore();
  
  const content = type === 'privacy' ? PRIVACY_POLICY : TERMS_OF_SERVICE;
  const title = type === 'privacy' ? 'Aviso de Privacidad' : 'Términos de Servicio';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title, headerTintColor: colors.primary }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.text, { color: colors.text }]}>
          {content}
        </Text>
        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.btnText}>Entendido</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 50 },
  text: { fontSize: 14, lineHeight: 22, whiteSpace: 'pre-wrap' } as any,
  btn: { marginTop: 30, padding: 18, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
});
