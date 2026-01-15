# Configuración de IA para PomoSmart

## Características de IA Integradas

PomoSmart ahora incluye un sistema de planificación inteligente que utiliza Google Gemini AI para:

1. **Generación Automática de Planes de Estudio**
   - Análisis de exámenes próximos y materias
   - Cálculo automático de sesiones de estudio óptimas
   - Distribución temporal basada en prioridades

2. **Repetición Espaciada (Spaced Repetition)**
   - Algoritmo basado en SuperMemo SM-2
   - Intervalos de repaso: 1, 3, 7, 14, 30, 60, 120 días
   - Optimización de la retención a largo plazo

3. **Recomendaciones Personalizadas**
   - Técnicas de estudio adaptadas por tema
   - Priorización automática según fechas de examen
   - Estrategias de aprendizaje efectivo

## Cómo Obtener tu API Key de Gemini

1. **Ir a Google AI Studio**
   - Visita: https://makersuite.google.com/app/apikey
   - Inicia sesión con tu cuenta de Google

2. **Crear una API Key**
   - Click en "Create API Key"
   - Selecciona o crea un proyecto de Google Cloud
   - Copia la API Key generada

3. **Configurar en PomoSmart**
   - Ve a la pestaña "Plan IA" 🧠
   - Click en "Con IA"
   - Pega tu API Key
   - Click en "Generar"

## Uso del Plan de Estudio IA

### Generar un Plan

```
1. Asegúrate de tener materias y exámenes configurados
2. Ve a la pestaña "Plan IA"
3. Opción 1: Click en "Generar Plan" (sin IA, básico)
4. Opción 2: Click en "Con IA", ingresa tu API Key y "Generar" (recomendado)
```

### Entender el Plan Generado

El plan incluye:

- **Sesiones de Estudio**: Cuándo y qué estudiar
- **Técnicas Recomendadas**:
  - 🎯 **Deep Focus**: Primera exposición al tema (50 min)
  - 🔄 **Revision**: Repaso activo con resúmenes (25 min)
  - 📖 **Practice**: Ejercicios y consolidación (25 min)
  - 🍅 **Pomodoro**: Sesión estándar (25 min)

- **Prioridades**:
  - 🔴 **Urgent**: Menos de 3 días para el examen
  - 🟠 **High**: 3-7 días
  - 🟡 **Medium**: 7-14 días
  - 🟢 **Low**: Más de 14 días

### Repetición Espaciada

El algoritmo programa automáticamente múltiples sesiones por tema:

- **Sesión 1** (Día 1): Aprendizaje inicial
- **Sesión 2** (Día 3): Primera revisión
- **Sesión 3** (Día 7): Consolidación
- **Sesión 4** (Día 14): Repaso largo plazo
- **Sesión 5+** (Días 30, 60, 120): Mantenimiento

## Características del Sistema

### 1. Calendario Inteligente

- Vista de 3 semanas de sesiones programadas
- Código de colores por materia
- Indicador de día actual
- Hasta 3 sesiones visibles por día

### 2. Sesiones de Hoy

- Vista detallada de sesiones programadas para hoy
- Botón "Iniciar" que conecta con el temporizador Pomodoro
- Recomendaciones específicas de la IA
- Indicadores de técnica y duración

### 3. Estadísticas del Plan

- Total de días programados
- Número de sesiones totales
- Horas de estudio estimadas
- Sesiones del día actual

## Modo Sin IA (Fallback)

Si no tienes una API Key, puedes usar el modo básico:

- Genera un plan automático sin IA
- Usa repetición espaciada estándar
- Distribuye sesiones uniformemente
- 3 sesiones por tema como mínimo

## Algoritmo de Repetición Espaciada

Basado en investigación científica sobre la curva del olvido:

```typescript
Intervalos = [1, 3, 7, 14, 30, 60, 120] días

Retención óptima = Estudio inicial + Repasos espaciados
```

### Por qué funciona:

1. **Primera Sesión**: Aprendizaje inicial del contenido
2. **24 horas después**: Primera revisión (1 día)
3. **3 días después**: Consolidación temprana
4. **7 días después**: Transferencia a memoria a largo plazo
5. **14+ días**: Mantenimiento y dominio

## Mejores Prácticas

1. **Configura exámenes con anticipación**
   - Mínimo 2 semanas antes
   - Máximo aprovechamiento de repetición espaciada

2. **Sigue el plan generado**
   - Las sesiones están optimizadas
   - Respetar los intervalos mejora retención

3. **Usa las técnicas recomendadas**
   - Deep Focus para temas nuevos
   - Revision para consolidar
   - Practice para dominar

4. **Combina con Pomodoro**
   - Cada sesión usa la técnica Pomodoro
   - Descansos programados automáticamente
   - Mejor concentración y productividad

## Privacidad y Datos

- Tu API Key **nunca se guarda** en el navegador
- Se usa solo para la llamada a Gemini
- Los datos de tus materias/exámenes **no salen de tu dispositivo**
- Supabase solo guarda tus datos académicos, no la API Key

## Solución de Problemas

### "Error en API de Gemini"

- Verifica que la API Key sea correcta
- Asegúrate de tener cuota disponible en Google Cloud
- Revisa que el servicio Gemini esté habilitado

### "No se generaron sesiones"

- Verifica que tengas exámenes configurados
- Asegúrate de que los exámenes tengan temas (topics)
- Verifica que la fecha del examen sea futura

### Plan generado es muy extenso

- El algoritmo prioriza exámenes próximos
- Puedes filtrar por materia
- Las sesiones distantes son opcionales (mantenimiento)

## Recursos Adicionales

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Spaced Repetition Research](https://www.gwern.net/Spaced-repetition)
- [Pomodoro Technique](https://francescocirillo.com/pages/pomodoro-technique)

## Soporte

Si tienes problemas con la integración de IA:

1. Revisa esta documentación
2. Verifica la configuración de tu API Key
3. Intenta usar el modo básico (sin IA)
4. Contacta soporte si el problema persiste

---

**PomoSmart** - Tu asistente de estudios potenciado por IA 🧠🍅
