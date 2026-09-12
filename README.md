# Rank Card API

API que genera una imagen PNG con el nivel, experiencia y progreso de un usuario.
Corre como Edge Function en Vercel usando `@vercel/og`, más el comando del bot
listo para usarla.

## Estructura del proyecto

```
rankcard-api/
├── api/
│   └── rankcard.jsx      ← Edge Function: genera la imagen (esto se despliega en Vercel)
├── commands/
│   └── level.js          ← Comando del bot: llama a la API y envía imagen + caption
├── package.json
├── vercel.json
└── README.md
```

Solo la carpeta `api/` se despliega en Vercel. La carpeta `commands/` va en tu
proyecto del bot (no en Vercel) — copiá `level.js` a donde tengas tus comandos.

## Deploy

```bash
npm i -g vercel
cd rankcard-api
vercel --prod
```

O subí la carpeta a un repo de GitHub y conectalo en vercel.com (Import Project).
No hace falta configurar nada más: Vercel detecta `/api/rankcard.jsx` automáticamente.

## Uso

```
GET https://TU-PROYECTO.vercel.app/api/rankcard
```

### Query params

| Param        | Tipo   | Default                          | Descripción                          |
|--------------|--------|-----------------------------------|---------------------------------------|
| `name`       | string | "Usuario"                        | Nombre a mostrar                     |
| `level`      | number | 0                                 | Nivel actual                         |
| `exp`        | number | 0                                 | Experiencia total acumulada          |
| `rank`       | string | "?"                               | Puesto en el ranking (ej: 3)         |
| `commands`   | number | 0                                 | Comandos ejecutados                  |
| `multiplier` | number | 2                                 | Multiplicador de XP (igual al del bot)|
| `avatar`     | url    | avatar generado con iniciales    | URL de la foto de perfil             |

### Ejemplo

```
https://TU-PROYECTO.vercel.app/api/rankcard?name=Juan&level=12&exp=54000&rank=3&commands=980&avatar=https://example.com/foto.jpg
```

## Integración en tu bot

El archivo `commands/level.js` ya viene listo con todo:

1. Calcula nivel, progreso y puesto igual que tu comando original.
2. Arma la URL hacia la API de Vercel con esos datos como query params.
3. Intenta traer la foto de perfil de WhatsApp para usarla de avatar.
4. Envía **un solo mensaje**: la imagen de la rank card con el texto de
   siempre (`「✿」Usuario ◢...`) como caption — no dos mensajes separados.
5. Si por algún motivo la API falla (caída, sin red, etc.), cae de vuelta
   a mandar el texto solo, para que el comando nunca se quede sin responder.

### Pasos

1. Copiá `commands/level.js` a la carpeta de comandos de tu bot.
2. Cambiá esta línea al inicio del archivo por la URL real de tu deploy:

   ```js
   const RANKCARD_API_URL =
     process.env.RANKCARD_API_URL || 'https://TU-PROYECTO.vercel.app/api/rankcard';
   ```

   (o definí la variable de entorno `RANKCARD_API_URL` en tu bot, así no
   tenés que tocar el código si cambiás de dominio).
3. Listo — el comando `.level` / `.lvl` ya manda la imagen con caption.

## Notas

- La fórmula de `xpRange` está duplicada dentro de `api/rankcard.jsx` para que la API
  sea independiente del bot. Si cambiás la fórmula en el bot, actualizala también acá
  (o mejor: hacé que el bot le pase `min`/`max`/`xp` ya calculados como query params
  en vez de recalcularlos).
- Los avatares se cargan por URL (`<img src="...">"`), así que deben ser accesibles
  públicamente (una URL de perfil de WhatsApp firmada sirve, pero expira — considerá
  eso si cacheás la imagen).
