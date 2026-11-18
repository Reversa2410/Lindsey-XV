/* =========================================================================
   SUBIDA DE VIDEOS A GOOGLE DRIVE (segunda cuenta)
   -------------------------------------------------------------------------
   Los videos van a OTRA cuenta de Google, con su propio script: el de
   google-apps-script/cuenta-videos.gs. Se configura en config.js, en
   fotos.videos.urlScript.

   POR QUE EN TROZOS. Un video de celular pesa cientos de MB y Apps Script
   no recibe tanto de una vez. Asi que el archivo se corta aqui, en el
   celular, en pedazos de fotos.videos.trozoMB, y se manda uno detras de
   otro. Eso da dos cosas de regalo:
     - la barra de progreso es real (un trozo = un paso), y
     - si el internet del salon se cae, se pregunta a Drive cuanto llego y
       se sigue desde ahi, en vez de empezar el video desde cero.

   Mismas reglas que las fotos (ver el comentario largo en subida.js): se
   manda como formulario clasico y con fetch simple, nunca JSON ni
   xhr.upload, o Apps Script falla por CORS.

   HTML que espera: el bloque .subida con ids videoSubida / videoNombre /
   videoArchivos / videoElegir / videoLimite / videoLista / videoEnviar /
   videoEstado.

   Se expone como window.XVVideos:
     .listo()      si el script de videos ya esta publicado
     .preparar()   engancha el formulario
   ========================================================================= */
(function () {
  'use strict';

  var C = window.CONFIG;
  var $ = function (id) { return document.getElementById(id); };
  var REINTENTOS = 5;

  var elegidos = [];
  var subiendo = false;

  function cfg() { return (C.fotos && C.fotos.videos) || {}; }

  function listo() { return !!cfg().urlScript; }

  function escapar(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function pesoLegible(bytes) {
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
  }

  function preparar() {
    if (!C.fotos || !C.fotos.activo || !listo() || !$('videoSubida')) return false;
    var c = cfg();

    $('videoLimite').textContent = 'Hasta ' + c.maxArchivos + ' videos a la vez · máx. ' +
      pesoLegible(c.pesoMaximoMB * 1024 * 1024) + ' cada uno';

    $('videoElegir').addEventListener('click', function () {
      if (!subiendo) $('videoArchivos').click();
    });

    $('videoArchivos').addEventListener('change', function (e) {
      elegidos = Array.prototype.slice.call(e.target.files).slice(0, c.maxArchivos);
      pintar();
    });

    $('videoEnviar').addEventListener('click', enviarTodos);

    /* Cerrar la pagina a mitad de un video lo pierde: se avisa. */
    window.addEventListener('beforeunload', function (e) {
      if (!subiendo) return;
      e.preventDefault();
      e.returnValue = '';
    });
    return true;
  }

  function pintar() {
    var max = cfg().pesoMaximoMB * 1024 * 1024;

    $('videoLista').innerHTML = elegidos.map(function (f, i) {
      var grande = f.size > max;
      return '<li class="lista__fila' + (grande ? ' lista__fila--error' : '') + '" data-i="' + i + '">' +
               '<span class="lista__nombre">' + escapar(f.name) + '</span>' +
               '<span class="lista__peso">' + (grande ? 'Muy pesado · ' : '') + pesoLegible(f.size) + '</span>' +
               '<span class="lista__barra"><i></i></span>' +
             '</li>';
    }).join('');

    var validos = elegidos.filter(function (f) { return f.size <= max; }).length;
    $('videoEnviar').hidden = validos === 0;
    $('videoEnviar').textContent = validos === 1 ? 'Enviar 1 video' : 'Enviar ' + validos + ' videos';
    $('videoEstado').hidden = true;

    if (validos < elegidos.length) {
      estado('aviso', 'Los videos marcados en rojo pasan de ' +
        pesoLegible(max) + ' y no se pueden enviar. Puedes recortarlos en tu galería.');
    }
  }

  /* ---- Comunicacion con el script ---------------------------------- */

  function llamar(datos) {
    var cuerpo = new URLSearchParams();
    Object.keys(datos).forEach(function (k) { cuerpo.set(k, datos[k]); });

    return fetch(cfg().urlScript, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: cuerpo.toString()
    })
      .then(function (r) {
        if (!r.ok) throw new Error('Google respondió ' + r.status);
        return r.text();
      })
      .then(function (texto) {
        var r;
        try { r = JSON.parse(texto); } catch (e) { throw new Error('Respuesta inesperada'); }
        if (!r || !r.ok) throw new Error((r && r.error) || 'Rechazado por el script');
        return r;
      });
  }

  function aBase64(blob) {
    return new Promise(function (bien, mal) {
      var lector = new FileReader();
      lector.onload = function () {
        var s = String(lector.result);
        bien(s.slice(s.indexOf(',') + 1));
      };
      lector.onerror = function () { mal(new Error('No se pudo leer el video')); };
      lector.readAsDataURL(blob);
    });
  }

  function esperar(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  /* Sube un video entero. alAvanzar(fraccion) se llama tras cada trozo. */
  function subirUno(archivo, invitado, alAvanzar) {
    /* El trozo tiene que ser multiplo de 256 KB: lo exige Drive. */
    var TROZO = Math.max(1, Math.round((cfg().trozoMB || 8) * 4)) * 256 * 1024;
    var total = archivo.size;
    var sesion = '';

    function mandarDesde(inicio, fallos) {
      if (inicio >= total) return Promise.resolve();
      alAvanzar(inicio / total);

      var pedazo = archivo.slice(inicio, Math.min(inicio + TROZO, total));

      return aBase64(pedazo)
        .then(function (datos) {
          return llamar({ accion: 'trozo', sesion: sesion, inicio: inicio, total: total, datos: datos });
        })
        .then(function (r) {
          if (r.listo) return;
          var sigue = r.recibido > inicio ? r.recibido : inicio + pedazo.size;
          return mandarDesde(sigue, 0);
        }, function (err) {
          if (fallos >= REINTENTOS) throw err;
          console.warn('[XV] Trozo fallido, reintentando', err);
          /* Antes de repetir se le pregunta a Drive cuanto tiene: puede
             que el trozo si llegara y solo se perdiera la respuesta. */
          return esperar(2000 * Math.pow(2, fallos))
            .then(function () { return llamar({ accion: 'estado', sesion: sesion, total: total }); })
            .then(function (r) {
              if (r.listo) return;
              return mandarDesde(r.recibido || 0, fallos + 1);
            }, function () {
              return mandarDesde(inicio, fallos + 1);
            });
        });
    }

    return llamar({
      accion: 'iniciar',
      tamano: total,
      tipo: archivo.type || '',
      nombreArchivo: archivo.name || 'video.mp4',
      invitado: invitado || ''
    }).then(function (r) {
      sesion = r.sesion;
      return mandarDesde(0, 0);
    }).then(function () { alAvanzar(1); });
  }

  /* ---- Envio de la lista ------------------------------------------- */

  function enviarTodos() {
    if (subiendo) return;
    var max = cfg().pesoMaximoMB * 1024 * 1024;
    var cola = elegidos
      .map(function (f, i) { return { f: f, i: i }; })
      .filter(function (x) { return x.f.size <= max; });
    if (!cola.length) return;

    var boton = $('videoEnviar');
    var nombre = $('videoNombre').value.trim();
    var fallidos = [];
    var total = cola.length;

    subiendo = true;
    boton.disabled = true;
    estado('aviso', 'No cierres esta página ni bloquees el celular hasta que terminen.');

    /* Que la pantalla no se apague a mitad de un video grande. */
    var candado = null;
    try {
      if (navigator.wakeLock) {
        navigator.wakeLock.request('screen').then(function (c) { candado = c; }, function () {});
      }
    } catch (e) {}

    var cadena = cola.reduce(function (previa, x, n) {
      return previa.then(function () {
        var fila = $('videoLista').querySelector('[data-i="' + x.i + '"]');
        var barra = fila && fila.querySelector('.lista__barra i');
        if (fila) fila.classList.add('lista__fila--progreso');

        return subirUno(x.f, nombre, function (fraccion) {
          var pct = Math.round(fraccion * 100);
          if (barra) barra.style.width = pct + '%';
          boton.textContent = 'Enviando ' + (n + 1) + ' de ' + total + ' · ' + pct + '%';
        }).then(function () {
          if (fila) {
            fila.classList.remove('lista__fila--progreso');
            fila.classList.add('lista__fila--lista');
          }
        }).catch(function (e) {
          fallidos.push(x.f);
          if (fila) {
            fila.classList.remove('lista__fila--progreso');
            fila.classList.add('lista__fila--error');
          }
          console.warn('[XV] No se pudo subir el video', x.f.name, e);
        });
      });
    }, Promise.resolve());

    cadena.then(function () {
      subiendo = false;
      boton.disabled = false;
      if (candado) { try { candado.release(); } catch (e) {} }

      var enviados = total - fallidos.length;

      if (!fallidos.length) {
        elegidos = [];
        $('videoArchivos').value = '';
        $('videoLista').innerHTML = '';
        boton.hidden = true;
        estado('bien', '¡Gracias! ' + (enviados === 1
          ? 'Tu video quedó guardado.'
          : 'Tus ' + enviados + ' videos quedaron guardados.'));
        return;
      }

      elegidos = fallidos;
      pintar();
      boton.textContent = fallidos.length === 1 ? 'Reintentar 1 video' : 'Reintentar ' + fallidos.length + ' videos';
      estado('aviso', enviados
        ? '¡Gracias! Se enviaron ' + enviados + '. Los que faltan puedes reintentarlos.'
        : 'No se pudo enviar. Revisa tu conexión y vuelve a intentarlo.');
    });
  }

  function estado(tipo, texto) {
    var e = $('videoEstado');
    e.className = 'subida__estado subida__estado--' + tipo;
    e.textContent = texto;
    e.hidden = false;
  }

  window.XVVideos = { listo: listo, preparar: preparar };
})();
