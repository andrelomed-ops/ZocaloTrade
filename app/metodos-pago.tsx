import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Image } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MetodoPago {
  id: string;
  tipo: 'tarjeta' | 'efectivo' | 'transferencia' | 'contraentrega';
  nombre: string;
  numero?: string;
  expira?: string;
  esPrincipal: boolean;
}

const MOCK_METODOS: MetodoPago[] = [
  { id: 'contraentrega', tipo: 'contraentrega', nombre: 'Pago contraentrega', esPrincipal: true },
  { id: '1', tipo: 'tarjeta', nombre: 'Visa', numero: '**** **** **** 4242', expira: '12/26', esPrincipal: false },
  { id: '2', tipo: 'efectivo', nombre: 'Efectivo', esPrincipal: false },
];

export default function MetodosPagoScreen() {
  const insets = useSafeAreaInsets();
  const [metodos, setMetodos] = useState<MetodoPago[]>(MOCK_METODOS);
  const [mostrarAgregar, setMostrarAgregar] = useState(false);

  const eliminarMetodo = (id: string) => {
    Alert.alert(
      'Eliminar Método de Pago',
      '¿Estás seguro de eliminar este método de pago?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => {
          setMetodos(prev => prev.filter(m => m.id !== id));
        }},
      ]
    );
  };

  const establecerPrincipal = (id: string) => {
    setMetodos(prev => prev.map(m => ({
      ...m,
      esPrincipal: m.id === id,
    })));
    Alert.alert('Éxito', 'Método de pago principal actualizado');
  };

  const getIcono = (tipo: string) => {
    switch (tipo) {
      case 'tarjeta': return '💳';
      case 'efectivo': return '💵';
      case 'transferencia': return '🏦';
      case 'contraentrega': return '📦';
      default: return '💰';
    }
  };

  const getColorTarjeta = (nombre: string) => {
    if (nombre.toLowerCase().includes('visa')) return '#1a1f71';
    if (nombre.toLowerCase().includes('mastercard')) return '#eb001b';
    if (nombre.toLowerCase().includes('amex')) return '#006fcf';
    return '#333';
  };

  const renderMetodo = ({ item }: { item: MetodoPago }) => (
    <TouchableOpacity style={styles.metodoCard}>
      <View style={styles.metodoHeader}>
        <View style={styles.metodoIcon}>
          <Text style={styles.iconText}>{getIcono(item.tipo)}</Text>
        </View>
        <View style={styles.metodoInfo}>
          <Text style={styles.metodoNombre}>{item.nombre}</Text>
          {item.numero && (
            <Text style={styles.metodoNumero}>{item.numero}</Text>
          )}
          {item.expira && (
            <Text style={styles.metodoExpira}>Expira: {item.expira}</Text>
          )}
        </View>
        {item.esPrincipal && (
          <View style={styles.principalBadge}>
            <Text style={styles.principalBadgeText}>Principal</Text>
          </View>
        )}
      </View>

      {item.tipo === 'tarjeta' && (
        <View style={[styles.tarjetaVisual, { backgroundColor: getColorTarjeta(item.nombre) }]}>
          <Text style={styles.tarjetaNombre}>{item.nombre}</Text>
          <Text style={styles.tarjetaNumero}>{item.numero}</Text>
          <View style={styles.tarjetaFooter}>
            <Text style={styles.tarjetaExpira}>{item.expira}</Text>
            <Text style={styles.tarjetaTipo}>DÉBITO</Text>
          </View>
        </View>
      )}

      {item.tipo === 'contraentrega' && (
        <View style={[styles.tarjetaVisual, { backgroundColor: '#27ae60' }]}>
          <Text style={styles.tarjetaNombre}>📦 Pago contraentrega</Text>
          <Text style={styles.tarjetaNumero}>Paga cuando recibas tu pedido</Text>
          <View style={styles.tarjetaFooter}>
            <Text style={styles.tarjetaExpira}>Disponible en toda la CDMX</Text>
            <Text style={styles.tarjetaTipo}>SIN COSTO</Text>
          </View>
        </View>
      )}

      <View style={styles.metodoActions}>
        {!item.esPrincipal && (
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => establecerPrincipal(item.id)}
          >
            <Text style={styles.actionText}>Establecer principal</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.actionBtn, styles.eliminarBtn]}
          onPress={() => eliminarMetodo(item.id)}
        >
          <Text style={[styles.actionText, styles.eliminarText]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Métodos de Pago</Text>
        <Text style={styles.headerSubtitle}>Gestiona tus métodos de pago</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>🔒</Text>
        <Text style={styles.infoText}>
          Tus datos de pago están seguros. Usamos encriptación de nivel bancario.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Métodos guardados</Text>

      <FlatList
        data={metodos}
        keyExtractor={(item) => item.id}
        renderItem={renderMetodo}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyText}>No tienes métodos de pago</Text>
          </View>
        }
      />

      <View style={styles.metodosPopulares}>
        {!mostrarAgregar ? (
          <TouchableOpacity 
            style={styles.agregarBtn}
            onPress={() => setMostrarAgregar(true)}
          >
            <Text style={styles.agregarBtnIcon}>+</Text>
            <Text style={styles.agregarBtnText}>Agregar nuevo método de pago</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.agregarOpcion}
              onPress={() => {
                const nuevoMetodo: MetodoPago = {
                  id: Date.now().toString(),
                  tipo: 'tarjeta',
                  nombre: 'Nueva Tarjeta',
                  numero: '**** **** **** ' + Math.floor(1000 + Math.random() * 9000),
                  expira: '12/27',
                  esPrincipal: false,
                };
                setMetodos([...metodos, nuevoMetodo]);
                setMostrarAgregar(false);
                Alert.alert('Éxito', 'Tarjeta agregada correctamente');
              }}
            >
              <Text style={styles.agregarIcon}>💳</Text>
              <Text style={styles.agregarText}>Agregar tarjeta de débito/crédito</Text>
              <Text style={styles.agregarArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.agregarOpcion}
              onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
            >
              <Text style={styles.agregarIcon}>🏦</Text>
              <Text style={styles.agregarText}>Transferencia bancaria</Text>
              <Text style={styles.agregarArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.agregarOpcion}
              onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
            >
              <Text style={styles.agregarIcon}>🏦</Text>
              <Text style={styles.agregarText}>Transferencia bancaria</Text>
              <Text style={styles.agregarArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelarBtn}
              onPress={() => setMostrarAgregar(false)}
            >
              <Text style={styles.cancelarBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0', paddingBottom: 20 },
  header: { backgroundColor: '#FF6B35', padding: 20, paddingTop: 40 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { color: '#fff', opacity: 0.9, marginTop: 5 },
  infoCard: { flexDirection: 'row', backgroundColor: '#d4edda', margin: 15, padding: 15, borderRadius: 10, alignItems: 'center' },
  infoIcon: { fontSize: 24, marginRight: 10 },
  infoText: { flex: 1, color: '#155724', fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 15, marginTop: 15, marginBottom: 10 },
  list: { padding: 15, paddingTop: 5 },
  emptyContainer: { alignItems: 'center', paddingTop: 40 },
  emptyIcon: { fontSize: 60 },
  emptyText: { fontSize: 18, color: '#666', marginTop: 15 },
  metodoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  metodoHeader: { flexDirection: 'row', alignItems: 'center' },
  metodoIcon: { width: 50, height: 50, backgroundColor: '#f0f0f0', borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  iconText: { fontSize: 24 },
  metodoInfo: { flex: 1, marginLeft: 15 },
  metodoNombre: { fontSize: 16, fontWeight: 'bold' },
  metodoNumero: { color: '#666', marginTop: 2 },
  metodoExpira: { color: '#999', fontSize: 12, marginTop: 2 },
  principalBadge: { backgroundColor: '#FF6B35', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  principalBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  tarjetaVisual: { marginTop: 15, padding: 20, borderRadius: 12, height: 140, justifyContent: 'space-between' },
  tarjetaNombre: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  tarjetaNumero: { color: '#fff', fontSize: 20, letterSpacing: 2 },
  tarjetaFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  tarjetaExpira: { color: '#fff', fontSize: 12 },
  tarjetaTipo: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  metodoActions: { flexDirection: 'row', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderColor: '#eee' },
  actionBtn: { flex: 1, paddingVertical: 8 },
  actionText: { color: '#FF6B35', fontWeight: '600', textAlign: 'center' },
  eliminarBtn: { borderLeftWidth: 1, borderColor: '#eee' },
  eliminarText: { color: '#ff4444' },
  metodosPopulares: { backgroundColor: '#fff', padding: 15, marginTop: 10 },
  agregarOpcion: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#eee' },
  agregarIcon: { fontSize: 24, marginRight: 15 },
  agregarText: { flex: 1, fontSize: 16 },
  agregarArrow: { color: '#999', fontSize: 18 },
  agregarBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF6B35', padding: 15, borderRadius: 10 },
  agregarBtnIcon: { fontSize: 20, color: '#fff', marginRight: 10, fontWeight: 'bold' },
  agregarBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelarBtn: { marginTop: 10, padding: 15, alignItems: 'center' },
  cancelarBtnText: { color: '#FF6B35', fontSize: 16 },
});
