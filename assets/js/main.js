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
    pintarHero();
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
      if (C.rsvp.nota) {
        $('rsvpNota').textContent = C.rsvp.nota;
        $('rsvpNota').hidden = false;
      }
    } else {
      $('seccionRsvp').style.display = 'none';
    }

    /* --- Fotos y videos --- */
    if (C.fotos && C.fotos.activo) {
      pintarFotos();
    } else {
      $('seccionFotos').style.display = 'none';
    }
  }

  /* ----------------------------------------------------------------------
     BOTONES APAGADOS A PROPOSITO (beta)

     Los botones de subir fotos, subir videos y ver el album se siguen
     viendo y se pueden tocar, pero por ahora solo avisan que estan
     apagados. Se hace desde aqui y no borrando los enlaces justamente
     para no tocar la configuracion de Drive ni la de OneDrive: esos
     datos quedan intactos y el dia que se encienda el interruptor en
     config.js todo vuelve a funcionar sin mas cambios.
     ---------------------------------------------------------------------- */
  function apagado(llave) {
    var d = C.fotos && C.fotos.deshabilitados;
    return !!(d && d[llave]);
  }

  function mensajeApagado() {
    var d = C.fotos && C.fotos.deshabilitados;
    return (d && d.mensaje) || 'Botón deshabilitado temporalmente';
  }

  /* Que interruptor le toca a cada destino: el formulario de Drive es el de
     las fotos, cualquier otro destino es el enlace de los videos. */
  function llaveDeDestino(d) {
    return d.tipo === 'drive' ? 'subirFotos' : 'subirVideos';
  }

  /* El aviso flotante que sale al tocar un boton apagado. Se crea la
     primera vez que hace falta y despues se reusa. */
  var toast = null;
  var toastReloj = null;

  function avisar(texto) {
    if (!toast) {
      toast = document.createElement('p');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = texto;
    /* Reiniciar la animacion si ya estaba a la vista */
    toast.classList.remove('toast--visible');
    void toast.offsetWidth;
    toast.classList.add('toast--visible');

    clearTimeout(toastReloj);
    toastReloj = setTimeout(function () {
      toast.classList.remove('toast--visible');
    }, 2600);
  }

  /* Dibuja los destinos de subida (uno para fotos, otro para videos).
     Un destino se muestra apagado en dos casos: porque su interruptor de
     config lo apago a proposito, o porque todavia le falta el enlace. En
     el primero avisa al tocarlo; en el segundo ni siquiera se puede tocar,
     para que se note que falta conectarlo en vez de llevar a una pagina
     rota. */
  function pintarFotos() {
    $('fotosTitulo').textContent = C.fotos.titulo;
    $('fotosTexto').textContent = C.fotos.texto;

    var destinos = C.fotos.destinos || [];
    var sinEnlace = 0;
    var hayApagados = false;

    var html = destinos.map(function (d) {
      var esFormulario = d.tipo === 'drive';
      var enPausa = apagado(llaveDeDestino(d));
      var listo = esFormulario ? driveListo() : !!d.enlace;

      if (enPausa) hayApagados = true;
      else if (!listo) sinEnlace++;

      /* En pausa siempre es un <button>: aunque el destino tenga enlace,
         no queremos que lleve a ningun lado todavia. */
      var etiqueta = (enPausa || esFormulario) ? 'button' : 'a';
      var atributos = '';

      if (enPausa) {
        atributos = ' type="button" data-apagado="1"';
      } else if (listo && esFormulario) {
        atributos = ' type="button" data-abre-subida="1"';
      } else if (listo) {
        atributos = ' href="' + escapar(d.enlace) + '" target="_blank" rel="noopener"';
      } else if (esFormulario) {
        atributos = ' type="button" disabled';
      }

      return '<' + etiqueta + ' class="destino' +
             (enPausa || !listo ? ' destino--apagado' : '') + '"' + atributos + '>' +
               '<svg class="destino__icono"><use href="#ico-' + escapar(d.icono) + '"/></svg>' +
               '<span class="destino__texto">' +
                 '<span class="destino__etiqueta">' + escapar(d.etiqueta) + '</span>' +
                 '<span class="destino__nota">' + escapar(d.nota) + '</span>' +
               '</span>' +
               '<svg class="destino__flecha"><use href="#ico-flecha"/></svg>' +
             '</' + etiqueta + '>';
    }).join('');

    /* El album se ofrece como un destino mas, junto a los de subir: es
       donde la gente lo va a buscar despues de mandar sus fotos. */
    var g = C.fotos.galeria;
    if (g && g.activa && (galeriaLista() || apagado('album'))) {
      var albumEnPausa = apagado('album');
      if (albumEnPausa) hayApagados = true;

      html += albumEnPausa
        ? '<button type="button" class="destino destino--album destino--apagado" data-apagado="1">'
        : '<a class="destino destino--album" href="galeria.html">';
      html +=   '<svg class="destino__icono"><use href="#ico-camara"/></svg>' +
                '<span class="destino__texto">' +
                  '<span class="destino__etiqueta">' + escapar(g.titulo) + '</span>' +
                  '<span class="destino__nota">' + escapar(g.notaEnlace) + '</span>' +
                '</span>' +
                '<svg class="destino__flecha"><use href="#ico-flecha"/></svg>';
      html += albumEnPausa ? '</button>' : '</a>';
    }

    $('fotosDestinos').innerHTML = html;

    var abre = $('fotosDestinos').querySelector('[data-abre-subida]');
    if (abre) {
      abre.addEventListener('click', function () {
        var panel = $('subida');
        panel.hidden = !panel.hidden;
        if (!panel.hidden) panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
    }

    /* Un solo escucha para todos los apagados, en el contenedor. */
    $('fotosDestinos').addEventListener('click', function (e) {
      if (e.target.closest('[data-apagado]')) avisar(mensajeApagado());
    });

    var aviso = $('fotosPendiente');
    if (hayApagados) {
      aviso.textContent = 'Fotos, videos y álbum se activarán antes del evento';
    } else if (C.fotos.demo) {
      aviso.textContent = 'Enlaces de muestra — se activarán antes del evento';
    } else if (sinEnlace) {
      aviso.textContent = sinEnlace === 1
        ? 'Falta conectar uno de los enlaces'
        : 'Faltan conectar los enlaces de subida';
    } else {
      aviso.style.display = 'none';
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
     1b. SUBIDA DE FOTOS
     ----------------------------------------------------------------------
     El formulario vive en assets/js/subida.js, porque se sube igual desde
     aqui que desde el album y el codigo no puede ser de una sola pagina.
     ====================================================================== */
  var Subida = window.XVSubida;

  function driveListo() {
    return !!(Subida && Subida.driveListo());
  }

  /* El album se enseña solo cuando de verdad hay de donde sacar las fotos.
     Sin script publicado, la pagina de la galeria no tendria nada que
     mostrar, asi que es mejor no anunciarla todavia. */
  function galeriaLista() {
    var g = C.fotos && C.fotos.galeria;
    return !!(g && g.activa && driveListo());
  }

  /* ======================================================================
     1c. ACCESO AL ALBUM
     ----------------------------------------------------------------------
     La galeria ya no vive aqui: tiene su propia pagina (galeria.html), con
     su propia logica en assets/js/galeria.js. Desde la invitacion solo se
     enciende el boton flotante que lleva hasta ella, y solo si hay de
     verdad un album que mostrar.
     ====================================================================== */
  function prepararBotonGaleria() {
    var g = C.fotos && C.fotos.galeria;
    if (!g || !g.activa) return;

    var enPausa = apagado('album');
    if (!galeriaLista() && !enPausa) return;

    var boton = $('btnGaleria');
    boton.hidden = false;
    boton.setAttribute('aria-label', 'Ver ' + g.titulo);
    boton.title = enPausa ? mensajeApagado() : 'Ver ' + g.titulo;

    /* Apagado sigue siendo el mismo boton, en el mismo sitio: solo deja de
       llevar al album y avisa por que. Se le quita el href para que no se
       pueda abrir en otra pestaña con el menu del navegador. */
    if (enPausa) {
      boton.classList.add('btnFlotante--apagado');
      boton.removeAttribute('href');
      boton.setAttribute('role', 'button');
      boton.setAttribute('tabindex', '0');
      boton.addEventListener('click', function (e) {
        e.preventDefault();
        avisar(mensajeApagado());
      });
    }
  }

  /* ----------------------------------------------------------------------
     El lienzo del hero: la composicion del diseño de Canva.
     La fecha y la direccion salen de la misma config que el resto de la
     pagina, asi que cambiar CONFIG.fecha mueve tambien lo que dice aqui.
     ---------------------------------------------------------------------- */
  function pintarHero() {
    var H = C.hero || {};

    if (H.lienzo) $('heroLienzo').style.setProperty('--lienzo', H.lienzo);

    var marco = $('heroMarco');
    if (H.marco) marco.src = H.marco; else marco.hidden = true;

    $('heroNombre').textContent = C.nombre;
    $('heroDia').textContent = DIAS[FECHA_EVENTO.getDay()];
    $('heroFecha').textContent = F.dia + ' de ' + MESES[F.mes - 1].toLowerCase();
    $('heroLugar').textContent = C.lugar.direccion;

    /* Sin foto real todavia? Entonces va la ilustracion en el arco. */
    var foto = $('heroFoto');
    if (H.foto) {
      foto.src = H.foto;
      foto.alt = H.fotoAlt || '';
    } else {
      foto.hidden = true;
      /* Ojo: es un <svg>, y la propiedad .hidden solo existe en los
         elementos HTML. En un SVG hay que quitar el ATRIBUTO a mano o se
         queda invisible para siempre. */
      $('heroDibujo').removeAttribute('hidden');
    }
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

    if (C.musica.precargar !== false) adelantarDescarga();
  }

  /* ----------------------------------------------------------------------
     Adelantar la descarga de la cancion.

     El <audio> viene con preload="none", asi que al cargar la pagina no
     baja ni un byte: la portada, el marco floral y las tipografias no
     compiten con la cancion. Eso ya estaba bien.

     Lo que faltaba es el otro lado: si la descarga arranca recien cuando
     el invitado toca "Abrir invitacion", queda un silencio incomodo hasta
     que llegan los primeros segundos. Con el internet de un salon lleno
     pueden ser dos o tres.

     Asi que se usa el hueco que hay entre las dos cosas: la pagina YA
     termino de cargar todo lo demas, y el invitado todavia esta mirando
     la portada antes de tocar. Ahi se baja la cancion, sin quitarle
     ancho de banda a nada, y al tocar el boton suena de una.
     ---------------------------------------------------------------------- */
  function adelantarDescarga() {
    /* Con ahorro de datos o red lenta no se adelanta nada: esos megas los
       paga el invitado. Que los gaste solo si de verdad le da play. */
    var red = navigator.connection;
    if (red && (red.saveData || /(^|-)2g$/.test(red.effectiveType || ''))) return;

    function bajar() {
      /* Si ya viene sonando (por ejemplo al volver del album), load()
         reiniciaria la reproduccion. Mejor no tocar nada. */
      if (!audio.paused || audio.currentTime > 0) return;
      audio.preload = 'auto';
      audio.load();
    }

    function enElHueco() {
      if (window.requestIdleCallback) requestIdleCallback(bajar, { timeout: 2000 });
      else setTimeout(bajar, 600);
    }

    if (document.readyState === 'complete') enElHueco();
    else window.addEventListener('load', enElHueco, { once: true });
  }

  function reproducir() {
    if (!audioDisponible) return;
    var p = audio.play();
    if (p && p.catch) {
      p.then(function () {
        document.body.classList.add('sonando');
        btnMusica.setAttribute('aria-label', 'Pausar música');
        recordar(LLAVE_SONANDO, true);
      }).catch(function () {
        document.body.classList.remove('sonando');
      });
    }
  }

  function pausar() {
    audio.pause();
    document.body.classList.remove('sonando');
    btnMusica.setAttribute('aria-label', 'Reproducir música');
    recordar(LLAVE_SONANDO, false);
  }

  /* ======================================================================
     7. APERTURA DE LA PORTADA
     ====================================================================== */
  /* Se recuerda en sessionStorage y no en localStorage a proposito: vale
     para esta visita, no para siempre. Quien vuelva otro dia merece ver la
     portada abrirse otra vez, que es la mejor parte. */
  var LLAVE_ABIERTA = 'xv-abierta';
  var LLAVE_SONANDO = 'xv-sonando';

  function recordar(llave, valor) {
    try { sessionStorage.setItem(llave, valor ? '1' : '0'); } catch (e) { /* modo privado */ }
  }

  function recordado(llave) {
    try { return sessionStorage.getItem(llave) === '1'; } catch (e) { return false; }
  }

  function prepararPortada() {
    /* Al volver del album la invitacion ya estaba abierta: repetir la
       portada se sentiria un paso atras, asi que se entra directo. */
    if (recordado(LLAVE_ABIERTA)) { entrarSinPortada(); return; }

    $('btnAbrir').addEventListener('click', function () {
      var portada = $('portada');
      portada.classList.add('abriendo');
      document.body.classList.remove('bloqueado');
      document.body.classList.add('abierta');
      recordar(LLAVE_ABIERTA, true);

      /* El clic del usuario desbloquea el audio en el navegador */
      if (C.musica && C.musica.activo) reproducir();

      setTimeout(function () { portada.style.display = 'none'; }, 1500);
      window.scrollTo({ top: 0 });
    }, { once: true });
  }

  function entrarSinPortada() {
    $('portada').style.display = 'none';
    document.body.classList.remove('bloqueado');
    document.body.classList.add('abierta');

    /* Si la musica venia sonando se intenta retomarla. Puede que el
       navegador lo rechace por no haber un toque todavia en esta pagina;
       en ese caso reproducir() lo deja pasar en silencio y el invitado la
       enciende con el boton, como siempre. */
    if (C.musica && C.musica.activo && recordado(LLAVE_SONANDO)) reproducir();

    /* El navegador intenta saltar al ancla nada mas cargar, cuando el
       cuerpo todavia esta bloqueado, asi que el salto se pierde. Se
       repite aqui, ya con la invitacion abierta. */
    var destino = null;
    try { destino = location.hash && document.querySelector(location.hash); }
    catch (e) { destino = null; }

    if (destino) {
      requestAnimationFrame(function () {
        destino.scrollIntoView({ block: 'start' });
      });
    }
  }

  /* ======================================================================
     8. AGREGAR AL CALENDARIO (.ics)
     ====================================================================== */
  function prepararBotonCalendario() {
    $('btnCalendario').addEventListener('click', function () {
      var inicio = FECHA_EVENTO;
      var horas = C.duracionHoras || 5;
      var fin = new Date(inicio.getTime() + horas * 3600 * 1000);

      /* La direccion escrita no le basta al telefono para saber donde
         queda: "Primera entrada Reparto San Mateo" no es algo que un mapa
         acierte solo. Por eso el evento lleva ademas las coordenadas y el
         enlace de Maps, que es lo que de verdad se toca el dia del evento. */
      var donde = C.lugar.nombre + ' - ' + C.lugar.direccion;
      var detalle = 'Te esperamos para celebrar los quince años de ' + C.nombre + '.';
      if (C.lugar.mapaEnlace) detalle += '\n\nCómo llegar: ' + C.lugar.mapaEnlace;

      var lineas = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//XV//ES', 'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        'UID:' + Date.now() + '@xv',
        'DTSTAMP:' + aFormatoICS(new Date()),
        'DTSTART:' + aFormatoICS(inicio),
        'DTEND:' + aFormatoICS(fin),
        'SUMMARY:' + escaparICS('XV años de ' + C.nombre + ' ' + C.apellido),
        'DESCRIPTION:' + escaparICS(detalle),
        'LOCATION:' + escaparICS(donde)
      ];

      /* GEO lleva punto y coma, no coma: "GEO:12.434;-86.899" */
      if (C.lugar.coordenadas) lineas.push('GEO:' + C.lugar.coordenadas.replace(',', ';'));

      lineas.push('END:VEVENT', 'END:VCALENDAR');

      var ics = lineas.map(plegar).join('\r\n');

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

  /* La fecha del .ics va en UTC, con la Z al final. El navegador hace la
     conversion desde la hora local que se puso en config. */
  function aFormatoICS(d) {
    var p = function (n) { return String(n).padStart(2, '0'); };
    return d.getUTCFullYear() + p(d.getUTCMonth() + 1) + p(d.getUTCDate()) + 'T' +
           p(d.getUTCHours()) + p(d.getUTCMinutes()) + '00Z';
  }

  /* En un .ics la coma y el punto y coma separan valores, asi que dentro
     de un texto hay que escaparlos o la linea se parte en dos y el evento
     llega cortado. Antes solo se escapaba la coma de LOCATION, que alcanzaba
     porque no habia mas texto con simbolos; ahora la descripcion lleva un
     enlace y conviene hacerlo bien. */
  function escaparICS(texto) {
    return String(texto)
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');
  }

  /* El formato no permite lineas de mas de 75 octetos: las largas se parten
     y la continuacion empieza con un espacio. Sin esto, la de DESCRIPTION
     (que ahora lleva el enlace de Maps) se pasa de largo, y hay calendarios
     que rechazan el evento entero por eso.

     Se cuenta en octetos y no en caracteres porque una tilde ocupa dos: con
     contar caracteres, una linea llena de acentos se pasaria igual. */
  function plegar(linea) {
    if (linea.length < 74) return linea;          // atajo para las cortas

    var partes = [];
    var actual = '';
    var octetos = 0;

    for (var i = 0; i < linea.length; i++) {
      var c = linea[i];
      var peso = encodeURIComponent(c).replace(/%[0-9A-F]{2}/gi, 'x').length;
      if (octetos + peso > 74) {
        partes.push(actual);
        actual = '';
        octetos = 1;                              // el espacio de la sangria
      }
      actual += c;
      octetos += peso;
    }
    partes.push(actual);

    return partes.join('\r\n ');
  }

  /* ======================================================================
     9. CONFIRMACION DE ASISTENCIA
     ----------------------------------------------------------------------
     Cada confirmacion se va como una fila a una hoja de calculo de Google:
     fecha, nombre, apellido y si asiste o no. Asi la familia tiene la lista
     completa en un solo sitio, sin ir juntando mensajes sueltos.

     La cantidad de personas no se pregunta: los lugares ya estan asignados
     de antemano. Lo unico que falta saber es quien viene.

     Lo escribe el MISMO script de Google que recibe las fotos, asi que no
     hay servidor propio que contratar ni que se pueda caer.
     ====================================================================== */

  /* El script del RSVP normalmente es el mismo de las fotos. Se deja la
     opcion de apuntar a otro por si algun dia se separan. */
  function urlRsvp() {
    if (!C.rsvp || !C.rsvp.activo) return '';
    if (C.rsvp.urlScript) return C.rsvp.urlScript;
    var d = C.fotos && C.fotos.drive;
    return (d && d.urlScript) || '';
  }

  function prepararRsvp() {
    var form = $('rsvpForm');
    if (!form || !C.rsvp || !C.rsvp.activo) return;

    var boton = $('rsvpEnviar');
    var estado = $('rsvpEstado');

    /* Sin script publicado no hay donde escribir la fila. Mejor decirlo
       antes de que alguien llene el formulario para nada. */
    if (!urlRsvp()) {
      boton.disabled = true;
      mostrarEstadoRsvp('aviso', 'La confirmación se activará en unos días.');
      return;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nombre = $('rsvpNombre').value.trim();
      var apellido = $('rsvpApellido').value.trim();
      if (!nombre || !apellido) return;

      var asiste = document.querySelector('input[name=asiste]:checked').value;

      boton.disabled = true;
      boton.textContent = 'Enviando…';
      estado.hidden = true;

      enviarRsvp(nombre, apellido, asiste)
        .then(function () {
          form.querySelectorAll('input').forEach(function (el) { el.disabled = true; });
          boton.hidden = true;
          mostrarEstadoRsvp('bien', asiste === 'si'
            ? '¡Gracias, ' + nombre + '! Tu confirmación quedó registrada. Nos vemos ese día.'
            : 'Gracias por avisarnos, ' + nombre + '. Te vamos a extrañar.');
        })
        .catch(function (err) {
          boton.disabled = false;
          boton.textContent = 'Confirmar asistencia';
          mostrarEstadoRsvp('aviso',
            'No se pudo enviar tu confirmación. Revisa tu conexión e inténtalo otra vez.');
          console.warn('[XV] Falló la confirmación:', err);
        });
    });
  }

  /* Ojo con el formato: va como formulario clasico, NO como JSON. Con JSON
     el navegador manda antes una peticion OPTIONS ("preflight") que Apps
     Script no sabe contestar, y la confirmacion falla por CORS. Es el mismo
     truco que usa la subida de fotos; esta explicado a fondo en subida.js. */
  function enviarRsvp(nombre, apellido, asiste) {
    var cuerpo = new URLSearchParams();
    cuerpo.set('accion', 'rsvp');
    cuerpo.set('nombre', nombre);
    cuerpo.set('apellido', apellido);
    cuerpo.set('asiste', asiste);

    return fetch(urlRsvp(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: cuerpo.toString()
    })
      .then(function (r) {
        if (!r.ok) throw new Error('Google respondió ' + r.status);
        return r.text();
      })
      .then(function (texto) {
        /* Apps Script contesta 200 aunque algo haya fallado por dentro, asi
           que hay que mirar el contenido de la respuesta. */
        var r;
        try { r = JSON.parse(texto); }
        catch (e) { throw new Error('Respuesta inesperada'); }
        if (!r || !r.ok) throw new Error((r && r.error) || 'Rechazada por el script');
      });
  }

  function mostrarEstadoRsvp(tipo, texto) {
    var estado = $('rsvpEstado');
    estado.className = 'subida__estado subida__estado--' + tipo;
    estado.textContent = texto;
    estado.hidden = false;
  }

  /* ======================================================================
     10. PARALLAX SUAVE + BARRA DE PROGRESO
     ====================================================================== */
  function prepararScroll() {
    var marco = $('heroMarco');
    var barra = $('progresoBarra');
    var pendiente = false;

    function alScroll() {
      var y = window.scrollY;
      var alto = document.documentElement.scrollHeight - window.innerHeight;
      barra.style.width = (alto > 0 ? (y / alto) * 100 : 0) + '%';

      /* Parallax: el marco floral baja mas despacio que la pagina. Le sobra
         un 4% de alto justo para esto, por eso no deja huecos. */
      if (!menosMovimiento && marco && y < window.innerHeight * 1.2) {
        var tope = marco.offsetHeight * 0.02;
        var corr = Math.max(-tope, Math.min(tope, y * 0.08));
        marco.style.transform = 'translateY(' + corr + 'px)';
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
    var colores = ['#F4CCD8', '#F9E0E8', '#FFFFFF', '#DB98AE', '#E7D2AE', '#C5A06A'];

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
    Subida.preparar();
    prepararBotonGaleria();
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
