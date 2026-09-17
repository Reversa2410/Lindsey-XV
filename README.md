# Invitación digital XV — Lindsey Larios

Invitación de quince años hecha como página web. Una sola columna, pensada
primero para celular. Sin dependencias, sin framework y sin paso de compilación:
es HTML, CSS y JavaScript plano.

Repositorio: <https://github.com/Reversa2410/Lindsey-XV>

## Cómo verla

```bash
python -m http.server 5500
```

Luego abrir <http://localhost:5500>.

Cualquier servidor estático sirve igual. Lo que **no** funciona es abrir el
`index.html` con doble clic, porque el navegador bloquea la carga del mapa y del
audio cuando la página viene del sistema de archivos.

## Dónde se cambian los datos

Todo vive en un solo archivo: **`assets/js/config.js`**. Nombre, fecha, padres,
carta, lugar, programa, vestimenta, WhatsApp y textos.

El calendario, la cuenta regresiva, el día de la semana y el archivo `.ics` se
calculan solos a partir de la fecha que se ponga ahí. No hay que tocar el HTML ni
el CSS para cambiar nombres, textos o fechas.

## Estructura

```
index.html              estructura + ilustraciones SVG propias
assets/css/estilos.css  diseño y animaciones
assets/js/config.js     <-- los datos del evento
assets/js/main.js       lógica
assets/audio/           aquí va la canción
.claude/launch.json     configuración del servidor local
```

## Secciones

Portada que se abre · Hero · Cuenta regresiva · Reserva este día (calendario) ·
Padres · Carta · Lugar con mapa · Programa · Código de vestimenta ·
Lluvia de sobres · Confirmación por WhatsApp · Subir fotos · Cierre.

## Lo que hace que no sea un Canva

- Portada que se abre en dos mitades y desbloquea la música con ese mismo toque
  (los navegadores no dejan sonar audio sin un gesto previo del usuario).
- Cuenta regresiva en vivo, con animación en cada cifra que cambia.
- Apariciones escalonadas al hacer scroll y parallax suave en el hero.
- Botón **Agregar a mi calendario** que descarga un `.ics` real.
- Formulario de confirmación que arma el mensaje y lo manda por WhatsApp.
- Mapa embebido del lugar.
- Pétalos flotantes y lluvia final al llegar al cierre.
- Barra de progreso de lectura y reproductor de música flotante.
- Respeta `prefers-reduced-motion` para quien tenga las animaciones desactivadas.

Todas las ilustraciones (el lazo, la tiara, la quinceañera, el sobre, las ramas)
son SVG dibujados para este proyecto, así que escalan sin pixelarse y no dependen
de imágenes externas.

## Estado actual

Los datos son de muestra, salvo el nombre. La fecha del **sábado 27 de marzo de
2027** está puesta solo para que la cuenta regresiva se vea funcionando.

| Qué falta | Dónde |
|---|---|
| Canción de fondo | poner el mp3 en `assets/audio/cancion.mp3` |
| Fecha real del evento | `config.js` → `fecha` |
| Nombres de los padres | `config.js` → `padres` |
| Texto real de la carta | `config.js` → `carta` |
| Dirección y enlace de Google Maps | `config.js` → `lugar` |
| Número de WhatsApp para confirmaciones | `config.js` → `rsvp.whatsapp` |
| Enlace para subir fotos | `config.js` → `fotos.enlace` |

## Sobre la sección de fotos

Está construida y en su lugar, pero el botón está desactivado hasta que se defina
dónde se guardarán las fotos. La idea es que los invitados suban desde la misma
invitación, sin crear cuenta ni instalar nada, escaneando un QR en las mesas.

Queda pendiente elegir el servicio de almacenamiento. Cuando esté, solo hay que
pegar el enlace en `config.js` y la sección se activa sola.
