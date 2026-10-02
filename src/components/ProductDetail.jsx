import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, Check, MapPin, Heart, CheckCircle2, Truck, User, UserCheck, X } from 'lucide-react';
import { formatearCLP } from '../utils';

const regionesChile = [
  { region: "Región de Arica y Parinacota", comunas: ["Arica", "Camarones", "Putre", "General Lagos"], costoEnvio: 8990 },
  { region: "Región de Tarapacá", comunas: ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"], costoEnvio: 8990 },
  { region: "Región de Antofagasta", comunas: ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"], costoEnvio: 6990 },
  { region: "Región de Atacama", comunas: ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"], costoEnvio: 6990 },
  { region: "Región de Coquimbo", comunas: ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paihuano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"], costoEnvio: 4990 },
  { region: "Región de Valparaíso", comunas: ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "San Esteban", "Rinconada", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Limache", "Quilpué", "Villa Alemana", "Olmué"], costoEnvio: 4990 },
  { region: "Región Metropolitana de Santiago", comunas: ["Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "Santiago", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"], costoEnvio: 3500 },
  { region: "Región del Libertador General Bernardo O'Higgins", comunas: ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"], costoEnvio: 4990 },
  { region: "Región del Maule", comunas: ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"], costoEnvio: 4990 },
  { region: "Región de Ñuble", comunas: ["Chillán", "Chillán Viejo", "Bulnes", "Cobquecura", "Coelemu", "Coihueco", "El Carmen", "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo", "Quillón", "Quirihue", "Ránquil", "San Carlos", "San Fabián", "San Ignacio", "San Nicolás", "Treguaco", "Yungay"], costoEnvio: 4990 },
  { region: "Región del Biobío", comunas: ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualpén", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel"], costoEnvio: 4990 },
  { region: "Región de La Araucanía", comunas: ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"], costoEnvio: 6990 },
  { region: "Región de Los Ríos", comunas: ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Río Bueno", "Futrono", "Lago Ranco"], costoEnvio: 6990 },
  { region: "Región de Los Lagos", comunas: ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"], costoEnvio: 6990 },
  { region: "Región Aysén del General Carlos Ibáñez del Campo", comunas: ["Coihaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"], costoEnvio: 8990 },
  { region: "Región de Magallanes y de la Antártica Chilena", comunas: ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"], costoEnvio: 8990 }
];

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

  const imagenesGaleria = [producto.imagen, ...(producto.galeria || [])];
  
  // Verificación robusta de sesión activa
  const sesionActual = usuarioActivo || JSON.parse(localStorage.getItem('redragon_sesion_activa'));
  const enWishlist = sesionActual?.wishlist?.some(p => p.nombre === producto.nombre);

  const toggleWishlist = () => {
    if (!sesionActual) { 
      setMostrarModalAuth(true); 
      return; 
    }
    
    let nuevaWishlist = [...(sesionActual.wishlist || [])];
    let mensaje = "";
    
    if (enWishlist) { 
      nuevaWishlist = nuevaWishlist.filter(p => p.nombre !== producto.nombre);
      mensaje = "Producto eliminado de tu lista de deseos.";
    } else { 
      nuevaWishlist.push(producto);
      mensaje = "¡Producto añadido instantáneamente a tu lista de deseos! ❤️";
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

    // Disparar evento para actualizar el Navbar al instante
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
    agregarAlCarrito(producto, cantidad);
    setAnimandoBoton(true);
    setTimeout(() => setAnimandoBoton(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 mt-8 relative space-y-8 animate-fade-in text-white">
      
      {/* Notificación flotante fija en la esquina superior derecha, posicionada más arriba en el espacio vacío */}
      {mostrarPromoEnvio && (
        <div className="fixed top-0 right-0 z-50 bg-zinc-900 border text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-fade-in max-w-xs" style={{ borderColor: 'var(--color-primary)' }}>
          <div className="p-2.5 rounded-lg border shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}>
            <Truck size={22} />
          </div>
          <div className="flex-1 pr-2">
            <h4 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Promoción de Envío</h4>
            <p className="text-xs text-zinc-300 mt-0.5">¡Envío gratis en compras de más de 60.000 pesos chilenos!</p>
          </div>
          <button 
            onClick={() => setMostrarPromoEnvio(false)} 
            className="text-zinc-400 hover:text-white transition cursor-pointer p-1 -mr-1 -mt-1"
            title="Cerrar"
          >
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
          <div className="bg-black/40 rounded-lg p-2 flex items-center justify-center border border-zinc-800 h-[420px] w-full overflow-hidden">
            <img src={imagenActiva} alt={producto.nombre} className="max-h-full max-w-full object-contain drop-shadow-2xl scale-125 transition-all duration-300" />
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
              <h2 className="text-3xl font-bold text-white mb-2">{producto.nombre}</h2>
              <button onClick={toggleWishlist} className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-full transition cursor-pointer border border-zinc-700 shadow-lg" title={enWishlist ? "Quitar de favoritos" : "Añadir a favoritos"}>
                <Heart size={24} className={`${enWishlist ? 'fill-red-500 scale-110' : 'text-zinc-400'} transition-all duration-300`} style={enWishlist ? { color: 'var(--color-primary)' } : {}} />
              </button>
            </div>
            
            <p className="text-3xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>{formatearCLP(limpiarMonto(producto.precio))}</p>
            <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded text-sm uppercase font-semibold inline-block mb-4">{producto.tipo}</span>

            {Array.isArray(producto.descripcion) ? (
              <ul className="text-zinc-300 space-y-2 list-disc pl-5 leading-relaxed text-sm">
                {producto.descripcion.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            ) : <p className="text-zinc-300 leading-relaxed text-sm">{producto.descripcion}</p>}

            <div className="mt-6 bg-zinc-800/40 p-4 rounded-lg border border-zinc-700 space-y-3 animate-card-appear">
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

            <div className="flex items-center gap-4 mt-6">
              <span className="text-zinc-400 font-medium text-sm">Cantidad:</span>
              <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
                <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="px-3 py-1 text-zinc-300 hover:bg-zinc-700 transition cursor-pointer font-bold">-</button>
                <span className="px-4 py-1 font-bold text-white text-sm">{cantidad}</span>
                <button onClick={() => setCantidad(cantidad + 1)} className="px-3 py-1 text-zinc-300 hover:bg-zinc-700 transition cursor-pointer font-bold">+</button>
              </div>
            </div>
          </div>

          <button 
            onClick={handleAgregar} 
            className={`font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg border flex items-center justify-center gap-2 cursor-pointer ${animandoBoton ? 'bg-green-600 border-green-500 text-white scale-[1.02]' : 'text-white'}`}
            style={!animandoBoton ? { backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' } : {}}
          >
            {animandoBoton ? <Check size={20} /> : <ShoppingCart size={20} />}
            {animandoBoton ? '¡Añadido al Carrito!' : 'Añadir al Carrito'}
          </button>
        </div>
      </div>

      {/* MODAL DE AUTENTICACIÓN / INVITADO */}
      {mostrarModalAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-zinc-900 border rounded-2xl p-8 max-w-md w-full shadow-2xl relative text-white animate-scale-up" style={{ borderColor: 'var(--color-primary)' }}>
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