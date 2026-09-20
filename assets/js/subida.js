/* =========================================================================
   SUBIDA DE FOTOS A GOOGLE DRIVE — compartida por las dos paginas
   -------------------------------------------------------------------------
   La usan la invitacion (index.html) y el album (galeria.html): desde los
   dos sitios se sube igual, asi que el codigo no puede vivir dentro de
   ninguno de los dos.

   El HTML que espera es siempre el mismo bloque .subida, con los ids
   subidaNombre / subidaArchivos / subidaElegir / subidaLimite /
   subidaLista / subidaEnviar / subidaEstado.

   Se expone como window.XVSubida:
     .driveListo()          si el script de Drive ya esta publicado
     .preparar(opciones)    engancha el formulario de esta pagina
                            opciones.alSubir(cuantas) se llama cuando al
                            menos una foto llego bien, para que el album
                            pueda refrescarse solo.
   ========================================================================= */
(function () {
  'use strict';

  var C = window.CONFIG;
  var $ = function (id) { return document.getElementById(id); };
  var alSubir = null;

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

  function prepararSubida(opciones) {
    if (!C.fotos || !C.fotos.activo || !driveListo()) return false;
    alSubir = (opciones && opciones.alSubir) || null;

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
    return true;
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

      /* Si la pagina que uso este formulario quiere enterarse, se le
         avisa. El album lo usa para volver a pedir la lista y enseñar
         la foto recien subida sin que haya que recargar nada. */
      if (enviadas > 0 && alSubir) {
        try { alSubir(enviadas); }
        catch (e) { console.warn('[XV] Falló el aviso posterior a la subida', e); }
      }

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


  window.XVSubida = {
    driveListo: driveListo,
    preparar: prepararSubida
  };
})();
