import React, { useState, useEffect } from 'react';
import { Search, Package, ArrowLeft, Truck, CheckCircle2, MapPin, ShieldAlert, Trash2, RefreshCcw, AlertTriangle, MessageSquare } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { formatearCLP } from '../utils';

export default function OrderTracking({ usuarioActivo, setVistaActual }) {
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [errorBusqueda, setErrorBusqueda] = useState('');

  // Modales
  const [modalAccion, setModalAccion] = useState({ isOpen: false, tipo: null }); 
  const [modalEliminar, setModalEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState('');

  // Formulario Devolución/Reembolso
  const [motivo, setMotivo] = useState('');
  const [detalles, setDetalles] = useState('');
  const [errorFormulario, setErrorFormulario] = useState('');

  const [pedidoEncontrado, setPedidoEncontrado] = useState(null);
  const [pedidosUsuario, setPedidosUsuario] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const fetchPedidos = async () => {
      setCargando(true);
      let historialBD = [];
      
      if (usuarioActivo?.email) {
        const { data } = await supabase.from('pedidos').select('*').eq('email', usuarioActivo.email).order('created_at', { ascending: false });
        if (data) {
          historialBD = data.filter(p => !p.ocultoParaUsuario);
          setPedidosUsuario(historialBD);
        }
      }

      const idGuardado = localStorage.getItem('redragon_orden_activa');
      if (idGuardado) {
        const { data: pedidoEspecifico } = await supabase.from('pedidos').select('*').eq('id', idGuardado).single();
        if (pedidoEspecifico) {
          setPedidoEncontrado(pedidoEspecifico);
        }
        localStorage.removeItem('redragon_orden_activa');
      }

      setCargando(false);
    };

    fetchPedidos();
  }, [usuarioActivo?.email]);

  const handleBuscarPedido = async (e) => {
    e.preventDefault();
    setErrorBusqueda('');
    const idLimpio = codigoBusqueda.trim().toUpperCase().replace('#', '');

    if (!idLimpio) return;
    setCargando(true);

    const { data, error } = await supabase.from('pedidos').select('*').eq('id', idLimpio).single();
    
    if (!error && data) {
      setPedidoEncontrado(data);
    } else {
      setErrorBusqueda('No se encontró ningún pedido con ese código en la base de datos.');
      setPedidoEncontrado(null);
    }
    setCargando(false);
  };

  const procesarAccionPedido = async (e) => {
    e.preventDefault();
    if (!motivo || !detalles) {
      setErrorFormulario('Por favor, completa el motivo y los detalles.');
      return;
    }

    const nuevoEstado = modalAccion.tipo === 'devolucion' ? 'Devolución Solicitada' : 'Reembolso Solicitado';
    
    const { error } = await supabase.from('pedidos').update({ 
      estado: nuevoEstado, 
      motivoExtra: motivo, 
      detallesExtra: detalles 
    }).eq('id', pedidoEncontrado.id);

    if (!error) {
      setPedidoEncontrado({ ...pedidoEncontrado, estado: nuevoEstado, motivoExtra: motivo, detallesExtra: detalles });
      setModalAccion({ isOpen: false, tipo: null });
      setMotivo('');
      setDetalles('');
      setErrorFormulario('');
    } else {
      setErrorFormulario('Hubo un error al procesar tu solicitud.');
    }
  };

  const handleRecibidoManual = async () => {
    const { error } = await supabase.from('pedidos').update({ estado: 'Recibido' }).eq('id', pedidoEncontrado.id);
    if (!error) {
      setPedidoEncontrado({ ...pedidoEncontrado, estado: 'Recibido' });
    }
  };

  // --- FUNCIÓN ELIMINAR REPARADA CON MANEJO DE ERRORES ---
  const handleEliminarPedido = async () => {
    setEliminando(true);
    setErrorEliminar('');

    const { error } = await supabase.from('pedidos').update({ ocultoParaUsuario: true }).eq('id', pedidoEncontrado.id);
    
    if (error) {
      console.error("Error al ocultar pedido:", error);
      setErrorEliminar('Error BD: Asegúrate de crear la columna "ocultoParaUsuario" (tipo boolean) en tu tabla "pedidos" en Supabase.');
      setEliminando(false);
    } else {
      setPedidosUsuario(pedidosUsuario.filter(p => p.id !== pedidoEncontrado.id));
      setModalEliminar(false);
      setPedidoEncontrado(null);
      setEliminando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 mt-8 animate-fade-in space-y-6 text-white relative">
      <button onClick={() => setVistaActual('profile')} className="flex items-center gap-2 font-bold transition cursor-pointer hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
        <ArrowLeft size={20} /> Volver a mi Perfil
      </button>

      <div className="bg-zinc-900 rounded-xl p-6 md:p-8 border border-zinc-800 shadow-2xl space-y-6 animate-scale-up relative min-h-[400px]">
        
        {cargando && (
          <div className="absolute inset-0 z-50 bg-zinc-900/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center">
            <span className="animate-spin w-10 h-10 border-4 border-zinc-700 border-t-white rounded-full mb-3" style={{ borderTopColor: 'var(--color-primary)' }}></span>
            <p className="font-bold text-sm">Consultando Base de Datos...</p>
          </div>
        )}

        <div className="border-b border-zinc-800 pb-4">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Package size={32} style={{ color: 'var(--color-primary)' }} /> Seguimiento de Pedidos
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            {usuarioActivo 
              ? `Hola, @${usuarioActivo.username}. Revisa tus pedidos recientes o busca cualquier orden por su ID.`
              : 'Ingresa el código o ID de tu pedido para consultar su estado en la base de datos.'}
          </p>
        </div>

        <form onSubmit={handleBuscarPedido} className="bg-zinc-800/40 p-4 rounded-xl border border-zinc-700/60 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Ingresa el ID del pedido (Ej. ORD-482910)"
              value={codigoBusqueda}
              onChange={e => setCodigoBusqueda(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-3 text-sm font-mono focus:outline-none"
              style={{ focusBorderColor: 'var(--color-primary)' }}
            />
          </div>
          <button type="submit" disabled={cargando} className="text-white px-6 py-3 rounded-lg font-bold text-sm transition cursor-pointer shadow-lg border disabled:opacity-50" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}>
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
              {pedidosUsuario.map((ord, idx) => (
                <div key={idx} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-card-appear hover:border-zinc-500 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base" style={{ color: 'var(--color-primary)' }}>#{ord.id}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${['Entregado', 'Recibido'].includes(ord.estado) ? 'bg-green-600/20 text-green-400' : 'bg-blue-600/20 text-blue-400'}`}>{ord.estado || 'Procesando'}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">Fecha de compra: {ord.fecha || new Date(ord.created_at).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => setPedidoEncontrado(ord)}
                    className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer shadow"
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-4 gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--color-primary)' }}>Detalles de la Orden</span>
                <h3 className="text-2xl font-bold text-white font-mono mt-1">#{pedidoEncontrado.id}</h3>
                {pedidoEncontrado.ocultoParaUsuario && <span className="text-[10px] bg-red-950 text-red-500 border border-red-900 px-2 py-1 rounded ml-2 uppercase">Eliminado de la vista principal</span>}
              </div>
              <div className="flex gap-2">
                {usuarioActivo && !pedidoEncontrado.ocultoParaUsuario && (
                  <button onClick={() => setModalEliminar(true)} className="text-xs bg-red-950/50 hover:bg-red-900/80 text-red-400 px-3 py-2 rounded-lg transition cursor-pointer font-bold border border-red-900/50 flex items-center gap-1">
                    <Trash2 size={14}/> Eliminar Pedido
                  </button>
                )}
                <button onClick={() => setPedidoEncontrado(null)} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-lg transition cursor-pointer font-bold">
                  ← Volver
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
              <div className="bg-zinc-900 p-4 rounded-lg border border-green-500/30 flex items-center gap-3">
                <CheckCircle2 className="text-green-500 shrink-0" size={24} />
                <div><p className="text-xs text-zinc-400">Paso 1</p><p className="text-sm font-bold text-white">Pago Aprobado</p></div>
              </div>
              <div className="bg-zinc-900 p-4 rounded-lg border border-green-500/30 flex items-center gap-3">
                <CheckCircle2 className="text-green-500 shrink-0" size={24} />
                <div><p className="text-xs text-zinc-400">Paso 2</p><p className="text-sm font-bold text-white">Empaquetado</p></div>
              </div>
              <div className={`bg-zinc-900 p-4 rounded-lg border flex items-center gap-3 ${['Entregado', 'Recibido'].includes(pedidoEncontrado.estado) ? 'border-green-500/30' : 'border-zinc-500'}`} style={!['Entregado', 'Recibido'].includes(pedidoEncontrado.estado) ? { borderColor: 'var(--color-primary)', backgroundColor: 'rgba(255,255,255,0.03)' } : {}}>
                {['Entregado', 'Recibido'].includes(pedidoEncontrado.estado) ? <CheckCircle2 className="text-green-500 shrink-0" size={24} /> : <Truck className="shrink-0 animate-pulse" size={24} style={{ color: 'var(--color-primary)' }} />}
                <div><p className="text-xs text-zinc-400">Paso 3</p><p className="text-sm font-bold text-white">En Ruta / Despacho</p></div>
              </div>
              <div className={`bg-zinc-900 p-4 rounded-lg border ${['Entregado', 'Recibido'].includes(pedidoEncontrado.estado) ? 'border-green-500/50 bg-green-950/10' : 'border-zinc-800 opacity-60'} flex items-center gap-3`}>
                <CheckCircle2 className={`${['Entregado', 'Recibido'].includes(pedidoEncontrado.estado) ? 'text-green-500' : 'text-zinc-500'} shrink-0`} size={24} />
                <div><p className="text-xs text-zinc-400">Paso 4</p><p className="text-sm font-bold text-white">{pedidoEncontrado.estado === 'Recibido' ? 'Recibido por Cliente' : 'Entregado'}</p></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 space-y-2">
                <p className="text-zinc-400 text-xs font-bold uppercase flex items-center gap-1.5"><MapPin size={14} style={{ color: 'var(--color-primary)' }} /> Datos de Entrega</p>
                <p className="text-zinc-300 text-xs truncate">Dirección: <strong className="text-white">{pedidoEncontrado.direccionEnvio || pedidoEncontrado.direccion_envio || 'Registrada en checkout'}</strong></p>
                <p className="text-zinc-300 text-xs pt-1">Estado en BD: <strong className="text-yellow-400 uppercase bg-yellow-900/20 px-2 py-0.5 rounded border border-yellow-700/50">{pedidoEncontrado.estado || 'Procesando'}</strong></p>
              </div>

              <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 space-y-2">
                <p className="text-zinc-400 text-xs font-bold uppercase">Resumen Financiero</p>
                <div className="flex justify-between text-zinc-300 text-xs"><span>Subtotal:</span><span>{formatearCLP(pedidoEncontrado.subtotal || pedidoEncontrado.total)}</span></div>
                {pedidoEncontrado.descuento > 0 && <div className="flex justify-between text-green-400 text-xs"><span>Descuento:</span><span>-{formatearCLP(pedidoEncontrado.descuento)}</span></div>}
                <div className="flex justify-between text-zinc-300 text-xs border-b border-zinc-800 pb-2 mb-2"><span>Envío:</span><span>{pedidoEncontrado.envio === 0 ? 'Gratis' : formatearCLP(pedidoEncontrado.envio)}</span></div>
                <div className="flex justify-between text-white font-bold pt-1"><span>Total:</span><span style={{ color: 'var(--color-primary)' }}>{formatearCLP(pedidoEncontrado.total)}</span></div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-zinc-800">
              {!['Entregado', 'Recibido', 'Devolución Solicitada', 'Reembolso Solicitado'].includes(pedidoEncontrado.estado) && (
                <>
                  <button onClick={() => setModalAccion({ isOpen: true, tipo: 'reembolso' })} className="px-4 py-2.5 bg-zinc-800 hover:bg-yellow-950/40 text-yellow-500 rounded-lg text-xs font-bold transition cursor-pointer border border-yellow-600/30 flex items-center gap-2">
                    <RefreshCcw size={14} /> Solicitar Reembolso
                  </button>
                  <button onClick={handleRecibidoManual} className="px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-lg flex items-center gap-2">
                    <CheckCircle2 size={16}/> Ya lo recibí
                  </button>
                </>
              )}

              {['Entregado', 'Recibido'].includes(pedidoEncontrado.estado) && (
                <button onClick={() => setModalAccion({ isOpen: true, tipo: 'devolucion' })} className="px-4 py-2.5 bg-zinc-800 hover:bg-blue-950/40 text-blue-400 rounded-lg text-xs font-bold transition cursor-pointer border border-blue-600/30 flex items-center gap-2">
                  <RefreshCcw size={14} /> Solicitar Devolución
                </button>
              )}

              {['Devolución Solicitada', 'Reembolso Solicitado'].includes(pedidoEncontrado.estado) && (
                <div className="bg-blue-950/40 border border-blue-800/50 text-blue-300 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2">
                  <MessageSquare size={16}/> {pedidoEncontrado.estado} - En revisión
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider">Productos en este pedido:</h4>
              <div className="space-y-2">
                {pedidoEncontrado.productos?.map((prod, pIdx) => (
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

        {/* MODAL ACCIÓN (Devolución/Reembolso) */}
        {modalAccion.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-zinc-900 border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-scale-up" style={{ borderColor: 'var(--color-primary)' }}>
              <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
                <RefreshCcw size={20} className={modalAccion.tipo === 'devolucion' ? 'text-blue-500' : 'text-yellow-500'} /> 
                {modalAccion.tipo === 'devolucion' ? 'Solicitud de Devolución' : 'Solicitud de Reembolso'}
              </h3>
              
              <div className="text-xs text-zinc-400 space-y-2 bg-zinc-950/50 p-4 rounded-lg border border-zinc-800">
                <p>Para procesar tu solicitud para la orden <strong className="text-white">#{pedidoEncontrado?.id}</strong>, necesitamos los siguientes detalles:</p>
              </div>

              {errorFormulario && <div className="text-red-400 text-xs font-bold bg-red-950/40 p-2 rounded">{errorFormulario}</div>}

              <form onSubmit={procesarAccionPedido} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Motivo principal</label>
                  <select value={motivo} onChange={e => setMotivo(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-3 text-sm outline-none">
                    <option value="">Selecciona un motivo...</option>
                    <option value="defecto">Producto con defecto de fábrica</option>
                    <option value="equivocado">Me llegó un producto equivocado</option>
                    <option value="arrepentimiento">Me arrepentí de la compra</option>
                    {modalAccion.tipo === 'reembolso' && <option value="demora">El envío está tardando demasiado</option>}
                    <option value="otro">Otro motivo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Detalles adicionales</label>
                  <textarea 
                    value={detalles} 
                    onChange={e => setDetalles(e.target.value)} 
                    placeholder="Explica brevemente la situación para agilizar el proceso..."
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-3 text-sm h-24 outline-none resize-none"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setModalAccion({ isOpen: false, tipo: null }); setErrorFormulario(''); }} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-bold text-sm cursor-pointer">Cancelar</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-lg font-bold text-sm transition cursor-pointer shadow-lg text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
                    Enviar Solicitud
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL ELIMINAR ACTUALIZADO CON ERRORES Y CARGA */}
        {modalEliminar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-zinc-900 border border-red-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-5 animate-scale-up text-center">
              <div className="w-16 h-16 bg-red-950/50 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-900/50">
                <AlertTriangle size={30} />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-2">¿Eliminar este pedido?</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">Estás a punto de ocultar este pedido de tu lista. <strong>Esta acción es irreversible desde tu cuenta.</strong></p>
                <p className="text-xs text-zinc-500 mt-2">Nota: El pedido seguirá existiendo en nuestra base de datos general por temas legales.</p>
              </div>

              {/* ¡AQUÍ APARECERÁ EL ERROR SI FALTA LA COLUMNA EN SUPABASE! */}
              {errorEliminar && (
                <div className="bg-red-950/80 border border-red-500 text-red-300 p-3 rounded-lg text-xs font-semibold text-left">
                  {errorEliminar}
                </div>
              )}

              <div className="flex gap-3 pt-2 border-t border-zinc-800">
                <button 
                  onClick={() => { setModalEliminar(false); setErrorEliminar(''); }} 
                  disabled={eliminando}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold text-sm cursor-pointer transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleEliminarPedido} 
                  disabled={eliminando}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition cursor-pointer shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {eliminando ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> : <><Trash2 size={16}/> Sí, Eliminar</>}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}