import React, { useRef } from 'react';
import { Wrench, Star, ChevronLeft, ChevronRight, ShieldCheck, Truck, Headphones } from 'lucide-react';
import { formatearCLP } from '../utils';

export default function Home({ productos, setVistaActual, setProductoSeleccionado }) {
  const scrollRef = useRef(null);

  const verDetalle = (producto) => {
    setProductoSeleccionado(producto);
    setVistaActual('detalle');
  };

  const productosDestacados = productos.filter(p => p.destacado === true);

  const scroll = (direccion) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75; 
      scrollRef.current.scrollTo({
        left: direccion === 'izquierda' ? scrollRef.current.scrollLeft - scrollAmount : scrollRef.current.scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8 animate-fade-in">
      
      <div className="w-full overflow-hidden relative border-y shadow-2xl flex items-center z-10 py-1.5 mt-2 rounded-sm" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}>
        <style>{`
          @keyframes marquee { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }
          .animate-marquee-text { display: inline-flex; white-space: nowrap; animation: marquee 25s linear infinite; }
        `}</style>
        
        <div className="animate-marquee-text font-bold text-white text-xs md:text-sm tracking-widest uppercase items-center">
          <span className="flex items-center gap-2">
            <span>⚡ HASTA EL 31/12/2026 USA EL CÓDIGO</span>
            <span className="bg-white px-2 py-0.5 rounded font-black shadow-sm mx-1" style={{ color: 'var(--color-primary)' }}>REDRAGON2026</span>
            <span>PARA 10% DE DESCUENTO EN TU PRIMERA COMPRA ⚡</span>
          </span>
          <span className="flex items-center gap-2 ml-20 md:ml-40">
            <span>⚡ HASTA EL 31/12/2026 USA EL CÓDIGO</span>
            <span className="bg-white px-2 py-0.5 rounded font-black shadow-sm mx-1" style={{ color: 'var(--color-primary)' }}>REDRAGON2026</span>
            <span>PARA 10% DE DESCUENTO EN TU PRIMERA COMPRA ⚡</span>
          </span>
        </div>
      </div>

      <div className="border-2 rounded-lg p-8 text-center shadow-2xl bg-cover bg-center overflow-hidden relative z-0" style={{ borderColor: 'var(--color-primary)', backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/BannerC.png')" }}>
        <h2 className="text-3xl font-bold mb-4 flex justify-center items-center gap-3" style={{ color: 'var(--color-primary)' }}>
          ¡POR TIEMPO LIMITADO - Nuevas Keycaps Chainsaw Man!
        </h2>
        <p className="text-zinc-200 mb-6 text-lg font-medium drop-shadow-md">
          Arma tu teclado mecánico exactamente como lo quieres. Elige switches, iluminación y keycaps exclusivas.
        </p>
        <button onClick={() => setVistaActual('customizer')} className="text-white font-bold py-3 px-8 rounded-lg text-xl transition transform hover:scale-105 shadow-lg border cursor-pointer relative z-10" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}>
          Personalizar mi Teclado Ahora
        </button>
      </div>

      <div className="border-b border-zinc-700/50 pb-2 mt-12">
        <h3 className="text-3xl font-bold uppercase tracking-wide flex items-center gap-2">
          <Star className="text-yellow-500" /> Productos Destacados
        </h3>
      </div>
      
      <div className="relative group px-4">
        <button onClick={() => scroll('izquierda')} className="absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 z-20 bg-zinc-900/90 text-white p-3 rounded-full transition border border-zinc-700 cursor-pointer shadow-2xl backdrop-blur flex items-center justify-center" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}>
          <ChevronLeft size={26} />
        </button>

        <div ref={scrollRef} className="flex gap-6 overflow-x-auto scrollbar-none pb-4 pt-2 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {productosDestacados.map((prod, index) => (
            <div 
              key={prod.id} 
              className="min-w-[280px] md:min-w-[300px] lg:min-w-[320px] bg-zinc-900/80 backdrop-blur-sm rounded-lg overflow-hidden border border-zinc-800 transition cursor-pointer shadow-xl group/card flex flex-col snap-start shrink-0 animate-card-appear opacity-0"
              style={{ animationDelay: `${index * 0.08}s` }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
              onClick={() => verDetalle(prod)}
            >
              <div className="overflow-hidden bg-zinc-800 h-48 flex items-center justify-center">
                 <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-contain p-4 group-hover/card:scale-110 transition duration-500" />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h4 className="font-bold text-lg mb-2 text-zinc-100">{prod.nombre}</h4>
                {/* APLICANDO CLP AQUÍ */}
                <p className="font-bold text-xl" style={{ color: 'var(--color-primary)' }}>{formatearCLP(prod.precio)}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => scroll('derecha')} className="absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 z-20 bg-zinc-900/90 text-white p-3 rounded-full transition border border-zinc-700 cursor-pointer shadow-2xl backdrop-blur flex items-center justify-center" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}>
          <ChevronRight size={26} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 border-t border-zinc-800 mt-20">
        <div className="flex items-center gap-4 bg-zinc-900/50 p-6 rounded-lg border border-zinc-800/80 shadow-lg">
          <Truck className="shrink-0" size={32} style={{ color: 'var(--color-primary)' }} />
          <div><h4 className="font-bold text-white">Envíos a todo Chile</h4><p className="text-sm text-zinc-400">Despacho seguro a regiones y comunas.</p></div>
        </div>
        <div className="flex items-center gap-4 bg-zinc-900/50 p-6 rounded-lg border border-zinc-800/80 shadow-lg">
          <ShieldCheck className="shrink-0" size={32} style={{ color: 'var(--color-primary)' }} />
          <div><h4 className="font-bold text-white">Garantía Oficial</h4><p className="text-sm text-zinc-400">Productos originales Redragon con garantía.</p></div>
        </div>
        <div className="flex items-center gap-4 bg-zinc-900/50 p-6 rounded-lg border border-zinc-800/80 shadow-lg">
          <Headphones className="shrink-0" size={32} style={{ color: 'var(--color-primary)' }} />
          <div><h4 className="font-bold text-white">Soporte Gamer 24/7</h4><p className="text-sm text-zinc-400">Asistencia técnica especializada para tu setup.</p></div>
        </div>
      </div>
    </div>
  );
}