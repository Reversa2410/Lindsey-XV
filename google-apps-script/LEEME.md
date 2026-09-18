# Receptor de fotos en Google Drive

Cómo dejar funcionando la subida de fotos de la invitación. Son unos diez
minutos y todo es gratis.

## Por qué así

Cloudinary no presta servicio en Nicaragua, así que las fotos van a una carpeta
de Google Drive tuya. Google sí funciona con normalidad allá, son 15 GB gratis y
no pide tarjeta.

El invitado **no necesita cuenta de Google ni iniciar sesión**. El truco está en
que el script se publica para ejecutarse con *tus* permisos: es tu cuenta la que
guarda el archivo, no la del invitado. Él solo manda la foto.

---

## Paso 1 — Crear la carpeta

1. Entra a [drive.google.com](https://drive.google.com).
2. Crea una carpeta, por ejemplo **Fotos XV Lindsey**.
3. Ábrela y mira la barra de direcciones:

   ```
   https://drive.google.com/drive/folders/1a2B3c4D5e6F7g8H9i
                                          └──── esto es el ID ────┘
   ```

4. Copia esa parte final. Es el ID de la carpeta.

> No hace falta compartir la carpeta con nadie. Se queda privada: solo tú ves
> las fotos.

## Paso 2 — Crear el script

1. Entra a [script.google.com](https://script.google.com) y pulsa **Nuevo proyecto**.
2. Ponle nombre arriba, por ejemplo *Receptor fotos XV*.
3. Borra todo lo que trae el editor.
4. Copia y pega el contenido completo de [`subida.gs`](subida.gs).
5. En la línea del principio, reemplaza `PEGA_AQUI_EL_ID_DE_LA_CARPETA` por el
   ID del paso 1, dejando las comillas:

   ```js
   const ID_CARPETA = '1a2B3c4D5e6F7g8H9i';
   ```

6. Guarda con el icono del disquete.

## Paso 3 — Comprobar que la carpeta es la correcta

1. Arriba, en el desplegable de funciones, elige **probarCarpeta**.
2. Pulsa **Ejecutar**.
3. Google pedirá permisos la primera vez. Acepta: elige tu cuenta,
   pulsa **Configuración avanzada** → **Ir a (nombre del proyecto)** y luego
   **Permitir**.
4. Abajo, en el registro, debe aparecer el nombre de tu carpeta.

> Esa pantalla de advertencia de Google aparece porque el script es tuyo y no
> está verificado públicamente. Es normal en scripts propios.

## Paso 4 — Publicarlo

1. Arriba a la derecha: **Implementar** → **Nueva implementación**.
2. En el engranaje, elige el tipo **Aplicación web**.
3. Configura exactamente así:

   | Campo | Valor |
   |---|---|
   | Descripción | Receptor fotos XV |
   | **Ejecutar como** | **Yo** (tu correo) |
   | **Quién tiene acceso** | **Cualquier usuario** |

4. Pulsa **Implementar** y copia la **URL de la aplicación web**. Termina en
   `/exec`.

> Los dos campos de la tabla son los importantes. *Ejecutar como: Yo* es lo que
> permite que el invitado no necesite cuenta. *Cualquier usuario* es lo que
> permite que le llegue la foto.

## Paso 5 — Conectarlo a la invitación

Abre `assets/js/config.js` y pega la URL:

```js
drive: {
  urlScript: 'https://script.google.com/macros/s/AKfy.../exec',
```

Guarda, recarga la página y el botón **Subir fotos** se enciende solo.

---

## Comprobar que funciona

Abre la URL del script en el navegador. Debe responder:

```json
{"ok":true,"mensaje":"Receptor activo"}
```

Si ves eso, está bien publicado. Después sube una foto de prueba desde la
invitación y confirma que aparece en tu carpeta de Drive.

## Cada vez que cambies el script

Los cambios **no se aplican solos**. Hay que ir a **Implementar** →
**Gestionar implementaciones** → el lápiz de editar → en Versión elegir
**Nueva versión** → **Implementar**.

La URL se mantiene, así que no hay que tocar `config.js` otra vez.

## Si algo falla

| Síntoma | Causa más probable |
|---|---|
| La foto no llega y la consola marca error de CORS | La implementación no está como *Cualquier usuario* |
| Responde que no tiene autorización | Falta aceptar los permisos del paso 3 |
| `probarCarpeta` da error | El ID de la carpeta está mal copiado |
| Los cambios del script no surten efecto | Falta crear una **nueva versión** al implementar |

## Límites que conviene saber

- **15 GB**, compartidos con tu Gmail y el resto de tu Drive.
- Apps Script tiene un tope de ejecuciones diarias muy por encima de lo que
  necesita una fiesta, así que no es problema.
- Las fotos llegan ya comprimidas desde el celular del invitado (unos 400 KB
  cada una), así que con 15 GB caben decenas de miles.
