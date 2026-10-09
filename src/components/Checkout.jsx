import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, MapPin, Tag, CheckCircle, Package, Home, Lock } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { formatearCLP, formatearRutInput, regionesChile } from '../utils';

const limpiarMonto = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return Number(String(val).replace(/[^0-9]/g, '')) || 0;
};

const obtenerEnvioReal = (valorOriginal) => {
  let num = limpiarMonto(valorOriginal);
  if (num >= 1000) {
    num = num / 1000;
  }
  return num;
};

export default function Checkout({ carrito = [], total, usuarioActivo, setUsuarioActivo, setVistaActual, vaciarCarrito }) {
  const [pasoActual, setPasoActual] = useState(1);
  const [procesando, setProcesando] = useState(false);
  const [errorPago, setErrorPago] = useState('');
  const [compraExitosaDatos, setCompraExitosaDatos] = useState(null);
  
  const [direccionSeleccionadaIdx, setDireccionSeleccionadaIdx] = useState(-1);

  const [nombreNuevaDir, setNombreNuevaDir] = useState('');
  const [calleNuevaDir, setCalleNuevaDir] = useState('');
  const [regionIdx, setRegionIdx] = useState(6);
  const [comunaSeleccionada, setComunaSeleccionada] = useState(regionesChile[6].comunas[0]);
  const [rutDir, setRutDir] = useState('');
  const [telefonoDir, setTelefonoDir] = useState(''); 
  const [observacionNuevaDir, setObservacionNuevaDir] = useState('');
  const [guardarDireccionPerfil, setGuardarDireccionPerfil] = useState(true);

  const [metodoPago, setMetodoPago] = useState('nueva');
  const [tarjetaSeleccionadaIdx, setTarjetaSeleccionadaIdx] = useState(0);
  const [cvvConfirmacion, setCvvConfirmacion] = useState('');
  
  const [nuevaTarjetaNum, setNuevaTarjetaNum] = useState('');
  const [nuevaTarjetaTit, setNuevaTarjetaTit] = useState('');
  const [nuevaTarjetaExp, setNuevaTarjetaExp] = useState('');
  const [nuevaTarjetaCvv, setNuevaTarjetaCvv] = useState('');
  const [guardarNuevaTarjeta, setGuardarNuevaTarjeta] = useState(true);

  const [codigoPromoInput, setCodigoPromoInput] = useState('');
  const [descuentoAplicado, setDescuentoAplicado] = useState(0);
  const [envioGratisPorPromo, setEnvioGratisPorPromo] = useState(false);
  const [codigoActivoUsado, setCodigoActivoUsado] = useState('');
  const [mensajePromo, setMensajePromo] = useState('');
  const [cuponActivoDB, setCuponActivoDB] = useState(null);

  // Sincronización automática con Supabase al cargar el Checkout
  useEffect(() => {
    const fetchUserData = async () => {
      if (!usuarioActivo?.email) return;

      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', usuarioActivo.email)
        .single();

      if (userData) {
        const usuarioActualizado = {
          ...usuarioActivo,
          ...userData,
          direcciones: userData.direcciones || [],
          tarjetas: userData.tarjetas || []
        };
        setUsuarioActivo(usuarioActualizado);

        // Preseleccionar la primera dirección si existe
        if (userData.direcciones && userData.direcciones.length > 0) {
          setDireccionSeleccionadaIdx(0);
        }

        // Preseleccionar método de pago guardado si existen tarjetas
        if (userData.tarjetas && userData.tarjetas.length > 0) {
          setMetodoPago('guardada');
        }
      }
    };
    fetchUserData();
  }, [usuarioActivo?.email]);

  const manejarCambioNumeroTarjetaCheckout = (e) => {
    let valor = e.target.value.replace(/\D/g, '');
    valor = valor.substring(0, 16);
    valor = valor.replace(/(\d{4})(?=\d)/g, '$1 ');
    setNuevaTarjetaNum(valor);
  };

  const manejarCambioExpiracionCheckout = (e) => {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length >= 2) {
      let mes = valor.substring(0, 2);
      if (parseInt(mes, 10) > 12) mes = '12';
      if (parseInt(mes, 10) === 0) mes = '01';
      valor = mes + '/' + valor.substring(2, 4);
    }
    valor = valor.substring(0, 5);
    setNuevaTarjetaExp(valor);
  };

  const validarTarjetaNoVencida = (exp) => {
    if (!exp || exp.length < 5) return false;
    const [mesStr, anioStr] = exp.split('/');
    const mes = parseInt(mesStr, 10);
    const anio = parseInt('20' + anioStr, 10);

    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const anioActual = fechaActual.getFullYear();

    if (anio < anioActual) return false;
    if (anio === anioActual && mes < mesActual) return false;
    return true;
  };

  const subtotalCalculado = limpiarMonto(total) || carrito.reduce((acc, item) => acc + (limpiarMonto(item.precio) * (item.cantidad || 1)), 0);
  
  let montoDescuento = 0;
  if (descuentoAplicado < 1 && descuentoAplicado > 0) { 
    montoDescuento = Math.round(subtotalCalculado * descuentoAplicado);
  } else if (descuentoAplicado > 1) { 
    montoDescuento = descuentoAplicado; 
  }

  const costoEnvioBase = obtenerEnvioReal(regionesChile[regionIdx]?.costoEnvio || 0);
  const envio = (subtotalCalculado >= 60000 || subtotalCalculado >= 60 || envioGratisPorPromo) ? 0 : costoEnvioBase;
  const totalAPagar = subtotalCalculado - montoDescuento + envio;

  const aplicarPromo = async () => {
    if (!usuarioActivo) {
      setMensajePromo('Inicia sesión para usar códigos promocionales.');
      return;
    }

    const cod = codigoPromoInput.trim().toUpperCase();
    setMensajePromo('Verificando cupón...');

    try {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cod)
        .eq('is_active', true)
        .single();

      if (coupon) {
         const { data: alreadyUsed } = await supabase
          .from('user_coupons_used')
          .select('*')
          .eq('user_id', usuarioActivo.id)
          .eq('coupon_id', coupon.id)
          .single();

         if (alreadyUsed) {
           setMensajePromo('Ya has utilizado este cupón antes.');
           setDescuentoAplicado(0);
           setEnvioGratisPorPromo(false);
           setCuponActivoDB(null);
           return;
         }

         if (coupon.discount_percentage > 0) {
             setDescuentoAplicado(coupon.discount_percentage / 100);
         } else if (coupon.discount_amount > 0) {
             setDescuentoAplicado(coupon.discount_amount);
         }
         
         setEnvioGratisPorPromo(false); 
         setCuponActivoDB(coupon);
         setMensajePromo('¡Cupón aplicado con éxito!');
         return; 
      }
    } catch (err) {
        console.error("Error al verificar cupón en BD", err);
    }
    
    const codigosUsadosUsuario = usuarioActivo.codigosUsados || [];

    if (codigosUsadosUsuario.includes(cod)) {
      setMensajePromo('Ya has utilizado este código promocional en tu cuenta.');
      setDescuentoAplicado(0);
      setEnvioGratisPorPromo(false);
      return;
    }

    if (cod === 'REDRAGON2026') { 
      setDescuentoAplicado(0.10); 
      setEnvioGratisPorPromo(false);
      setCodigoActivoUsado('REDRAGON2026');
      setMensajePromo('¡10% OFF Aplicado!'); 
      setCuponActivoDB(null);
    } else if (cod === 'ZIGZAG') { 
      setDescuentoAplicado(0.25); 
      setEnvioGratisPorPromo(true);
      setCodigoActivoUsado('ZIGZAG');
      setMensajePromo('¡25% OFF + Envío Gratis Aplicado!'); 
      setCuponActivoDB(null);
    } else { 
      setDescuentoAplicado(0); 
      setEnvioGratisPorPromo(false);
      setCodigoActivoUsado('');
      setCuponActivoDB(null);
      setMensajePromo('El código ingresado no es válido o caducó.'); 
    }
  };

  const handleProcederPago = () => {
    if (direccionSeleccionadaIdx === -1) {
      if (calleNuevaDir.trim() && rutDir.trim() && telefonoDir.trim() && telefonoDir.length === 9) {
        const nuevaDirObj = {
          nombre: nombreNuevaDir.trim() || 'Mi Dirección',
          calle: calleNuevaDir.trim(),
          comuna: comunaSeleccionada,
          region: regionesChile[regionIdx].region,
          rut: rutDir.trim(),
          telefono: '+56' + telefonoDir.trim(),
          observacion: observacionNuevaDir.trim()
        };
        let nuevasDirecciones = [...(usuarioActivo?.direcciones || [])];
        nuevasDirecciones.push(nuevaDirObj);
        
        if (guardarDireccionPerfil && usuarioActivo) {
          const usuarioActualizado = { ...usuarioActivo, direcciones: nuevasDirecciones };
          setUsuarioActivo(usuarioActualizado);
          localStorage.setItem('redragon_sesion_activa', JSON.stringify(usuarioActualizado));
          
          supabase.from('profiles').update({ direcciones: nuevasDirecciones }).eq('email', usuarioActivo.email).then();
        }
        setDireccionSeleccionadaIdx(nuevasDirecciones.length - 1);
      } else {
        setErrorPago("Por favor, completa todos los campos de la dirección, incluyendo el teléfono válido de 9 dígitos.");
        return;
      }
    }
    setErrorPago('');
    setPasoActual(2);
  };

  const handlePagarFinal = async (e) => {
    e.preventDefault();
    setErrorPago('');

    if (metodoPago === 'guardada') {
      if (!cvvConfirmacion || cvvConfirmacion.length < 3) {
        setErrorPago('Debes ingresar el CVV de tu tarjeta para validar la compra.');
        return;
      }
    } else {
      if (!nuevaTarjetaNum || !nuevaTarjetaTit || !nuevaTarjetaExp || !nuevaTarjetaCvv) {
        setErrorPago('Completa todos los datos de la nueva tarjeta.');
        return;
      }
      if (!validarTarjetaNoVencida(nuevaTarjetaExp)) {
        setErrorPago('La tarjeta ingresada está vencida. Por favor, ingresa una tarjeta vigente.');
        return;
      }
    }

    setProcesando(true);

    try {
      const idOrdenNum = Math.floor(100000 + Math.random() * 900000);
      const idOrdenStr = `ORD-${idOrdenNum}`;

      const dirActual = usuarioActivo?.direcciones?.[direccionSeleccionadaIdx] || {
        calle: calleNuevaDir,
        comuna: comunaSeleccionada,
        region: regionesChile[regionIdx].region,
        rut: rutDir,
        telefono: '+56' + telefonoDir
      };

      let infoTarjetaUsada = '';
      if (metodoPago === 'guardada' && usuarioActivo?.tarjetas?.[tarjetaSeleccionadaIdx]) {
        const tGuardada = usuarioActivo.tarjetas[tarjetaSeleccionadaIdx];
        const ultimos4 = String(tGuardada.numero).slice(-4);
        infoTarjetaUsada = `•••• •••• •••• ${ultimos4} (${tGuardada.titular})`;
      } else {
        const ultimos4Nueva = String(nuevaTarjetaNum).slice(-4);
        infoTarjetaUsada = `•••• •••• •••• ${ultimos4Nueva} (${nuevaTarjetaTit})`;
      }

      await supabase
        .from('pedidos')
        .insert([
          {
            id: idOrdenStr,
            user_id: usuarioActivo?.id || null,
            email: usuarioActivo?.email || 'invitado@redragon.cl',
            fecha: new Date().toLocaleDateString(),
            productos: carrito,
            subtotal: subtotalCalculado,
            descuento: montoDescuento,
            envio: envio,
            total: totalAPagar,
            estado: 'Procesando',
            direccion_envio: `${dirActual.calle}, ${dirActual.comuna}, ${dirActual.region}`
          }
        ]);

      await Promise.all(carrito.map(async (item) => {
        const cantidadComprada = item.cantidad || 1;
        const { data: productoDB } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .single();

        if (productoDB) {
          const nuevoStock = productoDB.stock - cantidadComprada;
          await supabase
            .from('products')
            .update({ stock: nuevoStock >= 0 ? nuevoStock : 0 })
            .eq('id', item.id);
        }
      }));
      
      if (cuponActivoDB && usuarioActivo) {
          await supabase
            .from('user_coupons_used')
            .insert([{ user_id: usuarioActivo.id, coupon_id: cuponActivoDB.id }]);
      }

      const comprasExistentes = JSON.parse(localStorage.getItem('redragon_compras')) || [];
      const nuevaCompra = {
        id: idOrdenStr,
        email: usuarioActivo?.email || 'invitado@redragon.cl',
        fecha: new Date().toLocaleDateString(),
        productos: [...carrito],
        subtotal: subtotalCalculado,
        descuento: montoDescuento,
        envio: envio,
        total: totalAPagar,
        estado: 'Procesando',
        rut: dirActual.rut || rutDir,
        telefono: dirActual.telefono || ('+56' + telefonoDir),
        tarjetaUsada: infoTarjetaUsada
      };

      localStorage.setItem('redragon_compras', JSON.stringify([...comprasExistentes, nuevaCompra]));

      let codigosUsadosActualizados = usuarioActivo?.codigosUsados || [];
      if (codigoActivoUsado && !codigosUsadosActualizados.includes(codigoActivoUsado)) {
        codigosUsadosActualizados.push(codigoActivoUsado);
      }

      if (metodoPago === 'nueva' && guardarNuevaTarjeta && usuarioActivo) {
        const tarjetaObjeto = { numero: nuevaTarjetaNum, titular: nuevaTarjetaTit, expiracion: nuevaTarjetaExp, cvv: nuevaTarjetaCvv };
        const todasTarjetas = usuarioActivo.tarjetas || [];
        const nuevasTarjetas = [...todasTarjetas, tarjetaObjeto];
        const usuarioActualizado = { ...usuarioActivo, tarjetas: nuevasTarjetas, codigosUsados: codigosUsadosActualizados };
        setUsuarioActivo(usuarioActualizado);
        localStorage.setItem('redragon_sesion_activa', JSON.stringify(usuarioActualizado));
        
        supabase.from('profiles').update({ tarjetas: nuevasTarjetas, codigosUsados: codigosUsadosActualizados }).eq('email', usuarioActivo.email).then();
      } else if (usuarioActivo) {
        const usuarioActualizado = { ...usuarioActivo, codigosUsados: codigosUsadosActualizados };
        setUsuarioActivo(usuarioActualizado);
        localStorage.setItem('redragon_sesion_activa', JSON.stringify(usuarioActualizado));
      }

      setProcesando(false);
      if (typeof vaciarCarrito === 'function') vaciarCarrito();
      setCompraExitosaDatos(nuevaCompra);

    } catch (err) {
      console.error(err);
      setErrorPago('Ocurrió un error al procesar el pago.');
      setProcesando(false);
    }
  };

  if (compraExitosaDatos) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-12 bg-zinc-950 border rounded-2xl shadow-2xl text-white text-center space-y-6 animate-scale-up" style={{ borderColor: 'var(--color-primary)' }}>
        <div className="w-20 h-20 border rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}>
          <CheckCircle size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">¡Compra Realizada con Éxito!</h2>
          <p className="text-sm text-zinc-400">Tu orden <strong className="font-mono" style={{ color: 'var(--color-primary)' }}>#{compraExitosaDatos.id}</strong> ha sido guardada en la base de datos.</p>
        </div>
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 text-left space-y-3 animate-fade-in">
          <div className="flex justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Fecha: {compraExitosaDatos.fecha}</span>
            <span className="text-green-400 font-bold uppercase">{compraExitosaDatos.estado}</span>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {compraExitosaDatos.productos.map((prod, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs text-zinc-300">
                <span className="flex items-center gap-2"><img src={prod.imagen} className="w-8 h-8 object-contain bg-black/40 rounded p-0.5" /> {prod.nombre} (x{prod.cantidad || 1})</span>
                <span className="font-semibold">{formatearCLP(limpiarMonto(prod.precio) * (prod.cantidad || 1))}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-base font-bold border-t border-zinc-800 pt-3">
            <span>Total Pagado:</span>
            <span style={{ color: 'var(--color-primary)' }}>{formatearCLP(compraExitosaDatos.total)}</span>
          </div>
        </div>
        <div className="flex gap-4 pt-2">
          <button onClick={() => setVistaActual('orders')} className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2">
            <Package size={18} /> Ver Mis Pedidos
          </button>
          <button onClick={() => setVistaActual('home')} className="flex-1 text-white py-3 rounded-xl font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow" style={{ backgroundColor: 'var(--color-primary)' }}>
            <Home size={18} /> Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 mt-8 relative animate-fade-in text-white">
      <button onClick={() => pasoActual === 2 ? setPasoActual(1) : setVistaActual('cart')} className="flex items-center gap-2 mb-6 transition cursor-pointer font-bold hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
        <ArrowLeft size={20} /> {pasoActual === 2 ? 'Volver al Paso Anterior' : 'Volver al Carrito'}
      </button>

      {pasoActual === 1 && (
        <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 shadow-2xl space-y-6 animate-scale-up">
          <h2 className="text-2xl font-bold border-b border-zinc-800 pb-4 flex items-center gap-3">
            <MapPin style={{ color: 'var(--color-primary)' }} /> Dirección de Envío <span className="text-sm text-zinc-500 ml-auto font-normal">Paso 1 de 2</span>
          </h2>

          {usuarioActivo?.direcciones && usuarioActivo.direcciones.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-zinc-400 uppercase">Direcciones Guardadas</p>
              {usuarioActivo.direcciones.map((dir, idx) => (
                <div 
                  key={idx} 
                  onClick={() => { setDireccionSeleccionadaIdx(idx); setCalleNuevaDir(''); }} 
                  className={`p-4 rounded-lg border cursor-pointer transition flex items-start gap-4 animate-card-appear ${direccionSeleccionadaIdx === idx ? 'bg-red-950/20' : 'border-zinc-700 bg-zinc-800/40 hover:border-zinc-500'}`}
                  style={direccionSeleccionadaIdx === idx ? { borderColor: 'var(--color-primary)' } : {}}
                >
                  <div 
                    className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${direccionSeleccionadaIdx === idx ? '' : 'border-zinc-500'}`}
                    style={direccionSeleccionadaIdx === idx ? { borderColor: 'var(--color-primary)' } : {}}
                  >
                    {direccionSeleccionadaIdx === idx && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{dir.nombre || 'Dirección'} <span className="ml-2 text-[10px] bg-zinc-700 px-2 py-0.5 rounded uppercase">RUT: {dir.rut}</span> <span className="ml-2 text-[10px] bg-zinc-700 px-2 py-0.5 rounded uppercase">Tel: {dir.telefono || 'Sin tel'}</span></h4>
                    <p className="text-zinc-300 text-sm mt-1">{dir.calle}</p>
                    {dir.observacion && <p className="text-xs text-zinc-400 italic mt-0.5">Obs: {dir.observacion}</p>}
                    <p className="text-xs text-zinc-500">{dir.comuna}, {dir.region}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-zinc-800 space-y-4">
            <p className="text-xs font-bold uppercase" style={{ color: 'var(--color-primary)' }}>O Agregar Nueva Dirección</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select value={regionIdx} onChange={e => { setRegionIdx(Number(e.target.value)); setComunaSeleccionada(regionesChile[Number(e.target.value)].comunas[0]); setDireccionSeleccionadaIdx(-1); }} className="bg-zinc-800 border border-zinc-700 text-white rounded p-2.5 text-xs outline-none">
                {regionesChile.map((r, i) => (
                  <option key={i} value={i}>{r.region}</option>
                ))}
              </select>

              <select value={comunaSeleccionada} onChange={e => { setComunaSeleccionada(e.target.value); setDireccionSeleccionadaIdx(-1); }} className="bg-zinc-800 border border-zinc-700 text-white rounded p-2.5 text-xs outline-none">
                {regionesChile[regionIdx].comunas.map((com, cIdx) => <option key={cIdx} value={com}>{com}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" placeholder="Nombre (Ej: Casa)" value={nombreNuevaDir} onChange={e => { setNombreNuevaDir(e.target.value); setDireccionSeleccionadaIdx(-1); }} className="bg-zinc-800 border border-zinc-700 text-white rounded p-2.5 text-xs outline-none" />
              <input type="text" placeholder="Calle y número" value={calleNuevaDir} onChange={e => { setCalleNuevaDir(e.target.value); setDireccionSeleccionadaIdx(-1); }} className="bg-zinc-800 border border-zinc-700 text-white rounded p-2.5 text-xs outline-none" />
              <input type="text" placeholder="RUT (Ej: 12.345.678-9)" value={rutDir} onChange={e => { setRutDir(formatearRutInput(e.target.value)); setDireccionSeleccionadaIdx(-1); }} maxLength="12" className="bg-zinc-800 border border-zinc-700 text-white rounded p-2.5 text-xs outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded overflow-hidden">
                <span className="bg-zinc-900 px-3 py-2.5 text-xs text-zinc-400 font-mono border-r border-zinc-700">+56</span>
                <input 
                  type="text" 
                  placeholder="912345678" 
                  value={telefonoDir} 
                  onChange={e => {
                    const valor = e.target.value.replace(/\D/g, '').slice(0, 9);
                    setTelefonoDir(valor);
                    setDireccionSeleccionadaIdx(-1);
                  }} 
                  maxLength="9" 
                  className="w-full bg-zinc-800 text-white px-3 py-2.5 text-xs outline-none" 
                  required 
                />
              </div>

              <input type="text" placeholder="Observación / Referencia (Opcional)" value={observacionNuevaDir} onChange={e => { setObservacionNuevaDir(e.target.value); setDireccionSeleccionadaIdx(-1); }} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2.5 text-xs outline-none" />
            </div>

            {usuarioActivo ? (
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input type="checkbox" checked={guardarDireccionPerfil} onChange={e => setGuardarDireccionPerfil(e.target.checked)} />
                <span className="text-xs text-zinc-400">Guardar esta dirección en mi perfil</span>
              </label>
            ) : (
              <p className="text-[11px] text-yellow-500/80 flex items-center gap-1 pt-1"><Lock size={12}/> Inicia sesión para guardar esta dirección en tu cuenta.</p>
            )}
          </div>

          {errorPago && <p className="text-red-400 font-bold text-sm text-center pt-2">{errorPago}</p>}
          <div className="pt-4">
            <button onClick={handleProcederPago} className="w-full text-white py-3.5 rounded-lg font-bold shadow-lg transition text-lg cursor-pointer border" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}>Continuar al Pago</button>
          </div>
        </div>
      )}

      {pasoActual === 2 && (
        <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 shadow-2xl space-y-6 animate-scale-up">
          <h2 className="text-2xl font-bold border-b border-zinc-800 pb-4 flex items-center gap-3">
            <CreditCard style={{ color: 'var(--color-primary)' }} /> Método de Pago <span className="text-sm ml-auto font-normal" style={{ color: 'var(--color-primary)' }}>Paso 2 de 2</span>
          </h2>

          <form onSubmit={handlePagarFinal} className="space-y-6">
            <div className="bg-zinc-800/40 p-4 rounded-lg border border-zinc-700">
              <label className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-1.5 mb-2"><Tag size={14} style={{ color: 'var(--color-primary)' }}/> Código Promocional</label>
              {usuarioActivo ? (
                <div className="flex gap-2">
                  <input type="text" placeholder="EJ. ZIGZAG" value={codigoPromoInput} onChange={e => setCodigoPromoInput(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-700 text-white rounded px-3 py-2 text-sm outline-none" />
                  <button type="button" onClick={aplicarPromo} className="text-white px-4 py-2 rounded font-bold text-sm cursor-pointer border transition shadow" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}>Aplicar</button>
                </div>
              ) : (
                <div className="bg-zinc-900/80 p-3 rounded border border-zinc-700 text-xs text-yellow-500 flex items-center gap-2">
                  <Lock size={14} /> Inicia sesión para usar códigos promocionales.
                </div>
              )}
              {mensajePromo && <p className={`text-xs mt-2 font-bold ${descuentoAplicado > 0 ? 'text-green-400' : 'text-red-400'}`}>{mensajePromo}</p>}
            </div>

            <div className="space-y-4">
              {usuarioActivo?.tarjetas?.length > 0 && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={metodoPago === 'guardada'} onChange={() => setMetodoPago('guardada')} />
                    <span className="font-bold text-sm">Usar Tarjeta Guardada</span>
                  </label>
                  
                  {metodoPago === 'guardada' && (
                    <div className="pl-6 space-y-3 border-l-2 border-zinc-800 ml-2 animate-fade-in">
                      <select value={tarjetaSeleccionadaIdx} onChange={e => setTarjetaSeleccionadaIdx(Number(e.target.value))} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-3 text-sm outline-none">
                        {usuarioActivo.tarjetas.map((card, i) => {
                          const numStr = String(card.numero || '');
                          const ultimos4 = numStr.slice(-4);
                          return <option key={i} value={i}>•••• •••• •••• {ultimos4} - {card.titular}</option>;
                        })}
                      </select>
                      
                      <div className="flex flex-col gap-1 w-1/3">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase">Confirmar CVV</label>
                        <input type="password" required={metodoPago === 'guardada'} maxLength="4" placeholder="***" value={cvvConfirmacion} onChange={e => setCvvConfirmacion(e.target.value.replace(/\D/g, ''))} className="bg-zinc-900 border border-zinc-700 text-white rounded px-3 py-2 text-sm outline-none" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3 mt-4 pt-4 border-t border-zinc-800/50">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={metodoPago === 'nueva'} onChange={() => setMetodoPago('nueva')} />
                  <span className="font-bold text-sm">Ingresar Tarjeta Nueva</span>
                </label>

                {metodoPago === 'nueva' && (
                  <div className="pl-6 space-y-4 border-l-2 border-zinc-800 ml-2 animate-fade-in">
                    <div>
                      <label className="text-[10px] text-zinc-400 font-bold uppercase mb-1 block">Número de Tarjeta</label>
                      <input 
                        type="text" 
                        maxLength="19" 
                        required={metodoPago === 'nueva'} 
                        placeholder="4000 1234 5678 9010" 
                        value={nuevaTarjetaNum} 
                        onChange={manejarCambioNumeroTarjetaCheckout} 
                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded px-3 py-2.5 text-sm font-mono outline-none" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-zinc-400 font-bold uppercase mb-1 block">Titular</label>
                        <input type="text" required={metodoPago === 'nueva'} placeholder="Nombre" value={nuevaTarjetaTit} onChange={e => setNuevaTarjetaTit(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white rounded px-3 py-2.5 text-sm outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-zinc-400 font-bold uppercase mb-1 block">Exp.</label>
                          <input 
                            type="text" 
                            maxLength="5" 
                            required={metodoPago === 'nueva'} 
                            placeholder="MM/AA" 
                            value={nuevaTarjetaExp} 
                            onChange={manejarCambioExpiracionCheckout} 
                            className="w-full bg-zinc-900 border border-zinc-700 text-white rounded px-3 py-2.5 text-sm font-mono text-center outline-none" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-400 font-bold uppercase mb-1 block">CVV</label>
                          <input type="password" maxLength="4" required={metodoPago === 'nueva'} placeholder="123" value={nuevaTarjetaCvv} onChange={e => setNuevaTarjetaCvv(e.target.value.replace(/\D/g, ''))} className="w-full bg-zinc-900 border border-zinc-700 text-white rounded px-3 py-2.5 text-sm text-center outline-none" />
                        </div>
                      </div>
                    </div>
                    {usuarioActivo ? (
                      <label className="flex items-center gap-2 cursor-pointer mt-2">
                        <input type="checkbox" checked={guardarNuevaTarjeta} onChange={(e) => setGuardarNuevaTarjeta(e.target.checked)} />
                        <span className="text-xs text-zinc-400">Guardar esta tarjeta en mi cuenta</span>
                      </label>
                    ) : (
                      <p className="text-[11px] text-yellow-500/80 flex items-center gap-1 pt-1"><Lock size={12}/> Inicia sesión para guardar esta tarjeta en tu cuenta.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-zinc-950 p-6 rounded-lg border border-zinc-800 mt-6">
              <div className="flex justify-between text-sm text-zinc-400 mb-2"><span>Subtotal:</span><span>{formatearCLP(subtotalCalculado)}</span></div>
              {descuentoAplicado > 0 && (
                <div className="flex justify-between text-sm text-green-400 mb-2 font-bold border-b border-zinc-800 pb-2">
                  <span>Descuento Promo ({descuentoAplicado * 100}%):</span><span>-{formatearCLP(montoDescuento)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-zinc-400 mb-4 pb-4 border-b border-zinc-800 mt-2">
                <span>Envío:</span>
                <span className={envio === 0 ? "text-green-400 font-bold" : ""}>
                  {envio === 0 ? 'Gratis' : formatearCLP(envio)}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold items-center">
                <span>Total a Pagar:</span>
                <span style={{ color: 'var(--color-primary)' }}>{formatearCLP(totalAPagar)}</span>
              </div>
            </div>

            {errorPago && <div className="text-red-400 text-xs font-bold text-center bg-red-950/30 py-2 rounded border border-red-500/50">{errorPago}</div>}

            <button type="submit" disabled={procesando} className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg flex justify-center items-center gap-3 transition-all duration-300 cursor-pointer ${procesando ? 'bg-zinc-700 border-zinc-600 cursor-not-allowed' : 'bg-[#00b341] hover:bg-[#009b38] border border-[#009b38]'}`}>
              {procesando ? (
                <><div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> Guardando en Base de Datos...</>
              ) : (
                <><CheckCircle size={22} /> Pagar {formatearCLP(totalAPagar)}</>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}