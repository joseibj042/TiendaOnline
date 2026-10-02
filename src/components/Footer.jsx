import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-24 pt-8 pb-4 border-t border-zinc-800 text-center text-zinc-500 text-sm space-y-3">
      <div className="flex justify-center items-center gap-2 mb-2">
        <img src="/images/logo.png" alt="Redragon" className="h-7 object-contain opacity-75" />
      </div>
      <p className="max-w-xl mx-auto text-zinc-400">
        Diseñado para gamers de alto rendimiento. Eleva tu experiencia de juego con tecnología de vanguardia y personalización profesional.
      </p>
      <p className="font-medium text-zinc-400 pt-2">
        © 2026-2027 Redragon Store Chile. Todos los derechos reservados.
      </p>
    </footer>
  );
}