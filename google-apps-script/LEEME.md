# Receptor de la invitación en Google

Un solo script de Google atiende las dos cosas que manda la invitación:

| Qué | Dónde cae | Para qué |
|---|---|---|
| **Confirmaciones de asistencia** | Una hoja de cálculo | La tabla con quién viene y quién no |
| **Fotos de los invitados** | Una carpeta de Drive | El álbum de la noche |

Son unos diez minutos y todo es gratis.

> **Para la beta solo hace falta la parte de las confirmaciones.** Los botones
> de subir fotos, subir videos y ver el álbum están apagados a propósito desde
> `config.js` (`fotos.deshabilitados`), así que los pasos de la carpeta de
> Drive pueden esperar. La tabla de asistencia es el **Paso 7**.

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

## Paso 6 — La galería (decidir si moderas)

La invitación muestra un álbum con lo que los invitados van subiendo. Lo que se
ve ahí lo decide **el script**, no la página.

En la línea `ID_CARPETA_GALERIA` del script tienes dos opciones:

**Dejarla vacía.** Todo lo que suban aparece en el álbum al instante. Es lo más
vistoso durante la fiesta, pero recuerda que el enlace de la invitación es
público: si alguien sube algo inapropiado, se ve de inmediato.

**Poner el ID de una segunda carpeta.** Crea otra carpeta, por ejemplo
*Publicadas*, pega su ID ahí, y el álbum mostrará solo lo que tú muevas a ella.
Moderar se vuelve arrastrar fotos de una carpeta a otra en Drive, sin tocar
código.

```js
const ID_CARPETA_GALERIA = '1x2Y3z...';   // solo se ve lo que muevas aquí
```

> Recomendado poner la segunda carpeta. Alguien de la familia puede ir pasando
> las fotos desde el celular durante la noche, y el álbum crece igual.

## Comprobar la galería

Abre la URL del script añadiendo `?accion=listar`:

```
https://script.google.com/macros/s/AKfy.../exec?accion=listar
```

Debe devolver la lista de fotos en formato JSON. Si responde
`{"ok":true,"mensaje":"Receptor activo"}` en vez de la lista, es que **falta
crear una nueva versión de la implementación** (ver la sección de abajo).

---

## Paso 7 — La tabla de confirmaciones

Cada invitado que confirme deja una fila en una hoja de cálculo:

| Fecha | Nombre | Apellido | Asiste |
|---|---|---|---|
| 2026-11-20 19:42 | Kevin | Torrez | Sí |
| 2026-11-20 20:05 | Ana | Mejía | No |

La cantidad de personas **no** se pregunta: los lugares ya están asignados de
antemano, así que lo único que falta saber es quién viene.

### La hoja

Tienes dos caminos. El cómodo es no hacer nada: si dejas `ID_HOJA_RSVP`
vacío, el script **crea la hoja solo** la primera vez que alguien confirma, la
deja en tu Drive con el nombre *Confirmaciones XV Lindsey*, y recuerda cuál es
para escribir siempre en la misma.

Si prefieres crearla tú (por ejemplo para compartirla con la familia desde el
principio), crea una hoja en [sheets.google.com](https://sheets.google.com),
copia su ID de la barra de direcciones y pégalo en el script:

```
https://docs.google.com/spreadsheets/d/1a2B3c4D5e6F7g8H9i/edit
                                       └──── esto es el ID ────┘
```

```js
const ID_HOJA_RSVP = '1a2B3c4D5e6F7g8H9i';
```

Los títulos de las columnas los pone el script solo la primera vez. No hay que
preparar nada dentro de la hoja.

### Permisos

Escribir en una hoja es un permiso **nuevo** que el script antes no tenía. La
primera vez que ejecutes algo que la toque, Google va a volver a pedir
autorización aunque ya la hubieras dado para Drive. Es normal: acepta igual
que en el Paso 3.

Lo más cómodo es provocarlo tú desde el editor:

1. En el desplegable de funciones, elige **probarHojaRsvp**.
2. Pulsa **Ejecutar** y acepta los permisos.
3. En el registro sale el enlace de la hoja. **Guárdalo**: ahí es donde vas a
   ver la lista.

### Conectarlo a la invitación

Normalmente **no hay que tocar nada**: la invitación usa el mismo script de las
fotos, así que con `fotos.drive.urlScript` ya puesto la confirmación funciona.

`rsvp.urlScript` en `config.js` existe solo por si algún día quieres que las
confirmaciones vayan a un script distinto del de las fotos. Si lo dejas vacío,
se usa el de las fotos.

### Si alguien confirma dos veces

Se actualiza su fila en vez de agregar otra. Pasa cuando alguien se equivoca y
vuelve a mandarlo, y una lista con duplicados no sirve para contar lugares. La
comparación no distingue mayúsculas ni acentos, así que *kevin torrez* y
*Kevin Tórrez* cuentan como la misma persona.

### Acuérdate de publicar la versión nueva

El script cambió, así que **hay que crear una nueva versión de la
implementación** o la invitación seguirá hablando con el script viejo, que no
sabe qué hacer con una confirmación. Ver *Cada vez que cambies el script*, aquí
abajo. La URL no cambia.

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
| Al confirmar dice *No llegó ningún archivo* | El script publicado es el viejo: falta la **nueva versión** |
| Al confirmar dice que no tiene autorización | Falta aceptar el permiso de hojas de cálculo (Paso 7) |
| La hoja de confirmaciones no aparece | Ejecuta **probarHojaRsvp** y mira el enlace en el registro |

## Límites que conviene saber

- **15 GB**, compartidos con tu Gmail y el resto de tu Drive.
- Apps Script tiene un tope de ejecuciones diarias muy por encima de lo que
  necesita una fiesta, así que no es problema.
- Las fotos llegan ya comprimidas desde el celular del invitado (unos 400 KB
  cada una), así que con 15 GB caben decenas de miles.
