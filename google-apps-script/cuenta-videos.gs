/**
 * ===========================================================================
 * RECEPTOR DE VIDEOS — XV de Lindsey
 * ---------------------------------------------------------------------------
 * Va en la cuenta de Google de la familia que va a guardar los VIDEOS.
 * Se pega entero en script.google.com, en un proyecto nuevo. El paso a paso
 * está en ENTREGA.md, en la raíz del proyecto.
 *
 * QUÉ HACE
 *   Recibe los videos que suben los invitados desde la invitación y los
 *   guarda en una carpeta de Google Drive de esta cuenta. El invitado no
 *   necesita cuenta de Google: el script corre con los permisos de quien lo
 *   publica.
 *
 * POR QUÉ ES DISTINTO AL DE LAS FOTOS
 *   Un video de celular pesa cientos de MB y Apps Script no acepta un envío
 *   tan grande de una sola vez. Así que el video viaja en TROZOS de unos
 *   pocos MB: la invitación manda un trozo, este script lo pasa a Drive, y
 *   así hasta terminar. Si el internet del salón se corta a la mitad, se
 *   retoma desde el último trozo que llegó, no desde cero.
 *
 * LO ÚNICO QUE SE PUEDE CAMBIAR ESTÁ AQUÍ ARRIBA. Lo de abajo no se toca.
 * ===========================================================================
 */

/* ID de la carpeta de Drive donde caen los videos.
   DÉJALO VACÍO: la primera vez que ejecutes "instalar", el script crea la
   carpeta solo (con el nombre de abajo) y la recuerda. Solo hace falta
   llenarlo si quieres usar una carpeta que ya existe.                      */
const ID_CARPETA = '';

/* Nombre de la carpeta que se crea sola. */
const NOMBRE_CARPETA = 'Videos XV Lindsey';

/* Tope por video, en MB. Debe ser igual o mayor que videos.pesoMaximoMB
   en assets/js/config.js. Ojo: la cuenta gratis trae 15 GB en total.     */
const MAX_MB = 1024;

/* Zona horaria para el nombre de los archivos. */
const ZONA = 'America/Managua';


/* ======================== NO TOCAR DE AQUÍ ABAJO ======================== */

const EXTENSIONES_VIDEO = ['.mp4', '.mov', '.m4v', '.3gp', '.3gpp', '.webm', '.mkv', '.avi'];
const SUBIDA_DRIVE = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable';
const PREFIJO_SESION = 'https://www.googleapis.com/upload/drive/v3/files?';


/**
 * Ejecútala UNA vez desde el editor, antes de publicar.
 * Pide los permisos, crea la carpeta y escribe su enlace en el registro.
 */
function instalar() {
  const carpeta = DriveApp.getFolderById(idCarpeta());
  /* Se toca UrlFetchApp aquí para que Google pida ese permiso ahora y no
     al primer invitado que intente subir algo. */
  UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true
  });
  Logger.log('Listo. Los videos van a caer en: ' + carpeta.getName());
  Logger.log('Enlace de la carpeta: ' + carpeta.getUrl());
}


function doGet() {
  return responder({ ok: true, mensaje: 'Receptor de videos activo' });
}


/**
 * La invitación llama aquí tres cosas:
 *   accion=iniciar  abre una subida nueva en Drive y devuelve su "sesion"
 *   accion=trozo    manda un pedazo del video a esa sesión
 *   accion=estado   pregunta cuánto llegó ya (para retomar tras un corte)
 */
function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    if (p.accion === 'iniciar') return iniciar(p);
    if (p.accion === 'trozo') return recibirTrozo(p);
    if (p.accion === 'estado') return preguntarEstado(p);
    return responder({ ok: false, error: 'Acción desconocida' });
  } catch (err) {
    return responder({ ok: false, error: String(err) });
  }
}


function iniciar(p) {
  const tamano = parseInt(p.tamano, 10);
  if (!(tamano > 0)) return responder({ ok: false, error: 'Falta el tamaño del video' });
  if (tamano > MAX_MB * 1024 * 1024) {
    return responder({ ok: false, error: 'El video pesa más de ' + MAX_MB + ' MB' });
  }

  const extension = extensionDe(p.nombreArchivo);
  let tipo = String(p.tipo || '');
  if (!/^video\//.test(tipo)) {
    /* Algunos Android mandan el video sin tipo: se acepta por extensión. */
    if (EXTENSIONES_VIDEO.indexOf(extension) === -1) {
      return responder({ ok: false, error: 'Solo se aceptan videos' });
    }
    tipo = extension === '.mov' ? 'video/quicktime' : 'video/mp4';
  }

  const meta = {
    name: nombrarArchivo(p.invitado, extension || '.mp4'),
    parents: [idCarpeta()],
    mimeType: tipo
  };
  if (p.invitado) meta.description = 'Subido por: ' + limpiarTexto(p.invitado);

  const r = UrlFetchApp.fetch(SUBIDA_DRIVE, {
    method: 'post',
    contentType: 'application/json; charset=UTF-8',
    payload: JSON.stringify(meta),
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
      'X-Upload-Content-Type': tipo,
      'X-Upload-Content-Length': String(tamano)
    },
    muteHttpExceptions: true
  });

  const sesion = cabecera(r, 'location');
  if (r.getResponseCode() !== 200 || !sesion) {
    return responder({ ok: false, error: 'Drive no abrió la subida (' + r.getResponseCode() + ')' });
  }
  return responder({ ok: true, sesion: sesion });
}


function recibirTrozo(p) {
  const sesion = sesionValida(p.sesion);
  const inicio = parseInt(p.inicio, 10);
  const total = parseInt(p.total, 10);
  if (!p.datos || !(inicio >= 0) || !(total > 0)) {
    return responder({ ok: false, error: 'Trozo incompleto' });
  }

  const bytes = Utilities.base64Decode(p.datos);
  const fin = inicio + bytes.length - 1;

  const r = UrlFetchApp.fetch(sesion, {
    method: 'put',
    contentType: 'application/octet-stream',
    payload: bytes,
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
      'Content-Range': 'bytes ' + inicio + '-' + fin + '/' + total
    },
    followRedirects: false,
    muteHttpExceptions: true
  });

  return responderSegunDrive(r);
}


function preguntarEstado(p) {
  const sesion = sesionValida(p.sesion);
  const total = parseInt(p.total, 10);
  const r = UrlFetchApp.fetch(sesion, {
    method: 'put',
    payload: '',
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
      'Content-Range': 'bytes */' + total
    },
    followRedirects: false,
    muteHttpExceptions: true
  });
  return responderSegunDrive(r);
}


/* 308 = Drive guardó el trozo y espera más. 200/201 = el video terminó. */
function responderSegunDrive(r) {
  const codigo = r.getResponseCode();

  if (codigo === 308) {
    /* "Range: bytes=0-8388607" -> ya llegaron 8388608 bytes */
    const rango = cabecera(r, 'range');
    const recibido = rango ? parseInt(rango.split('-')[1], 10) + 1 : 0;
    return responder({ ok: true, listo: false, recibido: recibido });
  }

  if (codigo === 200 || codigo === 201) {
    let id = '';
    try { id = JSON.parse(r.getContentText()).id || ''; } catch (e) {}
    return responder({ ok: true, listo: true, id: id });
  }

  return responder({ ok: false, error: 'Drive respondió ' + codigo });
}


/* Solo se aceptan sesiones de subida de Drive: así nadie puede usar este
   script para mandar datos a otro sitio. */
function sesionValida(sesion) {
  sesion = String(sesion || '');
  if (sesion.indexOf(PREFIJO_SESION) !== 0) throw new Error('Sesión no válida');
  return sesion;
}


/**
 * ID de la carpeta. Si ID_CARPETA está vacío, la crea una sola vez y la
 * recuerda en las propiedades del script.
 */
function idCarpeta() {
  if (ID_CARPETA) return ID_CARPETA;

  const props = PropertiesService.getScriptProperties();
  const guardado = props.getProperty('ID_CARPETA');
  if (guardado) {
    try {
      const c = DriveApp.getFolderById(guardado);
      if (!c.isTrashed()) return guardado;
    } catch (err) {}
  }

  const nueva = DriveApp.createFolder(NOMBRE_CARPETA).getId();
  props.setProperty('ID_CARPETA', nueva);
  return nueva;
}


function cabecera(respuesta, nombre) {
  const todas = respuesta.getAllHeaders();
  for (const k in todas) {
    if (k.toLowerCase() === nombre) {
      const v = todas[k];
      return Array.isArray(v) ? v[0] : v;
    }
  }
  return '';
}


function nombrarArchivo(invitado, extension) {
  const marca = Utilities.formatDate(new Date(), ZONA, 'yyyy-MM-dd_HH-mm-ss');
  const quien = invitado ? '_' + limpiar(invitado) : '';
  return marca + quien + extension;
}


function extensionDe(nombre) {
  const punto = String(nombre || '').lastIndexOf('.');
  if (punto === -1) return '';
  const ext = String(nombre).slice(punto).toLowerCase();
  return /^\.[a-z0-9]{2,5}$/.test(ext) ? ext : '';
}


function limpiar(texto) {
  return String(texto)
    .replace(/[^\p{L}\p{N} _-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40);
}


function limpiarTexto(texto) {
  return String(texto || '').replace(/\s+/g, ' ').trim().slice(0, 60);
}


function responder(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}
