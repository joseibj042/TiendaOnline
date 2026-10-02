import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, LogOut, Package, MapPin, CreditCard, Search, Heart, Palette, Bell, MessageCircle, CheckSquare, Square, X, Send, Smile, CheckCircle2, Menu, Trash2, Award, Gift, Sparkles, Shield, Star, Check, CheckCheck } from 'lucide-react';
import { formatearCLP } from '../utils';

export default function Navbar({ setVistaActual, cantidadCarrito, setCategoriaFiltro, usuarioActivo, setUsuarioActivo, temaActual, setTemaActual, carrito = [], setCarrito }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuTemaOpen, setMenuTemaOpen] = useState(false);
  const [dropdownNotifOpen, setDropdownNotifOpen] = useState(false);
  const [dropdownWishlistOpen, setDropdownWishlistOpen] = useState(false);
  const [menuMovilOpen, setMenuMovilOpen] = useState(false);
  
  const [modalWishlistCompletaOpen, setModalWishlistCompletaOpen] = useState(false);
  const [productosSeleccionadosWishlist, setProductosSeleccionadosWishlist] = useState([]);
  
  const dropdownWishlistRef = useRef(null);
  const dropdownRef = useRef(null);
  const dropdownNotifRef = useRef(null);
  const panelAmigosRef = useRef(null);
  const menuTemaRef = useRef(null);
  const chatBottomRef = useRef(null);

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
  const [mensajeModalGlobal, setMensajeModalGlobal] = useState(null);

  const [modalAceptarRegaloOpen, setModalAceptarRegaloOpen] = useState(false);
  const [regaloAceptandoActual, setRegaloAceptandoActual] = useState(null);
  const [direccionSeleccionadaRegalo, setDireccionSeleccionadaRegalo] = useState('');

  const EMOJIS = ['😀','😂','🥰','😎','🔥','🎮','⌨️','🖱️','🎁','❤','👍','✨'];

  // 🔹 ESTADO REACTIVO DE SESIÓN (Sincronización instantánea sin recargar)
  const [sesionActual, setSesionActual] = useState(() => {
    return usuarioActivo || JSON.parse(localStorage.getItem('redragon_sesion_activa'));
  });

  useEffect(() => {
    if (usuarioActivo) {
      setSesionActual(usuarioActivo);
    } else {
      const stored = JSON.parse(localStorage.getItem('redragon_sesion_activa'));
      setSesionActual(stored);
    }
  }, [usuarioActivo]);

  // Escuchar cambios en localStorage o eventos personalizados en tiempo real
  useEffect(() => {
    const sincronizarSesion = () => {
      const stored = JSON.parse(localStorage.getItem('redragon_sesion_activa'));
      setSesionActual(stored);
      if (stored && setUsuarioActivo) {
        setUsuarioActivo(stored);
      }
    };

    window.addEventListener('storage', sincronizarSesion);
    window.addEventListener('sesionActualizada', sincronizarSesion);
    return () => {
      window.removeEventListener('storage', sincronizarSesion);
      window.removeEventListener('sesionActualizada', sincronizarSesion);
    };
  }, [setUsuarioActivo]);

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

  useEffect(() => {
    if (sesionActual) {
      const chatsGuardados = JSON.parse(localStorage.getItem('redragon_chats')) || {};
      setHistorialChats(chatsGuardados);

      let huboCambios = false;
      let amigosActualizados = (sesionActual.amigosWishlist || []).map(amigo => {
        if (!amigo.xpInicioCalculado) {
          huboCambios = true;
          const fechaReg = amigo.fecha ? new Date(amigo.fecha).getTime() : Date.now();
          const diasPasados = Math.max(1, Math.floor((Date.now() - fechaReg) / (1000 * 60 * 60 * 24)));
          return {
            ...amigo,
            fechaInicio: amigo.fechaInicio || fechaReg,
            xp: (amigo.xp || 0) + (diasPasados * 5),
            mensajesEnviados: amigo.mensajesEnviados || 0,
            regalosGastados: amigo.regalosGastados || 0,
            xpInicioCalculado: true
          };
        }
        return amigo;
      });

      let notifsActualizadas = [...(sesionActual.notificaciones || [])];
      let notifsInic = sesionActual.notificacionesInicializadas;

      if (!notifsInic) {
        huboCambios = true;
        notifsInic = true;
        if (!notifsActualizadas.some(n => n.tipo === 'bienvenida')) {
          notifsActualizadas.unshift({ id: 'welcome-1', tipo: 'bienvenida', titulo: '¡Bienvenido a Redragon Store! 🎉', mensaje: 'Explora nuestros productos gaming y personaliza tu perfil.', fecha: new Date().toLocaleDateString(), timestamp: Date.now(), estado: 'pendiente' });
        }
        if (!notifsActualizadas.some(n => n.codigo === 'ZIGZAG')) {
          notifsActualizadas.unshift({ id: 'zigzag-promo', tipo: 'promo', titulo: 'Colaboración Especial: ZigZag ⚡', mensaje: '¡Haz clic para copiar el código ZIGZAG! 25% de descuento + Envío Gratis.', codigo: 'ZIGZAG', descuento: 0.25, envioGratis: true, usado: false, fecha: new Date().toLocaleDateString(), timestamp: Date.now() + 1, estado: 'pendiente' });
        }
      }

      if (huboCambios) {
        actualizarUsuarioEnStorage({ ...sesionActual, amigosWishlist: amigosActualizados, notificaciones: notifsActualizadas, notificacionesInicializadas: notifsInic });
      }
    }
    if (chatActivo) chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sesionActual?.email, chatActivo]);

  // 🔹 Cierra todas las pestañas desplegables al hacer clic fuera de ellas
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (menuTemaRef.current && !menuTemaRef.current.contains(e.target)) setMenuTemaOpen(false);
      if (dropdownNotifRef.current && !dropdownNotifRef.current.contains(e.target)) setDropdownNotifOpen(false);
      if (panelAmigosRef.current && !panelAmigosRef.current.contains(e.target) && !chatActivo) setPanelAmigosOpen(false);
      if (dropdownWishlistRef.current && !dropdownWishlistRef.current.contains(e.target)) setDropdownWishlistOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [chatActivo]);

  const actualizarUsuarioEnStorage = (usuarioActualizado) => {
    if (setUsuarioActivo) setUsuarioActivo(usuarioActualizado);
    setSesionActual(usuarioActualizado);
    localStorage.setItem('redragon_sesion_activa', JSON.stringify(usuarioActualizado));
    const todos = JSON.parse(localStorage.getItem('redragon_usuarios')) || [];
    const index = todos.findIndex(u => u.email === usuarioActualizado.email);
    if (index !== -1) { 
      todos[index] = usuarioActualizado; 
      localStorage.setItem('redragon_usuarios', JSON.stringify(todos)); 
    }
    window.dispatchEvent(new Event('sesionActualizada'));
  };

  const actualizarUsuarioPorUsername = (username, callbackActualizar) => {
    const todos = JSON.parse(localStorage.getItem('redragon_usuarios')) || [];
    const index = todos.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (index !== -1) {
      const modificado = callbackActualizar(todos[index]);
      todos[index] = modificado;
      localStorage.setItem('redragon_usuarios', JSON.stringify(todos));
      if (modificado.email === sesionActual?.email) {
        if (setUsuarioActivo) setUsuarioActivo(modificado);
        setSesionActual(modificado);
        localStorage.setItem('redragon_sesion_activa', JSON.stringify(modificado));
        window.dispatchEvent(new Event('sesionActualizada'));
      }
    }
  };

  const irACategoria = (categoria) => { setCategoriaFiltro(categoria); setVistaActual('catalogo'); };

  const eliminarNotificacion = (idNotif, e) => {
    e.stopPropagation();
    const nuevasNotifs = (sesionActual.notificaciones || []).filter(n => n.id !== idNotif);
    actualizarUsuarioEnStorage({ ...sesionActual, notificaciones: nuevasNotifs });
  };

  const marcarTodasComoLeidas = () => {
    const nuevasNotifs = (sesionActual.notificaciones || []).map(n => ({ ...n, estado: 'leido' }));
    actualizarUsuarioEnStorage({ ...sesionActual, notificaciones: nuevasNotifs });
  };

  const formatearDirTexto = (dir) => {
    if (!dir) return 'Sin dirección';
    if (typeof dir === 'string') return dir;
    return `${dir.calle || ''}, ${dir.comuna || ''}, ${dir.region || ''}`.trim();
  };

  const iniciarAceptacionRegalo = (notif, e) => {
    e.stopPropagation();
    setRegaloAceptandoActual(notif);
    const primeraDirObj = sesionActual.direcciones?.[0];
    const primeraDir = formatearDirTexto(primeraDirObj);
    setDireccionSeleccionadaRegalo(primeraDir);
    setModalAceptarRegaloOpen(true);
  };

  const confirmarAceptarRegalo = (e) => {
    e.preventDefault();
    if (!regaloAceptandoActual) return;
    const notif = regaloAceptandoActual;
    
    const xpGanada = Math.floor((notif.total || 0) / 1000) * 10 + 50;

    let amigosReceptor = (sesionActual.amigosWishlist || []).map(amigo => {
      if (amigo.username.toLowerCase() === notif.emisor.toLowerCase()) {
        return { ...amigo, xp: (amigo.xp || 0) + xpGanada };
      }
      return amigo;
    });

    const nuevoPedido = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      email: sesionActual.email,
      fecha: new Date().toLocaleDateString(),
      productos: notif.productos || [],
      subtotal: notif.total || 0,
      descuento: 0,
      envio: 0,
      total: notif.total || 0,
      estado: 'Procesando',
      direccionEnvio: direccionSeleccionadaRegalo,
      esRegaloDe: notif.emisor
    };

    const pedidosActuales = sesionActual.pedidos || [];
    const nuevosPedidos = [nuevoPedido, ...pedidosActuales];

    const comprasGlobales = JSON.parse(localStorage.getItem('redragon_compras')) || [];
    localStorage.setItem('redragon_compras', JSON.stringify([nuevoPedido, ...comprasGlobales]));

    const notifsActualizadas = (sesionActual.notificaciones || []).filter(n => n.id !== notif.id);
    actualizarUsuarioEnStorage({ 
      ...sesionActual, 
      notificaciones: notifsActualizadas, 
      amigosWishlist: amigosReceptor, 
      pedidos: nuevosPedidos 
    });

    actualizarUsuarioPorUsername(notif.emisor, (emisorUser) => {
      const amigosEmisor = (emisorUser.amigosWishlist || []).map(a => {
        if (a.username.toLowerCase() === sesionActual.username.toLowerCase()) {
          return { ...a, xp: (a.xp || 0) + xpGanada };
        }
        return a;
      });
      return {
        ...emisorUser,
        amigosWishlist: amigosEmisor,
        notificaciones: [{ id: `NOTIF-${Date.now()}`, tipo: 'sistema', titulo: '🎁 ¡Regalo aceptado!', mensaje: `@${sesionActual.username} ha aceptado tu regalo. ¡Su nivel de amistad subió (+${xpGanada} XP)!`, fecha: new Date().toLocaleDateString(), timestamp: Date.now(), estado: 'pendiente' }, ...(emisorUser.notificaciones || [])]
      };
    });

    setModalAceptarRegaloOpen(false);
    setRegaloAceptandoActual(null);
    setVistaActual('orders');
    setMensajeModalGlobal(`¡Regalo aceptado con éxito! Se ha registrado como un pedido normal en tu historial y tu nivel de amistad aumentó (+${xpGanada} XP).`);
  };

  const rechazarRegaloNotif = (notif, e) => {
    e.stopPropagation();
    const notifsActualizadas = (sesionActual.notificaciones || []).filter(n => n.id !== notif.id);
    actualizarUsuarioEnStorage({ ...sesionActual, notificaciones: notifsActualizadas });

    actualizarUsuarioPorUsername(notif.emisor, (emisorUser) => ({
      ...emisorUser,
      notificaciones: [{ id: `NOTIF-${Date.now()}`, tipo: 'sistema', titulo: '❌ Regalo rechazado', mensaje: `@${sesionActual.username} ha rechazado el regalo enviado.`, fecha: new Date().toLocaleDateString(), timestamp: Date.now(), estado: 'pendiente' }, ...(emisorUser.notificaciones || [])]
    }));

    setMensajeModalGlobal(`Has rechazado el regalo de @${notif.emisor}.`);
  };

  const aceptarSolicitudAmistadNotif = (notif, e) => {
    e.stopPropagation();
    const amigoUsername = notif.emisor;

    const nuevosAmigos = [...(sesionActual.amigosWishlist || []), { username: amigoUsername, estado: 'aceptado', xp: 50, fecha: new Date().toLocaleDateString(), fechaInicio: Date.now() }];
    const notifsActualizadas = (sesionActual.notificaciones || []).filter(n => n.id !== notif.id);
    actualizarUsuarioEnStorage({ ...sesionActual, amigosWishlist: nuevosAmigos, notificaciones: notifsActualizadas });

    actualizarUsuarioPorUsername(amigoUsername, (otroUser) => {
      const amigosOtro = (otroUser.amigosWishlist || []).map(a => a.username.toLowerCase() === sesionActual.username.toLowerCase() ? { ...a, estado: 'aceptado' } : a);
      if (!amigosOtro.some(a => a.username.toLowerCase() === sesionActual.username.toLowerCase())) {
        amigosOtro.push({ username: sesionActual.username, estado: 'aceptado', xp: 50, fecha: new Date().toLocaleDateString(), fechaInicio: Date.now() });
      }
      return {
        ...otroUser,
        amigosWishlist: amigosOtro,
        notificaciones: [{ id: `NOTIF-${Date.now()}`, tipo: 'amigo_aceptado', titulo: '🤝 ¡Solicitud Aceptada!', mensaje: `@${sesionActual.username} ha aceptado tu solicitud de amistad.`, emisor: sesionActual.username, fecha: new Date().toLocaleDateString(), timestamp: Date.now(), estado: 'pendiente' }, ...(otroUser.notificaciones || [])]
      };
    });

    setMensajeModalGlobal(`¡Ahora eres amigo de @${amigoUsername}!`);
  };

  const rechazarSolicitudAmistadNotif = (notif, e) => {
    e.stopPropagation();
    const notifsActualizadas = (sesionActual.notificaciones || []).filter(n => n.id !== notif.id);
    actualizarUsuarioEnStorage({ ...sesionActual, notificaciones: notifsActualizadas });
    setMensajeModalGlobal('Has rechazado la solicitud de amistad.');
  };

  const handleClicNotificacion = (notif) => {
    const notifsActualizadas = (sesionActual.notificaciones || []).map(n => n.id === notif.id ? { ...n, estado: 'leido' } : n);
    actualizarUsuarioEnStorage({ ...sesionActual, notificaciones: notifsActualizadas });
    setDropdownNotifOpen(false);

    if (notif.tipo === 'promo' && notif.codigo) {
      navigator.clipboard.writeText(notif.codigo);
      setMensajeModalGlobal(`¡Código ${notif.codigo} copiado al portapapeles! Úsalo en el checkout.`);
    } else if (notif.tipo === 'pedido' || notif.tipo === 'pedido_entregado') { setVistaActual('orders');
    } else if (notif.tipo === 'amigo_aceptado') { abrirPerfilPublico(notif.emisor);
    } else if (notif.tipo === 'solicitud_amistad') { setVistaActual('profile'); }
  };

  const generarChatId = (user1, user2) => [user1.toLowerCase(), user2.toLowerCase()].sort().join('_');

  const calcularMensajesNoLeidosTotal = () => {
    if (!sesionActual || !sesionActual.amigosWishlist) return 0;
    const chats = JSON.parse(localStorage.getItem('redragon_chats')) || {};
    const chatsLeidos = sesionActual.chatsLeidos || {};
    
    let totalNoLeidos = 0;
    sesionActual.amigosWishlist.forEach(amigo => {
      if (amigo.estado === 'aceptado') {
        const chatId = generarChatId(sesionActual.username, amigo.username);
        const mensajes = chats[chatId] || [];
        const ultimoLeido = chatsLeidos[chatId] || 0;
        const noLeidosAmigo = mensajes.filter(m => m.emisor.toLowerCase() !== sesionActual.username.toLowerCase() && m.timestamp > ultimoLeido).length;
        totalNoLeidos += noLeidosAmigo;
      }
    });
    return totalNoLeidos;
  };

  const totalMensajesNoLeidos = calcularMensajesNoLeidosTotal();

  const abrirChatConAmigo = (amigoUsername) => {
    setChatActivo({ username: amigoUsername });
    const chatId = generarChatId(sesionActual.username, amigoUsername);
    const chats = JSON.parse(localStorage.getItem('redragon_chats')) || {};
    const mensajes = chats[chatId] || [];
    const ultimoTimestamp = mensajes.length > 0 ? Math.max(...mensajes.map(m => m.timestamp || 0)) : Date.now();
    
    const chatsLeidosActualizados = { ...(sesionActual.chatsLeidos || {}), [chatId]: ultimoTimestamp };
    actualizarUsuarioEnStorage({ ...sesionActual, chatsLeidos: chatsLeidosActualizados });
  };

  const enviarMensaje = (e) => {
    e.preventDefault();
    if (!mensajeChat.trim() || !chatActivo) return;
    const chatId = generarChatId(sesionActual.username, chatActivo.username);
    const timestampActual = new Date().getTime();
    const nuevoMsj = { emisor: sesionActual.username, texto: mensajeChat.trim(), timestamp: timestampActual };
    const chats = JSON.parse(localStorage.getItem('redragon_chats')) || {};
    chats[chatId] = [...(chats[chatId] || []), nuevoMsj];
    localStorage.setItem('redragon_chats', JSON.stringify(chats));
    setHistorialChats(chats);

    const chatsLeidosActualizados = { ...(sesionActual.chatsLeidos || {}), [chatId]: timestampActual };

    let amigosActualizados = (sesionActual.amigosWishlist || []).map(amigo => {
      if (amigo.username.toLowerCase() === chatActivo.username.toLowerCase()) {
        const msjsNuevos = (amigo.mensajesEnviados || 0) + 1;
        let xpExtra = 0;
        if (msjsNuevos % 5 === 0) xpExtra = 15;
        return {
          ...amigo,
          mensajesEnviados: msjsNuevos,
          xp: (amigo.xp || 0) + xpExtra
        };
      }
      return amigo;
    });
    actualizarUsuarioEnStorage({ ...sesionActual, amigosWishlist: amigosActualizados, chatsLeidos: chatsLeidosActualizados });

    setMensajeChat(''); setMostrarEmojis(false);
  };

  const abrirPerfilPublico = (usernameAmigo) => {
    const todos = JSON.parse(localStorage.getItem('redragon_usuarios')) || [];
    const amigo = todos.find(u => u.username.toLowerCase() === usernameAmigo.toLowerCase());
    if (amigo) { setAmigoSeleccionadoVer(amigo); setPanelAmigosOpen(false); setProductosSeleccionadosRegalo([]); }
  };

  const seleccionarTodoRegalo = () => { setProductosSeleccionadosRegalo(productosSeleccionadosRegalo.length === amigoSeleccionadoVer?.wishlist?.length ? [] : [...(amigoSeleccionadoVer.wishlist || [])]); };
  const totalRegalo = productosSeleccionadosRegalo.reduce((acc, p) => acc + (p.precio || 0), 0);

  const confirmarCompraRegalos = (e) => {
    e.preventDefault();
    if (!tarjetaSeleccionadaRegalo) { 
      setMensajeModalGlobal('Selecciona una tarjeta para proceder con el regalo.'); 
      return; 
    }
    if (!cvvRegalo || cvvRegalo.trim().length < 3) {
      setMensajeModalGlobal('Ingresa el CVV (3 dígitos) de tu tarjeta para confirmar el pago.');
      return;
    }
    setProcesandoPago(true);
    setTimeout(() => {
      const idRegalo = `GIFT-${Date.now()}`;
      
      let amigosActualizados = (sesionActual.amigosWishlist || []).map(amigo => {
        if (amigo.username.toLowerCase() === amigoSeleccionadoVer.username.toLowerCase()) {
          return {
            ...amigo,
            regalosGastados: (amigo.regalosGastados || 0) + totalRegalo
          };
        }
        return amigo;
      });
      actualizarUsuarioEnStorage({ ...sesionActual, amigosWishlist: amigosActualizados });

      actualizarUsuarioPorUsername(amigoSeleccionadoVer.username, (amigoUser) => ({
        ...amigoUser, notificaciones: [{ id: idRegalo, tipo: 'regalo_recibido', emisor: sesionActual.username, titulo: '🎁 ¡Tienes un regalo pendiente!', mensaje: `@${sesionActual.username} quiere regalarte ${productosSeleccionadosRegalo.length} producto(s).`, productos: productosSeleccionadosRegalo, total: totalRegalo, fecha: new Date().toLocaleDateString(), timestamp: Date.now(), estado: 'pendiente' }, ...(amigoUser.notificaciones || [])]
      }));

      setProcesandoPago(false); setModalCheckoutRegalo(false); setAmigoSeleccionadoVer(null); setProductosSeleccionadosRegalo([]); setCvvRegalo('');
      setMensajeModalGlobal(`¡Regalo enviado con éxito! Los puntos y la experiencia se sumarán cuando @${amigoSeleccionadoVer.username} acepte el regalo.`);
    }, 2500);
  };

  const eliminarDeWishlistCompleta = (prodId) => {
    const nuevaWishlist = (sesionActual.wishlist || []).filter(item => (item.id || item.nombre) !== (prodId.id || prodId.nombre));
    const usuarioActualizado = { ...sesionActual, wishlist: nuevaWishlist };
    actualizarUsuarioEnStorage(usuarioActualizado);
    setProductosSeleccionadosWishlist(productosSeleccionadosWishlist.filter(item => (item.id || item.nombre) !== (prodId.id || prodId.nombre)));
  };

  const toggleSeleccionWishlistProd = (prod) => {
    const existe = productosSeleccionadosWishlist.some(p => (p.id || p.nombre) === (prod.id || prod.nombre));
    if (existe) {
      setProductosSeleccionadosWishlist(productosSeleccionadosWishlist.filter(p => (p.id || p.nombre) !== (prod.id || prod.nombre)));
    } else {
      setProductosSeleccionadosWishlist([...productosSeleccionadosWishlist, prod]);
    }
  };

  const seleccionarTodoWishlist = () => {
    const wishlistActual = sesionActual?.wishlist || [];
    if (productosSeleccionadosWishlist.length === wishlistActual.length) {
      setProductosSeleccionadosWishlist([]);
    } else {
      setProductosSeleccionadosWishlist([...wishlistActual]);
    }
  };

  const agregarWishlistSeleccionadosAlCarrito = () => {
    if (productosSeleccionadosWishlist.length === 0) {
      setMensajeModalGlobal('Selecciona al menos un producto de tu lista de deseos.');
      return;
    }
    const carritoActual = carrito.length > 0 ? carrito : (JSON.parse(localStorage.getItem('redragon_carrito')) || []);
    let nuevoCarrito = [...carritoActual];

    productosSeleccionadosWishlist.forEach(prod => {
      const index = nuevoCarrito.findIndex(item => (item.id || item.nombre) === (prod.id || prod.nombre));
      if (index !== -1) {
        nuevoCarrito[index] = { ...nuevoCarrito[index], cantidad: (nuevoCarrito[index].cantidad || 1) + 1 };
      } else {
        nuevoCarrito.push({ ...prod, cantidad: 1 });
      }
    });

    localStorage.setItem('redragon_carrito', JSON.stringify(nuevoCarrito));
    if (typeof setCarrito === 'function') {
      setCarrito(nuevoCarrito);
    }

    setProductosSeleccionadosWishlist([]);
    setModalWishlistCompletaOpen(false);
    setMensajeModalGlobal(`¡${productosSeleccionadosWishlist.length} producto(s) añadidos al carrito con éxito!`);
  };

  const cantidadWishlist = sesionActual?.wishlist?.length || 0;
  const notificaciones = [...(sesionActual?.notificaciones || [])].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  const pendientesCount = notificaciones.filter(n => n.estado === 'pendiente').length;
  const amigosAceptados = (sesionActual?.amigosWishlist || []).filter(a => a.estado === 'aceptado');

  // 🔹 Estilos dinámicos para cambiar el color del Navbar según el tema global
  const estilosNavbar = { 
    red: "bg-red-700 border-red-900", 
    purple: "bg-purple-800 border-purple-950", 
    green: "bg-emerald-700 border-emerald-950" 
  };

  return (
    <nav className={`${estilosNavbar[temaActual] || estilosNavbar.red} text-white p-4 sticky top-0 z-50 shadow-xl border-b transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="cursor-pointer flex-shrink-0" onClick={() => setVistaActual('home')}><img src="/images/logo.png" alt="Logo" className="h-10 w-auto object-contain" /></div>

        <div className="hidden lg:flex items-center gap-4 font-bold text-sm uppercase tracking-wider">
          <button onClick={() => irACategoria('teclados')} className="hover:opacity-80 transition cursor-pointer">Teclados</button>
          <button onClick={() => irACategoria('mouses')} className="hover:opacity-80 transition cursor-pointer">Mouses</button>
          <button onClick={() => irACategoria('mousepads')} className="hover:opacity-80 transition cursor-pointer">Mousepads</button>
          <button onClick={() => irACategoria('audifonos')} className="hover:opacity-80 transition cursor-pointer">Audífonos</button>
          <button onClick={() => irACategoria('combos')} className="hover:opacity-80 transition cursor-pointer">Combos</button>
          
          <button onClick={() => setVistaActual('track-order')} className="hover:opacity-80 transition cursor-pointer flex items-center gap-1.5">
            <Search size={16} /> Estado Pedido
          </button>
          <button onClick={() => setVistaActual('customizer')} className="bg-white text-zinc-900 px-3 py-1 rounded-full animate-pulse cursor-pointer">CUSTOM</button>
        </div>

        <div className="flex items-center gap-2 relative">
          <div className="lg:hidden flex items-center">
            <button onClick={() => setMenuMovilOpen(!menuMovilOpen)} className="p-2 bg-black/40 rounded-lg text-white border border-white/25 cursor-pointer">
              {menuMovilOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* 🔹 Menú de Temas Integrado */}
          <div className="relative" ref={menuTemaRef}>
            <button onClick={() => setMenuTemaOpen(!menuTemaOpen)} className="p-2 bg-black/40 rounded-lg cursor-pointer border border-white/25 hover:bg-black/60 transition"><Palette size={18} /></button>
            {menuTemaOpen && (
               <div className="absolute top-12 left-0 w-40 bg-zinc-900 rounded-lg shadow-2xl py-2 z-50 text-white text-xs border border-zinc-700 animate-fade-in">
                 <button onClick={() => { setTemaActual('red'); setMenuTemaOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-zinc-800 cursor-pointer">🔴 Rojo Clásico</button>
                 <button onClick={() => { setTemaActual('purple'); setMenuTemaOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-zinc-800 cursor-pointer">🟣 Cyberpunk</button>
                 <button onClick={() => { setTemaActual('green'); setMenuTemaOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-zinc-800 cursor-pointer">🟢 Esmeralda</button>
               </div>
            )}
          </div>

          {sesionActual ? (
            <div className="flex items-center gap-2">
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg font-bold text-sm border border-white/25 cursor-pointer hover:bg-black/60 transition">
                  <div className="w-6 h-6 bg-white text-zinc-900 rounded-full flex items-center justify-center overflow-hidden">
                    {sesionActual.avatar ? <img src={sesionActual.avatar} alt="" className="w-full h-full object-cover"/> : sesionActual.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">@{sesionActual.username}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-2 z-50 text-white animate-fade-in">
                    <button onClick={() => { setVistaActual('profile'); setDropdownOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-zinc-800 flex gap-2 cursor-pointer items-center"><User size={16} style={{ color: 'var(--color-primary)' }} /> Perfil</button>
                    <button onClick={() => { localStorage.removeItem('redragon_sesion_activa'); if(setUsuarioActivo) setUsuarioActivo(null); setVistaActual('home'); }} className="w-full text-left px-4 py-2 hover:bg-red-950/50 text-red-400 border-t border-zinc-800 mt-1 flex gap-2 cursor-pointer items-center"><LogOut size={16} /> Salir</button>
                  </div>
                )}
              </div>

              <div className="relative" ref={panelAmigosRef}>
                <button onClick={() => { setPanelAmigosOpen(!panelAmigosOpen); setChatActivo(null); }} className="p-2 bg-black/40 rounded-lg cursor-pointer border border-white/25 relative hover:bg-black/60 transition">
                  <MessageCircle size={20} />
                  {totalMensajesNoLeidos > 0 && (
                    <span className="absolute -top-1 -right-1 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse" style={{ backgroundColor: 'var(--color-primary)' }}>
                      {totalMensajesNoLeidos}
                    </span>
                  )}
                </button>
                {panelAmigosOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 flex flex-col h-[480px] overflow-hidden text-white animate-fade-in">
                    {!chatActivo ? (
                      <>
                        <div className="p-3 border-b border-zinc-800 bg-zinc-950 font-bold flex justify-between items-center">
                          <span className="flex items-center gap-2"><MessageCircle size={16} style={{ color: 'var(--color-primary)' }}/> Mis Amigos y Chats ({amigosAceptados.length})</span>
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
                              const ultimoLeidoAmigo = (sesionActual.chatsLeidos || {})[chatId] || 0;
                              const noLeidosAmigo = mensajesAmigo.filter(m => m.emisor.toLowerCase() !== sesionActual.username.toLowerCase() && m.timestamp > ultimoLeidoAmigo).length;
                              
                              return (
                                <div key={i} className="bg-zinc-800/60 border border-zinc-700/60 p-3 rounded-xl flex flex-col gap-2.5 transition hover:border-zinc-500">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => abrirPerfilPublico(amigo.username)}>
                                      <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden border border-zinc-600 flex items-center justify-center font-bold text-white shrink-0 relative">
                                        {infoAmigo.avatar ? <img src={infoAmigo.avatar} alt="" className="w-full h-full object-cover"/> : amigo.username.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-sm text-white hover:underline">@{amigo.username}</span>
                                          {noLeidosAmigo > 0 && (
                                            <span className="text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-bounce" style={{ backgroundColor: 'var(--color-primary)' }}>
                                              {noLeidosAmigo} nuevo{noLeidosAmigo > 1 ? 's' : ''}
                                            </span>
                                          )}
                                        </div>
                                        <p className={`text-[10px] font-bold ${nivelInfo.color}`}>{nivelInfo.titulo}</p>
                                      </div>
                                    </div>
                                    <button onClick={() => abrirChatConAmigo(amigo.username)} className="text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer relative" style={{ backgroundColor: 'var(--color-primary)' }}>
                                      <MessageCircle size={12} /> Chat
                                      {noLeidosAmigo > 0 && <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{noLeidosAmigo}</span>}
                                    </button>
                                  </div>

                                  <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800 space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-zinc-400">Nivel de Amistad <strong className="text-white">Nv. {nivelInfo.nivel}</strong></span>
                                      <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{amigo.xp || 0} XP</span>
                                    </div>
                                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                      <div className="h-full transition-all duration-500" style={{ backgroundColor: 'var(--color-primary)', width: `${Math.min(100, ((amigo.xp || 0) / nivelInfo.next) * 100)}%` }}></div>
                                    </div>
                                    <div className="flex justify-between items-center pt-1 text-[9px] text-zinc-400">
                                      <span>🎁 Recompensa: <strong className="text-zinc-200">{nivelInfo.recompensa}</strong></span>
                                      <button onClick={() => setAmigoRecompensasVer(amigo)} className="hover:underline font-bold cursor-pointer flex items-center gap-0.5" style={{ color: 'var(--color-primary)' }}>
                                        <Award size={10} /> Ver Logros
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 pt-1 border-t border-zinc-700/55 text-xs">
                                    <button onClick={() => abrirPerfilPublico(amigo.username)} className="w-full py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded font-bold transition cursor-pointer flex items-center justify-center gap-1.5">
                                      <Heart size={13} className="text-red-400 fill-red-400"/> Ver Wishlist y Regalos
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </>
                    ) : (
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
                            <div className="absolute bottom-12 left-2 bg-zinc-800 p-2 rounded-lg border border-zinc-700 grid grid-cols-4 gap-2 text-xl z-10 shadow-xl animate-fade-in">
                              {EMOJIS.map(e => <span key={e} className="cursor-pointer hover:scale-125 transition" onClick={() => { setMensajeChat(mensajeChat + e); setMostrarEmojis(false); }}>{e}</span>)}
                            </div>
                          )}
                          <input type="text" value={mensajeChat} onChange={e => setMensajeChat(e.target.value)} placeholder="Escribe un mensaje..." className="flex-1 bg-zinc-800 rounded px-3 py-1.5 text-xs text-white border border-zinc-700 focus:outline-none" style={{ focusBorderColor: 'var(--color-primary)' }} />
                          <button type="submit" className="hover:opacity-80 cursor-pointer" style={{ color: 'var(--color-primary)' }}><Send size={18}/></button>
                        </form>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="relative" ref={dropdownNotifRef}>
                <button onClick={() => setDropdownNotifOpen(!dropdownNotifOpen)} className="p-2 bg-black/40 rounded-lg cursor-pointer relative border border-white/25 hover:bg-black/60 transition">
                  <Bell size={20} />
                  {pendientesCount > 0 && <span className="absolute -top-1 -right-1 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse" style={{ backgroundColor: 'var(--color-primary)' }}>{pendientesCount}</span>}
                </button>
                {dropdownNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 text-white flex flex-col max-h-[450px] animate-fade-in">
                    <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center">
                      <span className="font-bold text-sm">Notificaciones ({notificaciones.length})</span>
                      <div className="flex items-center gap-3">
                        <button onClick={marcarTodasComoLeidas} className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer">
                          <CheckCheck size={14}/> Marcar leídas
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto divide-y divide-zinc-800 text-xs flex-1">
                      {notificaciones.length === 0 ? <p className="text-zinc-400 text-center py-8">No hay notificaciones.</p> :
                        notificaciones.map((notif, idx) => (
                          <div key={notif.id || idx} onClick={() => handleClicNotificacion(notif)} className={`p-3 cursor-pointer hover:bg-zinc-800/80 transition relative group ${notif.estado === 'pendiente' ? 'border-l-4 bg-red-950/15' : ''}`} style={notif.estado === 'pendiente' ? { borderColor: 'var(--color-primary)' } : {}}>
                            <div className="flex justify-between font-bold mb-1 items-center">
                              <span className="flex items-center gap-1 text-white">{notif.titulo}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-zinc-500">{notif.fecha}</span>
                                <button onClick={(e) => eliminarNotificacion(notif.id, e)} className="text-zinc-500 hover:text-red-400 p-0.5 rounded cursor-pointer" title="Eliminar notificación">
                                  <X size={14}/>
                                </button>
                              </div>
                            </div>
                            <p className="text-zinc-300 pr-4">{notif.mensaje}</p>

                            {notif.tipo === 'regalo_recibido' && notif.estado === 'pendiente' && (
                              <div className="mt-3 pt-2 border-t border-zinc-800 flex gap-2">
                                <button onClick={(e) => iniciarAceptacionRegalo(notif, e)} className="flex-1 text-white py-1.5 rounded font-bold text-center cursor-pointer transition" style={{ backgroundColor: 'var(--color-primary)' }}>
                                  Aceptar Regalo
                                </button>
                                <button onClick={(e) => rechazarRegaloNotif(notif, e)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-1.5 rounded font-bold text-center cursor-pointer transition">
                                  Rechazar
                                </button>
                              </div>
                            )}

                            {notif.tipo === 'solicitud_amistad' && notif.estado === 'pendiente' && (
                              <div className="mt-3 pt-2 border-t border-zinc-800 flex gap-2">
                                <button onClick={(e) => aceptarSolicitudAmistadNotif(notif, e)} className="flex-1 text-white py-1.5 rounded font-bold text-center cursor-pointer transition" style={{ backgroundColor: 'var(--color-primary)' }}>
                                  Aceptar Solicitud
                                </button>
                                <button onClick={(e) => rechazarSolicitudAmistadNotif(notif, e)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-1.5 rounded font-bold text-center cursor-pointer transition">
                                  Rechazar
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative" ref={dropdownWishlistRef}>
                <button 
                  onClick={() => { setDropdownWishlistOpen(!dropdownWishlistOpen); }} 
                  className="flex items-center gap-1.5 bg-black/40 hover:bg-black/60 px-3 py-2 rounded-lg transition text-xs font-bold border border-white/25 cursor-pointer relative"
                >
                  <Heart size={18} className="text-red-400 fill-red-400" /><span className="hidden sm:inline">({cantidadWishlist})</span>
                </button>

                {dropdownWishlistOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 z-50 text-white text-xs animate-fade-in">
                    <div className="px-4 py-3 border-b border-zinc-800 font-bold flex justify-between items-center bg-zinc-950">
                      <span className="flex items-center gap-2"><Heart size={14} className="text-red-500 fill-red-500"/> Tus Favoritos</span><span className="text-[10px] text-zinc-400">{cantidadWishlist} total</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-zinc-800">
                      {(!sesionActual.wishlist || sesionActual.wishlist.length === 0) ? <p className="text-zinc-400 text-center py-6">Tu lista está vacía.</p> : (
                        sesionActual.wishlist.map((prod, idx) => (
                          <div key={idx} className="p-3 hover:bg-zinc-800/60 transition flex items-center gap-3 cursor-pointer">
                            <img src={prod.imagen} alt="" className="w-10 h-10 object-contain bg-black/40 p-1 rounded border border-zinc-700" />
                            <div className="flex-1"><p className="font-bold text-white truncate max-w-[150px]">{prod.nombre}</p><p className="font-bold mt-0.5" style={{ color: 'var(--color-primary)' }}>{formatearCLP(prod.precio)}</p></div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t border-zinc-800">
                      <button 
                        onClick={() => { setDropdownWishlistOpen(false); setModalWishlistCompletaOpen(true); }} 
                        className="w-full py-2 rounded-lg text-white font-bold cursor-pointer transition shadow"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      >
                        Ir a Wishlist Completa
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
             <button onClick={() => setVistaActual('login')} className="bg-black/40 px-3 py-2 rounded text-white font-bold text-sm cursor-pointer hover:bg-black/60 transition">Ingresar</button>
          )}

          <button className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded hover:bg-zinc-800 transition shadow-lg border border-zinc-700 font-bold cursor-pointer" onClick={() => setVistaActual('cart')}>
            <ShoppingCart size={20} /> ({cantidadCarrito})
          </button>
        </div>
      </div>

      {modalAceptarRegaloOpen && regaloAceptandoActual && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 text-white animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--color-primary)' }}><MapPin size={20}/> Selecciona tu Dirección Guardada</h3>
              <button onClick={() => setModalAceptarRegaloOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer"><X size={20}/></button>
            </div>
            
            <p className="text-xs text-zinc-300">Estás aceptando un regalo de <strong className="text-white">@{regaloAceptandoActual.emisor}</strong> con {regaloAceptandoActual.productos?.length || 0} producto(s). Elige una de tus direcciones guardadas para el envío:</p>
            
            <form onSubmit={confirmarAceptarRegalo} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-zinc-400 font-semibold">Direcciones Registradas:</label>
                {(!sesionActual.direcciones || sesionActual.direcciones.length === 0) ? (
                  <p className="text-xs text-red-400 bg-red-950/30 p-3 rounded-lg border border-red-900/50">No tienes direcciones guardadas en tu perfil. Por favor agrega una en la sección de Direcciones antes de aceptar tu regalo.</p>
                ) : (
                  <select 
                    value={direccionSeleccionadaRegalo} 
                    onChange={(e) => setDireccionSeleccionadaRegalo(e.target.value)} 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-xs text-white focus:outline-none" 
                    required 
                  >
                    {sesionActual.direcciones.map((dir, i) => {
                      const dirTexto = formatearDirTexto(dir);
                      return <option key={i} value={dirTexto}>{dirTexto} {dir.comuna ? `(${dir.comuna})` : ''}</option>;
                    })}
                  </select>
                )}
              </div>

              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-xs space-y-1">
                <p className="text-zinc-400">Total del regalo: <strong style={{ color: 'var(--color-primary)' }}>{formatearCLP(regaloAceptandoActual.total)}</strong></p>
                <p className="text-zinc-400">Al aceptar se creará un pedido normal y <strong className="text-green-400">se sumará la XP de amistad</strong>.</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModalAceptarRegaloOpen(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-2.5 rounded-lg font-bold text-xs cursor-pointer">Cancelar</button>
                <button type="submit" disabled={!sesionActual.direcciones || sesionActual.direcciones.length === 0} className="flex-1 disabled:opacity-50 text-white py-2.5 rounded-lg font-bold text-xs cursor-pointer transition" style={{ backgroundColor: 'var(--color-primary)' }}>Aceptar y Ver Pedidos</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {amigoRecompensasVer && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 text-white animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2 text-yellow-400"><Award size={22}/> Logros y Recompensas con @{amigoRecompensasVer.username}</h3>
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
                <p className="font-semibold text-zinc-300 uppercase tracking-wider text-[10px]">Tabla de Convenios y Recompensas Exclusivas:</p>
                <div className={`p-2.5 rounded-lg border ${ (amigoRecompensasVer.xp || 0) >= 100 ? 'bg-green-950/30 border-green-500/40 text-green-300' : 'bg-zinc-800/30 border-zinc-700 text-zinc-500'}`}>
                  <p className="font-bold">Nivel 2 (100 XP): Cupón 10% Descuento</p>
                  <p className="text-[10px] mt-0.5">Código: <span className="font-mono font-bold">AMIGO10</span></p>
                </div>
                <div className={`p-2.5 rounded-lg border ${ (amigoRecompensasVer.xp || 0) >= 300 ? 'bg-green-950/30 border-green-500/40 text-green-300' : 'bg-zinc-800/30 border-zinc-700 text-zinc-500'}`}>
                  <p className="font-bold">Nivel 3 (300 XP): Envío Gratis en la tienda</p>
                  <p className="text-[10px] mt-0.5">Código: <span className="font-mono font-bold">AMIGOFREE</span></p>
                </div>
                <div className={`p-2.5 rounded-lg border ${ (amigoRecompensasVer.xp || 0) >= 600 ? 'bg-green-950/30 border-green-500/40 text-green-300' : 'bg-zinc-800/30 border-zinc-700 text-zinc-500'}`}>
                  <p className="font-bold">Nivel 4 (600 XP): Cupón 20% Descuento</p>
                  <p className="text-[10px] mt-0.5">Código: <span className="font-mono font-bold">AMIGO20</span></p>
                </div>
                <div className={`p-2.5 rounded-lg border ${ (amigoRecompensasVer.xp || 0) >= 1000 ? 'bg-yellow-950/30 border-yellow-500/40 text-yellow-300' : 'bg-zinc-800/30 border-zinc-700 text-zinc-500'}`}>
                  <p className="font-bold">Nivel 5 (1,000 XP): Giftcard de $5.000 CLP</p>
                  <p className="text-[10px] mt-0.5">Código: <span className="font-mono font-bold">GIFTCARD5K</span></p>
                </div>
                <div className={`p-2.5 rounded-lg border ${ (amigoRecompensasVer.xp || 0) >= 2000 ? 'bg-yellow-950/30 border-yellow-500/40 text-yellow-300' : 'bg-zinc-800/30 border-zinc-700 text-zinc-500'}`}>
                  <p className="font-bold">Nivel 6 (2,000 XP): Cupón Especial 30% Descuento</p>
                  <p className="text-[10px] mt-0.5">Código: <span className="font-mono font-bold">MAESTRO30</span></p>
                </div>
                <div className={`p-2.5 rounded-lg border ${ (amigoRecompensasVer.xp || 0) >= 3500 ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-300' : 'bg-zinc-800/30 border-zinc-700 text-zinc-500'}`}>
                  <p className="font-bold">Nivel 7 (3,500 XP) 🏆: Giftcard de $15.000 CLP</p>
                  <p className="text-[10px] mt-0.5">Código: <span className="font-mono font-bold">TITAN15K</span></p>
                </div>
                <div className={`p-2.5 rounded-lg border ${ (amigoRecompensasVer.xp || 0) >= 5000 ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 shadow-lg' : 'bg-zinc-800/30 border-zinc-700 text-zinc-500'}`}>
                  <p className="font-bold">Nivel 8 (5,000 XP) ⚡👑: Giftcard de $30.000 CLP + Acceso VIP</p>
                  <p className="text-[10px] mt-0.5">Código: <span className="font-mono font-bold">OLIMPO30K</span></p>
                </div>
              </div>
            </div>

            <button onClick={() => setAmigoRecompensasVer(null)} className="w-full py-2.5 rounded-xl font-bold text-xs cursor-pointer transition text-white" style={{ backgroundColor: 'var(--color-primary)' }}>Cerrar</button>
          </div>
        </div>
      )}

      {modalWishlistCompletaOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 text-white animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Heart className="text-red-500 fill-red-500" size={20} /> Tu Lista de Deseos (Wishlist Completa)
              </h3>
              <button onClick={() => setModalWishlistCompletaOpen(false)} className="text-zinc-400 hover:text-white transition cursor-pointer">
                <X size={22} />
              </button>
            </div>

            {sesionActual?.wishlist && sesionActual.wishlist.length > 0 && (
              <div className="bg-zinc-900 px-6 py-2.5 border-b border-zinc-800 flex justify-between items-center text-xs">
                <button onClick={seleccionarTodoWishlist} className="hover:underline font-bold flex items-center gap-1.5 cursor-pointer" style={{ color: 'var(--color-primary)' }}>
                  {productosSeleccionadosWishlist.length === sesionActual.wishlist.length ? <CheckSquare size={16}/> : <Square size={16}/>}
                  {productosSeleccionadosWishlist.length === sesionActual.wishlist.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                </button>
                <span className="text-zinc-400 font-medium">Seleccionados: <strong className="text-white">{productosSeleccionadosWishlist.length}</strong></span>
              </div>
            )}

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {(!sesionActual?.wishlist || sesionActual.wishlist.length === 0) ? (
                <div className="text-center py-16 text-zinc-400 space-y-3">
                  <Heart size={48} className="mx-auto text-zinc-600 stroke-1" />
                  <p className="text-lg font-semibold">Tu lista de deseos está vacía.</p>
                  <p className="text-xs text-zinc-500">Explora la tienda y añade productos haciendo clic en el icono de corazón.</p>
                </div>
              ) : (
                sesionActual.wishlist.map((prod, idx) => {
                  const seleccionado = productosSeleccionadosWishlist.some(p => (p.id || p.nombre) === (prod.id || prod.nombre));
                  return (
                    <div 
                      key={idx} 
                      onClick={() => toggleSeleccionWishlistProd(prod)}
                      className={`p-4 rounded-xl flex items-center justify-between gap-4 shadow-md border cursor-pointer transition ${seleccionado ? 'bg-red-950/25' : 'bg-zinc-800/40 border-zinc-700/70 hover:border-zinc-500'}`}
                      style={seleccionado ? { borderColor: 'var(--color-primary)' } : {}}
                    >
                      <div className="flex items-center gap-4">
                        <button type="button" className="focus:outline-none" style={{ color: 'var(--color-primary)' }}>
                          {seleccionado ? <CheckSquare size={20} /> : <Square size={20} className="text-zinc-500" />}
                        </button>
                        <div className="w-16 h-16 bg-black/40 rounded-lg p-2 flex items-center justify-center border border-zinc-700 shrink-0">
                          <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-white">{prod.nombre}</h4>
                          <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded uppercase font-semibold">{prod.tipo}</span>
                          <p className="font-bold text-base mt-1" style={{ color: 'var(--color-primary)' }}>{formatearCLP(prod.precio)}</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); eliminarDeWishlistCompleta(prod); }}
                        className="p-2.5 bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 rounded-lg transition border border-zinc-700 cursor-pointer"
                        title="Quitar de favoritos"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-between items-center">
              <span className="text-xs text-zinc-400 font-medium">Total de artículos: <strong className="text-white">{cantidadWishlist}</strong></span>
              <div className="flex gap-2">
                {productosSeleccionadosWishlist.length > 0 && (
                  <button 
                    onClick={agregarWishlistSeleccionadosAlCarrito}
                    className="bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow cursor-pointer flex items-center gap-2"
                  >
                    <ShoppingCart size={16} /> Agregar al Carrito ({productosSeleccionadosWishlist.length})
                  </button>
                )}
                <button 
                  onClick={() => setModalWishlistCompletaOpen(false)}
                  className="text-white px-6 py-2.5 rounded-xl font-bold text-sm transition shadow cursor-pointer"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {menuMovilOpen && (
        <div className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 p-4 flex flex-col gap-4 font-bold text-sm uppercase tracking-wider animate-fade-in absolute w-full left-0 top-[73px] z-40 shadow-2xl">
          <button onClick={() => { irACategoria('teclados'); setMenuMovilOpen(false); }} className="text-left text-white hover:opacity-80 py-2 border-b border-zinc-800">Teclados</button>
          <button onClick={() => { irACategoria('mouses'); setMenuMovilOpen(false); }} className="text-left text-white hover:opacity-80 py-2 border-b border-zinc-800">Mouses</button>
          <button onClick={() => { irACategoria('mousepads'); setMenuMovilOpen(false); }} className="text-left text-white hover:opacity-80 py-2 border-b border-zinc-800">Mousepads</button>
          <button onClick={() => { irACategoria('audifonos'); setMenuMovilOpen(false); }} className="text-left text-white hover:opacity-80 py-2 border-b border-zinc-800">Audífonos</button>
          <button onClick={() => { irACategoria('combos'); setMenuMovilOpen(false); }} className="text-left text-white hover:opacity-80 py-2 border-b border-zinc-800">Combos</button>
          <div className="border-t border-zinc-700/50 mt-2 pt-4 flex flex-col gap-4">
            <button onClick={() => { setVistaActual('track-order'); setMenuMovilOpen(false); }} className="text-left flex items-center gap-2 text-zinc-300 hover:opacity-80"><Search size={16} /> Estado Pedido</button>
            <button onClick={() => { setVistaActual('customizer'); setMenuMovilOpen(false); }} className="text-left animate-pulse w-fit px-3 py-1.5 rounded-full border border-white/20" style={{ color: 'var(--color-primary)' }}>CUSTOM (TALLER)</button>
          </div>
        </div>
      )}

      {amigoSeleccionadoVer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-white animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="h-32 bg-cover bg-center relative border-b border-zinc-700" style={{ backgroundImage: amigoSeleccionadoVer.banner ? `url(${amigoSeleccionadoVer.banner})` : 'url(/images/banner-default.jpg)' }}>
              <button onClick={() => setAmigoSeleccionadoVer(null)} className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full hover:bg-black transition cursor-pointer"><X size={20}/></button>
              <div className="absolute -bottom-10 left-6 w-24 h-24 bg-zinc-800 rounded-full border-4 border-zinc-900 flex items-center justify-center text-3xl font-bold overflow-hidden">
                {amigoSeleccionadoVer.avatar ? <img src={amigoSeleccionadoVer.avatar} alt="" className="w-full h-full object-cover"/> : amigoSeleccionadoVer.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="pt-12 px-6 pb-6 overflow-y-auto flex-1">
              <h2 className="text-2xl font-bold">@{amigoSeleccionadoVer.username}</h2>
              <p className="text-sm text-zinc-400 mt-1 italic">"{amigoSeleccionadoVer.bio || 'Sin biografía.'}"</p>
              <div className="mt-6">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-3">
                  <h3 className="font-bold flex items-center gap-2"><Heart className="text-red-500 fill-red-500" size={18}/> Wishlist de @{amigoSeleccionadoVer.username} (Selecciona para enviar regalo)</h3>
                  <button onClick={seleccionarTodoRegalo} className="text-xs hover:underline font-bold cursor-pointer" style={{ color: 'var(--color-primary)' }}>
                    {productosSeleccionadosRegalo.length === (amigoSeleccionadoVer.wishlist?.length || 0) && productosSeleccionadosRegalo.length > 0 ? 'Deseleccionar todo' : 'Seleccionar todo'}
                  </button>
                </div>
                <div className="space-y-2">
                  {!amigoSeleccionadoVer.wishlist?.length ? <p className="text-xs text-zinc-500 py-4 text-center">Este usuario no tiene productos en su wishlist.</p> :
                    amigoSeleccionadoVer.wishlist.map((prod, i) => {
                      const sel = productosSeleccionadosRegalo.some(p => p.nombre === prod.nombre);
                      return (
                        <div key={i} onClick={() => { sel ? setProductosSeleccionadosRegalo(productosSeleccionadosRegalo.filter(p => p.nombre !== prod.nombre)) : setProductosSeleccionadosRegalo([...productosSeleccionadosRegalo, prod]) }} className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition ${sel ? 'bg-red-950/20' : 'border-zinc-700 bg-zinc-800/40 hover:border-zinc-500'}`} style={sel ? { borderColor: 'var(--color-primary)' } : {}}>
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
              <div className="text-sm">Total a regalar: <strong className="text-lg" style={{ color: 'var(--color-primary)' }}>{formatearCLP(totalRegalo)}</strong></div>
              <button disabled={productosSeleccionadosRegalo.length === 0} onClick={() => setModalCheckoutRegalo(true)} className="disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg transition cursor-pointer" style={{ backgroundColor: 'var(--color-primary)' }}>Proceder al Pago</button>
            </div>
          </div>
        </div>
      )}

      {modalCheckoutRegalo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 text-white animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <button onClick={() => setModalCheckoutRegalo(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"><X size={20}/></button>
            
            <h3 className="text-xl font-bold border-b border-zinc-800 pb-3 flex gap-2" style={{ color: 'var(--color-primary)' }}><CreditCard /> Confirmar Regalo</h3>
            
            {(!sesionActual?.tarjetas || sesionActual.tarjetas.length === 0) ? (
              <div className="py-6 text-center space-y-3">
                <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>No tienes ninguna tarjeta agregada en tu perfil.</p>
                <p className="text-xs text-zinc-400">Agrega una tarjeta en la sección de Perfil para poder enviar regalos.</p>
                <button onClick={() => setModalCheckoutRegalo(false)} className="mt-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer">Cerrar</button>
              </div>
            ) : (
              <form onSubmit={confirmarCompraRegalos} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-semibold">Selecciona tu tarjeta:</label>
                  {sesionActual.tarjetas.map((card, i) => (
                    <div key={i} onClick={() => setTarjetaSeleccionadaRegalo(card)} className={`p-3 rounded-lg border cursor-pointer ${tarjetaSeleccionadaRegalo === card ? 'bg-red-950/30' : 'border-zinc-700 bg-zinc-800'}`} style={tarjetaSeleccionadaRegalo === card ? { borderColor: 'var(--color-primary)' } : {}}>
                      <p className="font-mono font-bold">{card.numero}</p><p className="text-xs text-zinc-400">Exp: {card.expiracion}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold">Código CVV:</label>
                  <input 
                    type="password" 
                    maxLength={4} 
                    value={cvvRegalo} 
                    onChange={(e) => setCvvRegalo(e.target.value)} 
                    placeholder="CVV (3 o 4 dígitos)" 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-xs text-white tracking-widest focus:outline-none" 
                    required 
                  />
                </div>

                {procesandoPago ? (
                  <div className="text-center py-4"><div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-2" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div><p className="text-xs">Procesando pago seguro...</p></div>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setModalCheckoutRegalo(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-lg font-bold text-xs cursor-pointer">Cancelar</button>
                    <button type="submit" className="flex-1 py-3 rounded-lg font-bold text-xs cursor-pointer text-white transition" style={{ backgroundColor: 'var(--color-primary)' }}>Pagar {formatearCLP(totalRegalo)}</button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      {mensajeModalGlobal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-white animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
            <CheckCircle2 size={40} className="mx-auto" style={{ color: 'var(--color-primary)' }} />
            <h3 className="text-lg font-bold">Aviso del Sistema</h3>
            <p className="text-sm text-zinc-300">{mensajeModalGlobal}</p>
            <button onClick={() => setMensajeModalGlobal(null)} className="w-full py-2.5 rounded-lg font-bold text-sm cursor-pointer text-white transition" style={{ backgroundColor: 'var(--color-primary)' }}>Entendido</button>
          </div>
        </div>
      )}
    </nav>
  );
}