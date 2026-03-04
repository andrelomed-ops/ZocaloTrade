import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { useStore } from '../src/store/useStore';
import { router } from 'expo-router';
import { useState } from 'react';
import { supabase, TABLES } from '../src/services/supabase';

const ZONAS_ENVIO = [
  { id: 'centro', nombre: 'Centro Histórico', precio: 50 },
  { id: 'alcaldias_cerca', nombre: 'Cuauhtémoc, Juárez, Roma', precio: 60 },
  { id: 'alcaldias_medio', nombre: 'Benito Juárez, Miguel Hidalgo, Coyoacán', precio: 70 },
  { id: 'alcaldias_lejos', nombre: 'Álvaro Obregón, Coyoacán, Tlalpan', precio: 85 },
];

export default function CheckoutScreen() {
  const { carrito, clearCarrito, addPedido, user, colors } = useStore();
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [metodoPago, setMetodoPago] = useState('contraentrega');
  const [zonaSeleccionada, setZonaSeleccionada] = useState(ZONAS_ENVIO[0]);
  const [notas, setNotas] = useState('');
  const [confirmando, setConfirmando] = useState(false);

  const subtotal = (carrito || []).reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
  const costoEnvio = zonaSeleccionada.precio;
  const total = subtotal + costoEnvio;

  const handleConfirmarPedido = async () => {
    if (!direccionEntrega) {
      const msg = 'Por favor ingresa tu dirección';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Error', msg);
      return;
    }

    setConfirmando(true);

    try {
      const nuevoPedido = {
        clienteId: user?.id,
        tiendaId: carrito[0]?.producto.tiendaId,
        productos: carrito.map(item => ({
          id: item.producto.id,
          nombre: item.producto.nombre,
          cantidad: item.cantidad,
          precio: item.producto.precio
        })),
        subtotal,
        total,
        direccionEntrega,
        metodoPago,
        status: 'pendiente',
        createdAt: new Date().toISOString()
      };

      await addPedido(nuevoPedido);
      clearCarrito();
      
      const successMsg = '¡Pedido creado con éxito! 🎉';
      if (Platform.OS === 'web') alert(successMsg);
      else Alert.alert('¡Éxito!', successMsg);
      
      router.replace('/(tabs)/pedidos');
    } catch (error) {
      if (Platform.OS === 'web') alert('Error al procesar pedido');
      else Alert.alert('Error', 'No se pudo crear el pedido');
    } finally {
      setConfirmando(false);
    }
  };

  if ((carrito || []).length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>No hay productos para comprar</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)')}>
          <Text style={{ color: colors.primary, marginTop: 10 }}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>📍 Dirección de Entrega</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          value={direccionEntrega}
          onChangeText={setDireccionEntrega}
          placeholder="Calle, número, colonia..."
          placeholderTextColor={colors.subtext}
          multiline
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🚚 Zona de Envío</Text>
        {ZONAS_ENVIO.map((zona) => (
          <TouchableOpacity 
            key={zona.id}
            style={[
              styles.option, 
              { borderColor: colors.border },
              zonaSeleccionada.id === zona.id && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
            ]}
            onPress={() => setZonaSeleccionada(zona)}
          >
            <Text style={{ color: colors.text, flex: 1 }}>{zona.nombre}</Text>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>${zona.precio}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>💵 Método de Pago</Text>
        <TouchableOpacity 
          style={[styles.option, { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
        >
          <Text style={{ color: colors.text }}>Pago contraentrega (Efectivo)</Text>
          <Text style={{ color: colors.primary }}>✓</Text>
        </TouchableOpacity>
        <Text style={{ color: colors.subtext, fontSize: 12, marginTop: 5 }}>
          Por ahora solo aceptamos pago al recibir para tu seguridad.
        </Text>
      </View>

      <View style={[styles.resumen, { backgroundColor: colors.card }]}>
        <View style={styles.row}>
          <Text style={{ color: colors.subtext }}>Subtotal</Text>
          <Text style={{ color: colors.text }}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={{ color: colors.subtext }}>Envío</Text>
          <Text style={{ color: colors.text }}>${costoEnvio.toFixed(2)}</Text>
        </View>
        <View style={[styles.row, { marginTop: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }]}>
          <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 18 }}>Total</Text>
          <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 18 }}>${total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.confirmBtn, { backgroundColor: colors.primary }, confirmando && { opacity: 0.7 }]}
          onPress={handleConfirmarPedido}
          disabled={confirmando}
        >
          {confirmando ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Confirmar Pedido</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { margin: 15, padding: 15, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  input: { padding: 12, borderRadius: 8, borderWidth: 1, minHeight: 80, textAlignVertical: 'top' },
  option: { flexDirection: 'row', padding: 15, borderRadius: 8, borderWidth: 1, marginBottom: 8, alignItems: 'center' },
  resumen: { margin: 15, padding: 20, borderRadius: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  confirmBtn: { marginTop: 20, padding: 18, borderRadius: 12, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
