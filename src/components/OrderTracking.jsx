import React, { useState, useEffect } from 'react';
import { Search, Package, ArrowLeft, Truck, CheckCircle2, MapPin, ShieldAlert } from 'lucide-react';
import { formatearCLP } from '../utils';

export default function OrderTracking({ usuarioActivo, setVistaActual }) {
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [errorBusqueda, setErrorBusqueda] = useState('');

  const [modalDevolucion, setModalDevolucion] = useState(false);
  const [aceptoTerminos, setAceptoTerminos] = useState(false);

  useEffect(() => {
    const historialGeneral = JSON.parse(localStorage.getItem('redragon_compras')) || [];
    const ahora = new Date().getTime();
    let huboCambios = false;

    const actualizado = historialGeneral.map(pedido => {
      if (pedido.estado === 'En Camino' && pedido.timestampEntrega && ahora >= pedido.timestampEntrega) {
        huboCambios = true;
        return { ...pedido, estado: 'Recibido' };
      }
      return pedido;
    });

    if (huboCambios) {
      localStorage.setItem('redragon_compras', JSON.stringify(actualizado));
    }
  }, []);

  const historialGeneral = JSON.parse(localStorage.getItem('redragon_compras')) || [];
  
  const [pedidoEncontrado, setPedidoEncontrado] = useState(() => {
    const idGuardado = localStorage.getItem('redragon_orden_activa');
    if (idGuardado) {
      localStorage.removeItem('redragon_orden_activa');
      return historialGeneral.find(p => String(p.id) === String(idGuardado)) || null;
    }
    return null;
  });

  const pedidosUsuario = usuarioActivo ? historialGeneral.filter(p => p.email === usuarioActivo.email) : [];

  const handleBuscarPedido = (e) => {
    e.preventDefault();
    setErrorBusqueda('');
    const idLimpio = codigoBusqueda.trim().toUpperCase().replace('#', '');

    if (!idLimpio) return;

    const encontrado = historialGeneral.find(p => 
      p.id.toUpperCase() === idLimpio || 
      p.id.toUpperCase().replace('ORD-', '') === idLimpio
    );
    
    if (encontrado) {
      setPedidoEncontrado(encontrado);
    } else {
      setErrorBusqueda('No se encontró ningún pedido con ese código. Verifica e intenta nuevamente.');
      setPedidoEncontrado(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 mt-8 animate-fade-in space-y-6 text-white">
      <button onClick={() => setVistaActual('home')} className="flex items-center gap-2 font-bold transition cursor-pointer hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
        <ArrowLeft size={20} /> Volver a la tienda
      </button>

      <div className="bg-zinc-900 rounded-xl p-6 md:p-8 border border-zinc-800 shadow-2xl space-y-6 animate-scale-up">
        <div className="border-b border-zinc-800 pb-4">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Package size={32} style={{ color: 'var(--color-primary)' }} /> Seguimiento de Pedidos
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            {usuarioActivo 
              ? `Hola, @${usuarioActivo.username}. Aquí tienes tus pedidos recientes o puedes buscar cualquier orden por su código.`
              : 'Ingresa el código o ID de tu pedido para consultar su estado en tiempo real.'}
          </p>
        </div>

        <form onSubmit={handleBuscarPedido} className="bg-zinc-800/40 p-4 rounded-xl border border-zinc-700/60 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Ingresa el ID del pedido (Ej. 482910 u ORD-482910)"
              value={codigoBusqueda}
              onChange={e => setCodigoBusqueda(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-3 text-sm font-mono focus:outline-none"
              style={{ focusBorderColor: 'var(--color-primary)' }}
            />
          </div>
          <button type="submit" className="text-white px-6 py-3 rounded-lg font-bold text-sm transition cursor-pointer shadow-lg border" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}>
            Buscar Orden
          </button>
        </form>

        {errorBusqueda && (
          <div className="bg-red-950/80 border border-red-500 text-red-300 p-4 rounded-lg text-sm flex items-center gap-2 animate-fade-in">
            <ShieldAlert size={18} /> {errorBusqueda}
          </div>
        )}

        {!pedidoEncontrado && usuarioActivo && pedidosUsuario.length > 0 && (
          <div className="space-y-4 pt-2 animate-fade-in">
            <h3 className="text-lg font-bold text-white">Tus pedidos recientes:</h3>
            <div className="grid grid-cols-1 gap-4">
              {pedidosUsuario.slice().reverse().map((ord, idx) => (
                <div key={idx} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-card-appear">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base" style={{ color: 'var(--color-primary)' }}>#{ord.id}</span>
                      <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded font-bold">{ord.estado || 'En Camino'}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">Fecha de compra: {ord.fecha}</p>
                  </div>
                  <button 
                    onClick={() => setPedidoEncontrado(ord)}
                    className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer shadow"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                  >
                    Ver Detalles Completos
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {pedidoEncontrado && (
          <div className="bg-zinc-950/60 border rounded-xl p-6 space-y-6 animate-scale-up" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-4 gap-2">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--color-primary)' }}>Detalles del Envío</span>
                <h3 className="text-2xl font-bold text-white font-mono mt-1">Orden #{pedidoEncontrado.id}</h3>
              </div>
              <button 
                onClick={() => setPedidoEncontrado(null)}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition cursor-pointer font-bold"
              >
                ← Volver a la búsqueda
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
              <div className="bg-zinc-900 p-4 rounded-lg border border-green-500/30 flex items-center gap-3 animate-card-appear">
                <CheckCircle2 className="text-green-500 shrink-0" size={24} />
                <div><p className="text-xs text-zinc-400">Paso 1</p><p className="text-sm font-bold text-white">Pago Aprobado</p></div>
              </div>
              <div className="bg-zinc-900 p-4 rounded-lg border border-green-500/30 flex items-center gap-3 animate-card-appear">
                <CheckCircle2 className="text-green-500 shrink-0" size={24} />
                <div><p className="text-xs text-zinc-400">Paso 2</p><p className="text-sm font-bold text-white">Empaquetado</p></div>
              </div>
              <div className="bg-zinc-900 p-4 rounded-lg border flex items-center gap-3 animate-card-appear" style={{ borderColor: 'var(--color-primary)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <Truck className="shrink-0 animate-pulse" size={24} style={{ color: 'var(--color-primary)' }} />
                <div><p className="text-xs" style={{ color: 'var(--color-primary)' }}>Paso 3 (Actual)</p><p className="text-sm font-bold text-white">{pedidoEncontrado.estado === 'Entregado' || pedidoEncontrado.estado === 'Recibido' ? 'Entregado' : 'En Ruta / Despacho'}</p></div>
              </div>
              <div className={`bg-zinc-900 p-4 rounded-lg border ${pedidoEncontrado.estado === 'Entregado' || pedidoEncontrado.estado === 'Recibido' ? 'border-green-500/50 bg-green-950/10' : 'border-zinc-800 opacity-60'} flex items-center gap-3 animate-card-appear`}>
                <CheckCircle2 className={`${pedidoEncontrado.estado === 'Entregado' || pedidoEncontrado.estado === 'Recibido' ? 'text-green-500' : 'text-zinc-500'} shrink-0`} size={24} />
                <div><p className="text-xs text-zinc-400">Paso 4</p><p className="text-sm font-bold text-white">{pedidoEncontrado.estado === 'Entregado' || pedidoEncontrado.estado === 'Recibido' ? 'Recibido con Éxito' : 'Entregado'}</p></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 space-y-2">
                <p className="text-zinc-400 text-xs font-bold uppercase flex items-center gap-1.5"><MapPin size={14} style={{ color: 'var(--color-primary)' }} /> Datos de Entrega</p>
                <p className="text-zinc-300 text-xs">Courier: <strong className="text-white">BlueExpress / Starken Chile</strong></p>
                <p className="text-zinc-300 text-xs pt-1">Estado actual: <strong className="text-yellow-400 uppercase">{pedidoEncontrado.estado || 'En Camino'}</strong></p>
              </div>

              <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 space-y-2">
                <p className="text-zinc-400 text-xs font-bold uppercase">Resumen Financiero</p>
                <div className="flex justify-between text-zinc-300 text-xs"><span>Subtotal:</span><span>{formatearCLP(pedidoEncontrado.subtotal || pedidoEncontrado.total)}</span></div>
                {pedidoEncontrado.descuento > 0 && <div className="flex justify-between text-green-400 text-xs"><span>Descuento:</span><span>-{formatearCLP(pedidoEncontrado.descuento)}</span></div>}
                <div className="flex justify-between text-zinc-300 text-xs border-b border-zinc-800 pb-2 mb-2"><span>Envío:</span><span>{pedidoEncontrado.envio === 0 ? 'Gratis' : formatearCLP(pedidoEncontrado.envio)}</span></div>
                <div className="flex justify-between text-white font-bold pt-1"><span>Total:</span><span style={{ color: 'var(--color-primary)' }}>{formatearCLP(pedidoEncontrado.total)}</span></div>
              </div>
            </div>

            {/* BOTÓN CONFIRMAR RECEPCIÓN AQUÍ */}
            <div className="flex justify-end gap-3 pt-2">
              {pedidoEncontrado.estado !== 'Entregado' && pedidoEncontrado.estado !== 'Recibido' && (
                <button onClick={() => {
                  const general = JSON.parse(localStorage.getItem('redragon_compras')) || [];
                  const actualizado = general.map(p => p.id === pedidoEncontrado.id ? { ...p, estado: 'Recibido' } : p);
                  localStorage.setItem('redragon_compras', JSON.stringify(actualizado));
                  setPedidoEncontrado({ ...pedidoEncontrado, estado: 'Recibido' });
                }} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1">
                  <CheckCircle2 size={14}/> Confirmar Recepción
                </button>
              )}
              {pedidoEncontrado.estado === 'Devolución Solicitada' ? (
                <button onClick={() => {
                  const general = JSON.parse(localStorage.getItem('redragon_compras')) || [];
                  const actualizado = general.map(p => p.id === pedidoEncontrado.id ? { ...p, estado: 'En Camino' } : p);
                  localStorage.setItem('redragon_compras', JSON.stringify(actualizado));
                  setPedidoEncontrado({ ...pedidoEncontrado, estado: 'En Camino' });
                }} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-red-400 rounded-lg text-xs font-bold transition cursor-pointer border border-red-600/30">
                  Cancelar Devolución
                </button>
              ) : (
                <button onClick={() => setModalDevolucion(true)} className="px-4 py-2 bg-zinc-800 hover:bg-yellow-950/40 text-yellow-500 rounded-lg text-xs font-bold transition cursor-pointer border border-yellow-600/30">
                  Solicitar Devolución
                </button>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider">Productos en este pedido:</h4>
              <div className="space-y-2">
                {pedidoEncontrado.productos.map((prod, pIdx) => (
                  <div key={pIdx} className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 flex justify-between items-center animate-card-appear">
                    <div className="flex items-center gap-3">
                      <img src={prod.imagen} alt={prod.nombre} className="w-12 h-12 object-contain bg-black/40 rounded p-1" />
                      <div>
                        <p className="text-white font-bold text-sm">{prod.nombre}</p>
                        <p className="text-xs text-zinc-400">Cantidad: {prod.cantidad || 1}</p>
                      </div>
                    </div>
                    <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>{formatearCLP(prod.precio * (prod.cantidad || 1))}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {modalDevolucion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-zinc-900 border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-scale-up" style={{ borderColor: 'var(--color-primary)' }}>
              <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2"><span className="text-yellow-500">⚠️</span> Devolución de Pedido</h3>
              <div className="text-xs text-zinc-400 space-y-2 bg-zinc-950/50 p-4 rounded-lg border border-zinc-800">
                <p>Al solicitar la devolución para la <strong className="text-white">Orden #{pedidoEncontrado?.id}</strong>, aceptas las condiciones:</p>
                <ul className="list-disc pl-4 space-y-1"><li>El producto debe estar en su empaque original.</li><li>La revisión toma de 3 a 5 días hábiles.</li></ul>
              </div>
              <div className="flex items-start gap-3 pt-2">
                <input type="checkbox" id="aceptoTerm" checked={aceptoTerminos} onChange={e => setAceptoTerminos(e.target.checked)} className="mt-1 w-4 h-4 cursor-pointer accent-red-600" />
                <label htmlFor="aceptoTerm" className="text-xs text-zinc-300 cursor-pointer">He leído y acepto los términos de devolución.</label>
              </div>
              <div className="flex gap-3 pt-4 border-t border-zinc-800">
                <button onClick={() => { setModalDevolucion(false); setAceptoTerminos(false); }} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-bold text-sm cursor-pointer">Cancelar</button>
                <button disabled={!aceptoTerminos} onClick={() => {
                  const general = JSON.parse(localStorage.getItem('redragon_compras')) || [];
                  const actualizado = general.map(p => p.id === pedidoEncontrado.id ? { ...p, estado: 'Devolución Solicitada' } : p);
                  localStorage.setItem('redragon_compras', JSON.stringify(actualizado));
                  setPedidoEncontrado({ ...pedidoEncontrado, estado: 'Devolución Solicitada' });
                  setModalDevolucion(false);
                  setAceptoTerminos(false);
                }} className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition cursor-pointer shadow-lg text-white ${aceptoTerminos ? '' : 'bg-zinc-800 text-zinc-600'}`} style={aceptoTerminos ? { backgroundColor: 'var(--color-primary)' } : {}}>{aceptoTerminos ? 'Confirmar Solicitud' : 'Acepta términos'}</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}