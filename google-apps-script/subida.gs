/**
 * ===========================================================================
 * RECEPTOR DE LA INVITACIÓN — XV de Lindsey
 * ---------------------------------------------------------------------------
 * Este script atiende dos cosas que manda la invitación:
 *
 *   1. Las CONFIRMACIONES de asistencia. Cada una se escribe como una fila
 *      en una hoja de cálculo: fecha, nombre, apellido y si asiste o no.
 *   2. Las FOTOS de los invitados, que se guardan en una carpeta de Drive.
 *
 * La cantidad de personas no se pregunta: los lugares ya están asignados de
 * antemano, así que la tabla solo registra quién viene y quién no.
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

/* ---------------------------------------------------------------------------
   HOJA DE LAS CONFIRMACIONES
   ---------------------------------------------------------------------------
   ID de la hoja de cálculo donde cae la tabla de asistencia. Se saca de la
   barra de direcciones al abrir la hoja:
   docs.google.com/spreadsheets/d/ESTO_DE_AQUI/edit

   Si se deja vacío, el script CREA la hoja solo la primera vez que alguien
   confirma y la deja en tu Drive con el nombre de abajo. Funciona igual,
   pero conviene pegar el ID después para no perderla de vista.        */
const ID_HOJA_RSVP = '';

/* Nombre de la hoja que se crea sola, y de la pestaña de adentro. */
const NOMBRE_HOJA_RSVP = 'Confirmaciones XV Lindsey';
const PESTANA_RSVP = 'Confirmaciones';

/* Zona horaria para la columna de la fecha. */
const ZONA = 'America/Managua';

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

    /* Una confirmación de asistencia, no una foto. */
    if (p.accion === 'rsvp') return guardarRsvp(p);

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
 * ===========================================================================
 * CONFIRMACIONES DE ASISTENCIA
 * ===========================================================================
 * Escribe una fila por cada invitado que confirma. La hoja queda así:
 *
 *   Fecha              | Nombre  | Apellido | Asiste
 *   2026-11-20 19:42   | Kevin   | Torrez   | Sí
 *
 * Si la misma persona confirma dos veces, se actualiza su fila en vez de
 * agregar otra: es lo que pasa cuando alguien se equivoca y vuelve a
 * mandarlo, y una lista con duplicados no sirve para contar lugares.
 */
function guardarRsvp(p) {
  const nombre = limpiarTexto(p.nombre);
  const apellido = limpiarTexto(p.apellido);

  if (!nombre || !apellido) {
    return responder({ ok: false, error: 'Faltan el nombre o el apellido' });
  }

  const asiste = String(p.asiste) === 'si' ? 'Sí' : 'No';
  const hoja = hojaRsvp();
  const fecha = Utilities.formatDate(new Date(), ZONA, 'yyyy-MM-dd HH:mm');

  /* Se busca por nombre + apellido, sin distinguir mayúsculas ni acentos
     de más, para que "kevin torrez" y "Kevin Torrez" sean el mismo. */
  const fila = buscarFila(hoja, nombre, apellido);

  if (fila > 0) {
    hoja.getRange(fila, 1, 1, 4).setValues([[fecha, nombre, apellido, asiste]]);
    return responder({ ok: true, actualizado: true, fila: fila });
  }

  hoja.appendRow([fecha, nombre, apellido, asiste]);
  return responder({ ok: true, actualizado: false, fila: hoja.getLastRow() });
}


/**
 * ID del libro donde va la tabla.
 *
 * Si ID_HOJA_RSVP está lleno, se usa ese y ya. Si está vacío, el libro se
 * crea UNA sola vez y su ID se guarda en las propiedades del script, para
 * que la siguiente confirmación escriba en el mismo y no en uno nuevo.
 *
 * Esto último importa: sin recordarlo, cada invitado que confirmara dejaría
 * una hoja suelta en tu Drive y la lista quedaría partida en pedazos.
 */
function idDelLibro() {
  if (ID_HOJA_RSVP) return ID_HOJA_RSVP;

  const props = PropertiesService.getScriptProperties();
  const guardado = props.getProperty('ID_HOJA_RSVP');

  if (guardado) {
    /* Si alguien borró el libro desde Drive, el ID guardado ya no sirve:
       se olvida y se crea otro en vez de fallar en cada confirmación. */
    try {
      SpreadsheetApp.openById(guardado);
      return guardado;
    } catch (err) {
      props.deleteProperty('ID_HOJA_RSVP');
    }
  }

  const nuevo = SpreadsheetApp.create(NOMBRE_HOJA_RSVP).getId();
  props.setProperty('ID_HOJA_RSVP', nuevo);
  Logger.log('Hoja de confirmaciones creada: ' + nuevo);
  return nuevo;
}


/**
 * Devuelve la hoja de confirmaciones, creándola con sus títulos si hace
 * falta. Es segura de llamar muchas veces.
 */
function hojaRsvp() {
  const libro = SpreadsheetApp.openById(idDelLibro());

  let hoja = libro.getSheetByName(PESTANA_RSVP);
  if (!hoja) {
    /* Un libro recién creado trae una pestaña "Hoja 1" vacía: se reusa en
       vez de dejarla ahí al lado sin nada. */
    const hojas = libro.getSheets();
    hoja = (hojas.length === 1 && hojas[0].getLastRow() === 0)
      ? hojas[0].setName(PESTANA_RSVP)
      : libro.insertSheet(PESTANA_RSVP);
  }

  if (hoja.getLastRow() === 0) {
    hoja.appendRow(['Fecha', 'Nombre', 'Apellido', 'Asiste']);
    hoja.getRange(1, 1, 1, 4).setFontWeight('bold');
    hoja.setFrozenRows(1);
    hoja.setColumnWidth(1, 150);
    hoja.setColumnWidth(2, 160);
    hoja.setColumnWidth(3, 160);
    hoja.setColumnWidth(4, 90);
  }

  return hoja;
}


/**
 * Número de fila de esa persona, o 0 si todavía no está.
 */
function buscarFila(hoja, nombre, apellido) {
  const ultimas = hoja.getLastRow();
  if (ultimas < 2) return 0;

  const datos = hoja.getRange(2, 2, ultimas - 1, 2).getValues();
  const buscado = comparable(nombre + ' ' + apellido);

  for (let i = 0; i < datos.length; i++) {
    if (comparable(datos[i][0] + ' ' + datos[i][1]) === buscado) return i + 2;
  }
  return 0;
}


/**
 * Deja el texto en una forma comparable: sin acentos, sin mayúsculas y sin
 * espacios de sobra. Solo se usa para comparar; lo que se guarda en la hoja
 * es lo que escribió el invitado.
 */
function comparable(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}


/**
 * Recorta y limpia lo que llega del formulario. No se guarda nada que
 * empiece por = + - @ tal cual: en una hoja de cálculo eso se interpreta
 * como fórmula.
 */
function limpiarTexto(valor) {
  const texto = String(valor || '').replace(/\s+/g, ' ').trim().slice(0, 60);
  return /^[=+\-@]/.test(texto) ? "'" + texto : texto;
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
 * Comprobación rápida de la tabla de confirmaciones.
 * Ejecútala una vez desde el editor: crea la hoja si hacía falta e imprime
 * su enlace en el registro, para que sepas dónde ver la lista.
 */
function probarHojaRsvp() {
  const hoja = hojaRsvp();
  Logger.log('Hoja lista: ' + hoja.getParent().getUrl());
  Logger.log('Confirmaciones registradas: ' + Math.max(0, hoja.getLastRow() - 1));
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
