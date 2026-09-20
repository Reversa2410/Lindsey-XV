/* =========================================================================
   ALBUM DE FOTOS — LOGICA DE LA PAGINA galeria.html
   -------------------------------------------------------------------------
   Vive aparte de main.js a proposito: la galeria tiene su propia pagina,
   asi que no tiene por que cargar (ni depender de) la invitacion entera.
   Los datos salen del mismo window.CONFIG (assets/js/config.js).
   ========================================================================= */
(function () {
  'use strict';

  var C = window.CONFIG;
  var $ = function (id) { return document.getElementById(id); };

  var menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function escapar(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* El formulario de subida es el mismo de la invitacion y vive en
     assets/js/subida.js, para que subir una foto funcione igual desde las
     dos paginas sin tener el codigo repetido en ninguna. */
  var Subida = window.XVSubida;

  function driveListo() {
    return !!(Subida && Subida.driveListo());
  }

  /* ======================================================================
     1. GALERIA
     ----------------------------------------------------------------------
     El script solo manda los datos de cada foto, no las imagenes. Las
     imagenes se le piden despues directamente a Drive, que las sirve ya
     redimensionadas al tamaño que se le pida. Asi la miniatura de la
     rejilla pesa poco y la grande solo se descarga si alguien la abre.
     ====================================================================== */

  var galeriaFotos = [];
  var galeriaMostradas = 0;
  var visorIndice = 0;

  /* Drive sirve la misma foto a cualquier ancho; se le pide el que hace
     falta en cada sitio en vez de bajar siempre la original.
     La plantilla se puede cambiar desde config (galeria.baseMiniatura),
     pero normalmente no hace falta tocarla.

     IMPORTANTE: las <img> que usen esta URL necesitan el atributo
     referrerpolicy="no-referrer". Drive rechaza la peticion si el navegador
     le manda de que pagina viene, y la foto no carga. Desde curl si
     funciona, porque curl no manda esa cabecera, asi que es un fallo que
     engaña: parece un problema de permisos y no lo es. */
  var BASE_MINIATURA = 'https://drive.google.com/thumbnail?id={id}&sz=w{ancho}';

  function urlFoto(id, ancho) {
    var base = (C.fotos.galeria && C.fotos.galeria.baseMiniatura) || BASE_MINIATURA;
    return base.replace('{id}', encodeURIComponent(id)).replace('{ancho}', ancho);
  }

  /* Si la galeria esta apagada o el script todavia no esta publicado, la
     pagina no se queda en blanco: lo dice con todas sus letras. */
  function prepararGaleria() {
    var g = C.fotos && C.fotos.galeria;
    var nombreCompleto = C.nombre + ' ' + C.apellido;

    document.title = ((g && g.titulo) || 'Álbum') + ' · ' + nombreCompleto;
    $('albumNombre').textContent = nombreCompleto + ' · XV';
    $('galeriaTitulo').textContent = (g && g.titulo) || 'Álbum de la noche';

    if (!g || !g.activa || !driveListo()) {
      $('galeriaTexto').textContent = '';
      $('galeriaEstado').textContent =
        'El álbum se abrirá el día del evento. ¡Vuelve pronto!';
      return;
    }

    $('galeriaTexto').textContent = g.texto;

    $('galeriaMas').addEventListener('click', function () {
      pintarGaleria(galeriaMostradas + g.porPagina);
    });

    prepararVisor();
    cargarGaleria();

    if (g.refrescarCada > 0) {
      setInterval(cargarGaleria, g.refrescarCada * 1000);
    }
  }

  function cargarGaleria() {
    var g = C.fotos.galeria;
    var url = C.fotos.drive.urlScript + '?accion=listar&max=' + g.maximo;

    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.ok) throw new Error((d && d.error) || 'respuesta inesperada');

        galeriaFotos = d.fotos || [];
        if (!galeriaFotos.length) {
          $('galeria').innerHTML = '';
          $('galeriaEstado').hidden = false;
          $('galeriaEstado').textContent =
            'Todavía no hay fotos. ¡Sé el primero en compartir una!';
          $('galeriaMas').hidden = true;
          return;
        }
        $('galeriaEstado').hidden = true;
        pintarGaleria(Math.max(galeriaMostradas, g.porPagina));
      })
      .catch(function (e) {
        console.warn('[XV] No se pudo cargar la galería', e);
        /* Si ya hay fotos en pantalla no se borran por un fallo de red:
           mejor dejar lo que se ve que vaciar el álbum. */
        if (!galeriaFotos.length) {
          $('galeriaEstado').hidden = false;
          $('galeriaEstado').textContent = 'No se pudo cargar el álbum ahora mismo.';
        }
      });
  }

  function pintarGaleria(cuantas) {
    var visibles = Math.min(cuantas, galeriaFotos.length);
    galeriaMostradas = visibles;

    $('galeria').innerHTML = galeriaFotos.slice(0, visibles).map(function (f, i) {
      var de = f.invitado ? 'Foto de ' + escapar(f.invitado) : 'Foto del evento';
      return '<button type="button" class="galeria__foto" data-i="' + i + '" ' +
             'style="--d:' + ((i % 12) * 45) + 'ms">' +
               '<img src="' + urlFoto(f.id, 400) + '" alt="' + de + '" ' +
               'loading="lazy" decoding="async" referrerpolicy="no-referrer">' +
             '</button>';
    }).join('');

    $('galeriaMas').hidden = visibles >= galeriaFotos.length;

    Array.prototype.forEach.call(
      $('galeria').querySelectorAll('.galeria__foto'),
      function (boton) {
        boton.addEventListener('click', function () {
          abrirVisor(parseInt(boton.getAttribute('data-i'), 10));
        });
        var img = boton.querySelector('img');
        var idx = parseInt(boton.getAttribute('data-i'), 10);
        var intentos = 0;

        /* Drive limita cuántas fotos sirve a la vez, así que cuando se
           cargan muchas de golpe algunas fallan sin motivo real. Por eso
           se reintenta antes de rendirse: un fallo pasajero no puede
           borrar una foto del álbum para siempre.
           El parámetro extra evita que el navegador reutilice el fallo
           que ya guardó en caché. */
        img.addEventListener('error', function () {
          intentos++;
          if (intentos <= 3) {
            setTimeout(function () {
              img.src = urlFoto(galeriaFotos[idx].id, 400) + '&r=' + intentos;
            }, 700 * intentos);
            return;
          }
          boton.remove();
          avisarSiQuedoVacia();
        });

        img.addEventListener('load', function () {
          boton.classList.add('galeria__foto--lista');
        });
      }
    );
  }

  /* Si el script dijo que hay fotos pero ninguna se pudo mostrar, casi
     siempre es que a los archivos les falta el permiso de "visible con
     enlace". Sin este aviso la galería se quedaría en blanco sin explicar
     nada, que es lo peor para saber qué está pasando. */
  function avisarSiQuedoVacia() {
    if (!galeriaFotos.length) return;
    if ($('galeria').children.length > 0) return;

    $('galeriaEstado').hidden = false;
    $('galeriaEstado').textContent =
      'Hay ' + galeriaFotos.length + ' foto' + (galeriaFotos.length === 1 ? '' : 's') +
      ' en el álbum, pero no se pudieron mostrar. Revisa que estén compartidas.';
    $('galeriaMas').hidden = true;
    console.warn('[XV] La galería recibió fotos pero ninguna cargó. ' +
      'Ejecuta compartirTodas() en el script de Google.');
  }

  /* --------------------------- visor a pantalla completa --------------- */
  function prepararVisor() {
    $('visorCerrar').addEventListener('click', cerrarVisor);
    $('visorAnterior').addEventListener('click', function () { moverVisor(-1); });
    $('visorSiguiente').addEventListener('click', function () { moverVisor(1); });

    $('visor').addEventListener('click', function (e) {
      if (e.target === $('visor')) cerrarVisor();
    });

    document.addEventListener('keydown', function (e) {
      if ($('visor').hidden) return;
      if (e.key === 'Escape') cerrarVisor();
      if (e.key === 'ArrowLeft') moverVisor(-1);
      if (e.key === 'ArrowRight') moverVisor(1);
    });

    /* Deslizar con el dedo, que es como se va a usar de verdad */
    var inicioX = null;
    $('visor').addEventListener('touchstart', function (e) {
      inicioX = e.changedTouches[0].clientX;
    }, { passive: true });
    $('visor').addEventListener('touchend', function (e) {
      if (inicioX === null) return;
      var avance = e.changedTouches[0].clientX - inicioX;
      if (Math.abs(avance) > 50) moverVisor(avance < 0 ? 1 : -1);
      inicioX = null;
    }, { passive: true });
  }

  function abrirVisor(i) {
    visorIndice = i;
    mostrarEnVisor();
    $('visor').hidden = false;
    document.body.classList.add('bloqueado');
  }

  function cerrarVisor() {
    $('visor').hidden = true;
    document.body.classList.remove('bloqueado');
  }

  function moverVisor(paso) {
    var total = Math.min(galeriaMostradas, galeriaFotos.length);
    visorIndice = (visorIndice + paso + total) % total;   // da la vuelta
    mostrarEnVisor();
  }

  function mostrarEnVisor() {
    var f = galeriaFotos[visorIndice];
    if (!f) return;
    $('visorImagen').src = urlFoto(f.id, 1600);
    $('visorImagen').alt = f.invitado ? 'Foto de ' + f.invitado : 'Foto del evento';
    $('visorPie').textContent = (f.invitado ? f.invitado + ' · ' : '') +
      (visorIndice + 1) + ' de ' + Math.min(galeriaMostradas, galeriaFotos.length);
  }

  /* ======================================================================
     2. SUBIR FOTOS DESDE EL ALBUM
     ----------------------------------------------------------------------
     El invitado que esta mirando el album es justo el que quiere agregar
     la suya, asi que mandarlo de vuelta a la invitacion para subirla era
     hacerle dar un rodeo. Es el mismo formulario de siempre, solo que
     montado aqui.
     ====================================================================== */
  function prepararSubidaEnAlbum() {
    /* Cuando termine de subir se vuelve a pedir la lista, para que la foto
       recien mandada aparezca sola en la rejilla. Es el momento en que el
       invitado la esta esperando. */
    var montado = Subida.preparar({ alSubir: cargarGaleria });

    /* Sin script publicado no hay a donde mandar nada: mejor no enseñar
       un boton que no podria cumplir. */
    if (!montado) return;

    var tarjeta = $('tarjetaSubir');
    tarjeta.hidden = false;
    tarjeta.addEventListener('click', function () {
      var panel = $('subida');
      panel.hidden = !panel.hidden;
      tarjeta.classList.toggle('destino--abierto', !panel.hidden);
      if (!panel.hidden) panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  /* ======================================================================
     3. PETALOS FLOTANTES
     Los mismos de la invitacion, para que esta pagina no se sienta ajena.
     ====================================================================== */
  function crearPetalos(cantidad) {
    if (menosMovimiento) return;
    var caja = $('petalos');
    if (!caja) return;

    var frag = document.createDocumentFragment();
    for (var i = 0; i < cantidad; i++) {
      var p = document.createElement('span');
      var tam = 4 + Math.random() * 6;
      p.className = 'petalo';
      p.style.left = (Math.random() * 100) + '%';
      p.style.width = tam + 'px';
      p.style.height = (tam * 0.78) + 'px';
      p.style.animationDuration = (13 + Math.random() * 12) + 's';
      p.style.animationDelay = (-Math.random() * 20) + 's';
      p.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
      p.style.opacity = (0.22 + Math.random() * 0.3).toFixed(2);
      frag.appendChild(p);
    }
    caja.appendChild(frag);
  }

  /* ======================================================================
     ARRANQUE
     ====================================================================== */
  function iniciar() {
    prepararGaleria();
    prepararSubidaEnAlbum();
    crearPetalos(12);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
