# Guía de Deployment - PomoSmart

Esta aplicación está configurada para desplegarse en múltiples plataformas. A continuación se detallan las instrucciones para cada una.

## ✅ Vercel (Recomendado)

Vercel es la plataforma recomendada para este proyecto ya que está optimizado para aplicaciones Vite + React.

### Configuración

1. **Conectar repositorio**: Importa el repositorio de GitHub en Vercel
2. **Branch principal**: Asegúrate de que está configurado para deployar desde `main`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### Variables de Entorno

Configura en Vercel Dashboard:
```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
GEMINI_API_KEY=tu_api_key_de_gemini
```

### Configuración automática

Vercel detectará automáticamente que es un proyecto Vite y aplicará la configuración óptima.

## 🎨 Render

Render requiere configuración específica para servir correctamente una SPA (Single Page Application).

### Opción 1: Usando render.yaml (Recomendado)

El proyecto incluye un archivo `render.yaml` con la configuración necesaria.

1. Conecta el repositorio en Render
2. Render detectará automáticamente el archivo `render.yaml`
3. Configura las variables de entorno en el Dashboard

### Opción 2: Configuración manual

Si no usas `render.yaml`:

- **Type**: Static Site
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Rewrite Rules**:
  ```
  /*  /index.html  200
  ```

### Variables de Entorno en Render

```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
GEMINI_API_KEY=tu_api_key_de_gemini
```

## 🚀 Netlify

### Configuración

1. **Build command**: `npm run build`
2. **Publish directory**: `dist`
3. **Deploy settings**: Asegúrate de deployar desde la branch `main`

### Archivo netlify.toml

Crea un archivo `netlify.toml` en la raíz:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## 🔧 Configuración General

### Build Exitoso

El build debería completarse sin errores:
```bash
npm install
npm run build
```

### Archivos Generados

Después del build, deberías tener en `dist/`:
- `index.html`
- `assets/` (CSS y JS)
- `icons/` (Iconos PWA)
- `manifest.json`
- `sw.js` (Service Worker)

### Verificación Post-Deploy

1. Verifica que la app carga correctamente
2. Verifica que no hay errores en la consola del navegador
3. Verifica que los iconos PWA se cargan correctamente
4. Verifica que el Service Worker se registra correctamente

## ⚠️ Problemas Comunes

### Error: "can't access property 'filter', a is undefined"

**Solucionado en commits recientes**. Asegúrate de deployar desde la branch `main` actualizada.

### Error: "cdn.tailwindcss.com should not be used in production"

**Solucionado**. Ahora se usa Tailwind CSS v4 compilado con @tailwindcss/vite.

### Error 404 en Service Worker o Iconos

Verifica que el directorio `public/` se copie correctamente al `dist/` durante el build. Vite hace esto automáticamente.

### Render: Error de MIME type

Asegúrate de usar la configuración de Static Site y que el archivo `render.yaml` esté en la raíz del proyecto.

## 📝 Notas Adicionales

### PWA

La aplicación está configurada como PWA (Progressive Web App). Los usuarios pueden instalarla en sus dispositivos.

### Service Worker

El Service Worker es minimalista y solo se usa para habilitar la instalación PWA. No cachea contenido para evitar problemas de actualización.

### Actualizaciones

Para deployar actualizaciones:

1. Haz commit de tus cambios
2. Push a la branch correspondiente
3. Crea un PR hacia `main`
4. Una vez mergeado, el deploy se hará automáticamente

## 🆘 Soporte

Si encuentras problemas durante el deployment, verifica:

1. **Logs de build**: Revisa los logs completos del proceso de build
2. **Variables de entorno**: Asegúrate de que todas están configuradas
3. **Branch correcta**: Verifica que estás deployando desde `main`
4. **Versión de Node**: Recomendado Node 18 o superior

---

**Última actualización**: 2026-01-23
**Versión de Tailwind CSS**: v4
**Build Tool**: Vite 6.4.1
