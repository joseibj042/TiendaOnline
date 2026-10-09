import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, CreditCard, Settings, Trash2, ArrowLeft, CheckCircle, AlertTriangle, Lock, Upload, Mail, Clock } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { formatearCLP, formatearRutInput, regionesChile } from '../utils';
import { useSession } from '../context/SessionContext';

const ContadorAntiguedad = ({ createdAt }) => {
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => setTicker(t => t + 1), 1000);
    return () => clearInterval(intervalo);
  }, []);

  const calcularAntiguedad = () => {
    const timestamp = createdAt ? new Date(createdAt).getTime() : Date.now();
    const diffMs = Math.max(0, Date.now() - timestamp);
    const segundos = Math.floor(diffMs / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    
    let texto = '', rango = '';
    if (segundos < 60) { texto = `Hace ${segundos} segundo${segundos !== 1 ? 's' : ''}`; rango = 'Recién Llegado'; }
    else if (minutos < 60) { texto = `Hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`; rango = 'Recién Llegado'; }
    else if (horas < 24) { texto = `Hace ${horas} hora${horas !== 1 ? 's' : ''}`; rango = 'Recién Llegado'; }
    else if (dias < 30) { texto = `Hace ${dias} día${dias !== 1 ? 's' : ''}`; rango = 'Gamer Frecuente'; }
    else if (dias < 365) { const meses = Math.floor(dias / 30); texto = `Hace ${meses} mes${meses !== 1 ? 'es' : ''}`; rango = 'Maestro Redragon'; }
    else { const anios = Math.floor(dias / 365); texto = `Hace ${anios} año${anios !== 1 ? 's' : ''}`; rango = 'Leyenda Inmortal'; }
    
    return { rango, texto };
  };

  const infoAntiguedad = calcularAntiguedad();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <p className="text-sm font-bold text-white" style={{ color: 'var(--color-primary)' }}>{infoAntiguedad.texto}</p>
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 border border-zinc-700/50 z-10 shadow-inner">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 0 10px var(--color-primary)' }}></div>
        <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">{infoAntiguedad.rango}</span>
      </div>
    </div>
  );
};

export default function UserProfile({ setVistaActual, initialTab = 'profile' }) {
  const { usuarioActivo, setUsuarioActivo } = useSession();
  
  // 🛡️ ESTADO BLINDADO: Ignora si el Context global borra datos importantes.
  const [perfilCompleto, setPerfilCompleto] = useState(usuarioActivo);
  
  const [activeTab, setActiveTab] = useState(initialTab === 'wishlist' ? 'profile' : initialTab);
  const [modalExitoMensaje, setModalExitoMensaje] = useState(null);
  const [misPedidos, setMisPedidos] = useState([]);

  const [modalPassword, setModalPassword] = useState({ isOpen: false, accion: null, titulo: '', descripcion: '', indexItem: null, valorExtra: null });
  const [inputPasswordVerificacion, setInputPasswordVerificacion] = useState('');
  const [errorPasswordVerificacion, setErrorPasswordVerificacion] = useState('');
  const [verificandoPass, setVerificandoPass] = useState(false);

  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [nuevoUsername, setNuevoUsername] = useState('');
  const [nuevaBio, setNuevaBio] = useState('');
  const [nuevaEdad, setNuevaEdad] = useState('');
  const [nuevoAvatar, setNuevoAvatar] = useState('');
  const [nuevoBanner, setNuevoBanner] = useState('');
  const [errorPerfil, setErrorPerfil] = useState('');

  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevaPassSettings, setNuevaPassSettings] = useState('');

  const [nuevaNombreDir, setNuevaNombreDir] = useState('');
  const [nuevaCalle, setNuevaCalle] = useState('');
  const [regionSeleccionadaIdx, setRegionSeleccionadaIdx] = useState(0);
  const [comunaSeleccionada, setComunaSeleccionada] = useState(regionesChile[0].comunas[0]);
  const [rutDireccion, setRutDireccion] = useState('');
  const [nuevaTelefonoDir, setNuevaTelefonoDir] = useState('');
  const [nuevaObservacionDir, setNuevaObservacionDir] = useState('');
  const [errorDireccion, setErrorDireccion] = useState('');

  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [titularTarjeta, setTitularTarjeta] = useState('');
  const [expTarjeta, setExpTarjeta] = useState('');
  const [cvvTarjeta, setCvvTarjeta] = useState('');
  const [errorTarjeta, setErrorTarjeta] = useState('');

  // 🔄 CARGA ROBUSTA: Descarga todo directamente desde Supabase
  const recargarPerfil = async () => {
    if (!usuarioActivo?.email) return;

    try {
      // 1. Recuperamos created_at directamente desde Auth
      const { data: authData } = await supabase.auth.getUser();
      const userAuth = authData?.user;

      // 2. Recuperamos los datos públicos
      let query = supabase.from('profiles').select('*');
      if (userAuth?.id) query = query.eq('id', userAuth.id);
      else query = query.eq('email', usuarioActivo.email);

      const { data: userData } = await query.single();
      
      if (userData && userAuth) {
        const datosBlindados = { 
          ...usuarioActivo, 
          ...userData, 
          created_at: userAuth.created_at, // <- ¡RESTAURADO EL CONTADOR!
          email: userAuth.email,
          avatar: userData.avatar_url, 
          nombreCompleto: userData.full_name 
        };
        
        setPerfilCompleto(datosBlindados);
        setUsuarioActivo(datosBlindados); // Parcheamos el context global
        
        setNuevoUsername(userData.username || '');
        setNuevaBio(userData.bio || '');
        setNuevaEdad(userData.edad || '');
        setNuevoAvatar(userData.avatar_url || '');
        setNuevoBanner(userData.banner || '');
      }

      // 3. Pedidos
      const { data: pedidosData } = await supabase.from('pedidos').select('*').eq('email', usuarioActivo.email).order('created_at', { ascending: false });
      if (pedidosData) setMisPedidos(pedidosData);

    } catch (err) {
      console.error("Error cargando perfil:", err);
    }
  };

  useEffect(() => {
    recargarPerfil();
  }, [usuarioActivo?.email]);

  const guardarEnBaseDeDatos = async (datosActualizados) => {
    try {
      const datosParaBD = { ...datosActualizados };
      
      if (datosActualizados.avatar !== undefined) { datosParaBD.avatar_url = datosActualizados.avatar; delete datosParaBD.avatar; }
      if (datosActualizados.nombreCompleto !== undefined) { datosParaBD.full_name = datosActualizados.nombreCompleto; delete datosParaBD.nombreCompleto; }

      if (datosParaBD.edad !== undefined) {
        datosParaBD.edad = (datosParaBD.edad === '' || datosParaBD.edad === null) ? null : parseInt(datosParaBD.edad, 10);
      }

      let query = supabase.from('profiles').update(datosParaBD);
      if (perfilCompleto?.id) query = query.eq('id', perfilCompleto.id);
      else query = query.eq('email', perfilCompleto?.email);

      const { error } = await query;
      if (error) throw new Error(error.message);

      await recargarPerfil(); // Recargamos para refrescar la UI al 100%
      
      setModalExitoMensaje('¡Operación realizada con éxito!');
      setTimeout(() => setModalExitoMensaje(null), 3000);
      return true;
    } catch (error) {
      console.error("Detalle del Error Supabase:", error);
      throw error;
    }
  };

  // CÁLCULO PRECISO PARA LOS 7 DÍAS
  const calcularDiasRestantes = (fechaGuardada) => {
    if (!fechaGuardada) return 0;
    const fecha = new Date(fechaGuardada);
    if (isNaN(fecha.getTime())) return 0;
    
    const ahora = new Date();
    fecha.setHours(0,0,0,0);
    ahora.setHours(0,0,0,0);
    
    const diffMs = ahora.getTime() - fecha.getTime();
    const diasPasados = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    const restante = 7 - diasPasados;
    return restante > 0 ? restante : 0;
  };

  const diasRestantesUsername = calcularDiasRestantes(perfilCompleto?.ultimo_cambio_username);
  const diasRestantesEmail = calcularDiasRestantes(perfilCompleto?.ultimo_cambio_email);
  const diasRestantesPass = calcularDiasRestantes(perfilCompleto?.ultimo_cambio_pass);

  // 🚀 EDICIÓN DIRECTA DE PERFIL (Sin contraseña molesta)
  const handleGuardarCambiosPerfil = async (e) => {
    e.preventDefault();
    setErrorPerfil('');
    
    try {
      if (nuevoUsername.trim() !== perfilCompleto.username) {
        if (nuevoUsername.trim().length < 3) throw new Error("El nombre de usuario debe tener al menos 3 caracteres.");
        if (diasRestantesUsername > 0) throw new Error(`Debes esperar ${diasRestantesUsername} día(s) para cambiar tu usuario.`);
        
        // Verificamos si el nombre existe
        const { data } = await supabase.from('profiles').select('id').ilike('username', nuevoUsername.trim()).neq('id', perfilCompleto?.id || '00000000-0000-0000-0000-000000000000');
        if (data && data.length > 0) throw new Error('Este nombre de usuario ya está en uso por otra persona.');

        await guardarEnBaseDeDatos({
          username: nuevoUsername.trim(),
          ultimo_cambio_username: new Date().toISOString(),
          bio: nuevaBio,
          edad: nuevaEdad,
          avatar: nuevoAvatar,
          banner: nuevoBanner
        });
      } else {
        await guardarEnBaseDeDatos({ bio: nuevaBio, edad: nuevaEdad, avatar: nuevoAvatar, banner: nuevoBanner });
      }
      
      setEditandoPerfil(false);
    } catch (err) {
      setErrorPerfil(err.message);
    }
  };

  // 🔒 PROCESO DE ACCIONES CRÍTICAS (Coreo, Pass, Eliminar, Tarjetas)
  const procesarAccionSegura = async (e) => {
    e.preventDefault();
    setErrorPasswordVerificacion('');
    setVerificandoPass(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: perfilCompleto.email,
        password: inputPasswordVerificacion
      });

      if (authError) throw new Error('Contraseña incorrecta. Intenta nuevamente.');

      const accion = modalPassword.accion;

      // Esperamos 1 segundo para evadir el race-condition del Auth global de Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (accion === 'cambiar_correo') {
        const { error } = await supabase.auth.updateUser({ email: modalPassword.valorExtra });
        if (error) throw error;
        await guardarEnBaseDeDatos({ ultimo_cambio_email: new Date().toISOString(), email: modalPassword.valorExtra });
        setNuevoEmail('');

      } else if (accion === 'cambiar_password') {
        const { error } = await supabase.auth.updateUser({ password: modalPassword.valorExtra });
        if (error) throw error;
        await guardarEnBaseDeDatos({ ultimo_cambio_pass: new Date().toISOString() });
        setNuevaPassSettings('');

      } else if (accion === 'borrar_direccion') {
        const nuevasDirs = perfilCompleto.direcciones.filter((_, i) => i !== modalPassword.indexItem);
        await guardarEnBaseDeDatos({ direcciones: nuevasDirs });

      } else if (accion === 'borrar_tarjeta') {
        const nuevasTarjetas = perfilCompleto.tarjetas.filter((_, i) => i !== modalPassword.indexItem);
        await guardarEnBaseDeDatos({ tarjetas: nuevasTarjetas });

      } else if (accion === 'eliminar_cuenta') {
        if (perfilCompleto.id) await supabase.from('profiles').delete().eq('id', perfilCompleto.id);
        await supabase.rpc('delete_current_user'); 
        await supabase.auth.signOut();
        setUsuarioActivo(null);
        setVistaActual('home');
        return;
      }

      cerrarModalSeguridad();
    } catch (err) {
      setErrorPasswordVerificacion(err.message || 'Ocurrió un error al procesar la solicitud.');
    } finally {
      setVerificandoPass(false);
    }
  };

  const cerrarModalSeguridad = () => {
    setModalPassword({ isOpen: false, accion: null, titulo: '', descripcion: '', indexItem: null, valorExtra: null });
    setInputPasswordVerificacion('');
    setErrorPasswordVerificacion('');
    setVerificandoPass(false);
  };

  const cargarImagen = (e, setEstado) => {
    const file = e.target.files[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => setEstado(reader.result); reader.readAsDataURL(file); }
  };

  const manejarCambioNumeroTarjeta = (e) => {
    let valor = e.target.value.replace(/\D/g, '').substring(0, 16);
    setNumeroTarjeta(valor.replace(/(\d{4})(?=\d)/g, '\$1 '));
  };
  const manejarCambioExpiracion = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length >= 2) v = v.substring(0,2) + '/' + v.substring(2,4);
    setExpTarjeta(v.substring(0,5));
  };

  const handleAgregarTarjeta = (e) => {
    e.preventDefault();
    if (!numeroTarjeta || !titularTarjeta || !expTarjeta || !cvvTarjeta) return setErrorTarjeta('Completa los campos.');
    guardarEnBaseDeDatos({ tarjetas: [...(perfilCompleto.tarjetas || []), { numero: numeroTarjeta, titular: titularTarjeta, expiracion: expTarjeta }] });
    setNumeroTarjeta(''); setTitularTarjeta(''); setExpTarjeta(''); setCvvTarjeta('');
  };

  const handleAgregarDireccion = (e) => {
    e.preventDefault();
    if (!nuevaNombreDir || !nuevaCalle || !rutDireccion || !nuevaTelefonoDir) return setErrorDireccion('Completa los campos.');
    guardarEnBaseDeDatos({ direcciones: [...(perfilCompleto.direcciones || []), { nombre: nuevaNombreDir, calle: nuevaCalle, comuna: comunaSeleccionada, region: regionesChile[regionSeleccionadaIdx].region, rut: rutDireccion, telefono: '+56'+nuevaTelefonoDir, observacion: nuevaObservacionDir }] });
    setNuevaNombreDir(''); setNuevaCalle(''); setNuevaTelefonoDir(''); setRutDireccion(''); setNuevaObservacionDir('');
  };

  if (!perfilCompleto) return null;

  return (
    <div className="max-w-6xl mx-auto p-4 mt-8 animate-fade-in relative text-white">
      <button onClick={() => setVistaActual('home')} className="flex items-center gap-2 mb-6 font-bold transition hover:opacity-80" style={{ color: 'var(--color-primary)' }}><ArrowLeft size={20} /> Volver al inicio</button>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden h-fit flex flex-col relative backdrop-blur-md animate-card-appear">
          <div className="p-6 flex flex-col items-center justify-center border-b border-zinc-800/80 bg-gradient-to-b from-zinc-800/50 to-transparent relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ backgroundColor: 'var(--color-primary)' }}></div>
            <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.4)] relative z-10 bg-zinc-900" style={{ borderColor: 'var(--color-primary)' }}>
              {perfilCompleto?.avatar ? <img src={perfilCompleto.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={32} className="text-zinc-500"/>}
            </div>
            <h4 className="font-bold text-white text-lg mt-4 z-10 tracking-wide truncate w-full text-center">@{perfilCompleto?.username}</h4>
          </div>
          
          <div className="p-3 space-y-1.5">
            {[
              { id: 'profile', icon: <User size={18}/>, label: 'Mi Perfil' },
              { id: 'orders', icon: <Package size={18}/>, label: 'Mis Pedidos' },
              { id: 'addresses', icon: <MapPin size={18}/>, label: 'Direcciones' },
              { id: 'cards', icon: <CreditCard size={18}/>, label: 'Tarjetas Seguras' },
              { id: 'settings', icon: <Settings size={18}/>, label: 'Configuración' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 relative group overflow-hidden ${activeTab === tab.id ? 'text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
                {activeTab === tab.id && <div className="absolute inset-0 opacity-10" style={{ backgroundColor: 'var(--color-primary)' }}></div>}
                {activeTab === tab.id && <div className="absolute left-0 top-0 bottom-0 w-1 shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ backgroundColor: 'var(--color-primary)' }}></div>}
                <span className={`relative z-10 transition-transform duration-300 ${activeTab === tab.id ? 'translate-x-1' : 'group-hover:translate-x-1'}`} style={activeTab === tab.id ? { color: 'var(--color-primary)' } : {}}>{tab.icon}</span>
                <span className={`relative z-10 transition-transform duration-300 tracking-wide ${activeTab === tab.id ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-xl">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h2 className="text-2xl font-bold text-white">Perfil Público</h2>
                <button onClick={() => setEditandoPerfil(!editandoPerfil)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition border border-zinc-700">
                  {editandoPerfil ? 'Cancelar Edición' : 'Editar Perfil'}
                </button>
              </div>

              {!editandoPerfil ? (
                <div className="space-y-6">
                  <div className="relative rounded-xl border border-zinc-700 shadow-lg mb-10 overflow-visible">
                    <div className="h-36 bg-zinc-800 bg-cover bg-center rounded-t-xl" style={{ backgroundImage: perfilCompleto?.banner ? `url(${perfilCompleto.banner})` : 'url(/images/banner-default.jpg)' }}></div>
                    <div className="absolute -bottom-8 left-6 flex items-end gap-4 z-10">
                      <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center text-xl font-bold text-white overflow-hidden border-4 border-zinc-900 shadow-lg">
                        {perfilCompleto?.avatar ? <img src={perfilCompleto.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={30}/>}
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 px-2">
                    <h3 className="text-2xl font-bold">@{perfilCompleto?.username}</h3>
                    <p className="text-sm text-zinc-400 mt-1 italic">"{perfilCompleto?.bio || 'No hay biografía escrita.'}"</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                      <div className="bg-zinc-800/60 p-4 rounded-xl border border-zinc-700/50 shadow-inner">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider mb-2 block">Antigüedad (En vivo)</span>
                        <ContadorAntiguedad createdAt={perfilCompleto?.created_at} />
                      </div>

                      <div className="bg-zinc-800/60 p-4 rounded-xl border border-zinc-700/50 shadow-inner">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Edad</span>
                        <p className="text-sm font-bold mt-1 text-white">{perfilCompleto?.edad ? `${perfilCompleto.edad} años` : 'No especificada'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleGuardarCambiosPerfil} className="space-y-6 bg-zinc-800/30 p-5 rounded-lg border border-zinc-700/60 animate-fade-in">
                  {errorPerfil && <div className="bg-red-950/80 border border-red-500 text-red-300 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-inner"><AlertTriangle size={16}/> {errorPerfil}</div>}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900/60 p-4 rounded-lg border border-zinc-700">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Avatar (Recomendado: 400x400 px)</label>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden border border-zinc-600 shrink-0 flex items-center justify-center">
                          {nuevoAvatar ? <img src={nuevoAvatar} className="w-full h-full object-cover"/> : <User className="text-zinc-500"/>}
                        </div>
                        <label className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-3 py-2 rounded cursor-pointer border border-zinc-600 flex gap-2"><Upload size={14}/> Subir Foto <input type="file" accept="image/*" onChange={(e) => cargarImagen(e, setNuevoAvatar)} className="hidden" /></label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Banner (Recomendado: 1200x400 px)</label>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="w-20 h-10 rounded bg-zinc-800 overflow-hidden border border-zinc-600 bg-cover bg-center shrink-0" style={{ backgroundImage: nuevoBanner ? `url(${nuevoBanner})` : 'none' }}></div>
                        <label className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-3 py-2 rounded cursor-pointer border border-zinc-600 flex gap-2"><Upload size={14}/> Subir Banner <input type="file" accept="image/*" onChange={(e) => cargarImagen(e, setNuevoBanner)} className="hidden" /></label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Nombre de Usuario (Cada 7 días)</label>
                      <input type="text" value={nuevoUsername} onChange={e => setNuevoUsername(e.target.value)} disabled={diasRestantesUsername > 0} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2.5 text-sm outline-none disabled:opacity-50 focus:border-red-500 transition-colors" />
                      {diasRestantesUsername > 0 && <p className="text-[10px] text-yellow-500 mt-1 flex items-center gap-1"><Clock size={10}/> Disponible en {diasRestantesUsername} día(s).</p>}
                    </div>
                    <div><label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Edad</label><input type="number" value={nuevaEdad} onChange={e => setNuevaEdad(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2.5 text-sm outline-none focus:border-red-500 transition-colors" /></div>
                    <div className="md:col-span-2"><label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Biografía</label><textarea value={nuevaBio} onChange={e => setNuevaBio(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2.5 text-sm h-20 outline-none focus:border-red-500 transition-colors resize-none"></textarea></div>
                  </div>
                  <div className="flex justify-end pt-4"><button type="submit" className="text-white px-8 py-3 rounded-lg font-bold text-sm shadow-lg border transition cursor-pointer" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}>Guardar Cambios</button></div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-3">Historial de Pedidos Realizados</h2>
              {misPedidos.length === 0 ? <p className="text-zinc-400 py-8 text-center bg-zinc-950 rounded-xl border border-zinc-800">No tienes pedidos registrados en la base de datos.</p> : (
                <div className="space-y-4">
                  {misPedidos.map((pedido) => (
                    <div key={pedido.id} className={`bg-zinc-800/40 border ${pedido.ocultoParaUsuario ? 'border-red-900/30 opacity-70' : 'border-zinc-700/50'} rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-zinc-500 transition-colors`}>
                      <div className="w-full md:w-auto">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono font-bold text-lg" style={pedido.ocultoParaUsuario ? { color: '#ef4444' } : { color: 'var(--color-primary)' }}>#{pedido.id}</span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${pedido.estado === 'Entregado' || pedido.estado === 'Recibido' ? 'bg-green-600/20 text-green-400' : 'bg-blue-600/20 text-blue-400'}`}>{pedido.estado || 'Procesando'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                          <p className="text-[10px] uppercase text-zinc-400 font-bold">Total Pagado</p>
                          <p className={`font-bold ${pedido.ocultoParaUsuario ? 'text-zinc-500' : 'text-white'}`}>{formatearCLP(pedido.total)}</p>
                        </div>
                        {!pedido.ocultoParaUsuario ? (
                          <button onClick={() => { localStorage.setItem('redragon_orden_activa', pedido.id); setVistaActual('track-order'); }} className="bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition cursor-pointer">Ver Detalles y Envío</button>
                        ) : (
                          <button disabled className="bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold px-4 py-2 rounded-lg opacity-60 cursor-not-allowed">Historial (Eliminado)</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-3">Mis Direcciones Guardadas</h2>
              <form onSubmit={handleAgregarDireccion} className="bg-zinc-800/40 p-5 rounded-lg border border-zinc-700/60 space-y-4">
                <h3 className="font-bold text-sm flex gap-2"><MapPin size={16} style={{ color: 'var(--color-primary)' }}/> Agregar Dirección</h3>
                {errorDireccion && <div className="text-red-400 text-xs font-semibold bg-red-950/50 p-2 rounded">{errorDireccion}</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select value={regionSeleccionadaIdx} onChange={e => { setRegionSeleccionadaIdx(Number(e.target.value)); setComunaSeleccionada(regionesChile[Number(e.target.value)].comunas[0]); }} className="bg-zinc-900 border border-zinc-700 text-white rounded px-3 py-2 text-xs focus:border-red-500 outline-none transition-colors">
                    {regionesChile.map((r, i) => <option key={i} value={i}>{r.region}</option>)}
                  </select>
                  <select value={comunaSeleccionada} onChange={e => setComunaSeleccionada(e.target.value)} className="bg-zinc-900 border border-zinc-700 text-white rounded px-3 py-2 text-xs focus:border-red-500 outline-none transition-colors">
                    {regionesChile[regionSeleccionadaIdx].comunas.map((com, cIdx) => <option key={cIdx} value={com}>{com}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="Nombre (Ej: Casa)" value={nuevaNombreDir} onChange={e => setNuevaNombreDir(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs text-white focus:border-red-500 outline-none transition-colors" />
                  <input type="text" placeholder="Calle y N°" value={nuevaCalle} onChange={e => setNuevaCalle(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs text-white focus:border-red-500 outline-none transition-colors" />
                  <input type="text" placeholder="RUT" value={rutDireccion} onChange={e => setRutDireccion(formatearRutInput(e.target.value))} maxLength="12" className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs text-white focus:border-red-500 outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Teléfono 9 Dígitos" value={nuevaTelefonoDir} onChange={e => setNuevaTelefonoDir(e.target.value.replace(/\D/g, '').slice(0, 9))} className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs text-white focus:border-red-500 outline-none transition-colors" />
                  <input type="text" placeholder="Observación (Conserje)" value={nuevaObservacionDir} onChange={e => setNuevaObservacionDir(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs text-white focus:border-red-500 outline-none transition-colors" />
                </div>
                <button type="submit" className="text-white px-6 py-2.5 rounded font-bold text-xs transition cursor-pointer" style={{ backgroundColor: 'var(--color-primary)' }}>Guardar</button>
              </form>

              <div className="grid grid-cols-1 gap-4">
                {perfilCompleto?.direcciones?.map((dir, idx) => (
                  <div key={idx} className="bg-zinc-800/60 p-4 rounded-lg border border-zinc-700/50 flex justify-between items-start">
                    <div>
                      <p className="font-bold">{dir.nombre}</p><p className="text-sm text-zinc-300">{dir.calle}, {dir.comuna}</p>
                      <p className="text-xs text-zinc-400 mt-1">RUT: {dir.rut} | Tel: {dir.telefono}</p>
                    </div>
                    <button onClick={() => setModalPassword({ isOpen: true, accion: 'borrar_direccion', indexItem: idx, titulo: 'Borrar Dirección', descripcion: 'Confirma tu contraseña para eliminar esta dirección guardada.' })} className="text-zinc-500 hover:text-red-500 transition p-2 cursor-pointer"><Trash2 size={18}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'cards' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-3">Tarjetas Seguras</h2>
              <form onSubmit={handleAgregarTarjeta} className="bg-zinc-800/40 p-5 rounded-lg border border-zinc-700/60 space-y-4">
                <h3 className="font-bold text-sm flex gap-2"><CreditCard size={16} style={{ color: 'var(--color-primary)' }}/> Agregar Tarjeta</h3>
                {errorTarjeta && <div className="text-red-400 text-xs font-semibold bg-red-950/40 p-2 rounded">{errorTarjeta}</div>}
                
                <input type="text" placeholder="Número (16 dígitos)" maxLength="19" value={numeroTarjeta} onChange={manejarCambioNumeroTarjeta} className="w-full bg-zinc-800 border border-zinc-700 rounded p-2.5 text-xs text-white font-mono focus:border-red-500 outline-none transition-colors" />
                <div className="grid grid-cols-3 gap-4">
                  <input type="text" placeholder="Titular" value={titularTarjeta} onChange={e => setTitularTarjeta(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded p-2.5 text-xs text-white focus:border-red-500 outline-none transition-colors" />
                  <input type="text" placeholder="MM/AA" maxLength="5" value={expTarjeta} onChange={manejarCambioExpiracion} className="bg-zinc-800 border border-zinc-700 rounded p-2.5 text-xs text-white font-mono focus:border-red-500 outline-none transition-colors" />
                  <input type="password" placeholder="CVV" maxLength="4" value={cvvTarjeta} onChange={e => setCvvTarjeta(e.target.value.replace(/\D/g, ''))} className="bg-zinc-800 border border-zinc-700 rounded p-2.5 text-xs text-white font-mono focus:border-red-500 outline-none transition-colors" />
                </div>
                <button type="submit" className="text-white px-6 py-2.5 rounded font-bold text-xs transition cursor-pointer" style={{ backgroundColor: 'var(--color-primary)' }}>Agregar Tarjeta</button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {perfilCompleto?.tarjetas?.map((card, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-4 rounded-xl border border-zinc-700 flex justify-between shadow-lg">
                    <div>
                      <CreditCard className="mb-2" size={24} style={{ color: 'var(--color-primary)' }}/>
                      <p className="font-mono font-bold tracking-widest text-lg">•••• •••• •••• {String(card.numero).slice(-4)}</p>
                      <p className="text-xs text-zinc-400 mt-1">Exp: {card.expiracion}</p>
                    </div>
                    <button onClick={() => setModalPassword({ isOpen: true, accion: 'borrar_tarjeta', indexItem: idx, titulo: 'Eliminar Tarjeta', descripcion: 'Confirma tu contraseña para remover esta tarjeta por seguridad.' })} className="text-zinc-500 hover:text-red-500 transition cursor-pointer"><Trash2 size={18}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2"><Settings size={24}/> Configuración del Sistema</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 space-y-4 shadow-lg flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm uppercase flex items-center gap-2"><Mail size={16} style={{ color: 'var(--color-primary)' }}/> Modificar Correo</h3>
                    <p className="text-xs text-zinc-400 mt-1">Actual: <strong className="text-white">{perfilCompleto?.email}</strong></p>
                    <input type="email" placeholder="Nuevo correo electrónico" value={nuevoEmail} onChange={e=>setNuevoEmail(e.target.value)} disabled={diasRestantesEmail > 0} className="w-full mt-4 bg-zinc-900 border border-zinc-700 text-white rounded p-2.5 text-xs outline-none focus:border-red-500 transition-colors disabled:opacity-50" />
                  </div>
                  {diasRestantesEmail > 0 ? (
                    <p className="text-[10px] text-yellow-500 flex gap-1"><Clock size={12}/> Disponible en {diasRestantesEmail} día(s).</p>
                  ) : (
                    <button onClick={() => { if(!nuevoEmail.includes('@')) return; setModalPassword({ isOpen: true, accion: 'cambiar_correo', valorExtra: nuevoEmail, titulo: 'Actualizar Correo', descripcion: 'Ingresa tu contraseña actual para confirmar tu nueva dirección de correo.' }) }} className="text-white px-4 py-2.5 rounded text-xs font-bold transition w-full cursor-pointer" style={{ backgroundColor: 'var(--color-primary)' }}>Actualizar Correo</button>
                  )}
                </div>

                <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 space-y-4 shadow-lg flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm uppercase flex items-center gap-2"><Lock size={16} style={{ color: 'var(--color-primary)' }}/> Cambiar Contraseña</h3>
                    <p className="text-xs text-zinc-400 mt-1">Las contraseñas requieren confirmación.</p>
                    <input type="password" placeholder="Escribe tu nueva contraseña" value={nuevaPassSettings} onChange={e=>setNuevaPassSettings(e.target.value)} disabled={diasRestantesPass > 0} className="w-full mt-4 bg-zinc-900 border border-zinc-700 text-white rounded p-2.5 text-xs outline-none focus:border-red-500 transition-colors disabled:opacity-50" />
                  </div>
                  {diasRestantesPass > 0 ? (
                    <p className="text-[10px] text-yellow-500 flex gap-1"><Clock size={12}/> Disponible en {diasRestantesPass} día(s).</p>
                  ) : (
                    <button onClick={() => { if(nuevaPassSettings.length < 6) return; setModalPassword({ isOpen: true, accion: 'cambiar_password', valorExtra: nuevaPassSettings, titulo: 'Cambiar Contraseña', descripcion: 'Por favor, ingresa tu contraseña ACTUAL para confirmar el cambio de tu nueva contraseña.' }) }} className="text-white px-4 py-2.5 rounded text-xs font-bold transition w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 cursor-pointer">Modificar Contraseña</button>
                  )}
                </div>
              </div>

              <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-xl space-y-4 shadow-xl mt-8">
                <h3 className="text-lg font-bold text-red-500 flex items-center gap-2"><AlertTriangle size={20}/> Zona de Peligro: Eliminar Cuenta</h3>
                <p className="text-sm text-zinc-400">Si eliminas tu cuenta, se borrarán todos tus datos de forma definitiva en la base de datos (Perfil, Wishlist, Pedidos, Tarjetas).</p>
                <button onClick={() => setModalPassword({ isOpen: true, accion: 'eliminar_cuenta', titulo: 'ELIMINAR CUENTA DEFINITIVAMENTE', descripcion: 'ESTA ACCIÓN NO SE PUEDE DESHACER. Escribe tu contraseña para proceder con la eliminación total de la base de datos.' })} className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-lg transition shadow-lg flex gap-2 cursor-pointer"><Trash2 size={18} /> Eliminar mi cuenta para siempre</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE SEGURIDAD BLINDADO PARA COSAS CRÍTICAS */}
      {modalPassword.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-zinc-900 border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-5 animate-scale-up" style={{ borderColor: 'var(--color-primary)' }}>
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-zinc-800 text-white border border-zinc-700"><Lock size={20} /></div>
              <h3 className="text-lg font-bold text-white">{modalPassword.titulo}</h3>
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed">{modalPassword.descripcion}</p>
            
            {errorPasswordVerificacion && (
              <div className="bg-red-950/80 border border-red-500 text-red-300 p-3 rounded-lg text-xs font-semibold flex items-start gap-2 shadow-inner">
                <AlertTriangle size={16} className="shrink-0 mt-0.5"/> 
                <span>{errorPasswordVerificacion}</span>
              </div>
            )}
            
            <form onSubmit={procesarAccionSegura} className="space-y-4">
              <input required type="password" placeholder="Ingresa tu contraseña actual" value={inputPasswordVerificacion} onChange={e => setInputPasswordVerificacion(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg p-3 text-sm outline-none focus:border-red-500 transition-colors" />
              <div className="flex gap-2">
                <button type="button" disabled={verificandoPass} onClick={cerrarModalSeguridad} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold text-sm transition cursor-pointer disabled:opacity-50">Cancelar</button>
                <button type="submit" disabled={verificandoPass} className="flex-1 py-2.5 rounded-lg font-bold text-sm transition flex justify-center items-center gap-2 text-white cursor-pointer disabled:opacity-75" style={modalPassword.accion === 'eliminar_cuenta' ? { backgroundColor: '#dc2626' } : { backgroundColor: 'var(--color-primary)' }}>
                  {verificandoPass ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalExitoMensaje && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-green-600 text-white px-6 py-3 rounded-lg shadow-2xl font-bold text-sm animate-bounce flex items-center gap-2">
          <CheckCircle size={18}/> {modalExitoMensaje}
        </div>
      )}
    </div>
  );
}