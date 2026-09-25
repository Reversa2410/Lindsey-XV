# Invitación digital XV — Lindsey Larios

Invitación de quince años hecha como página web. Una sola columna, pensada
primero para celular. Sin dependencias, sin framework y sin paso de compilación:
es HTML, CSS y JavaScript plano.

**Ver en vivo (beta): <https://lindsey-xv.vercel.app>**

Repositorio: <https://github.com/Reversa2410/Lindsey-XV>

Se despliega en **Vercel**, sin build: es HTML plano, así que el repositorio se
sirve tal cual. Cada `git push` a `main` redespliega solo, en menos de un
minuto. La caché la fija [`vercel.json`](vercel.json): larga para el marco
floral y la canción, que no cambian, y corta para el HTML, que sí.

Sigue existiendo la copia en GitHub Pages
(<https://reversa2410.github.io/Lindsey-XV/>), que se actualiza con el mismo
push. La buena es la de Vercel.

> **Este repositorio es público.** La dirección del salón y su enlace de Google
> Maps sí son los reales: se pusieron a propósito, porque la invitación se
> comparte igual. Conviene saber que el historial de git los conserva para
> siempre aunque un día se borren de `config.js`; si alguna vez hace falta que
> dejen de ser públicos, hay que pasar el repositorio a privado, no basta con
> borrar la línea.
>
> El WhatsApp de la familia sigue **sin poner**, porque todavía no se usa para
> nada: las confirmaciones van a una hoja de cálculo.

> **La foto del arco es de muestra.** Es la que venía en el diseño de Canva,
> o sea una foto de banco. Hay que reemplazarla por la foto real de Lindsey
> antes de publicar; mientras tanto sirve para ver la composición armada. Si
> se deja `hero.foto` vacío, en su lugar sale la ilustración SVG.

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
assets/img/             el marco floral y la foto del arco
assets/audio/           aquí va la canción
.claude/launch.json     configuración del servidor local
```

Son dos páginas y no una sola. El álbum crece durante la fiesta y se mira
muchas veces seguidas: mezclarlo con la invitación obligaba a bajar por toda
la carta y el programa cada vez. Aparte carga solo cuando alguien lo pide, así
que quien únicamente quiere ver la fecha no se descarga decenas de fotos.

## Secciones

**`index.html`** — Portada que se abre · Portada de adentro · Cuenta regresiva · Reserva este
día (calendario) · Padres · Carta · Lugar con mapa · Programa · Código de
vestimenta · Lluvia de sobres · Confirmación de asistencia · Subir fotos ·
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

## La portada de adentro

Lo primero que aparece al abrir la invitación es el diseño que se hizo en
Canva, rehecho en HTML: el marco de acuarela, el nombre en cursiva, la foto
dentro del arco rosa, la fecha y el filete dorado.

No es una captura de pantalla. El lienzo guarda la misma proporción que el
original (943×2000) y todo lo que va encima se coloca en porcentajes de ese
lienzo, así que la composición escala como una sola pieza: en un celular de
360 px y en la columna de 480 px se ve idéntica, solo más chica o más grande.
Las medidas no son a ojo, salieron de medir el PNG del diseño.

Que sea HTML y no imagen es lo que permite que **la fecha y la dirección
salgan de `config.js`**, las mismas que usa el resto de la página. Cambiar
`fecha` mueve a la vez la cuenta regresiva, el calendario, el `.ics` y lo que
dice la portada. Una captura habría que rehacerla en Canva cada vez.

La dirección se ancla por abajo en vez de por arriba, porque la real puede
ser más larga que la del diseño: si necesita un tercer renglón, crece hacia
el hueco que tiene encima y no se mete sobre el filete.

| Qué | Dónde |
|---|---|
| Marco floral | `assets/img/marco-floral.webp` (el PNG de Canva, 1.9 MB → 82 KB) |
| Foto del arco | `assets/img/foto-muestra.webp` — **de muestra**, ver abajo |
| Tipografías | Playfair Display (serif) y Style Script (la firma) |
| Posiciones y tamaños | `assets/css/estilos.css`, bloque HERO |

## Lo que hace que no sea un Canva

- Portada que se abre en dos mitades y desbloquea la música con ese mismo toque
  (los navegadores no dejan sonar audio sin un gesto previo del usuario).
- Cuenta regresiva en vivo, con animación en cada cifra que cambia.
- Apariciones escalonadas al hacer scroll y parallax suave en el hero.
- Botón **Agregar a mi calendario** que descarga un `.ics` real.
- Formulario de confirmación que escribe una fila en una hoja de cálculo.
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

Ya son reales el nombre, la fecha (**viernes 11 de diciembre de 2026**) y el
lugar (**Punto Azzurro**, primera entrada Reparto San Mateo).

| Qué falta | Dónde |
|---|---|
| **Foto real de Lindsey** | `assets/img/` + `config.js` → `hero.foto` |
| **Publicar la versión del script con la tabla de asistencia** | `google-apps-script/LEEME.md`, paso 7 |
| Nombres de los padres | `config.js` → `padres` |
| Texto real de la carta | `config.js` → `carta` |
| Enlace para subir videos | `config.js` → `fotos.destinos` |
| WhatsApp de contacto (para más adelante) | `config.js` → `rsvp.whatsapp` |

## Sobre la confirmación de asistencia

El invitado escribe **nombre y apellido**, marca si va o no, y eso se va como
una fila a una hoja de cálculo de Google:

| Fecha | Nombre | Apellido | Asiste |
|---|---|---|---|
| 2026-11-20 19:42 | Kevin | Torrez | Sí |
| 2026-11-20 20:05 | Ana | Mejía | No |

**No se pregunta cuántas personas van.** Los lugares están asignados de
antemano, así que dejarlo a elección del invitado solo abre la puerta a que el
número no cuadre con lo que ya se planeó. Lo único que falta saber es quién
viene.

Lo escribe el **mismo script de Google** que recibe las fotos, así que no hay
un segundo servicio que configurar. El paso a paso está en
[`google-apps-script/LEEME.md`](google-apps-script/LEEME.md), paso 7.

> El script tiene que volver a publicarse (**nueva versión** de la
> implementación) para que sepa recibir confirmaciones. Con el publicado antes
> de este cambio, la invitación responde *No se pudo enviar tu confirmación*.

Si la misma persona confirma dos veces se actualiza su fila en vez de agregar
otra, porque una lista con duplicados no sirve para contar lugares.

Ya no se manda por WhatsApp. `rsvp.whatsapp` se quedó en `config.js` vacío,
apuntado para cuando se agregue el contacto de la familia.

## Botones apagados a propósito (beta)

Tres botones se ven y se pueden tocar, pero por ahora solo avisan
*Botón deshabilitado temporalmente*:

- **Subir fotos**
- **Subir videos**
- **Álbum de la noche** (la tarjeta y el botón flotante de la cámara)

El interruptor está en `config.js` → `fotos.deshabilitados`. Se apagan desde
ahí y no borrando los enlaces justamente para **no tocar la configuración de
Drive ni la de OneDrive**: esos datos quedan intactos, y poner el interruptor
en `false` devuelve cada botón a su funcionamiento normal sin ningún otro
cambio.

```js
deshabilitados: {
  subirFotos: true,
  subirVideos: true,
  album: true,
  mensaje: 'Botón deshabilitado temporalmente'
}
```

La página del álbum (`galeria.html`) sigue existiendo: lo que se apaga son los
caminos que llevan a ella. Quien escriba la dirección a mano la verá, aunque
con el botón de subir también apagado ahí dentro.

## Sobre la canción

La página **no baja la canción al cargar**: el `<audio>` va con
`preload="none"`, así que no pesa ni un byte en el arranque. Eso solo movía
el problema de lugar, porque entonces la descarga empezaba recién al tocar
*Abrir invitación* y quedaba un silencio incómodo justo en el mejor momento.

Así que se usa el hueco que hay entre las dos cosas: cuando la página ya
terminó de cargar todo lo demás y el invitado todavía está mirando la
portada, ahí se baja la canción. Medido en local, con un archivo de 1.9 MB:

| | Al tocar el botón | Tarda en sonar |
|---|---|---|
| Antes | sin nada descargado | 142 ms |
| Ahora | archivo completo en memoria | **7 ms** |

Y la carga de la página no se toca: el `load` termina a los 929 ms y la
canción arranca a los 1019 ms, después, sin quitarle ancho de banda al
marco floral ni a las tipografías.

Con datos limitados o red 2G no se adelanta nada, porque esos megas los paga
el invitado: en ese caso se baja solo si de verdad le da play. Se apaga del
todo con `musica.precargar: false`.

**El archivo.** `assets/audio/cancion.mp3`, 58 segundos, 913 KB. Llegó ya
recortada, que es lo que más importa para que cargue rápido. Lo que le sobraba
era el final: después de su propio fade-out traía un timbre a 0 dBFS que dejó
el conversor online —más fuerte que la canción misma— y detrás 2.5 segundos de
silencio digital. Como suena en bucle, los dos se escuchaban en cada vuelta.

Se cortó en 58.38 s, justo en el silencio que hay entre el fade de la canción
y el timbre: se va todo lo que sobraba y el fade queda intacto, que es lo que
evita que el bucle chasquee. El corte es a nivel de fotogramas MP3, sin volver
a comprimir, así que no perdió nada de calidad.

Se quedó en `.mp3` y no se pasó a `.m4a` a propósito: ya venía comprimida a
128 kbps, y volver a comprimir algo que ya perdió calidad la hace perder otra
vez a cambio de unos 300 KB. El detalle está en
[`assets/audio/LEEME.txt`](assets/audio/LEEME.txt), junto con la receta para
el día que se cambie la canción.

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
