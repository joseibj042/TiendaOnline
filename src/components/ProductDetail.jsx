import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, Check, MapPin, Heart, CheckCircle2, Truck, User, UserCheck, X, ShieldCheck, Star } from 'lucide-react';
import { formatearCLP, regionesChile } from '../utils';
import { supabase } from '../services/supabaseClient';

const limpiarMonto = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return Number(String(val).replace(/[^0-9]/g, '')) || 0;
};

const formatearEnvioSeguro = (monto) => {
  if (monto === 0 || monto === "Envío Gratis") return "Envío Gratis";
  return "$" + Number(monto).toLocaleString('es-CL');
};

export default function ProductDetail({ producto, agregarAlCarrito, setVistaActual, usuarioActivo, setUsuarioActivo }) {
  if (!producto) return null;

  const [imagenActiva, setImagenActiva] = useState(producto.imagen);
  const [cantidad, setCantidad] = useState(1);
  const [animandoBoton, setAnimandoBoton] = useState(false);
  const [modalAviso, setModalAviso] = useState(null);
  const [mostrarModalAuth, setMostrarModalAuth] = useState(false);
  const [mostrarPromoEnvio, setMostrarPromoEnvio] = useState(true);

  const [regionSeleccionadaIdx, setRegionSeleccionadaIdx] = useState(6);
  const [comunaSeleccionada, setComunaSeleccionada] = useState(regionesChile[6].comunas[0]);
  const [resultadoEnvio, setResultadoEnvio] = useState(null);

  let imagenesGaleria = [producto.imagen];
  if (producto.galeria) {
    if (Array.isArray(producto.galeria)) {
      imagenesGaleria = [producto.imagen, ...producto.galeria.filter(img => img && img !== producto.imagen)];
    } else if (typeof producto.galeria === 'string') {
      try {
        const parsed = JSON.parse(producto.galeria);
        if (Array.isArray(parsed)) {
          imagenesGaleria = [producto.imagen, ...parsed.filter(img => img && img !== producto.imagen)];
        }
      } catch (e) {
        imagenesGaleria = [producto.imagen, producto.galeria];
      }
    }
  }

  const stockDisponible = producto.stock !== undefined ? producto.stock : 10;
  const sinStock = stockDisponible <= 0;
  
  const sesionActual = usuarioActivo || JSON.parse(localStorage.getItem('redragon_sesion_activa'));
  const enWishlist = sesionActual?.wishlist?.some(p => (p.id || p.nombre) === (producto.id || producto.nombre));

  const toggleWishlist = async () => {
    if (!sesionActual) { 
      setMostrarModalAuth(true); 
      return; 
    }
    
    let nuevaWishlist = [...(sesionActual.wishlist || [])];
    let mensaje = "";
    
    if (enWishlist) { 
      nuevaWishlist = nuevaWishlist.filter(p => (p.id || p.nombre) !== (producto.id || producto.nombre));
      mensaje = "Producto eliminado de tu lista de deseos.";
    } else { 
      nuevaWishlist.push(producto);
      mensaje = "¡Producto añadido instantáneamente a tu lista de deseos! ❤";
    }
    
    const actualizado = { ...sesionActual, wishlist: nuevaWishlist };
    if (setUsuarioActivo) {
      setUsuarioActivo(actualizado);
    }
    localStorage.setItem('redragon_sesion_activa', JSON.stringify(actualizado));
    
    const todos = JSON.parse(localStorage.getItem('redragon_usuarios')) || [];
    const index = todos.findIndex(u => u.email === actualizado.email);
    if (index !== -1) { 
      todos[index] = actualizado; 
      localStorage.setItem('redragon_usuarios', JSON.stringify(todos)); 
    }

    if (sesionActual?.email) {
      await supabase
        .from('profiles')
        .update({ wishlist: nuevaWishlist })
        .eq('email', sesionActual.email);
    }

    window.dispatchEvent(new Event('sesionActualizada'));
    setModalAviso(mensaje);
    setTimeout(() => setModalAviso(null), 2500);
  };

  const calcularEnvioComuna = (e) => {
    e.preventDefault();
    const regionObj = regionesChile[regionSeleccionadaIdx];
    const precioNum = limpiarMonto(producto.precio);
    const precioTotalItem = precioNum * cantidad;

    let costoTexto = "";
    let mensajeTexto = `Despacho Rápido (${regionObj.region} - ${comunaSeleccionada})`;

    if (precioTotalItem > 60000 || precioNum > 60000) {
      costoTexto = "Envío Gratis";
    } else {
      costoTexto = formatearEnvioSeguro(regionObj.costoEnvio);
    }

    setResultadoEnvio({
      texto: mensajeTexto,
      costo: costoTexto
    });
  };

  const handleAgregar = () => {
    if (cantidad > stockDisponible) {
      setModalAviso(`Solo hay ${stockDisponible} unidades disponibles.`);
      setTimeout(() => setModalAviso(null), 2500);
      return;
    }
    agregarAlCarrito(producto, cantidad);
    setAnimandoBoton(true);
    setTimeout(() => setAnimandoBoton(false), 2000);
  };

  let descripcionProcesada = producto.descripcion;
  if (typeof descripcionProcesada === 'string' && descripcionProcesada.trim().startsWith('[')) {
    try {
      descripcionProcesada = JSON.parse(descripcionProcesada);
    } catch (e) {
    }
  }

  const categoriaProducto = producto.categoria || producto.tipo || "Accesorio";

  return (
    <div className="max-w-6xl mx-auto p-4 mt-8 relative space-y-8 animate-fade-in text-white">
      
      {mostrarPromoEnvio && (
        <div className="fixed top-4 right-4 z-50 bg-zinc-900 border text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-fade-in max-w-xs" style={{ borderColor: 'var(--color-primary)' }}>
          <div className="p-2.5 rounded-lg border shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}>
            <Truck size={22} />
          </div>
          <div className="flex-1 pr-2">
            <h4 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Promoción de Envío</h4>
            <p className="text-xs text-zinc-300 mt-0.5">¡Envío gratis en compras de más de 60.000 pesos chilenos!</p>
          </div>
          <button onClick={() => setMostrarPromoEnvio(false)} className="text-zinc-400 hover:text-white transition cursor-pointer p-1 -mr-1 -mt-1">
            <X size={16} />
          </button>
        </div>
      )}

      <button onClick={() => setVistaActual('catalogo')} className="flex items-center gap-2 font-bold transition cursor-pointer hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
        <ArrowLeft size={20} /> Volver al catálogo
      </button>

      <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl relative animate-scale-up">
        
        {modalAviso && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-zinc-800 border text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3 animate-fade-in" style={{ borderColor: 'var(--color-primary)' }}>
            <CheckCircle2 size={20} style={{ color: 'var(--color-primary)' }} />
            <span className="font-bold text-sm">{modalAviso}</span>
          </div>
        )}

        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="bg-black/40 rounded-lg p-2 flex items-center justify-center border border-zinc-800 h-[420px] w-full overflow-hidden relative">
            <img src={imagenActiva} alt={producto.nombre} className="max-h-full max-w-full object-contain drop-shadow-2xl scale-125 transition-all duration-300" />
            {sinStock && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-lg uppercase tracking-wider shadow-2xl border border-red-400">
                  Producto Agotado
                </span>
              </div>
            )}
          </div>
          
          {imagenesGaleria.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {imagenesGaleria.map((imgUrl, index) => (
                <div 
                  key={index} 
                  onClick={() => setImagenActiva(imgUrl)} 
                  className={`w-20 h-20 shrink-0 bg-black/40 rounded border p-2 flex items-center justify-center cursor-pointer transition animate-card-appear ${imagenActiva === imgUrl ? 'ring-2' : 'border-zinc-700 hover:border-zinc-500'}`}
                  style={imagenActiva === imgUrl ? { borderColor: 'var(--color-primary)', boxShadow: '0 0 10px rgba(255,255,255,0.1)' } : {}}
                >
                  <img src={imgUrl} alt={`Miniatura ${index + 1}`} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex flex-col justify-between space-y-6 animate-fade-in">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block">SKU: RDG-{producto.id || '01'}</span>
                <h2 className="text-3xl font-bold text-white mb-1">{producto.nombre}</h2>
              </div>
              <button onClick={toggleWishlist} className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-full transition cursor-pointer border border-zinc-700 shadow-lg" title={enWishlist ? "Quitar de favoritos" : "Añadir a favoritos"}>
                <Heart size={24} className={`${enWishlist ? 'fill-red-500 scale-110' : 'text-zinc-400'} transition-all duration-300`} style={enWishlist ? { color: 'var(--color-primary)' } : {}} />
              </button>
            </div>
            
            <div className="flex items-center gap-2 my-2 text-yellow-400">
              <div className="flex items-center"><Star size={16} className="fill-yellow-400" /><Star size={16} className="fill-yellow-400" /><Star size={16} className="fill-yellow-400" /><Star size={16} className="fill-yellow-400" /><Star size={16} className="fill-yellow-400" /></div>
              <span className="text-xs text-zinc-400 font-semibold">(4.9 / 58 opiniones)</span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{formatearCLP(limpiarMonto(producto.precio))}</p>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${!sinStock ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                {!sinStock ? `Stock disponible: ${stockDisponible} unidades` : 'Agotado'}
              </span>
            </div>

            <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded text-sm uppercase font-semibold inline-block mb-4">{categoriaProducto}</span>

            {Array.isArray(descripcionProcesada) ? (
              <ul className="text-zinc-300 space-y-1.5 list-disc pl-5 leading-relaxed text-sm">
                {descripcionProcesada.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            ) : (
              <p className="text-zinc-300 leading-relaxed text-sm">{descripcionProcesada}</p>
            )}

            <div className="mt-4 bg-zinc-800/40 p-4 rounded-lg border border-zinc-700 space-y-3">
              <p className="text-xs font-bold uppercase text-zinc-300 flex items-center gap-1.5"><MapPin size={16} style={{ color: 'var(--color-primary)' }} /> Consultar tiempo de entrega por Comuna</p>
              <form onSubmit={calcularEnvioComuna} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <select value={regionSeleccionadaIdx} onChange={e => { setRegionSeleccionadaIdx(Number(e.target.value)); setComunaSeleccionada(regionesChile[Number(e.target.value)].comunas[0]); }} className="w-full bg-zinc-900 border border-zinc-700 text-white rounded px-3 py-2 text-xs outline-none">
                    {regionesChile.map((r, i) => <option key={i} value={i}>{r.region}</option>)}
                  </select>
                  <select value={comunaSeleccionada} onChange={e => setComunaSeleccionada(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white rounded px-3 py-2 text-xs outline-none">
                    {regionesChile[regionSeleccionadaIdx].comunas.map((com, cIdx) => <option key={cIdx} value={com}>{com}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full bg-zinc-700 hover:bg-zinc-600 px-3 py-2.5 rounded text-xs font-bold text-white cursor-pointer transition">Calcular Envío</button>
              </form>
              {resultadoEnvio && (
                <div className="text-xs bg-zinc-900 p-3 rounded border border-zinc-700 space-y-1 animate-fade-in">
                  <p className="text-green-400 font-semibold">{resultadoEnvio.texto}</p>
                  <p className="text-zinc-400">Costo exacto: <strong className={resultadoEnvio.costo === "Envío Gratis" ? "text-green-400 font-bold" : "text-white"}>{resultadoEnvio.costo}</strong></p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mt-5">
              <span className="text-zinc-400 font-medium text-sm">Cantidad:</span>
              <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
                <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} disabled={cantidad <= 1} className="px-3 py-1 text-zinc-300 hover:bg-zinc-700 transition cursor-pointer font-bold disabled:opacity-30 disabled:cursor-not-allowed">-</button>
                <span className="px-4 py-1 font-bold text-white text-sm">{cantidad}</span>
                <button onClick={() => setCantidad(Math.min(stockDisponible, cantidad + 1))} disabled={cantidad >= stockDisponible} className="px-3 py-1 text-zinc-300 hover:bg-zinc-700 transition cursor-pointer font-bold disabled:opacity-30 disabled:cursor-not-allowed">+</button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button 
              onClick={handleAgregar} 
              disabled={sinStock}
              className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg border flex items-center justify-center gap-2 cursor-pointer ${sinStock ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed' : animandoBoton ? 'bg-green-600 border-green-500 text-white scale-[1.02]' : 'text-white'}`}
              style={!sinStock && !animandoBoton ? { backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' } : {}}
            >
              {sinStock ? <X size={20} /> : animandoBoton ? <Check size={20} /> : <ShoppingCart size={20} />}
              {sinStock ? 'Producto Agotado' : animandoBoton ? '¡Añadido al Carrito!' : 'Añadir al Carrito'}
            </button>
            <div className="flex items-center justify-center gap-2 text-zinc-400 text-xs">
              <ShieldCheck size={16} className="text-green-400" /> Compra 100% protegida y con garantía oficial.
            </div>
          </div>
        </div>
      </div>

      {mostrarModalAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-zinc-900 border rounded-2xl p-8 max-w-md w-full shadow-2xl relative text-white animate-scale-up" style={{ borderColor: 'var(--color-primary)' }}>
            <button onClick={() => setMostrarModalAuth(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition cursor-pointer">
              <X size={24} />
            </button>
            
            <h3 className="text-2xl font-bold mb-2 text-center">Inicia sesión</h3>
            <p className="text-zinc-400 text-sm text-center mb-6">Para guardar productos en tu lista de deseos y acceder a beneficios exclusivos, debes iniciar sesión.</p>
            
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