import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Solo aceptamos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { mensaje, historial } = req.body;

    // Inicializamos Gemini con la clave secreta guardada en Vercel
    const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
    
    // Configuramos el modelo y el "System Prompt" (las reglas del bot)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `Eres el asistente virtual oficial de 'Redragon Store Chile'. Eres amable, experto en periféricos gaming, usas un tono gamer profesional y hablas en español chileno (puedes usar un 'po' o 'bacán' ocasionalmente, pero mantén el profesionalismo).
      Reglas estrictas:
      1. SOLO respondes preguntas sobre productos Redragon (Teclados, Mouses, Mousepads, Audífonos, Combos). Si te preguntan por otra marca o cosas al azar (ej. recetas, política, clima), di amablemente que solo puedes ayudar con productos de la tienda.
      2. Envíos: Los despachos a la Región Metropolitana llegan al día siguiente por $3.500. A regiones tardan de 3 a 5 días por Starken o BlueExpress ($5.990 aprox), y a zonas extremas hasta 10 días ($9.990 aprox).
      3. Pagos: Aceptamos todas las tarjetas. Los pagos son 100% seguros.
      4. Respuestas cortas y precisas (máximo 3 párrafos cortos). Usa emojis relevantes 🎮⌨️🖱️🎧.`
    });

    // Formateamos el historial previo para que la IA tenga memoria de la charla
    const historyFormat = historial.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({ history: historyFormat });
    
    // Enviamos el mensaje del usuario
    const result = await chat.sendMessage(mensaje);
    const textoRespuesta = result.response.text();

    return res.status(200).json({ respuesta: textoRespuesta });

  } catch (error) {
    console.error("Error en Gemini API:", error);
    return res.status(500).json({ error: 'Error al conectar con el asistente.' });
  }
}