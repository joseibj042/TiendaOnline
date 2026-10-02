import React, { useState } from 'react';
import { User, Lock, Mail, AtSign, ArrowLeft, Eye, EyeOff, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function Auth({ modoInicial = 'login', setVistaActual, setUsuarioActivo }) {
  const [modo, setModo] = useState(modoInicial); // 'login', 'register' o 'forgot'
  const [pasoRecuperacion, setPasoRecuperacion] = useState(1); // 1: Correo, 2: Código, 3: Nueva Pass
  
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registro
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Recuperación
  const [codigoRecuperacion, setCodigoRecuperacion] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const [modalRegistroExitoso, setModalRegistroExitoso] = useState(false);
  const [modalLoginExitoso, setModalLoginExitoso] = useState(false);
  const [nombreUsuarioActivo, setNombreUsuarioActivo] = useState('');

  // Función de validación de seguridad de contraseña
  const evaluarSeguridadPassword = (pass) => {
    if (!pass) return { fuerza: 'vacia', mensaje: '', color: 'text-zinc-500', ancho: 'w-0' };
    
    let cumpleRequisitos = 0;
    if (pass.length >= 8) cumpleRequisitos++;
    if (/[A-Z]/.test(pass)) cumpleRequisitos++;
    if (/[a-z]/.test(pass)) cumpleRequisitos++;
    if (/[0-9]/.test(pass)) cumpleRequisitos++;
    if (/[^A-Za-z0-9]/.test(pass)) cumpleRequisitos++;

    if (pass.length < 6 || cumpleRequisitos < 2) {
      return { fuerza: 'débil', mensaje: 'Débil (Mín. 8 caracteres, una mayúscula y un número)', color: 'text-red-500', ancho: 'w-1/3 bg-red-500' };
    } else if (cumpleRequisitos < 4) {
      return { fuerza: 'media', mensaje: 'Seguridad Media', color: 'text-yellow-500', ancho: 'w-2/3 bg-yellow-500' };
    } else {
      return { fuerza: 'fuerte', mensaje: 'Contraseña Segura', color: 'text-green-500', ancho: 'w-full bg-green-500' };
    }
  };

  const estadoPassword = evaluarSeguridadPassword(regPassword);

  // Función de validación de solo letras
  const handleSoloLetras = (e, setter) => {
    const valor = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    setter(valor);
  };

  const handleAuth = (e) => {
    e.preventDefault();
    setError('');

    const usuariosRegistrados = JSON.parse(localStorage.getItem('redragon_usuarios')) || [];

    if (modo === 'register') {
      if (estadoPassword.fuerza === 'débil' || regPassword.length < 8) {
        setError('La contraseña es muy débil. Debe tener al menos 8 caracteres, incluir letras mayúsculas, minúsculas y números.');
        return;
      }
      if (regPassword !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
      const existe = usuariosRegistrados.find(u => u.email === email || u.username === username);
      if (existe) {
        setError('El correo o el nombre de usuario ya están registrados.');
        return;
      }
      const nuevoUsuario = {
        nombreCompleto,
        username,
        email,
        password: regPassword,
        direcciones: [],
        tarjetas: []
      };
      usuariosRegistrados.push(nuevoUsuario);
      localStorage.setItem('redragon_usuarios', JSON.stringify(usuariosRegistrados));
      localStorage.setItem('redragon_sesion_activa', JSON.stringify(nuevoUsuario));
      setUsuarioActivo(nuevoUsuario);
      setNombreUsuarioActivo(username);
      setModalRegistroExitoso(true);

    } else if (modo === 'login') {
      const usuarioEncontrado = usuariosRegistrados.find(
        u => (u.email === emailOrUser || u.username === emailOrUser) && u.password === password
      );

      if (usuarioEncontrado) {
        localStorage.setItem('redragon_sesion_activa', JSON.stringify(usuarioEncontrado));
        setUsuarioActivo(usuarioEncontrado);
        setNombreUsuarioActivo(usuarioEncontrado.username);
        setModalLoginExitoso(true);
      } else {
        setError('Credenciales incorrectas. Verifica tus datos.');
      }
    }
  };

  const handleRecuperacion = (e) => {
    e.preventDefault();
    setError('');
    const usuariosRegistrados = JSON.parse(localStorage.getItem('redragon_usuarios')) || [];

    if (pasoRecuperacion === 1) {
      if (!usuariosRegistrados.find(u => u.email === email)) return setError('Correo no encontrado en nuestra base de datos.');
      setMensajeExito('Hemos enviado un código de recuperación a tu correo.');
      setPasoRecuperacion(2);
    } else if (pasoRecuperacion === 2) {
      if (codigoRecuperacion.length < 4) return setError('Ingresa un código válido.');
      setMensajeExito('Código verificado correctamente.');
      setPasoRecuperacion(3);
    } else if (pasoRecuperacion === 3) {
      if (nuevaPassword.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
      const usuariosActualizados = usuariosRegistrados.map(u => 
        u.email === email ? { ...u, password: nuevaPassword } : u
      );
      localStorage.setItem('redragon_usuarios', JSON.stringify(usuariosActualizados));
      setMensajeExito('¡Contraseña actualizada con éxito! Redirigiendo...');
      setTimeout(() => { 
        setModo('login'); 
        setPasoRecuperacion(1); 
        setMensajeExito(''); 
        setNuevaPassword('');
        setEmail('');
      }, 2500);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-12 bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl animate-scale-up relative">
      <button onClick={() => setVistaActual('home')} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition cursor-pointer text-sm font-bold">
        <ArrowLeft size={16} /> Volver a la tienda
      </button>

      {modo !== 'forgot' && (
        <div className="flex gap-4 mb-6 border-b border-zinc-800 pb-4">
          <button 
            onClick={() => { setModo('login'); setError(''); }} 
            className={`flex-1 pb-2 text-lg font-bold transition cursor-pointer ${modo === 'login' ? 'border-b-2' : 'text-zinc-500 hover:text-zinc-300'}`}
            style={modo === 'login' ? { color: 'var(--color-primary)', borderColor: 'var(--color-primary)' } : {}}
          >
            Iniciar Sesión
          </button>
          <button 
            onClick={() => { setModo('register'); setError(''); }} 
            className={`flex-1 pb-2 text-lg font-bold transition cursor-pointer ${modo === 'register' ? 'border-b-2' : 'text-zinc-500 hover:text-zinc-300'}`}
            style={modo === 'register' ? { color: 'var(--color-primary)', borderColor: 'var(--color-primary)' } : {}}
          >
            Registrarse
          </button>
        </div>
      )}

      {error && <div className="mb-4 bg-red-950/80 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-sm">{error}</div>}
      {mensajeExito && <div className="mb-4 bg-green-950/80 border border-green-500 text-green-300 px-4 py-2 rounded-lg text-sm">{mensajeExito}</div>}

      {modo === 'forgot' ? (
        <form onSubmit={handleRecuperacion} className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-2">Recuperar Contraseña</h3>
          
          {pasoRecuperacion === 1 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Tu Correo Electrónico</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg p-3 text-sm focus:outline-none" style={{ focusBorderColor: 'var(--color-primary)' }} placeholder="correo@ejemplo.com" />
            </div>
          )}
          {pasoRecuperacion === 2 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Código de Seguridad (Cualquiera sirve)</label>
              <input required type="text" maxLength="6" value={codigoRecuperacion} onChange={e => setCodigoRecuperacion(e.target.value.replace(/\D/g, ''))} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg p-3 text-sm font-mono tracking-widest text-center text-lg focus:outline-none" style={{ focusBorderColor: 'var(--color-primary)' }} placeholder="123456" />
            </div>
          )}
          {pasoRecuperacion === 3 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Nueva Contraseña</label>
              <div className="relative">
                <input required type={showPassword ? "text" : "password"} value={nuevaPassword} onChange={e => setNuevaPassword(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg p-3 text-sm pr-10 focus:outline-none" style={{ focusBorderColor: 'var(--color-primary)' }} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-zinc-400 hover:text-white cursor-pointer">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}
          
          <button type="submit" className="w-full text-white py-3.5 rounded-lg font-bold text-base mt-2 shadow-lg border cursor-pointer transition" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}>
            Continuar
          </button>
          <button type="button" onClick={() => { setModo('login'); setPasoRecuperacion(1); setError(''); setMensajeExito(''); }} className="w-full text-zinc-400 hover:text-white text-sm mt-2 transition cursor-pointer font-semibold">
            Cancelar y volver
          </button>
        </form>
      ) : (
        <form onSubmit={handleAuth} className="space-y-4">
          {modo === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Nombre Completo (Solo letras)</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                  <input required type="text" value={nombreCompleto} onChange={e => handleSoloLetras(e, setNombreCompleto)} placeholder="Ej. Juan Pérez" className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none text-sm" style={{ focusBorderColor: 'var(--color-primary)' }} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Nombre de Usuario</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                  <input required type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Ej. juan_gamer" className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none text-sm" style={{ focusBorderColor: 'var(--color-primary)' }} />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              {modo === 'login' ? 'Correo o Usuario' : 'Correo Electrónico'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-zinc-500" size={18} />
              <input required type={modo === 'login' ? "text" : "email"} value={modo === 'login' ? emailOrUser : email} onChange={e => modo === 'login' ? setEmailOrUser(e.target.value) : setEmail(e.target.value)} placeholder={modo === 'login' ? "correo@ejemplo.com o usuario" : "correo@ejemplo.com"} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none text-sm" style={{ focusBorderColor: 'var(--color-primary)' }} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-zinc-500" size={18} />
              <input 
                required 
                type={showPassword ? "text" : "password"} 
                value={modo === 'login' ? password : regPassword} 
                onChange={e => modo === 'login' ? setPassword(e.target.value) : setRegPassword(e.target.value)} 
                placeholder="••••••••" 
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-10 pr-10 py-3 focus:outline-none text-sm" 
                style={{ focusBorderColor: 'var(--color-primary)' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-zinc-400 hover:text-white cursor-pointer transition">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Medidor de seguridad de contraseña en tiempo real (solo en registro) */}
            {modo === 'register' && regPassword.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${estadoPassword.ancho}`}></div>
                </div>
                <p className={`text-xs font-semibold ${estadoPassword.color}`}>
                  {estadoPassword.mensaje}
                </p>
              </div>
            )}
          </div>

          {modo === 'register' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Repetir Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                <input required type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none text-sm" style={{ focusBorderColor: 'var(--color-primary)' }} />
              </div>
            </div>
          )}

          <button type="submit" className="w-full text-white py-3.5 rounded-lg font-bold text-base mt-4 transition shadow-lg border cursor-pointer" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}>
            {modo === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
          </button>

          {modo === 'login' && (
            <div className="text-center mt-5">
              <button type="button" onClick={() => { setModo('forgot'); setError(''); }} className="text-sm font-semibold cursor-pointer transition hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}
        </form>
      )}

      {/* MODALES DE EXITO */}
      {modalRegistroExitoso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-zinc-900 border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-5 text-center animate-scale-up" style={{ borderColor: 'var(--color-primary)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl font-bold border shadow-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}>🎮</div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">¡Bienvenido, {nombreUsuarioActivo}!</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">Tu cuenta ha sido creada e iniciada exitosamente.</p>
            </div>
            <button onClick={() => { setModalRegistroExitoso(false); setVistaActual('home'); }} className="w-full py-3 text-white rounded-xl font-bold text-sm cursor-pointer border transition" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}>Ir a la Tienda</button>
          </div>
        </div>
      )}

      {modalLoginExitoso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-zinc-900 border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-5 text-center animate-scale-up" style={{ borderColor: 'var(--color-primary)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl font-bold border shadow-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}>⚡</div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">¡Bienvenido de nuevo, {nombreUsuarioActivo}!</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">Has iniciado sesión correctamente.</p>
            </div>
            <button onClick={() => { setModalLoginExitoso(false); setVistaActual('home'); }} className="w-full py-3 text-white rounded-xl font-bold text-sm cursor-pointer border transition" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}>Ir a la Tienda</button>
          </div>
        </div>
      )}
    </div>
  );
}