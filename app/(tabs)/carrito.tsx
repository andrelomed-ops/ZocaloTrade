import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert, Platform } from 'react-native';
import { useStore } from '../../src/store/useStore';
import { router } from 'expo-router';

export default function CarritoScreen() {
  const { carrito, removeFromCarrito, colors } = useStore();

  const subtotal = (carrito || []).reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
  const total = subtotal;

  const handleCheckout = () => {
    if ((carrito || []).length === 0) {
      if (Platform.OS === 'web') alert('Carrito vacío');
      else Alert.alert('Carrito vacío', 'Agrega productos al carrito primero');
      return;
    }
    router.push('/checkout');
  };

  if ((carrito || []).length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={[styles.emptyText, { color: colors.text }]}>Tu carrito está vacío</Text>
        <TouchableOpacity 
          style={[styles.checkoutBtn, { backgroundColor: colors.primary, width: 200, marginTop: 20 }]}
          onPress={() => router.push('/(tabs)/explorar')}
        >
          <Text style={styles.checkoutBtnText}>Explorar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={carrito}
        keyExtractor={(item) => item.producto.id}
        renderItem={({ item }) => (
          <View style={[styles.itemCard, { backgroundColor: colors.card }]}>
            <Image 
              source={{ uri: item.producto.fotos?.[0] || 'https://picsum.photos/400/400' }} 
              style={styles.itemImage} 
            />
            <View style={styles.itemInfo}>
              <Text style={[styles.itemNombre, { color: colors.text }]} numberOfLines={1}>{item.producto.nombre}</Text>
              <Text style={[styles.itemPrecio, { color: colors.primary }]}>${item.producto.precio}</Text>
              <Text style={[styles.itemCantidad, { color: colors.subtext }]}>Cantidad: {item.cantidad}</Text>
            </View>
            <TouchableOpacity onPress={() => removeFromCarrito(item.producto.id)} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={[styles.resumen, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.resumenRow}>
          <Text style={[styles.resumenLabel, { color: colors.subtext }]}>Subtotal</Text>
          <Text style={[styles.resumenValue, { color: colors.text }]}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={[styles.resumenRow, styles.totalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>${total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={[styles.checkoutBtn, { backgroundColor: colors.primary }]} onPress={handleCheckout}>
          <Text style={styles.checkoutBtnText}>Hacer Pedido</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 80 },
  emptyText: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  itemCard: { flexDirection: 'row', margin: 10, padding: 15, borderRadius: 12, elevation: 2 },
  itemImage: { width: 80, height: 80, borderRadius: 8 },
  itemInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  itemNombre: { fontSize: 16, fontWeight: 'bold' },
  itemPrecio: { fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  itemCantidad: { marginTop: 5 },
  removeBtn: { padding: 10 },
  removeBtnText: { fontSize: 20, color: '#ff4444' },
  resumen: { padding: 20, borderTopWidth: 1 },
  resumenRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  resumenLabel: { fontSize: 14 },
  resumenValue: { fontSize: 14 },
  totalRow: { borderTopWidth: 1, paddingTop: 10, marginTop: 10 },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold' },
  checkoutBtn: { padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  checkoutBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
