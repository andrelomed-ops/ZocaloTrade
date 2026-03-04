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
  
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setRol: (rol: string) => void;
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
    favoritos: (s.favoritos || []).includes(id) 
      ? s.favoritos.filter(x => x !== id) 
      : [...(s.favoritos || []), id]
  })),

  addToCarrito: (p) => set((s) => ({
    carrito: [...(s.carrito || []), { producto: p, cantidad: 1 }]
  })),

  clearCarrito: () => set({ carrito: [] }),
}));
