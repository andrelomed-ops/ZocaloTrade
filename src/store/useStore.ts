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
  nombre_tienda?: string;
}

export interface User {
  id: string;
  nombre: string;
  email: string;
}

export const CATEGORIAS = ['Todos', 'Comida', 'Bebidas', 'Artesanía', 'Ropa', 'Accesorios'];

export const MOCK_PRODUCTOS: Producto[] = [
  { id: '1', nombre: 'Producto de Ejemplo', descripcion: 'Cargando...', precio: 0, categoria: 'General', fotos: ['https://picsum.photos/400/400'], tiendaId: 't1', disponible: true },
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
  
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setRol: (rol: string) => void;
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
  
  setUser: (user) => set({ user }),
  setRol: (rol) => set({ rol }),
  
  initialize: async () => {
    try {
      const { data: p } = await supabase.from(TABLES.PRODUCTOS).select('*').eq('activo', true);
      const { data: t } = await supabase.from(TABLES.TIENDAS).select('*').eq('activa', true);
      
      set({
        productos: (p && p.length > 0) ? p : MOCK_PRODUCTOS,
        tiendas: t || [],
        initialized: true,
      });
    } catch (e) {
      set({ productos: MOCK_PRODUCTOS, initialized: true });
    }
  },

  toggleFavorito: (id) => set((s) => ({
    favoritos: (s.favoritos || []).includes(id) ? s.favoritos.filter(x => x !== id) : [...(s.favoritos || []), id]
  })),

  addToCarrito: (p) => set((s) => ({
    carrito: [...(s.carrito || []), { producto: p, cantidad: 1 }]
  })),

  clearCarrito: () => set({ carrito: [] }),
}));
