import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, CreditCard, Settings, Trash2, ArrowLeft, CheckCircle, Heart, AlertTriangle, Search, Mail, Camera, UserPlus, Lock, Bell, Gift, CheckSquare, Square, Clock, Users, Ban, ShoppingCart, Upload, Eye, Flag } from 'lucide-react';
import { formatearCLP, formatearRutInput } from '../utils';

const regionesChile = [
  { region: "Región de Arica y Parinacota", comunas: ["Arica", "Camarones", "Putre", "General Lagos"] },
  { region: "Región de Tarapacá", comunas: ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"] },
  { region: "Región de Antofagasta", comunas: ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"] },
  { region: "Región de Atacama", comunas: ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"] },
  { region: "Región de Coquimbo", comunas: ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paihuano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"] },
  { region: "Región de Valparaíso", comunas: ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "San Esteban", "Rinconada", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Limache", "Quilpué", "Villa Alemana", "Olmué"] },
  { region: "Región Metropolitana de Santiago", comunas: ["Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "Santiago", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"] },
  { region: "Región del Libertador General Bernardo O'Higgins", comunas: ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"] },
  { region: "Región del Maule", comunas: ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"] },
  { region: "Región de Ñuble", comunas: ["Chillán", "Chillán Viejo", "Bulnes", "Cobquecura", "Coelemu", "Coihueco", "El Carmen", "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo", "Quillón", "Quirihue", "Ránquil", "San Carlos", "San Fabián", "San Ignacio", "San Nicolás", "Treguaco", "Yungay"] },
  { region: "Región del Biobío", comunas: ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualpén", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel"] },
  { region: "Región de La Araucanía", comunas: ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"] },
  { region: "Región de Los Ríos", comunas: ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Río Bueno", "Futrono", "Lago Ranco"] },
  { region: "Región de Los Lagos", comunas: ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"] },
  { region: "Región Aysén del General Carlos Ibáñez del Campo", comunas: ["Coihaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"] },
  { region: "Región de Magallanes y de la Antártica Chilena", comunas: ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"] }
];

export default function UserProfile({ usuarioActivo, setUsuarioActivo, setVistaActual, initialTab = 'profile', agregarAlCarrito }) {
  const [activeTab, setActiveTab] = useState(initialTab === 'wishlist' ? 'profile' : initialTab);
  const [modalExitoMensaje, setModalExitoMensaje] = useState(null);
  
  useEffect(() => {
    if (usuarioActivo && (!usuarioActivo.fechaRegistro || !usuarioActivo.timestampRegistro)) {
      const usuarioActualizado = {
        ...usuarioActivo,
        fechaRegistro: usuarioActivo.fechaRegistro || new Date().toLocaleDateString(),
        timestampRegistro: usuarioActivo.timestampRegistro || new Date().getTime()
      };
      actualizarUsuarioEnStorage(usuarioActualizado);
    }
  }, [usuarioActivo?.email]);

  const [_, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [nuevoUsername, setNuevoUsername] = useState(usuarioActivo?.username || '');
  const [errorUsername, setErrorUsername] = useState('');
  const [nuevaBio, setNuevaBio] = useState(usuarioActivo?.bio || '');
  const [nuevaEdad, setNuevaEdad] = useState(usuarioActivo?.edad || '');

  const [nuevoAvatar, setNuevoAvatar] = useState(usuarioActivo?.avatar || '');
  const [nuevoBanner, setNuevoBanner] = useState(usuarioActivo?.banner || '');

  const [modoCambioPass, setModoCambioPass] = useState(false);
  const [pasoPassCodigo, setPasoPassCodigo] = useState(false);
  const [codigoIngresadoPass, setCodigoIngresadoPass] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [errorPass, setErrorPass] = useState('');

  const [modoCambioEmail, setModoCambioEmail] = useState(false);
  const [nuevoEmailInput, setNuevoEmailInput] = useState('');
  const [errorEmail, setErrorEmail] = useState('');

  const [amigoInput, setAmigoInput] = useState('');
  const [mensajeAmigo, setMensajeAmigo] = useState({ texto: '', error: false });

  const [amigoPerfilSeleccionado, setAmigoPerfilSeleccionado] = useState(null);
  const [amigoReporteSeleccionado, setAmigoReporteSeleccionado] = useState(null);
  const [motivoReporteTexto, setMotivoReporteTexto] = useState('');
  const [verWishlistAmigoModal, setVerWishlistAmigoModal] = useState(false);
  
  const [amigoABloquear, setAmigoABloquear] = useState(null);
  const [amigoAEliminar, setAmigoAEliminar] = useState(null);

  // Estados para Direcciones + Observación
  const [nuevaNombreDir, setNuevaNombreDir] = useState('');
  const [nuevaCalle, setNuevaCalle] = useState('');
  const [regionSeleccionadaIdx, setRegionSeleccionadaIdx] = useState(0);
  const [comunaSeleccionada, setComunaSeleccionada] = useState(regionesChile[0].comunas[0]);
  const [rutDireccion, setRutDireccion] = useState('');
  const [nuevaObservacionDir, setNuevaObservacionDir] = useState('');
  const [errorDireccion, setErrorDireccion] = useState('');

  // Estados para Tarjetas
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [titularTarjeta, setTitularTarjeta] = useState('');
  const [expTarjeta, setExpTarjeta] = useState('');
  const [cvvTarjeta, setCvvTarjeta] = useState('');
  const [errorTarjeta, setErrorTarjeta] = useState('');

  const [modalBorrarCuenta, setModalBorrarCuenta] = useState(false);
  const [textoConfirmacion, setTextoConfirmacion] = useState('');
  const [passwordBorrar, setPasswordBorrar] = useState('');
  const [errorBorrar, setErrorBorrar] = useState('');

  const [pedidoAEliminar, setPedidoAEliminar] = useState(null);
  const [fuerzaRecargaPedidos, setFuerzaRecargaPedidos] = useState(false);

  // Funciones de formateo y validación de tarjetas
  const manejarCambioNumeroTarjeta = (e) => {
    let valor = e.target.value.replace(/\D/g, '');
    valor = valor.substring(0, 16);
    valor = valor.replace(/(\d{4})(?=\d)/g, '$1 ');
    setNumeroTarjeta(valor);
  };

  const manejarCambioExpiracion = (e) => {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length >= 2) {
      let mes = valor.substring(0, 2);
      if (parseInt(mes, 10) > 12) mes = '12';
      if (parseInt(mes, 10) === 0) mes = '01';
      valor = mes + '/' + valor.substring(2, 4);
    }
    valor = valor.substring(0, 5);
    setExpTarjeta(valor);
  };

  const validarTarjetaNoVencida = (exp) => {
    if (!exp || exp.length < 5) return false;
    const [mesStr, anioStr] = exp.split('/');
    const mes = parseInt(mesStr, 10);
    const anio = parseInt('20' + anioStr, 10);

    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const anioActual = fechaActual.getFullYear();

    if (anio < anioActual) return false;
    if (anio === anioActual && mes < mesActual) return false;
    return true;
  };

  const actualizarUsuarioEnStorage = (usuarioActualizado) => {
    setUsuarioActivo(usuarioActualizado);
    localStorage.setItem('redragon_sesion_activa', JSON.stringify(usuarioActualizado));
    const todos = JSON.parse(localStorage.getItem('redragon_usuarios')) || [];
    const index = todos.findIndex(u => u.email === usuarioActualizado.email);
    if (index !== -1) { todos[index] = usuarioActualizado; localStorage.setItem('redragon_usuarios', JSON.stringify(todos)); }
  };

  const actualizarUsuarioPorUsername = (username, callbackActualizar) => {
    const todos = JSON.parse(localStorage.getItem('redragon_usuarios')) || [];
    const index = todos.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (index !== -1) {
      const modificado = callbackActualizar(todos[index]);
      todos[index] = modificado;
      localStorage.setItem('redragon_usuarios', JSON.stringify(todos));
      if (modificado.email === usuarioActivo.email) {
        setUsuarioActivo(modificado);
        localStorage.setItem('redragon_sesion_activa', JSON.stringify(modificado));
      }
    }
  };

  const calcularDiasRestantes = (fechaGuardada) => {
    if (!fechaGuardada) return 0;
    const msPasados = new Date().getTime() - new Date(fechaGuardada).getTime();
    const diasPasados = msPasados / (1000 * 60 * 60 * 24);
    const restante = Math.ceil(7 - diasPasados);
    return restante > 0 ? restante : 0;
  };

  const diasRestantesUsername = calcularDiasRestantes(usuarioActivo?.ultimoCambioUsername);
  const diasRestantesPass = calcularDiasRestantes(usuarioActivo?.ultimoCambioPass);
  const diasRestantesEmail = calcularDiasRestantes(usuarioActivo?.ultimoCambioEmail);

  const calcularAntiguedadUsuario = (usr) => {
    if (!usr?.fechaRegistro && !usr?.timestampRegistro) return { texto: 'Fecha no registrada', rango: 'Novato Gamer' };
    const timestamp = usr.timestampRegistro || Date.parse(usr.fechaRegistro);
    if (!timestamp || isNaN(timestamp)) return { texto: usr.fechaRegistro || 'Hace un momento', rango: 'Recién Llegado 🟢' };
    
    const msDiferencia = new Date().getTime() - timestamp;
    const minutos = Math.floor(msDiferencia / (1000 * 60));
    const horas = Math.floor(msDiferencia / (1000 * 60 * 60));
    const dias = Math.floor(msDiferencia / (1000 * 60 * 60 * 24));
    
    let textoAntiguedad = '';
    let rangoUsuario = 'Novato Gamer';

    if (minutos < 1) {
      textoAntiguedad = 'Hace un momento';
      rangoUsuario = 'Recién Llegado 🟢';
    } else if (minutos < 60) {
      textoAntiguedad = `Hace ${minutos} minuto${minutos === 1 ? '' : 's'}`;
      rangoUsuario = 'Explorador Junior 🥉';
    } else if (horas < 24) {
      textoAntiguedad = `Hace ${horas} hora${horas === 1 ? '' : 's'}`;
      rangoUsuario = 'Gamer Activo 🥈';
    } else if (dias === 1) {
      textoAntiguedad = 'Hace 1 día';
      rangoUsuario = 'Gamer Frecuente 🥇';
    } else if (dias < 30) {
      textoAntiguedad = `Hace ${dias} días`;
      rangoUsuario = 'Veterano del Setup 💎';
    } else if (dias < 365) {
      const meses = Math.floor(dias / 30);
      textoAntiguedad = `Hace ${meses} mes${meses === 1 ? '' : 'es'}`;
      rangoUsuario = 'Maestro Redragon 👑';
    } else {
      const anios = Math.floor(dias / 365);
      textoAntiguedad = `Hace ${anios} año${anios === 1 ? '' : 's'}`;
      rangoUsuario = 'Leyenda Inmortal 🔥';
    }

    return { texto: textoAntiguedad, rango: rangoUsuario };
  };

  const infoAntiguedad = calcularAntiguedadUsuario(usuarioActivo);

  const handleCambiarAvatarPC = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNuevoAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCambiarBannerPC = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNuevoBanner(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGuardarCambiosPerfil = (e) => {
    e.preventDefault();
    setErrorUsername('');
    if (nuevoUsername.trim() !== usuarioActivo.username) {
      if (diasRestantesUsername > 0) return setErrorUsername(`Solo puedes cambiar tu nombre de usuario una vez por semana (espera ${diasRestantesUsername} día(s)).`);
      const todos = JSON.parse(localStorage.getItem('redragon_usuarios')) || [];
      if (todos.some(u => u.username === nuevoUsername.trim() && u.email !== usuarioActivo.email)) return setErrorUsername('Este nombre de usuario ya está en uso.');
    }
    const actualizado = {
      ...usuarioActivo,
      username: nuevoUsername.trim() !== usuarioActivo.username ? nuevoUsername.trim() : usuarioActivo.username,
      ultimoCambioUsername: nuevoUsername.trim() !== usuarioActivo.username ? new Date().toISOString() : usuarioActivo.ultimoCambioUsername,
      bio: nuevaBio, 
      edad: nuevaEdad,
      avatar: nuevoAvatar,
      banner: nuevoBanner
    };
    actualizarUsuarioEnStorage(actualizado);
    setEditandoPerfil(false); 
    setModalExitoMensaje('¡Perfil actualizado con éxito!');
  };

  const solicitarCodigoPass = (e) => {
    e.preventDefault();
    setErrorPass('');
    if (diasRestantesPass > 0) return setErrorPass(`Debes esperar ${diasRestantesPass} día(s) más para cambiar tu contraseña.`);
    setPasoPassCodigo(true);
    setModalExitoMensaje(`Código de verificación enviado a ${usuarioActivo.email}.`);
  };

  const verificarCodigoYCambiarPass = (e) => {
    e.preventDefault();
    setErrorPass('');
    if (codigoIngresadoPass.trim().length !== 6) return setErrorPass('Ingresa un código de 6 dígitos válido.');
    if (!nuevaPassword.trim() || nuevaPassword.length < 4) return setErrorPass('Mínimo 4 caracteres.');
    actualizarUsuarioEnStorage({ ...usuarioActivo, password: nuevaPassword.trim(), ultimoCambioPass: new Date().toISOString() });
    setModoCambioPass(false); setPasoPassCodigo(false); setCodigoIngresadoPass(''); setNuevaPassword('');
    setModalExitoMensaje('¡Contraseña cambiada exitosamente!');
  };

  const cambiarEmailUsuario = (e) => {
    e.preventDefault();
    setErrorEmail('');
    if (diasRestantesEmail > 0) return setErrorEmail(`Solo puedes cambiar tu correo 1 vez por semana. Espera ${diasRestantesEmail} día(s).`);
    if (!nuevoEmailInput.trim() || !nuevoEmailInput.includes('@')) return setErrorEmail('Ingresa un correo electrónico válido.');

    const todos = JSON.parse(localStorage.getItem('redragon_usuarios')) || [];
    if (todos.some(u => u.email === nuevoEmailInput.trim())) return setErrorEmail('Este correo ya está registrado.');

    const actualizado = { ...usuarioActivo, email: nuevoEmailInput.trim(), ultimoCambioEmail: new Date().toISOString() };
    actualizarUsuarioEnStorage(actualizado);
    setModoCambioEmail(false);
    setNuevoEmailInput('');
    setModalExitoMensaje('¡Correo electrónico actualizado con éxito!');
  };

  const handleAgregarDireccion = (e) => {
    e.preventDefault();
    setErrorDireccion('');
    if (!nuevaNombreDir.trim() || !nuevaCalle.trim() || !rutDireccion.trim()) return setErrorDireccion('Completa todos los campos obligatorios.');
    if (rutDireccion.replace(/[^0-9kK]/g, '').length < 8) return setErrorDireccion('El RUT ingresado no es válido.');
    
    const nuevaDirObj = { 
      nombre: nuevaNombreDir.trim(), 
      calle: nuevaCalle.trim(), 
      comuna: comunaSeleccionada, 
      region: regionesChile[regionSeleccionadaIdx].region, 
      rut: rutDireccion.trim(),
      observacion: nuevaObservacionDir.trim() 
    };
    actualizarUsuarioEnStorage({ ...usuarioActivo, direcciones: [...(usuarioActivo.direcciones || []), nuevaDirObj] });
    setNuevaNombreDir(''); setNuevaCalle(''); setRutDireccion(''); setNuevaObservacionDir('');
    setModalExitoMensaje('¡Dirección agregada!');
  };

  const handleAgregarTarjeta = (e) => {
    e.preventDefault();
    setErrorTarjeta('');
    if (!numeroTarjeta.trim() || !titularTarjeta.trim() || !expTarjeta.trim() || !cvvTarjeta.trim()) {
      return setErrorTarjeta('Completa todos los datos de la tarjeta.');
    }
    if (!validarTarjetaNoVencida(expTarjeta)) {
      return setErrorTarjeta('La tarjeta ingresada está vencida. Por favor, ingresa una tarjeta vigente.');
    }
    const nuevaTarjetaObj = { numero: numeroTarjeta.trim(), titular: titularTarjeta.trim(), expiracion: expTarjeta.trim(), cvv: cvvTarjeta.trim() };
    actualizarUsuarioEnStorage({ ...usuarioActivo, tarjetas: [...(usuarioActivo.tarjetas || []), nuevaTarjetaObj] });
    setNumeroTarjeta(''); setTitularTarjeta(''); setExpTarjeta(''); setCvvTarjeta('');
    setModalExitoMensaje('¡Tarjeta agregada exitosamente!');
  };

  const invitarAmigo = (e) => {
    e.preventDefault();
    setMensajeAmigo({ texto: '', error: false });
    const amigoLimpio = amigoInput.trim().toLowerCase();
    if (!amigoLimpio) return;
    if (amigoLimpio === usuarioActivo.username.toLowerCase()) return setMensajeAmigo({ texto: 'No puedes invitarte a ti mismo.', error: true });

    const todos = JSON.parse(localStorage.getItem('redragon_usuarios')) || [];
    const amigoEncontrado = todos.find(u => u.username.toLowerCase() === amigoLimpio);
    if (!amigoEncontrado) return setMensajeAmigo({ texto: '❌ Usuario no encontrado.', error: true });
    if ((amigoEncontrado.amigosBloqueados || []).includes(usuarioActivo.username.toLowerCase())) return setMensajeAmigo({ texto: 'No puedes interactuar con este usuario.', error: true });
    if ((usuarioActivo.amigosBloqueados || []).includes(amigoLimpio)) return setMensajeAmigo({ texto: 'Debes desbloquear a este usuario primero.', error: true });
    const amigosActuales = usuarioActivo.amigosWishlist || [];
    if (amigosActuales.some(a => a.username.toLowerCase() === amigoLimpio)) return setMensajeAmigo({ texto: '⚠️ Ya existe una relación con este usuario.', error: true });

    const nuevaRelacionMia = { username: amigoEncontrado.username, rol: 'enviado', estado: 'pendiente' };
    actualizarUsuarioEnStorage({ ...usuarioActivo, amigosWishlist: [...amigosActuales, nuevaRelacionMia] });

    actualizarUsuarioPorUsername(amigoEncontrado.username, (amigoUser) => {
      const nuevaRelacionAmigo = { username: usuarioActivo.username, rol: 'recibido', estado: 'pendiente', fecha: new Date().toLocaleDateString() };
      return { ...amigoUser, amigosWishlist: [...(amigoUser.amigosWishlist || []), nuevaRelacionAmigo], notificaciones: [{ id: Date.now(), tipo: 'solicitud_amistad', emisor: usuarioActivo.username, mensaje: `te ha enviado una solicitud de amistad.`, fecha: new Date().toLocaleDateString(), estado: 'pendiente' }, ...(amigoUser.notificaciones || [])] };
    });

    setAmigoInput('');
    setMensajeAmigo({ texto: `🎉 ¡Solicitud enviada a @${amigoEncontrado.username}!`, error: false });
  };

  const responderSolicitudAmigo = (usernameAmigo, aceptar) => {
    const nuevosAmigosYo = (usuarioActivo.amigosWishlist || []).map(a => a.username.toLowerCase() === usernameAmigo.toLowerCase() ? { ...a, estado: aceptar ? 'aceptado' : 'rechazado' } : a).filter(a => a.estado !== 'rechazado');
    actualizarUsuarioEnStorage({ ...usuarioActivo, amigosWishlist: nuevosAmigosYo });

    actualizarUsuarioPorUsername(usernameAmigo, (amigoUser) => {
      const nuevosAmigosAmigo = (amigoUser.amigosWishlist || []).map(a => a.username.toLowerCase() === usuarioActivo.username.toLowerCase() ? { ...a, estado: aceptar ? 'aceptado' : 'rechazado' } : a).filter(a => a.estado !== 'rechazado');
      return { ...amigoUser, amigosWishlist: nuevosAmigosAmigo, notificaciones: [{ id: Date.now(), tipo: aceptar ? 'amigo_aceptado' : 'amigo', mensaje: `@${usuarioActivo.username} ha ${aceptar ? 'aceptado' : 'rechazado'} tu solicitud.`, fecha: new Date().toLocaleDateString(), estado: 'pendiente', emisor: usuarioActivo.username }, ...(amigoUser.notificaciones || [])] };
    });

    setModalExitoMensaje(aceptar ? `¡Ahora eres amigo de @${usernameAmigo}!` : 'Solicitud rechazada.');
  };

  const eliminarAmigo = (usernameAmigo) => {
    actualizarUsuarioEnStorage({ ...usuarioActivo, amigosWishlist: (usuarioActivo.amigosWishlist || []).filter(a => a.username.toLowerCase() !== usernameAmigo.toLowerCase()) });
    actualizarUsuarioPorUsername(usernameAmigo, (amigoUser) => ({
      ...amigoUser, amigosWishlist: (amigoUser.amigosWishlist || []).filter(a => a.username.toLowerCase() !== usuarioActivo.username.toLowerCase())
    }));
    setModalExitoMensaje(`Has eliminado a @${usernameAmigo} de tus amigos.`);
  };

  const bloquearSolamente = (usernameAmigo) => {
    const nuevosAmigos = (usuarioActivo.amigosWishlist || []).filter(a => a.username.toLowerCase() !== usernameAmigo.toLowerCase());
    const nuevosBloqueados = [...(usuarioActivo.amigosBloqueados || []), usernameAmigo.toLowerCase()];
    actualizarUsuarioEnStorage({ ...usuarioActivo, amigosWishlist: nuevosAmigos, amigosBloqueados: nuevosBloqueados });
    actualizarUsuarioPorUsername(usernameAmigo, (amigoUser) => ({
      ...amigoUser, amigosWishlist: (amigoUser.amigosWishlist || []).filter(a => a.username.toLowerCase() !== usuarioActivo.username.toLowerCase())
    }));
    setModalExitoMensaje(`Has bloqueado a @${usernameAmigo}.`);
    setAmigoABloquear(null);
  };

  const bloquearYEliminar = (usernameAmigo) => {
    const nuevosAmigos = (usuarioActivo.amigosWishlist || []).filter(a => a.username.toLowerCase() !== usernameAmigo.toLowerCase());
    const nuevosBloqueados = [...(usuarioActivo.amigosBloqueados || []), usernameAmigo.toLowerCase()];
    const nuevasNotif = (usuarioActivo.notificaciones || []).filter(n => n.emisor?.toLowerCase() !== usernameAmigo.toLowerCase());
    
    actualizarUsuarioEnStorage({ 
      ...usuarioActivo, 
      amigosWishlist: nuevosAmigos, 
      amigosBloqueados: nuevosBloqueados,
      notificaciones: nuevasNotif 
    });

    actualizarUsuarioPorUsername(usernameAmigo, (amigoUser) => ({
      ...amigoUser, 
      amigosWishlist: (amigoUser.amigosWishlist || []).filter(a => a.username.toLowerCase() !== usuarioActivo.username.toLowerCase()),
      notificaciones: (amigoUser.notificaciones || []).filter(n => n.emisor?.toLowerCase() !== usuarioActivo.username.toLowerCase())
    }));

    setModalExitoMensaje(`Has bloqueado y eliminado todo registro con @${usernameAmigo}.`);
    setAmigoABloquear(null);
  };

  const desbloquearAmigo = (usernameAmigo) => {
    const nuevosBloqueados = (usuarioActivo.amigosBloqueados || []).filter(u => u !== usernameAmigo.toLowerCase());
    actualizarUsuarioEnStorage({ ...usuarioActivo, amigosBloqueados: nuevosBloqueados });
    setModalExitoMensaje(`Has desbloqueado a @${usernameAmigo}.`);
  };

  const abrirPerfilAmigo = (usernameAmigo) => {
    const todos = JSON.parse(localStorage.getItem('redragon_usuarios')) || [];
    const amigoEncontrado = todos.find(u => u.username.toLowerCase() === usernameAmigo.toLowerCase());
    if (amigoEncontrado) {
      setAmigoPerfilSeleccionado(amigoEncontrado);
      setVerWishlistAmigoModal(false);
    }
  };

  const enviarReporteAmigo = (e) => {
    e.preventDefault();
    if (!motivoReporteTexto.trim()) return;
    setModalExitoMensaje(`Reporte enviado contra @${amigoReporteSeleccionado}. Motivo: "${motivoReporteTexto}". El equipo lo revisará.`);
    setAmigoReporteSeleccionado(null);
    setMotivoReporteTexto('');
  };

  const pedidosHistorial = JSON.parse(localStorage.getItem('redragon_compras')) || [];
  const misPedidos = pedidosHistorial.filter(p => p.email === usuarioActivo?.email);

  const eliminarPedidoHistorial = (id) => {
    const todos = JSON.parse(localStorage.getItem('redragon_compras')) || [];
    const filtrados = todos.filter(p => p.id !== id);
    localStorage.setItem('redragon_compras', JSON.stringify(filtrados));
    setFuerzaRecargaPedidos(!fuerzaRecargaPedidos);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 mt-8 animate-fade-in relative text-white">
      <button onClick={() => setVistaActual('home')} className="flex items-center gap-2 mb-6 font-bold transition cursor-pointer hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
        <ArrowLeft size={20} /> Volver al inicio
      </button>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 shadow-xl space-y-2 h-fit animate-card-appear">
          <div className="flex items-center gap-3 p-3 border-b border-zinc-800 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white overflow-hidden border shrink-0 shadow" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}>
              {usuarioActivo?.avatar ? <img src={usuarioActivo.avatar} alt="Avatar" className="w-full h-full object-cover" /> : usuarioActivo?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-white truncate max-w-[130px]">@{usuarioActivo?.username}</h4>
              <p className="text-xs text-zinc-400 truncate max-w-[130px]">{usuarioActivo?.email}</p>
            </div>
          </div>
          
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition cursor-pointer ${activeTab === 'profile' ? 'text-white shadow' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
            style={activeTab === 'profile' ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            <User size={18} /> Perfil
          </button>
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition cursor-pointer ${activeTab === 'orders' ? 'text-white shadow' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
            style={activeTab === 'orders' ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            <Package size={18} /> Mis Pedidos
          </button>
          <button 
            onClick={() => setActiveTab('friends')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition cursor-pointer ${activeTab === 'friends' ? 'text-white shadow' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
            style={activeTab === 'friends' ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            <Users size={18} /> Amigos
          </button>
          <button 
            onClick={() => setActiveTab('addresses')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition cursor-pointer ${activeTab === 'addresses' ? 'text-white shadow' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
            style={activeTab === 'addresses' ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            <MapPin size={18} /> Direcciones
          </button>
          <button 
            onClick={() => setActiveTab('cards')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition cursor-pointer ${activeTab === 'cards' ? 'text-white shadow' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
            style={activeTab === 'cards' ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            <CreditCard size={18} /> Tarjetas
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition cursor-pointer ${activeTab === 'settings' ? 'text-white shadow' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
            style={activeTab === 'settings' ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            <Settings size={18} /> Configuración
          </button>
        </div>

        <div className="md:col-span-3 bg-zinc-900 rounded-xl p-6 border border-zinc-800 shadow-xl space-y-6 animate-scale-up">
          
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h2 className="text-2xl font-bold text-white">Información Personal</h2>
                <button onClick={() => { setEditandoPerfil(!editandoPerfil); setNuevoAvatar(usuarioActivo?.avatar || ''); setNuevoBanner(usuarioActivo?.banner || ''); }} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition cursor-pointer">
                  {editandoPerfil ? 'Cancelar Edición' : 'Editar Perfil Público'}
                </button>
              </div>

              {!editandoPerfil ? (
                <div className="space-y-6 animate-fade-in">
                  <div className="relative rounded-xl overflow-visible border border-zinc-700 shadow-lg mb-10">
                    <div className="h-32 bg-zinc-800 bg-cover bg-center rounded-t-xl" style={{ backgroundImage: usuarioActivo.banner ? `url(${usuarioActivo.banner})` : 'url(/images/banner-default.jpg)' }}></div>
                    <div className="absolute -bottom-8 left-6 flex items-end gap-4 z-10">
                      <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center text-3xl font-bold text-white overflow-hidden border-4 border-zinc-900 shrink-0 shadow-xl">
                        {usuarioActivo?.avatar ? <img src={usuarioActivo.avatar} alt="Avatar" className="w-full h-full object-cover" /> : usuarioActivo?.username?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 px-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white">@{usuarioActivo.username}</h3>
                        <p className="text-sm text-zinc-400 mt-1 italic">"{usuarioActivo.bio || 'Sin biografía.'}"</p>
                      </div>
                      <div className="bg-zinc-950 border px-3 py-1.5 rounded-lg text-right" style={{ borderColor: 'var(--color-primary)' }}>
                        <span className="text-[9px] text-zinc-400 uppercase font-bold block">Rango Gamer</span>
                        <span className="text-xs font-black" style={{ color: 'var(--color-primary)' }}>{infoAntiguedad.rango}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      <div className="bg-zinc-800/60 p-4 rounded-lg border border-zinc-700/50 animate-card-appear"><span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Nombre Completo</span><p className="text-sm font-bold text-white mt-1">{usuarioActivo.nombreCompleto}</p></div>
                      <div className="bg-zinc-800/60 p-4 rounded-lg border border-zinc-700/50 animate-card-appear"><span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Edad</span><p className="text-sm font-bold mt-1 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}><User size={14} className="text-zinc-400"/> {usuarioActivo.edad ? `${usuarioActivo.edad} años` : 'No especificada'}</p></div>
                      <div className="bg-zinc-800/60 p-4 rounded-lg border border-zinc-700/50 animate-card-appear"><span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Antigüedad</span><p className="text-sm font-bold mt-1 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}><Clock size={14} className="text-zinc-400"/> {infoAntiguedad.texto}</p></div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleGuardarCambiosPerfil} className="space-y-6 bg-zinc-800/30 p-5 rounded-lg border border-zinc-700/60 animate-fade-in">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-zinc-700 pb-2"><User size={16} style={{ color: 'var(--color-primary)' }} /> Modificar Datos del Perfil Público y Personalizar Imágenes</h3>
                  
                  {errorUsername && <div className="bg-red-950/80 border border-red-500 text-red-300 p-3 rounded-lg text-xs font-semibold animate-fade-in">{errorUsername}</div>}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900/60 p-4 rounded-lg border border-zinc-700">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-400 mb-2">Foto de Perfil (Avatar)</label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden border border-zinc-600 flex items-center justify-center shrink-0">
                          {nuevoAvatar ? <img src={nuevoAvatar} alt="Preview" className="w-full h-full object-cover"/> : <User size={20} className="text-zinc-400"/>}
                        </div>
                        <label className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-3 py-2 rounded cursor-pointer border border-zinc-600 flex items-center gap-1.5 transition">
                          <Upload size={14}/> Cambiar Avatar
                          <input type="file" accept="image/*" onChange={handleCambiarAvatarPC} className="hidden" />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-400 mb-2">Banner de Perfil</label>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-10 rounded bg-zinc-800 overflow-hidden border border-zinc-600 bg-cover bg-center shrink-0" style={{ backgroundImage: nuevoBanner ? `url(${nuevoBanner})` : 'none' }}>
                          {!nuevoBanner && <span className="text-[9px] text-zinc-500 flex items-center justify-center h-full">Sin banner</span>}
                        </div>
                        <label className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-3 py-2 rounded cursor-pointer border border-zinc-600 flex items-center gap-1.5 transition">
                          <Upload size={14}/> Cambiar Banner
                          <input type="file" accept="image/*" onChange={handleCambiarBannerPC} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Nombre de Usuario</label>
                        <input type="text" value={nuevoUsername} onChange={e => setNuevoUsername(e.target.value)} disabled={diasRestantesUsername > 0} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2.5 text-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed" style={{ focusBorderColor: 'var(--color-primary)' }} />
                        {diasRestantesUsername > 0 ? (
                          <p className="text-[10px] text-yellow-500 mt-1 flex items-center gap-1"><Lock size={10}/> Límite semanal: Podrás cambiarlo en {diasRestantesUsername} día(s).</p>
                        ) : (
                          <p className="text-[10px] text-green-400 mt-1 flex items-center gap-1"><CheckCircle size={10}/> Cambio disponible ahora mismo (1 vez por semana).</p>
                        )}
                      </div>
                      <div><label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Edad</label><input type="number" min="10" max="99" value={nuevaEdad} onChange={e => setNuevaEdad(e.target.value)} placeholder="Ej. 21" className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2.5 text-sm outline-none" style={{ focusBorderColor: 'var(--color-primary)' }} /></div>
                    </div>
                    <div className="space-y-4">
                      <div><label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Biografía Corta</label><textarea maxLength="120" value={nuevaBio} onChange={e => setNuevaBio(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2.5 text-sm h-24 resize-none outline-none" style={{ focusBorderColor: 'var(--color-primary)' }}></textarea></div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-700 pt-4 mt-4 space-y-3">
                    <h4 className="font-bold text-white text-xs uppercase flex items-center gap-1.5"><Mail size={14} style={{ color: 'var(--color-primary)' }} /> Correo Electrónico</h4>
                    <p className="text-xs text-zinc-400">Correo actual: <strong className="text-white">{usuarioActivo.email}</strong></p>
                    
                    {!modoCambioEmail ? (
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setModoCambioEmail(true)} disabled={diasRestantesEmail > 0} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-bold transition cursor-pointer border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed">Modificar Correo</button>
                        {diasRestantesEmail > 0 ? (
                          <span className="text-[10px] text-yellow-500 flex items-center gap-1"><Lock size={10}/> Disponible en {diasRestantesEmail} día(s).</span>
                        ) : (
                          <span className="text-[10px] text-green-400 flex items-center gap-1"><CheckCircle size={10}/> Disponible para cambio semanal.</span>
                        )}
                      </div>
                    ) : (
                      <div className="bg-zinc-900/80 p-4 rounded-lg border border-zinc-700 space-y-3 animate-scale-up">
                        {errorEmail && <div className="text-red-400 text-xs font-semibold">{errorEmail}</div>}
                        <input type="email" placeholder="Nuevo correo electrónico" value={nuevoEmailInput} onChange={e => setNuevoEmailInput(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2 text-xs" />
                        <div className="flex gap-2">
                          <button type="button" onClick={cambiarEmailUsuario} className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-bold cursor-pointer">Actualizar Correo</button>
                          <button type="button" onClick={() => setModoCambioEmail(false)} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded text-xs font-bold">Cancelar</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-zinc-700 pt-4 mt-4 space-y-3">
                    <h4 className="font-bold text-white text-xs uppercase flex items-center gap-1.5"><Lock size={14} style={{ color: 'var(--color-primary)' }} /> Cambio de Contraseña</h4>
                    {!modoCambioPass ? (
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setModoCambioPass(true)} disabled={diasRestantesPass > 0} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-bold transition cursor-pointer border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed">Cambiar Contraseña</button>
                        {diasRestantesPass > 0 ? (
                          <span className="text-[10px] text-yellow-500 flex items-center gap-1"><Lock size={10}/> Disponible en {diasRestantesPass} día(s).</span>
                        ) : (
                          <span className="text-[10px] text-green-400 flex items-center gap-1"><CheckCircle size={10}/> Disponible para cambio semanal.</span>
                        )}
                      </div>
                    ) : (
                      <div className="bg-zinc-900/80 p-4 rounded-lg border border-zinc-700 space-y-3 animate-scale-up">
                        {errorPass && <div className="text-red-400 text-xs font-semibold">{errorPass}</div>}
                        {!pasoPassCodigo ? (
                          <button type="button" onClick={solicitarCodigoPass} className="text-white px-4 py-2 rounded text-xs font-bold cursor-pointer border shadow" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}>Enviar Código de Verificación</button>
                        ) : (
                          <div className="space-y-3">
                            <input type="text" maxLength="6" placeholder="Código 6 dígitos" value={codigoIngresadoPass} onChange={e => setCodigoIngresadoPass(e.target.value.replace(/\D/g, ''))} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2 text-xs font-mono text-center" />
                            <input type="password" placeholder="Nueva Contraseña" value={nuevaPassword} onChange={e => setNuevaPassword(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2 text-xs" />
                            <button type="button" onClick={verificarCodigoYCambiarPass} className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-bold cursor-pointer">Confirmar Nueva Contraseña</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-6 mt-6 border-t border-zinc-700/60 flex justify-end">
                    <button type="submit" className="text-white px-8 py-3 rounded-lg font-bold text-sm transition cursor-pointer shadow-lg border" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}>Guardar Cambios del Perfil</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-3">Gestión de Amigos</h2>
              
              <div className="bg-zinc-800/40 p-4 rounded-lg border border-zinc-700/60 space-y-4 animate-card-appear">
                <h3 className="font-bold text-white text-sm flex items-center gap-2"><UserPlus size={16} style={{ color: 'var(--color-primary)' }} /> Añadir a un amigo</h3>
                <form onSubmit={invitarAmigo} className="flex gap-2">
                  <input type="text" placeholder="Buscar nombre de usuario (Ej. Juanito)" value={amigoInput} onChange={e => setAmigoInput(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-700 text-white rounded px-3 py-2 text-xs outline-none" />
                  <button type="submit" className="text-white px-4 py-2 rounded text-xs font-bold transition cursor-pointer border shadow" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}>Enviar Solicitud</button>
                </form>
                {mensajeAmigo.texto && <p className={`text-xs font-semibold ${mensajeAmigo.error ? 'text-red-400' : 'text-green-400'}`}>{mensajeAmigo.texto}</p>}
              </div>

              {usuarioActivo.amigosWishlist && usuarioActivo.amigosWishlist.length > 0 && (
                <div className="space-y-3 animate-fade-in">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tu Lista de Amigos</p>
                  <div className="grid grid-cols-1 gap-2">
                    {usuarioActivo.amigosWishlist.map((amigoObj, idx) => (
                      <div key={idx} className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg flex items-center justify-between text-xs animate-card-appear">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">@{amigoObj.username}</span>
                          {amigoObj.estado === 'pendiente' && amigoObj.rol === 'enviado' && <span className="bg-yellow-600/20 text-yellow-400 px-2 py-0.5 rounded font-bold">Solicitud enviada</span>}
                          {amigoObj.estado === 'pendiente' && amigoObj.rol === 'recibido' && <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded font-bold">Quiere ser tu amigo</span>}
                          {amigoObj.estado === 'aceptado' && <span className="bg-green-600/20 text-green-400 px-2 py-0.5 rounded font-bold">Amigo ✓</span>}
                        </div>

                        <div className="flex items-center gap-2">
                          {amigoObj.estado === 'pendiente' && amigoObj.rol === 'recibido' && (
                            <>
                              <button onClick={() => responderSolicitudAmigo(amigoObj.username, true)} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded font-bold cursor-pointer">Aceptar</button>
                              <button onClick={() => responderSolicitudAmigo(amigoObj.username, false)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded font-bold cursor-pointer">Rechazar</button>
                            </>
                          )}
                          
                          <div className="flex items-center gap-1.5 border-l border-zinc-700 pl-2 ml-2">
                            <button onClick={() => abrirPerfilAmigo(amigoObj.username)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2 py-1 rounded font-bold flex items-center gap-1 transition cursor-pointer" title="Ver Perfil"><Eye size={14}/> Perfil</button>
                            <button onClick={() => setAmigoAEliminar(amigoObj.username)} className="bg-zinc-800 hover:bg-red-950/60 text-red-400 px-2 py-1 rounded font-bold transition cursor-pointer" title="Eliminar Amigo"><Trash2 size={14}/></button>
                            <button onClick={() => setAmigoABloquear(amigoObj.username)} className="bg-zinc-800 hover:bg-red-950/60 text-yellow-500 px-2 py-1 rounded font-bold transition cursor-pointer" title="Bloquear Usuario"><Ban size={14}/></button>
                            <button onClick={() => setAmigoReporteSeleccionado(amigoObj.username)} className="bg-zinc-800 hover:bg-red-950/60 text-red-500 px-2 py-1 rounded font-bold transition cursor-pointer" title="Reportar Usuario"><Flag size={14}/></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {usuarioActivo.amigosBloqueados && usuarioActivo.amigosBloqueados.length > 0 && (
                <div className="pt-4 border-t border-zinc-800/50 space-y-3 animate-fade-in">
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-2"><Ban size={14}/> Usuarios Bloqueados</p>
                  <div className="grid grid-cols-1 gap-2 opacity-70">
                    {usuarioActivo.amigosBloqueados.map((blockUser, idx) => (
                      <div key={idx} className="bg-red-950/20 border border-red-900/30 p-3 rounded-lg flex items-center justify-between text-xs animate-card-appear">
                        <span className="font-bold text-zinc-400 line-through">@{blockUser}</span>
                        <button onClick={() => desbloquearAmigo(blockUser)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded font-bold cursor-pointer">Desbloquear</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6 relative animate-fade-in">
              <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-3">Historial de Pedidos</h2>
              {misPedidos.length === 0 ? <p className="text-zinc-400 py-8 text-center">Aún no has realizado ninguna compra.</p> : (
                <div className="space-y-4">
                  {misPedidos.slice().reverse().map((pedido, idx) => (
                    <div key={pedido.id || idx} className="bg-zinc-800/40 border border-zinc-700/50 rounded-lg p-4 transition-all space-y-3 animate-card-appear">
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-700/50">
                        <div>
                          <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>Orden #{pedido.id}</span>
                          <span className="text-xs text-zinc-400 ml-3">{pedido.fecha}</span>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${pedido.estado === 'Entregado' || pedido.estado === 'Recibido' ? 'bg-green-600/20 text-green-400' : 'bg-blue-600/20 text-blue-400'}`}>
                          {pedido.estado || 'Procesando'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold">Total: <span style={{ color: 'var(--color-primary)' }}>{formatearCLP(pedido.total)}</span></span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              localStorage.setItem('redragon_orden_activa', pedido.id);
                              setVistaActual('track-order');
                            }} 
                            className="bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold px-3 py-1.5 rounded cursor-pointer transition"
                          >
                            Ver Detalles / Estado
                          </button>
                          <button 
                            onClick={() => setPedidoAEliminar(pedido.id)} 
                            className="bg-zinc-800 hover:bg-zinc-700 text-red-400 text-xs font-bold px-3 py-1.5 rounded cursor-pointer transition border border-zinc-700 flex items-center gap-1"
                          >
                            <Trash2 size={14}/> Eliminar Registro
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-3">Mis Direcciones de Envío</h2>
              
              <form onSubmit={handleAgregarDireccion} className="bg-zinc-800/40 p-5 rounded-lg border border-zinc-700/60 space-y-4 animate-card-appear">
                <h3 className="font-bold text-white text-sm flex gap-2"><MapPin size={16} style={{ color: 'var(--color-primary)' }} /> Agregar Dirección</h3>
                {errorDireccion && <div className="text-red-400 text-xs font-semibold bg-red-950/50 p-2 rounded">{errorDireccion}</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select value={regionSeleccionadaIdx} onChange={e => { setRegionSeleccionadaIdx(Number(e.target.value)); setComunaSeleccionada(regionesChile[Number(e.target.value)].comunas[0]); }} className="w-full bg-zinc-900 border border-zinc-700 text-white rounded px-3 py-2 text-xs outline-none">
                    {regionesChile.map((r, i) => <option key={i} value={i}>{r.region}</option>)}
                  </select>
                  <select value={comunaSeleccionada} onChange={e => setComunaSeleccionada(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white rounded px-3 py-2 text-xs outline-none">
                    {regionesChile[regionSeleccionadaIdx].comunas.map((com, cIdx) => <option key={cIdx} value={com}>{com}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <input type="text" placeholder="Nombre (Ej: Casa, Trabajo)" value={nuevaNombreDir} onChange={e => setNuevaNombreDir(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white rounded px-3 py-2 text-xs outline-none" style={{ focusBorderColor: 'var(--color-primary)' }} />
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <input type="text" placeholder="Calle y número" value={nuevaCalle} onChange={e => setNuevaCalle(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white rounded px-3 py-2 text-xs outline-none" style={{ focusBorderColor: 'var(--color-primary)' }} />
                  </div>
                  <div className="col-span-1">
                    <input type="text" placeholder="RUT (Ej: 12.345.678-9)" value={rutDireccion} onChange={e => setRutDireccion(formatearRutInput(e.target.value))} maxLength="12" className="w-full bg-zinc-900 border border-zinc-700 text-white rounded px-3 py-2 text-xs outline-none" style={{ focusBorderColor: 'var(--color-primary)' }} />
                  </div>
                </div>

                {/* Nuevo campo de Observación */}
                <div>
                  <input type="text" placeholder="Observación / Referencia (Ej: Dejar en conserjería, timbre 402)" value={nuevaObservacionDir} onChange={e => setNuevaObservacionDir(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white rounded px-3 py-2 text-xs outline-none" style={{ focusBorderColor: 'var(--color-primary)' }} />
                </div>

                <button type="submit" className="text-white px-6 py-2.5 rounded font-bold text-xs shadow cursor-pointer transition border" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}>Agregar Dirección</button>
              </form>

              <div className="grid grid-cols-1 gap-4">
                {(!usuarioActivo.direcciones || usuarioActivo.direcciones.length === 0) ? <p className="text-zinc-400 text-xs py-4">Sin direcciones registradas.</p> : usuarioActivo.direcciones.map((dir, idx) => (
                  <div key={idx} className="bg-zinc-800/60 p-4 rounded-lg border border-zinc-700/50 flex justify-between items-start animate-card-appear">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-bold">{dir.nombre || 'Dirección'}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold border" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}>RUT: {dir.rut}</span>
                      </div>
                      <p className="text-zinc-300 text-sm">{dir.calle}</p>
                      {dir.observacion && <p className="text-xs text-zinc-400 italic mt-0.5">Obs: {dir.observacion}</p>}
                      <p className="text-xs text-zinc-500">{dir.comuna}, {dir.region}</p>
                    </div>
                    <button onClick={() => { const nuevas = usuarioActivo.direcciones.filter((_, i) => i !== idx); actualizarUsuarioEnStorage({ ...usuarioActivo, direcciones: nuevas }); }} className="text-zinc-500 hover:text-red-500 transition cursor-pointer p-2"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'cards' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-3">Tarjetas Guardadas</h2>
              
              <form onSubmit={handleAgregarTarjeta} className="bg-zinc-800/40 p-5 rounded-lg border border-zinc-700/60 space-y-4 animate-card-appear">
                <h3 className="font-bold text-white text-sm flex gap-2"><CreditCard size={16} style={{ color: 'var(--color-primary)' }} /> Agregar Tarjeta</h3>
                {errorTarjeta && <div className="text-red-400 text-xs font-semibold bg-red-950/40 p-2 rounded border border-red-900">{errorTarjeta}</div>}
                
                <input 
                  type="text" 
                  placeholder="Número de Tarjeta (Ej: 4000 1234 5678 9010)" 
                  maxLength="19" 
                  value={numeroTarjeta} 
                  onChange={manejarCambioNumeroTarjeta} 
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2.5 text-xs font-mono outline-none" 
                  style={{ focusBorderColor: 'var(--color-primary)' }}
                  required 
                />
                
                <div className="grid grid-cols-3 gap-4">
                  <input 
                    type="text" 
                    placeholder="Titular" 
                    value={titularTarjeta} 
                    onChange={e => setTitularTarjeta(e.target.value)} 
                    className="col-span-1 bg-zinc-800 border border-zinc-700 text-white rounded p-2.5 text-xs outline-none" 
                    style={{ focusBorderColor: 'var(--color-primary)' }}
                    required 
                  />
                  <input 
                    type="text" 
                    placeholder="Exp MM/AA" 
                    maxLength="5" 
                    value={expTarjeta} 
                    onChange={manejarCambioExpiracion} 
                    className="col-span-1 bg-zinc-800 border border-zinc-700 text-white rounded p-2.5 text-xs font-mono text-center outline-none" 
                    style={{ focusBorderColor: 'var(--color-primary)' }}
                    required 
                  />
                  <input 
                    type="password" 
                    placeholder="CVV" 
                    maxLength="4" 
                    value={cvvTarjeta} 
                    onChange={e => setCvvTarjeta(e.target.value.replace(/\D/g, ''))} 
                    className="col-span-1 bg-zinc-800 border border-zinc-700 text-white rounded p-2.5 text-xs font-mono text-center outline-none" 
                    style={{ focusBorderColor: 'var(--color-primary)' }}
                    required 
                  />
                </div>
                <button type="submit" className="text-white px-5 py-2.5 rounded font-bold text-xs shadow cursor-pointer transition border" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}>Agregar Tarjeta</button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(!usuarioActivo.tarjetas || usuarioActivo.tarjetas.length === 0) ? <p className="text-zinc-400 text-xs py-4">Sin tarjetas registradas.</p> : usuarioActivo.tarjetas.map((card, idx) => {
                  const numStr = String(card.numero || '');
                  const ultimos4 = numStr.slice(-4);
                  return (
                    <div key={idx} className="bg-gradient-to-r from-zinc-800 to-zinc-900 p-4 rounded-lg border border-zinc-700 flex justify-between items-center shadow-lg animate-card-appear">
                      <div>
                        <CreditCard className="mb-2" size={24} style={{ color: 'var(--color-primary)' }} />
                        <p className="text-white font-mono font-bold tracking-wider">•••• •••• •••• {ultimos4}</p>
                        <p className="text-xs text-zinc-400 mt-1">Titular: {card.titular} | Exp: {card.expiracion}</p>
                      </div>
                      <button onClick={() => { const nuevas = usuarioActivo.tarjetas.filter((_, i) => i !== idx); actualizarUsuarioEnStorage({ ...usuarioActivo, tarjetas: nuevas }); }} className="text-zinc-500 hover:text-red-500 transition cursor-pointer"><Trash2 size={16}/></button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-3">Configuración de la Cuenta</h2>
              <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-lg space-y-4 animate-card-appear">
                <h3 className="text-lg font-bold text-red-400">Zona de Peligro</h3>
                <p className="text-sm text-zinc-400">Si eliminas tu cuenta, se borrarán todos tus datos asociados, direcciones y tarjetas guardadas.</p>
                <button onClick={() => { setTextoConfirmacion(''); setPasswordBorrar(''); setErrorBorrar(''); setModalBorrarCuenta(true); }} className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-lg transition cursor-pointer flex gap-2"><Trash2 size={18} /> Eliminar Cuenta</button>
              </div>
            </div>
          )}

          {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR AMIGO */}
          {amigoAEliminar && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 text-white animate-fade-in">
              <div className="bg-zinc-900 border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-5 text-center animate-scale-up" style={{ borderColor: 'var(--color-primary)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl font-bold border shadow-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}>
                  <AlertTriangle size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">¿Eliminar amigo?</h3>
                  <p className="text-xs text-zinc-400">¿Estás seguro de que deseas eliminar a @{amigoAEliminar} de tu lista de amigos?</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setAmigoAEliminar(null)} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-bold text-sm cursor-pointer">Cancelar</button>
                  <button type="button" onClick={() => { eliminarAmigo(amigoAEliminar); setAmigoAEliminar(null); }} className="flex-1 py-2.5 text-white rounded-lg font-bold text-sm cursor-pointer border shadow" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}>Sí, eliminar</button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL DE OPCIONES DE BLOQUEO */}
          {amigoABloquear && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 text-white animate-fade-in">
              <div className="bg-zinc-900 border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-5 text-center animate-scale-up" style={{ borderColor: 'var(--color-primary)' }}>
                <div className="w-16 h-16 bg-yellow-600/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold border border-yellow-500/30 shadow-lg">
                  <Ban size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Bloquear a @{amigoABloquear}</h3>
                  <p className="text-xs text-zinc-400">Elige una opción para gestionar la interacción con este usuario:</p>
                </div>
                <div className="space-y-2 pt-2">
                  <button type="button" onClick={() => bloquearSolamente(amigoABloquear)} className="w-full py-2.5 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg text-xs cursor-pointer transition">
                    Bloquear solamente
                  </button>
                  <button type="button" onClick={() => bloquearYEliminar(amigoABloquear)} className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs cursor-pointer transition">
                    Bloquear y eliminar
                  </button>
                  <button type="button" onClick={() => setAmigoABloquear(null)} className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-lg text-xs cursor-pointer transition">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL DE PERFIL DE AMIGO */}
          {amigoPerfilSeleccionado && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 text-white animate-fade-in">
              <div className="bg-zinc-900 border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up" style={{ borderColor: 'var(--color-primary)' }}>
                <div className="relative rounded-t-xl overflow-visible border-b border-zinc-700 mb-8">
                  <div className="h-32 bg-zinc-800 bg-cover bg-center" style={{ backgroundImage: amigoPerfilSeleccionado.banner ? `url(${amigoPerfilSeleccionado.banner})` : 'url(/images/banner-default.jpg)' }}></div>
                  <button onClick={() => setAmigoPerfilSeleccionado(null)} className="absolute top-3 right-3 bg-black/70 p-1.5 rounded-full hover:bg-zinc-700 transition text-white"><Trash2 size={16}/></button>
                  <div className="absolute -bottom-6 left-6 flex items-end gap-4 z-10">
                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center text-3xl font-bold text-white overflow-hidden border-4 border-zinc-900 shrink-0 shadow-xl">
                      {amigoPerfilSeleccionado?.avatar ? <img src={amigoPerfilSeleccionado.avatar} alt="Avatar" className="w-full h-full object-cover" /> : amigoPerfilSeleccionado?.username?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="pt-2 px-6 pb-6 overflow-y-auto flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white">@{amigoPerfilSeleccionado.username}</h3>
                      <p className="text-sm text-zinc-400 mt-1 italic">"{amigoPerfilSeleccionado.bio || 'Sin biografía.'}"</p>
                    </div>
                    <div className="bg-zinc-950 border px-3 py-1.5 rounded-lg text-right" style={{ borderColor: 'var(--color-primary)' }}>
                      <span className="text-[9px] text-zinc-400 uppercase font-bold block">Rango Gamer</span>
                      <span className="text-xs font-black" style={{ color: 'var(--color-primary)' }}>{calcularAntiguedadUsuario(amigoPerfilSeleccionado).rango}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-800/60 p-4 rounded-lg border border-zinc-700/50"><span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Nombre Completo</span><p className="text-sm font-bold text-white mt-1">{amigoPerfilSeleccionado.nombreCompleto || 'No especificado'}</p></div>
                    <div className="bg-zinc-800/60 p-4 rounded-lg border border-zinc-700/50"><span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Edad</span><p className="text-sm font-bold mt-1" style={{ color: 'var(--color-primary)' }}>{amigoPerfilSeleccionado.edad ? `${amigoPerfilSeleccionado.edad} años` : 'No especificada'}</p></div>
                    <div className="bg-zinc-800/60 p-4 rounded-lg border border-zinc-700/50"><span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Antigüedad</span><p className="text-sm font-bold mt-1" style={{ color: 'var(--color-primary)' }}>{calcularAntiguedadUsuario(amigoPerfilSeleccionado).texto}</p></div>
                  </div>

                  {/* SECCIÓN WISHLIST DEL AMIGO */}
                  <div className="border-t border-zinc-800 pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold flex items-center gap-2"><Heart className="fill-current" size={16} style={{ color: 'var(--color-primary)' }}/> Lista de Deseos de @{amigoPerfilSeleccionado.username}</h4>
                      <button onClick={() => setVerWishlistAmigoModal(!verWishlistAmigoModal)} className="text-xs font-bold cursor-pointer hover:underline" style={{ color: 'var(--color-primary)' }}>
                        {verWishlistAmigoModal ? 'Ocultar Wishlist' : 'Ver Wishlist Completa'}
                      </button>
                    </div>

                    {verWishlistAmigoModal && (
                      <div className="space-y-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800 max-h-48 overflow-y-auto animate-fade-in">
                        {(!amigoPerfilSeleccionado.wishlist || amigoPerfilSeleccionado.wishlist.length === 0) ? (
                          <p className="text-xs text-zinc-500 text-center py-4">Este usuario no tiene productos en su wishlist.</p>
                        ) : (
                          amigoPerfilSeleccionado.wishlist.map((prod, pIdx) => (
                            <div key={pIdx} className="flex items-center justify-between p-2 bg-zinc-900 rounded border border-zinc-800 text-xs animate-card-appear">
                              <div className="flex items-center gap-2">
                                <img src={prod.imagen} alt="" className="w-8 h-8 object-contain bg-black/40 p-1 rounded" />
                                <div><p className="font-bold text-white">{prod.nombre}</p><p style={{ color: 'var(--color-primary)' }}>{formatearCLP(prod.precio)}</p></div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-zinc-950 p-4 border-t border-zinc-800 flex justify-end">
                  <button onClick={() => setAmigoPerfilSeleccionado(null)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-lg font-bold text-xs cursor-pointer">Cerrar Perfil</button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL DE REPORTE DE AMIGO */}
          {amigoReporteSeleccionado && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 text-white animate-fade-in">
              <div className="bg-zinc-900 border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up" style={{ borderColor: 'var(--color-primary)' }}>
                <h3 className="text-lg font-bold border-b border-zinc-800 pb-3 flex items-center gap-2"><Flag size={18} style={{ color: 'var(--color-primary)' }}/> Reportar a @{amigoReporteSeleccionado}</h3>
                <form onSubmit={enviarReporteAmigo} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Selecciona o escribe el motivo del reporte</label>
                    <select onChange={e => setMotivoReporteTexto(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2 text-xs mb-2 outline-none">
                      <option value="">-- Elige un motivo --</option>
                      <option value="Comportamiento tóxico o acoso">Comportamiento tóxico o acoso</option>
                      <option value="Spam o enlaces maliciosos">Spam o enlaces maliciosos</option>
                      <option value="Intento de estafa">Intento de estafa</option>
                      <option value="Otro motivo">Otro motivo</option>
                    </select>
                    <textarea required placeholder="Escribe detalles adicionales..." value={motivoReporteTexto} onChange={e => setMotivoReporteTexto(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2 text-xs h-24 resize-none outline-none"></textarea>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setAmigoReporteSeleccionado(null)} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs font-bold cursor-pointer">Cancelar</button>
                    <button type="submit" className="flex-1 py-2.5 text-white rounded text-xs font-bold cursor-pointer border shadow" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}>Enviar Reporte</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR PEDIDO */}
          {pedidoAEliminar && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in p-4">
              <div className="bg-zinc-900 border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-5 text-center animate-scale-up" style={{ borderColor: 'var(--color-primary)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl font-bold border shadow-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}><AlertTriangle size={32} /></div>
                <div className="space-y-2"><h3 className="text-xl font-bold text-white">¿Estás seguro?</h3><p className="text-xs text-zinc-400">¿Deseas eliminar el registro de este pedido? Esta acción no se puede deshacer.</p></div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setPedidoAEliminar(null)} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-bold text-sm cursor-pointer">Cancelar</button>
                  <button type="button" onClick={() => { eliminarPedidoHistorial(pedidoAEliminar); setPedidoAEliminar(null); }} className="flex-1 py-2.5 text-white rounded-lg font-bold text-sm cursor-pointer border shadow" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}>Sí, eliminar</button>
                </div>
              </div>
            </div>
          )}

          {modalExitoMensaje && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
              <div className="bg-zinc-900 border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-5 text-center animate-scale-up" style={{ borderColor: 'var(--color-primary)' }}>
                <div className="w-16 h-16 bg-green-600/20 text-green-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold border border-green-500/30 shadow-lg"><CheckCircle size={32} /></div>
                <div className="space-y-2"><h3 className="text-xl font-bold text-white">¡Aviso del Sistema!</h3><p className="text-xs text-zinc-400">{modalExitoMensaje}</p></div>
                <button onClick={() => setModalExitoMensaje(null)} className="w-full py-3 text-white rounded-xl font-bold text-sm cursor-pointer border shadow transition" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }}>Aceptar</button>
              </div>
            </div>
          )}

          {modalBorrarCuenta && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in p-4">
              <div className="bg-zinc-900 border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-scale-up" style={{ borderColor: 'var(--color-primary)' }}>
                <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold border shadow" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}><AlertTriangle size={20} /></div>
                  <h3 className="text-lg font-bold text-white">¿Eliminar tu cuenta?</h3>
                </div>
                <div className="text-xs text-zinc-400 space-y-2 bg-zinc-950/60 p-4 rounded-lg border border-zinc-800"><p>Esta acción es irreversible.</p><p className="font-semibold text-zinc-300">Escribe <span className="font-mono font-bold" style={{ color: 'var(--color-primary)' }}>delete {usuarioActivo.username}</span> y tu contraseña:</p></div>
                {errorBorrar && <div className="bg-red-950/80 border border-red-500 text-red-300 px-3 py-2 rounded-lg text-xs font-semibold">{errorBorrar}</div>}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setErrorBorrar('');
                  if (textoConfirmacion !== `delete ${usuarioActivo.username}`) return setErrorBorrar(`Escribe exactamente "delete ${usuarioActivo.username}".`);
                  if (passwordBorrar !== usuarioActivo.password) return setErrorBorrar('Contraseña incorrecta.');
                  const todos = JSON.parse(localStorage.getItem('redragon_usuarios')) || [];
                  localStorage.setItem('redragon_usuarios', JSON.stringify(todos.filter(u => u.email !== usuarioActivo.email)));
                  localStorage.removeItem('redragon_sesion_activa'); setUsuarioActivo(null); setModalBorrarCuenta(false); setVistaActual('home');
                }} className="space-y-4">
                  <input required type="text" placeholder={`delete ${usuarioActivo.username}`} value={textoConfirmacion} onChange={e => setTextoConfirmacion(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm font-mono outline-none" style={{ focusBorderColor: 'var(--color-primary)' }} />
                  <input required type="password" placeholder="Contraseña" value={passwordBorrar} onChange={e => setPasswordBorrar(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none" style={{ focusBorderColor: 'var(--color-primary)' }} />
                  <div className="flex gap-3 pt-2"><button type="button" onClick={() => setModalBorrarCuenta(false)} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-bold text-sm cursor-pointer">Cancelar</button><button type="submit" className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-sm cursor-pointer">Eliminar</button></div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}