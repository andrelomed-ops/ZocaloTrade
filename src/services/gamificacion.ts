export interface Badge {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  requisito: number;
  tipo: 'pedidos' | 'resenas' | 'gastado' | 'favoritos';
}

export interface UserPoints {
  puntos: number;
  nivel: number;
  badges: string[];
  totalPedidos: number;
  totalGastado: number;
  resenasEscritas: number;
}

export const BADGES: Badge[] = [
  { id: 'primera_compra', nombre: 'Primera Compra', descripcion: 'Realiza tu primer pedido', icono: '🛒', requisito: 1, tipo: 'pedidos' },
  { id: 'cliente_frecuente', nombre: 'Cliente Frecuente', descripcion: '5 pedidos realizados', icono: '🌟', requisito: 5, tipo: 'pedidos' },
  { id: 'cliente_premium', nombre: 'Cliente Premium', descripcion: '10 pedidos realizados', icono: '💎', requisito: 10, tipo: 'pedidos' },
  { id: 'super_cliente', nombre: 'Super Cliente', descripcion: '25 pedidos realizados', icono: '👑', requisito: 25, tipo: 'pedidos' },
  { id: 'crítico', nombre: 'Crítico', descripcion: 'Escribe 3 reseñas', icono: '✍️', requisito: 3, tipo: 'resenas' },
  { id: 'opinante', nombre: 'Opinante', descripcion: 'Escribe 10 reseñas', icono: '📝', requisito: 10, tipo: 'resenas' },
  { id: 'comprador_light', nombre: 'Comprador Light', descripcion: 'Gasta $500 en total', icono: '💰', requisito: 500, tipo: 'gastado' },
  { id: 'comprador_pro', nombre: 'Comprador Pro', descripcion: 'Gasta $2,000 en total', icono: '💎', requisito: 2000, tipo: 'gastado' },
  { id: 'coleccionista', nombre: 'Coleccionista', descripcion: 'Guarda 5 productos en favoritos', icono: '❤️', requisito: 5, tipo: 'favoritos' },
  { id: 'explorador', nombre: 'Explorador', descripcion: 'Guarda 15 productos en favoritos', icono: '🔍', requisito: 15, tipo: 'favoritos' },
];

export const PUNTOS_POR_ACCION = {
  compra: 10,
  cada_100_pesos: 5,
  resena: 15,
  favorito_agregado: 2,
};

export const calcularNivel = (puntos: number): number => {
  if (puntos < 50) return 1;
  if (puntos < 150) return 2;
  if (puntos < 300) return 3;
  if (puntos < 500) return 4;
  if (puntos < 1000) return 5;
  return 6;
};

export const getNombreNivel = (nivel: number): string => {
  const niveles = ['Novato', 'Bronce', 'Plata', 'Oro', 'Platino', 'Diamante'];
  return niveles[Math.min(nivel - 1, niveles.length - 1)];
};

export const getProximoNivel = (puntos: number): { nivel: number; puntosNecesarios: number } | null => {
  const umbrales = [50, 150, 300, 500, 1000, 2000];
  const nivelActual = calcularNivel(puntos);
  
  if (nivelActual >= 6) return null;
  
  const puntosNecesarios = umbrales[nivelActual] - puntos;
  return { nivel: nivelActual + 1, puntosNecesarios };
};

export const getBadgesDesbloqueados = (userPoints: UserPoints): Badge[] => {
  const badgesDesbloqueados: Badge[] = [];
  
  for (const badge of BADGES) {
    let desbloqueado = false;
    
    switch (badge.tipo) {
      case 'pedidos':
        desbloqueado = userPoints.totalPedidos >= badge.requisito;
        break;
      case 'resenas':
        desbloqueado = userPoints.resenasEscritas >= badge.requisito;
        break;
      case 'gastado':
        desbloqueado = userPoints.totalGastado >= badge.requisito;
        break;
      case 'favoritos':
        desbloqueado = userPoints.badges.length >= badge.requisito;
        break;
    }
    
    if (desbloqueado || userPoints.badges.includes(badge.id)) {
      badgesDesbloqueados.push(badge);
    }
  }
  
  return badgesDesbloqueados;
};

export const getBadgesPorDesbloquear = (userPoints: UserPoints): Badge[] => {
  const badgesPorDesbloquear: Badge[] = [];
  
  for (const badge of BADGES) {
    if (userPoints.badges.includes(badge.id)) continue;
    
    let progreso = 0;
    let objetivo = badge.requisito;
    
    switch (badge.tipo) {
      case 'pedidos':
        progreso = userPoints.totalPedidos;
        break;
      case 'resenas':
        progreso = userPoints.resenasEscritas;
        break;
      case 'gastado':
        progreso = userPoints.totalGastado;
        break;
      case 'favoritos':
        progreso = userPoints.badges.length;
        break;
    }
    
    if (progreso < objetivo) {
      badgesPorDesbloquear.push({ ...badge, requisito: objetivo - progreso });
    }
  }
  
  return badgesPorDesbloquear;
};

export const calcularPuntosPorCompra = (monto: number): number => {
  const puntosBase = PUNTOS_POR_ACCION.compra;
  const puntosPorMonto = Math.floor(monto / 100) * PUNTOS_POR_ACCION.cada_100_pesos;
  return puntosBase + puntosPorMonto;
};
