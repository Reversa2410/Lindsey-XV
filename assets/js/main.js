/* =========================================================================
   INVITACION DIGITAL XV — LOGICA
   Todo se arma a partir de window.CONFIG (assets/js/config.js)
   ========================================================================= */
(function () {
  'use strict';

  var C = window.CONFIG;
  var $ = function (id) { return document.getElementById(id); };

  var MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio',
               'Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  var MESES_CORTOS = ['Ene.','Feb.','Mar.','Abr.','May.','Jun.','Jul.',
                      'Ago.','Sept.','Oct.','Nov.','Dic.'];
  var DIAS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  var DIAS_CAB = ['Do','Lu','Ma','Mi','Ju','Vi','Sa'];

  var F = C.fecha;
  var FECHA_EVENTO = new Date(F.anio, F.mes - 1, F.dia, F.hora, F.minuto, 0);

  var menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ======================================================================
     1. VOLCAR LOS DATOS DE CONFIG EN LA PAGINA
     ====================================================================== */
  function pintarDatos() {
    var nombreCompleto = C.nombre + ' ' + C.apellido;

    document.title = 'Mis XV · ' + nombreCompleto;
    $('portadaIntro').textContent = C.textos.portadaSuperior;
    $('portadaNombre').textContent = C.nombre;
    $('btnAbrirTexto').textContent = C.textos.botonAbrir;
    $('heroNombre').textContent = nombreCompleto;
    $('cierreTexto').textContent = C.textos.cierre;
    $('cierreNombre').textContent = nombreCompleto + ' · XV';

    /* --- Fecha --- */
    $('calMes').textContent = MESES[F.mes - 1];
    $('fDiaSemana').textContent = DIAS[FECHA_EVENTO.getDay()];
    $('fNumero').textContent = F.dia;
    $('fMes').textContent = MESES_CORTOS[F.mes - 1];
    $('fHora').textContent = formatoHora(F.hora, F.minuto);

    /* --- Padres y padrinos --- */
    $('listaPadres').innerHTML = C.padres.map(function (n) {
      return '<p>' + escapar(n) + '</p>';
    }).join('');

    if (C.padrinos && C.padrinos.length) {
      $('bloquePadrinos').hidden = false;
      $('listaPadrinos').innerHTML = C.padrinos.map(function (n) {
        return '<p>' + escapar(n) + '</p>';
      }).join('');
    }

    /* --- Carta --- */
    $('cartaTexto').innerHTML = C.carta.map(function (p) {
      return '<p>' + escapar(p) + '</p>';
    }).join('');
    $('cartaFirma').textContent = C.firmaCarta;

    /* --- Lugar --- */
    $('lugarNombre').textContent = C.lugar.nombre;
    $('lugarDir').textContent = C.lugar.direccion;
    $('btnMapa').href = C.lugar.mapaEnlace;
    if (C.lugar.mapaEmbed) {
      $('mapaFrame').src = C.lugar.mapaEmbed;
    } else {
      $('mapaCaja').style.display = 'none';
    }

    /* --- Vestimenta --- */
    $('vestEtiqueta').textContent = C.vestimenta.etiqueta;
    $('vestTexto').textContent = C.vestimenta.texto;
    $('muestras').innerHTML = C.vestimenta.coloresReservados.map(function (c) {
      return '<span class="muestra" style="background:' + c + '" title="' + c + '"></span>';
    }).join('');

    /* --- Sobres --- */
    $('sobresTitulo').textContent = C.sobres.titulo;
    $('sobresTexto').textContent = C.sobres.texto;
    $('sobresCierre').textContent = C.sobres.cierre;

    /* --- Itinerario --- */
    if (C.itinerario && C.itinerario.length) {
      $('lineaTiempo').innerHTML = C.itinerario.map(function (it, i) {
        return '<li class="reveal" style="--d:' + (i * 90) + 'ms">' +
               '<span class="linea__hora">' + escapar(it.hora) + '</span>' +
               '<span class="linea__titulo">' + escapar(it.titulo) + '</span>' +
               '<span class="linea__detalle">' + escapar(it.detalle) + '</span>' +
               '</li>';
      }).join('');
    } else {
      $('seccionItinerario').style.display = 'none';
    }

    /* --- RSVP --- */
    if (C.rsvp && C.rsvp.activo) {
      $('rsvpTexto').textContent = 'Por favor confirma antes del ' + C.rsvp.limite +
                                   ' para reservar tu lugar.';
    } else {
      $('seccionRsvp').style.display = 'none';
    }

    /* --- Fotos --- */
    if (C.fotos && C.fotos.activo) {
      $('fotosTexto').textContent = C.fotos.texto;
      if (C.fotos.enlace) {
        $('btnFotos').href = C.fotos.enlace;
        if (C.fotos.demo) {
          $('fotosPendiente').textContent =
            'Enlace de muestra — se activará antes del evento';
        } else {
          $('fotosPendiente').style.display = 'none';
        }
      } else {
        $('btnFotos').removeAttribute('href');
        $('btnFotos').style.opacity = '.45';
        $('btnFotos').style.pointerEvents = 'none';
      }
    } else {
      $('seccionFotos').style.display = 'none';
    }
  }

  function formatoHora(h, m) {
    var sufijo = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    return h12 + ':' + String(m).padStart(2, '0') + ' ' + sufijo;
  }

  function escapar(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ======================================================================
     2. CALENDARIO DEL MES
     ====================================================================== */
  function pintarCalendario() {
    var primerDia = new Date(F.anio, F.mes - 1, 1).getDay();
    var totalDias = new Date(F.anio, F.mes, 0).getDate();

    var html = '<div class="calendario__fila">';
    DIAS_CAB.forEach(function (d) {
      html += '<div class="calendario__cab">' + d + '</div>';
    });
    html += '</div><div class="calendario__fila">';

    for (var v = 0; v < primerDia; v++) {
      html += '<div class="calendario__dia calendario__dia--vacio"></div>';
    }
    for (var d = 1; d <= totalDias; d++) {
      var clase = 'calendario__dia' + (d === F.dia ? ' calendario__dia--marcado' : '');
      html += '<div class="' + clase + '">' + d + '</div>';
    }
    html += '</div>';

    $('calendario').innerHTML = html;
  }

  /* ======================================================================
     3. CUENTA REGRESIVA
     ====================================================================== */
  var previo = {};
  function actualizarReloj() {
    var falta = FECHA_EVENTO - new Date();

    if (falta <= 0) {
      $('reloj').innerHTML = '<p class="cuenta__titulo" style="margin:0">¡Hoy es el día!</p>';
      return true;
    }

    var seg = Math.floor(falta / 1000);
    var valores = {
      cDias:  Math.floor(seg / 86400),
      cHoras: Math.floor(seg % 86400 / 3600),
      cMin:   Math.floor(seg % 3600 / 60),
      cSeg:   seg % 60
    };

    Object.keys(valores).forEach(function (id) {
      var v = String(valores[id]).padStart(2, '0');
      if (previo[id] === v) return;
      previo[id] = v;
      var el = $(id);
      if (!el) return;
      el.textContent = v;
      if (!menosMovimiento) {
        el.classList.remove('tic');
        void el.offsetWidth;          // reinicia la animacion
        el.classList.add('tic');
      }
    });
    return false;
  }

  function arrancarReloj() {
    if (actualizarReloj()) return;
    var t = setInterval(function () {
      if (actualizarReloj()) clearInterval(t);
    }, 1000);
  }

  /* ======================================================================
     4. APARICIONES AL HACER SCROLL
     ====================================================================== */
  function observarReveals() {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('visible');
        obs.unobserve(e.target);
        if (e.target.id === 'iconoSobre') e.target.classList.add('saluda');
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('.reveal').forEach(function (el, i) {
      if (!el.style.getPropertyValue('--d')) {
        el.style.setProperty('--d', (i % 4) * 70 + 'ms');
      }
      obs.observe(el);
    });

    /* El sobre se anima aparte porque no es .reveal */
    var sobre = $('iconoSobre');
    if (sobre) {
      new IntersectionObserver(function (ent, o) {
        ent.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('saluda'); o.unobserve(e.target); }
        });
      }, { threshold: 0.5 }).observe(sobre);
    }
  }

  /* ======================================================================
     5. PETALOS FLOTANTES
     ====================================================================== */
  function crearPetalos(cantidad) {
    if (menosMovimiento) return;
    var caja = $('petalos');
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
     6. MUSICA
     ====================================================================== */
  var audio = $('audio');
  var btnMusica = $('btnMusica');
  var audioDisponible = true;

  function prepararMusica() {
    if (!C.musica || !C.musica.activo) { btnMusica.hidden = true; return; }
    btnMusica.hidden = false;
    audio.src = C.musica.archivo;

    audio.addEventListener('error', function () {
      audioDisponible = false;
      btnMusica.title = 'Falta el archivo de música en ' + C.musica.archivo;
      console.warn('[XV] No se encontró el archivo de música:', C.musica.archivo);
    });

    btnMusica.addEventListener('click', function () {
      if (audio.paused) reproducir(); else pausar();
    });
  }

  function reproducir() {
    if (!audioDisponible) return;
    var p = audio.play();
    if (p && p.catch) {
      p.then(function () {
        document.body.classList.add('sonando');
        btnMusica.setAttribute('aria-label', 'Pausar música');
      }).catch(function () {
        document.body.classList.remove('sonando');
      });
    }
  }

  function pausar() {
    audio.pause();
    document.body.classList.remove('sonando');
    btnMusica.setAttribute('aria-label', 'Reproducir música');
  }

  /* ======================================================================
     7. APERTURA DE LA PORTADA
     ====================================================================== */
  function prepararPortada() {
    $('btnAbrir').addEventListener('click', function () {
      var portada = $('portada');
      portada.classList.add('abriendo');
      document.body.classList.remove('bloqueado');
      document.body.classList.add('abierta');

      /* El clic del usuario desbloquea el audio en el navegador */
      if (C.musica && C.musica.activo) reproducir();

      setTimeout(function () { portada.style.display = 'none'; }, 1500);
      window.scrollTo({ top: 0 });
    }, { once: true });
  }

  /* ======================================================================
     8. AGREGAR AL CALENDARIO (.ics)
     ====================================================================== */
  function prepararBotonCalendario() {
    $('btnCalendario').addEventListener('click', function () {
      var inicio = FECHA_EVENTO;
      var fin = new Date(inicio.getTime() + 5 * 3600 * 1000);

      var ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//XV//ES',
        'BEGIN:VEVENT',
        'UID:' + Date.now() + '@xv',
        'DTSTAMP:' + aFormatoICS(new Date()),
        'DTSTART:' + aFormatoICS(inicio),
        'DTEND:' + aFormatoICS(fin),
        'SUMMARY:XV años de ' + C.nombre + ' ' + C.apellido,
        'DESCRIPTION:Te esperamos para celebrar los quince años de ' + C.nombre + '.',
        'LOCATION:' + (C.lugar.nombre + ' - ' + C.lugar.direccion).replace(/,/g, '\\,'),
        'END:VEVENT', 'END:VCALENDAR'
      ].join('\r\n');

      var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'XV-' + C.nombre + '.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });
  }

  function aFormatoICS(d) {
    var p = function (n) { return String(n).padStart(2, '0'); };
    return d.getUTCFullYear() + p(d.getUTCMonth() + 1) + p(d.getUTCDate()) + 'T' +
           p(d.getUTCHours()) + p(d.getUTCMinutes()) + '00Z';
  }

  /* ======================================================================
     9. CONFIRMACION POR WHATSAPP
     ====================================================================== */
  function prepararRsvp() {
    var form = $('rsvpForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nombre = $('rsvpNombre').value.trim();
      if (!nombre) return;

      var asiste = document.querySelector('input[name=asiste]:checked').value;
      var cantidad = $('rsvpCantidad').value;

      var mensaje = asiste === 'si'
        ? '¡Hola! Soy ' + nombre + '. Confirmo mi asistencia a los XV de ' + C.nombre +
          '. Seremos ' + cantidad + (cantidad === '1' ? ' persona.' : ' personas.')
        : 'Hola, soy ' + nombre + '. Lamentablemente no podré acompañarlos en los XV de ' +
          C.nombre + '. ¡Muchas felicidades!';

      window.open('https://wa.me/' + C.rsvp.whatsapp + '?text=' +
                  encodeURIComponent(mensaje), '_blank');
    });
  }

  /* ======================================================================
     10. PARALLAX SUAVE + BARRA DE PROGRESO
     ====================================================================== */
  function prepararScroll() {
    var lazo = $('heroLazo');
    var vestido = $('heroVestido');
    var barra = $('progresoBarra');
    var pendiente = false;

    function alScroll() {
      var y = window.scrollY;
      var alto = document.documentElement.scrollHeight - window.innerHeight;
      barra.style.width = (alto > 0 ? (y / alto) * 100 : 0) + '%';

      if (!menosMovimiento && y < window.innerHeight * 1.2) {
        if (lazo) lazo.style.transform = 'translateY(' + (y * 0.18) + 'px)';
        if (vestido) vestido.style.transform = 'translateY(' + (y * -0.07) + 'px)';
      }
      pendiente = false;
    }

    window.addEventListener('scroll', function () {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(alScroll);
    }, { passive: true });
  }

  /* ======================================================================
     11. LLUVIA DE PETALOS EN EL CIERRE
     ====================================================================== */
  function prepararConfeti() {
    if (menosMovimiento) return;
    var lienzo = $('confeti');
    var ctx = lienzo.getContext('2d');
    var piezas = [];
    var animando = false;
    var colores = ['#A9C6E6', '#C8DCF0', '#FFFFFF', '#8CAFD8', '#E7D9EC'];

    function medir() {
      lienzo.width = window.innerWidth;
      lienzo.height = window.innerHeight;
    }
    medir();
    window.addEventListener('resize', medir);

    function lanzar() {
      if (animando) return;
      animando = true;
      lienzo.classList.add('activo');
      piezas = [];
      for (var i = 0; i < 90; i++) {
        piezas.push({
          x: Math.random() * lienzo.width,
          y: -20 - Math.random() * lienzo.height * 0.6,
          r: 3 + Math.random() * 5,
          vy: 0.8 + Math.random() * 1.8,
          vx: -0.6 + Math.random() * 1.2,
          giro: Math.random() * Math.PI,
          vGiro: -0.03 + Math.random() * 0.06,
          color: colores[Math.floor(Math.random() * colores.length)],
          alfa: 0.5 + Math.random() * 0.5
        });
      }
      requestAnimationFrame(dibujar);
    }

    function dibujar() {
      ctx.clearRect(0, 0, lienzo.width, lienzo.height);
      var vivos = 0;

      piezas.forEach(function (p) {
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.y / 50) * 0.5;
        p.giro += p.vGiro;
        if (p.y < lienzo.height + 30) vivos++;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.giro);
        ctx.globalAlpha = p.alfa;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r, p.r * 0.68, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      if (vivos > 0) {
        requestAnimationFrame(dibujar);
      } else {
        lienzo.classList.remove('activo');
        ctx.clearRect(0, 0, lienzo.width, lienzo.height);
        animando = false;
      }
    }

    var cierre = document.querySelector('.cierre');
    if (!cierre) return;
    new IntersectionObserver(function (ent) {
      ent.forEach(function (e) { if (e.isIntersecting) lanzar(); });
    }, { threshold: 0.45 }).observe(cierre);
  }

  /* ======================================================================
     ARRANQUE
     ====================================================================== */
  function iniciar() {
    pintarDatos();
    pintarCalendario();
    arrancarReloj();
    observarReveals();
    crearPetalos(16);
    prepararMusica();
    prepararPortada();
    prepararBotonCalendario();
    prepararRsvp();
    prepararScroll();
    prepararConfeti();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
