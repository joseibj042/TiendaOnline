import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Ban, Flag, Heart, Trash2, Search, CheckSquare, Square, X, CheckCircle, CreditCard } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { formatearCLP } from '../utils';
import { useSession } from '../context/SessionContext';

export default function VistaAmigos({ setVistaActual }) {
  const { usuarioActivo, setUsuarioActivo } = useSession(); // USANDO CONTEXTO
  const [activeTab, setActiveTab] = useState('lista'); 
  const [amigos, setAmigos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [enviandoUsername, setEnviandoUsername] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  const [amigoRegalo, setAmigoRegalo] = useState(null);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  
  const [modalCheckout, setModalCheckout] = useState(false);
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState('visa_4242');
  const [cvv, setCvv] = useState('');
  const [procesandoPago, setProcesandoPago] = useState(false);

  const [usuarioAReportar, setUsuarioAReportar] = useState(null);
  const [razonReporte, setRazonReporte] = useState('');
  const [detalleReporte, setDetalleReporte] = useState('');

  useEffect(() => {
    const obtenerAmigosFrescos = async () => {
      if (!usuarioActivo?.id && !usuarioActivo?.email) return;
      try {
        let query = supabase.from('profiles').select('amigos_wishlist');
        if (usuarioActivo.id) query = query.eq('id', usuarioActivo.id);
        else query = query.eq('email', usuarioActivo.email);

        const { data, error } = await query.single();
        if (!error && data) {
          const listaBD = data.amigos_wishlist || [];
          setAmigos(listaBD);
          setUsuarioActivo({ ...usuarioActivo, amigos_wishlist: listaBD, amigosWishlist: listaBD });
        }
      } catch (err) {
        setAmigos(usuarioActivo?.amigos_wishlist || usuarioActivo?.amigosWishlist || []);
      }
    };
    
    obtenerAmigosFrescos();

    if (!usuarioActivo?.id) return;
    const suscripcionPerfil = supabase
      .channel('cambios-mis-amigos')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${usuarioActivo.id}` },
        (payload) => {
          if (payload.new && payload.new.amigos_wishlist) {
            setAmigos(payload.new.amigos_wishlist);
            setUsuarioActivo({ ...usuarioActivo, amigos_wishlist: payload.new.amigos_wishlist, amigosWishlist: payload.new.amigos_wishlist });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(suscripcionPerfil); };
  }, [usuarioActivo?.id]);

  const mostrarMensaje = (msg) => {
    setMensajeExito(msg);
    setTimeout(() => setMensajeExito(null), 4000);
  };

  const actualizarAmigosEnBD = async (nuevosAmigos) => {
    if (!usuarioActivo?.id && !usuarioActivo?.email) return;
    let queryUpdate = supabase.from('profiles').update({ amigos_wishlist: nuevosAmigos });
    if (usuarioActivo?.id) queryUpdate = queryUpdate.eq('id', usuarioActivo.id);
    else queryUpdate = queryUpdate.eq('email', usuarioActivo.email);
    
    const { error } = await queryUpdate;

    if (!error) {
      setAmigos(nuevosAmigos);
      setUsuarioActivo({ ...usuarioActivo, amigos_wishlist: nuevosAmigos, amigosWishlist: nuevosAmigos });
    }
  };

  const sincronizarRelacionRemota = async (targetUsername, accion) => {
    if (!usuarioActivo?.username) return;
    try {
      const { data: targetData } = await supabase.from('profiles').select('id, amigos_wishlist').ilike('username', targetUsername).single();

      if (targetData && targetData.id) {
        let listaAmigosOtro = targetData.amigos_wishlist || [];
        if (['eliminado', 'bloqueado', 'reportado'].includes(accion)) {
          listaAmigosOtro = listaAmigosOtro.filter(a => a.username.toLowerCase() !== usuarioActivo.username.toLowerCase());
        } else if (accion === 'aceptado') {
          const idx = listaAmigosOtro.findIndex(a => a.username.toLowerCase() === usuarioActivo.username.toLowerCase());
          if (idx !== -1) {
            listaAmigosOtro[idx].estado = 'aceptado';
            listaAmigosOtro[idx].fechaInicio = Date.now();
          } else {
            listaAmigosOtro.push({ username: usuarioActivo.username, estado: 'aceptado', xp: 50, fecha: new Date().toLocaleDateString(), fechaInicio: Date.now() });
          }
        }
        await supabase.from('profiles').update({ amigos_wishlist: listaAmigosOtro }).eq('id', targetData.id);
      }
    } catch (err) {
      console.error("Error al sincronizar relación bilateral:", err);
    }
  };

  const buscarUsuarios = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) return;
    setBuscando(true);
    const { data, error } = await supabase.from('profiles').select('username, avatar_url, bio').ilike('username', `%${busqueda}%`).neq('username', usuarioActivo.username);
    if (!error && data) setResultadosBusqueda(data);
    setBuscando(false);
  };

  const abrirWishlistAmigo = async (amigo) => {
    let wishlistFinal = [], avatarFinal = '', bannerFinal = '';
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('username', amigo.username).single();
      if (!error && data) {
        wishlistFinal = data.wishlist || []; 
        avatarFinal = data.avatar_url || data.avatar || '';
        bannerFinal = data.banner_url || data.banner || '';
      }
    } catch (err) { console.error(err); }
    setAmigoRegalo({ ...amigo, wishlist: wishlistFinal, avatar: avatarFinal, banner: bannerFinal });
    setProductosSeleccionados([]);
  };

  const confirmarRegalo = async () => {
    if (!amigoRegalo || productosSeleccionados.length === 0 || procesandoPago) return;
    if (cvv.length < 3) return; 

    setProcesandoPago(true); 
    const totalRegalo = productosSeleccionados.reduce((acc, p) => acc + (p.precio || 0), 0);
    
    try {
      const { data: amigoData } = await supabase.from('profiles').select('id').eq('username', amigoRegalo.username).single();
      if (amigoData && amigoData.id) {
        await supabase.from('notifications').insert([{
          user_id: amigoData.id,
          type: 'regalo_recibido',
          title: '🎁 ¡Tienes un regalo nuevo!',
          message: `@${usuarioActivo.username} te ha enviado un regalo sorpresa.`,
          data: {
            emisor: usuarioActivo.username,
            productos: productosSeleccionados,
            total: totalRegalo
          }
        }]);
      }
    } catch(err) { console.error("Error al enviar regalo:", err); }

    setTimeout(() => {
      setProcesandoPago(false);
      setModalCheckout(false);
      setAmigoRegalo(null);
      setProductosSeleccionados([]);
      setCvv('');
      mostrarMensaje(`¡Pago aprobado! El regalo va en camino a @${amigoRegalo.username}.`);
    }, 1200);
  };

  const enviarSolicitud = async (targetUsername) => {
    const amigoExistente = amigos.find(a => a.username.toLowerCase() === targetUsername.toLowerCase());
    if (amigoExistente) {
      if (amigoExistente.estado === 'pendiente') return mostrarMensaje(`Ya tienes una solicitud pendiente.`);
      if (amigoExistente.estado === 'aceptado') return mostrarMensaje(`Ya eres amigo de @${targetUsername}.`);
    }
    setEnviandoUsername(targetUsername);
    const nuevoItemAmigo = { username: targetUsername, estado: 'pendiente', tipo: 'enviada', fecha: new Date().toISOString() };
    const nuevosAmigos = [...amigos, nuevoItemAmigo];
    await actualizarAmigosEnBD(nuevosAmigos);

    try {
      const { data: targetUser } = await supabase.from('profiles').select('id').eq('username', targetUsername).single();
      if (targetUser && targetUser.id) {
        await supabase.from('notifications').insert([{
          user_id: targetUser.id, type: 'solicitud_amistad', title: '¡Nueva solicitud de amistad!',
          message: `@${usuarioActivo.username} quiere conectar contigo.`, data: { emisor: usuarioActivo.username }
        }]);
      }
    } catch (err) { console.error(err); }
    setEnviandoUsername(null);
    mostrarMensaje(`¡Solicitud enviada a @${targetUsername}!`);
  };

  const modificarEstadoAmigo = async (username, nuevoEstado) => {
    let nuevosAmigos = amigos;
    if (nuevoEstado === 'eliminado') nuevosAmigos = amigos.filter(a => a.username !== username);
    else nuevosAmigos = amigos.map(a => a.username === username ? { ...a, estado: nuevoEstado, tipo: undefined } : a);
    await actualizarAmigosEnBD(nuevosAmigos);
    await sincronizarRelacionRemota(username, nuevoEstado);

    if (nuevoEstado === 'aceptado') {
      try {
        const { data: otroUser } = await supabase.from('profiles').select('id').ilike('username', username).single();
        if (otroUser && otroUser.id) {
          await supabase.from('notifications').insert([{
            user_id: otroUser.id, type: 'amigo_aceptado', title: '🤝 ¡Solicitud Aceptada!',
            message: `@${usuarioActivo.username} ha aceptado tu solicitud.`, data: { emisor: usuarioActivo.username }
          }]);
        }
      } catch(err) { console.error(err); }
    }
    mostrarMensaje(nuevoEstado === 'eliminado' ? 'Solicitud rechazada / eliminada.' : `Usuario ${nuevoEstado}.`);
  };

  const confirmarReporte = async () => {
    let nuevosAmigos = [...amigos];
    const index = nuevosAmigos.findIndex(a => a.username === usuarioAReportar);
    if (index !== -1) {
      nuevosAmigos[index] = { ...nuevosAmigos[index], estado: 'reportado', razon: razonReporte, detalle: detalleReporte, tipo: undefined };
    } else {
      nuevosAmigos.push({ username: usuarioAReportar, estado: 'reportado', razon: razonReporte, detalle: detalleReporte, fecha: new Date().toISOString() });
    }
    await actualizarAmigosEnBD(nuevosAmigos);
    await sincronizarRelacionRemota(usuarioAReportar, 'reportado');
    mostrarMensaje(`Has reportado y bloqueado a @${usuarioAReportar}.`);
    setUsuarioAReportar(null);
    setRazonReporte('');
    setDetalleReporte('');
  };

  const amigosActivos = amigos.filter(a => a.estado === 'aceptado');
  const solicitudesPendientes = amigos.filter(a => a.estado === 'pendiente' && a.tipo !== 'enviada');
  const amigosBloqueados = amigos.filter(a => a.estado === 'bloqueado' || a.estado === 'reportado');

  return (
    <div className="max-w-6xl mx-auto p-4 mt-8 animate-fade-in text-white relative">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3"><Users size={32} style={{ color: 'var(--color-primary)' }}/> Centro de Amigos</h2>

      <div className="flex gap-4 border-b border-zinc-800 mb-6 pb-2 overflow-x-auto">
        <button onClick={() => setActiveTab('lista')} className={`font-bold pb-2 border-b-2 transition whitespace-nowrap ${activeTab === 'lista' ? 'text-white' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`} style={activeTab === 'lista' ? { borderColor: 'var(--color-primary)' } : {}}>Mis Amigos</button>
        <button onClick={() => setActiveTab('solicitudes')} className={`font-bold pb-2 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'solicitudes' ? 'text-white' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`} style={activeTab === 'solicitudes' ? { borderColor: 'var(--color-primary)' } : {}}>
          Solicitudes {solicitudesPendientes.length > 0 && <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">{solicitudesPendientes.length}</span>}
        </button>
        <button onClick={() => setActiveTab('buscar')} className={`font-bold pb-2 border-b-2 transition whitespace-nowrap ${activeTab === 'buscar' ? 'text-white' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`} style={activeTab === 'buscar' ? { borderColor: 'var(--color-primary)' } : {}}>Añadir Amigos</button>
        <button onClick={() => setActiveTab('bloqueados')} className={`font-bold pb-2 border-b-2 transition whitespace-nowrap ${activeTab === 'bloqueados' ? 'text-white' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`} style={activeTab === 'bloqueados' ? { borderColor: 'var(--color-primary)' } : {}}>Bloqueados / Reportados</button>
      </div>

      {activeTab === 'lista' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {amigosActivos.length === 0 ? <p className="text-zinc-500 col-span-full text-center py-10 bg-zinc-900 rounded-xl">No tienes amigos añadidos aún.</p> : (
            amigosActivos.map((amigo, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col items-center text-center relative group">
                <div className="w-16 h-16 bg-zinc-800 rounded-full mb-3 flex items-center justify-center font-bold text-xl overflow-hidden border-2 border-zinc-700">
                  {amigo.username.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-bold text-lg">@{amigo.username}</h3>
                <div className="w-full mt-4 flex flex-col gap-2">
                  <button onClick={() => abrirWishlistAmigo(amigo)} className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer">
                    <Heart size={14} className="text-red-400 fill-red-400"/> Ver Wishlist y Regalar
                  </button>
                  <div className="flex gap-2 w-full mt-2">
                    <button onClick={() => modificarEstadoAmigo(amigo.username, 'eliminado')} className="flex-1 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"><Trash2 size={12}/> Eliminar</button>
                    <button onClick={() => modificarEstadoAmigo(amigo.username, 'bloqueado')} className="flex-1 py-1.5 bg-orange-950/40 hover:bg-orange-900/60 text-orange-400 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"><Ban size={12}/> Bloquear</button>
                    <button onClick={() => setUsuarioAReportar(amigo.username)} className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"><Flag size={12}/> Reportar</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'solicitudes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solicitudesPendientes.length === 0 ? <p className="text-zinc-500 col-span-full text-center py-10 bg-zinc-900 rounded-xl">No tienes solicitudes pendientes.</p> : (
            solicitudesPendientes.map((amigo, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col items-center text-center relative">
                <div className="w-16 h-16 bg-zinc-800 rounded-full mb-3 flex items-center justify-center font-bold text-xl overflow-hidden border-2 border-zinc-700">
                  {amigo.username.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-bold text-lg">@{amigo.username}</h3>
                <p className="text-xs text-zinc-400 mt-1">Quiere conectar contigo</p>
                <div className="w-full mt-4 flex flex-col gap-2">
                  <button onClick={() => modificarEstadoAmigo(amigo.username, 'aceptado')} className="w-full py-2 rounded-lg font-bold text-xs text-white transition flex items-center justify-center gap-1.5 cursor-pointer" style={{ backgroundColor: 'var(--color-primary)' }}><CheckCircle size={14}/> Aceptar</button>
                  <div className="grid grid-cols-3 gap-1.5 w-full mt-1">
                    <button onClick={() => modificarEstadoAmigo(amigo.username, 'eliminado')} className="py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-lg text-[11px] font-bold cursor-pointer transition flex items-center justify-center gap-1"><X size={12}/> Rechazar</button>
                    <button onClick={() => modificarEstadoAmigo(amigo.username, 'bloqueado')} className="py-1.5 bg-orange-950/40 hover:bg-orange-900/60 text-orange-400 rounded-lg text-[11px] font-bold cursor-pointer transition flex items-center justify-center gap-1"><Ban size={12}/> Bloquear</button>
                    <button onClick={() => setUsuarioAReportar(amigo.username)} className="py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-[11px] font-bold cursor-pointer transition flex items-center justify-center gap-1"><Flag size={12}/> Reportar</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'buscar' && (
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl max-w-2xl mx-auto">
          <form onSubmit={buscarUsuarios} className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-zinc-500" size={18}/>
              <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar..." className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white"/>
            </div>
            <button type="submit" disabled={buscando} className="px-6 py-2.5 rounded-lg font-bold text-sm text-white transition cursor-pointer" style={{ backgroundColor: 'var(--color-primary)' }}>{buscando ? 'Buscando...' : 'Buscar'}</button>
          </form>
          <div className="space-y-3">
            {resultadosBusqueda.map((user, i) => {
              const yaEsAmigo = amigos.find(a => a.username.toLowerCase() === user.username.toLowerCase());
              return (
                <div key={i} className="flex items-center justify-between p-4 bg-zinc-800/40 border border-zinc-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden">{user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover"/> : user.username.charAt(0).toUpperCase()}</div>
                    <div><p className="font-bold">@{user.username}</p></div>
                  </div>
                  <div className="flex gap-2">
                    {yaEsAmigo ? <span className="text-xs font-bold text-zinc-400 px-3 py-1.5 bg-zinc-900 rounded-lg border border-zinc-700">{yaEsAmigo.estado.toUpperCase()}</span> : <button onClick={() => enviarSolicitud(user.username)} className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer"><UserPlus size={14}/> Añadir</button>}
                    <button onClick={() => setUsuarioAReportar(user.username)} className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-red-400 transition cursor-pointer" title="Reportar"><Flag size={14}/></button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'bloqueados' && (
        <div className="max-w-2xl mx-auto space-y-4">
          {amigosBloqueados.length === 0 ? <p className="text-zinc-500 text-center py-8">No tienes usuarios bloqueados ni reportados.</p> : (
            amigosBloqueados.map((amigo, i) => (
              <div key={i} className="flex flex-col p-4 bg-red-950/20 border border-red-900/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-red-400 flex items-center gap-2"><Ban size={16}/> @{amigo.username} <span className="text-xs text-zinc-400 uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded">({amigo.estado})</span></p>
                  <button onClick={() => modificarEstadoAmigo(amigo.username, 'eliminado')} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold transition cursor-pointer">Desbloquear / Quitar</button>
                </div>
                {amigo.estado === 'reportado' && amigo.razon && (
                  <div className="mt-3 ml-6 text-xs text-zinc-400 bg-black/20 p-2 rounded border border-zinc-800">
                    <strong className="text-zinc-300">Motivo del reporte:</strong> {amigo.razon}
                    {amigo.detalle && <span className="block mt-1">"{amigo.detalle}"</span>}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {usuarioAReportar && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 text-white animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-xl font-bold border-b border-zinc-800 pb-2 flex items-center gap-2"><Flag size={20} className="text-red-500"/> Reportar a @{usuarioAReportar}</h3>
            <p className="text-sm text-zinc-300">Indícanos el motivo de tu reporte. El usuario quedará bloqueado inmediatamente.</p>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">Motivo principal</label>
                <select value={razonReporte} onChange={e => setRazonReporte(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition cursor-pointer">
                  <option value="">Selecciona un motivo...</option>
                  <option value="Spam o publicidad">Spam o publicidad</option>
                  <option value="Lenguaje inapropiado o acoso">Lenguaje inapropiado o acoso</option>
                  <option value="Estafa o intento de fraude">Estafa o intento de fraude</option>
                  <option value="Perfil falso o suplantación">Perfil falso o suplantación</option>
                  <option value="Otro motivo">Otro motivo</option>
                </select>
              </div>
              {razonReporte && (
                <div className="animate-fade-in">
                  <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">Detalles adicionales (opcional)</label>
                  <textarea value={detalleReporte} onChange={e => setDetalleReporte(e.target.value)} placeholder="Escribe más detalles..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition resize-none h-20"/>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-4">
              <button onClick={() => { setUsuarioAReportar(null); setRazonReporte(''); setDetalleReporte(''); }} className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-2.5 rounded-lg font-bold text-sm cursor-pointer transition">Cancelar</button>
              <button onClick={confirmarReporte} disabled={!razonReporte} className="flex-1 text-white py-2.5 rounded-lg font-bold text-sm cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 hover:bg-red-500">Bloquear y Reportar</button>
            </div>
          </div>
        </div>
      )}

      {amigoRegalo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-white animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="h-32 bg-cover bg-center relative border-b border-zinc-700" style={{ backgroundImage: amigoRegalo.banner ? `url(${amigoRegalo.banner})` : 'url(/images/banner-default.jpg)' }}>
              <button onClick={() => setAmigoRegalo(null)} className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full hover:bg-black transition cursor-pointer"><X size={20}/></button>
              <div className="absolute -bottom-10 left-6 w-24 h-24 bg-zinc-800 rounded-full border-4 border-zinc-900 flex items-center justify-center text-3xl font-bold overflow-hidden">
                {amigoRegalo.avatar ? <img src={amigoRegalo.avatar} alt="" className="w-full h-full object-cover"/> : amigoRegalo.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="pt-12 px-6 pb-6 overflow-y-auto flex-1">
              <h2 className="text-2xl font-bold">@{amigoRegalo.username}</h2>
              <div className="mt-6">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-3">
                  <h3 className="font-bold flex items-center gap-2"><Heart className="text-red-500 fill-red-500" size={18}/> Wishlist del Amigo</h3>
                </div>
                <div className="space-y-2">
                  {!amigoRegalo.wishlist?.length ? <p className="text-xs text-zinc-500 py-4 text-center">Este usuario no tiene productos en su wishlist.</p> :
                    amigoRegalo.wishlist.map((prod, i) => {
                      const sel = productosSeleccionados.some(p => p.nombre === prod.nombre);
                      return (
                        <div key={i} onClick={() => sel ? setProductosSeleccionados(productosSeleccionados.filter(p => p.nombre !== prod.nombre)) : setProductosSeleccionados([...productosSeleccionados, prod])} className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition ${sel ? 'bg-red-950/20' : 'border-zinc-700 bg-zinc-800/40'}`} style={sel ? { borderColor: 'var(--color-primary)' } : {}}>
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
              <div className="text-sm">Total: <strong className="text-lg" style={{ color: 'var(--color-primary)' }}>{formatearCLP(productosSeleccionados.reduce((acc, p) => acc + (p.precio || 0), 0))}</strong></div>
              <button disabled={productosSeleccionados.length === 0} onClick={() => setModalCheckout(true)} className="disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-bold transition cursor-pointer" style={{ backgroundColor: 'var(--color-primary)' }}>Regalar</button>
            </div>
          </div>
        </div>
      )}

      {modalCheckout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 text-white animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-xl font-bold border-b border-zinc-800 pb-2 flex items-center gap-2">
              <CreditCard size={20} style={{ color: 'var(--color-primary)' }}/> Pago y Confirmación
            </h3>
            <p className="text-zinc-300 text-sm">Regalando {productosSeleccionados.length} producto(s) a <strong className="text-white">@{amigoRegalo?.username}</strong>.</p>
            
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2 max-h-32 overflow-y-auto">
              {productosSeleccionados.map((p, i) => (
                <div key={i} className="flex justify-between items-center text-xs border-b border-zinc-800/50 pb-1 last:border-0 last:pb-0">
                  <span className="truncate pr-2 font-medium">{p.nombre}</span>
                  <span className="text-red-400 font-bold whitespace-nowrap">{formatearCLP(p.precio)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-zinc-800 pt-3 space-y-4">
              <div>
                 <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">Tarjeta de Pago</label>
                 <select value={tarjetaSeleccionada} onChange={(e) => setTarjetaSeleccionada(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-xs text-white focus:outline-none cursor-pointer">
                    <option value="visa_4242">Visa terminada en **** 4242</option>
                    <option value="master_1234">MasterCard terminada en **** 1234</option>
                 </select>
              </div>
              <div>
                 <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">Código de Seguridad (CVV)</label>
                 <input type="password" maxLength="4" placeholder="Ej: 123" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 transition-colors" />
              </div>
            </div>

            <div className="flex justify-between items-center text-lg font-bold border-t border-zinc-800 pt-3">
              <span>Total a pagar:</span>
              <span style={{ color: 'var(--color-primary)' }}>{formatearCLP(productosSeleccionados.reduce((acc, p) => acc + (p.precio || 0), 0))}</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button disabled={procesandoPago} onClick={() => { setModalCheckout(false); setCvv(''); }} className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-2.5 rounded-lg font-bold text-sm cursor-pointer transition disabled:opacity-50">Cancelar</button>
              <button onClick={confirmarRegalo} disabled={procesandoPago || cvv.length < 3} className="flex-1 text-white py-2.5 rounded-lg font-bold text-sm cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--color-primary)' }}>
                {procesandoPago ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> Procesando...</> : 'Pagar y Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {mensajeExito && (
        <div className="fixed bottom-6 right-6 z-[100] bg-zinc-900 border border-zinc-700 text-white px-6 py-4 rounded-xl shadow-2xl font-bold flex items-center gap-3 animate-bounce">
          <CheckCircle size={20} style={{ color: 'var(--color-primary)' }}/> {mensajeExito}
        </div>
      )}
    </div>
  );
}