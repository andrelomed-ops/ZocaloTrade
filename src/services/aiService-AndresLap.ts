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
  const prompt = `Eres Zocali, el asistente virtual oficial de ZocaloTrade, el marketplace del Zócalo de CDMX. 
Eres amable, servicial y hablas con un tono mexicano muy sutil.
Si no sabes algo, dile que envíe un correo a soporte@zocalotrade.com.

Información actual del usuario:
${contexto ? `- Nombre: ${contexto.nombre || 'Desconocido'}
- Artículos en carrito: ${contexto.carrito?.length || 0}
- Último pedido: ${contexto.pedidos?.[0]?.id ? `ID #${contexto.pedidos[0].id.slice(0,6)} (${contexto.pedidos[0].status})` : 'Ninguno'}` : 'Usuario sin identificar.'}`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://zocalotrade.vercel.app',
        'X-Title': 'ZocaloTrade',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat:free',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: mensaje }
        ],
        max_tokens: 300,
        temperature: 0.7,
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Una disculpa, ahorita hay mucha gente en el Zócalo y se cortó mi conexión. ¿Me repites la pregunta?";
  } catch (error) {
    console.error('Error con IA:', error);
    return "Lo siento, estoy teniendo problemas técnicos. Por favor, contacta a soporte@zocalotrade.com.";
  }
}
