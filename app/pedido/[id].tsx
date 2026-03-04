import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useStore } from '../../src/store/useStore';
import { useState } from 'react';
import { supabase } from '../../src/services/supabase';

const STATUS_COLORS: any = {
  pendiente: '#f39c12',
  preparando: '#3498db',
  listo: '#9b59b6',
  en_camino: '#e67e22',
  entregado: '#27ae60',
  cancelado: '#e74c3c',
};

const STATUS_LABELS: any = {
  pendiente: 'Pendiente',
  preparando: 'Preparando',
  listo: 'Listo',
  en_camino: 'En Camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export default function PedidoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pedidos, colors, addResena, user } = useStore();
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviandoResena, setEnviandoResena] = useState(false);
  
  const pedido = pedidos.find(p => p.id === id);

  if (!pedido) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Pedido no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()} style={[styles.btn, { backgroundColor: colors.primary, marginTop: 20 }]}>
          <Text style={{ color: '#fff' }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCalificar = async () => {
    if (rating === 0) {
      if (Platform.OS === 'web') alert('Por favor selecciona una calificación');
      else Alert.alert('Error', 'Por favor selecciona una calificación');
      return;
    }

    setEnviandoResena(true);
    try {
      await addResena({
        pedido_id: pedido.id,
        cliente_id: user?.id,
        tienda_id: pedido.tienda_id || pedido.tiendaId,
        calificacion: rating,
        comentario: comentario
      });
      if (Platform.OS === 'web') alert('¡Gracias por tu reseña!');
      else Alert.alert('Éxito', '¡Gracias por tu reseña!');
      setRating(0);
    } catch (e) {
      console.error(e);
    } finally {
      setEnviandoResena(false);
    }
  };

  const handleContactarVendedor = () => {
    router.push({
      pathname: '/chat-soporte',
      params: { 
        receptorId: pedido.tienda_id || pedido.tiendaId,
        nombreReceptor: 'Vendedor',
        pedidoId: pedido.id
      }
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.pedidoId}>Pedido #{pedido.id.slice(0, 8)}</Text>
        <Text style={styles.pedidoDate}>{new Date(pedido.createdAt || pedido.created_at).toLocaleDateString()}</Text>
      </View>

      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[pedido.status] || colors.primary }]}>
          <Text style={styles.statusText}>{STATUS_LABELS[pedido.status]?.toUpperCase() || 'PROCESANDO'}</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🛍️ Productos</Text>
        {(pedido.productos || []).map((item: any, index: number) => (
          <View key={index} style={[styles.productoItem, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>{item.nombre || item.producto?.nombre}</Text>
              <Text style={{ color: colors.subtext, fontSize: 12 }}>Cantidad: {item.cantidad}</Text>
            </View>
            <Text style={{ color: colors.text }}>${(item.precio || item.producto?.precio || 0) * item.cantidad}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>💰 Resumen</Text>
        <View style={styles.row}>
          <Text style={{ color: colors.subtext }}>Subtotal</Text>
          <Text style={{ color: colors.text }}>${pedido.subtotal || pedido.total}</Text>
        </View>
        <View style={[styles.row, { marginTop: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }]}>
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>Total</Text>
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>${pedido.total}</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>📍 Entrega</Text>
        <Text style={{ color: colors.text }}>{pedido.direccion_entrega || pedido.direccionEntrega}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary }]} onPress={handleContactarVendedor}>
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>💬 Contactar Vendedor</Text>
        </TouchableOpacity>
      </View>

      {pedido.status === 'entregado' && (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>⭐ Calificar Pedido</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(s => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <Text style={{ fontSize: 30 }}>{rating >= s ? '⭐' : '☆'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: colors.primary, marginTop: 15 }]}
            onPress={handleCalificar}
            disabled={enviandoResena}
          >
            {enviandoResena ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Enviar Reseña</Text>}
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.btn, { backgroundColor: colors.primary, margin: 15 }]}
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Volver al Inicio</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 30, alignItems: 'center' },
  pedidoId: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  pedidoDate: { fontSize: 14, color: '#fff', opacity: 0.8, marginTop: 5 },
  statusContainer: { alignItems: 'center', marginTop: -15, marginBottom: 10 },
  statusBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  section: { margin: 15, padding: 15, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  productoItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  btn: { padding: 15, borderRadius: 10, alignItems: 'center' },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  actions: { paddingHorizontal: 15 },
});
