import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, LogOut, Search, Palette, Menu, X, Users } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import Notificaciones from './Notificaciones';
import Wishlist from './Wishlist';
import AmigosYMensajes from './AmigosYMensajes';
import { useSession } from '../context/SessionContext';

export default function Navbar({ setVistaActual, cantidadCarrito, setCategoriaFiltro, temaActual, setTemaActual, carrito = [], setCarrito }) {
  const { usuarioActivo, setUsuarioActivo } = useSession(); // USANDO CONTEXTO
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuTemaOpen, setMenuTemaOpen] = useState(false);
  const [menuMovilOpen, setMenuMovilOpen] = useState(false);
  const [modalCerrarSesionOpen, setModalCerrarSesionOpen] = useState(false);
  const [amigoSeleccionadoGlobal, setAmigoSeleccionadoGlobal] = useState(null);
  
  const dropdownRef = useRef(null);
  const menuTemaRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (menuTemaRef.current && !menuTemaRef.current.contains(e.target)) setMenuTemaOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const actualizarUsuarioPorUsername = (username, callbackActualizar) => {
    const todos = JSON.parse(localStorage.getItem('redragon_usuarios')) || [];
    const index = todos.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (index !== -1) {
      const modificado = callbackActualizar(todos[index]);
      todos[index] = modificado;
      localStorage.setItem('redragon_usuarios', JSON.stringify(todos));
      if (modificado.email === usuarioActivo?.email) setUsuarioActivo(modificado);
    }
  };

  const irACategoria = (categoria) => { setCategoriaFiltro(categoria); setVistaActual('catalogo'); };
  
  const abrirPerfilPublico = (username) => {
    const todos = JSON.parse(localStorage.getItem('redragon_usuarios')) || [];
    const amigo = todos.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (amigo) setAmigoSeleccionadoGlobal(amigo);
  };

  const estilosNavbar = { red: "bg-red-700 border-red-900", purple: "bg-purple-800 border-purple-950", green: "bg-emerald-700 border-emerald-950" };

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
          <button onClick={() => setVistaActual('track-order')} className="hover:opacity-80 transition cursor-pointer flex items-center gap-1.5"><Search size={16} /> Pedido</button>
          <button onClick={() => setVistaActual('customizer')} className="bg-white text-zinc-900 px-3 py-1 rounded-full animate-pulse cursor-pointer">CUSTOM</button>
        </div>

        <div className="flex items-center gap-2 relative">
          <div className="lg:hidden flex items-center">
            <button onClick={() => setMenuMovilOpen(!menuMovilOpen)} className="p-2 bg-black/40 rounded-lg text-white border border-white/25 cursor-pointer">
              {menuMovilOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

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

          {usuarioActivo ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setVistaActual('amigos')} className="p-2 bg-black/40 rounded-lg cursor-pointer border border-white/25 hover:bg-black/60 transition text-white flex items-center justify-center" title="Centro de Amigos"><Users size={18} /></button>

              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg font-bold text-sm border border-white/25 cursor-pointer hover:bg-black/60 transition">
                  <div className="w-6 h-6 bg-white text-zinc-900 rounded-full flex items-center justify-center overflow-hidden">
                    {usuarioActivo.avatar ? <img src={usuarioActivo.avatar} alt="" className="w-full h-full object-cover"/> : usuarioActivo.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">@{usuarioActivo.username}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-2 z-50 text-white animate-fade-in">
                    <button onClick={() => { setVistaActual('profile'); setDropdownOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-zinc-800 flex gap-2 cursor-pointer items-center"><User size={16} style={{ color: 'var(--color-primary)' }} /> Perfil</button>
                    <button onClick={async () => {
    await supabase.auth.signOut();
    
    // 🧹 Limpieza estricta de caché local para evitar que se crucen los usuarios
    localStorage.removeItem('redragon_sesion_activa');
    localStorage.removeItem('redragon_chats');
    localStorage.removeItem('redragon_carrito');
    localStorage.removeItem('redragon_producto');
    localStorage.removeItem('redragon_categoria');
    
    setUsuarioActivo(null); 
    setModalCerrarSesionOpen(false);
    setVistaActual('home');
  }} 
  className="flex-1 py-3 text-white rounded-xl font-bold text-sm cursor-pointer border transition bg-red-600 hover:bg-red-500 border-red-500"
>
  Sí, Salir
</button>
                  </div>
                )}
              </div>

              <AmigosYMensajes sesionActual={usuarioActivo} actualizarUsuarioEnStorage={setUsuarioActivo} actualizarUsuarioPorUsername={actualizarUsuarioPorUsername} setVistaActual={setVistaActual} amigoSeleccionadoVerExt={amigoSeleccionadoGlobal} setAmigoSeleccionadoVerExt={setAmigoSeleccionadoGlobal} />
              <Notificaciones sesionActual={usuarioActivo} actualizarUsuarioEnStorage={setUsuarioActivo} actualizarUsuarioPorUsername={actualizarUsuarioPorUsername} setVistaActual={setVistaActual} abrirPerfilPublico={abrirPerfilPublico} />
              <Wishlist carrito={carrito} setCarrito={setCarrito} />
            </div>
          ) : (
             <button onClick={() => setVistaActual('login')} className="bg-black/40 px-3 py-2 rounded text-white font-bold text-sm cursor-pointer hover:bg-black/60 transition">Ingresar</button>
          )}

          <button className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded hover:bg-zinc-800 transition shadow-lg border border-zinc-700 font-bold cursor-pointer" onClick={() => setVistaActual('cart')}>
            <ShoppingCart size={20} /> ({cantidadCarrito})
          </button>
        </div>
      </div>
      
      {menuMovilOpen && (
        <div className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 p-4 flex flex-col gap-4 font-bold text-sm uppercase tracking-wider animate-fade-in absolute w-full left-0 top-[73px] z-40 shadow-2xl">
          <button onClick={() => { irACategoria('teclados'); setMenuMovilOpen(false); }} className="text-left text-white hover:opacity-80 py-2 border-b border-zinc-800">Teclados</button>
          <button onClick={() => { irACategoria('mouses'); setMenuMovilOpen(false); }} className="text-left text-white hover:opacity-80 py-2 border-b border-zinc-800">Mouses</button>
          <button onClick={() => { irACategoria('mousepads'); setMenuMovilOpen(false); }} className="text-left text-white hover:opacity-80 py-2 border-b border-zinc-800">Mousepads</button>
          <button onClick={() => { irACategoria('audifonos'); setMenuMovilOpen(false); }} className="text-left text-white hover:opacity-80 py-2 border-b border-zinc-800">Audífonos</button>
          <button onClick={() => { irACategoria('combos'); setMenuMovilOpen(false); }} className="text-left text-white hover:opacity-80 py-2 border-b border-zinc-800">Combos</button>
          <button onClick={() => { setVistaActual('amigos'); setMenuMovilOpen(false); }} className="text-left text-white hover:opacity-80 py-2 border-b border-zinc-800 flex items-center gap-2"><Users size={16}/> Centro de Amigos</button>
        </div>
      )}

{modalCerrarSesionOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4 text-white">
    <div className="bg-zinc-900 border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-5 text-center animate-scale-up" style={{ borderColor: 'var(--color-primary)' }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl font-bold border shadow-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}>🚪</div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">¿Cerrar sesión?</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">¿Estás seguro de que deseas salir de tu cuenta activa?</p>
      </div>
      <div className="flex gap-3">
        <button 
          onClick={() => setModalCerrarSesionOpen(false)} 
          className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-sm cursor-pointer transition border border-zinc-700"
        >
          Cancelar
        </button>
        <button 
          onClick={async () => {
            await supabase.auth.signOut();
            
            // 🧹 Limpieza estricta de caché local para evitar que se crucen los usuarios
            localStorage.removeItem('redragon_sesion_activa');
            localStorage.removeItem('redragon_chats');
            localStorage.removeItem('redragon_carrito');
            localStorage.removeItem('redragon_producto');
            localStorage.removeItem('redragon_categoria');
            
            setUsuarioActivo(null); 
            setModalCerrarSesionOpen(false);
            setVistaActual('home');
          }} 
          className="flex-1 py-3 text-white rounded-xl font-bold text-sm cursor-pointer border transition bg-red-600 hover:bg-red-500 border-red-500"
        >
          Sí, Salir
        </button>
      </div>
    </div>
  </div>
)}
    </nav>
  );
}