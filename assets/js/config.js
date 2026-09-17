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
     ATENCION: datos INVENTADOS. Este repositorio es PUBLICO.
     El nombre real del salon y su enlace de Google Maps NO van aqui:
     revelan donde estara la familia completa, a una hora conocida.
     El dato real se pone al final, fuera del repositorio.
     --------------------------------------------------------------------- */
  lugar: {
    nombre: 'Salón Villa Estelar',                                        // ficticio
    direccion: 'De la Catedral de León, 3 cuadras al norte y 1½ al este', // ficticio
    /* Mapa generico de Leon, NO la ubicacion real del salon */
    mapaEnlace: 'https://maps.google.com/?q=Le%C3%B3n,+Nicaragua',
    mapaEmbed: 'https://www.google.com/maps?q=Le%C3%B3n,+Nicaragua&z=14&output=embed'
  },

  /* ---- Itinerario (deja [] para ocultar la seccion) ------------------- */
  itinerario: [
    { hora: '7:00 PM', titulo: 'Recepción',   detalle: 'Bienvenida a los invitados' },
    { hora: '7:30 PM', titulo: 'Ceremonia',   detalle: 'Entrada de la quinceañera' },
    { hora: '8:15 PM', titulo: 'Vals',        detalle: 'Baile con papá y chambelanes' },
    { hora: '9:00 PM', titulo: 'Cena',        detalle: 'Servida en mesa' },
    { hora: '10:00 PM', titulo: 'Fiesta',     detalle: '¡A bailar toda la noche!' }
  ],

  /* ---- Codigo de vestimenta ------------------------------------------ */
  vestimenta: {
    etiqueta: 'Formal',
    texto: 'Para las damas sugerimos vestido largo. Por favor abstenerse de usar cualquier tono de rojo, ya que es un color reservado para la quinceañera. Los caballeros por favor opten por traje.',
    /* Colores que se piden evitar, se muestran como muestras tachadas */
    coloresReservados: ['#A8C4E0', '#6E8FC0', '#3E5C8C', '#243E66']
  },

  /* ---- Lluvia de sobres ----------------------------------------------- */
  sobres: {
    titulo: 'Lluvia de sobres',
    texto: 'Mi mejor regalo será compartir este día contigo. Si deseas obsequiarme algo, estaré recibiendo con cariño tu sobre como parte de esta lluvia de bendiciones.',
    cierre: '¡Gracias por su cariño y generosidad!'
  },

  /* ---- Confirmacion de asistencia (RSVP) ------------------------------ */
  rsvp: {
    activo: true,
    /* ATENCION: numero INVENTADO. Repositorio publico: el WhatsApp real de
       la familia no va aqui, se llena en cuanto se publique la pagina. */
    whatsapp: '50588887777',           // ficticio (505 = Nicaragua)
    /* Fecha limite para confirmar, texto libre */
    limite: '25 de noviembre'
  },

  /* ---- Musica de fondo ------------------------------------------------ */
  musica: {
    activo: true,
    archivo: 'assets/audio/cancion.mp3',  // <-- PENDIENTE: poner el mp3 ahi
    titulo: 'Canción de Loren'
  },

  /* ---- Seccion de fotos de los invitados (la dejamos preparada) ------- */
  fotos: {
    activo: true,
    /* ATENCION: enlace INVENTADO, solo para que el cliente vea la seccion.
       El enlace real de subida no va en un repositorio publico: cualquiera
       podria subir lo que quiera al album. */
    enlace: 'https://ejemplo.com/fotos-lindsey',   // ficticio
    /* En true, la pagina avisa que el enlace todavia es de muestra */
    demo: true,
    texto: 'Ayúdanos a guardar cada momento de esta noche. Escanea, sube tus fotos y forma parte del álbum de Lindsey.'
  },

  /* ---- Textos varios -------------------------------------------------- */
  textos: {
    portadaSuperior: 'Te invito a mis',
    botonAbrir: 'Abrir invitación',
    cierre: '¡Los esperamos!'
  }
};
