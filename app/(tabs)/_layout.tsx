import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../src/store/useStore';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const state = useStore();
  const { colors } = state;
  const { t } = useTranslation();
  
  const carrito = state.carrito || [];
  const favoritos = state.favoritos || [];
  const pedidos = state.pedidos || [];
  
  const cartCount = carrito.reduce((sum, item) => sum + (item.cantidad || 0), 0);
  const favoritosCount = favoritos.length;
  const pedidosCount = pedidos.filter(p => p && p.status !== 'entregado' && p.status !== 'cancelado').length;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: { 
          backgroundColor: colors.card, 
          borderTopWidth: 1, 
          borderTopColor: colors.border,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 5, 
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
        },
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('inicio'),
          tabBarIcon: ({ color }) => <TabIcon name="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explorar"
        options={{
          title: t('explorar'),
          tabBarIcon: ({ color }) => <TabIcon name="🔍" color={color} />,
        }}
      />
      <Tabs.Screen
        name="carrito"
        options={{
          title: t('carrito'),
          tabBarIcon: ({ color }) => <TabIcon name="🛒" color={color} count={cartCount} />,
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />
      <Tabs.Screen
        name="pedidos"
        options={{
          title: t('pedidos'),
          tabBarIcon: ({ color }) => <TabIcon name="📦" color={color} count={pedidosCount} />,
          tabBarBadge: pedidosCount > 0 ? pedidosCount : undefined,
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: t('favoritos'),
          tabBarIcon: ({ color }) => <TabIcon name="❤️" color={color} count={favoritosCount} />,
          tabBarBadge: favoritosCount > 0 ? favoritosCount : undefined,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: t('perfil'),
          tabBarIcon: ({ color }) => <TabIcon name="👤" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ name, color, count = 0 }: { name: string; color: string; count?: number }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count > 0) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.2, duration: 150, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    }
  }, [count]);

  return (
    <Animated.View style={[styles.iconContainer, { transform: [{ scale }] }]}>
      <Text style={[styles.icon, { color }]}>{name}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  iconContainer: { alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 22 },
});
