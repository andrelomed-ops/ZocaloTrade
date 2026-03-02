import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useStore } from '../../src/store/useStore';
import { router } from 'expo-router';

export default function CarritoScreen() {
  const { carrito, removeFromCarrito, clearCarrito, addPedido } = useStore();

  const subtotal = carrito.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
  const comision = subtotal * 0.1;
  const total = subtotal + comision;

  const handleCheckout = () => {
    if (carrito.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos al carrito primero');
      return;
    }

    router.push('/checkout');
  };

  if (carrito.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyText}>Tu carrito está vacío</Text>
        <Text style={styles.emptySubtext}>Explora y agrega productos</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={carrito}
        keyExtractor={(item) => item.producto.id}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Image source={{ uri: item.producto.foto }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemNombre} numberOfLines={1}>{item.producto.nombre}</Text>
              <Text style={styles.itemPrecio}>${item.producto.precio}</Text>
              <Text style={styles.itemCantidad}>Cantidad: {item.cantidad}</Text>
            </View>
            <TouchableOpacity onPress={() => removeFromCarrito(item.producto.id)} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.resumen}>
        <View style={styles.resumenRow}>
          <Text style={styles.resumenLabel}>Subtotal</Text>
          <Text style={styles.resumenValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.resumenRow}>
          <Text style={styles.resumenLabel}>Comisión (10%)</Text>
          <Text style={styles.resumenValue}>${comision.toFixed(2)}</Text>
        </View>
        <View style={[styles.resumenRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
          <Text style={styles.checkoutBtnText}>Hacer Pedido</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  emptyIcon: { fontSize: 80 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 20 },
  emptySubtext: { fontSize: 16, color: '#666', marginTop: 5 },
  itemCard: { flexDirection: 'row', backgroundColor: '#fff', margin: 10, padding: 15, borderRadius: 12, elevation: 2 },
  itemImage: { width: 80, height: 80, borderRadius: 8 },
  itemInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  itemNombre: { fontSize: 16, fontWeight: 'bold' },
  itemPrecio: { fontSize: 18, fontWeight: 'bold', color: '#FF6B35', marginTop: 5 },
  itemCantidad: { color: '#666', marginTop: 5 },
  removeBtn: { padding: 10 },
  removeBtnText: { fontSize: 20, color: '#ff4444' },
  resumen: { backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderColor: '#eee' },
  resumenRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  resumenLabel: { color: '#666', fontSize: 14 },
  resumenValue: { fontSize: 14 },
  totalRow: { borderTopWidth: 1, borderColor: '#eee', paddingTop: 10, marginTop: 10 },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#FF6B35' },
  checkoutBtn: { backgroundColor: '#FF6B35', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  checkoutBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
