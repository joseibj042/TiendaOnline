import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Heart, Send, Smile, Award, Star, CheckSquare, Square, CreditCard } from 'lucide-react';
import { formatearCLP } from '../utils';
import { supabase } from '../services/supabaseClient';

export default function AmigosYMensajes({ sesionActual, actualizarUsuarioEnStorage, actualizarUsuarioPorUsername, setMensajeModalGlobal, setVistaActual, abrirPerfilPublicoExt, amigoSeleccionadoVerExt, setAmigoSeleccionadoVerExt }) {
  const [panelAmigosOpen, setPanelAmigosOpen] = useState(false);
  const [chatActivo, setChatActivo] = useState(null);
  const [mensajeChat, setMensajeChat] = useState('');
  const [historialChats, setHistorialChats] = useState({});
  const [mostrarEmojis, setMostrarEmojis] = useState(false);
  
  const [amigoSeleccionadoVer, setAmigoSeleccionadoVer] = useState(null);
  const [amigoRecompensasVer, setAmigoRecompensasVer] = useState(null);
  const [productosSeleccionadosRegalo, setProductosSeleccionadosRegalo] = useState([]);
  const [modalCheckoutRegalo, setModalCheckoutRegalo] = useState(false);
  const [tarjetaSeleccionadaRegalo, setTarjetaSeleccionadaRegalo] = useState(null);
  const [cvvRegalo, setCvvRegalo] = useState('');
  const [procesandoPago, setProcesandoPago] = useState(false);

  const panelAmigosRef = useRef(null);
  const chatBottomRef = useRef(null);
  const EMOJIS = ['😀','😂','🥰','😎','🔥','🎮','⌨️','🖱️','🎁','❤','👍','✨'];

  // ==========================================
  // TODOS LOS useEffect AGRUPADOS AQUÍ ARRIBA
  // ==========================================

  // 1. Sincronizar estado externo
  useEffect(() => {
    if (amigoSeleccionadoVerExt) {
      setAmigoSeleccionadoVer(amigoSeleccionadoVerExt);
      setPanelAmigosOpen(false);
    }
  }, [amigoSeleccionadoVerExt]);

  // 2. Cerrar panel al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelAmigosRef.current && !panelAmigosRef.current.contains(e.target) && !chatActivo) setPanelAmigosOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [chatActivo]);

  // 3. Cargar historial local y scroll
  useEffect(() => {
    if (sesionActual) {
      setHistorialChats(JSON.parse(localStorage.getItem('redragon_chats')) || {});
    }
    if (chatActivo) chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sesionActual?.email, chatActivo, panelAmigosOpen]);

  // 4. Sincronización automática de amigos desde Supabase al iniciar
  useEffect(() => {
    const sincronizarAmigosChat = async () => {
      if (!sesionActual?.id && !sesionActual?.email) return;
      try {
        let query = supabase.from('profiles').select('amigos_wishlist');
        if (sesionActual.id) query = query.eq('id', sesionActual.id);
        else query = query.eq('email', sesionActual.email);

        const { data, error } = await query.single();
        if (!error && data && data.amigos_wishlist) {
          const listaBD = data.amigos_wishlist;
          if (actualizarUsuarioEnStorage) {
            actualizarUsuarioEnStorage({
              ...sesionActual,
              amigos_wishlist: listaBD,
              amigosWishlist: listaBD
            });
          }
        }
      } catch (err) {
        console.error("Error al sincronizar amigos en el chat:", err);
      }
    };

    sincronizarAmigosChat();
  }, [sesionActual?.id, sesionActual?.email]);

  // 5. Antena en tiempo real (Realtime) para los amigos
  useEffect(() => {
    if (!sesionActual?.id) return;

    const channelAmigosChat = supabase
      .channel('cambios-amigos-chat-en-vivo')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${sesionActual.id}`
        },
        (payload) => {
          if (payload.new && payload.new.amigos_wishlist) {
            const listaBD = payload.new.amigos_wishlist;
            if (actualizarUsuarioEnStorage) {
              actualizarUsuarioEnStorage({
                ...sesionActual,
                amigos_wishlist: listaBD,
                amigosWishlist: listaBD
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelAmigosChat);
    };
  }, [sesionActual?.id]);

  const calcularNivelAmistad = (xp = 0) => {
    if (xp < 100) return { nivel: 1, titulo: 'Amigos Nuevos 🤝', color: 'text-zinc-400', next: 100, recompensa: 'Ninguna' };
    if (xp < 300) return { nivel: 2, titulo: 'Compañeros de Vicio 🎮', color: 'text-blue-400', next: 300, recompensa: 'Cupón 10% (AMIGO10)' };
    if (xp < 600) return { nivel: 3, titulo: 'Dúo Dinámico ⚡', color: 'text-purple-400', next: 600, recompensa: 'Envío Gratis (AMIGOFREE)' };
    if (xp < 1000) return { nivel: 4, titulo: 'Hermanos de Setup 💎', color: 'text-red-400', next: 1000, recompensa: 'Cupón 20% (AMIGO20)' };
    if (xp < 2000) return { nivel: 5, titulo: 'Leyendas Inmortales 👑', color: 'text-yellow-400', next: 2000, recompensa: 'Giftcard $5.000 (GIFTCARD5K)' };
    if (xp < 3500) return { nivel: 6, titulo: 'Maestros del Combo 🔥', color: 'text-orange-400', next: 3500, recompensa: 'Cupón 30% (MAESTRO30)' };
    if (xp < 5000) return { nivel: 7, titulo: 'Titanes del Gaming 🌌', color: 'text-indigo-400', next: 5000, recompensa: 'Giftcard $15.000 (TITAN15K)' };
    return { nivel: 8, titulo: 'Dioses del Olimpo RGB ⚡👑', color: 'text-amber-300 animate-pulse', next: 5000, recompensa: 'Giftcard $30.000 + VIP (OLIMPO30K)' };
  };

  const generarChatId = (user1, user2) => [user1.toLowerCase(), user2.toLowerCase()].sort().join('_');

  const calcularMensajesNoLeidosTotal = () => {
    if (!sesionActual?.amigosWishlist) return 0;
    const chats = JSON.parse(localStorage.getItem('redragon_chats')) || {};
    const chatsLeidos = sesionActual.chatsLeidos || {};
    let totalNoLeidos = 0;
    sesionActual.amigosWishlist.forEach(amigo => {
      if (amigo.estado === 'aceptado') {
        const chatId = generarChatId(sesionActual.username, amigo.username);
        const mensajes = chats[chatId] || [];
        const ultimoLeido = chatsLeidos[chatId] || 0;
        totalNoLeidos += mensajes.filter(m => m.emisor.toLowerCase() !== sesionActual.username.toLowerCase() && m.timestamp > ultimoLeido).length;
      }
    });
    return totalNoLeidos;
  };

  const abrirChatConAmigo = (amigoUsername) => {
    setChatActivo({ username: amigoUsername });
    const chatId = generarChatId(sesionActual.username, amigoUsername);
    const chats = JSON.parse(localStorage.getItem('redragon_chats')) || {};
    const mensajes = chats[chatId] || [];
    const ultimoTimestamp = mensajes.length > 0 ? Math.max(...mensajes.map(m => m.timestamp || 0)) : Date.now();
    actualizarUsuarioEnStorage({ ...sesionActual, chatsLeidos: { ...(sesionActual.chatsLeidos || {}), [chatId]: ultimoTimestamp } });
  };

const enviarMensaje = async (e) => {
  e.preventDefault();
  if (!mensajeChat.trim() || !chatActivo) return;
  
  const chatId = generarChatId(sesionActual.username, chatActivo.username);
  const timestampActual = new Date().getTime();
  const textoMensaje = mensajeChat.trim();
  const nuevoMsj = { emisor: sesionActual.username, texto: textoMensaje, timestamp: timestampActual };
  
  // 1. Guardar localmente para fluidez visual inmediata
  const chats = JSON.parse(localStorage.getItem('redragon_chats')) || {};
  chats[chatId] = [...(chats[chatId] || []), nuevoMsj];
  localStorage.setItem('redragon_chats', JSON.stringify(chats));
  setHistorialChats(chats);

  // 2. ENVIAR A SUPABASE PARA QUE EL OTRO USUARIO LO RECIBA EN TIEMPO REAL
  try {
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', chatActivo.username)
      .single();

    if (targetUser && targetUser.id) {
      await supabase.from('notifications').insert([{
        user_id: targetUser.id,
        type: 'chat_mensaje',
        title: `💬 Mensaje de @${sesionActual.username}`,
        message: textoMensaje,
        data: { emisor: sesionActual.username }
      }]);
    }
  } catch (err) {
    console.error("Error al sincronizar mensaje en Supabase:", err);
  }

  // Actualizar XP y contadores locales
  let amigosActualizados = (sesionActual.amigosWishlist || sesionActual.amigos_wishlist || []).map(amigo => {
    if (amigo.username.toLowerCase() === chatActivo.username.toLowerCase()) {
      const msjsNuevos = (amigo.mensajesEnviados || 0) + 1;
      return { ...amigo, mensajesEnviados: msjsNuevos, xp: (amigo.xp || 0) + (msjsNuevos % 5 === 0 ? 15 : 0) };
    }
    return amigo;
  });

  actualizarUsuarioEnStorage({ ...sesionActual, amigosWishlist: amigosActualizados, amigos_wishlist: amigosActualizados, chatsLeidos: { ...(sesionActual.chatsLeidos || {}), [chatId]: timestampActual } });
  setMensajeChat(''); 
  setMostrarEmojis(false);
};

  const abrirPerfilPublico = (usernameAmigo) => {
    const todos = JSON.parse(localStorage.getItem('redragon_usuarios')) || [];
    const amigo = todos.find(u => u.username.toLowerCase() === usernameAmigo.toLowerCase());
    if (amigo) {
      setAmigoSeleccionadoVer(amigo);
      if (setAmigoSeleccionadoVerExt) setAmigoSeleccionadoVerExt(amigo);
      setPanelAmigosOpen(false); setProductosSeleccionadosRegalo([]);
    }
  };

  const confirmarCompraRegalos = (e) => {
    e.preventDefault();
    if (!tarjetaSeleccionadaRegalo || cvvRegalo.trim().length < 3) return setMensajeModalGlobal?.('Selecciona una tarjeta y el CVV.');
    setProcesandoPago(true);
    setTimeout(() => {
      const idRegalo = `GIFT-${Date.now()}`;
      const totalRegalo = productosSeleccionadosRegalo.reduce((acc, p) => acc + (p.precio || 0), 0);
      
      let amigosActualizados = (sesionActual.amigosWishlist || []).map(amigo => 
        amigo.username.toLowerCase() === amigoSeleccionadoVer.username.toLowerCase() ? { ...amigo, regalosGastados: (amigo.regalosGastados || 0) + totalRegalo } : amigo
      );
      actualizarUsuarioEnStorage({ ...sesionActual, amigosWishlist: amigosActualizados });

      actualizarUsuarioPorUsername(amigoSeleccionadoVer.username, (amigoUser) => ({
        ...amigoUser, notificaciones: [{ id: idRegalo, tipo: 'regalo_recibido', emisor: sesionActual.username, titulo: '🎁 ¡Tienes un regalo!', mensaje: `@${sesionActual.username} quiere regalarte ${productosSeleccionadosRegalo.length} producto(s).`, productos: productosSeleccionadosRegalo, total: totalRegalo, fecha: new Date().toLocaleDateString(), timestamp: Date.now(), estado: 'pendiente' }, ...(amigoUser.notificaciones || [])]
      }));

      setProcesandoPago(false); setModalCheckoutRegalo(false); setAmigoSeleccionadoVer(null);
      if(setAmigoSeleccionadoVerExt) setAmigoSeleccionadoVerExt(null);
      setProductosSeleccionadosRegalo([]); setCvvRegalo('');
      setMensajeModalGlobal?.(`¡Regalo enviado con éxito a @${amigoSeleccionadoVer.username}!`);
    }, 2500);
  };

  const totalMensajesNoLeidos = calcularMensajesNoLeidosTotal();
  const amigosAceptados = (sesionActual?.amigosWishlist || sesionActual?.amigos_wishlist || []).filter(a => a.estado === 'aceptado');

  return (
    <div className="relative" ref={panelAmigosRef}>
      <button onClick={() => { setPanelAmigosOpen(!panelAmigosOpen); setChatActivo(null); }} className="p-2 bg-black/40 rounded-lg cursor-pointer border border-white/25 relative hover:bg-black/60 transition">
        <MessageCircle size={20} />
        {totalMensajesNoLeidos > 0 && <span className="absolute -top-1 -right-1 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse" style={{ backgroundColor: 'var(--color-primary)' }}>{totalMensajesNoLeidos}</span>}
      </button>

      {/* PANEL PRINCIPAL AMIGOS */}
      {panelAmigosOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 flex flex-col h-[480px] overflow-hidden text-white animate-fade-in">
          {!chatActivo ? (
            <>
              <div className="p-3 border-b border-zinc-800 bg-zinc-950 font-bold flex justify-between items-center">
                <span className="flex items-center gap-2"><MessageCircle size={16} style={{ color: 'var(--color-primary)' }}/> Mis Amigos ({amigosAceptados.length})</span>
                <button onClick={() => setPanelAmigosOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer"><X size={16}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {amigosAceptados.length === 0 ? <p className="text-xs text-zinc-500 text-center mt-8">Aún no tienes amigos agregados.</p> : (
                  amigosAceptados.map((amigo, i) => {
                    const todosUsr = JSON.parse(localStorage.getItem('redragon_usuarios')) || [];
                    const infoAmigo = todosUsr.find(u => u.username.toLowerCase() === amigo.username.toLowerCase()) || {};
                    const nivelInfo = calcularNivelAmistad(amigo.xp || 0);
                    const chatId = generarChatId(sesionActual.username, amigo.username);
                    const mensajesAmigo = historialChats[chatId] || [];
                    const ultimoLeido = (sesionActual.chatsLeidos || {})[chatId] || 0;
                    const noLeidosAmigo = mensajesAmigo.filter(m => m.emisor.toLowerCase() !== sesionActual.username.toLowerCase() && m.timestamp > ultimoLeido).length;
                    
                    return (
                      <div key={i} className="bg-zinc-800/60 border border-zinc-700/60 p-3 rounded-xl flex flex-col gap-2.5 transition hover:border-zinc-500">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => abrirPerfilPublico(amigo.username)}>
                            <div className="w-10 h-10 rounded-full bg-zinc-700 border border-zinc-600 flex items-center justify-center font-bold text-white shrink-0 overflow-hidden">
                              {infoAmigo.avatar ? <img src={infoAmigo.avatar} alt="" className="w-full h-full object-cover"/> : amigo.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex gap-2"><span className="font-bold text-sm text-white hover:underline">@{amigo.username}</span></div>
                              <p className={`text-[10px] font-bold ${nivelInfo.color}`}>{nivelInfo.titulo}</p>
                            </div>
                          </div>
                          <button onClick={() => abrirChatConAmigo(amigo.username)} className="text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer relative" style={{ backgroundColor: 'var(--color-primary)' }}>
                            <MessageCircle size={12} /> Chat {noLeidosAmigo > 0 && <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{noLeidosAmigo}</span>}
                          </button>
                        </div>
                        <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800 space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-zinc-400">Amistad <strong className="text-white">Nv. {nivelInfo.nivel}</strong></span><span className="font-bold" style={{ color: 'var(--color-primary)' }}>{amigo.xp || 0} XP</span>
                          </div>
                          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full transition-all" style={{ backgroundColor: 'var(--color-primary)', width: `${Math.min(100, ((amigo.xp || 0) / nivelInfo.next) * 100)}%` }}></div>
                          </div>
                          <div className="flex justify-between pt-1 text-[9px] text-zinc-400">
                            <span>🎁 Recompensa: <strong className="text-zinc-200">{nivelInfo.recompensa}</strong></span>
                            <button onClick={() => setAmigoRecompensasVer(amigo)} className="hover:underline font-bold cursor-pointer flex items-center gap-0.5" style={{ color: 'var(--color-primary)' }}><Award size={10} /> Logros</button>
                          </div>
                        </div>
                        <button onClick={() => abrirPerfilPublico(amigo.username)} className="w-full py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded font-bold transition text-xs cursor-pointer flex items-center justify-center gap-1.5"><Heart size={13} className="text-red-400 fill-red-400"/> Ver Wishlist y Regalar</button>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            // VISTA CHAT
            <>
              <div className="p-3 border-b border-zinc-800 bg-zinc-950 font-bold flex items-center gap-2">
                <button onClick={() => setChatActivo(null)} className="text-zinc-400 hover:text-white font-bold px-1 cursor-pointer">←</button>
                <span onClick={() => abrirPerfilPublico(chatActivo.username)} className="cursor-pointer hover:underline text-sm">@{chatActivo.username}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-zinc-900/50">
                {(historialChats[generarChatId(sesionActual.username, chatActivo.username)] || []).map((msg, i) => (
                  <div key={i} className={`flex flex-col max-w-[85%] ${msg.emisor === sesionActual.username ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                    <span className="text-[9px] text-zinc-500 mb-0.5 px-1">{msg.emisor}</span>
                    <div className={`p-2 rounded-xl text-xs ${msg.emisor === sesionActual.username ? 'text-white rounded-br-none' : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-750'}`} style={msg.emisor === sesionActual.username ? { backgroundColor: 'var(--color-primary)' } : {}}>{msg.texto}</div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>
              <form onSubmit={enviarMensaje} className="p-2 border-t border-zinc-800 bg-zinc-950 flex gap-2 relative">
                <button type="button" onClick={() => setMostrarEmojis(!mostrarEmojis)} className="text-zinc-400 hover:text-yellow-400 cursor-pointer"><Smile size={20}/></button>
                {mostrarEmojis && (
                  <div className="absolute bottom-12 left-2 bg-zinc-800 p-2 rounded-lg border border-zinc-700 grid grid-cols-4 gap-2 text-xl z-10 shadow-xl">
                    {EMOJIS.map(e => <span key={e} className="cursor-pointer hover:scale-125 transition" onClick={() => { setMensajeChat(mensajeChat + e); setMostrarEmojis(false); }}>{e}</span>)}
                  </div>
                )}
                <input type="text" value={mensajeChat} onChange={e => setMensajeChat(e.target.value)} placeholder="Mensaje..." className="flex-1 bg-zinc-800 rounded px-3 py-1.5 text-xs text-white border border-zinc-700 focus:outline-none" />
                <button type="submit" className="hover:opacity-80 cursor-pointer" style={{ color: 'var(--color-primary)' }}><Send size={18}/></button>
              </form>
            </>
          )}
        </div>
      )}

      {/* MODAL RECOMPENSAS */}
      {amigoRecompensasVer && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 text-white animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2 text-yellow-400"><Award size={22}/> Logros con @{amigoRecompensasVer.username}</h3>
              <button onClick={() => setAmigoRecompensasVer(null)} className="text-zinc-400 hover:text-white cursor-pointer"><X size={20}/></button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="bg-zinc-800/60 p-3.5 rounded-lg border border-zinc-700 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-sm">Rango: {calcularNivelAmistad(amigoRecompensasVer.xp || 0).titulo}</p>
                  <p className="text-zinc-400 mt-0.5">Experiencia actual: <strong style={{ color: 'var(--color-primary)' }}>{amigoRecompensasVer.xp || 0} XP</strong></p>
                </div>
                <Star className="text-yellow-400 fill-yellow-400" size={30}/>
              </div>
              <div className="space-y-2 pt-2">
                <p className="font-semibold text-zinc-300 uppercase text-[10px]">Recompensas Desbloqueadas:</p>
                {/* Lógica de niveles igual al original */}
                {[
                  { xp: 100, title: 'Nivel 2 (100 XP): Cupón 10%', code: 'AMIGO10' },
                  { xp: 300, title: 'Nivel 3 (300 XP): Envío Gratis', code: 'AMIGOFREE' },
                  { xp: 600, title: 'Nivel 4 (600 XP): Cupón 20%', code: 'AMIGO20' },
                  { xp: 1000, title: 'Nivel 5 (1,000 XP): Giftcard $5.000', code: 'GIFTCARD5K' },
                ].map(lvl => (
                  <div key={lvl.xp} className={`p-2.5 rounded-lg border ${(amigoRecompensasVer.xp || 0) >= lvl.xp ? 'bg-green-950/30 border-green-500/40 text-green-300' : 'bg-zinc-800/30 border-zinc-700 text-zinc-500'}`}>
                    <p className="font-bold">{lvl.title}</p><p className="text-[10px] mt-0.5">Código: <span className="font-mono font-bold">{lvl.code}</span></p>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setAmigoRecompensasVer(null)} className="w-full py-2.5 rounded-xl font-bold text-xs cursor-pointer text-white" style={{ backgroundColor: 'var(--color-primary)' }}>Cerrar</button>
          </div>
        </div>
      )}

      {/* MODAL PERFIL PARA REGALAR */}
      {amigoSeleccionadoVer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-white animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="h-32 bg-cover bg-center relative border-b border-zinc-700" style={{ backgroundImage: amigoSeleccionadoVer.banner ? `url(${amigoSeleccionadoVer.banner})` : 'url(/images/banner-default.jpg)' }}>
              <button onClick={() => {setAmigoSeleccionadoVer(null); if(setAmigoSeleccionadoVerExt) setAmigoSeleccionadoVerExt(null); }} className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full hover:bg-black transition cursor-pointer"><X size={20}/></button>
              <div className="absolute -bottom-10 left-6 w-24 h-24 bg-zinc-800 rounded-full border-4 border-zinc-900 flex items-center justify-center text-3xl font-bold overflow-hidden">
                {amigoSeleccionadoVer.avatar ? <img src={amigoSeleccionadoVer.avatar} alt="" className="w-full h-full object-cover"/> : amigoSeleccionadoVer.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="pt-12 px-6 pb-6 overflow-y-auto flex-1">
              <h2 className="text-2xl font-bold">@{amigoSeleccionadoVer.username}</h2>
              <p className="text-sm text-zinc-400 mt-1 italic">"{amigoSeleccionadoVer.bio || 'Sin biografía.'}"</p>
              <div className="mt-6">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-3">
                  <h3 className="font-bold flex items-center gap-2"><Heart className="text-red-500 fill-red-500" size={18}/> Wishlist (Regalar)</h3>
                </div>
                <div className="space-y-2">
                  {!amigoSeleccionadoVer.wishlist?.length ? <p className="text-xs text-zinc-500 py-4 text-center">Sin productos.</p> :
                    amigoSeleccionadoVer.wishlist.map((prod, i) => {
                      const sel = productosSeleccionadosRegalo.some(p => p.nombre === prod.nombre);
                      return (
                        <div key={i} onClick={() => sel ? setProductosSeleccionadosRegalo(productosSeleccionadosRegalo.filter(p => p.nombre !== prod.nombre)) : setProductosSeleccionadosRegalo([...productosSeleccionadosRegalo, prod])} className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition ${sel ? 'bg-red-950/20' : 'border-zinc-700 bg-zinc-800/40'}`} style={sel ? { borderColor: 'var(--color-primary)' } : {}}>
                          <div className="flex items-center gap-3">
                            {sel ? <CheckSquare size={18} style={{ color: 'var(--color-primary)' }} /> : <Square size={18} className="text-zinc-500" />}
                            <img src={prod.imagen} alt="" className="w-10 h-10 object-contain bg-black/40 p-1 rounded" />
                            <div><p className="font-bold text-sm">{prod.nombre}</p><p className="font-bold text-xs" style={{ color: 'var(--color-primary)' }}>{formatearCLP(prod.precio)}</p></div>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              </div>
            </div>
            <div className="bg-zinc-950 p-4 border-t border-zinc-800 flex justify-between items-center">
              <div className="text-sm">Total: <strong className="text-lg" style={{ color: 'var(--color-primary)' }}>{formatearCLP(productosSeleccionadosRegalo.reduce((acc, p) => acc + (p.precio || 0), 0))}</strong></div>
              <button disabled={productosSeleccionadosRegalo.length === 0} onClick={() => setModalCheckoutRegalo(true)} className="disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-bold transition cursor-pointer" style={{ backgroundColor: 'var(--color-primary)' }}>Pago</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHECKOUT REGALO */}
      {modalCheckoutRegalo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 text-white animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <button onClick={() => setModalCheckoutRegalo(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"><X size={20}/></button>
            <h3 className="text-xl font-bold border-b border-zinc-800 pb-3 flex gap-2" style={{ color: 'var(--color-primary)' }}><CreditCard /> Confirmar Regalo</h3>
            {(!sesionActual?.tarjetas || sesionActual.tarjetas.length === 0) ? (
              <div className="py-6 text-center space-y-3">
                <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>No tienes tarjetas agregadas.</p>
                <button onClick={() => setModalCheckoutRegalo(false)} className="mt-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer">Cerrar</button>
              </div>
            ) : (
              <form onSubmit={confirmarCompraRegalos} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-semibold">Selecciona tarjeta:</label>
                  {sesionActual.tarjetas.map((card, i) => (
                    <div key={i} onClick={() => setTarjetaSeleccionadaRegalo(card)} className={`p-3 rounded-lg border cursor-pointer ${tarjetaSeleccionadaRegalo === card ? 'bg-red-950/30' : 'border-zinc-700 bg-zinc-800'}`} style={tarjetaSeleccionadaRegalo === card ? { borderColor: 'var(--color-primary)' } : {}}>
                      <p className="font-mono font-bold">{card.numero}</p><p className="text-xs text-zinc-400">Exp: {card.expiracion}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold">CVV:</label>
                  <input type="password" maxLength={4} value={cvvRegalo} onChange={(e) => setCvvRegalo(e.target.value)} placeholder="CVV" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-xs text-white focus:outline-none" required />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModalCheckoutRegalo(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-lg font-bold text-xs cursor-pointer">Cancelar</button>
                  <button type="submit" disabled={procesandoPago} className="flex-1 py-3 rounded-lg font-bold text-xs cursor-pointer text-white transition" style={{ backgroundColor: 'var(--color-primary)' }}>{procesandoPago ? 'Procesando...' : 'Confirmar'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}