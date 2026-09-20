# Invitación digital XV — Lindsey Larios

Invitación de quince años hecha como página web. Una sola columna, pensada
primero para celular. Sin dependencias, sin framework y sin paso de compilación:
es HTML, CSS y JavaScript plano.

**Ver en vivo: <https://reversa2410.github.io/Lindsey-XV/>**

Repositorio: <https://github.com/Reversa2410/Lindsey-XV>

La página publicada se actualiza sola con cada `git push` a `main`. Tarda uno o
dos minutos en reflejar los cambios.

> **Este repositorio es público.** Los datos sensibles del evento —dirección
> exacta del salón, WhatsApp de la familia y enlace de subida de fotos— son
> **ficticios a propósito** y están marcados como tales en `config.js`. Los
> valores reales no deben escribirse aquí: el historial de git los conservaría
> para siempre aunque después se borren.

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
index.html              la invitación: estructura + ilustraciones SVG propias
galeria.html            el álbum de fotos, en su propia página
assets/css/estilos.css  diseño y animaciones (de las dos páginas)
assets/js/config.js     <-- los datos del evento
assets/js/main.js       lógica de la invitación
assets/js/galeria.js    lógica del álbum
assets/js/subida.js     el formulario de subir fotos, que usan las dos
assets/audio/           aquí va la canción
.claude/launch.json     configuración del servidor local
```

Son dos páginas y no una sola. El álbum crece durante la fiesta y se mira
muchas veces seguidas: mezclarlo con la invitación obligaba a bajar por toda
la carta y el programa cada vez. Aparte carga solo cuando alguien lo pide, así
que quien únicamente quiere ver la fecha no se descarga decenas de fotos.

## Secciones

**`index.html`** — Portada que se abre · Hero · Cuenta regresiva · Reserva este
día (calendario) · Padres · Carta · Lugar con mapa · Programa · Código de
vestimenta · Lluvia de sobres · Confirmación por WhatsApp · Subir fotos ·
Cierre.

**`galeria.html`** — El álbum con las fotos que suben los invitados, con visor
a pantalla completa.

Se llega al álbum por dos caminos: el botón flotante de la cámara (encima del
de la música, en las dos páginas siempre a la vista) y la tarjeta **Álbum de la
noche** que sale junto a los enlaces de subir. Los dos aparecen solo cuando el
script de Drive ya está publicado; sin él no habría nada que mostrar.

**Desde el álbum también se sube.** El que está mirando las fotos es justo el
que quiere agregar la suya, así que la tarjeta *Sube tus fotos* despliega ahí
mismo el formulario en vez de mandarlo de vuelta a la invitación. Es el mismo
código (`subida.js`) en los dos sitios, no una copia. Al terminar, el álbum se
vuelve a pedir solo, así que la foto recién mandada aparece sin recargar.

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
- Al volver del álbum no se repite la portada: la invitación recuerda, solo
  durante esa visita, que ya estaba abierta.
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

Son dos destinos separados. No por el espacio total, sino por el **límite por
archivo**: un video de celular de dos minutos pesa lo mismo que unas 150 fotos y
casi todos los servicios gratuitos lo rechazan por tamaño aunque quede espacio
de sobra.

| | Destino | Estado |
|---|---|---|
| **Fotos** | Formulario dentro de la invitación → Google Drive | Falta publicar el script |
| **Videos** | Enlace externo (OneDrive) | Falta el enlace |

Se eligió Google Drive porque **Cloudinary no presta servicio en Nicaragua**.
Drive es gratis, son 15 GB, no pide tarjeta, y el invitado no necesita cuenta de
Google: el script corre con los permisos de quien lo publicó.

El paso a paso está en [`google-apps-script/LEEME.md`](google-apps-script/LEEME.md).

Las fotos se encogen en el propio celular antes de enviarse: una de 3 MB queda en
unos 400 KB, sin diferencia visible. Suben siete veces más rápido, que con el
internet de un salón lleno es la diferencia entre que la gente participe o se
rinda a la mitad.
