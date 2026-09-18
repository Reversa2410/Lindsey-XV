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

    /* --- Fotos y videos --- */
    if (C.fotos && C.fotos.activo) {
      pintarFotos();
    } else {
      $('seccionFotos').style.display = 'none';
    }
  }

  /* Dibuja los destinos de subida (uno para fotos, otro para videos).
     Un destino sin enlace se muestra apagado y no se puede tocar, para
     que se note que falta conectarlo en vez de llevar a una pagina rota. */
  function pintarFotos() {
    $('fotosTitulo').textContent = C.fotos.titulo;
    $('fotosTexto').textContent = C.fotos.texto;

    var destinos = C.fotos.destinos || [];
    var sinEnlace = 0;

    $('fotosDestinos').innerHTML = destinos.map(function (d, i) {
      var esFormulario = d.tipo === 'drive';
      var listo = esFormulario ? driveListo() : !!d.enlace;
      if (!listo) sinEnlace++;

      var etiqueta = esFormulario ? 'button' : 'a';
      var atributos = '';
      if (listo && esFormulario) {
        atributos = ' type="button" data-abre-subida="1"';
      } else if (listo) {
        atributos = ' href="' + escapar(d.enlace) + '" target="_blank" rel="noopener"';
      } else if (esFormulario) {
        atributos = ' type="button" disabled';
      }

      return '<' + etiqueta + ' class="destino' + (listo ? '' : ' destino--apagado') + '"' +
             atributos + '>' +
               '<svg class="destino__icono"><use href="#ico-' + escapar(d.icono) + '"/></svg>' +
               '<span class="destino__texto">' +
                 '<span class="destino__etiqueta">' + escapar(d.etiqueta) + '</span>' +
                 '<span class="destino__nota">' + escapar(d.nota) + '</span>' +
               '</span>' +
               '<svg class="destino__flecha"><use href="#ico-flecha"/></svg>' +
             '</' + etiqueta + '>';
    }).join('');

    var abre = $('fotosDestinos').querySelector('[data-abre-subida]');
    if (abre) {
      abre.addEventListener('click', function () {
        var panel = $('subida');
        panel.hidden = !panel.hidden;
        if (!panel.hidden) panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
    }

    var aviso = $('fotosPendiente');
    if (C.fotos.demo) {
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
     1b. SUBIDA DE FOTOS A GOOGLE DRIVE
     ----------------------------------------------------------------------
     Las fotos viajan del celular del invitado a un script de Google
     publicado como aplicacion web, que las guarda en una carpeta de Drive.
     No pasan por ningun servidor nuestro, por eso no hay nada que
     contratar ni nada que se pueda caer.

     El invitado no necesita cuenta de Google: el script corre con los
     permisos de quien lo publico.

     Antes de enviarlas se encogen en el propio celular: una foto de 3 MB
     queda en unos 400 KB sin que se note la diferencia en pantalla. Sube
     siete veces mas rapido, que con el internet de un salon lleno es la
     diferencia entre que la gente participe o se rinda a la mitad.
     ====================================================================== */

  var elegidas = [];

  function driveListo() {
    var d = C.fotos && C.fotos.drive;
    return !!(d && d.urlScript);
  }

  function prepararSubida() {
    if (!C.fotos || !C.fotos.activo || !driveListo()) return;

    var cfg = C.fotos.drive;
    $('subidaLimite').textContent = 'Hasta ' + cfg.maxArchivos + ' fotos a la vez';

    $('subidaElegir').addEventListener('click', function () {
      $('subidaArchivos').click();
    });

    $('subidaArchivos').addEventListener('change', function (e) {
      elegidas = Array.prototype.slice.call(e.target.files).slice(0, cfg.maxArchivos);
      pintarElegidas();
    });

    $('subidaEnviar').addEventListener('click', enviarTodas);
  }

  function pintarElegidas() {
    var lista = $('subidaLista');

    lista.innerHTML = elegidas.map(function (f, i) {
      return '<li class="lista__fila" data-i="' + i + '">' +
               '<span class="lista__nombre">' + escapar(f.name) + '</span>' +
               '<span class="lista__peso">' + pesoLegible(f.size) + '</span>' +
               '<span class="lista__barra"><i></i></span>' +
             '</li>';
    }).join('');

    $('subidaEnviar').hidden = elegidas.length === 0;
    $('subidaEnviar').textContent = elegidas.length === 1
      ? 'Enviar 1 foto'
      : 'Enviar ' + elegidas.length + ' fotos';
    $('subidaEstado').hidden = true;
  }

  function pesoLegible(bytes) {
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  /* Redimensiona la foto en el navegador. Si el formato no se puede leer
     (pasa con algunos HEIC de iPhone en Android), devuelve el archivo tal
     cual: preferimos que suba pesada a que no suba. */
  function encoger(archivo) {
    var cfg = C.fotos.drive;

    return new Promise(function (listo) {
      if (!/^image\//.test(archivo.type)) return listo(archivo);

      var url = URL.createObjectURL(archivo);
      var img = new Image();

      img.onload = function () {
        URL.revokeObjectURL(url);
        var escala = Math.min(1, cfg.anchoMaximo / Math.max(img.width, img.height));
        if (escala === 1 && archivo.size < 900 * 1024) return listo(archivo);

        var lienzo = document.createElement('canvas');
        lienzo.width = Math.round(img.width * escala);
        lienzo.height = Math.round(img.height * escala);
        lienzo.getContext('2d').drawImage(img, 0, 0, lienzo.width, lienzo.height);

        lienzo.toBlob(function (blob) {
          listo(blob && blob.size < archivo.size ? blob : archivo);
        }, 'image/jpeg', cfg.calidad);
      };

      img.onerror = function () { URL.revokeObjectURL(url); listo(archivo); };
      img.src = url;
    });
  }

  /* Convierte el archivo a texto base64, que es como viaja hasta el script
     de Google. Apps Script no sabe leer archivos binarios directamente. */
  function aBase64(blob) {
    return new Promise(function (listo, falla) {
      var lector = new FileReader();
      lector.onload = function () {
        var s = String(lector.result);            // "data:image/jpeg;base64,AAAA"
        var coma = s.indexOf(',');
        var puntoYcoma = s.indexOf(';');
        listo({
          datos: s.slice(coma + 1),
          tipo: (coma > 0 && puntoYcoma > 5) ? s.slice(5, puntoYcoma) : 'image/jpeg'
        });
      };
      lector.onerror = function () { falla(new Error('No se pudo leer el archivo')); };
      lector.readAsDataURL(blob);
    });
  }

  /* OJO, esto tiene truco y es facil de romper sin darse cuenta:

     1) El archivo se manda como formulario clasico, NO como JSON. Con JSON
        el navegador pide permiso previo al servidor (una peticion OPTIONS,
        el llamado "preflight") y Apps Script no sabe responderla, asi que
        la subida falla por CORS.

     2) Por la misma razon se usa fetch y NO XMLHttpRequest con barra de
        progreso por bytes. Registrar un escucha en xhr.upload tambien
        convierte la peticion en "no simple" y dispara el mismo preflight.
        Dicho de otro modo: poner la barra de progreso detallada ROMPE la
        subida. El progreso se muestra por foto completada, no por bytes.

     Si alguna vez hay que tocar esta funcion, probarla contra el script de
     Google de verdad. Un servidor de prueba local si responde OPTIONS, asi
     que el problema no aparece hasta que ya es tarde. */
  function subirUna(archivo, nombreInvitado) {
    var cfg = C.fotos.drive;

    return encoger(archivo)
      .then(function (comprimido) {
        if (comprimido.size > cfg.pesoMaximoMB * 1024 * 1024) {
          throw new Error('Pesa más de ' + cfg.pesoMaximoMB + ' MB');
        }
        return comprimido;
      })
      .then(aBase64)
      .then(function (contenido) {
        var cuerpo = new URLSearchParams();
        cuerpo.set('archivo', contenido.datos);
        cuerpo.set('tipo', contenido.tipo);
        cuerpo.set('nombreArchivo', archivo.name || 'foto.jpg');
        if (nombreInvitado) cuerpo.set('invitado', nombreInvitado);

        return fetch(cfg.urlScript, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: cuerpo.toString()
        });
      })
      .then(function (r) {
        if (!r.ok) throw new Error('Google respondió ' + r.status);
        return r.text();
      })
      .then(function (texto) {
        /* Apps Script contesta 200 incluso cuando algo salio mal por
           dentro, asi que hay que mirar el contenido de la respuesta. */
        var r;
        try { r = JSON.parse(texto); }
        catch (e) { throw new Error('Respuesta inesperada'); }
        if (!r || !r.ok) throw new Error((r && r.error) || 'Rechazada por el script');
      });
  }

  function enviarTodas() {
    if (!elegidas.length) return;

    var boton = $('subidaEnviar');
    var estado = $('subidaEstado');
    var nombre = $('subidaNombre').value.trim();

    boton.disabled = true;
    boton.textContent = 'Enviando…';
    estado.hidden = true;

    var fallidas = [];
    var total = elegidas.length;

    /* Una por una y no todas juntas: en el internet de un salón, veinte
       subidas en paralelo se estorban entre ellas y terminan más lento. */
    var cadena = elegidas.reduce(function (previa, archivo, i) {
      return previa.then(function () {
        var fila = $('subidaLista').querySelector('[data-i="' + i + '"]');
        if (fila) fila.classList.add('lista__fila--subiendo');
        boton.textContent = 'Enviando ' + (i + 1) + ' de ' + total + '…';

        return subirUna(archivo, nombre).then(function () {
          if (fila) {
            fila.classList.remove('lista__fila--subiendo');
            fila.classList.add('lista__fila--lista');
          }
        }).catch(function (e) {
          fallidas.push(archivo);
          if (fila) {
            fila.classList.remove('lista__fila--subiendo');
            fila.classList.add('lista__fila--error');
          }
          console.warn('[XV] No se pudo subir', archivo.name, e);
        });
      });
    }, Promise.resolve());

    cadena.then(function () {
      var enviadas = total - fallidas.length;
      boton.disabled = false;

      if (!fallidas.length) {
        elegidas = [];
        $('subidaArchivos').value = '';
        $('subidaLista').innerHTML = '';
        boton.hidden = true;
        mostrarEstado('bien', '¡Gracias! ' + (enviadas === 1
          ? 'Tu foto quedó guardada.'
          : 'Tus ' + enviadas + ' fotos quedaron guardadas.'));
        return;
      }

      /* Las que fallaron se quedan elegidas para que el invitado pueda
         reintentar de un toque, sin volver a buscarlas en su galería. */
      elegidas = fallidas;
      pintarElegidas();
      boton.textContent = fallidas.length === 1
        ? 'Reintentar 1 foto'
        : 'Reintentar ' + fallidas.length + ' fotos';

      if (enviadas === 0) {
        mostrarEstado('aviso', fallidas.length === 1
          ? 'No se pudo enviar la foto. Revisa tu conexión y vuelve a intentarlo.'
          : 'No se pudo enviar ninguna. Revisa tu conexión y vuelve a intentarlo.');
      } else {
        mostrarEstado('aviso', '¡Gracias! Se enviaron ' + enviadas + '. ' +
          (fallidas.length === 1 ? 'Una quedó pendiente' : fallidas.length + ' quedaron pendientes') +
          ', puedes reintentarla' + (fallidas.length === 1 ? '' : 's') + '.');
      }
    });
  }

  function mostrarEstado(tipo, texto) {
    var estado = $('subidaEstado');
    estado.className = 'subida__estado subida__estado--' + tipo;
    estado.textContent = texto;
    estado.hidden = false;
  }

  /* ======================================================================
     1c. GALERIA
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
     pero normalmente no hace falta tocarla. */
  var BASE_MINIATURA = 'https://drive.google.com/thumbnail?id={id}&sz=w{ancho}';

  function urlFoto(id, ancho) {
    var base = (C.fotos.galeria && C.fotos.galeria.baseMiniatura) || BASE_MINIATURA;
    return base.replace('{id}', encodeURIComponent(id)).replace('{ancho}', ancho);
  }

  function prepararGaleria() {
    var g = C.fotos && C.fotos.galeria;
    if (!g || !g.activa || !driveListo()) return;

    $('seccionGaleria').hidden = false;
    $('galeriaTitulo').textContent = g.titulo;
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
               'loading="lazy" decoding="async">' +
             '</button>';
    }).join('');

    $('galeriaMas').hidden = visibles >= galeriaFotos.length;

    Array.prototype.forEach.call(
      $('galeria').querySelectorAll('.galeria__foto'),
      function (boton) {
        boton.addEventListener('click', function () {
          abrirVisor(parseInt(boton.getAttribute('data-i'), 10));
        });
        /* Si Drive tarda o falla con una foto, se quita el hueco vacío
           en vez de dejar el icono de imagen rota. */
        var img = boton.querySelector('img');
        img.addEventListener('error', function () {
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
    prepararSubida();
    prepararGaleria();
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
