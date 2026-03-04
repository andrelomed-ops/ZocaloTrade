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

export interface Pedido {
  id: string;
  status: string;
  total: number;
  createdAt: string;
}

export const MOCK_PRODUCTOS: Producto[] = [
  { id: '1', nombre: 'Tamal de Mole', descripcion: 'Tradicional', precio: 45, categoria: 'Comida', fotos: ['https://picsum.photos/400/400'], tiendaId: 't1', disponible: true },
];

export const MOCK_TIENDAS: Tienda[] = [
  { id: 't1', nombre: 'Don Juan Tamales', descripcion: 'Calidad', direccion: 'Centro', latitud: 0, longitud: 0, fotoPerfil: 'https://picsum.photos/100/100', rating: 4.8, categoria: 'Comida' },
];

export const CATEGORIAS = ['Todos', 'Comida', 'Bebidas', 'Artesanía', 'Ropa', 'Accesorios'];

interface AppState {
  user: User | null;
  rol: 'cliente' | 'vendedor' | 'repartidor' | null;
  productos: Producto[];
  tiendas: Tienda[];
  carrito: any[];
  pedidos: Pedido[];
  favoritos: string[];
  initialized: boolean;
  darkMode: boolean;
  
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setRol: (rol: 'cliente' | 'vendedor' | 'repartidor' | null) => void;
  setDarkMode: (darkMode: boolean) => void;
  toggleFavorito: (id: string) => void;
  addToCarrito: (p: any) => void;
  clearCarrito: () => void;
}

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
  
  setUser: (user) => set({ user }),
  setRol: (rol) => set({ rol }),
  setDarkMode: (darkMode) => set({ darkMode }),
  
  initialize: async () => {
    try {
      const { data: p } = await supabase.from(TABLES.PRODUCTOS).select('*').eq('activo', true);
      const { data: t } = await supabase.from(TABLES.TIENDAS).select('*').eq('activa', true);
      
      set({
        productos: (p && p.length > 0) ? p.map((item: any) => ({ ...item, tiendaId: item.tienda_id })) : MOCK_PRODUCTOS,
        tiendas: (t && t.length > 0) ? t : MOCK_TIENDAS,
        initialized: true,
      });
    } catch (e) {
      set({ productos: MOCK_PRODUCTOS, tiendas: MOCK_TIENDAS, initialized: true });
    }
  },

  toggleFavorito: (id) => set((s) => ({
    favoritos: s.favoritos?.includes(id) ? s.favoritos.filter(x => x !== id) : [...(s.favoritos || []), id]
  })),

  addToCarrito: (p) => set((s) => ({
    carrito: [...(s.carrito || []), { producto: p, cantidad: 1 }]
  })),

  clearCarrito: () => set({ carrito: [] }),
}));
