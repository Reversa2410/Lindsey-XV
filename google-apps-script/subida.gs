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

/* Carpeta que ALIMENTA LA GALERIA de la invitacion.
   - Si la dejas vacia, la galeria muestra todo lo que suban, al instante.
   - Si pones aqui el ID de una segunda carpeta, la galeria muestra solo lo
     que tu muevas a ella. Es la forma mas simple de moderar: arrastras en
     Drive las fotos que quieres que se vean, y listo.
   Recomendado ponerla: el enlace de la invitacion es publico.             */
const ID_CARPETA_GALERIA = '';

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

    /* Para que la galeria pueda mostrar la miniatura, el archivo tiene que
       ser visible con enlace. Va en try aparte: si la cuenta tiene el
       compartir restringido, la foto igual queda guardada y no se pierde;
       solo no se veria en la galeria. */
    try {
      archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (errCompartir) {
      Logger.log('No se pudo compartir: ' + errCompartir);
    }

    return responder({ ok: true, id: archivo.getId() });

  } catch (err) {
    /* El error se devuelve como texto para que la invitación pueda
       mostrarle algo útil al invitado en vez de quedarse colgada. */
    return responder({ ok: false, error: String(err) });
  }
}


/**
 * Atiende dos cosas:
 *   - sin parámetros: comprobar que el script quedó bien publicado
 *   - ?accion=listar : la lista de fotos que muestra la galería
 */
function doGet(e) {
  const accion = (e && e.parameter && e.parameter.accion) || '';
  if (accion === 'listar') return listarFotos(e);
  return responder({ ok: true, mensaje: 'Receptor activo' });
}


/**
 * Devuelve las fotos de la carpeta de galería, de la más nueva a la más
 * vieja. Solo manda datos, no las imágenes: la invitación las pide después
 * directamente a Drive, que es mucho más rápido que pasarlas por aquí.
 */
function listarFotos(e) {
  try {
    const pedidas = parseInt((e && e.parameter && e.parameter.max) || '60', 10);
    const max = Math.min(isNaN(pedidas) ? 60 : pedidas, 200);

    const carpeta = DriveApp.getFolderById(ID_CARPETA_GALERIA || ID_CARPETA);
    const archivos = carpeta.getFiles();
    const fotos = [];

    while (archivos.hasNext()) {
      const f = archivos.next();
      if (TIPOS_OK.indexOf(f.getMimeType()) === -1) continue;
      fotos.push({
        id: f.getId(),
        invitado: (f.getDescription() || '').replace('Subido por: ', ''),
        fecha: f.getDateCreated().getTime()
      });
    }

    fotos.sort(function (a, b) { return b.fecha - a.fecha; });

    return responder({
      ok: true,
      total: fotos.length,
      moderada: !!ID_CARPETA_GALERIA,
      fotos: fotos.slice(0, max)
    });

  } catch (err) {
    return responder({ ok: false, error: String(err) });
  }
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


/**
 * Repara las fotos que se subieron ANTES de que el script compartiera
 * automáticamente: sin ese permiso, la galería no puede mostrarlas.
 *
 * Ejecútala una sola vez desde el editor. Es segura de repetir: si una
 * foto ya está compartida, la vuelve a dejar igual.
 */
function compartirTodas() {
  const carpetas = [ID_CARPETA];
  if (ID_CARPETA_GALERIA) carpetas.push(ID_CARPETA_GALERIA);

  let arregladas = 0;
  let fallidas = 0;

  carpetas.forEach(function (id) {
    const archivos = DriveApp.getFolderById(id).getFiles();
    while (archivos.hasNext()) {
      const f = archivos.next();
      if (TIPOS_OK.indexOf(f.getMimeType()) === -1) continue;
      try {
        f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        arregladas++;
      } catch (err) {
        fallidas++;
        Logger.log('No se pudo compartir ' + f.getName() + ': ' + err);
      }
    }
  });

  Logger.log('Listo. Compartidas: ' + arregladas + ' | Con problema: ' + fallidas);
}
