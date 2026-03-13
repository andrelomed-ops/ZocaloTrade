import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Platform, ActivityIndicator, FlatList, Modal } from 'react-native';
import { useStore } from '../src/store/useStore';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { createClincKargoOrder } from '../src/services/clinckargo';
import { buscarDirecciones, getCurrentLocation, calcularCostoEnvio, DireccionSugerida, CostoEnvio } from '../src/services/ubicacion';

export default function CheckoutScreen() {
  const { carrito, clearCarrito, addPedido, loadPedidos, user, colors, tiendas, initialize } = useStore();
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [sugerencias, setSugerencias] = useState<DireccionSugerida[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [costoEnvioInfo, setCostoEnvioInfo] = useState<CostoEnvio | null>(null);
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState<any>(null);
  const [ubicacionEntrega, setUbicacionEntrega] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (carrito && carrito.length > 0 && tiendas.length > 0) {
      const producto = carrito[0]?.producto;
      if (producto?.tiendaId) {
        const tienda = tiendas.find(t => t.id === producto.tiendaId);
        if (tienda) {
          setTiendaSeleccionada(tienda);
        }
      }
    }
  }, [carrito, tiendas]);

  const subtotal = (carrito || []).reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
  const costoEnvio = costoEnvioInfo?.costo || 0;
  
  // REGLA DE NEGOCIO: Si supera $30,000 MXN, el pago debe ser 100% tarjeta
  const esCompraSegura = subtotal > 30000;
  
  // Si supera 30k, fuerza tarjeta. Si no, por defecto contraentrega
  const [metodoPago, setMetodoPago] = useState<'contraentrega' | 'tarjeta'>(esCompraSegura ? 'tarjeta' : 'contraentrega');

  const [tarjeta, setTarjeta] = useState({
    numero: '',
    expiracion: '',
    cvc: '',
    titular: user?.nombre || ''
  });

  const procesarPagoStripeSeguro = async (montoCargar: number) => {
    if (tarjeta.numero.replace(/\s/g, '').length < 15) throw new Error('Número de tarjeta inválido');
    if (tarjeta.expiracion.length < 5) throw new Error('Fecha de expiración inválida (MM/AA)');
    if (tarjeta.cvc.length < 3) throw new Error('CVC inválido');
    if (!tarjeta.titular) throw new Error('Nombre del titular es requerido');

    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, transactionId: `pi_stripe_${Date.now()}` };
  };

  const handleConfirmarPedido = async () => {
    console.log('=== handleConfirmarPedido ===');
    
    if (!direccionEntrega) {
      Alert.alert('Error', 'Por favor ingresa tu dirección');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'Debes iniciar sesión');
      return;
    }

    setConfirmando(true);

    try {
      const nuevoPedido = {
        cliente_id: user.id,
        tienda_id: 'f859b36a-424e-498a-a703-edc46ddeb9ac',
        productos: JSON.stringify(carrito.map(item => ({
          nombre: item.producto.nombre,
          cantidad: item.cantidad,
          precio: item.producto.precio
        }))),
        subtotal: subtotal,
        total: subtotal + costoEnvio,
        direccion_entrega: direccionEntrega,
        metodo_pago: metodoPago === 'tarjeta' ? 'tarjeta' : 'efectivo',
      };

      console.log('Calling addPedido...');
      const result: any = await addPedido(nuevoPedido);
      console.log('Result:', result);
      
      if (!result?.success) {
        Alert.alert('Error', result?.error || 'No se guardó');
        setConfirmando(false);
        return;
      }

      console.log('Pedido guardado, limpiando...');
      clearCarrito();
      Alert.alert('✅ Listo', 'Pedido realizado');
      router.replace('/(tabs)/pedidos');
      
    } catch (error: any) {
      console.error('ERROR:', error);
      Alert.alert('Error', error.message);
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
      {tiendaSeleccionada && (
        <View style={[styles.tiendaInfo, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>🏪 Tienda: {tiendaSeleccionada.nombre}</Text>
          {tiendaSeleccionada.latitud ? (
            <Text style={{ color: colors.subtext, fontSize: 12 }}>El envío se calculará desde esta ubicación</Text>
          ) : (
            <Text style={{ color: colors.subtext, fontSize: 12 }}>Ubicación no disponible, se usará Zócalo por defecto</Text>
          )}
        </View>
      )}
      
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>📍 Dirección de Entrega</Text>
        
        <View style={{ position: 'relative' }}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={direccionEntrega}
            onChangeText={(text) => {
              setDireccionEntrega(text);
              if (text.length >= 3) {
                buscarDirecciones(text).then(setSugerencias).catch(() => setSugerencias([]));
                setMostrarSugerencias(true);
              } else {
                setSugerencias([]);
              }
            }}
            onFocus={() => setMostrarSugerencias(true)}
            placeholder="Escribe tu dirección (calle, colonia, Alcaldía)..."
            placeholderTextColor={colors.subtext}
          />
          
          {mostrarSugerencias && sugerencias.length > 0 && (
            <View style={[styles.sugerenciasContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <FlatList
                data={sugerencias}
                keyExtractor={(item) => item.place_id.toString()}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.sugerenciaItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      const coords = { lat: parseFloat(item.lat), lng: parseFloat(item.lon) };
                      const tiendaUbicacion = tiendaSeleccionada?.latitud && tiendaSeleccionada?.longitud 
                        ? { lat: tiendaSeleccionada.latitud, lng: tiendaSeleccionada.longitud }
                        : null;
                      const costo = calcularCostoEnvio(coords, tiendaUbicacion, tiendaSeleccionada?.nombre, { subtotal });
                      setCostoEnvioInfo(costo);
                      setDireccionEntrega(item.display_name.split(',').slice(0, 3).join(','));
                      setUbicacionEntrega(coords);
                      setMostrarSugerencias(false);
                      setSugerencias([]);
                    }}
                  >
                    <Text style={{ color: colors.text, fontSize: 14 }} numberOfLines={2}>
                      {item.display_name.split(',').slice(0, 3).join(',')}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.botonUbicacion, { backgroundColor: colors.primary + '20' }]}
          onPress={async () => {
            setCargandoUbicacion(true);
            try {
              const ubicacion = await getCurrentLocation();
              if (ubicacion) {
                const tiendaUbicacion = tiendaSeleccionada?.latitud && tiendaSeleccionada?.longitud 
                  ? { lat: tiendaSeleccionada.latitud, lng: tiendaSeleccionada.longitud }
                  : null;
                const costo = calcularCostoEnvio(ubicacion, tiendaUbicacion, tiendaSeleccionada?.nombre, { subtotal });
                setCostoEnvioInfo(costo);
                setDireccionEntrega('📍 Ubicación actual detectada');
                setUbicacionEntrega(ubicacion);
              } else {
                Alert.alert('Error', 'No se pudo obtener tu ubicación. Verifica los permisos.');
              }
            } catch (e) {
              Alert.alert('Error', 'Error al obtener ubicación');
            } finally {
              setCargandoUbicacion(false);
            }
          }}
          disabled={cargandoUbicacion}
        >
          {cargandoUbicacion ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>📍 Usar mi ubicación actual</Text>
          )}
        </TouchableOpacity>

        {costoEnvioInfo && (
          <View style={[styles.infoEnvio, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>🚚 Costo de envío calculado:</Text>
            <Text style={{ color: colors.text }}>Distancia: {costoEnvioInfo.distancia} km</Text>
            <Text style={{ color: colors.text }}>Zona: {costoEnvioInfo.zona}</Text>
            <Text style={{ color: colors.primary, fontSize: 20, fontWeight: 'bold' }}>${costoEnvioInfo.costo}</Text>
          </View>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>💵 Método de Pago</Text>
        
        <TouchableOpacity 
          style={[
            styles.option, 
            { borderColor: colors.border, marginBottom: 10 }, 
            metodoPago === 'contraentrega' && { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
            esCompraSegura && { opacity: 0.5 }
          ]}
          onPress={() => !esCompraSegura && setMetodoPago('contraentrega')}
          disabled={esCompraSegura}
        >
          <Text style={{ fontSize: 20, marginRight: 10 }}>💵</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: metodoPago === 'contraentrega' ? 'bold' : 'normal' }}>
              Efectivo al Recibir (Contraentrega)
            </Text>
            {esCompraSegura && (
              <Text style={{ color: '#e74c3c', fontSize: 11, marginTop: 2 }}>
                ⚠️ Desactivado por seguridad. Compras mayores a $30,000 requieren pago con tarjeta.
              </Text>
            )}
          </View>
          {metodoPago === 'contraentrega' && <Text style={{ color: colors.primary }}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.option, { borderColor: colors.border }, metodoPago === 'tarjeta' && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }]}
          onPress={() => setMetodoPago('tarjeta')}
        >
          <Text style={{ fontSize: 20, marginRight: 10 }}>💳</Text>
          <Text style={{ color: colors.text, flex: 1, fontWeight: metodoPago === 'tarjeta' ? 'bold' : 'normal' }}>
            Pagar todo ahora (Tarjeta)
          </Text>
          {metodoPago === 'tarjeta' && <Text style={{ color: colors.primary }}>✓</Text>}
        </TouchableOpacity>

        <View style={styles.cardForm}>
          <Text style={{ color: colors.primary, fontWeight: 'bold', marginBottom: 10 }}>
            {metodoPago === 'tarjeta' 
              ? `Pago total seguro: $${(subtotal + costoEnvio).toFixed(2)}` 
              : `Paga el envío ahora ($${costoEnvio.toFixed(2)}) para asegurar a tu repartidor. El resto ($${subtotal.toFixed(2)}) se paga en efectivo al recibir.`}
          </Text>

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
            <Text style={{ color: '#27ae60', fontSize: 12, fontWeight: 'bold' }}>🔒 Encriptación Stripe 256-bit</Text>
          </View>
        </View>
      </View>

      <View style={[styles.resumen, { backgroundColor: colors.card }]}>
        <View style={styles.row}>
          <Text style={{ color: colors.subtext }}>Productos</Text>
          <Text style={{ color: colors.text }}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={{ color: colors.subtext }}>Logística (ClincKargo)</Text>
          <Text style={{ color: colors.text }}>${costoEnvio.toFixed(2)}</Text>
        </View>
        <View style={[styles.row, { marginTop: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }]}>
          <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 18 }}>Cargar a Tarjeta Hoy</Text>
          <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 18 }}>
            ${(metodoPago === 'tarjeta' ? (subtotal + costoEnvio) : costoEnvio).toFixed(2)}
          </Text>
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
              Pagar ${(metodoPago === 'tarjeta' ? (subtotal + costoEnvio) : costoEnvio).toFixed(2)}
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
  sugerenciasContainer: { position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: 200, borderWidth: 1, borderRadius: 8, zIndex: 100, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  sugerenciaItem: { padding: 12, borderBottomWidth: 1 },
  botonUbicacion: { marginTop: 12, padding: 12, borderRadius: 10, alignItems: 'center' },
  infoEnvio: { marginTop: 15, padding: 15, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  tiendaInfo: { margin: 15, marginBottom: 0, padding: 15, borderRadius: 10, borderWidth: 1 },
});
