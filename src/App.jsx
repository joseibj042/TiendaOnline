import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './components/Home';
import Catalog from './components/Catalog';
import Customizer from './components/Customizer';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Auth from './components/Auth';
import UserProfile from './components/UserProfile';
import OrderTracking from './components/OrderTracking';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import VistaAmigos from "./components/VistaAmigos";
import { supabase } from './services/supabaseClient';

// IMPORTANTE: Importamos el hook del contexto
import { useSession } from './context/SessionContext'; 

function UserProfileEnrutado({ setVistaActual }) {
  const { tab } = useParams();
  const { usuarioActivo, setUsuarioActivo } = useSession(); // Usamos el contexto aquí
  return (
    <UserProfile 
      usuarioActivo={usuarioActivo} 
      setUsuarioActivo={setUsuarioActivo} 
      setVistaActual={setVistaActual} 
      initialTab={tab || 'profile'} 
    />
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // OBTENEMOS EL USUARIO DESDE EL CONTEXTO GLOBAL
  const { usuarioActivo, setUsuarioActivo } = useSession();

  const setVistaActual = (vista) => {
    const diccionarioRutas = {
      'home': '/',
      'catalogo': '/catalogo',
      'customizer': '/customizer',
      'detalle': '/detalle',
      'cart': '/cart',
      'checkout': '/checkout',
      'success': '/success',
      'track-order': '/track-order',
      'login': '/login',
      'register': '/register',
      'amigos': '/amigos',
      'profile': '/perfil/profile',
      'orders': '/perfil/orders',
      'wishlist': '/perfil/wishlist',
      'addresses': '/perfil/addresses',
      'cards': '/perfil/cards',
      'settings': '/perfil/settings'
    };
    navigate(diccionarioRutas[vista] || '/');
  };

  const [carrito, setCarrito] = useState(() => {
    const carritoGuardado = localStorage.getItem('redragon_carrito');
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  });
  const [productoSeleccionado, setProductoSeleccionado] = useState(() => {
    const prodGuardado = localStorage.getItem('redragon_producto');
    return prodGuardado ? JSON.parse(prodGuardado) : null;
  });
  const [categoriaFiltro, setCategoriaFiltro] = useState(() => localStorage.getItem('redragon_categoria') || 'todos');
  
  const [temaActual, setTemaActual] = useState(() => localStorage.getItem('redragon_tema') || 'red');
  const [toastMensaje, setToastMensaje] = useState(null);

  const [productosAPI, setProductosAPI] = useState([]); 
  const [cargandoProductos, setCargandoProductos] = useState(true);

  // EFECTO 1: Cargar productos al inicio
  useEffect(() => {
    const cargarProductos = async () => {
      setCargandoProductos(true);
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error("Error al cargar productos desde Supabase:", error);
      } else if (data) {
        setProductosAPI(data);
      }
      setCargandoProductos(false);
    };

    cargarProductos();
  }, []);

  // EFECTO 2: Scroll to top al cambiar de ruta
  useEffect(() => { 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // EFECTOS 3: Sincronizar estados locales con localStorage
  useEffect(() => { localStorage.setItem('redragon_carrito', JSON.stringify(carrito)); }, [carrito]);
  useEffect(() => {
    if (productoSeleccionado) localStorage.setItem('redragon_producto', JSON.stringify(productoSeleccionado));
    else localStorage.removeItem('redragon_producto');
  }, [productoSeleccionado]);
  useEffect(() => { localStorage.setItem('redragon_categoria', categoriaFiltro); }, [categoriaFiltro]);
  useEffect(() => { localStorage.setItem('redragon_tema', temaActual); }, [temaActual]);

  // IMPORTANTE: Hemos ELIMINADO el mega-useEffect que sincronizaba 'usuarioActivo' 
  // con Supabase porque ahora eso vive dentro de SessionContext.jsx

  const agregarAlCarrito = async (producto, cantidadSeleccionada = 1) => {
    let nuevoCarrito;
    setCarrito(prevCarrito => {
      const indexExistente = prevCarrito.findIndex(item => item.id === producto.id);
      if (indexExistente !== -1) {
        nuevoCarrito = [...prevCarrito];
        nuevoCarrito[indexExistente].cantidad = (nuevoCarrito[indexExistente].cantidad || 1) + cantidadSeleccionada;
      } else {
        nuevoCarrito = [...prevCarrito, { ...producto, cantidad: cantidadSeleccionada }];
      }
      return nuevoCarrito;
    });

    if (usuarioActivo?.email) {
      await supabase
        .from('profiles')
        .update({ cart: nuevoCarrito })
        .eq('email', usuarioActivo.email);
    }

    setToastMensaje("¡Producto añadido al carrito con éxito!");
    setTimeout(() => setToastMensaje(null), 3000);
  };

  const vaciarCarrito = async () => {
    setCarrito([]);
    if (usuarioActivo?.email) {
      await supabase
        .from('profiles')
        .update({ cart: [] })
        .eq('email', usuarioActivo.email);
    }
  };

  const totalCarrito = carrito.reduce((acc, item) => acc + ((item.precio || 0) * (item.cantidad || 1)), 0);

  const clasesTemaGlobal = {
    red: "theme-red",
    purple: "theme-purple",
    green: "theme-green"
  };

  return (
    <div className={`min-h-screen text-white font-sans pb-12 bg-cover bg-center bg-fixed relative flex flex-col justify-between ${clasesTemaGlobal[temaActual] || 'theme-red'}`} style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url('/images/fondo.png')" }}>
      <div>
        {toastMensaje && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-zinc-900 text-white px-6 py-3 rounded-lg shadow-2xl border border-white/30 flex items-center gap-3 animate-bounce transition-all" style={{ borderColor: 'var(--color-primary)' }}>
            <span className="text-xl">🛒</span>
            <span className="font-bold text-base">{toastMensaje}</span>
          </div>
        )}

        <Navbar 
          setVistaActual={setVistaActual} 
          cantidadCarrito={carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0)} 
          setCategoriaFiltro={setCategoriaFiltro}
          // Puedes seguir pasando estas props temporalmente, aunque 
          // lo ideal es que Navbar también llame a useSession() internamente
          usuarioActivo={usuarioActivo}
          setUsuarioActivo={setUsuarioActivo}
          temaActual={temaActual}
          setTemaActual={setTemaActual}
          carrito={carrito}
          setCarrito={setCarrito}
        />

        <div className="animate-fade-in">
          <Routes>
            <Route path="/" element={
              <Home productos={productosAPI} cargandoProductos={cargandoProductos} setVistaActual={setVistaActual} setProductoSeleccionado={setProductoSeleccionado} />
            } />
            
            <Route path="/catalogo" element={
              <Catalog productos={productosAPI} cargandoProductos={cargandoProductos} categoriaFiltro={categoriaFiltro} setVistaActual={setVistaActual} setProductoSeleccionado={setProductoSeleccionado} />
            } />
            
            <Route path="/customizer" element={
              <Customizer agregarAlCarrito={agregarAlCarrito} setVistaActual={setVistaActual} />
            } />
            
            <Route path="/detalle" element={
              productoSeleccionado ? (
                <ProductDetail producto={productoSeleccionado} setVistaActual={setVistaActual} agregarAlCarrito={agregarAlCarrito} usuarioActivo={usuarioActivo} setUsuarioActivo={setUsuarioActivo} />
              ) : (
                <Navigate to="/catalogo" replace />
              )
            } />
            
            <Route path="/cart" element={
              <Cart carrito={carrito} setCarrito={setCarrito} setVistaActual={setVistaActual} usuarioActivo={usuarioActivo} />
            } />
            
            <Route path="/checkout" element={
              <Checkout carrito={carrito} setCarrito={setCarrito} total={totalCarrito} vaciarCarrito={vaciarCarrito} setVistaActual={setVistaActual} usuarioActivo={usuarioActivo} setUsuarioActivo={setUsuarioActivo} />
            } />
            
            <Route path="/success" element={
              <div className="max-w-2xl mx-auto p-10 mt-16 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl text-center space-y-6 animate-scale-up relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--color-primary)', border: '1px solid var(--color-border)' }}>
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 className="text-3xl font-bold text-white">¡Pago Confirmado!</h2>
                <p className="text-zinc-400 text-sm">Tu orden ha sido procesada con éxito y el carrito ha sido vaciado. Puedes revisar el estado de tu envío en la sección de pedidos.</p>
                <div className="flex gap-4 pt-6 justify-center">
                  <button onClick={() => setVistaActual('orders')} className="bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-6 rounded-xl font-bold transition shadow-lg border border-zinc-700">Ver Mis Pedidos</button>
                  <button onClick={() => setVistaActual('home')} className="text-white py-3 px-6 rounded-xl font-bold transition shadow-lg" style={{ backgroundColor: 'var(--color-primary)' }}>Seguir Comprando</button>
                </div>
              </div>
            } />
            
            <Route path="/track-order" element={
              <OrderTracking usuarioActivo={usuarioActivo} setVistaActual={setVistaActual} />
            } />
            
            <Route path="/login" element={
              <Auth modoInicial="login" setVistaActual={setVistaActual} setUsuarioActivo={setUsuarioActivo} />
            } />
            
            <Route path="/register" element={
              <Auth modoInicial="register" setVistaActual={setVistaActual} setUsuarioActivo={setUsuarioActivo} />
            } />
            
            <Route path="/amigos" element={
              <VistaAmigos usuarioActivo={usuarioActivo} setUsuarioActivo={setUsuarioActivo} setVistaActual={setVistaActual} />
            } />
            
            <Route path="/perfil/:tab" element={
              usuarioActivo ? (
                <UserProfileEnrutado setVistaActual={setVistaActual} />
              ) : (
                <Navigate to="/login" replace />
              )
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <ChatBot />
      </div>
      <Footer />
    </div>
  );
}