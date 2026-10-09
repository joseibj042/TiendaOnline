import React, { useState, useEffect } from 'react';
import { Trash2, User, UserCheck, X, AlertCircle } from 'lucide-react';
import { formatearCLP } from '../utils';
import { supabase } from '../services/supabaseClient';

export default function Cart({ carrito, setCarrito, setVistaActual, usuarioActivo }) {
  const [mostrarModalAuth, setMostrarModalAuth] = useState(false);

  useEffect(() => {
    const fetchCartFromSupabase = async () => {
      if (!usuarioActivo?.email) return;
      const { data } = await supabase
        .from('profiles')
        .select('cart')
        .eq('email', usuarioActivo.email)
        .single();
      
      if (data && data.cart && Array.isArray(data.cart) && data.cart.length > 0 && carrito.length === 0) {
        setCarrito(data.cart);
      }
    };
    fetchCartFromSupabase();
  }, [usuarioActivo?.email]);

  const actualizarYGuardarCarrito = async (nuevoCarrito) => {
    setCarrito(nuevoCarrito);
    localStorage.setItem('redragon_carrito', JSON.stringify(nuevoCarrito));
    if (usuarioActivo?.email) {
      await supabase
        .from('profiles')
        .update({ cart: nuevoCarrito })
        .eq('email', usuarioActivo.email);
    }
  };

  const total = carrito.reduce((sum, item) => sum + (item.precio * (item.cantidad || 1)), 0);

  const cambiarCantidad = (index, delta) => {
    const nuevoCarrito = [...carrito];
    const itemActual = nuevoCarrito[index];
    const nuevaCantidad = (itemActual.cantidad || 1) + delta;

    if (delta > 0 && itemActual.stock !== undefined && nuevaCantidad > itemActual.stock) {
      alert(`Lo sentimos, solo quedan ${itemActual.stock} unidades disponibles de ${itemActual.nombre}`);
      return;
    }

    if (nuevaCantidad <= 0) {
      actualizarYGuardarCarrito(carrito.filter((_, i) => i !== index));
    } else {
      nuevoCarrito[index] = { ...itemActual, cantidad: nuevaCantidad };
      actualizarYGuardarCarrito(nuevoCarrito);
    }
  };

  const handleProcederPago = () => {
    if (usuarioActivo) {
      setVistaActual('checkout');
    } else {
      setMostrarModalAuth(true);
    }
  };

  if (carrito.length === 0) {
    return (
      <div className="text-center mt-20 animate-fade-in">
        <h2 className="text-2xl text-zinc-400 mb-6">Tu carrito está vacío</h2>
        <button onClick={() => setVistaActual('home')} className="text-white px-6 py-2 rounded font-bold transition cursor-pointer shadow-lg" style={{ backgroundColor: 'var(--color-primary)' }}>Volver a la tienda</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 mt-8 relative animate-fade-in">
      <h2 className="text-3xl font-bold mb-6 text-white">Tu Carrito</h2>
      
      {!usuarioActivo && (
        <div className="bg-zinc-800/80 border border-amber-500/50 p-4 rounded-xl mb-6 flex items-center gap-3 text-amber-300 shadow-lg animate-fade-in">
          <AlertCircle size={24} className="shrink-0" />
          <div className="flex-1 text-sm">
            <span className="font-bold">Estás navegando como invitado.</span> Tu carrito actual solo se guardará temporalmente en este navegador. 
            <button onClick={() => setVistaActual('login')} className="ml-2 underline font-bold cursor-pointer hover:text-white">
              Inicia sesión aquí
            </button> para sincronizar y guardar tu carrito en la nube permanentemente.
          </div>
        </div>
      )}

      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 mb-8 shadow-xl">
        {carrito.map((item, index) => {
          const cantidad = item.cantidad || 1;
          const subtotalItem = item.precio * cantidad;

          return (
            <div 
              key={index} 
              className="flex justify-between items-center border-b border-zinc-800 py-4 last:border-0 animate-card-appear opacity-0"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 shrink-0 bg-black/40 rounded border border-zinc-700 flex items-center justify-center p-2">
                   <img src={item.imagen} alt={item.nombre} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-xl text-white mb-2">{item.nombre}</h4>
                  
                  {Array.isArray(item.descripcion) ? (
                    <ul className="text-sm text-zinc-400 space-y-1 list-disc pl-5">
                      {item.descripcion.map((detalle, idx) => (
                        <li key={idx}>{detalle}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-zinc-400">{item.descripcion || item.detalles}</p>
                  )}

                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-sm text-zinc-400 font-medium">Cantidad:</span>
                    <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded overflow-hidden">
                      <button onClick={() => cambiarCantidad(index, -1)} className="px-2.5 py-0.5 text-zinc-300 hover:bg-zinc-700 transition cursor-pointer font-bold">-</button>
                      <span className="px-3 py-0.5 text-sm font-bold text-white">{cantidad}</span>
                      <button onClick={() => cambiarCantidad(index, 1)} className="px-2.5 py-0.5 text-zinc-300 hover:bg-zinc-700 transition cursor-pointer font-bold">+</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3 ml-4">
                <span className="font-bold text-xl" style={{ color: 'var(--color-primary)' }}>{formatearCLP(subtotalItem)}</span>
                <button onClick={() => actualizarYGuardarCarrito(carrito.filter((_, i) => i !== index))} className="text-zinc-500 hover:text-red-500 transition-colors flex items-center gap-1 text-sm cursor-pointer">
                  <Trash2 size={16} /> Quitar
                </button>
              </div>
            </div>
          );
        })}
        
        <div className="mt-6 text-right text-3xl font-bold border-t border-zinc-700 pt-6 text-white">
          Total: <span style={{ color: 'var(--color-primary)' }}>{formatearCLP(total)}</span>
        </div>
      </div>

      <button onClick={handleProcederPago} className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-lg font-bold text-xl transition shadow-lg border border-green-500 cursor-pointer">
        Proceder al Pago
      </button>

      {mostrarModalAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-zinc-900 border rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-scale-up" style={{ borderColor: 'var(--color-primary)' }}>
            <button 
              onClick={() => setMostrarModalAuth(false)} 
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition cursor-pointer"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-2xl font-bold text-white mb-2 text-center">Casi listo...</h3>
            <p className="text-zinc-400 text-sm text-center mb-6">Para una mejor experiencia, guardar tus direcciones y acumular beneficios, te recomendamos iniciar sesión.</p>
            
            <div className="space-y-4">
              <button 
                onClick={() => { setMostrarModalAuth(false); setVistaActual('login'); }} 
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
                onClick={() => { setMostrarModalAuth(false); setVistaActual('checkout'); }} 
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3.5 rounded-lg font-bold border border-zinc-700 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck size={20} /> Continuar como Invitado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}