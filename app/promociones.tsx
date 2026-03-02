import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

interface Promo {
  id: string;
  titulo: string;
  descripcion: string;
  codigo: string;
  descuento: number;
  tipo: 'porcentaje' | 'fijo';
  minimo: number;
  expiresAt: string;
  imagen: string;
  activo: boolean;
}

const MOCK_PROMOS: Promo[] = [
  { id: '1', titulo: '20% en Artesanías', descripcion: 'Arte tradicional mexicano con descuento especial', codigo: 'ARTESANIA20', descuento: 20, tipo: 'porcentaje', minimo: 100, expiresAt: '2024-12-31', imagen: 'https://picsum.photos/400/200?random=21', activo: true },
  { id: '2', titulo: '🍽️ Descuento Comida', descripcion: '10% de descuento en tu comida favorita', codigo: 'COMIDA10', descuento: 10, tipo: 'porcentaje', minimo: 50, expiresAt: '2024-12-31', imagen: 'https://picsum.photos/400/200?random=22', activo: true },
  { id: '3', titulo: '🎉 Envío Gratis', descripcion: 'Envío sin costo en pedidos mayores a $200', codigo: 'ENVIOGRATIS', descuento: 100, tipo: 'fijo', minimo: 200, expiresAt: '2024-12-31', imagen: 'https://picsum.photos/400/200?random=23', activo: true },
  { id: '4', titulo: 'Primera Compra', descripcion: '15% de descuento en tu primera compra', codigo: 'BIENVENIDO15', descuento: 15, tipo: 'porcentaje', minimo: 0, expiresAt: '2024-12-31', imagen: 'https://picsum.photos/400/200?random=24', activo: true },
];

export default function PromocionesScreen() {
  const [promos] = useState<Promo[]>(MOCK_PROMOS);
  const [codigoInput, setCodigoInput] = useState('');
  const [codigoAplicado, setCodigoAplicado] = useState<string | null>(null);

  const aplicarCodigo = () => {
    const promo = promos.find(p => p.codigo.toUpperCase() === codigoInput.toUpperCase());
    if (promo) {
      setCodigoAplicado(promo.codigo);
    }
  };

  const renderPromo = ({ item }: { item: Promo }) => (
    <View style={[styles.promoCard, !item.activo && styles.promoInactivo]}>
      <Image source={{ uri: item.imagen }} style={styles.promoImagen} />
      <View style={styles.promoContent}>
        <View style={styles.promoHeader}>
          <Text style={styles.promoTitulo}>{item.titulo}</Text>
          <View style={styles.descuentoBadge}>
            <Text style={styles.descuentoText}>
              {item.tipo === 'porcentaje' ? `-${item.descuento}%` : `-$${item.descuento}`}
            </Text>
          </View>
        </View>
        <Text style={styles.promoDescripcion}>{item.descripcion}</Text>
        <View style={styles.promoFooter}>
          <View style={styles.codigoContainer}>
            <Text style={styles.codigo}>{item.codigo}</Text>
          </View>
          <Text style={styles.minimo}>Mín. ${item.minimo}</Text>
        </View>
        <TouchableOpacity 
          style={styles.copiarBtn}
          onPress={() => setCodigoInput(item.codigo)}
        >
          <Text style={styles.copiarBtnText}>Usar código</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎁 Promociones y Descuentos</Text>
        <Text style={styles.headerSubtitle}>Ahorra en tus compras del Zócalo</Text>
      </View>

      <View style={styles.aplicarSection}>
        <Text style={styles.aplicarLabel}>¿Tienes un código de descuento?</Text>
        <View style={styles.aplicarRow}>
          <TextInput
            style={styles.codigoInput}
            placeholder="Ingresa tu código"
            value={codigoInput}
            onChangeText={setCodigoInput}
            autoCapitalize="characters"
          />
          <TouchableOpacity 
            style={[styles.aplicarBtn, codigoInput && styles.aplicarBtnActivo]}
            onPress={aplicarCodigo}
            disabled={!codigoInput}
          >
            <Text style={styles.aplicarBtnText}>Aplicar</Text>
          </TouchableOpacity>
        </View>
        {codigoAplicado && (
          <View style={styles.aplicadoBadge}>
            <Text style={styles.aplicadoText}>✓ Código "{codigoAplicado}" aplicado</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Promociones Activas</Text>

      <FlatList
        data={promos.filter(p => p.activo)}
        keyExtractor={(item) => item.id}
        renderItem={renderPromo}
        contentContainerStyle={styles.list}
      />

      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          Los códigos de descuento se aplican en el checkout. Cada código puede usarse una vez por usuario.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#FF6B35', padding: 20, paddingTop: 40 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { color: '#fff', opacity: 0.9, marginTop: 5 },
  aplicarSection: { backgroundColor: '#fff', padding: 15, marginTop: -20, marginHorizontal: 15, borderRadius: 12, elevation: 3 },
  aplicarLabel: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  aplicarRow: { flexDirection: 'row' },
  codigoInput: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 10, padding: 12, fontSize: 16, marginRight: 10 },
  aplicarBtn: { backgroundColor: '#ccc', paddingHorizontal: 20, borderRadius: 10, justifyContent: 'center' },
  aplicarBtnActivo: { backgroundColor: '#FF6B35' },
  aplicarBtnText: { color: '#fff', fontWeight: 'bold' },
  aplicadoBadge: { backgroundColor: '#d4edda', padding: 10, borderRadius: 8, marginTop: 10 },
  aplicadoText: { color: '#155724', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', margin: 15, marginBottom: 10 },
  list: { padding: 15, paddingTop: 0 },
  promoCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 15, overflow: 'hidden', elevation: 2 },
  promoInactivo: { opacity: 0.6 },
  promoImagen: { width: '100%', height: 120 },
  promoContent: { padding: 15 },
  promoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  promoTitulo: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  descuentoBadge: { backgroundColor: '#e74c3c', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  descuentoText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  promoDescripcion: { color: '#666', marginTop: 8 },
  promoFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  codigoContainer: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  codigo: { fontWeight: 'bold', color: '#333', letterSpacing: 1 },
  minimo: { marginLeft: 10, color: '#999', fontSize: 12 },
  copiarBtn: { marginTop: 12, backgroundColor: '#FF6B35', padding: 10, borderRadius: 8, alignItems: 'center' },
  copiarBtnText: { color: '#fff', fontWeight: 'bold' },
  infoCard: { flexDirection: 'row', backgroundColor: '#fff3cd', margin: 15, padding: 15, borderRadius: 10, alignItems: 'center' },
  infoIcon: { fontSize: 24, marginRight: 10 },
  infoText: { flex: 1, color: '#856404', fontSize: 13 },
});
