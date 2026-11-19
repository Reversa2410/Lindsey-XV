# Entrega a la familia — XV de Lindsey

Todo lo que hace falta para dejar la invitación en manos de la familia, con las
fotos y los videos llegando directo a **sus** cuentas de Google.

## Lo que se entrega

| Qué | Dónde |
|---|---|
| La invitación publicada | <https://lindsey-xv.vercel.app> |
| El álbum de la noche | <https://lindsey-xv.vercel.app/galeria> |
| La hoja con las confirmaciones | En el Drive del desarrollador, se comparte (ver **Parte 4**) |
| Script de la cuenta de **fotos** | [`google-apps-script/cuenta-fotos.gs`](google-apps-script/cuenta-fotos.gs) |
| Script de la cuenta de **videos** | [`google-apps-script/cuenta-videos.gs`](google-apps-script/cuenta-videos.gs) |
| El único archivo que se modifica | [`assets/js/config.js`](assets/js/config.js) (dos líneas) |
| QR de la invitación | [`qr/qr-invitacion.png`](qr/qr-invitacion.png) (y `.svg` para imprenta) → lindsey-xv.vercel.app |
| QR del álbum de la noche | [`qr/qr-album-de-la-noche.png`](qr/qr-album-de-la-noche.png) (y `.svg`) → lindsey-xv.vercel.app/galeria |

> Los QR apuntan a direcciones que no cambian: siguen sirviendo aunque se
> actualice la página. Si alguna vez cambia el dominio, hay que generarlos de
> nuevo.

Cómo queda repartido:

```
Invitado sube FOTOS  ──►  script cuenta-fotos.gs   ──►  Drive de la CUENTA 1 / "Fotos XV Lindsey"
Invitado sube VIDEOS ──►  script cuenta-videos.gs  ──►  Drive de la CUENTA 2 / "Videos XV Lindsey"
Invitado CONFIRMA    ──►  script original (subida.gs) ──►  Hoja "Confirmaciones XV Lindsey" (se comparte)
```

> **Fotos de Google vs. Drive.** Los archivos caen en **Google Drive** de cada
> cuenta (drive.google.com o la app Drive), no en la app Google Fotos. El
> espacio es el mismo (15 GB gratis por cuenta). Mandarlos directo a Google
> Fotos exige crear un proyecto en Google Cloud y pasar una revisión de Google;
> no vale la pena para un evento.

> **Usen cuentas @gmail.com normales.** Las de trabajo o colegio suelen tener
> bloqueado "compartir con enlace", y sin eso el álbum no puede mostrar las
> fotos.

---

## Parte 0 — Antes de salir

- Tener a mano los **dos correos y contraseñas** de la familia (la familia
  los escribe, no tú).
- Los dos scripts se copian desde GitHub, así que en la laptop ajena solo hace
  falta internet:
  - Fotos: <https://github.com/Reversa2410/Lindsey-XV/blob/main/google-apps-script/cuenta-fotos.gs>
  - Videos: <https://github.com/Reversa2410/Lindsey-XV/blob/main/google-apps-script/cuenta-videos.gs>

  En esas páginas, el botón **Copy raw file** (icono de dos hojas, arriba a la
  derecha del código) copia el archivo entero.

---

## Parte 1 — Cuenta de FOTOS

Hacerlo en una **ventana de incógnito** (Ctrl + Shift + N). Apps Script se
confunde cuando hay varias cuentas de Google abiertas en el mismo navegador y
falla al dar permisos sin explicar por qué.

1. En la ventana de incógnito, entrar a <https://script.google.com> e iniciar
   sesión con la **cuenta de fotos**.
2. **Nuevo proyecto**. Arriba, donde dice *Proyecto sin título*, ponerle
   **Receptor fotos XV**.
3. Borrar todo lo que trae el editor y pegar el contenido completo de
   `cuenta-fotos.gs`.
4. *(Opcional)* Si la familia quiere **revisar las fotos antes de que se vean
   en el álbum**, cambiar `const MODERAR_ALBUM = false;` por `true`.
5. Guardar con **Ctrl + S**.
6. Arriba, en el desplegable de funciones, elegir **instalar** y pulsar
   **Ejecutar**.
7. Google pide permisos:
   **Revisar permisos** → elegir la cuenta → sale *"Google no verificó esta
   app"* → **Configuración avanzada** → **Ir a Receptor fotos XV (no seguro)** →
   marcar todas las casillas si aparecen → **Permitir**.
   > Es normal: el script es de ellos mismos y no está publicado en una tienda.
8. Abajo, en el registro, sale *"Listo. Las fotos van a caer en: Fotos XV
   Lindsey"* y el enlace de la carpeta. **Guardar ese enlace para la familia.**
9. Arriba a la derecha: **Implementar** → **Nueva implementación** → en el
   engranaje ⚙ elegir **Aplicación web**. Llenar exactamente así:

   | Campo | Valor |
   |---|---|
   | Descripción | Receptor fotos XV |
   | **Ejecutar como** | **Yo** (el correo de la cuenta de fotos) |
   | **Quién tiene acceso** | **Cualquier usuario** |

10. **Implementar**. Si vuelve a pedir permisos, aceptarlos igual que en el
    paso 7.
11. Copiar la **URL de la aplicación web** (termina en `/exec`).
    👉 Esta es la **URL DE FOTOS**.
12. Comprobar: pegar esa URL en una pestaña. Debe decir
    `{"ok":true,"mensaje":"Receptor activo"}`.
13. Cerrar la ventana de incógnito entera.

## Parte 2 — Cuenta de VIDEOS

Igual que la Parte 1, en **otra** ventana de incógnito nueva, con la **cuenta
de videos** y el archivo `cuenta-videos.gs`:

1. <https://script.google.com> → iniciar sesión con la **cuenta de videos**.
2. **Nuevo proyecto** → nombre **Receptor videos XV**.
3. Borrar todo, pegar `cuenta-videos.gs`, **Ctrl + S**.
4. Elegir **instalar** → **Ejecutar** → aceptar permisos (mismo camino que
   antes). Esta vez Google pide además *"conectarse a un servicio externo"*:
   es como el script le pasa los trozos del video a Drive. Aceptar.
5. En el registro sale el enlace de la carpeta **Videos XV Lindsey**. Guardarlo.
6. **Implementar** → **Nueva implementación** → **Aplicación web** →
   *Ejecutar como:* **Yo** · *Quién tiene acceso:* **Cualquier usuario** →
   **Implementar**.
7. Copiar la URL `/exec`. 👉 Esta es la **URL DE VIDEOS**.
8. Comprobar: abrirla, debe decir
   `{"ok":true,"mensaje":"Receptor de videos activo"}`.
9. Cerrar la ventana de incógnito.

### Si el script de videos ya estaba publicado: actualizarlo

El álbum ahora también muestra los videos. Para eso el script de videos
aprendió dos cosas nuevas: **dar la lista de videos** al álbum y **compartir
con enlace** cada video que llega (sin eso Drive no deja reproducirlo). Si la
cuenta de videos se conectó antes de este cambio, hay que pasarle el código
nuevo. **La URL no cambia**, así que `config.js` no se toca.

1. Ventana de incógnito → <https://script.google.com> con la **cuenta de
   videos** → abrir el proyecto **Receptor videos XV**.
2. Borrar todo el código y pegar el `cuenta-videos.gs` nuevo. **Ctrl + S**.
3. En el desplegable de funciones elegir **compartirTodos** → **Ejecutar**.
   Comparte los videos que ya estaban subidos; los nuevos se comparten solos.
4. **Implementar** → **Gestionar implementaciones** → lápiz ✏️ → *Versión:*
   **Nueva versión** → **Implementar**.
   > No usar *Nueva implementación*: esa crea una URL distinta y la invitación
   > seguiría hablando con la vieja.
5. Comprobar: abrir la URL de videos terminada en `?accion=listar`. Debe decir
   `{"ok":true,"total":…,"videos":[…]}`.

## Parte 3 — Conectar la invitación (`assets/js/config.js`)

Es **el único archivo que se toca**, y son **dos líneas**. Buscar los
comentarios `>>> CUENTA DE FOTOS <<<` y `>>> CUENTA DE VIDEOS <<<`:

```js
drive: {
  /* >>> CUENTA DE FOTOS <<< ... */
  urlScript: 'PEGAR AQUÍ LA URL DE FOTOS',

...

videos: {
  /* >>> CUENTA DE VIDEOS <<< ... */
  urlScript: 'PEGAR AQUÍ LA URL DE VIDEOS',
```

> **No tocar** `rsvp.urlScript`. Ese es el de las confirmaciones y tiene que
> seguir apuntando al script original, o la lista se parte en dos hojas.

Dos maneras de hacerlo:

**Desde cualquier navegador (sin instalar nada):**
1. Abrir <https://github.com/Reversa2410/Lindsey-XV/edit/main/assets/js/config.js>
   (pide iniciar sesión en GitHub con tu cuenta).
2. Ctrl + F → `CUENTA DE FOTOS` → reemplazar la URL que está entre comillas.
3. Ctrl + F → `CUENTA DE VIDEOS` → pegar la URL entre las comillas vacías `''`.
4. **Commit changes** → **Commit changes**.

**Desde tu laptop:** editar el archivo, y luego `git commit` + `git push`.

En menos de un minuto Vercel publica la versión nueva. No hace falta cambiar
ningún `?v=` en el HTML: `config.js` se vuelve a pedir siempre.

## Parte 4 — La hoja de confirmaciones

La hoja sigue en **tu** Drive, porque el script que la escribe es el tuyo y ya
tiene todas las confirmaciones que han llegado. Se le **comparte** a la familia:

1. En tu cuenta, entrar a <https://drive.google.com> y buscar
   **Confirmaciones XV Lindsey**. (Si no aparece: abrir el script original en
   script.google.com, elegir la función **probarHojaRsvp**, **Ejecutar**, y el
   enlace sale en el registro.)
2. Abrirla → botón **Compartir** → escribir los correos de la familia.
3. Permiso:
   - **Lector** si solo la van a consultar (recomendado).
   - **Editor** si quieren anotar algo. En ese caso, que no borren la fila 1
     ni las columnas A–D: es donde escribe el script.
4. **Enviar**. El enlace de la barra de direcciones
   (`https://docs.google.com/spreadsheets/d/…/edit`) es el que se les entrega.

> **No** transferir la propiedad de la hoja ni borrar el script original: las
> confirmaciones dejarían de llegar.

## Parte 5 — Prueba con la familia

En el celular de alguien de la familia, abrir <https://lindsey-xv.vercel.app>
(si ya la tenían abierta, recargarla), bajar hasta **Comparte tus fotos y
videos** y:

| Prueba | Qué debe pasar |
|---|---|
| **Subir fotos** → elegir 2 o 3 → Enviar | "¡Gracias! Tus fotos quedaron guardadas" y aparecen en *Fotos XV Lindsey* de la cuenta 1 |
| **Álbum de la noche** | Se ven las fotos recién subidas (si `MODERAR_ALBUM` es `true`, solo después de moverlas a *Álbum público*) |
| **Subir videos** → elegir un video corto → Enviar | Barra con porcentaje, luego "¡Gracias! Tu video quedó guardado" y aparece en *Videos XV Lindsey* de la cuenta 2 |
| **Álbum de la noche** otra vez | El video aparece con un ▶ encima y se reproduce al tocarlo. Recién subido puede salir como un cuadro de color sin miniatura: Drive tarda unos minutos en sacarla, pero ya se puede ver |
| Escanear los dos **QR** con la cámara del celular | Uno abre la invitación, el otro directo el álbum |
| **Confirmar asistencia** con un nombre de prueba | Aparece una fila en la hoja de confirmaciones |

Después de probar, **borrar las fotos, videos y filas de prueba** desde Drive y
la hoja.

## Lo que la familia tiene que saber

- Los invitados **no necesitan cuenta** de Google para subir.
- Cada cuenta gratis tiene **15 GB**. Un video de celular de 1 minuto pesa
  entre 100 y 400 MB; caben bastantes, pero conviene revisar el espacio en
  <https://one.google.com/storage> antes del evento.
- Tope por video: **1 GB**. Si alguien tiene uno más pesado, que lo recorte en
  su galería.
- Mientras sube un video, el invitado **no debe cerrar la página**. Si el
  internet se corta, el envío se retoma solo desde donde quedó.
- Para bajar todo después de la fiesta: en Drive, clic derecho en la carpeta →
  **Descargar** (sale un .zip).
- **Moderar el álbum** (si eligieron `MODERAR_ALBUM = true`): en Drive, mover
  las fotos de *Fotos XV Lindsey* a la subcarpeta *Álbum público*. Solo esas se
  ven en la invitación.

## Si algo falla

| Síntoma | Causa más probable |
|---|---|
| Al dar permisos sale un error raro o una página en blanco | Hay varias cuentas abiertas: repetir en **incógnito** |
| La URL dice que no tiene acceso o pide iniciar sesión | La implementación no quedó como **Cualquier usuario** |
| El botón *Subir videos* se ve apagado | `videos.urlScript` sigue vacío en `config.js`, o Vercel aún no termina de publicar |
| Las fotos llegan a Drive pero el álbum no las muestra | La cuenta no permite compartir con enlace (cuenta de trabajo/colegio), o falta moverlas a *Álbum público* |
| Los videos llegan a Drive pero no salen en el álbum | El script de videos es el viejo: ver *Si el script de videos ya estaba publicado* en la Parte 2 |
| El video sale en el álbum pero al tocarlo dice que no hay acceso | Ese video no quedó compartido: ejecutar **compartirTodos** en el script de videos |
| El video llega a 0 % y falla | Faltó aceptar el permiso de *servicio externo*: ejecutar **instalar** otra vez |
| Se cambió algo en un script y no surte efecto | **Implementar** → **Gestionar implementaciones** → lápiz → Versión: **Nueva versión** → **Implementar**. La URL no cambia |
