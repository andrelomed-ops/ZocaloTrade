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
  envio_incluido?: boolean;
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
  telefono?: string;
  fotoPerfil?: string;
}

export const MOCK_PRODUCTOS: Producto[] = [
  { id: '1', nombre: 'Tamal de Mole', descripcion: 'Delicioso tamal casero', precio: 45, categoria: 'Comida', fotos: ['https://picsum.photos/400/400?random=1'], tiendaId: 't1', disponible: true },
];

export const MOCK_TIENDAS: Tienda[] = [
  { id: 't1', nombre: 'Don Juan Tamales', descripcion: 'Los mejores tamales', direccion: 'Zócalo, CDMX', latitud: 19.4326, longitud: -99.1332, fotoPerfil: 'https://picsum.photos/100/100?random=10', rating: 4.8, categoria: 'Comida' },
];

interface AppState {
  user: User | null;
  productos: Producto[];
  tiendas: Tienda[];
  carrito: any[];
  favoritos: string[];
  initialized: boolean;
  darkMode: boolean;
  
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setDarkMode: (darkMode: boolean) => void;
  toggleFavorito: (id: string) => void;
  addToCarrito: (p: any) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  productos: [],
  tiendas: [],
  carrito: [],
  favoritos: [],
  initialized: false,
  darkMode: false,
  
  setUser: (user) => set({ user }),
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
    favoritos: s.favoritos.includes(id) ? s.favoritos.filter(x => x !== id) : [...s.favoritos, id]
  })),

  addToCarrito: (producto) => set((s) => ({
    carrito: [...s.carrito, { producto, cantidad: 1 }]
  })),
}));
