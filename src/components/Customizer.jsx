import React, { useState } from 'react';
import { AlertTriangle, ShoppingCart, ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { opcionesPersonalizacion } from '../data/mockData';
import { formatearCLP } from '../utils';

export default function Customizer({ agregarAlCarrito, setVistaActual }) {
  const [paso, setPaso] = useState(1);
  const [seleccion, setSeleccion] = useState({ modelo: null, iluminacion: null, switch: null, keycaps: null });
  const [keycapHover, setKeycapHover] = useState(null);

  // Función para calcular el precio en tiempo real
  const calcularTotalEnVivo = () => {
    const modelo = opcionesPersonalizacion.modelos.find(m => m.id === seleccion.modelo);
    const ilum = opcionesPersonalizacion.iluminacion.find(i => i.id === seleccion.iluminacion);
    const sw = opcionesPersonalizacion.switches.find(s => s.id === seleccion.switch);
    
    let kcPrecio = 0;
    if (seleccion.keycaps && seleccion.keycaps !== 'ninguna' && seleccion.keycaps !== 'seleccionar') {
      for (let tema of opcionesPersonalizacion.keycapsTematicas) {
        const encontrada = tema.opciones.find(o => o.id === seleccion.keycaps);
        if (encontrada) kcPrecio = encontrada.precio;
      }
    }

    let t = 0;
    if (modelo) t += modelo.precio;
    if (ilum && ilum.precio) t += ilum.precio;
    if (sw && sw.precio) t += sw.precio;
    t += kcPrecio;
    return t;
  };

  const armarProductoYComprar = () => {
    const modelo = opcionesPersonalizacion.modelos.find(m => m.id === seleccion.modelo) || opcionesPersonalizacion.modelos[0]; 
    const ilum = opcionesPersonalizacion.iluminacion.find(i => i.id === seleccion.iluminacion);
    const sw = opcionesPersonalizacion.switches.find(s => s.id === seleccion.switch);
    
    let kc = null;
    if (seleccion.keycaps !== 'ninguna' && seleccion.keycaps !== null && seleccion.keycaps !== 'seleccionar') {
      opcionesPersonalizacion.keycapsTematicas.forEach(tema => {
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

  return (
    <div className="max-w-4xl mx-auto p-4 mt-6 pb-16 animate-fade-in text-white">
      {/* Encabezado y barra de pasos compacta superior con Total en Vivo visible */}
      <div className="bg-zinc-900 p-6 rounded-xl border mb-6 shadow-xl animate-scale-up" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>Taller Custom Redragon</h2>
            <p className="text-xs text-zinc-400">Diseña y personaliza tu teclado paso a paso</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-zinc-950 border px-3 py-1 rounded-lg text-xs" style={{ borderColor: 'var(--color-border)' }}>
              <span className="text-zinc-400 mr-1">Total Actual:</span>
              <strong className="font-bold" style={{ color: 'var(--color-primary)' }}>{formatearCLP(calcularTotalEnVivo())}</strong>
            </div>
            <div className="flex items-center gap-1 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-bold">
              <span style={{ color: 'var(--color-primary)' }}>Paso {paso}</span> <span className="text-zinc-500">/ 4</span>
            </div>
          </div>
        </div>

        {/* Indicadores de pasos rápidos */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((numPaso) => (
            <button 
              key={numPaso} 
              onClick={() => {
                if (numPaso < paso || (numPaso === 2 && seleccion.modelo) || (numPaso === 3 && seleccion.iluminacion) || (numPaso === 4 && seleccion.switch)) {
                  setPaso(numPaso);
                }
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${paso === numPaso ? '' : paso > numPaso ? 'opacity-80' : 'bg-zinc-800'}`}
              style={paso === numPaso ? { backgroundColor: 'var(--color-primary)' } : paso > numPaso ? { backgroundColor: 'var(--color-primary)', opacity: 0.5 } : {}}
            />
          ))}
        </div>
      </div>

      {/* Contenido principal del paso */}
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl animate-fade-in">
        {paso === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-white">1. Elige tu Modelo Base</h3>
            
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-300">
              <Info size={16} className="shrink-0" style={{ color: 'var(--color-primary)' }} />
              <span>Por ahora solo está disponible este modelo base, pero <strong>próximamente habrá más opciones</strong>.</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {opcionesPersonalizacion.modelos.map(mod => {
                const isSelected = seleccion.modelo === mod.id;
                return (
                  <div 
                    key={mod.id} 
                    onClick={() => setSeleccion({...seleccion, modelo: mod.id})} 
                    className={`border p-4 rounded-lg flex flex-col md:flex-row items-center gap-6 cursor-pointer transition-all animate-card-appear ${isSelected ? 'bg-zinc-800/80 shadow-2xl' : 'border-zinc-700 bg-zinc-900/50'}`}
                    style={isSelected ? { borderColor: 'var(--color-primary)' } : {}}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = ''; }}
                  >
                    <img src={mod.imagen} alt={mod.nombre} className="h-36 w-auto object-contain drop-shadow-xxl" />
                    <div>
                      <h4 className={`font-bold text-xl mb-1 ${isSelected ? 'text-white' : 'text-zinc-300'}`}>{mod.nombre}</h4>
                      <p className="text-zinc-400 text-xs leading-relaxed">{mod.descripcion}</p>
                      <p className="font-bold text-sm mt-2" style={{ color: 'var(--color-primary)' }}>{formatearCLP(mod.precio)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-end pt-4">
              <button onClick={() => setPaso(2)} disabled={!seleccion.modelo} className="text-white px-6 py-2.5 rounded-lg font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shadow" style={{ backgroundColor: 'var(--color-primary)' }}>
                Siguiente <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {paso === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-white">2. Tipo de Iluminación</h3>
            
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-300">
              <Info size={16} className="shrink-0" style={{ color: 'var(--color-primary)' }} />
              <span>Personaliza la iluminación de tu teclado. <strong>Próximamente habrá más modos de iluminación</strong> disponibles.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {opcionesPersonalizacion.iluminacion.map(ilum => {
                const isSelected = seleccion.iluminacion === ilum.id;
                return (
                  <div 
                    key={ilum.id} 
                    onClick={() => setSeleccion({...seleccion, iluminacion: ilum.id})} 
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border animate-card-appear ${isSelected ? 'bg-zinc-800 text-white' : 'bg-zinc-900/60 border-zinc-700 hover:border-zinc-500 text-zinc-300'}`}
                    style={isSelected ? { borderColor: 'var(--color-primary)' } : {}}
                  >
                    <div className="w-16 h-12 shrink-0 rounded overflow-hidden bg-black/40 mr-3">
                      <img src={ilum.imagen} alt={ilum.nombre} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold">{ilum.nombre}</h4>
                      <p className="text-[10px] font-semibold" style={{ color: 'var(--color-primary)' }}>{ilum.precio > 0 ? `+ ${formatearCLP(ilum.precio)}` : 'Incluido'}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setPaso(1)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-5 py-2 rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1.5">
                <ArrowLeft size={14}/> Anterior
              </button>
              <button onClick={() => setPaso(3)} disabled={!seleccion.iluminacion} className="text-white px-6 py-2.5 rounded-lg font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shadow" style={{ backgroundColor: 'var(--color-primary)' }}>
                Siguiente <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-white">3. Selecciona tus Switches</h3>

            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-300">
              <Info size={16} className="shrink-0" style={{ color: 'var(--color-primary)' }} />
              <span>Elige el tacto y sonido ideal. <strong>Próximamente habrá más tipos de switches</strong> en nuestro catálogo.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {opcionesPersonalizacion.switches.map(sw => {
                const isSelected = seleccion.switch === sw.id;
                return (
                  <div 
                    key={sw.id} 
                    onClick={() => setSeleccion({...seleccion, switch: sw.id})} 
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border animate-card-appear ${isSelected ? 'bg-zinc-800 text-white' : 'bg-zinc-900/60 border-zinc-700 hover:border-zinc-500 text-zinc-300'}`}
                    style={isSelected ? { borderColor: 'var(--color-primary)' } : {}}
                  >
                    <div className="w-16 h-16 shrink-0 rounded overflow-hidden bg-black/40 mr-3 p-1 flex items-center justify-center">
                      <img src={sw.imagen} alt={sw.nombre} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold">{sw.nombre}</h4>
                      <p className="text-[10px] text-zinc-400 line-clamp-1">{sw.descripcion}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setPaso(2)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-5 py-2 rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1.5">
                <ArrowLeft size={14}/> Anterior
              </button>
              <button onClick={() => setPaso(4)} disabled={!seleccion.switch} className="text-white px-6 py-2.5 rounded-lg font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shadow" style={{ backgroundColor: 'var(--color-primary)' }}>
                Siguiente <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {paso === 4 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-white">4. ¿Deseas Keycaps Personalizadas?</h3>

            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-300">
              <Info size={16} className="shrink-0" style={{ color: 'var(--color-primary)' }} />
              <span>Explora nuestras ediciones temáticas. <strong>Próximamente habrá más keycaps de este catálogo y nuevas categorías</strong> disponibles.</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button 
                onClick={() => setSeleccion({...seleccion, keycaps: seleccion.keycaps === 'ninguna' || seleccion.keycaps === null ? 'seleccionar' : seleccion.keycaps})} 
                className={`p-3 rounded-lg font-bold text-xs transition-all border ${(seleccion.keycaps !== null && seleccion.keycaps !== 'ninguna') ? 'text-white shadow' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800 cursor-pointer'}`}
                style={(seleccion.keycaps !== null && seleccion.keycaps !== 'ninguna') ? { backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' } : {}}
              >
                Sí, ver temáticas
              </button>
              <button onClick={() => setSeleccion({...seleccion, keycaps: 'ninguna'})} className={`p-3 rounded-lg font-bold text-xs transition-all border ${seleccion.keycaps === 'ninguna' ? 'bg-zinc-700 border-zinc-500 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800 cursor-pointer'}`}>No, usar estándar</button>
            </div>

            {(seleccion.keycaps !== null && seleccion.keycaps !== 'ninguna') && (
              <div className="relative">
                {/* 🔹 Solo la imagen grande en zoom al hacer hover, sin ningún recuadro o texto */}
                {keycapHover && (
                  <div className="absolute right-0 top-0 z-50 pointer-events-none animate-scale-up">
                    <img 
                      src={keycapHover.imagen} 
                      alt={keycapHover.nombre} 
                      className="w-72 h-72 object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)] transform scale-125 transition-transform duration-300" 
                    />
                  </div>
                )}

                <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                  {opcionesPersonalizacion.keycapsTematicas.map(tema => (
                    <div key={tema.id} className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2 animate-card-appear">
                      <h4 className="text-xs font-bold text-white">{tema.nombre}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {tema.opciones.map(kc => {
                          const isSelected = seleccion.keycaps === kc.id;
                          return (
                            <div 
                              key={kc.id} 
                              onClick={() => setSeleccion({...seleccion, keycaps: kc.id})} 
                              onMouseEnter={() => setKeycapHover(kc)}
                              onMouseLeave={() => setKeycapHover(null)}
                              className={`p-2.5 rounded-lg flex items-center gap-2.5 cursor-pointer border text-xs transition-all hover:border-zinc-400 ${isSelected ? 'bg-zinc-800 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`}
                              style={isSelected ? { borderColor: 'var(--color-primary)' } : {}}
                            >
                              <img src={kc.imagen} alt="" className="w-9 h-9 object-contain bg-black/40 rounded p-0.5 shrink-0" />
                              <div className="flex-1 truncate"><p className="font-bold truncate">{kc.nombre}</p><p className="text-[10px]" style={{ color: 'var(--color-primary)' }}>{formatearCLP(kc.precio)}</p></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button onClick={() => setPaso(3)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-5 py-2 rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1.5">
                <ArrowLeft size={14}/> Anterior
              </button>
              <button onClick={armarProductoYComprar} disabled={seleccion.keycaps === null || seleccion.keycaps === 'seleccionar'} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg border border-green-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex gap-2 items-center transition">
                <ShoppingCart size={16} /> Añadir al Carrito
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}