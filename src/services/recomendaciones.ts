import { supabase } from './supabase';

export interface Recomendacion {
  producto: any;
  razon: string;
  puntuacion: number;
}

const PESO_CATEGORIA = 3;
const PESO_PRECIO_CERCANO = 2;
const PESO_ALTA_VALORACION = 2.5;
const PESO_POPULAR = 1.5;

export const getRecomendaciones = async (
  productos: any[],
  historialPedidos: any[],
  favoritos: string[],
  categoriasInteres: string[] = []
): Promise<Recomendacion[]> => {
  const recomendaciones: Recomendacion[] = [];
  
  const categoriasHistoricas = new Set<string>();
  const tiendasHistoricas = new Set<string>();
  let gastoPromedio = 0;
  
  if (historialPedidos.length > 0) {
    historialPedidos.forEach(pedido => {
      try {
        const productosPedido = typeof pedido.productos === 'string' 
          ? JSON.parse(pedido.productos) 
          : pedido.productos;
        
        if (Array.isArray(productosPedido)) {
          productosPedido.forEach((p: any) => {
            gastoPromedio += (p.precio || 0) * (p.cantidad || 1);
          });
        }
      } catch (e) {}
    });
    gastoPromedio = gastoPromedio / historialPedidos.length;
  }
  
  for (const pedido of historialPedidos.slice(0, 5)) {
    try {
      const productosPedido = typeof pedido.productos === 'string' 
        ? JSON.parse(pedido.productos) 
        : pedido.productos;
      
      if (Array.isArray(productosPedido)) {
        productosPedido.forEach((p: any) => {
          const producto = productos.find(pr => pr.id === p.id);
          if (producto) {
            categoriasHistoricas.add(producto.categoria);
            tiendasHistoricas.add(producto.tiendaId);
          }
        });
      }
    } catch (e) {}
  }
  
  for (const producto of productos) {
    if (favoritos.includes(producto.id)) continue;
    if (!producto.disponible) continue;
    
    let puntuacion = 0;
    let razon = '';
    
    if (categoriasHistoricas.has(producto.categoria) || categoriasInteres.includes(producto.categoria)) {
      puntuacion += PESO_CATEGORIA;
      razon = 'Basado en tu historial';
    }
    
    if (tiendasHistoricas.has(producto.tiendaId)) {
      puntuacion += PESO_CATEGORIA * 0.5;
      if (!razon) razon = 'De tiendas que has comprado';
    }
    
    if (producto.precio <= gastoPromedio * 1.2 && gastoPromedio > 0) {
      puntuacion += PESO_PRECIO_CERCANO;
      if (!razon) razon = 'En tu rango de precio';
    }
    
    if (producto.rating && producto.rating >= 4.5) {
      puntuacion += PESO_ALTA_VALORACION;
      if (!razon) razon = 'Alta calificación';
    }
    
    if (producto.vendido && producto.vendido > 10) {
      puntuacion += PESO_POPULAR;
      if (!razon) razon = 'Producto popular';
    }
    
    if (categoriasInteres.includes(producto.categoria)) {
      puntuacion += PESO_CATEGORIA * 0.5;
    }
    
    if (puntuacion > 0) {
      recomendaciones.push({ producto, razon, puntuacion });
    }
  }
  
  return recomendaciones
    .sort((a, b) => b.puntuacion - a.puntuacion)
    .slice(0, 10);
};

export const getProductosPopulares = (productos: any[], limit: number = 5): any[] => {
  return productos
    .filter(p => p.disponible)
    .sort((a, b) => (b.vendido || 0) - (a.vendido || 0))
    .slice(0, limit);
};

export const getProductosPorCategoria = (productos: any[], categoria: string, limit: number = 10): any[] => {
  return productos
    .filter(p => p.disponible && p.categoria === categoria)
    .slice(0, limit);
};

export const buscarProductosSimilares = (producto: any, todosProductos: any[], limit: number = 5): any[] => {
  return todosProductos
    .filter(p => 
      p.id !== producto.id && 
      p.disponible && 
      (p.categoria === producto.categoria || p.tiendaId === producto.tiendaId)
    )
    .slice(0, limit);
};

export const getNuevosProductos = (productos: any[], dias: number = 7, limit: number = 10): any[] => {
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() - dias);
  
  return productos
    .filter(p => {
      if (!p.disponible) return false;
      if (!p.created_at) return false;
      const fechaProducto = new Date(p.created_at);
      return fechaProducto >= fechaLimite;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
};

export const getOfertasDelDia = (productos: any[], limit: number = 10): any[] => {
  return productos
    .filter(p => p.disponible && p.en_oferta)
    .slice(0, limit);
};
