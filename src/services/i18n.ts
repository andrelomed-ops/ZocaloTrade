import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      "inicio": "Inicio",
      "explorar": "Explorar",
      "carrito": "Carrito",
      "pedidos": "Pedidos",
      "favoritos": "Favoritos",
      "perfil": "Perfil",
      "categorias": "Categorías",
      "tiendas_populares": "Tiendas Populares",
      "productos_destacados": "Productos Destacados",
      "agregar": "Agregar",
      "ver_todos": "Ver todos",
      "buscar": "Buscar productos...",
      "no_hay_productos": "No se encontraron productos",
      "tu_marketplace": "Tu marketplace del Zócalo",
      "promociones": "🎁 Promociones y Descuentos",
      "ver_codigos": "Ver códigos de descuento disponibles",
      "vendido_por": "Vendido por",
      "descripcion": "Descripción del producto",
      "cantidad": "Cantidad",
      "anadir_carrito": "Añadir al Carrito",
      "vendedor_verificado": "Vendedor Verificado",
      "resumen_pago": "💰 Resumen de Pago",
      "subtotal": "Subtotal",
      "envio": "Envío",
      "total": "Total",
      "direccion_entrega": "📍 Dirección de Entrega",
      "confirmar_pedido": "Confirmar Pedido",
      "metodo_pago": "💵 Método de Pago",
      "pago_contraentrega": "Pago contraentrega (Efectivo)"
    }
  },
  en: {
    translation: {
      "inicio": "Home",
      "explorar": "Explore",
      "carrito": "Cart",
      "pedidos": "Orders",
      "favoritos": "Favorites",
      "perfil": "Profile",
      "categorias": "Categories",
      "tiendas_populares": "Popular Shops",
      "productos_destacados": "Featured Products",
      "agregar": "Add",
      "ver_todos": "See all",
      "buscar": "Search products...",
      "no_hay_productos": "No products found",
      "tu_marketplace": "Your Zocalo marketplace",
      "promociones": "🎁 Promotions & Discounts",
      "ver_codigos": "View available discount codes",
      "vendido_por": "Sold by",
      "descripcion": "Product description",
      "cantidad": "Quantity",
      "anadir_carrito": "Add to Cart",
      "vendedor_verificado": "Verified Seller",
      "resumen_pago": "💰 Payment Summary",
      "subtotal": "Subtotal",
      "envio": "Shipping",
      "total": "Total",
      "direccion_entrega": "📍 Delivery Address",
      "confirmar_pedido": "Confirm Order",
      "metodo_pago": "💵 Payment Method",
      "pago_contraentrega": "Cash on Delivery"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "es", // idioma por defecto
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
