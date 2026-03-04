import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
  foto?: string;
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

export interface CarritoItem {
  producto: Producto;
  cantidad: number;
}

export interface Pedido {
  id: string;
  clienteId: string;
  tiendaId: string;
  repartidorId?: string;
  productos: { producto: Producto; cantidad: number }[];
  subtotal: number;
  comision: number;
  monto_proveedor: number;
  monto_contraentrega?: number;
  costo_envio?: number;
  total: number;
  tipoEnvio?: string;
  status: string;
  estado_pago?: string;
  estado_entrega?: string;
  etapas_seguimiento?: any[];
  direccionEntrega: string;
  notas: string;
  metodoPago?: string;
  createdAt: string;
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  fotoPerfil?: string;
}

export const MOCK_PRODUCTOS: Producto[] = [
  { id: '1', nombre: 'Tamal de Mole', descripcion: 'Delicioso tamal casero de mole negro con pollo, servido caliente con salsa extra', precio: 45, categoria: 'Comida', fotos: ['https://picsum.photos/400/400?random=1'], tiendaId: 't1', disponible: true },
  { id: '2', nombre: 'Champurrado', descripcion: 'Bebida caliente tradicional de chocolate con vainilla y canela', precio: 25, categoria: 'Bebidas', fotos: ['https://picsum.photos/400/400?random=2'], tiendaId: 't1', disponible: true },
  { id: '3', nombre: 'Pulseras Artesanales', descripcion: 'Hechas a mano con colores típicos mexicanos, ideal para regalar', precio: 80, categoria: 'Artesanía', fotos: ['https://picsum.photos/400/400?random=3'], tiendaId: 't2', disponible: true },
  { id: '4', nombre: 'Alebrijes', descripcion: 'Figuras de madera pintadas a mano, artesanía tradicional oaxaqueña', precio: 350, categoria: 'Artesanía', fotos: ['https://picsum.photos/400/400?random=4'], tiendaId: 't2', disponible: true },
];

export const MOCK_TIENDAS: Tienda[] = [
  { id: 't1', nombre: 'Don Juan Tamales', descripcion: 'Los mejores tamales del centro', direccion: 'Zócalo, CDMX', latitud: 19.4326, longitud: -99.1332, fotoPerfil: 'https://picsum.photos/100/100?random=10', rating: 4.8, categoria: 'Comida' },
];

export const CATEGORIAS = ['Todos', 'Comida', 'Bebidas', 'Artesanía', 'Ropa', 'Accesorios'];

interface AppState {
  user: User | null;
  rol: 'cliente' | 'vendedor' | 'repartidor' | null;
  productos: Producto[];
  tiendas: Tienda[];
  carrito: CarritoItem[];
  pedidos: Pedido[];
  favoritos: string[];
  initialized: boolean;
  darkMode: boolean;
  
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setRol: (rol: 'cliente' | 'vendedor' | 'repartidor' | null) => void;
  setDarkMode: (darkMode: boolean) => void;
  addProducto: (producto: Producto) => void;
  updateProducto: (productoId: string, updates: Partial<Producto>) => void;
  deleteProducto: (productoId: string) => void;
  addToCarrito: (producto: Producto, cantidad?: number) => void;
  removeFromCarrito: (productoId: string) => void;
  updateCarritoCantidad: (productoId: string, cantidad: number) => void;
  clearCarrito: () => void;
  addPedido: (pedido: Pedido) => Promise<void>;
  updatePedido: (pedidoId: string, updates: Partial<Pedido>) => Promise<void>;
  loadPedidos: (clienteId?: string) => Promise<void>;
  toggleFavorito: (productoId: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
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
          const { data: productosData } = await supabase.from(TABLES.PRODUCTOS).select('*').eq('activo', true);
          const { data: tiendasData } = await supabase.from(TABLES.TIENDAS).select('*').eq('activa', true);
          
          const productos: Producto[] = (productosData || []).map((p: any) => ({
            id: p.id,
            nombre: p.nombre,
            descripcion: p.descripcion || '',
            precio: Number(p.precio),
            fotos: p.fotos || ['https://picsum.photos/400/400'],
            tiendaId: p.tienda_id,
            disponible: p.activo,
            categoria: p.categoria || 'General'
          }));
          
          const tiendas: Tienda[] = (tiendasData || []).map((t: any) => ({
            id: t.id,
            nombre: t.nombre,
            descripcion: t.descripcion || '',
            direccion: 'Zócalo, CDMX',
            latitud: 0,
            longitud: 0,
            fotoPerfil: t.foto_perfil || 'https://picsum.photos/100/100',
            rating: Number(t.rating) || 0,
            categoria: t.categoria || 'General',
          }));
          
          set({
            productos: productos.length > 0 ? productos : MOCK_PRODUCTOS,
            tiendas: tiendas.length > 0 ? tiendas : MOCK_TIENDAS,
            initialized: true,
          });
        } catch (e) {
          set({ productos: MOCK_PRODUCTOS, tiendas: MOCK_TIENDAS, initialized: true });
        }
      },
      
      addProducto: (producto) => set((state) => ({ productos: [...state.productos, producto] })),
      updateProducto: (productoId, updates) => set((state) => ({
        productos: state.productos.map(p => p.id === productoId ? { ...p, ...updates } : p)
      })),
      deleteProducto: (productoId) => set((state) => ({
        productos: state.productos.filter(p => p.id !== productoId)
      })),
      addToCarrito: (producto, cantidad = 1) => set((state) => {
        const existing = state.carrito.find(item => item.producto.id === producto.id);
        if (existing) {
          return {
            carrito: state.carrito.map(item =>
              item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + cantidad } : item
            )
          };
        }
        return { carrito: [...state.carrito, { producto, cantidad }] };
      }),
      removeFromCarrito: (productoId) => set((state) => ({
        carrito: state.carrito.filter(item => item.producto.id !== productoId)
      })),
      updateCarritoCantidad: (productoId, cantidad) => set((state) => ({
        carrito: cantidad <= 0 
          ? state.carrito.filter(item => item.producto.id !== productoId)
          : state.carrito.map(item => item.producto.id === productoId ? { ...item, cantidad } : item)
      })),
      clearCarrito: () => set({ carrito: [] }),
      
      addPedido: async (pedido) => {
        try {
          await supabase.from(TABLES.PEDIDOS).insert({
            cliente_id: pedido.clienteId,
            tienda_id: pedido.tiendaId,
            productos: pedido.productos.map(p => ({
              producto_id: p.producto.id,
              cantidad: p.cantidad,
              precio: p.producto.precio,
              nombre: p.producto.nombre,
            })),
            subtotal: pedido.subtotal,
            comision: pedido.comision,
            total: pedido.total,
            status: pedido.status,
            direccion_entrega: pedido.direccionEntrega,
            metodo_pago: pedido.metodoPago,
          });
          set((state) => ({ pedidos: [pedido, ...state.pedidos] }));
        } catch (e) {
          set((state) => ({ pedidos: [pedido, ...state.pedidos] }));
        }
      },
      
      updatePedido: async (pedidoId, updates) => {
        try {
          await supabase.from(TABLES.PEDIDOS).update({ status: updates.status }).eq('id', pedidoId);
        } catch (e) {}
        set((state) => ({
          pedidos: state.pedidos.map(p => p.id === pedidoId ? { ...p, ...updates } : p)
        }));
      },
      
      loadPedidos: async (clienteId?: string) => {
        try {
          let query = supabase.from(TABLES.PEDIDOS).select('*').order('created_at', { ascending: false });
          if (clienteId) query = query.eq('cliente_id', clienteId);
          const { data } = await query;
          if (data) {
            const pedidos: Pedido[] = data.map((p: any) => ({
              id: p.id,
              clienteId: p.cliente_id,
              tiendaId: p.tienda_id,
              productos: p.productos || [],
              total: Number(p.total),
              comision: Number(p.comision),
              status: p.status,
              direccionEntrega: p.direccion_entrega,
              notas: p.notas,
              createdAt: p.created_at,
              subtotal: Number(p.subtotal),
              monto_proveedor: Number(p.monto_proveedor)
            }));
            set({ pedidos });
          }
        } catch (e) {}
      },
      
      toggleFavorito: (productoId) => set((state) => {
        const isFavorite = state.favoritos.includes(productoId);
        return {
          favoritos: isFavorite ? state.favoritos.filter(id => id !== productoId) : [...state.favoritos, productoId]
        };
      }),
    }),
    {
      name: 'zocalotrade-storage-v2',
      storage: createJSONStorage(() => {
        try {
          return typeof window !== 'undefined' ? window.localStorage : dummyStorage;
        } catch (e) {
          return dummyStorage;
        }
      }),
      partialize: (state) => ({ 
        user: state.user, 
        rol: state.rol, 
        darkMode: state.darkMode,
        carrito: state.carrito,
        favoritos: state.favoritos
      }),
    }
  )
);

const dummyStorage = {
  getItem: () => null,
  setItem: () => null,
  removeItem: () => null,
};
