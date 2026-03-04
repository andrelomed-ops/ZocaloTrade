import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../src/store/useStore';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const state = useStore();
  
  const carrito = state.carrito || [];
  const favoritos = state.favoritos || [];
  const pedidos = state.pedidos || [];
  
  const cartCount = carrito.reduce((sum, item) => sum + (item.cantidad || 0), 0);
  const favoritosCount = favoritos.length;
  const pedidosCount = pedidos.filter(p => p && p.status !== 'entregado' && p.status !== 'cancelado').length;
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: { 
          backgroundColor: '#ffffff', 
          borderTopWidth: 1, 
          paddingBottom: insets.bottom > 0 ? insets.bottom : 5, 
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
          marginBottom: insets.bottom,
        },
        headerStyle: { backgroundColor: '#FF6B35', paddingTop: insets.top },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <TabIcon name="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explorar"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color }) => <TabIcon name="🔍" color={color} />,
        }}
      />
      <Tabs.Screen
        name="carrito"
        options={{
          title: 'Carrito',
          tabBarIcon: ({ color }) => <TabIcon name="🛒" color={color} />,
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />
      <Tabs.Screen
        name="pedidos"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color }) => <TabIcon name="📦" color={color} />,
          tabBarBadge: pedidosCount > 0 ? pedidosCount : undefined,
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => <TabIcon name="❤️" color={color} />,
          tabBarBadge: favoritosCount > 0 ? favoritosCount : undefined,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <TabIcon name="👤" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ name, color }: { name: string; color: string }) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, { color: color === '#FF6B35' ? '#FF6B35' : '#666' }]}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: { alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 22 },
});
