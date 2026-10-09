import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

// 1. Creamos el contexto
const SessionContext = createContext();

// 2. Creamos el Provider que envolverá nuestra app
export function SessionProvider({ children }) {
  const [usuarioActivo, setUsuarioActivoState] = useState(() => {
    const sesionLocal = localStorage.getItem('redragon_sesion_activa');
    const sesionSession = sessionStorage.getItem('redragon_sesion_activa');
    return sesionLocal ? JSON.parse(sesionLocal) : (sesionSession ? JSON.parse(sesionSession) : null);
  });

  // Función global para actualizar el usuario en React y en el Storage al mismo tiempo
  const setUsuarioActivo = (nuevosDatos) => {
    setUsuarioActivoState(nuevosDatos);
    if (nuevosDatos) {
      const recordar = localStorage.getItem('redragon_recordar') === 'true';
      const storageDestino = recordar ? localStorage : sessionStorage;
      storageDestino.setItem('redragon_sesion_activa', JSON.stringify(nuevosDatos));
      
      // Mantenemos sincronizada la lista de todos los usuarios
      const todos = JSON.parse(localStorage.getItem('redragon_usuarios')) || [];
      const index = todos.findIndex(u => u.email === nuevosDatos.email);
      if (index !== -1) {
        todos[index] = nuevosDatos;
        localStorage.setItem('redragon_usuarios', JSON.stringify(todos));
      }
    } else {
      localStorage.removeItem('redragon_sesion_activa');
      sessionStorage.removeItem('redragon_sesion_activa');
    }
  };

  // Mantenemos tu lógica de sincronización con Supabase aquí (centralizada)
  useEffect(() => {
    const sincronizarDatosUsuario = async (user) => {
      try {
        const { data: userData } = await supabase.from('profiles').select('*').eq('email', user.email).single();
        const usuarioSupabase = {
          id: user.id,
          nombreCompleto: userData?.full_name || user.user_metadata?.nombre_completo || user.email,
          username: userData?.username || user.user_metadata?.username || user.email.split('@')[0],
          email: user.email,
          direcciones: userData?.direcciones || [],
          tarjetas: userData?.tarjetas || [],
          wishlist: userData?.wishlist || [],
          // Aquí puedes agregar cart, amigos, notificaciones, etc.
        };
        setUsuarioActivo(usuarioSupabase);
      } catch (error) {
        console.error("Error sincronizando perfil:", error);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) sincronizarDatosUsuario(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        sincronizarDatosUsuario(session.user);
      } else {
        setUsuarioActivo(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SessionContext.Provider value={{ usuarioActivo, setUsuarioActivo }}>
      {children}
    </SessionContext.Provider>
  );
}

// 3. Hook personalizado para usarlo fácilmente
export const useSession = () => useContext(SessionContext);