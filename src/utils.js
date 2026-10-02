// src/utils.js

export const formatearCLP = (valorUSD) => {
  const valorCLP = Math.round(valorUSD * 1000);
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(valorCLP);
};

// NUEVA FUNCIÓN PARA FORMATEAR RUT CHILENO
export const formatearRutInput = (valor) => {
  // Limpiar caracteres que no sean números o K
  let valorLimpio = valor.replace(/[^0-9kK]/g, '').toUpperCase();
  if (valorLimpio.length === 0) return '';
  
  let cuerpo = valorLimpio.slice(0, -1);
  let dv = valorLimpio.slice(-1);
  
  if (cuerpo.length === 0) return dv;
  
  // Agregar puntos de miles
  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${cuerpo}-${dv}`;
};