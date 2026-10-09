import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, X, MapPin } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { formatearCLP } from '../utils';

export default function Notificaciones({ sesionActual, actualizarUsuarioEnStorage, actualizarUsuarioPorUsername, setVistaActual, setMensajeModalGlobal, abrirPerfilPublico }) {
  const [dropdownNotifOpen, setDropdownNotifOpen] = useState(false);
  const [modalAceptarRegaloOpen, setModalAceptarRegaloOpen] = useState(false);
  const [regaloAceptandoActual, setRegaloAceptandoActual] = useState(null);
  const [direccionSeleccionadaRegalo, setDireccionSeleccionadaRegalo] = useState('');
  const dropdownNotifRef = useRef(null);

  // --- EFECTO CON TIEMPO REAL INTEGRADO ---
  useEffect(() => {
    const sincronizarBuzonSupabase = async () => {
      const generarChatId = (user1, user2) => [user1.toLowerCase(), user2.toLowerCase()].sort().join('_');
      const currentUserStr = localStorage.getItem('redragon_sesion_activa');
      if (!currentUserStr) return;
      const currentUser = JSON.parse(currentUserStr);
      if (!currentUser?.email && !currentUser?.id) return;

      try {
        let querySelect = supabase.from('profiles').select('notificaciones, amigos_wishlist');
        if (currentUser.id) querySelect = querySelect.eq('id', currentUser.id);
        else querySelect = querySelect.eq('email', currentUser.email);

        const { data: miPerfilBD } = await querySelect.single();
        if (!miPerfilBD) return;

        let misNotifs = miPerfilBD.notificaciones || [];
        let misAmigos = miPerfilBD.amigos_wishlist || [];
        let huboCambios = false;

        const { data: nuevasNotifs } = await supabase.from('notifications').select('*').eq('user_id', currentUser.id);
        
        if (nuevasNotifs && nuevasNotifs.length > 0) {
          for (const n of nuevasNotifs) {
            await supabase.from('notifications').delete().eq('id', n.id);

            if (n.type === 'solicitud_amistad') {
              const emisor = n.data?.emisor;
              if (emisor && !misAmigos.some(a => a.username === emisor)) {
                misAmigos.push({ username: emisor, estado: 'pendiente', tipo: 'recibida', fecha: new Date().toISOString() });
                huboCambios = true;
              }
            } else if (n.type === 'amigo_aceptado') {
              const emisor = n.data?.emisor;
              if (emisor) {
                const idx = misAmigos.findIndex(a => a.username === emisor);
                if (idx !== -1) { misAmigos[idx].estado = 'aceptado'; } 
                else { misAmigos.push({ username: emisor, estado: 'aceptado', xp: 50, fecha: new Date().toLocaleDateString(), fechaInicio: Date.now() }); }
                huboCambios = true;
              }
            } else if (n.type === 'chat_mensaje') {
              // 💬 CAPTURAR MENSAJE DE CHAT Y GUARDARLO LOCALMENTE
              const emisor = n.data?.emisor;
              if (emisor) {
                const chatId = generarChatId(currentUser.username, emisor);
                const chatsLocales = JSON.parse(localStorage.getItem('redragon_chats')) || {};
                const nuevoMsj = {
                  emisor: emisor,
                  texto: n.message,
                  timestamp: new Date(n.created_at || Date.now()).getTime()
                };

                const mensajesActuales = chatsLocales[chatId] || [];
                // Evitar duplicados evaluando timestamp y texto
                if (!mensajesActuales.some(m => m.timestamp === nuevoMsj.timestamp && m.texto === nuevoMsj.texto)) {
                  chatsLocales[chatId] = [...mensajesActuales, nuevoMsj];
                  localStorage.setItem('redragon_chats', JSON.stringify(chatsLocales));
                }
              }
            }

            const idUnico = `DB-${n.id}`;
            // Evitar duplicar notificaciones que no sean de chat en el buzón visual
            if (n.type !== 'chat_mensaje' && !misNotifs.some(mn => mn.id === idUnico)) {
              misNotifs.unshift({
                id: idUnico,
                tipo: n.type || 'sistema',
                titulo: n.title || 'Notificación',
                mensaje: n.message || '',
                emisor: n.data?.emisor || 'Sistema',
                codigo: n.data?.coupon_code || n.data?.codigo || null,
                productos: n.data?.productos || [],
                total: n.data?.total || 0,
                fecha: new Date(n.created_at || Date.now()).toLocaleDateString(),
                timestamp: new Date(n.created_at || Date.now()).getTime(),
                estado: 'pendiente'
              });
              huboCambios = true;
            }
          }
        }
        
        if (huboCambios) {
          const perfilActualizado = { ...currentUser, notificaciones: misNotifs, amigosWishlist: misAmigos, amigos_wishlist: misAmigos };
          actualizarUsuarioEnStorage(perfilActualizado);
          
          let queryUpdate = supabase.from('profiles').update({ notificaciones: misNotifs, amigos_wishlist: misAmigos });
          if (currentUser.id) queryUpdate = queryUpdate.eq('id', currentUser.id);
          else queryUpdate = queryUpdate.eq('email', currentUser.email);
          await queryUpdate;
        }
      } catch (err) { console.error("Error sincronizando buzón:", err); }
    };

    sincronizarBuzonSupabase(); 
    
    // SUSCRIPCIÓN WEB-SOCKET: Escucha notificaciones en tiempo real
    let suscripcionNotifs = null;
    const currentUserStr = localStorage.getItem('redragon_sesion_activa');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser?.id) {
        suscripcionNotifs = supabase
          .channel('nuevas-notificaciones-al-instante')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${currentUser.id}` },
            () => { sincronizarBuzonSupabase(); } // ¡Se llama apenas entra algo en la base de datos!
          )
          .subscribe();
      }
    }

    return () => {
      if (suscripcionNotifs) supabase.removeChannel(suscripcionNotifs);
    };
  }, []);
  // ------------------------------------------

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownNotifRef.current && !dropdownNotifRef.current.contains(e.target)) setDropdownNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatearDirTexto = (dir) => {
    if (!dir) return 'Sin dirección';
    if (typeof dir === 'string') return dir;
    return `${dir.calle || ''}, ${dir.comuna || ''}, ${dir.region || ''}`.trim();
  };

  const notificaciones = [...(sesionActual?.notificaciones || [])].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  const pendientesCount = notificaciones.filter(n => n.estado === 'pendiente').length;

  const eliminarNotificacion = (idNotif, e) => {
    e.stopPropagation();
    const nuevasNotifs = (sesionActual.notificaciones || []).filter(n => n.id !== idNotif);
    actualizarUsuarioEnStorage({ ...sesionActual, notificaciones: nuevasNotifs });
  };

  const marcarTodasComoLeidas = () => {
    const nuevasNotifs = (sesionActual.notificaciones || []).map(n => ({ ...n, estado: 'leido' }));
    actualizarUsuarioEnStorage({ ...sesionActual, notificaciones: nuevasNotifs });
  };

  const iniciarAceptacionRegalo = (notif, e) => {
    e.stopPropagation();
    setRegaloAceptandoActual(notif);
    const primeraDir = formatearDirTexto(sesionActual.direcciones?.[0]);
    setDireccionSeleccionadaRegalo(primeraDir);
    setModalAceptarRegaloOpen(true);
  };

  const confirmarAceptarRegalo = async (e) => {
    e.preventDefault();
    if (!regaloAceptandoActual) return;
    const notif = regaloAceptandoActual;
    const xpGanada = Math.floor((notif.total || 0) / 1000) * 10 + 50;

    let amigosReceptor = (sesionActual.amigosWishlist || sesionActual.amigos_wishlist || []).map(amigo => {
      if (amigo.username.toLowerCase() === notif.emisor.toLowerCase()) return { ...amigo, xp: (amigo.xp || 0) + xpGanada };
      return amigo;
    });

    const nuevoPedido = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`, email: sesionActual.email, fecha: new Date().toLocaleDateString(),
      productos: notif.productos || [], subtotal: notif.total || 0, descuento: 0, envio: 0, total: notif.total || 0,
      estado: 'Procesando', direccionEnvio: direccionSeleccionadaRegalo, esRegaloDe: notif.emisor
    };

    const nuevosPedidos = [nuevoPedido, ...(sesionActual.pedidos || [])];
    const notifsActualizadas = (sesionActual.notificaciones || []).filter(n => n.id !== notif.id);
    
    actualizarUsuarioEnStorage({ ...sesionActual, notificaciones: notifsActualizadas, amigosWishlist: amigosReceptor, pedidos: nuevosPedidos });

    let queryUpdate = supabase.from('profiles').update({ notificaciones: notifsActualizadas, amigos_wishlist: amigosReceptor });
    if (sesionActual?.id) queryUpdate = queryUpdate.eq('id', sesionActual.id);
    else queryUpdate = queryUpdate.eq('email', sesionActual.email);
    await queryUpdate;

    try {
      const { data: emisorData } = await supabase.from('profiles').select('id').ilike('username', notif.emisor).single();
      if (emisorData && emisorData.id) {
        await supabase.from('notifications').insert([{
          user_id: emisorData.id, type: 'sistema', title: '🎁 ¡Regalo aceptado!',
          message: `@${sesionActual.username} ha aceptado tu regalo. (+${xpGanada} XP)`, data: { emisor: sesionActual.username }
        }]);
      }
    } catch(err) { console.error("Error al enviar notificación de regalo aceptado:", err); }

    setModalAceptarRegaloOpen(false); setRegaloAceptandoActual(null); setVistaActual('orders');
    setMensajeModalGlobal?.(`¡Regalo aceptado con éxito!`);
  };

  const rechazarRegaloNotif = async (notif, e) => {
    e.stopPropagation();
    const notifsActualizadas = (sesionActual.notificaciones || []).filter(n => n.id !== notif.id);
    actualizarUsuarioEnStorage({ ...sesionActual, notificaciones: notifsActualizadas });
    
    let queryUpdate = supabase.from('profiles').update({ notificaciones: notifsActualizadas });
    if (sesionActual?.id) queryUpdate = queryUpdate.eq('id', sesionActual.id);
    else queryUpdate = queryUpdate.eq('email', sesionActual.email);
    await queryUpdate;

    try {
      const { data: emisorData } = await supabase.from('profiles').select('id').ilike('username', notif.emisor).single();
      if (emisorData && emisorData.id) {
        await supabase.from('notifications').insert([{
          user_id: emisorData.id, type: 'sistema', title: '❌ Regalo rechazado',
          message: `@${sesionActual.username} ha rechazado el regalo que le enviaste.`, data: { emisor: sesionActual.username }
        }]);
      }
    } catch(err) { console.error("Error al enviar notificación de rechazo:", err); }

    setMensajeModalGlobal?.(`Has rechazado el regalo de @${notif.emisor}.`);
  };

  const aceptarSolicitudAmistadNotif = async (notif, e) => {
    e.stopPropagation();
    const amigoUsername = notif.emisor || notif.data?.requester_username;
    
    const listaActualAmigos = sesionActual.amigosWishlist || sesionActual.amigos_wishlist || [];
    const nuevosAmigos = [...listaActualAmigos.filter(a => a.username !== amigoUsername), { username: amigoUsername, estado: 'aceptado', xp: 50, fecha: new Date().toLocaleDateString(), fechaInicio: Date.now() }];
    const notifsActualizadas = (sesionActual.notificaciones || []).filter(n => n.id !== notif.id);
    
    const miPerfilActualizado = { ...sesionActual, amigosWishlist: nuevosAmigos, amigos_wishlist: nuevosAmigos, notificaciones: notifsActualizadas };
    actualizarUsuarioEnStorage(miPerfilActualizado);
    
    let queryUpdate = supabase.from('profiles').update({ amigos_wishlist: nuevosAmigos, notificaciones: notifsActualizadas });
    if (sesionActual?.id) queryUpdate = queryUpdate.eq('id', sesionActual.id);
    else queryUpdate = queryUpdate.eq('email', sesionActual.email);
    await queryUpdate.select();

    try {
      const { data: otroUser } = await supabase.from('profiles').select('id').eq('username', amigoUsername).single();
      if (otroUser && otroUser.id) {
        await supabase.from('notifications').insert([{
          user_id: otroUser.id, type: 'amigo_aceptado', title: '🤝 ¡Solicitud Aceptada!',
          message: `@${sesionActual.username} ha aceptado tu solicitud.`, data: { emisor: sesionActual.username }
        }]);
      }
    } catch(err) { console.error("Error confirmando amistad:", err); }

    setMensajeModalGlobal?.(`¡Ahora eres amigo de @${amigoUsername}!`);
  };

  const rechazarSolicitudAmistadNotif = async (notif, e) => {
    e.stopPropagation();
    const amigoUsername = notif.emisor || notif.data?.requester_username;
    const notifsActualizadas = (sesionActual.notificaciones || []).filter(n => n.id !== notif.id);
    const amigosActualizados = (sesionActual.amigosWishlist || sesionActual.amigos_wishlist || []).filter(a => a.username !== amigoUsername);
    
    const perfilActualizado = { ...sesionActual, notificaciones: notifsActualizadas, amigosWishlist: amigosActualizados, amigos_wishlist: amigosActualizados };
    actualizarUsuarioEnStorage(perfilActualizado);

    let queryUpdate = supabase.from('profiles').update({ amigos_wishlist: amigosActualizados, notificaciones: notifsActualizadas });
    if (sesionActual?.id) queryUpdate = queryUpdate.eq('id', sesionActual.id);
    else queryUpdate = queryUpdate.eq('email', sesionActual.email);
    await queryUpdate;

    setMensajeModalGlobal?.('Has rechazado la solicitud de amistad.');
  };

  const handleClicNotificacion = (notif) => {
    const notifsActualizadas = (sesionActual.notificaciones || []).map(n => n.id === notif.id ? { ...n, estado: 'leido' } : n);
    actualizarUsuarioEnStorage({ ...sesionActual, notificaciones: notifsActualizadas });
    setDropdownNotifOpen(false);

    if ((notif.tipo === 'promo' || notif.tipo === 'limited_coupon') && (notif.codigo || notif.data?.coupon_code)) { 
      navigator.clipboard.writeText(notif.codigo || notif.data?.coupon_code); 
      setMensajeModalGlobal?.(`¡Código copiado!`); 
    }
    else if (notif.tipo === 'pedido' || notif.tipo === 'pedido_entregado' || notif.tipo === 'order_update') { setVistaActual('orders'); }
    else if (notif.tipo === 'amigo_aceptado' && abrirPerfilPublico) { abrirPerfilPublico(notif.emisor || notif.data?.emisor); }
    else if (notif.tipo === 'solicitud_amistad') { setVistaActual('profile'); }
  };

  return (
    <div className="relative" ref={dropdownNotifRef}>
      <button onClick={() => setDropdownNotifOpen(!dropdownNotifOpen)} className="p-2 bg-black/40 rounded-lg cursor-pointer relative border border-white/25 hover:bg-black/60 transition">
        <Bell size={20} />
        {pendientesCount > 0 && <span className="absolute -top-1 -right-1 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse" style={{ backgroundColor: 'var(--color-primary)' }}>{pendientesCount}</span>}
      </button>
      {dropdownNotifOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 text-white flex flex-col max-h-[450px] animate-fade-in">
          <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center">
            <span className="font-bold text-sm">Notificaciones ({notificaciones.length})</span>
            <button onClick={marcarTodasComoLeidas} className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"><CheckCheck size={14}/> Marcar leídas</button>
          </div>
          <div className="overflow-y-auto divide-y divide-zinc-800 text-xs flex-1">
            {notificaciones.length === 0 ? <p className="text-zinc-400 text-center py-8">No hay notificaciones.</p> :
              notificaciones.map((notif, idx) => (
                <div key={notif.id || idx} onClick={() => handleClicNotificacion(notif)} className={`p-3 cursor-pointer hover:bg-zinc-800/80 transition relative group ${notif.estado === 'pendiente' ? 'border-l-4 bg-red-950/15' : ''}`} style={notif.estado === 'pendiente' ? { borderColor: 'var(--color-primary)' } : {}}>
                  <div className="flex justify-between font-bold mb-1 items-center">
                    <span className="flex items-center gap-1 text-white">{notif.titulo}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-zinc-500">{notif.fecha}</span>
                      <button onClick={(e) => eliminarNotificacion(notif.id, e)} className="text-zinc-500 hover:text-red-400 p-0.5 rounded cursor-pointer"><X size={14}/></button>
                    </div>
                  </div>
                  <p className="text-zinc-300 pr-4">{notif.mensaje}</p>

                  {notif.tipo === 'limited_coupon' && (
                    <div className="mt-3 pt-2 border-t border-zinc-800">
                      <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(notif.data?.coupon_code || notif.codigo); setMensajeModalGlobal?.(`¡Código copiado al portapapeles!`); }} className="text-white bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded font-bold text-xs cursor-pointer transition">Copiar Código</button>
                    </div>
                  )}

                  {notif.tipo === 'order_update' && (
                    <div className="mt-3 pt-2 border-t border-zinc-800">
                      <button onClick={(e) => { e.stopPropagation(); setVistaActual('orders'); setDropdownNotifOpen(false); }} className="text-white border border-zinc-600 hover:bg-zinc-700 px-3 py-1.5 rounded font-bold text-xs cursor-pointer transition">Ver mi pedido</button>
                    </div>
                  )}

                  {notif.tipo === 'regalo_recibido' && notif.estado === 'pendiente' && (
                    <div className="mt-3 pt-2 border-t border-zinc-800 flex gap-2">
                      <button onClick={(e) => iniciarAceptacionRegalo(notif, e)} className="flex-1 text-white py-1.5 rounded font-bold cursor-pointer transition" style={{ backgroundColor: 'var(--color-primary)' }}>Aceptar Regalo</button>
                      <button onClick={(e) => rechazarRegaloNotif(notif, e)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-1.5 rounded font-bold cursor-pointer transition">Rechazar</button>
                    </div>
                  )}
                  {notif.tipo === 'solicitud_amistad' && notif.estado === 'pendiente' && (
                    <div className="mt-3 pt-2 border-t border-zinc-800 flex gap-2">
                      <button onClick={(e) => aceptarSolicitudAmistadNotif(notif, e)} className="flex-1 text-white py-1.5 rounded font-bold cursor-pointer transition" style={{ backgroundColor: 'var(--color-primary)' }}>Aceptar Solicitud</button>
                      <button onClick={(e) => rechazarSolicitudAmistadNotif(notif, e)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-1.5 rounded font-bold cursor-pointer transition">Rechazar</button>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* MODAL ACEPTAR REGALO */}
      {modalAceptarRegaloOpen && regaloAceptandoActual && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 text-white animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--color-primary)' }}><MapPin size={20}/> Selecciona tu Dirección</h3>
              <button onClick={() => setModalAceptarRegaloOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer"><X size={20}/></button>
            </div>
            <p className="text-xs text-zinc-300">Aceptando regalo de <strong className="text-white">@{regaloAceptandoActual.emisor}</strong> con {regaloAceptandoActual.productos?.length || 0} producto(s).</p>
            <form onSubmit={confirmarAceptarRegalo} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-zinc-400 font-semibold">Direcciones Registradas:</label>
                {(!sesionActual.direcciones || sesionActual.direcciones.length === 0) ? (
                  <p className="text-xs text-red-400 bg-red-950/30 p-3 rounded-lg border border-red-900/50">No tienes direcciones guardadas en tu perfil.</p>
                ) : (
                  <select value={direccionSeleccionadaRegalo} onChange={(e) => setDireccionSeleccionadaRegalo(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-xs text-white focus:outline-none" required>
                    {sesionActual.direcciones.map((dir, i) => <option key={i} value={formatearDirTexto(dir)}>{formatearDirTexto(dir)}</option>)}
                  </select>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModalAceptarRegaloOpen(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-2.5 rounded-lg font-bold text-xs cursor-pointer">Cancelar</button>
                <button type="submit" disabled={!sesionActual.direcciones?.length} className="flex-1 text-white py-2.5 rounded-lg font-bold text-xs cursor-pointer transition disabled:opacity-50" style={{ backgroundColor: 'var(--color-primary)' }}>Aceptar y Ver Pedidos</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}