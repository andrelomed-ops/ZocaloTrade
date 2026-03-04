import { create } from 'zustand';
import { supabase, TABLES } from '../services/supabase';

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  fotos: string[];
  tiendaId: string;
  disponible: boolean;
}

export interface Tienda {
  id: string;
  nombre: string;
  fotoPerfil: string;
  rating: number;
  categoria: string;
  descripcion?: string;
  latitud?: number;
  longitud?: number;
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  fotoPerfil?: string;
}

export const CATEGORIAS = ['Todos', 'Comida', 'Bebidas', 'Artesanía', 'Ropa', 'Accesorios'];

export const MOCK_PRODUCTOS: Producto[] = [
  { id: '1', nombre: 'Tamal de Mole', descripcion: 'Delicioso tamal tradicional', precio: 45, categoria: 'Comida', fotos: ['https://picsum.photos/400/400?random=1'], tiendaId: 't1', disponible: true },
  { id: '2', nombre: 'Pulsera Artesanal', descripcion: 'Hecha a mano', precio: 80, categoria: 'Artesanía', fotos: ['https://picsum.photos/400/400?random=2'], tiendaId: 't1', disponible: true },
];

export const MOCK_TIENDAS: Tienda[] = [
  { id: 't1', nombre: 'Tienda Zócalo', fotoPerfil: 'https://picsum.photos/100/100?random=10', rating: 4.9, categoria: 'General' },
];

interface AppState {
  user: User | null;
  rol: string;
  productos: Producto[];
  tiendas: Tienda[];
  carrito: any[];
  pedidos: any[];
  favoritos: string[];
  notificaciones: any[];
  initialized: boolean;
  darkMode: boolean;
  colors: any;
  userLocation: { lat: number; lng: number } | null;
  
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setRol: (rol: string) => void;
  setDarkMode: (darkMode: boolean) => void;
  setUserLocation: (loc: { lat: number; lng: number } | null) => void;
  toggleFavorito: (id: string) => void;
  addToCarrito: (p: any, cantidad?: number) => void;
  removeFromCarrito: (id: string) => void;
  clearCarrito: () => void;
  addPedido: (p: any) => Promise<void>;
  loadPedidos: (userId: string) => Promise<void>;
  updatePedidoStatus: (id: string, status: string) => Promise<void>;
  loadUserExtras: (userId: string) => Promise<void>;
  addResena: (resena: any) => Promise<void>;
  loadNotificaciones: (userId: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

const LIGHT_COLORS = {
  background: '#f8f8f8',
  card: '#ffffff',
  text: '#333333',
  subtext: '#666666',
  primary: '#FF6B35',
  border: '#eeeeee',
};

const DARK_COLORS = {
  background: '#121212',
  card: '#1e1e1e',
  text: '#ffffff',
  subtext: '#aaaaaa',
  primary: '#FF6B35',
  border: '#333333',
};

export const useStore = create<AppState>((set, get) => ({
  user: null,
  rol: 'cliente',
  productos: [],
  tiendas: [],
  carrito: [],
  pedidos: [],
  favoritos: [],
  notificaciones: [],
  initialized: false,
  darkMode: false,
  colors: LIGHT_COLORS,
  userLocation: null,
  
  setUser: (user) => set({ user }),
  setRol: (rol) => set({ rol }),
  setDarkMode: (darkMode) => set({ 
    darkMode, 
    colors: darkMode ? DARK_COLORS : LIGHT_COLORS 
  }),
  setUserLocation: (userLocation) => set({ userLocation }),
  
  initialize: async () => {
    if (get().initialized) return;
    try {
      const { data: p } = await supabase.from(TABLES.PRODUCTOS).select('*').eq('activo', true);
      const { data: t } = await supabase.from(TABLES.TIENDAS).select('*').eq('activa', true);
      
      set({
        productos: (p && p.length > 0) ? p.map((item: any) => ({ ...item, tiendaId: item.tienda_id, fotos: item.fotos || ['https://picsum.photos/400/400'], disponible: item.activo })) : MOCK_PRODUCTOS,
        tiendas: (t && t.length > 0) ? t : MOCK_TIENDAS,
        initialized: true,
      });
    } catch (e) {
      set({ productos: MOCK_PRODUCTOS, tiendas: MOCK_TIENDAS, initialized: true });
    }
  },

  loadUserExtras: async (userId: string) => {
    try {
      const { data: profile } = await supabase.from('perfiles').select('favoritos').eq('id', userId).maybeSingle();
      if (profile?.favoritos) set({ favoritos: profile.favoritos });
      
      const { data: notifs } = await supabase.from('notificaciones').select('*').eq('usuario_id', userId).order('created_at', { ascending: false });
      if (notifs) set({ notificaciones: notifs });
    } catch (e) {}
  },

  toggleFavorito: (id) => set((s) => ({
    favoritos: (s.favoritos || []).includes(id) ? s.favoritos.filter(x => x !== id) : [...(s.favoritos || []), id]
  })),

  addToCarrito: (producto, cantidad = 1) => set((s) => {
    const existing = s.carrito.find(item => item.producto.id === producto.id);
    if (existing) {
      return {
        carrito: s.carrito.map(item =>
          item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + cantidad } : item
        )
      };
    }
    return { carrito: [...s.carrito, { producto, cantidad }] };
  }),

  removeFromCarrito: (id) => set((s) => ({
    carrito: s.carrito.filter(item => item.producto.id !== id)
  })),

  clearCarrito: () => set({ carrito: [] }),

  addPedido: async (pedido: any) => {
    try {
      const { data } = await supabase.from(TABLES.PEDIDOS).insert(pedido).select().single();
      if (data) set((s) => ({ pedidos: [data, ...s.pedidos] }));
    } catch (e) {}
  },

  loadPedidos: async (userId: string) => {
    try {
      const { data } = await supabase.from(TABLES.PEDIDOS).select('*').eq('cliente_id', userId).order('created_at', { ascending: false });
      if (data) set({ pedidos: data });
    } catch (e) {}
  },

  updatePedidoStatus: async (id: string, status: string) => {
    try {
      await supabase.from(TABLES.PEDIDOS).update({ status }).eq('id', id);
      set((s) => ({ pedidos: s.pedidos.map(p => p.id === id ? { ...p, status } : p) }));
    } catch (e) {}
  },

  addResena: async (resena: any) => {
    try {
      await supabase.from('resenas').insert(resena);
    } catch (e) {}
  },

  loadNotificaciones: async (userId: string) => {
    try {
      const { data } = await supabase.from('notificaciones').select('*').eq('usuario_id', userId).order('created_at', { ascending: false });
      if (data) set({ notificaciones: data });
    } catch (e) {}
  },

  markAsRead: async (id: string) => {
    try {
      await supabase.from('notificaciones').update({ leida: true }).eq('id', id);
      set((s) => ({
        notificaciones: s.notificaciones.map(n => n.id === id ? { ...n, leida: true } : n)
      }));
    } catch (e) {}
  },
}));
