# 🚀 Configuración de Vercel para PomoSmart

## Variables de Entorno Requeridas

Para que la aplicación funcione correctamente en Vercel, necesitas configurar las siguientes variables de entorno:

### 1. **VITE_SUPABASE_URL**
- Descripción: URL de tu proyecto Supabase
- Ejemplo: `https://xxxxxxxxxxxxx.supabase.co`
- Dónde obtenerla: Supabase Dashboard → Project Settings → API

### 2. **VITE_SUPABASE_ANON_KEY**
- Descripción: API Key pública de Supabase
- Ejemplo: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Dónde obtenerla: Supabase Dashboard → Project Settings → API → anon/public key

### 3. **VITE_GEMINI_API_KEY**  ⭐ NUEVO
- Descripción: API Key de Google Gemini para IA
- Ejemplo: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- Dónde obtenerla: https://makersuite.google.com/app/apikey
- **GRATIS** - No requiere tarjeta de crédito

---

## 📋 Pasos para Configurar en Vercel

### Opción 1: Dashboard de Vercel (Recomendado)

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Click en tu proyecto `pomodoro`
3. Ve a **Settings** → **Environment Variables**
4. Agrega las 3 variables una por una:

```
Name: VITE_SUPABASE_URL
Value: tu_url_de_supabase
```

```
Name: VITE_SUPABASE_ANON_KEY
Value: tu_anon_key_de_supabase
```

```
Name: VITE_GEMINI_API_KEY
Value: tu_api_key_de_gemini
```

5. **Redeploy** tu aplicación:
   - Ve a **Deployments**
   - Click en los 3 puntos del último deployment
   - Click en **Redeploy**

### Opción 2: Vercel CLI

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Login
vercel login

# Configurar variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_GEMINI_API_KEY

# Redeploy
vercel --prod
```

---

## 🔑 Cómo Obtener la API Key de Gemini (GRATIS)

1. **Ve a Google AI Studio**
   ```
   https://makersuite.google.com/app/apikey
   ```

2. **Inicia sesión** con tu cuenta de Google

3. **Click en "Create API Key"**

4. **Selecciona o crea un proyecto** de Google Cloud
   - Si no tienes uno, se creará automáticamente
   - Es gratis, no requiere tarjeta

5. **Copia la API Key** generada
   - Empieza con `AIzaSy...`
   - Guárdala en un lugar seguro

6. **Pégala en Vercel** como `VITE_GEMINI_API_KEY`

---

## ✅ Verificar que Funciona

Después de configurar las variables y hacer redeploy:

1. Abre tu app en Vercel: `https://tu-app.vercel.app`

2. Ve a la consola del navegador (F12)

3. Busca estos mensajes:
   ```
   ✅ Cargados X perfiles de Supabase
   ✅ Sincronización con Supabase completada
   ```

4. Ve a la pestaña **Plan IA** 🧠

5. Click en **"Generar Plan con IA"**

6. En la consola deberías ver:
   ```
   🔑 API Key detectada, generando plan con IA Gemini...
   ```

Si ves:
```
⚠️ No Gemini API key available, using basic plan
```

Significa que la variable `VITE_GEMINI_API_KEY` no está configurada correctamente.

---

## 🐛 Solución de Problemas

### Problema: "No Gemini API key available"

**Solución:**
1. Verifica que la variable se llame **exactamente** `VITE_GEMINI_API_KEY`
2. El nombre debe empezar con `VITE_` (así funciona Vite en Vercel)
3. Después de agregar/cambiar variables, **siempre** haz redeploy

### Problema: Horarios no aparecen

**Solución:**
1. Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén correctas
2. En tu base de datos Supabase, tabla `class_schedule`, verifica que haya datos
3. Los horarios deben tener un `subject_id` válido que exista en la tabla `subjects`
4. Revisa la consola del navegador para ver si hay errores de Supabase

### Problema: Plan IA se genera pero sin horarios inteligentes

**Solución:**
1. Asegúrate de tener **materias** creadas en la pestaña "Materias"
2. Crea **exámenes** con fechas futuras en "Exámenes"
3. Agrega **temas** (topics) a cada examen (mínimo 3-5)
4. Registra tu **horario de clases** en la pestaña "Horario"
5. La IA usará esta información para generar el plan

---

## 📊 Límites de la API de Gemini (Gratis)

- **60 solicitudes por minuto**
- **1,500 solicitudes por día**
- **1 millón de tokens por mes**

Suficiente para uso personal. Un plan de estudio = 1 solicitud.

---

## 🔒 Seguridad

**¿Es seguro exponer VITE_GEMINI_API_KEY en el cliente?**

✅ Sí, porque:
1. Está limitada a tu dominio en Google Cloud
2. Tiene rate limits automáticos
3. Es gratis, no hay riesgo financiero
4. Es solo de lectura (no puede modificar nada)

🔐 **Opcional:** Puedes restringir el uso de la API Key a tu dominio de Vercel en Google Cloud Console → API Key Restrictions.

---

## 📝 Notas Importantes

1. **VITE_ prefix es obligatorio** para que Vite exponga la variable en el cliente
2. Después de cambiar variables, **siempre redeploy**
3. Las variables **NO** se actualizan automáticamente en deployments existentes
4. Puedes tener diferentes valores para Development, Preview y Production

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa la consola del navegador (F12)
2. Revisa los logs de Vercel: Dashboard → Deployments → [tu deployment] → Logs
3. Verifica que las variables tengan los nombres exactos (case-sensitive)

---

¡Listo! Ahora PomoSmart debería funcionar perfectamente con IA en Vercel. 🎉
