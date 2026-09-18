/**
 * ===========================================================================
 * RECEPTOR DE FOTOS — Invitación de XV de Lindsey
 * ---------------------------------------------------------------------------
 * Este script recibe las fotos que mandan los invitados desde la invitación
 * y las guarda en una carpeta de Google Drive.
 *
 * El invitado NO necesita cuenta de Google ni iniciar sesión: el script se
 * publica para que corra con TUS permisos, así que es tu cuenta la que
 * guarda el archivo, no la suya.
 *
 * El paso a paso para publicarlo está en LEEME.md, en esta misma carpeta.
 * ===========================================================================
 */

/* ID de la carpeta de Drive donde caen las fotos.
   Se saca de la barra de direcciones al abrir la carpeta:
   drive.google.com/drive/folders/ESTO_DE_AQUI                                */
const ID_CARPETA = 'PEGA_AQUI_EL_ID_DE_LA_CARPETA';

/* Tope por archivo ya comprimido, como red de seguridad. */
const MAX_MB = 25;

/* Formatos que se aceptan. */
const TIPOS_OK = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];


/**
 * Se ejecuta cada vez que la invitación manda una foto.
 */
function doPost(e) {
  try {
    const p = (e && e.parameter) || {};

    if (!p.archivo) {
      return responder({ ok: false, error: 'No llegó ningún archivo' });
    }

    const tipo = p.tipo || 'image/jpeg';
    if (TIPOS_OK.indexOf(tipo) === -1) {
      return responder({ ok: false, error: 'Formato no permitido: ' + tipo });
    }

    const datos = Utilities.base64Decode(p.archivo);

    if (datos.length > MAX_MB * 1024 * 1024) {
      return responder({ ok: false, error: 'El archivo pesa más de ' + MAX_MB + ' MB' });
    }

    const carpeta = DriveApp.getFolderById(ID_CARPETA);
    const blob = Utilities.newBlob(datos, tipo, nombrarArchivo(p.nombreArchivo, p.invitado));
    const archivo = carpeta.createFile(blob);

    if (p.invitado) {
      archivo.setDescription('Subido por: ' + p.invitado);
    }

    return responder({ ok: true, id: archivo.getId() });

  } catch (err) {
    /* El error se devuelve como texto para que la invitación pueda
       mostrarle algo útil al invitado en vez de quedarse colgada. */
    return responder({ ok: false, error: String(err) });
  }
}


/**
 * Abrir la URL del script en el navegador cae aquí.
 * Sirve para comprobar de un vistazo que quedó bien publicado.
 */
function doGet() {
  return responder({ ok: true, mensaje: 'Receptor activo' });
}


/**
 * Arma el nombre final del archivo.
 * Lleva la fecha por delante para que en Drive queden en orden cronológico,
 * y el nombre de quien la subió para saber de quién es cada foto.
 */
function nombrarArchivo(nombreOriginal, invitado) {
  const marca = Utilities.formatDate(new Date(), 'America/Managua', 'yyyy-MM-dd_HH-mm-ss');
  const quien = invitado ? '_' + limpiar(invitado) : '';
  const extension = extensionDe(nombreOriginal);
  return marca + quien + extension;
}


function extensionDe(nombre) {
  const punto = String(nombre || '').lastIndexOf('.');
  if (punto === -1) return '.jpg';
  const ext = String(nombre).slice(punto).toLowerCase();
  return /^\.[a-z0-9]{2,5}$/.test(ext) ? ext : '.jpg';
}


function limpiar(texto) {
  return String(texto)
    .replace(/[^\p{L}\p{N} _-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40);
}


function responder(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}


/**
 * Comprobación rápida desde el editor de Apps Script.
 * Ejecútala una vez tras pegar el ID: si la carpeta es correcta,
 * imprime su nombre en el registro.
 */
function probarCarpeta() {
  const carpeta = DriveApp.getFolderById(ID_CARPETA);
  Logger.log('Carpeta encontrada: ' + carpeta.getName());
}
