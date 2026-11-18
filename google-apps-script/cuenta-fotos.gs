/**
 * ===========================================================================
 * RECEPTOR DE FOTOS — XV de Lindsey
 * ---------------------------------------------------------------------------
 * Va en la cuenta de Google de la familia que va a guardar las FOTOS.
 * Se pega entero en script.google.com, en un proyecto nuevo. El paso a paso
 * está en ENTREGA.md, en la raíz del proyecto.
 *
 * QUÉ HACE
 *   1. Recibe las fotos que suben los invitados y las guarda en una carpeta
 *      de Google Drive de esta cuenta.
 *   2. Le pasa al "Álbum de la noche" (galeria.html) la lista de fotos.
 *
 *   El invitado no necesita cuenta de Google: el script corre con los
 *   permisos de quien lo publica.
 *
 * Las confirmaciones de asistencia NO pasan por aquí: siguen en su propio
 * script y su propia hoja, para no partir la lista en dos.
 *
 * LO ÚNICO QUE SE PUEDE CAMBIAR ESTÁ AQUÍ ARRIBA. Lo de abajo no se toca.
 * ===========================================================================
 */

/* ID de la carpeta de Drive donde caen las fotos.
   DÉJALO VACÍO: la primera vez que ejecutes "instalar", el script crea la
   carpeta solo (con el nombre de abajo) y la recuerda. Solo hace falta
   llenarlo si quieres usar una carpeta que ya existe.                      */
const ID_CARPETA = '';

/* Nombre de la carpeta que se crea sola. */
const NOMBRE_CARPETA = 'Fotos XV Lindsey';

/* ¿Moderar el álbum?
   - false: todo lo que suban se ve en el álbum al instante.
   - true : "instalar" crea dentro una subcarpeta "Álbum público" y el
            álbum muestra SOLO lo que la familia mueva a ella desde Drive.
   El enlace de la invitación es público, así que true es lo más seguro.  */
const MODERAR_ALBUM = false;

/* Tope por foto ya comprimida, en MB. */
const MAX_MB = 25;

/* Zona horaria para el nombre de los archivos. */
const ZONA = 'America/Managua';


/* ======================== NO TOCAR DE AQUÍ ABAJO ======================== */

const TIPOS_OK = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const NOMBRE_SUBCARPETA_ALBUM = 'Álbum público';


/**
 * Ejecútala UNA vez desde el editor, antes de publicar.
 * Pide los permisos, crea la(s) carpeta(s) y escribe el enlace en el registro.
 */
function instalar() {
  const carpeta = DriveApp.getFolderById(idCarpeta());
  Logger.log('Listo. Las fotos van a caer en: ' + carpeta.getName());
  Logger.log('Enlace de la carpeta: ' + carpeta.getUrl());

  if (MODERAR_ALBUM) {
    const album = DriveApp.getFolderById(idCarpetaAlbum());
    Logger.log('Álbum moderado. Solo se ve lo que muevas a: ' + album.getUrl());
  } else {
    Logger.log('Álbum sin moderar: todo lo que suban se ve al instante.');
  }
}


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

    const carpeta = DriveApp.getFolderById(idCarpeta());
    const blob = Utilities.newBlob(datos, tipo, nombrarArchivo(p.nombreArchivo, p.invitado));
    const archivo = carpeta.createFile(blob);

    if (p.invitado) archivo.setDescription('Subido por: ' + p.invitado);

    /* Para que el álbum pueda mostrar la miniatura, la foto tiene que ser
       visible con enlace. Si la cuenta no lo permite, la foto igual queda
       guardada; solo no se vería en el álbum. */
    try {
      archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (errCompartir) {
      Logger.log('No se pudo compartir: ' + errCompartir);
    }

    return responder({ ok: true, id: archivo.getId() });

  } catch (err) {
    return responder({ ok: false, error: String(err) });
  }
}


/**
 *   sin parámetros   : comprobar que el script quedó bien publicado
 *   ?accion=listar   : la lista de fotos que muestra el álbum
 */
function doGet(e) {
  const accion = (e && e.parameter && e.parameter.accion) || '';
  if (accion === 'listar') return listarFotos(e);
  return responder({ ok: true, mensaje: 'Receptor activo' });
}


function listarFotos(e) {
  try {
    const pedidas = parseInt((e && e.parameter && e.parameter.max) || '60', 10);
    const max = Math.min(isNaN(pedidas) ? 60 : pedidas, 200);

    const id = MODERAR_ALBUM ? idCarpetaAlbum() : idCarpeta();
    const archivos = DriveApp.getFolderById(id).getFiles();
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
      moderada: MODERAR_ALBUM,
      fotos: fotos.slice(0, max)
    });

  } catch (err) {
    return responder({ ok: false, error: String(err) });
  }
}


/**
 * ID de la carpeta principal. Si ID_CARPETA está vacío, la crea una sola
 * vez y la recuerda en las propiedades del script.
 */
function idCarpeta() {
  if (ID_CARPETA) return ID_CARPETA;
  return carpetaRecordada('ID_CARPETA', function () {
    return DriveApp.createFolder(NOMBRE_CARPETA);
  });
}


/* La subcarpeta del álbum moderado, dentro de la principal. */
function idCarpetaAlbum() {
  return carpetaRecordada('ID_CARPETA_ALBUM', function () {
    return DriveApp.getFolderById(idCarpeta()).createFolder(NOMBRE_SUBCARPETA_ALBUM);
  });
}


function carpetaRecordada(llave, crear) {
  const props = PropertiesService.getScriptProperties();
  const guardado = props.getProperty(llave);
  if (guardado) {
    try {
      if (!DriveApp.getFolderById(guardado).isTrashed()) return guardado;
    } catch (err) {}
  }
  const nueva = crear().getId();
  props.setProperty(llave, nueva);
  return nueva;
}


function nombrarArchivo(nombreOriginal, invitado) {
  const marca = Utilities.formatDate(new Date(), ZONA, 'yyyy-MM-dd_HH-mm-ss');
  const quien = invitado ? '_' + limpiar(invitado) : '';
  return marca + quien + extensionDe(nombreOriginal);
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
 * Por si en el álbum moderado mueves fotos que no se ven: las vuelve a
 * compartir con enlace. Segura de repetir.
 */
function compartirTodas() {
  const carpetas = [idCarpeta()];
  if (MODERAR_ALBUM) carpetas.push(idCarpetaAlbum());

  let arregladas = 0;
  carpetas.forEach(function (id) {
    const archivos = DriveApp.getFolderById(id).getFiles();
    while (archivos.hasNext()) {
      const f = archivos.next();
      if (TIPOS_OK.indexOf(f.getMimeType()) === -1) continue;
      try {
        f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        arregladas++;
      } catch (err) {
        Logger.log('No se pudo compartir ' + f.getName() + ': ' + err);
      }
    }
  });
  Logger.log('Listo. Compartidas: ' + arregladas);
}
