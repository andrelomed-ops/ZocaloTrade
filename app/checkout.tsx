import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useStore } from '../src/store/useStore';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '../src/services/supabase';
import { createPayment, getPaymentMethods } from '../src/services/mercadopago';
import { createClincKargoOrder } from '../src/services/clinckargo';

// Zonas de envío desde el Zócalo
const ZONAS_ENVIO = [
  { id: 'centro', nombre: 'Centro Histórico', precio: 50 },
  { id: 'alcaldias_cerca', nombre: 'Cuauhtémoc, Juárez, Roma', precio: 60 },
  { id: 'alcaldias_medio', nombre: 'Benito Juárez, Miguel Hidalgo, Coyoa', precio: 70 },
  { id: 'alcaldias_lejos', nombre: 'Álvaro Obregón, Coyoacán, Tlalpan', precio: 85 },
  { id: 'edomex_cerca', nombre: 'Estado de México (cerca)', precio: 110 },
  { id: 'edomex_lejos', nombre: 'Estado de México (lejos)', precio: 140 },
  { id: 'foraneo_cerca', nombre: 'Puebla, Morelos, Hidalgo (cerca)', precio: 160 },
  { id: 'foraneo_lejos', nombre: 'Otros estados', precio: 200 },
];

// Datos de cuenta bancaria de ZocaloTrade
const CUENTA_ZOCALOTRADE = {
  banco: 'BBVA',
  cuenta: '1234567890',
  clabe: '012345678901234567',
  titular: 'ZocaloTrade S.A. de C.V.'
};

export default function CheckoutScreen() {
  const { carrito, removeFromCarrito, clearCarrito, addPedido, user } = useStore();
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia' | 'contraentrega'>('efectivo');
  const [mostrarDatosTransferencia, setMostrarDatosTransferencia] = useState(false);
  const [zonaSeleccionada, setZonaSeleccionada] = useState(ZONAS_ENVIO[0]);
  const [notas, setNotas] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [envioIncluido, setEnvioIncluido] = useState(false);
  const [mostrarPagoTarjeta, setMostrarPagoTarjeta] = useState(false);
  
  // Datos de tarjeta
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTitular, setNombreTitular] = useState('');
  const [expiracion, setExpiracion] = useState('');
  const [cvv, setCvv] = useState('');

  // Calcular subtotal
  const subtotal = carrito.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);

  // Calcular envío según zona
  const calcularEnvio = () => {
    if (envioIncluido) return 0;
    
    let precioBase = zonaSeleccionada.precio;
    
    if (subtotal >= 500) {
      precioBase = precioBase * 0.8;
    } else if (subtotal >= 300) {
      precioBase = precioBase * 0.9;
    }
    
    return Math.round(precioBase);
  };

  // Calcular montos
  // La comisión NO se cobra al comprador, se descuenta del pago al vendedor
  const comisionZocalo = subtotal * 0.1; // 10% comisión para ZocaloTrade
  const montoProveedor = subtotal - comisionZocalo; // 90% para el vendedor
  const costoEnvio = calcularEnvio();
  const totalCliente = subtotal + costoEnvio; // Lo que paga el cliente (producto + envío)

  const handleConfirmarPedido = async () => {
    if (confirmando) return;
    
    if (carrito.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos al carrito primero');
      return;
    }

    setConfirmando(true);

    try {
      // Si es pago con tarjeta, procesar con MercadoPago
      if (metodoPago === 'tarjeta') {
        if (!numeroTarjeta || !nombreTitular || !expiracion || !cvv) {
          Alert.alert('Error', 'Completa todos los datos de la tarjeta');
          setConfirmando(false);
          return;
        }

        // Procesar pago con MercadoPago
        const [mes, año] = expiracion.split('/');
        
        const paymentResult = await createPayment({
          transactionAmount: costoEnvio, // Solo se paga el envío ahora
          description: `Pedido ZocaloTrade - Envío (${carrito.length} productos)`,
          paymentMethodId: 'visa', // En producción, detectar automáticamente
          email: user?.email || 'cliente@email.com',
          cardholderName: nombreTitular,
          cardNumber: numeroTarjeta.replace(/\s/g, ''),
          expirationMonth: mes,
          expirationYear: '20' + año,
          securityCode: cvv,
          splitAmount: comisionZocalo, // Comisión de ZocaloTrade
        });

        if (paymentResult.status === 'error') {
          Alert.alert('Error de pago', paymentResult.error || 'No se pudo procesar el pago');
          setConfirmando(false);
          return;
        }

        if (paymentResult.status === 'pending') {
          Alert.alert('Pago pendiente', 'Tu pago está siendo procesado. Te notificaremos cuando sea confirmado.');
        }
      }

      // Obtener tienda del primer producto
      const tiendaId = carrito[0]?.producto.tiendaId || '';
      
      const pedido = {
        id: Date.now().toString(),
        clienteId: user?.id || 'anonimo',
        tiendaId,
        productos: carrito,
        subtotal,
        comision: comisionZocalo,
        monto_proveedor: montoProveedor,
        costo_envio: costoEnvio,
        total: costoEnvio, // Solo se pagó el envío
        monto_contraentrega: subtotal, // Lo que se paga al repartidor (sin comisión extra)
        tipoEnvio: envioIncluido ? 'incluido' : zonaSeleccionada.nombre,
        status: metodoPago === 'tarjeta' ? 'envio_pagado' : 'pendiente',
        estado_pago: metodoPago === 'tarjeta' ? 'envio_pagado' : 'pendiente',
        estado_entrega: 'pendiente',
        direccionEntrega,
        metodoPago: metodoPago === 'contraentrega' ? 'contraentrega' : metodoPago,
        notas,
        createdAt: new Date().toISOString(),
      };

      await addPedido(pedido);
      clearCarrito();

      // Crear orden en ClincKargo para transporte
      const clinkCargoResult = await createClincKargoOrder({
        pedidoId: pedido.id,
        pickupAddress: 'Zócalo de la Ciudad de México, Centro Histórico, CDMX',
        pickupCoordinates: { lat: 19.4326, lng: -99.1332 },
        dropoffAddress: direccionEntrega,
        items: carrito.map(item => ({
          name: item.producto.nombre,
          size: item.producto.precio < 200 ? 'Pequeño' : item.producto.precio < 500 ? 'Mediano' : item.producto.precio < 1000 ? 'Grande' : 'Extra Grande',
          quantity: item.cantidad,
          description: item.producto.descripcion
        }))
      });

      if (clinkCargoResult.success) {
        console.log('ClincKargo order created:', clinkCargoResult.orderId);
      } else {
        console.warn('ClincKargo order failed:', clinkCargoResult.error);
      }
      
      const mensajePago = metodoPago === 'tarjeta' 
        ? `Pago del envío ($${costoEnvio.toFixed(2)}) procesado con éxito` 
        : 'Tu pedido ha sido creado';
      
      Alert.alert(
        '¡Pedido confirmado! 🎉',
        `${mensajePago}\n\n📦 Paga $${subtotal.toFixed(2)} al repartidor al recibir tu pedido`,
        [
          { 
            text: 'Ver Seguimiento', 
            onPress: () => router.push(`/seguimiento?id=${pedido.id}`) 
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar el pedido');
    } finally {
      setConfirmando(false);
    }
  };

  if (carrito.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyText}>Tu carrito está vacío</Text>
        <TouchableOpacity 
          style={styles.explorarBtn}
          onPress={() => router.push('/explorar')}
        >
          <Text style={styles.explorarBtnText}>Explorar Productos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 Productos ({carrito.length})</Text>
        {carrito.map((item) => (
          <View key={item.producto.id} style={styles.productoItem}>
            <View style={styles.productoInfo}>
              <Text style={styles.productoNombre}>{item.producto.nombre}</Text>
              <Text style={styles.productoCantidad}>Cantidad: {item.cantidad}</Text>
            </View>
            <View style={styles.productoRight}>
              <Text style={styles.productoPrecio}>
                ${(item.producto.precio * item.cantidad).toFixed(2)}
              </Text>
              <TouchableOpacity onPress={() => removeFromCarrito(item.producto.id)}>
                <Text style={styles.eliminarBtn}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚚 Zona de Entrega</Text>
        <Text style={{color: '#666', fontSize: 12, marginBottom: 10}}>
          📍 Envíos desde el Zócalo de la Ciudad de México
        </Text>
        
        <TouchableOpacity 
          style={[styles.opcionPago, envioIncluido && styles.opcionPagoActive]}
          onPress={() => setEnvioIncluido(!envioIncluido)}
        >
          <Text style={styles.opcionIcon}>🎁</Text>
          <View style={styles.opcionInfo}>
            <Text style={styles.opcionTitulo}>Envío incluido</Text>
            <Text style={styles.opcionDesc}>Gratis - Disponible en productos seleccionados</Text>
          </View>
          {envioIncluido && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        {!envioIncluido && (
          <>
            <Text style={{fontSize: 14, fontWeight: 'bold', marginBottom: 10, marginTop: 10}}>Selecciona tu zona:</Text>
            {ZONAS_ENVIO.map((zona) => (
              <TouchableOpacity 
                key={zona.id}
                style={[styles.opcionPago, zonaSeleccionada.id === zona.id && styles.opcionPagoActive]}
                onPress={() => setZonaSeleccionada(zona)}
              >
                <Text style={styles.opcionIcon}>📍</Text>
                <View style={styles.opcionInfo}>
                  <Text style={styles.opcionTitulo}>{zona.nombre}</Text>
                  <Text style={styles.opcionDesc}>
                    ${zona.precio} {subtotal >= 300 && `(${subtotal >= 500 ? '20%' : '10%'} dto)`}
                  </Text>
                </View>
                {zonaSeleccionada.id === zona.id && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
            
            {subtotal < 500 && subtotal >= 300 && (
              <Text style={{color: '#27ae60', fontSize: 12, marginTop: 5}}>
                💡 ¡Añade ${500 - subtotal} más para obtener 20% de descuento en envío!
              </Text>
            )}
            {subtotal >= 500 && (
              <Text style={{color: '#27ae60', fontSize: 12, marginTop: 5}}>
                🎉 ¡Tienes 20% de descuento en tu envío!
              </Text>
            )}
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Dirección de Entrega</Text>
        <TextInput
          style={styles.input}
          value={direccionEntrega}
          onChangeText={setDireccionEntrega}
          placeholder="Ingresa tu dirección"
          multiline
        />
        <TouchableOpacity style={styles.cambiarBtn}>
          <Text style={styles.cambiarBtnText}>Cambiar dirección</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Pago del Envío</Text>
        
        <View style={{backgroundColor: '#fff3cd', padding: 12, borderRadius: 8, marginBottom: 15}}>
          <Text style={{color: '#856404', fontSize: 13}}>
            📦 El pago del producto se hará en efectivo al repartidor
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.opcionPago, metodoPago === 'contraentrega' && styles.opcionPagoActive]}
          onPress={() => { setMetodoPago('contraentrega'); setMostrarDatosTransferencia(false); }}
        >
          <Text style={styles.opcionIcon}>📦</Text>
          <View style={styles.opcionInfo}>
            <Text style={styles.opcionTitulo}>Pago contraentrega</Text>
            <Text style={styles.opcionDesc}>Paga el envío ahora, producto al recibir</Text>
          </View>
          {metodoPago === 'contraentrega' && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.opcionPago, metodoPago === 'transferencia' && styles.opcionPagoActive]}
          onPress={() => { setMetodoPago('transferencia'); setMostrarDatosTransferencia(true); }}
        >
          <Text style={styles.opcionIcon}>🏦</Text>
          <View style={styles.opcionInfo}>
            <Text style={styles.opcionTitulo}>Transferencia del envío</Text>
            <Text style={styles.opcionDesc}>Paga el envío por transferencia</Text>
          </View>
          {metodoPago === 'transferencia' && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        {mostrarDatosTransferencia && metodoPago === 'transferencia' && (
          <View style={{backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, marginTop: 10}}>
            <Text style={{fontWeight: 'bold', marginBottom: 10}}>
              💳 Transferencia del envío
            </Text>
            <Text style={{marginBottom: 5}}>🏦 Banco: {CUENTA_ZOCALOTRADE.banco}</Text>
            <Text style={{marginBottom: 5}}>👤 Titular: {CUENTA_ZOCALOTRADE.titular}</Text>
            <Text style={{marginBottom: 5}}>💳 Cuenta: {CUENTA_ZOCALOTRADE.cuenta}</Text>
            <Text style={{marginBottom: 10}}>🔢 CLABE: {CUENTA_ZOCALOTRADE.clabe}</Text>
            <Text style={{fontSize: 16, fontWeight: 'bold', color: '#FF6B35'}}>
              Envío a pagar: ${costoEnvio.toFixed(2)}
            </Text>
            <Text style={{fontSize: 12, color: '#666', marginTop: 5}}>
              El resto del pago (producto) se hace al repartidor
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.opcionPago, metodoPago === 'tarjeta' && styles.opcionPagoActive]}
          onPress={() => { setMetodoPago('tarjeta'); setMostrarDatosTransferencia(false); }}
        >
          <Text style={styles.opcionIcon}>💳</Text>
          <View style={styles.opcionInfo}>
            <Text style={styles.opcionTitulo}>Tarjeta (MercadoPago)</Text>
            <Text style={styles.opcionDesc}>Paga el envío con tarjeta</Text>
          </View>
          {metodoPago === 'tarjeta' && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        {metodoPago === 'tarjeta' && (
          <View style={{backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, marginTop: 10}}>
            <Text style={{fontWeight: 'bold', marginBottom: 10}}>💳 Datos de tarjeta para el envío:</Text>
            <TextInput
              style={styles.input}
              placeholder="Número de tarjeta"
              value={numeroTarjeta}
              onChangeText={setNumeroTarjeta}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Nombre titular"
              value={nombreTitular}
              onChangeText={setNombreTitular}
            />
            <View style={{flexDirection: 'row'}}>
              <TextInput
                style={[styles.input, {flex: 1, marginRight: 5}]}
                placeholder="MM/AA"
                value={expiracion}
                onChangeText={setExpiracion}
              />
              <TextInput
                style={[styles.input, {flex: 1}]}
                placeholder="CVV"
                value={cvv}
                onChangeText={setCvv}
                secureTextEntry
              />
            </View>
            <Text style={{fontWeight: 'bold', color: '#FF6B35', marginTop: 10}}>
              Envío a pagar: ${costoEnvio.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Notas del Pedido (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notas}
          onChangeText={setNotas}
          placeholder="Agrega alguna nota para el vendedor..."
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.resumen}>
        <View style={styles.resumenRow}>
          <Text style={styles.resumenLabel}>Subtotal productos</Text>
          <Text style={styles.resumenValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={[styles.resumenRow, {backgroundColor: '#fff3cd', padding: 10, borderRadius: 8}]}>
          <Text style={[styles.resumenLabel, {color: '#856404', fontWeight: '600'}]}>
            💵 A pagar al repartidor
          </Text>
          <Text style={[styles.resumenValue, {color: '#856404', fontWeight: 'bold'}]}>
            ${subtotal.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.resumenRow, {marginTop: 15}]}>
          <Text style={styles.resumenLabel}>
            {envioIncluido ? 'Envío' : `Envío (${zonaSeleccionada.nombre})`}
          </Text>
          <Text style={styles.resumenValue}>
            {envioIncluido ? 'Incluido' : `$${costoEnvio.toFixed(2)}`}
          </Text>
        </View>
        <View style={[styles.resumenRow, {backgroundColor: '#d4edda', padding: 10, borderRadius: 8}]}>
          <Text style={[styles.resumenLabel, {color: '#155724', fontWeight: '600'}]}>
            ✅ A pagar ahora (solo envío)
          </Text>
          <Text style={[styles.resumenValue, {color: '#155724', fontWeight: 'bold'}]}>
            ${costoEnvio.toFixed(2)}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.confirmarBtn, confirmando && styles.confirmarBtnDisabled]}
        onPress={handleConfirmarPedido}
        disabled={confirmando}
      >
        <Text style={styles.confirmarBtnText}>
          {confirmando ? 'Confirmando...' : `Pagar Envío - $${costoEnvio.toFixed(2)}`}
        </Text>
      </TouchableOpacity>

      <View style={styles.infoFooter}>
        <Text style={styles.infoText}>
          🔒 Tus datos están seguros. Al confirmar aceptas nuestros términos y condiciones.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 30 },
  emptyIcon: { fontSize: 80 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 20 },
  explorarBtn: { backgroundColor: '#FF6B35', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 25, marginTop: 25 },
  explorarBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  section: { backgroundColor: '#fff', marginTop: 10, padding: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  productoItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
  productoInfo: { flex: 1 },
  productoNombre: { fontSize: 15, fontWeight: '600' },
  productoCantidad: { color: '#666', fontSize: 13, marginTop: 3 },
  productoRight: { alignItems: 'flex-end' },
  productoPrecio: { fontSize: 16, fontWeight: 'bold', color: '#FF6B35' },
  eliminarBtn: { color: '#ff4444', fontSize: 18, marginTop: 5 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 15, fontSize: 15, marginBottom: 10 },
  textArea: { height: 80, textAlignVertical: 'top' },
  cambiarBtn: { alignSelf: 'flex-start' },
  cambiarBtnText: { color: '#FF6B35', fontWeight: '600' },
  opcionPago: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 2, borderColor: '#eee' },
  opcionPagoActive: { borderColor: '#FF6B35', backgroundColor: '#fff5f0' },
  opcionIcon: { fontSize: 28, marginRight: 15 },
  opcionInfo: { flex: 1 },
  opcionTitulo: { fontSize: 16, fontWeight: 'bold' },
  opcionDesc: { color: '#666', fontSize: 13, marginTop: 2 },
  checkmark: { color: '#FF6B35', fontSize: 20, fontWeight: 'bold' },
  resumen: { backgroundColor: '#fff', marginTop: 10, padding: 15 },
  resumenRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  resumenLabel: { color: '#666' },
  resumenValue: { fontSize: 14 },
  totalRow: { borderTopWidth: 1, borderColor: '#eee', paddingTop: 15, marginTop: 10 },
  totalLabel: { fontSize: 20, fontWeight: 'bold' },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: '#FF6B35' },
  confirmarBtn: { backgroundColor: '#FF6B35', margin: 15, padding: 18, borderRadius: 12, alignItems: 'center' },
  confirmarBtnDisabled: { backgroundColor: '#ccc' },
  confirmarBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  infoFooter: { padding: 15, paddingTop: 0 },
  infoText: { color: '#666', fontSize: 12, textAlign: 'center' },
});
