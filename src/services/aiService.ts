const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const RESPUESTAS_FALLBACK: Record<string, string> = {
  'hola': '¡Hola! 👋 ¿En qué puedo ayudarte hoy?',
  'comisión': 'La comisión de ZocaloTrade es del 10% por cada venta realizada. ¡Es una tarifa muy competitiva!',
  'comision': 'La comisión de ZocaloTrade es del 10% por cada venta realizada. ¡Es una tarifa muy competitiva!',
  'cómo funciona': 'ZocaloTrade es un marketplace donde puedes comprar productos artesanales del Zócalo de CDMX. ¡Explora, agrega al carrito y recibe en tu casa!',
  'cómo comprar': 'Para comprar: 1) Explora los productos, 2) Agrega al carrito, 3) Paga solo el envío, 4) Paga el producto al repartidor al recibir.',
  'envío': 'El envío se paga por adelantado. El producto se paga al repartidor al recibirlo (contraentrega).',
  'entrega': 'Las entregas se realizan el mismo día o al día siguiente. El repartidor te contactará cuando esté cerca.',
  'vender': '¡Excelente! Para vender, ve a Perfil y activa "Modo Vendedor". Podrás agregar tus productos y gestionar pedidos.',
  'cancelar': 'Puedes cancelar un pedido mientras esté en estado "Pendiente". Una vez preparado, ya no se puede cancelar.',
  'gracias': '¡De nada! 😊 ¿Hay algo más en lo que pueda ayudarte?',
  'ayuda': 'Estoy aquí para ayudarte. ¿Tienes alguna pregunta sobre la app, pedidos o vendedores?',
  'contacto': 'Puedes escribirnos a soporte@zocalotrade.com',
  'dudas': 'Puedo ayudarte con información sobre la app, pedidos, envíos, pagos y cómo vender.',
};

function buscarRespuesta(mensaje: string): string | null {
  const mensajeLower = mensaje.toLowerCase();
  
  for (const [palabra, respuesta] of Object.entries(RESPUESTAS_FALLBACK)) {
    if (mensajeLower.includes(palabra)) {
      return respuesta;
    }
  }
  
  return null;
}

export async function generarDescripcionProducto(nombreProducto: string, categoria: string): Promise<string> {
  const prompt = `Eres un experto en marketing de productos mexicanos. 
Genera una descripción atractiva y persuasiva para un producto en la categoría "${categoria}".
El producto se llama: "${nombreProducto}"

Requisitos:
- Maximum 100 palabras
- En español
- Incluir detalles sensorys (olor, sabor, textura, appearance)
- Make it appealing for buyers
- Include tradicional or cultural elements if applicable
- No inventes información que no conozcas

Genera solo la descripción, sin introductions.`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://zocalotrade.app',
        'X-Title': 'ZocaloTrade',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Genera una descripción para: ${nombreProducto}` }
        ],
        max_tokens: 200,
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Descripción no disponible';
  } catch (error) {
    console.error('Error generating description:', error);
    return 'Descripción no disponible';
  }
}

export async function generarNombreProducto(descripcion: string, categoria: string): Promise<string> {
  const prompt = `Eres un experto en nomenclatura de productos mexicanos.
Basado en la siguiente descripción, genera un nombre corto y atractivo para el producto:
"${descripcion}"
Categoría: ${categoria}

Requisitos:
- Maximum 5 palabras
- En español
- Attrayente para compradores
- Include elementos tradicionales if applicable

Genera solo el nombre, sin introducciones.`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://zocalotrade.app',
        'X-Title': 'ZocaloTrade',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Genera un nombre para: ${descripcion}` }
        ],
        max_tokens: 50,
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || nombreProducto;
  } catch (error) {
    console.error('Error generating name:', error);
    return '';
  }
}

export async function chatAsistenteZocaloTrade(mensaje: string, contexto?: any): Promise<string> {
  // Primero buscar en respuestas predefinidas
  const respuestaFallback = buscarRespuesta(mensaje);
  if (respuestaFallback) {
    return respuestaFallback;
  }

  // Mensajes simples en español
  const msg = mensaje.toLowerCase();
  
  if (msg.includes('hola') || msg.includes('buenos') || msg.includes('buenas')) {
    return '¡Hola! 👋 ¿En qué puedo ayudarte hoy sobre ZocaloTrade?';
  }
  if (msg.includes('gracias')) {
    return '¡De nada! 😊 ¿Hay algo más en lo que pueda ayudarte?';
  }
  if (msg.includes('adios') || msg.includes('bye') || msg.includes('chau')) {
    return '¡Hasta luego! 👋 Que tengas un buen día en el Zócalo.';
  }
  if (msg.includes('ayuda')) {
    return 'Estoy aquí para ayudarte. Puedes preguntarme sobre:\n- Cómo comprar o vender\n- Envíos y entregas\n- Pagos y comisiones\n- Estado de pedidos';
  }
  if (msg.includes('contacto') || msg.includes('soporte')) {
    return 'Puedes contactarnos en: soporte@zocalotrade.com';
  }
  if (msg.includes('precio') || msg.includes('cuanto cuesta')) {
    return 'Los precios los establece cada vendedor. El envío varía según la zona: $50-$200.';
  }

  // Si no hay respuesta predefinida, dar una respuesta genérica
  return 'Gracias por tu mensaje. Para información específica, contacta a soporte@zocalotrade.com';
}
