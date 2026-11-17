/* Servidor del conversor de video. No es parte de la invitacion: solo se
   usa cuando hay que volver a sacar intro.webm / intro.mp4 / el cartel de
   un original nuevo. El por que y el como estan en assets/video/LEEME.txt.

       node .claude/conversor/servidor-conv.js <ruta-del-original>
       ->  http://localhost:5511

   Sirve esta carpeta, sirve el original como /fuente.mp4, y guarda en
   ./salida lo que la pagina le mande por POST a /guardar/<nombre>.
   Solo escucha en 127.0.0.1. */
const http = require('http');
const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const SALIDA = path.join(RAIZ, 'salida');
const FUENTE = process.argv[2];
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.webp': 'image/webp', '.png': 'image/png' };

if (!FUENTE) {
  console.error('Falta la ruta del video original.');
  process.exit(1);
}
fs.mkdirSync(SALIDA, { recursive: true });

http.createServer(function (req, res) {
  const ruta = decodeURIComponent(req.url.split('?')[0]);

  if (req.method === 'POST' && ruta.startsWith('/guardar/')) {
    const nombre = path.basename(ruta);
    const trozos = [];
    req.on('data', function (t) { trozos.push(t); });
    req.on('end', function () {
      const datos = Buffer.concat(trozos);
      fs.writeFileSync(path.join(SALIDA, nombre), datos);
      res.writeHead(200, { 'Content-Type': 'text/plain' }).end(String(datos.length));
    });
    return;
  }

  const archivo = ruta === '/fuente.mp4' ? FUENTE
    : path.join(RAIZ, path.normalize(ruta === '/' ? '/index.html' : ruta));
  if (ruta !== '/fuente.mp4' && !archivo.startsWith(RAIZ)) { res.writeHead(403).end(); return; }

  fs.readFile(archivo, function (err, datos) {
    if (err) { res.writeHead(404).end('No esta: ' + ruta); return; }
    res.writeHead(200, {
      'Content-Type': TIPOS[path.extname(archivo).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(datos);
  });
}).listen(5511, '127.0.0.1', function () { console.log('conversor en http://localhost:5511'); });
