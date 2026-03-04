import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useStore } from '../src/store/useStore';
import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';

export default function NotificacionesScreen() {
  const { notificaciones, user, loadNotificaciones, markAsRead, colors } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState<'todas' | 'no_leidas'>('todas');
  const [loading, setLoading] = useState(true);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user?.id) await loadNotificaciones(user.id);
    setRefreshing(false);
  }, [user, loadNotificaciones]);

  useEffect(() => {
    if (user?.id) {
      loadNotificaciones(user.id).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const filtered = (notificaciones || []).filter(n => 
    filtro === 'no_leidas' ? !n.leida : true
  );

  const getIcono = (tipo: string) => {
    switch (tipo) {
      case 'pedido': return '📦';
      case 'promocion': return '🎉';
      case 'sistema': return '⚙️';
      case 'chat': return '💬';
      default: return '🔔';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>Inicia sesión para ver tus notificaciones</Text>
        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: colors.primary, marginTop: 20 }]}
          onPress={() => router.push('/login')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ir al Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={[styles.filtroContainer, { backgroundColor: colors.background }]}>
          <TouchableOpacity 
            style={[styles.filtroBtn, filtro === 'todas' && { backgroundColor: colors.primary }]}
            onPress={() => setFiltro('todas')}
          >
            <Text style={[styles.filtroText, { color: colors.text }, filtro === 'todas' && { color: '#fff' }]}>Todas</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filtroBtn, filtro === 'no_leidas' && { backgroundColor: colors.primary }]}
            onPress={() => setFiltro('no_leidas')}
          >
            <Text style={[styles.filtroText, { color: colors.text }, filtro === 'no_leidas' && { color: '#fff' }]}>No leídas</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.card, 
              { backgroundColor: colors.card }, 
              !item.leida && { borderLeftWidth: 4, borderLeftColor: colors.primary }
            ]}
            onPress={() => markAsRead(item.id)}
          >
            <View style={styles.row}>
              <Text style={{ fontSize: 24, marginRight: 15 }}>{getIcono(item.tipo)}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.titulo, { color: colors.text }, !item.leida && { fontWeight: 'bold' }]}>{item.titulo}</Text>
                <Text style={[styles.mensaje, { color: colors.subtext }]}>{item.mensaje}</Text>
                <Text style={[styles.fecha, { color: colors.subtext }]}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 100 }}>
            <Text style={{ fontSize: 60 }}>🔔</Text>
            <Text style={{ color: colors.subtext, marginTop: 10 }}>No hay notificaciones</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 15 },
  filtroContainer: { flexDirection: 'row', borderRadius: 25, padding: 4 },
  filtroBtn: { flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: 'center' },
  filtroText: { fontWeight: '600', fontSize: 13 },
  card: { borderRadius: 12, padding: 15, marginBottom: 10, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  titulo: { fontSize: 15 },
  mensaje: { fontSize: 13, marginTop: 4 },
  fecha: { fontSize: 11, marginTop: 6 },
  btn: { padding: 15, borderRadius: 10, width: 200, alignItems: 'center' },
});
