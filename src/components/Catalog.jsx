import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, SlidersHorizontal, CheckCircle2, Heart, User, UserCheck, X } from 'lucide-react';
import { formatearCLP } from '../utils';
import { supabase } from '../services/supabaseClient';

export default function Catalog({ productos, categoriaFiltro, setVistaActual, setProductoSeleccionado, usuarioActivo, setUsuarioActivo }) {
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('defecto');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [modalAviso, setModalAviso] = useState(null);
  const [mostrarModalAuth, setMostrarModalAuth] = useState(false);
  
  // Estados para la paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 12;

  const sesionActual = usuarioActivo || JSON.parse(localStorage.getItem('redragon_sesion_activa'));

  // Resetear a la página 1 cada vez que cambie un filtro o la búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroTipo, categoriaFiltro]);

  const verDetalle = (producto) => {
    setProductoSeleccionado(producto);
    setVistaActual('detalle');
  };

  const toggleWishlist = async (e, prod) => {
    e.stopPropagation();
    
    if (!sesionActual) {
      setMostrarModalAuth(true);
      return;
    }

    const wishlistActual = sesionActual.wishlist || [];
    const yaExiste = wishlistActual.some(item => (item.id || item.nombre) === (prod.id || prod.nombre));
    
    const nuevaWishlist = yaExiste 
      ? wishlistActual.filter(item => (item.id || item.nombre) !== (prod.id || prod.nombre))
      : [...wishlistActual, prod];
      
    const usuarioActualizado = { ...sesionActual, wishlist: nuevaWishlist };
    
    if (setUsuarioActivo) {
      setUsuarioActivo(usuarioActualizado);
    }
    localStorage.setItem('redragon_sesion_activa', JSON.stringify(usuarioActualizado));

    const todos = JSON.parse(localStorage.getItem('redragon_usuarios')) || [];
    const idx = todos.findIndex(u => u.email === usuarioActualizado.email);
    if (idx !== -1) {
      todos[idx] = usuarioActualizado;
      localStorage.setItem('redragon_usuarios', JSON.stringify(todos));
    }

    if (sesionActual?.email) {
      await supabase
        .from('profiles')
        .update({ wishlist: nuevaWishlist })
        .eq('email', sesionActual.email);
    }

    window.dispatchEvent(new Event('sesionActualizada'));

    const mensaje = yaExiste ? "Producto eliminado de tu lista de deseos." : "¡Producto añadido instantáneamente a tu lista de deseos! ❤️";
    setModalAviso(mensaje);
    setTimeout(() => setModalAviso(null), 2500);
  };

  const opcionesPorCategoria = {
    teclados: ['Mecánico', 'Membrana'],
    mouses: ['Inalámbrico', 'Alámbrico'],
    audifonos: ['Inalámbrico', 'Alámbrico'],
    mousepads: ['Ultra Smooth', 'XXL', 'XL', 'L'],
    combos: ['Inalámbrico', 'Alámbrico', 'Membrana', 'Mecánico'],
    todos: ['Mecánico', 'Membrana', 'Inalámbrico', 'Alámbrico', 'Ultra Smooth', 'XXL', 'XL', 'L'] 
  };

  const tiposDisponibles = opcionesPorCategoria[categoriaFiltro] || [];

  let productosMostrados = categoriaFiltro === 'todos' ? productos : productos.filter(p => p.categoria === categoriaFiltro);

  if (busqueda !== '') {
    productosMostrados = productosMostrados.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  }

  if (filtroTipo !== 'Todos') {
    productosMostrados = productosMostrados.filter(p => p.tipo === filtroTipo);
  }

  if (orden === 'precio_asc') productosMostrados.sort((a, b) => a.precio - b.precio);
  else if (orden === 'precio_desc') productosMostrados.sort((a, b) => b.precio - a.precio);
  else if (orden === 'nombre_asc') productosMostrados.sort((a, b) => a.nombre.localeCompare(b.nombre));

  // Lógica de Paginación
  const totalPaginas = Math.ceil(productosMostrados.length / productosPorPagina);
  const indiceUltimoProducto = paginaActual * productosPorPagina;
  const indicePrimerProducto = indiceUltimoProducto - productosPorPagina;
  const productosPaginados = productosMostrados.slice(indicePrimerProducto, indiceUltimoProducto);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6 mt-8 relative">
      {modalAviso && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-zinc-800 border text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3 animate-fade-in" style={{ borderColor: 'var(--color-primary)' }}>
          <CheckCircle2 size={20} style={{ color: 'var(--color-primary)' }} />
          <span className="font-bold text-sm">{modalAviso}</span>
        </div>
      )}

      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setVistaActual('home')} className="transition cursor-pointer hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
          <ArrowLeft size={28} />
        </button>
        <h2 className="text-4xl font-bold uppercase tracking-wider text-white">
          {categoriaFiltro === 'todos' ? 'Todos los Productos' : `Catálogo: ${categoriaFiltro}`}
        </h2>
      </div>

      <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-center shadow-lg">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 text-zinc-500" size={20} />
          <input type="text" placeholder="Buscar productos..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none transition" />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 cursor-pointer">
          <SlidersHorizontal size={20} className="text-zinc-400" />
          <select className="bg-transparent text-white focus:outline-none w-full cursor-pointer" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="Todos" className="bg-zinc-900">Todos los tipos</option>
            {tiposDisponibles.map((tipo, index) => <option key={index} value={tipo} className="bg-zinc-900">{tipo}</option>)}
          </select>
        </div>
        <select className="w-full md:w-auto bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2 focus:outline-none cursor-pointer" value={orden} onChange={(e) => setOrden(e.target.value)}>
          <option value="defecto">Ordenar por...</option><option value="precio_asc">Menor a mayor precio</option><option value="precio_desc">Mayor a menor precio</option><option value="nombre_asc">Nombre (A - Z)</option>
        </select>
      </div>

      {productosPaginados.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
            {productosPaginados.map((prod, index) => {
              const esFavorito = sesionActual?.wishlist?.some(item => (item.id || item.nombre) === (prod.id || prod.nombre));
              const stockActual = prod.stock !== undefined ? prod.stock : 10;
              const estaAgotado = stockActual <= 0;

              return (
                <div 
                  key={prod.id || index} 
                  className="bg-zinc-900/80 backdrop-blur-sm rounded-lg overflow-hidden border border-zinc-800 transition cursor-pointer shadow-xl group flex flex-col animate-card-appear opacity-0 relative" 
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
                >
                  <button 
                    onClick={(e) => toggleWishlist(e, prod)}
                    className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black p-2 rounded-full text-white transition border border-zinc-700 cursor-pointer shadow"
                  >
                    {esFavorito ? '❤️' : '🤍'}
                  </button>

                  <div className="overflow-hidden bg-zinc-800 h-48 flex items-center justify-center p-4 relative" onClick={() => verDetalle(prod)}>
                     <img src={prod.imagen} alt={prod.nombre} loading="lazy" className="w-full h-full object-contain group-hover:scale-110 transition duration-500" />
                     {estaAgotado && (
                       <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center">
                         <span className="bg-red-600 text-white font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider shadow-lg border border-red-400">
                           Agotado
                         </span>
                       </div>
                     )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between" onClick={() => verDetalle(prod)}>
                    <div>
                      <h4 className="font-bold text-lg mb-1 text-zinc-100">{prod.nombre}</h4>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">{prod.tipo}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${!estaAgotado ? 'bg-green-950/60 text-green-400 border border-green-800/50' : 'bg-red-950/60 text-red-400 border border-red-800/50'}`}>
                          {!estaAgotado ? `Stock: ${stockActual}` : 'Agotado'}
                        </span>
                      </div>
                    </div>
                    <p className="font-bold text-xl mt-2" style={{ color: 'var(--color-primary)' }}>{formatearCLP(prod.precio)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CONTROLES DE PAGINACIÓN */}
          {totalPaginas > 1 && (
            <div className="flex justify-center items-center gap-2 pt-8 pb-4">
              <button 
                onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700 transition cursor-pointer"
              >
                Anterior
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
                  <button
                    key={numero}
                    onClick={() => setPaginaActual(numero)}
                    className={`w-10 h-10 rounded-lg font-bold text-sm transition cursor-pointer border ${paginaActual === numero ? 'text-white border-transparent shadow-lg' : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'}`}
                    style={paginaActual === numero ? { backgroundColor: 'var(--color-primary)' } : {}}
                  >
                    {numero}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                disabled={paginaActual === totalPaginas}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700 transition cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-zinc-400 text-xl">No se encontraron productos con esos filtros.</div>
      )}

      {/* MODAL DE AUTENTICACIÓN / INVITADO */}
      {mostrarModalAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-zinc-900 border rounded-2xl p-8 max-w-md w-full shadow-2xl relative text-white" style={{ borderColor: 'var(--color-primary)' }}>
            <button 
              onClick={() => setMostrarModalAuth(false)} 
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition cursor-pointer"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-2xl font-bold mb-2 text-center">Inicia sesión</h3>
            <p className="text-zinc-400 text-sm text-center mb-6">Para guardar productos en tu lista de deseos y acceder a beneficios exclusivos, debes iniciar sesión.</p>
            
            <div className="space-y-4">
              <button 
                onClick={() => { setMostrarModalAuth(false); setVistaActual('auth'); }} 
                className="w-full text-white py-3.5 rounded-lg font-bold shadow-lg transition flex items-center justify-center gap-2 cursor-pointer border"
                style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}
              >
                <User size={20} /> Iniciar Sesión / Registrarse
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-zinc-700"></div>
                <span className="flex-shrink-0 mx-4 text-zinc-500 text-xs uppercase font-bold">O si prefieres</span>
                <div className="flex-grow border-t border-zinc-700"></div>
              </div>

              <button 
                onClick={() => setMostrarModalAuth(false)} 
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3.5 rounded-lg font-bold border border-zinc-700 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck size={20} /> Continuar en la Tienda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}