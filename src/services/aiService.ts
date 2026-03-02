const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

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
  const systemPrompt = `Eres el asistente IA de ZocaloTrade, una app de marketplace para comerciantes del Zócalo de CDMX.

Tu trabajo es ayudar a:
1. Usuarios a find products
2. Comerciantes a usar la app
3. Responder preguntas sobre pedidos, envíos, pagos
4. Dar soporte básico

Características de ZocaloTrade:
- Comisión del 10% por venta
- Entregas coordinación con repartidores
- Productos locales y artesanías
- Vendedores locales del centro de CDMX

Sé amable, conciso y útil.`;

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: mensaje }
        ],
        max_tokens: 300,
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.';
  } catch (error) {
    console.error('Error in chat:', error);
    return 'Lo siento, ocurrió un error. Intenta de nuevo.';
  }
}
