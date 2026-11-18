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

  /* Cuanto dura, en horas. Solo lo usa el evento que se agrega al
     calendario, para saber a que hora ponerle el final.                 */
  duracionHoras: 5,

  /* ---- La portada de adentro -----------------------------------------
     Es lo primero que se ve al abrir la invitacion: el diseño de Canva,
     rehecho en HTML. El lienzo mide 943x2000 y todo lo de encima se
     coloca en proporcion a ese ancho, asi que escala solo.              */
  hero: {
    /* Marco floral. Es el PNG exportado de Canva, pasado a WebP:
       de 1.9 MB a 82 KB sin diferencia visible. */
    marco: 'assets/img/marco-floral.webp',
    lienzo: '943 / 2000',

    /* Foto dentro del arco: la foto real de Lindsey. Si se deja en ''
       se ve en su lugar la ilustracion SVG de la quinceañera. */
    foto: 'assets/img/lindsey.jpeg',
    fotoAlt: 'Lindsey el día de sus quince años',

    /* Lo que va bajo la fecha, un renglon por elemento. Es aparte de
       lugar.direccion porque la seccion "Lugar" ya muestra el nombre del
       salon por su lado. Si se deja [] se usa lugar.direccion. */
    lugar: ['Punto Azzurro', 'Primera entrada a San Mateo']
  },

  /* ---- Los papas ------------------------------------------------------ */
  padres: ['Guillermo Larios', 'Hacknier Ruiz'],

  /* ---- Padrinos (opcional: deja el arreglo vacio [] para ocultarlo) --- */
  padrinos: [],

  /* ---- La carta ------------------------------------------------------- */
  carta: [
    'Hoy celebramos tus 15 años, una hermosa bendición que Dios nos ha regalado.',
    'Eres una niña alegre, llena de talentos, que disfruta hacer amigos, bailar, reír y soñar en grande. Verte crecer nos llena de orgullo y gratitud.',
    'Le pedimos a Dios que guíe tus pasos y haga realidad tus sueños. Nunca pierdas tu dulzura, tu alegría y, sobre todo, guarda siempre tu corazón.',
    'Te invitamos a acompañarnos y compartir nuestra alegría al celebrar los quince años de nuestra querida hija Lindsey.'
  ],
  firmaCarta: 'Con todo nuestro amor, mamá y papá',

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
    mapaEmbed: 'https://www.google.com/maps?q=12.4342037,-86.8999011&z=17&output=embed',

    /* Las mismas coordenadas, sueltas. Van en el evento del calendario:
       con solo el nombre escrito, la app del telefono tiene que adivinar
       donde queda, y "Primera entrada Reparto San Mateo" no es algo que
       vaya a acertar. Deja '' si alguna vez no se saben.                */
    coordenadas: '12.4342037,-86.8999011'
  },

  /* ---- Itinerario (deja [] para ocultar la seccion) ------------------- */
  itinerario: [
    { hora: '5:00 PM', titulo: 'Recepción',   detalle: 'Bienvenida a los invitados' },
    { hora: '5:30 PM', titulo: 'Ceremonia',  detalle: 'Entrada de la quinceañera' },
    { hora: '7:00 PM', titulo: 'Vals',        detalle: 'Baile con papá y chambelanes' },
    { hora: '8:00 PM', titulo: 'Cena',        detalle: 'Servida en mesa' },
    { hora: '9:00 PM', titulo: 'Pool Party',  detalle: 'Traer traje especial para piscina' }
  ],

  /* ---- Codigo de vestimenta ------------------------------------------ */
  vestimenta: {
    etiqueta: 'Formal',
    texto: 'Por favor abstenerse de usar cualquier tono de rojo, ya que es un color reservado para la quinceañera.',
    /* Colores que se piden evitar, se muestran como muestras tachadas.
       Deben coincidir con el color que menciona el texto de arriba.
       Se escriben como tokens de la paleta en vez de hex sueltos: el
       color reservado ES el de la quinceañera, asi que si la paleta
       cambia, las muestras cambian con ella y nunca se descuadran. */
    coloresReservados: ['var(--tono-300)', 'var(--tono-500)',
                        'var(--tono-700)', 'var(--tono-900)']
  },

  /* ---- Lluvia de sobres ----------------------------------------------- */
  sobres: {
    titulo: 'Lluvia de sobres',
    texto: 'Como parte de esta celebración, tendremos lluvia de sobres. Agradecemos de corazón sus muestras de cariño y generosidad a través de su sobre.',
    cierre: '¡Gracias por ser parte de este día tan especial!'
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

    /* URL del script de Google que escribe en la hoja.
       NO CAMBIAR. Es el script original (subida.gs), el que ya tiene la
       hoja con las confirmaciones que han llegado. Las fotos y los videos
       se mudaron a las cuentas de la familia, pero las confirmaciones se
       quedan aqui para no partir la lista en dos. La hoja se comparte con
       la familia desde Drive (ver ENTREGA.md).       */
    urlScript: 'https://script.google.com/macros/s/AKfycbxQM152Zo28Ph0qw4q3-GvAH-CmCFBVOxOG_rFQy5wJZNvsCerNz2iEHN28-jYs6qRk/exec',

    /* Fecha limite para confirmar, texto libre */
    limite: '26 de noviembre',

    /* Aclara por que no se pregunta cuantos van. Deja '' para no mostrarlo. */
    nota: 'Tu espacio ya está reservado a tu nombre; solo necesitamos saber si nos acompañarás. Una vez confirmada tu asistencia, te haremos llegar tu pase de acceso.',

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
    demo: false,

    /* ---- Botones apagados a proposito ---------------------------------
       Para la beta. Los botones se siguen VIENDO y se pueden tocar, pero
       en vez de hacer nada avisan que estan apagados por ahora.

       No toca nada de la configuracion de Drive ni del enlace de videos de
       OneDrive: esos datos se quedan tal cual. Poner el interruptor en
       false devuelve el boton a su funcionamiento normal, sin mas cambios.
       ------------------------------------------------------------------- */
    deshabilitados: {
      subirFotos: false,     // el formulario de subir fotos
      subirVideos: false,    // el formulario de subir videos
      album: false,          // el album de la noche (tarjeta y boton flotante)
      mensaje: 'Botón deshabilitado temporalmente'
    },

    destinos: [
      {
        /* tipo 'drive' abre el formulario de FOTOS dentro de la pagina */
        tipo: 'drive',
        icono: 'camara',
        etiqueta: 'Subir fotos',
        nota: 'Elige varias a la vez, sin crear cuenta'
      },
      {
        /* tipo 'videos' abre el formulario de VIDEOS dentro de la pagina */
        tipo: 'videos',
        icono: 'video',
        etiqueta: 'Subir videos',
        nota: 'Archivos grandes, sin crear cuenta'
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
      /* >>> CUENTA DE FOTOS <<<
         URL que da Google al publicar google-apps-script/cuenta-fotos.gs
         en la cuenta de la familia. Termina en /exec.
         Mientras no se cambie, las fotos caen en la cuenta del
         desarrollador (el script original), que sirve para probar. */
      urlScript: 'https://script.google.com/macros/s/AKfycbxQM152Zo28Ph0qw4q3-GvAH-CmCFBVOxOG_rFQy5wJZNvsCerNz2iEHN28-jYs6qRk/exec',

      /* Las fotos se encogen en el celular ANTES de enviarse. Se siguen
         viendo perfectas y pesan unas siete veces menos, asi que suben
         mucho mas rapido y caben muchisimas mas. */
      anchoMaximo: 2000,    // pixeles del lado mas largo
      calidad: 0.82,        // 0 a 1
      maxArchivos: 15,      // cuantas fotos puede mandar cada invitado de una vez
      pesoMaximoMB: 25      // tope por archivo, ya comprimido
    },

    /* ---- Videos: la SEGUNDA cuenta de Google ---------------------------
       Mismo truco que las fotos, pero con su propio script en otra cuenta
       (google-apps-script/cuenta-videos.gs), para que los videos no se
       coman los 15 GB de las fotos. El video sube en trozos, con barra de
       progreso real y retomando si se corta el internet.
       Mientras urlScript este vacio, el boton de videos se ve apagado.
       ------------------------------------------------------------------- */
    videos: {
      /* >>> CUENTA DE VIDEOS <<<
         URL que da Google al publicar cuenta-videos.gs. Termina en /exec */
      urlScript: '',

      maxArchivos: 5,       // cuantos videos puede mandar cada invitado de una vez
      pesoMaximoMB: 1024,   // tope por video (1 GB). Igual o menor que MAX_MB del script
      trozoMB: 8            // tamaño de cada trozo. No hace falta tocarlo
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
