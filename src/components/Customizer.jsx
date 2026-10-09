import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShoppingCart, ArrowRight, ArrowLeft, Info, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient'; // Asegúrate de tener bien esta ruta
import { formatearCLP } from '../utils';

export default function Customizer({ agregarAlCarrito, setVistaActual }) {
  const [paso, setPaso] = useState(1);
  const [seleccion, setSeleccion] = useState({ modelo: null, iluminacion: null, switch: null, keycaps: null });
  const [keycapHover, setKeycapHover] = useState(null);
  
  // Estados para los datos de Supabase
  const [cargando, setCargando] = useState(true);
  const [opcionesDB, setOpcionesDB] = useState({
    modelos: [],
    iluminacion: [],
    switches: [],
    keycapsTematicas: []
  });

  // Cargar datos desde Supabase
  useEffect(() => {
    const fetchCustomData = async () => {
      try {
        const [resModelos, resIlum, resSwitches, resKeycaps] = await Promise.all([
          supabase.from('custom_modelos').select('*'),
          supabase.from('custom_iluminacion').select('*'),
          supabase.from('custom_switches').select('*'),
          supabase.from('custom_keycaps').select('*')
        ]);

        // Agrupar las keycaps por tema automáticamente para mantener la estructura visual
        const keycapsAgrupadas = [];
        if (resKeycaps.data) {
          resKeycaps.data.forEach(kc => {
            let tema = keycapsAgrupadas.find(t => t.id === kc.tema_id);
            if (!tema) {
              tema = { id: kc.tema_id, nombre: kc.tema_nombre, fondo: kc.tema_fondo, opciones: [] };
              keycapsAgrupadas.push(tema);
            }
            tema.opciones.push({ id: kc.id, nombre: kc.nombre, precio: kc.precio, imagen: kc.imagen });
          });
        }

        setOpcionesDB({
          modelos: resModelos.data || [],
          iluminacion: resIlum.data || [],
          switches: resSwitches.data || [],
          keycapsTematicas: keycapsAgrupadas
        });
      } catch (error) {
        console.error("Error cargando opciones de personalización:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchCustomData();
  }, []);

  const calcularTotalEnVivo = () => {
    const modelo = opcionesDB.modelos.find(m => m.id === seleccion.modelo);
    const ilum = opcionesDB.iluminacion.find(i => i.id === seleccion.iluminacion);
    const sw = opcionesDB.switches.find(s => s.id === seleccion.switch);
    
    let kcPrecio = 0;
    if (seleccion.keycaps && seleccion.keycaps !== 'ninguna' && seleccion.keycaps !== 'seleccionar') {
      for (let tema of opcionesDB.keycapsTematicas) {
        const encontrada = tema.opciones.find(o => o.id === seleccion.keycaps);
        if (encontrada) kcPrecio = Number(encontrada.precio);
      }
    }

    let t = 0;
    if (modelo) t += Number(modelo.precio);
    if (ilum && ilum.precio) t += Number(ilum.precio);
    if (sw && sw.precio) t += Number(sw.precio);
    t += kcPrecio;
    return t;
  };

  const armarProductoYComprar = () => {
    const modelo = opcionesDB.modelos.find(m => m.id === seleccion.modelo) || opcionesDB.modelos[0]; 
    const ilum = opcionesDB.iluminacion.find(i => i.id === seleccion.iluminacion);
    const sw = opcionesDB.switches.find(s => s.id === seleccion.switch);
    
    let kc = null;
    if (seleccion.keycaps !== 'ninguna' && seleccion.keycaps !== null && seleccion.keycaps !== 'seleccionar') {
      opcionesDB.keycapsTematicas.forEach(tema => {
        const encontrada = tema.opciones.find(opcion => opcion.id === seleccion.keycaps);
        if (encontrada) kc = encontrada;
      });
    }

    const tecladoPersonalizado = {
      id: Date.now(),
      nombre: `Teclado Custom - ${modelo.nombre}`,
      precio: calcularTotalEnVivo(),
      imagen: kc ? kc.imagen : modelo.imagen, 
      descripcion: [
        `Iluminación: ${ilum ? ilum.nombre : 'Por defecto'}`,
        `Switches: ${sw ? sw.nombre : 'Estándar'}`,
        `Keycaps: ${kc ? kc.nombre : 'Estándar ABS'}`
      ]
    };

    agregarAlCarrito(tecladoPersonalizado);
    setVistaActual('cart');
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-white">
        <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: 'var(--color-primary)' }} />
        <p className="text-zinc-400 font-medium">Cargando taller de personalización...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 mt-6 pb-20 animate-fade-in text-white">
      {/* Encabezado Premium */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 rounded-2xl border mb-6 shadow-2xl relative overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)' }}></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex gap-3 items-center">
            <div className="p-3 rounded-xl bg-black/40 border border-zinc-800 shadow-inner">
              <Sparkles size={24} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">Taller Custom Premium</h2>
              <p className="text-sm text-zinc-400 font-medium">Configura tu arma perfecta desde cero.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto bg-black/50 p-3 rounded-xl border border-zinc-800/80 backdrop-blur-sm">
            <div className="flex flex-col items-end px-4 border-r border-zinc-700/50">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Total Estimado</span>
              <strong className="text-xl font-black drop-shadow-md" style={{ color: 'var(--color-primary)' }}>
                {formatearCLP(calcularTotalEnVivo())}
              </strong>
            </div>
            <div className="flex items-center gap-2 px-2 text-sm font-bold">
              <span style={{ color: 'var(--color-primary)' }}>Paso {paso}</span> 
              <span className="text-zinc-600">/ 4</span>
            </div>
          </div>
        </div>

        {/* Indicadores de pasos rápidos */}
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((numPaso) => (
            <button 
              key={numPaso} 
              onClick={() => {
                if (numPaso < paso || (numPaso === 2 && seleccion.modelo) || (numPaso === 3 && seleccion.iluminacion) || (numPaso === 4 && seleccion.switch)) {
                  setPaso(numPaso);
                }
              }}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${paso === numPaso ? 'shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.5)]' : paso > numPaso ? 'opacity-60 hover:opacity-100' : 'bg-zinc-800/80'}`}
              style={paso === numPaso ? { backgroundColor: 'var(--color-primary)' } : paso > numPaso ? { backgroundColor: 'var(--color-primary)' } : {}}
            />
          ))}
        </div>
      </div>

      {/* Contenedor de Opciones */}
      <div className="bg-zinc-900/90 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] min-h-[400px]">
        
        {paso === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white tracking-wide">1. Chasis Base</h3>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3 text-sm text-blue-200">
              <Info size={18} className="shrink-0 mt-0.5 text-blue-400" />
              <p>Comienza eligiendo el formato de tu teclado. <strong className="text-white">Próximamente agregaremos modelos 60% y formato completo.</strong></p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {opcionesDB.modelos.map(mod => {
                const isSelected = seleccion.modelo === mod.id;
                return (
                  <div 
                    key={mod.id} 
                    onClick={() => setSeleccion({...seleccion, modelo: mod.id})} 
                    className={`group relative overflow-hidden border-2 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-8 cursor-pointer transition-all duration-300 ${isSelected ? 'bg-zinc-800/80 shadow-2xl' : 'border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900/80'}`}
                    style={isSelected ? { borderColor: 'var(--color-primary)' } : {}}
                  >
                    {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-50"></div>}
                    
                    <div className="relative shrink-0">
                      <div className={`absolute inset-0 blur-2xl opacity-20 transition-opacity ${isSelected ? 'opacity-40' : 'group-hover:opacity-30'}`} style={{ backgroundColor: 'var(--color-primary)' }}></div>
                      <img src={mod.imagen} alt={mod.nombre} className="h-40 w-auto object-contain relative z-10 drop-shadow-2xl transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    
                    <div className="flex-1 text-center md:text-left relative z-10">
                      <h4 className="font-black text-2xl mb-2 text-white tracking-tight">{mod.nombre}</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed mb-4 max-w-xl">{mod.descripcion}</p>
                      <span className="inline-block px-4 py-1.5 rounded-lg font-black text-sm bg-black/40 border border-zinc-700/50" style={{ color: 'var(--color-primary)' }}>
                        {formatearCLP(mod.precio)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-end pt-6 border-t border-zinc-800 mt-6">
              <button onClick={() => setPaso(2)} disabled={!seleccion.modelo} className="text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)]" style={{ backgroundColor: 'var(--color-primary)' }}>
                Configurar Iluminación <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* --- PASOS 2 Y 3 (Idénticos funcionalmente, estilizados) --- */}
        {paso === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-white tracking-wide">2. Efectos de Luz</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {opcionesDB.iluminacion.map(ilum => {
                const isSelected = seleccion.iluminacion === ilum.id;
                return (
                  <div 
                    key={ilum.id} 
                    onClick={() => setSeleccion({...seleccion, iluminacion: ilum.id})} 
                    className={`relative flex flex-col p-4 rounded-xl cursor-pointer transition-all border-2 overflow-hidden group ${isSelected ? 'bg-zinc-800' : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-600'}`}
                    style={isSelected ? { borderColor: 'var(--color-primary)' } : {}}
                  >
                    <div className="w-full h-20 rounded-lg overflow-hidden bg-black mb-3">
                      <img src={ilum.imagen} alt={ilum.nombre} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h4 className="text-sm font-bold text-white">{ilum.nombre}</h4>
                    <p className="text-xs font-semibold mt-1" style={{ color: 'var(--color-primary)' }}>{ilum.precio > 0 ? `+ ${formatearCLP(ilum.precio)}` : 'Incluido'}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between pt-6 border-t border-zinc-800 mt-6">
              <button onClick={() => setPaso(1)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"><ArrowLeft size={16}/> Volver</button>
              <button onClick={() => setPaso(3)} disabled={!seleccion.iluminacion} className="text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 hover:shadow-lg flex items-center gap-2" style={{ backgroundColor: 'var(--color-primary)' }}>Elegir Switches <ArrowRight size={18} /></button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-white tracking-wide">3. Mecánica (Switches)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opcionesDB.switches.map(sw => {
                const isSelected = seleccion.switch === sw.id;
                return (
                  <div 
                    key={sw.id} 
                    onClick={() => setSeleccion({...seleccion, switch: sw.id})} 
                    className={`flex items-start p-4 rounded-xl cursor-pointer transition-all border-2 ${isSelected ? 'bg-zinc-800/80 shadow-lg' : 'bg-zinc-950/50 border-zinc-800 hover:bg-zinc-900'}`}
                    style={isSelected ? { borderColor: 'var(--color-primary)' } : {}}
                  >
                    <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-black/40 mr-4 p-2 flex items-center justify-center border border-white/5">
                      <img src={sw.imagen} alt={sw.nombre} className="w-full h-full object-contain drop-shadow-md" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white mb-1">{sw.nombre}</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">{sw.descripcion}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between pt-6 border-t border-zinc-800 mt-6">
              <button onClick={() => setPaso(2)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"><ArrowLeft size={16}/> Volver</button>
              <button onClick={() => setPaso(4)} disabled={!seleccion.switch} className="text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 hover:shadow-lg flex items-center gap-2" style={{ backgroundColor: 'var(--color-primary)' }}>Personalizar Keycaps <ArrowRight size={18} /></button>
            </div>
          </div>
        )}

        {/* --- PASO 4 (KEYCAPS MEJORADAS) --- */}
        {paso === 4 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-white tracking-wide">4. Estilo (Keycaps Temáticas)</h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                onClick={() => setSeleccion({...seleccion, keycaps: seleccion.keycaps === 'ninguna' || seleccion.keycaps === null ? 'seleccionar' : seleccion.keycaps})} 
                className={`py-4 px-6 rounded-xl font-bold text-sm transition-all border-2 flex flex-col items-center justify-center gap-2 ${(seleccion.keycaps !== null && seleccion.keycaps !== 'ninguna') ? 'text-white shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}
                style={(seleccion.keycaps !== null && seleccion.keycaps !== 'ninguna') ? { backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)' } : {}}
              >
                <span>✨ Ver Diseños Temáticos</span>
              </button>
              <button 
                onClick={() => setSeleccion({...seleccion, keycaps: 'ninguna'})} 
                className={`py-4 px-6 rounded-xl font-bold text-sm transition-all border-2 ${seleccion.keycaps === 'ninguna' ? 'bg-zinc-800 border-zinc-500 text-white shadow-lg' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}
              >
                Usar Teclas Estándar
              </button>
            </div>

            {(seleccion.keycaps !== null && seleccion.keycaps !== 'ninguna') && (
              <div className="relative bg-black/20 p-5 rounded-2xl border border-zinc-800/50">
                {keycapHover && (
                  <div className="absolute -right-10 -top-10 z-50 pointer-events-none animate-fade-in hidden lg:block">
                    <div className="bg-gradient-radial from-white/10 to-transparent p-10 rounded-full">
                      <img src={keycapHover.imagen} alt={keycapHover.nombre} className="w-80 h-80 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,1)] transform scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                )}

                <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                  {opcionesDB.keycapsTematicas.map(tema => (
                    <div key={tema.id} className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-700/50 relative overflow-hidden group">
                      
                      {/* Fondo temático sutil */}
                      {tema.fondo && (
                        <div className="absolute inset-0 opacity-10 bg-cover bg-center mix-blend-luminosity grayscale group-hover:grayscale-0 transition-all duration-500" style={{ backgroundImage: `url(${tema.fondo})` }}></div>
                      )}

                      <div className="relative z-10 mb-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <h4 className="text-base font-black text-white tracking-wider uppercase">{tema.nombre}</h4>
                          
                          {/* 🔴 CARTEL NUEVO CHAINSAW MAN */}
                          {tema.id === 'chainsaw' && (
                            <span className="ml-3 px-2 py-0.5 text-[10px] uppercase font-black bg-red-600 text-white rounded animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)] border border-red-400">
                              ¡Nuevo por tiempo limitado!
                            </span>
                          )}
                        </div>
                        
                        {/* 🔵 CARTEL PRÓXIMAMENTE (Para los que NO son chainsaw) */}
                        {tema.id !== 'chainsaw' && (
                          <span className="text-[10px] font-medium text-zinc-500 italic bg-black/40 px-2 py-1 rounded">
                            Próximamente nuevos diseños...
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                        {tema.opciones.map(kc => {
                          const isSelected = seleccion.keycaps === kc.id;
                          return (
                            <div 
                              key={kc.id} 
                              onClick={() => setSeleccion({...seleccion, keycaps: kc.id})} 
                              onMouseEnter={() => setKeycapHover(kc)}
                              onMouseLeave={() => setKeycapHover(null)}
                              className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer border-2 transition-all duration-200 ${isSelected ? 'bg-zinc-800 shadow-md' : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-500'}`}
                              style={isSelected ? { borderColor: 'var(--color-primary)' } : {}}
                            >
                              <div className="w-12 h-12 shrink-0 bg-black/60 rounded-lg p-1 border border-white/5 flex items-center justify-center">
                                <img src={kc.imagen} alt="" className="w-full h-full object-contain drop-shadow-md" />
                              </div>
                              <div className="flex-1 truncate">
                                <p className="font-bold text-sm text-white truncate">{kc.nombre}</p>
                                <p className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>+{formatearCLP(kc.precio)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-zinc-800 mt-6">
              <button onClick={() => setPaso(3)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"><ArrowLeft size={16}/> Volver</button>
              <button onClick={armarProductoYComprar} disabled={seleccion.keycaps === null || seleccion.keycaps === 'seleccionar'} className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-black text-base shadow-[0_0_20px_rgba(22,163,74,0.4)] border border-green-400 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2 hover:scale-105 active:scale-95">
                <ShoppingCart size={20} /> Finalizar y Añadir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}