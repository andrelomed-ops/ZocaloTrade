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
  stock?: number;
}

export interface Tienda {
  id: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  latitud: number;
  longitud: number;
  fotoPerfil: string;
  rating: number;
  categoria: string;
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  fotoPerfil?: string;
}

export const CATEGORIAS = ['Todos', 'Comida', 'Bebidas', 'Artesanía', 'Ropa', 'Accesorios'];

export const MOCK_PRODUCTOS: Producto[] = [
  { id: '1', nombre: 'Producto Tradicional', descripcion: 'Hecho a mano', precio: 150, categoria: 'Artesanía', fotos: ['https://picsum.photos/400/400'], tiendaId: 't1', disponible: true },
];

export const MOCK_TIENDAS: Tienda[] = [
  { id: 't1', nombre: 'Tienda Zocalo', descripcion: 'Lo mejor del centro', direccion: 'Zócalo, CDMX', latitud: 0, longitud: 0, fotoPerfil: 'https://picsum.photos/100/100', rating: 5.0, categoria: 'General' },
];

interface AppState {
  user: User | null;
  rol: string;
  productos: Producto[];
  tiendas: Tienda[];
  carrito: any[];
  pedidos: any[];
  favoritos: string[];
  initialized: boolean;
  darkMode: boolean;
  colors: any;
  
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setRol: (rol: string) => void;
  setDarkMode: (darkMode: boolean) => void;
  toggleFavorito: (id: string) => void;
  addToCarrito: (p: any) => void;
  clearCarrito: () => void;
  addPedido: (p: any) => Promise<void>;
  loadPedidos: (userId: string) => Promise<void>;
  updatePedidoStatus: (id: string, status: string) => Promise<void>;
  loadUserExtras: (userId: string) => Promise<void>;
  addResena: (resena: any) => Promise<void>;
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

export const useStore = create<AppState>((set) => ({
  user: null,
  rol: 'cliente',
  productos: [],
  tiendas: [],
  carrito: [],
  pedidos: [],
  favoritos: [],
  initialized: false,
  darkMode: false,
  colors: LIGHT_COLORS,
  
  setUser: (user) => set({ user }),
  setRol: (rol) => set({ rol }),
  setDarkMode: (darkMode) => set({ 
    darkMode, 
    colors: darkMode ? DARK_COLORS : LIGHT_COLORS 
  }),
  
  initialize: async () => {
    try {
      // 1. Cargar Categorías (puedes crear una tabla o usarlas fijas, aquí las traemos de productos)
      const { data: catData } = await supabase.from(TABLES.PRODUCTOS).select('categoria').not('categoria', 'is', null);
      const uniqueCats = ['Todos', ...new Set((catData || []).map(item => item.categoria))];

      // 2. Cargar productos y tiendas
      const { data: p } = await supabase.from(TABLES.PRODUCTOS).select('*').eq('activo', true);
      const { data: t } = await supabase.from(TABLES.TIENDAS).select('*').eq('activa', true);
      
      const formattedProducts = (p || []).map((item: any) => ({
        ...item,
        tiendaId: item.tienda_id,
        fotos: item.fotos || ['https://picsum.photos/400/400']
      }));

      set({
        productos: formattedProducts.length > 0 ? formattedProducts : MOCK_PRODUCTOS,
        tiendas: t || MOCK_TIENDAS,
        initialized: true,
      });
    } catch (e) {
      console.error('Store Init Error:', e);
      set({ productos: MOCK_PRODUCTOS, tiendas: MOCK_TIENDAS, initialized: true });
    }
  },

  loadUserExtras: async (userId: string) => {
    try {
      const { data: favs } = await supabase.from('perfiles').select('favoritos').eq('id', userId).single();
      if (favs?.favoritos) set({ favoritos: favs.favoritos });

      const { data: carts } = await supabase.from('perfiles').select('carrito').eq('id', userId).single();
      if (carts?.carrito) set({ carrito: carts.carrito });
    } catch (e) {}
  },

  toggleFavorito: (id) => set((s) => ({
    favoritos: (s.favoritos || []).includes(id) 
      ? s.favoritos.filter(x => x !== id) 
      : [...(s.favoritos || []), id]
  })),

  addToCarrito: (p) => set((s) => ({
    carrito: [...(s.carrito || []), { producto: p, cantidad: 1 }]
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
}));
