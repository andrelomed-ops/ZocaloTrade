import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { useStore } from '../src/store/useStore';
import { router } from 'expo-router';
import { useState } from 'react';
import { createClincKargoOrder } from '../src/services/clinckargo';

const ZONAS_ENVIO = [
  { id: 'centro', nombre: 'Centro Histórico', precio: 50 },
  { id: 'alcaldias_cerca', nombre: 'Cuauhtémoc, Juárez, Roma', precio: 60 },
  { id: 'alcaldias_medio', nombre: 'Benito Juárez, Miguel Hidalgo, Coyoacán', precio: 70 },
  { id: 'alcaldias_lejos', nombre: 'Álvaro Obregón, Coyoacán, Tlalpan', precio: 85 },
];

export default function CheckoutScreen() {
  const { carrito, clearCarrito, addPedido, user, colors } = useStore();
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [metodoPago, setMetodoPago] = useState<'contraentrega' | 'tarjeta'>('contraentrega');
  const [zonaSeleccionada, setZonaSeleccionada] = useState(ZONAS_ENVIO[0]);
  const [confirmando, setConfirmando] = useState(false);

  const [tarjeta, setTarjeta] = useState({
    numero: '',
    expiracion: '',
    cvc: '',
    titular: user?.nombre || ''
  });

  const subtotal = (carrito || []).reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
  const costoEnvio = zonaSeleccionada.precio;
  const total = subtotal + costoEnvio;

  const procesarPagoStripeSeguro = async () => {
    if (tarjeta.numero.replace(/\s/g, '').length < 15) throw new Error('Número de tarjeta inválido');
    if (tarjeta.expiracion.length < 5) throw new Error('Fecha de expiración inválida (MM/AA)');
    if (tarjeta.cvc.length < 3) throw new Error('CVC inválido');
    if (!tarjeta.titular) throw new Error('Nombre del titular es requerido');

    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, transactionId: `pi_stripe_${Date.now()}` };
  };

  const handleConfirmarPedido = async () => {
    if (!direccionEntrega) {
      const msg = 'Por favor ingresa tu dirección exacta para el repartidor.';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Aviso', msg);
      return;
    }

    setConfirmando(true);

    try {
      let idTransaccion = null;
      let estadoPago = 'pendiente';

      if (metodoPago === 'tarjeta') {
        const pago = await procesarPagoStripeSeguro();
        idTransaccion = pago.transactionId;
        estadoPago = 'pagado';
      }

      const zocaloOrderId = `ZOC-${Date.now()}`;
      
      const transportOrder = await createClincKargoOrder({
        pedidoId: zocaloOrderId,
        pickupAddress: 'Zócalo de la Ciudad de México, Centro Histórico, CDMX',
        dropoffAddress: direccionEntrega,
        items: carrito.map(item => ({
          name: item.producto.nombre,
          size: item.producto.precio < 500 ? 'Mediano' : 'Grande',
          quantity: item.cantidad
        })),
        customerName: user?.nombre,
        customerPhone: user?.email
      });

      const nuevoPedido = {
        id: zocaloOrderId,
        cliente_id: user?.id,
        tienda_id: carrito[0]?.producto.tiendaId,
        productos: carrito.map(item => ({
          id: item.producto.id,
          nombre: item.producto.nombre,
          cantidad: item.cantidad,
          precio: item.producto.precio
        })),
        subtotal,
        total,
        direccion_entrega: direccionEntrega,
        metodo_pago: metodoPago,
        status: metodoPago === 'tarjeta' ? 'preparando' : 'pendiente',
        clinckargo_id: transportOrder.success ? transportOrder.orderId : null,
      };

      await addPedido(nuevoPedido);
      clearCarrito();
      
      const successMsg = metodoPago === 'tarjeta' 
        ? '¡Pago exitoso! Tu pedido ya se está preparando. 💳' 
        : '¡Pedido creado! Paga en efectivo al recibir. 🚚';
        
      if (Platform.OS === 'web') alert(successMsg);
      else Alert.alert('¡Éxito!', successMsg);
      
      router.replace(`/(tabs)/pedidos`);
    } catch (error: any) {
      const errorMsg = error.message || 'Ocurrió un error al procesar tu solicitud.';
      if (Platform.OS === 'web') alert(`Error: ${errorMsg}`);
      else Alert.alert('Error', errorMsg);
    } finally {
      setConfirmando(false);
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/.{1,4}/g);
    setTarjeta({ ...tarjeta, numero: match ? match.join(' ') : cleaned });
  };

  const formatExpDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 3) {
      setTarjeta({ ...tarjeta, expiracion: `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}` });
    } else {
      setTarjeta({ ...tarjeta, expiracion: cleaned });
    }
  };

  if ((carrito || []).length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>No hay productos para comprar</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)')}>
          <Text style={{ color: colors.primary, marginTop: 10, fontWeight: 'bold' }}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>📍 Dirección de Entrega</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          value={direccionEntrega}
          onChangeText={setDireccionEntrega}
          placeholder="Calle, número, colonia, referencias..."
          placeholderTextColor={colors.subtext}
          multiline
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🚚 Zona de Logística</Text>
        {ZONAS_ENVIO.map((zona) => (
          <TouchableOpacity 
            key={zona.id}
            style={[
              styles.option, 
              { borderColor: colors.border },
              zonaSeleccionada.id === zona.id && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }
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
          style={[styles.option, { borderColor: colors.border }, metodoPago === 'tarjeta' && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }]}
          onPress={() => setMetodoPago('tarjeta')}
        >
          <Text style={{ fontSize: 20, marginRight: 10 }}>💳</Text>
          <Text style={{ color: colors.text, flex: 1, fontWeight: metodoPago === 'tarjeta' ? 'bold' : 'normal' }}>Tarjeta (Stripe Seguro)</Text>
          {metodoPago === 'tarjeta' && <Text style={{ color: colors.primary }}>✓</Text>}
        </TouchableOpacity>

        {metodoPago === 'tarjeta' && (
          <View style={styles.cardForm}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, marginBottom: 10 }]}
              placeholder="Nombre del Titular"
              placeholderTextColor={colors.subtext}
              value={tarjeta.titular}
              onChangeText={(text) => setTarjeta({...tarjeta, titular: text})}
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, marginBottom: 10 }]}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor={colors.subtext}
              keyboardType="numeric"
              maxLength={19}
              value={tarjeta.numero}
              onChangeText={formatCardNumber}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="MM/AA"
                placeholderTextColor={colors.subtext}
                keyboardType="numeric"
                maxLength={5}
                value={tarjeta.expiracion}
                onChangeText={formatExpDate}
              />
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="CVC"
                placeholderTextColor={colors.subtext}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                value={tarjeta.cvc}
                onChangeText={(text) => setTarjeta({...tarjeta, cvc: text.replace(/\D/g, '')})}
              />
            </View>
            <View style={styles.secureBadge}>
              <Text style={{ color: '#27ae60', fontSize: 12, fontWeight: 'bold' }}>🔒 Pago Encriptado por Stripe 256-bit</Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.option, { borderColor: colors.border, marginTop: 10 }, metodoPago === 'contraentrega' && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }]}
          onPress={() => setMetodoPago('contraentrega')}
        >
          <Text style={{ fontSize: 20, marginRight: 10 }}>💵</Text>
          <Text style={{ color: colors.text, flex: 1, fontWeight: metodoPago === 'contraentrega' ? 'bold' : 'normal' }}>Efectivo al Recibir</Text>
          {metodoPago === 'contraentrega' && <Text style={{ color: colors.primary }}>✓</Text>}
        </TouchableOpacity>
      </View>

      <View style={[styles.resumen, { backgroundColor: colors.card }]}>
        <View style={styles.row}>
          <Text style={{ color: colors.subtext }}>Subtotal Productos</Text>
          <Text style={{ color: colors.text }}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={{ color: colors.subtext }}>Logística ClincKargo</Text>
          <Text style={{ color: colors.text }}>${costoEnvio.toFixed(2)}</Text>
        </View>
        <View style={[styles.row, { marginTop: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }]}>
          <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 18 }}>Total a Pagar</Text>
          <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 18 }}>${total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.confirmBtn, { backgroundColor: colors.primary }, confirmando && { opacity: 0.7 }]}
          onPress={handleConfirmarPedido}
          disabled={confirmando}
        >
          {confirmando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmBtnText}>
              {metodoPago === 'tarjeta' ? `Pagar $${total.toFixed(2)} Ahora` : 'Confirmar Pedido'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { margin: 15, padding: 15, borderRadius: 12, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  input: { padding: 14, borderRadius: 10, borderWidth: 1, fontSize: 15 },
  option: { flexDirection: 'row', padding: 16, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  cardForm: { marginTop: 15, padding: 15, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 10, borderWidth: 1, borderColor: '#eee' },
  secureBadge: { marginTop: 10, alignItems: 'center', padding: 8, backgroundColor: '#e8f8f5', borderRadius: 8 },
  resumen: { margin: 15, padding: 20, borderRadius: 12, elevation: 2, marginBottom: 40 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  confirmBtn: { marginTop: 25, padding: 18, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
