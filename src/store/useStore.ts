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
  status: 'pendiente' | 'preparando' | 'listo' | 'en_camino' | 'entregado' | 'cancelado';
  estado_pago?: 'pendiente' | 'envio_pagado' | 'pagado';
  estado_entrega?: 'pendiente' | 'confirmado' | 'preparando' | 'en_camino' | 'entregado' | 'no_entregado';
  etapas_seguimiento?: PedidoEtapa[];
  direccionEntrega: string;
  notas: string;
  metodoPago?: string;
  createdAt: string;
}

export interface PedidoEtapa {
  etapa: 'pago_envio' | 'confirmado' | 'preparando' | 'en_camino' | 'entregado';
  fecha: string;
  completado: boolean;
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
  
  initialize: () => void;
  setUser: (user: User | null) => void;
  setRol: (rol: 'cliente' | 'vendedor' | 'repartidor' | null) => void;
  addProducto: (producto: Producto) => void;
  updateProducto: (productoId: string, updates: Partial<Producto>) => void;
  deleteProducto: (productoId: string) => void;
  addToCarrito: (producto: Producto, cantidad?: number) => void;
  removeFromCarrito: (productoId: string) => void;
  updateCarritoCantidad: (productoId: string, cantidad: number) => void;
  clearCarrito: () => void;
  addPedido: (pedido: Pedido) => void;
  updatePedido: (pedidoId: string, updates: Partial<Pedido>) => void;
  toggleFavorito: (productoId: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  rol: 'cliente',
  productos: [],
  tiendas: [],
  carrito: [],
  pedidos: [],
  favoritos: [],
  initialized: false,
  
  initialize: async () => {
    try {
      // Cargar productos desde Supabase
      const { data: productosData } = await supabase
        .from(TABLES.PRODUCTOS)
        .select('*')
        .eq('activo', true);
      
      // Cargar tiendas desde Supabase
      const { data: tiendasData } = await supabase
        .from(TABLES.TIENDAS)
        .select('*')
        .eq('activa', true);
      
      const productos: Producto[] = (productosData || []).map((p: any) => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion || '',
        precio: Number(p.precio),
        categoria: p.categoria || 'General',
        fotos: p.fotos || ['https://picsum.photos/400/400'],
        tiendaId: p.tienda_id,
        disponible: p.activo,
        envio_incluido: p.envio_incluido,
        stock: p.stock,
      }));
      
      const tiendas: Tienda[] = (tiendasData || []).map((t: any) => ({
        id: t.id,
        nombre: t.nombre,
        descripcion: t.descripcion || '',
        direccion: 'Entregas en todo el Zócalo, CDMX',
        latitud: 0,
        longitud: 0,
        fotoPerfil: t.foto_perfil || 'https://picsum.photos/100/100',
        rating: Number(t.rating) || 0,
        categoria: t.categoria || 'General',
      }));
      
      // Si no hay datos en Supabase, usar datos mock
      set({
        productos: productos.length > 0 ? productos : MOCK_PRODUCTOS,
        tiendas: tiendas.length > 0 ? tiendas : MOCK_TIENDAS,
        initialized: true,
      });
    } catch (e) {
      console.log('Error initializing:', e);
      // En caso de error, usar datos locales
      set({
        productos: MOCK_PRODUCTOS,
        tiendas: MOCK_TIENDAS,
        initialized: true,
      });
    }
  },
  
  setUser: (user) => set({ user }),
  setRol: (rol) => set({ rol }),
  
  addProducto: (producto) => set((state) => ({
    productos: [...state.productos, producto]
  })),
  
  updateProducto: (productoId, updates) => set((state) => ({
    productos: state.productos.map(p =>
      p.id === productoId ? { ...p, ...updates } : p
    )
  })),
  
  deleteProducto: (productoId) => set((state) => ({
    productos: state.productos.filter(p => p.id !== productoId)
  })),
  
  addToCarrito: (producto, cantidad = 1) => set((state) => {
    const existing = state.carrito.find(item => item.producto.id === producto.id);
    if (existing) {
      return {
        carrito: state.carrito.map(item =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
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
      : state.carrito.map(item =>
          item.producto.id === productoId
            ? { ...item, cantidad }
            : item
        )
  })),
  
  clearCarrito: () => set({ carrito: [] }),
  
  addPedido: async (pedido) => {
    try {
      // Calcular montos
      const montoProveedor = pedido.subtotal * 0.9; // 90% al proveedor
      
      // Etapas de seguimiento
      const etapas_seguimiento = [
        { etapa: 'pago_envio', fecha: new Date().toISOString(), completado: true },
        { etapa: 'confirmado', fecha: '', completado: false },
        { etapa: 'preparando', fecha: '', completado: false },
        { etapa: 'en_camino', fecha: '', completado: false },
        { etapa: 'entregado', fecha: '', completado: false },
      ];
      
      // Guardar en Supabase
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
        monto_proveedor: montoProveedor,
        monto_contraentrega: pedido.monto_contraentrega,
        costo_envio: pedido.costo_envio || 0,
        total: pedido.total,
        tipo_envio: pedido.tipoEnvio,
        status: pedido.status,
        estado_pago: pedido.estado_pago || 'pendiente',
        estado_entrega: 'pendiente',
        etapas_seguimiento,
        direccion_entrega: pedido.direccionEntrega,
        metodo_pago: pedido.metodoPago || 'efectivo',
        notas: pedido.notas,
      });
      
      // Actualizar estado local
      set((state) => ({
        pedidos: [pedido, ...state.pedidos]
      }));
    } catch (e) {
      console.log('Error saving pedido:', e);
      // Guardar localmente si falla
      set((state) => ({
        pedidos: [pedido, ...state.pedidos]
      }));
    }
  },

  updatePedido: async (pedidoId, updates) => {
    try {
      // Actualizar en Supabase
      await supabase
        .from(TABLES.PEDIDOS)
        .update({ status: updates.status })
        .eq('id', pedidoId);
    } catch (e) {
      console.log('Error updating pedido:', e);
    }
    
    set((state) => ({
      pedidos: state.pedidos.map(p =>
        p.id === pedidoId ? { ...p, ...updates } : p
      )
    }));
  },

  loadPedidos: async (clienteId?: string) => {
    try {
      let query = supabase.from(TABLES.PEDIDOS).select('*').order('created_at', { ascending: false });
      
      if (clienteId) {
        query = query.eq('cliente_id', clienteId);
      }
      
      const { data } = await query;
      
      if (data) {
        const pedidos: Pedido[] = data.map((p: any) => ({
          id: p.id,
          clienteId: p.cliente_id,
          tiendaId: p.tienda_id,
          productos: p.productos || [],
          total: Number(p.total),
          comision: Number(p.comision),
          costo_envio: Number(p.costo_envio),
          status: p.status,
          direccionEntrega: p.direccion_entrega,
          notas: p.notas,
          createdAt: p.created_at,
        }));
        
        set({ pedidos });
      }
    } catch (e) {
      console.log('Error loading pedidos:', e);
    }
  },

  toggleFavorito: (productoId) => set((state) => {
    const isFavorite = state.favoritos.includes(productoId);
    return {
      favoritos: isFavorite
        ? state.favoritos.filter(id => id !== productoId)
        : [...state.favoritos, productoId]
    };
  }),
}));
