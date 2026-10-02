import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function ChatBot() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([
    { role: 'model', text: '¡Hola! 👋 Soy el asistente virtual de Redragon Store Chile. ¿En qué te puedo ayudar hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const mensajesFinRef = useRef(null);

  useEffect(() => {
    mensajesFinRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, escribiendo]);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!input.trim() || escribiendo) return;

    const textoUsuario = input.trim();
    setInput('');
    
    const nuevoHistorial = [...mensajes, { role: 'user', text: textoUsuario }];
    setMensajes(nuevoHistorial);
    setEscribiendo(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      // FALLBACK DE SEGURIDAD: Evita que la app explote si no hay API Key configurada.
      if (!apiKey || apiKey === 'tu_api_key_aqui') {
         setTimeout(() => {
            setMensajes([...nuevoHistorial, { role: 'model', text: '¡Hola! 🤖 Actualmente no tengo mi API Key conectada para pensar respuestas en vivo, pero Redragon Store está 100% funcional. ¡Explora nuestros teclados y el Customizer! ⚡' }]);
            setEscribiendo(false);
         }, 1500);
         return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-3.5-flash",
        systemInstruction: `Eres el asistente virtual oficial de 'Redragon Store Chile'. Eres amable, experto en periféricos gaming, usas un tono gamer profesional y hablas en español chileno (puedes usar un 'po' o 'bacán' ocasionalmente, pero mantén el profesionalismo).
        Reglas estrictas:
        1. SOLO respondes preguntas sobre productos Redragon (Teclados, Mouses, Mousepads, Audífonos, Combos). Si te preguntan por otra marca o cosas al azar (ej. recetas, política, clima), di amablemente que solo puedes ayudar con productos de la tienda.
        2. Envíos: Los despachos a la RM llegan al día siguiente por $3.500. A regiones tardan de 3 a 5 días por Starken o BlueExpress ($5.990 aprox), y a zonas extremas hasta 10 días ($9.990 aprox).
        3. Pagos: Aceptamos todas las tarjetas. Los pagos son 100% seguros.
        4. Respuestas cortas y precisas (máximo 3 párrafos cortos). Usa emojis relevantes.`
      });

      // Omitimos el saludo inicial del bot y limitamos a los últimos 6 mensajes para máxima velocidad
      const historyFormat = mensajes.slice(1).slice(-6).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const chat = model.startChat({ history: historyFormat });
      
      // Streaming habilitado para respuestas fluidas en tiempo real
      const resultStream = await chat.sendMessageStream(textoUsuario);
      
      let textoRespuesta = '';
      setMensajes(prev => [...prev, { role: 'model', text: '' }]);
      setEscribiendo(false); // Ocultamos los puntos de carga al empezar a recibir datos

      for await (const chunk of resultStream.stream) {
        const chunkText = chunk.text();
        textoRespuesta += chunkText;
        
        setMensajes(prev => {
          const nuevo = [...prev];
          nuevo[nuevo.length - 1].text = textoRespuesta;
          return nuevo;
        });
      }

    } catch (error) {
      console.error("Error detallado de Gemini:", error);
      setMensajes([...nuevoHistorial, { role: 'model', text: 'Ups, tuve un problema de conexión. Revisa mi configuración de API Key. 🔌' }]);
      setEscribiendo(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setAbierto(true)}
        className={`fixed bottom-6 right-6 p-4 text-white rounded-full shadow-2xl transition-all transform hover:scale-110 z-40 ${abierto ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} cursor-pointer`}
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <MessageCircle size={28} />
      </button>

      <div className={`fixed bottom-6 right-6 w-[340px] sm:w-96 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 transition-all origin-bottom-right duration-300 ${abierto ? 'scale-100 opacity-100 animate-scale-up' : 'scale-0 opacity-0 pointer-events-none'}`} style={{ height: '500px', maxHeight: '80vh' }}>
        
        <div className="bg-zinc-950 border-b p-4 flex justify-between items-center" style={{ borderColor: 'var(--color-primary)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center border" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}>
              <Bot size={18} />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Asistente Redragon</h3>
              <p className="text-[10px] text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> En línea</p>
            </div>
          </div>
          <button onClick={() => setAbierto(false)} className="text-zinc-400 hover:text-white transition cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-900/50">
          {mensajes.map((msg, i) => (
            <div key={i} className={`flex flex-col max-w-[85%] animate-card-appear ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
              <div 
                className={`p-3 rounded-2xl text-sm shadow-md ${msg.role === 'user' ? 'text-white rounded-br-sm' : 'bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-bl-sm'}`}
                style={msg.role === 'user' ? { backgroundColor: 'var(--color-primary)' } : {}}
              >
                {msg.text}
              </div>
            </div>
          ))}
          
          {escribiendo && (
            <div className="flex items-start max-w-[85%] mr-auto animate-fade-in">
              <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-bl-sm p-3 shadow-md flex gap-1.5 items-center h-10">
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
          <div ref={mensajesFinRef} />
        </div>

        <form onSubmit={enviarMensaje} className="bg-zinc-950 border-t border-zinc-800 p-3 flex gap-2">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta sobre teclados, envíos..." 
            className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2 text-sm outline-none transition" 
            style={{ focusBorderColor: 'var(--color-primary)' }}
            disabled={escribiendo}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || escribiendo}
            className="disabled:opacity-50 text-white w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
}