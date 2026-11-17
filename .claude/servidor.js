/* Servidor estatico para ver la invitacion en local.
   Antes esto era "python -m http.server", pero en esta maquina no hay
   Python y Windows responde con el atajo de la Microsoft Store, asi que
   el servidor ni arrancaba. Node ya esta instalado, y sirve igual.

       node .claude/servidor.js        ->  http://localhost:5500

   Hace falta un servidor y no vale abrir el index.html con doble clic:
   en file:// el navegador trata cada archivo como un origen distinto y
   se cae sessionStorage, que es justo lo que decide si la intro se ve. */
const http = require('http');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const PUERTO = 5500;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

http.createServer(function (pedido, respuesta) {
  let ruta = decodeURIComponent(pedido.url.split('?')[0]);
  if (ruta.endsWith('/')) ruta += 'index.html';

  /* Nadie se sale de la carpeta del proyecto con ../../ */
  const archivo = path.join(RAIZ, path.normalize(ruta));
  if (!archivo.startsWith(RAIZ)) {
    respuesta.writeHead(403).end('Fuera de la carpeta');
    return;
  }

  fs.readFile(archivo, function (error, datos) {
    if (error) {
      respuesta.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      respuesta.end('No esta: ' + ruta);
      return;
    }
    respuesta.writeHead(200, {
      'Content-Type': TIPOS[path.extname(archivo).toLowerCase()] || 'application/octet-stream',
      /* Sin cache: en local lo que se quiere es ver el ultimo cambio, no
         andar refrescando a mano. */
      'Cache-Control': 'no-store',
      'Accept-Ranges': 'bytes'
    });
    respuesta.end(datos);
  });
}).listen(PUERTO, function () {
  console.log('La invitacion esta en http://localhost:' + PUERTO);
});
