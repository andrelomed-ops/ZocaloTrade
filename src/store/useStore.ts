import { create } from 'zustand';
import { supabase, TABLES } from '../services/supabase';
import { saveToCache, getFromCache } from '../services/offlineCache';
import { UserPoints, BADGES, calcularNivel, calcularPuntosPorCompra, getNombreNivel, getProximoNivel, getBadgesDesbloqueados } from '../services/gamificacion';
import { getRecomendaciones, getProductosPopulares, getNuevosProductos, getOfertasDelDia, buscarProductosSimilares } from '../services/recomendaciones';

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

export interface Pedido {
  id: string;
  cliente_id: string;
  tienda_id: string;
  productos: any[];
  subtotal: number;
  total: number;
  status: string;
  direccion_entrega: string;
  created_at: string;
  clinckargo_id?: string | null;
  comision: number;
  costo_envio?: number;
  distancia?: number;
  latitud_entrega?: number | null;
  longitud_entrega?: number | null;
  zona?: string;
  // Alias para compatibilidad
  createdAt?: string;
  tiendaId?: string;
  direccionEntrega?: string;
}

export const CATEGORIAS = ['Todos', 'Comida', 'Bebidas', 'Artesanía', 'Ropa', 'Accesorios'];

export const MOCK_PRODUCTOS: Producto[] = [
  { id: '1', nombre: 'Producto Tradicional', descripcion: 'Hecho a mano', precio: 150, categoria: 'Artesanía', fotos: ['https://picsum.photos/400/400'], tiendaId: 't1', disponible: true },
];

export const MOCK_TIENDAS: Tienda[] = [
  { id: 't1', nombre: 'Tienda Zócalo', fotoPerfil: 'https://picsum.photos/100/100', rating: 4.9, categoria: 'General' },
];

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

interface AppState {
  user: User | null;
  rol: string;
  isAdmin: boolean;
  productos: Producto[];
  tiendas: Tienda[];
  carrito: any[];
  pedidos: Pedido[];
  favoritos: string[];
  notificaciones: any[];
  initialized: boolean;
  darkMode: boolean;
  colors: any;
  userLocation: { lat: number; lng: number } | null;
  userPoints: UserPoints;
  
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setRol: (rol: string) => void;
  setDarkMode: (darkMode: boolean) => void;
  setUserLocation: (loc: { lat: number; lng: number } | null) => void;
  toggleFavorito: (id: string) => void;
  addProducto: (producto: any) => Promise<void>;
  addToCarrito: (p: any, cantidad?: number) => void;
  removeFromCarrito: (id: string) => void;
  clearCarrito: () => void;
  addPedido: (p: any) => Promise<any>;
  loadPedidos: (userId: string) => Promise<void>;
  updatePedidoStatus: (id: string, status: string) => Promise<void>;
  loadUserExtras: (userId: string) => Promise<void>;
  addResena: (resena: any) => Promise<void>;
  loadResenas: (productoId: string) => Promise<any[]>;
  loadNotificaciones: (userId: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  getRecomendaciones: () => Promise<any[]>;
  getPopulares: () => Promise<any[]>;
  getNuevos: () => Promise<any[]>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  rol: 'cliente',
  isAdmin: false,
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
  userPoints: {
    puntos: 0,
    nivel: 1,
    badges: [],
    totalPedidos: 0,
    totalGastado: 0,
    resenasEscritas: 0,
  },
  
  setUser: (user) => {
    const adminEmails = ['andrelomed@gmail.com', 'zocalotrade@gmail.com'];
    set({ 
      user, 
      isAdmin: user ? adminEmails.includes(user.email) : false 
    });
  },
  setRol: (rol) => set({ rol }),
  setDarkMode: (darkMode) => set({ 
    darkMode, 
    colors: darkMode ? DARK_COLORS : LIGHT_COLORS 
  }),
  setUserLocation: (userLocation) => set({ userLocation }),
  
  initialize: async () => {
    if (get().initialized) return;
    try {
      let productosData = null;
      let tiendasData = null;
      
      try {
        const { data: p } = await supabase.from(TABLES.PRODUCTOS).select('*').eq('activo', true);
        const { data: t } = await supabase.from(TABLES.TIENDAS).select('*').eq('activa', true);
        productosData = p;
        tiendasData = t;
        
        if (p) await saveToCache('productos', p);
        if (t) await saveToCache('tiendas', t);
      } catch (e) {
        console.log('Online fetch failed, trying cache...');
        productosData = await getFromCache('productos');
        tiendasData = await getFromCache('tiendas');
      }
      
      set({
        productos: (productosData && productosData.length > 0) 
          ? productosData.map((item: any) => ({ ...item, tiendaId: item.tienda_id, fotos: item.fotos || ['https://picsum.photos/400/400'], disponible: item.activo })) 
          : MOCK_PRODUCTOS,
        tiendas: (tiendasData && tiendasData.length > 0) ? tiendasData : MOCK_TIENDAS,
        initialized: true,
      });
    } catch (e) {
      set({ productos: MOCK_PRODUCTOS, tiendas: MOCK_TIENDAS, initialized: true });
    }
  },

  loadUserExtras: async (userId: string) => {
    try {
      const { data: profile } = await supabase.from('perfiles').select('favoritos, puntos, nivel, badges, total_pedidos, total_gastado, resenas_escritas').eq('id', userId).maybeSingle();
      if (profile) {
        set({ 
          favoritos: profile.favoritos || [],
          userPoints: {
            puntos: profile.puntos || 0,
            nivel: profile.nivel || 1,
            badges: profile.badges || [],
            totalPedidos: profile.total_pedidos || 0,
            totalGastado: profile.total_gastado || 0,
            resenasEscritas: profile.resenas_escritas || 0,
          }
        });
      }
      const { data: notifs } = await supabase.from('notificaciones').select('*').eq('usuario_id', userId).order('created_at', { ascending: false });
      if (notifs) set({ notificaciones: notifs });
    } catch (e) {}
  },

  addProducto: async (producto: any) => {
    try {
      const { data, error } = await supabase.from(TABLES.PRODUCTOS).insert(producto).select().single();
      if (error) throw error;
      if (data) set((s) => ({ productos: [...s.productos, data] }));
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
      console.log('=== addPedido START ===');
      console.log('Pedido received:', JSON.stringify(pedido, null, 2));
      
      const pedidoSimple = {
        cliente_id: pedido.cliente_id,
        tienda_id: pedido.tienda_id,
        productos: pedido.productos,
        subtotal: Number(pedido.subtotal),
        total: Number(pedido.total),
        direccion_entrega: pedido.direccion_entrega,
        metodo_pago: pedido.metodo_pago,
        status: 'pendiente',
      };
      
      console.log('Inserting to pedidos table...');
      const { data, error } = await supabase.from('pedidos').insert(pedidoSimple).select().single();
      
      if (error) {
        console.error('SUPABASE ERROR:', error);
        return { success: false, error: error.message };
      }
      
      console.log('SUCCESS - Data returned:', data);
      return { success: true, data };
    } catch (e: any) {
      console.error('CATCH ERROR:', e);
      return { success: false, error: e.message };
    }
  },

  loadPedidos: async (userId: string) => {
    try {
      const { data } = await supabase.from(TABLES.PEDIDOS).select('*').eq('cliente_id', userId).order('created_at', { ascending: false });
      if (data) {
        const pedidosMapeados = data.map((item: any) => ({
          ...item,
          createdAt: item.created_at,
          tiendaId: item.tienda_id,
          direccionEntrega: item.direccion_entrega,
        }));
        set({ pedidos: pedidosMapeados });
      }
    } catch (e) {
      console.error('Error loading pedidos:', e);
    }
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
      
      if (resena.usuario_id) {
        const { data: profile } = await supabase.from('perfiles').select('puntos, resenas_escritas').eq('id', resena.usuario_id).maybeSingle();
        const nuevosPuntos = (profile?.puntos || 0) + 15;
        const nuevasResenas = (profile?.resenas_escritas || 0) + 1;
        const nuevoNivel = calcularNivel(nuevosPuntos);
        
        await supabase.from('perfiles').update({
          puntos: nuevosPuntos,
          nivel: nuevoNivel,
          resenas_escritas: nuevasResenas
        }).eq('id', resena.usuario_id);
        
        set((s) => ({
          userPoints: {
            ...s.userPoints,
            puntos: nuevosPuntos,
            nivel: nuevoNivel,
            resenasEscritas: nuevasResenas,
          }
        }));
      }
    } catch (e) {}
  },

  loadResenas: async (productoId: string) => {
    try {
      const { data } = await supabase.from('resenas').select('*').eq('producto_id', productoId).order('created_at', { ascending: false });
      return data || [];
    } catch (e) {
      return [];
    }
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

  getRecomendaciones: async () => {
    const { productos, pedidos, favoritos, userPoints } = get();
    const categorias = [];
    return getRecomendaciones(productos, pedidos, favoritos, categorias);
  },

  getPopulares: async () => {
    const { productos } = get();
    return getProductosPopulares(productos, 5);
  },

  getNuevos: async () => {
    const { productos } = get();
    return getNuevosProductos(productos, 7, 10);
  },
}));
