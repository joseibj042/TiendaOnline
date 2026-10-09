import React, { useState, useRef, useEffect } from 'react';
import { Heart, CheckSquare, Square, Trash2, X, ShoppingCart } from 'lucide-react';
import { formatearCLP } from '../utils';
import { supabase } from '../services/supabaseClient';
import { useSession } from '../context/SessionContext';

export default function Wishlist({ carrito, setCarrito, setMensajeModalGlobal }) {
  const { usuarioActivo, setUsuarioActivo } = useSession(); // USANDO CONTEXTO
  const [dropdownWishlistOpen, setDropdownWishlistOpen] = useState(false);
  const [modalWishlistCompletaOpen, setModalWishlistCompletaOpen] = useState(false);
  const [productosSeleccionadosWishlist, setProductosSeleccionadosWishlist] = useState([]);
  const dropdownWishlistRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownWishlistRef.current && !dropdownWishlistRef.current.contains(e.target)) {
        setDropdownWishlistOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const actualizarWishlistEnSupabaseYStorage = async (nuevaWishlist) => {
    const usuarioActualizado = { ...usuarioActivo, wishlist: nuevaWishlist };
    setUsuarioActivo(usuarioActualizado); // Contexto actualiza React y Storage

    if (usuarioActivo?.email) {
      await supabase.from('profiles').update({ wishlist: nuevaWishlist }).eq('email', usuarioActivo.email);
    }
  };

  const cantidadWishlist = usuarioActivo?.wishlist?.length || 0;

  const eliminarDeWishlistCompleta = (prodId) => {
    const nuevaWishlist = (usuarioActivo.wishlist || []).filter(item => (item.id || item.nombre) !== (prodId.id || prodId.nombre));
    actualizarWishlistEnSupabaseYStorage(nuevaWishlist);
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
    const wishlistActual = usuarioActivo?.wishlist || [];
    if (productosSeleccionadosWishlist.length === wishlistActual.length) {
      setProductosSeleccionadosWishlist([]);
    } else {
      setProductosSeleccionadosWishlist([...wishlistActual]);
    }
  };

  const agregarWishlistSeleccionadosAlCarrito = async () => {
    if (productosSeleccionadosWishlist.length === 0) {
      setMensajeModalGlobal?.('Selecciona al menos un producto de tu lista de deseos.');
      return;
    }
    const carritoActual = carrito.length > 0 ? carrito : (JSON.parse(localStorage.getItem('redragon_carrito')) || []);
    let nuevoCarrito = [...carritoActual];
    let productosAgotados = [];

    productosSeleccionadosWishlist.forEach(prod => {
      const stockDisponible = prod.stock !== undefined ? prod.stock : 10;
      const index = nuevoCarrito.findIndex(item => (item.id || item.nombre) === (prod.id || prod.nombre));
      
      const cantidadActual = index !== -1 ? (nuevoCarrito[index].cantidad || 1) : 0;
      
      if (cantidadActual + 1 > stockDisponible) {
        productosAgotados.push(prod.nombre);
      } else {
        if (index !== -1) {
          nuevoCarrito[index] = { ...nuevoCarrito[index], cantidad: cantidadActual + 1 };
        } else {
          nuevoCarrito.push({ ...prod, cantidad: 1 });
        }
      }
    });

    localStorage.setItem('redragon_carrito', JSON.stringify(nuevoCarrito));
    if (typeof setCarrito === 'function') setCarrito(nuevoCarrito);

    if (usuarioActivo?.email) {
      await supabase.from('profiles').update({ cart: nuevoCarrito }).eq('email', usuarioActivo.email);
    }

    setProductosSeleccionadosWishlist([]);
    setModalWishlistCompletaOpen(false);

    if (productosAgotados.length > 0) {
      setMensajeModalGlobal?.(`Algunos productos no se agregaron por falta de stock: ${productosAgotados.join(', ')}`);
    } else {
      setMensajeModalGlobal?.(`¡${productosSeleccionadosWishlist.length} producto(s) añadidos al carrito con éxito!`);
    }
  };

  if (!usuarioActivo) return null;

  return (
    <div className="relative" ref={dropdownWishlistRef}>
      <button onClick={() => setDropdownWishlistOpen(!dropdownWishlistOpen)} className="flex items-center gap-1.5 bg-black/40 hover:bg-black/60 px-3 py-2 rounded-lg transition text-xs font-bold border border-white/25 cursor-pointer relative">
        <Heart size={18} className="text-red-400 fill-red-400" /><span className="hidden sm:inline">({cantidadWishlist})</span>
      </button>

      {dropdownWishlistOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 z-50 text-white text-xs animate-fade-in">
          <div className="px-4 py-3 border-b border-zinc-800 font-bold flex justify-between items-center bg-zinc-950">
            <span className="flex items-center gap-2"><Heart size={14} className="text-red-500 fill-red-500"/> Tus Favoritos</span><span className="text-[10px] text-zinc-400">{cantidadWishlist} total</span>
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-zinc-800">
            {(!usuarioActivo.wishlist || usuarioActivo.wishlist.length === 0) ? <p className="text-zinc-400 text-center py-6">Tu lista está vacía.</p> : (
              usuarioActivo.wishlist.map((prod, idx) => (
                <div key={idx} className="p-3 hover:bg-zinc-800/60 transition flex items-center gap-3 cursor-pointer">
                  <img src={prod.imagen} alt="" className="w-10 h-10 object-contain bg-black/40 p-1 rounded border border-zinc-700" />
                  <div className="flex-1"><p className="font-bold text-white truncate max-w-[150px]">{prod.nombre}</p><p className="font-bold mt-0.5" style={{ color: 'var(--color-primary)' }}>{formatearCLP(prod.precio)}</p></div>
                </div>
              ))
            )}
          </div>
          <div className="p-2 border-t border-zinc-800">
            <button onClick={() => { setDropdownWishlistOpen(false); setModalWishlistCompletaOpen(true); }} className="w-full py-2 rounded-lg text-white font-bold cursor-pointer transition shadow" style={{ backgroundColor: 'var(--color-primary)' }}>Ir a Wishlist Completa</button>
          </div>
        </div>
      )}

      {modalWishlistCompletaOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 text-white animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2"><Heart className="text-red-500 fill-red-500" size={20} /> Tu Lista de Deseos</h3>
              <button onClick={() => setModalWishlistCompletaOpen(false)} className="text-zinc-400 hover:text-white transition cursor-pointer"><X size={22} /></button>
            </div>
            
            {usuarioActivo?.wishlist && usuarioActivo.wishlist.length > 0 && (
              <div className="bg-zinc-900 px-6 py-2.5 border-b border-zinc-800 flex justify-between items-center text-xs">
                <button onClick={seleccionarTodoWishlist} className="hover:underline font-bold flex items-center gap-1.5 cursor-pointer" style={{ color: 'var(--color-primary)' }}>
                  {productosSeleccionadosWishlist.length === usuarioActivo.wishlist.length ? <CheckSquare size={16}/> : <Square size={16}/>}
                  {productosSeleccionadosWishlist.length === usuarioActivo.wishlist.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                </button>
                <span className="text-zinc-400 font-medium">Seleccionados: <strong className="text-white">{productosSeleccionadosWishlist.length}</strong></span>
              </div>
            )}

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {(!usuarioActivo?.wishlist || usuarioActivo.wishlist.length === 0) ? (
                <div className="text-center py-16 text-zinc-400 space-y-3">
                  <Heart size={48} className="mx-auto text-zinc-600 stroke-1" />
                  <p className="text-lg font-semibold">Tu lista de deseos está vacía.</p>
                </div>
              ) : (
                usuarioActivo.wishlist.map((prod, idx) => {
                  const seleccionado = productosSeleccionadosWishlist.some(p => (p.id || p.nombre) === (prod.id || prod.nombre));
                  return (
                    <div key={idx} onClick={() => toggleSeleccionWishlistProd(prod)} className={`p-4 rounded-xl flex items-center justify-between gap-4 shadow-md border cursor-pointer transition ${seleccionado ? 'bg-red-950/25' : 'bg-zinc-800/40 border-zinc-700/70 hover:border-zinc-500'}`} style={seleccionado ? { borderColor: 'var(--color-primary)' } : {}}>
                      <div className="flex items-center gap-4">
                        <button type="button" className="focus:outline-none" style={{ color: 'var(--color-primary)' }}>{seleccionado ? <CheckSquare size={20} /> : <Square size={20} className="text-zinc-500" />}</button>
                        <div className="w-16 h-16 bg-black/40 rounded-lg p-2 flex items-center justify-center border border-zinc-700 shrink-0">
                          <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-white">{prod.nombre}</h4>
                          <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded uppercase font-semibold">{prod.tipo}</span>
                          <p className="font-bold text-base mt-1" style={{ color: 'var(--color-primary)' }}>{formatearCLP(prod.precio)}</p>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); eliminarDeWishlistCompleta(prod); }} className="p-2.5 bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 rounded-lg transition border border-zinc-700 cursor-pointer"><Trash2 size={18} /></button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-between items-center">
              <span className="text-xs text-zinc-400 font-medium">Total de artículos: <strong className="text-white">{cantidadWishlist}</strong></span>
              <div className="flex gap-2">
                {productosSeleccionadosWishlist.length > 0 && (
                  <button onClick={agregarWishlistSeleccionadosAlCarrito} className="bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow cursor-pointer flex items-center gap-2">
                    <ShoppingCart size={16} /> Agregar al Carrito ({productosSeleccionadosWishlist.length})
                  </button>
                )}
                <button onClick={() => setModalWishlistCompletaOpen(false)} className="text-white px-6 py-2.5 rounded-xl font-bold text-sm transition shadow cursor-pointer" style={{ backgroundColor: 'var(--color-primary)' }}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}