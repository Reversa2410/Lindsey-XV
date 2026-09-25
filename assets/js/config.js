/* =========================================================================
   CONFIGURACION DE LA INVITACION
   -------------------------------------------------------------------------
   Este es el UNICO archivo que hay que tocar para cambiar los datos.
   Todo lo demas (calendario, cuenta regresiva, mapa, botones) se calcula
   automaticamente a partir de aqui.
   ========================================================================= */

window.CONFIG = {

  /* ---- La quinceañera ------------------------------------------------ */
  nombre: 'Lindsey',
  apellido: 'Larios',

  /* ---- Fecha y hora del evento --------------------------------------- */
  /* Formato: AÑO, MES(1-12), DIA, HORA(0-23), MINUTO                      */
  fecha: { anio: 2026, mes: 12, dia: 11, hora: 17, minuto: 0 },

  /* ---- La portada de adentro -----------------------------------------
     Es lo primero que se ve al abrir la invitacion: el diseño de Canva,
     rehecho en HTML. El lienzo mide 943x2000 y todo lo de encima se
     coloca en proporcion a ese ancho, asi que escala solo.              */
  hero: {
    /* Marco floral. Es el PNG exportado de Canva, pasado a WebP:
       de 1.9 MB a 82 KB sin diferencia visible. */
    marco: 'assets/img/marco-floral.webp',
    lienzo: '943 / 2000',

    /* Foto dentro del arco.
       PENDIENTE: la que esta puesta es la del mockup de Canva, o sea una
       foto de banco, solo de muestra. Hay que cambiarla por la foto real
       de Lindsey antes de publicar. Si se deja en '' se ve en su lugar la
       ilustracion SVG de la quinceañera. */
    foto: 'assets/img/foto-muestra.webp',
    fotoAlt: 'Lindsey el día de sus quince años'
  },

  /* ---- Los papas ------------------------------------------------------ */
  padres: ['Guillermo Larios', 'Hacknier Ruiz'],

  /* ---- Padrinos (opcional: deja el arreglo vacio [] para ocultarlo) --- */
  padrinos: [],

  /* ---- La carta ------------------------------------------------------- */
  carta: [
    'Hoy celebramos mucho más que un cumpleaños. Celebramos a la hermosa persona en la que te has convertido: noble, valiente, alegre y llena de luz.',
    'Hace 15 años llegaste a nuestras vidas para enseñarnos el verdadero significado del amor, y desde entonces cada día contigo ha sido un regalo. Verte crecer ha sido nuestra mayor bendición.',
    'Y aunque siempre serás nuestra niña, hoy te miramos con admiración al verte florecer en esta nueva etapa. Sigue soñando en grande, sigue siendo tú, porque el mundo necesita más corazones como el tuyo.',
    'Por eso, con el corazón lleno de emoción, los invitamos a acompañarnos en la celebración de los 15 años de nuestra hija Lindsey. Será un honor contar con su presencia en este día inolvidable.'
  ],
  firmaCarta: 'Con cariño, mamá y papá',

  /* ---- Lugar ----------------------------------------------------------
     Datos reales del salón.

     OJO: este repositorio es PUBLICO, asi que la direccion y el enlace de
     Maps quedan en el historial de git aunque un dia se borren de aqui.
     Se puso a proposito, con el visto bueno de la familia, porque la
     invitacion es una beta que se comparte igual. Si alguna vez hace falta
     que esto deje de ser publico, no basta con borrar la linea: hay que
     pasar el repositorio a privado.

     El enlace corto es el que dio Google al compartir la ubicacion. El
     embebido apunta a las mismas coordenadas de ese enlace, porque el
     corto no se puede meter dentro de un <iframe>.
     --------------------------------------------------------------------- */
  lugar: {
    nombre: 'Punto Azzurro',
    direccion: 'Primera entrada Reparto San Mateo',
    mapaEnlace: 'https://maps.app.goo.gl/AQnhck8FcrtuuYdQ9',
    mapaEmbed: 'https://www.google.com/maps?q=12.4342037,-86.8999011&z=17&output=embed'
  },

  /* ---- Itinerario (deja [] para ocultar la seccion) ------------------- */
  itinerario: [
    { hora: '5:30 PM', titulo: 'Recepción',   detalle: 'Bienvenida a los invitados' },
    { hora: '6:00 PM', titulo: 'Ceremonia',   detalle: 'Entrada de la quinceañera' },
    { hora: '7:00 PM', titulo: 'Vals',        detalle: 'Baile con papá y chambelanes' },
    { hora: '8:00 PM', titulo: 'Cena',        detalle: 'Servida en mesa' },
    { hora: '9:00 PM', titulo: 'Pool Party',  detalle: 'Traer traje especial para piscina' }
  ],

  /* ---- Codigo de vestimenta ------------------------------------------ */
  vestimenta: {
    etiqueta: 'Formal',
    texto: 'Por favor abstenerse de usar cualquier tono de rojo, ya que es un color reservado para la quinceañera.',
    /* Colores que se piden evitar, se muestran como muestras tachadas.
       Deben coincidir con el color que menciona el texto de arriba. */
    coloresReservados: ['#F4CCD8', '#DB98AE', '#A83258', '#7B1E3A']
  },

  /* ---- Lluvia de sobres ----------------------------------------------- */
  sobres: {
    titulo: 'Lluvia de sobres',
    texto: 'Mi mejor regalo será compartir este día contigo. Si deseas obsequiarme algo, estaré recibiendo con cariño tu sobre como parte de esta lluvia de bendiciones.',
    cierre: '¡Gracias por su cariño y generosidad!'
  },

  /* ---- Confirmacion de asistencia (RSVP) ------------------------------
     La confirmacion ya NO se manda por WhatsApp: cada invitado escribe su
     nombre y apellido, marca si va o no, y eso cae como una fila en una
     hoja de calculo de Google. La lista completa la ves tu en Drive.

     La cantidad de personas NO la elige el invitado: los lugares ya estan
     asignados de antemano, por eso el formulario no pregunta cuantos son.
     --------------------------------------------------------------------- */
  rsvp: {
    activo: true,

    /* URL del script de Google que escribe en la hoja. Es el MISMO script
       que recibe las fotos, asi que si se deja vacio se usa el de
       fotos.drive.urlScript y no hay nada que llenar aqui.
       El paso a paso esta en google-apps-script/LEEME.md               */
    urlScript: '',

    /* Fecha limite para confirmar, texto libre */
    limite: '25 de noviembre',

    /* Aclara por que no se pregunta cuantos van. Deja '' para no mostrarlo. */
    nota: 'Los lugares ya están reservados a tu nombre, así que solo necesitamos saber si nos acompañas.',

    /* PENDIENTE: el WhatsApp de la familia. Todavia no se usa para nada;
       queda apuntado para cuando se agregue el contacto del cliente. */
    whatsapp: ''
  },

  /* ---- Musica de fondo ------------------------------------------------ */
  musica: {
    activo: true,
    archivo: 'assets/audio/cancion.mp3',
    titulo: 'Canción de Lindsey',

    /* La cancion no se baja al cargar la pagina, sino en el ratito que el
       invitado pasa mirando la portada antes de tocarla. Asi la pagina
       abre igual de rapido y la musica suena apenas toca el boton, sin
       ese silencio de dos segundos mientras empieza a bajar.
       Ponlo en false para que no baje nada hasta que le den play. */
    precargar: true
  },

  /* ---- Fotos y videos de los invitados --------------------------------
     Son dos destinos separados a proposito. La razon no es el espacio
     total sino el LIMITE POR ARCHIVO: un video de celular de dos minutos
     pesa lo mismo que unas 150 fotos, y casi todos los servicios gratuitos
     lo rechazan por tamaño aunque quede espacio de sobra.
     Separarlos permite darle a cada tipo de archivo el servicio que mejor
     le queda, y evita que tres videos se coman el espacio de todo el album.

     ATENCION: repositorio PUBLICO. Un enlace de subida abierto deja que
     cualquiera suba lo que quiera. Los enlaces reales NO van aqui; se
     ponen al final, fuera del repositorio.
     --------------------------------------------------------------------- */
  fotos: {
    activo: true,
    titulo: 'Comparte tus fotos y videos',
    texto: 'Ayúdanos a guardar cada momento de esta noche. Sube lo que capturaste y forma parte del álbum de Lindsey.',

    /* En true, la pagina avisa que los enlaces todavia son de muestra.
       Ponlo en false cuando los enlaces reales ya esten puestos. */
    demo: true,

    /* ---- Botones apagados a proposito ---------------------------------
       Para la beta. Los botones se siguen VIENDO y se pueden tocar, pero
       en vez de hacer nada avisan que estan apagados por ahora.

       No toca nada de la configuracion de Drive ni del enlace de videos de
       OneDrive: esos datos se quedan tal cual. Poner el interruptor en
       false devuelve el boton a su funcionamiento normal, sin mas cambios.
       ------------------------------------------------------------------- */
    deshabilitados: {
      subirFotos: true,      // el formulario de subir fotos a Drive
      subirVideos: true,     // el enlace de subir videos (OneDrive)
      album: true,           // el album de la noche (tarjeta y boton flotante)
      mensaje: 'Botón deshabilitado temporalmente'
    },

    destinos: [
      {
        /* tipo 'drive' abre el formulario dentro de la misma pagina */
        tipo: 'drive',
        icono: 'camara',
        etiqueta: 'Subir fotos',
        nota: 'Elige varias a la vez, sin crear cuenta'
      },
      {
        /* tipo 'enlace' manda al invitado a otro sitio (OneDrive, Dropbox...) */
        tipo: 'enlace',
        icono: 'video',
        etiqueta: 'Subir videos',
        nota: 'Videos · archivos grandes, sin apuro',
        enlace: 'https://ejemplo.com/videos-lindsey'   // <-- PENDIENTE (ficticio)
      }
    ],

    /* ---- Carpeta de Google Drive --------------------------------------
       Las fotos caen en una carpeta de Drive tuya, a traves de un script
       de Google publicado como aplicacion web. Se eligio Drive porque
       Cloudinary no presta servicio en Nicaragua.

       El invitado NO necesita cuenta de Google: el script corre con tus
       permisos, asi que es tu cuenta la que guarda el archivo.

       El paso a paso para publicarlo esta en google-apps-script/LEEME.md
       Mientras urlScript este vacio, el boton de fotos se ve apagado.
       ------------------------------------------------------------------- */
    drive: {
      /* URL que da Google al publicar el script. Termina en /exec */
      urlScript: 'https://script.google.com/macros/s/AKfycbxQM152Zo28Ph0qw4q3-GvAH-CmCFBVOxOG_rFQy5wJZNvsCerNz2iEHN28-jYs6qRk/exec',        // <-- PENDIENTE

      /* Las fotos se encogen en el celular ANTES de enviarse. Se siguen
         viendo perfectas y pesan unas siete veces menos, asi que suben
         mucho mas rapido y caben muchisimas mas. */
      anchoMaximo: 2000,    // pixeles del lado mas largo
      calidad: 0.82,        // 0 a 1
      maxArchivos: 15,      // cuantas fotos puede mandar cada invitado de una vez
      pesoMaximoMB: 25      // tope por archivo, ya comprimido
    },

    /* ---- Galeria de fotos ---------------------------------------------
       Vive en su propia pagina (galeria.html) y muestra lo que los
       invitados van subiendo. Se llega a ella por el boton flotante de la
       camara y por el enlace de la seccion de fotos.
       Usa el mismo script de Drive, asi que no hay nada mas que configurar.

       QUE SE VE aqui lo decide el script, no esta pagina: si en el script
       llenaste ID_CARPETA_GALERIA, solo se ve lo que muevas a esa carpeta;
       si lo dejaste vacio, se ve todo lo que suban, al instante.
       ------------------------------------------------------------------- */
    galeria: {
      activa: true,
      titulo: 'Álbum de la noche',
      texto: 'Las fotos que los invitados van compartiendo.',

      /* Texto chico del enlace que lleva al album desde la invitacion */
      notaEnlace: 'Mira las fotos que ya compartieron',

      porPagina: 24,        // cuantas se cargan de golpe
      maximo: 200,          // tope que se le pide al script

      /* Segundos entre recargas automaticas, para que la galeria se vea
         crecer durante la fiesta. 0 = no recargar sola. */
      refrescarCada: 0
    }
  },

  /* ---- Textos varios -------------------------------------------------- */
  textos: {
    portadaSuperior: 'Te invito a mis',
    botonAbrir: 'Abrir invitación',
    cierre: '¡Los esperamos!'
  }
};
