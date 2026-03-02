import { View, Text, FlatList, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useState } from 'react';

interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'pedido' | 'promocion' | 'sistema' | 'chat';
  leida: boolean;
  fecha: string;
  data?: any;
}

const MOCK_NOTIFICACIONES: Notificacion[] = [
  { id: '1', titulo: 'Pedido confirmado', mensaje: 'Tu pedido #847291 ha sido confirmado y está siendo preparado', tipo: 'pedido', leida: false, fecha: 'Ahora' },
  { id: '2', titulo: '20% de descuento', mensaje: '¡Hoy solo!20% de descuento en artesanías del Zócalo', tipo: 'promocion', leida: false, fecha: 'Hace 2 horas' },
  { id: '3', titulo: 'Nuevo mensaje', mensaje: 'Don Juan Tamales te envió un mensaje sobre tu pedido', tipo: 'chat', leida: true, fecha: 'Ayer' },
  { id: '4', titulo: 'Entrega completada', mensaje: 'Tu pedido #847280 fue entregado exitosamente', tipo: 'pedido', leida: true, fecha: 'Ayer' },
  { id: '5', titulo: 'App actualizada', mensaje: 'ZocaloTrade tiene nuevas funciones. ¡Descúbrelas!', tipo: 'sistema', leida: true, fecha: 'Hace 3 días' },
];

export default function NotificacionesScreen() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(MOCK_NOTIFICACIONES);
  const [filtro, setFiltro] = useState<'todas' | 'no_leidas'>('todas');

  const notificacionesFiltradas = filtro === 'no_leidas' 
    ? notificaciones.filter(n => !n.leida)
    : notificaciones;

  const toggleLeida = (id: string) => {
    setNotificaciones(prev => prev.map(n => 
      n.id === id ? { ...n, leida: !n.leida } : n
    ));
  };

  const getIcono = (tipo: string) => {
    switch (tipo) {
      case 'pedido': return '📦';
      case 'promocion': return '🎉';
      case 'sistema': return '⚙️';
      case 'chat': return '💬';
      default: return '🔔';
    }
  };

  const getColor = (tipo: string) => {
    switch (tipo) {
      case 'pedido': return '#3498db';
      case 'promocion': return '#e74c3c';
      case 'sistema': return '#95a5a6';
      case 'chat': return '#9b59b6';
      default: return '#FF6B35';
    }
  };

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  const renderNotificacion = ({ item }: { item: Notificacion }) => (
    <TouchableOpacity 
      style={[styles.notificacionCard, !item.leida && styles.noLeida]}
      onPress={() => toggleLeida(item.id)}
    >
      <View style={[styles.iconContainer, { backgroundColor: getColor(item.tipo) }]}>
        <Text style={styles.icono}>{getIcono(item.tipo)}</Text>
      </View>
      <View style={styles.notificacionContent}>
        <View style={styles.notificacionHeader}>
          <Text style={[styles.notificacionTitulo, !item.leida && styles.tituloBold]}>
            {item.titulo}
          </Text>
          {!item.leida && <View style={styles.badgeNew} />}
        </View>
        <Text style={styles.notificacionMensaje} numberOfLines={2}>{item.mensaje}</Text>
        <Text style={styles.notificacionFecha}>{item.fecha}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.filtroContainer}>
          <TouchableOpacity 
            style={[styles.filtroBtn, filtro === 'todas' && styles.filtroActivo]}
            onPress={() => setFiltro('todas')}
          >
            <Text style={[styles.filtroText, filtro === 'todas' && styles.filtroTextActivo]}>
              Todas ({notificaciones.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filtroBtn, filtro === 'no_leidas' && styles.filtroActivo]}
            onPress={() => setFiltro('no_leidas')}
          >
            <Text style={[styles.filtroText, filtro === 'no_leidas' && styles.filtroTextActivo]}>
              No leídas ({noLeidas})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={notificacionesFiltradas}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificacion}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>No tienes notificaciones</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#FF6B35', padding: 15, paddingTop: 40 },
  filtroContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 25, padding: 3 },
  filtroBtn: { flex: 1, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  filtroActivo: { backgroundColor: '#fff' },
  filtroText: { color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  filtroTextActivo: { color: '#FF6B35' },
  list: { padding: 15 },
  notificacionCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, elevation: 1 },
  noLeida: { backgroundColor: '#fff9f0', borderLeftWidth: 4, borderLeftColor: '#FF6B35' },
  iconContainer: { width: 45, height: 45, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  icono: { fontSize: 22 },
  notificacionContent: { flex: 1, marginLeft: 12 },
  notificacionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notificacionTitulo: { fontSize: 15, fontWeight: '600', color: '#333' },
  tituloBold: { fontWeight: 'bold' },
  badgeNew: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF6B35' },
  notificacionMensaje: { color: '#666', fontSize: 13, marginTop: 4 },
  notificacionFecha: { color: '#999', fontSize: 11, marginTop: 6 },
  emptyContainer: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 60 },
  emptyText: { fontSize: 18, color: '#666', marginTop: 15 },
});
