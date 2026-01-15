# Configuración de IA para PomoSmart

## 🎉 ¡API Key Ya Configurada!

La API Key de Gemini ya está configurada en Vercel como `GEMINI_API_KEY`.
**¡Solo click en "Generar Plan con IA" y listo!**

## Características de IA Integradas

PomoSmart utiliza Google Gemini AI para generar planes de estudio científicamente optimizados:

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

## 🚀 Uso del Plan de Estudio IA

### Generar un Plan (3 pasos)

```
1. Configura tus materias y exámenes en las pestañas correspondientes
2. Ve a la pestaña "Plan IA" 🧠
3. Click en "Generar Plan con IA"
```

**¡Eso es todo!** La IA analizará:
- ✅ Tus materias y exámenes
- ✅ Tu horario de clases
- ✅ Fechas de exámenes
- ✅ Temas por estudiar

Y generará un plan optimizado con:
- 📅 Fechas y horas exactas
- 🧠 Técnicas de estudio específicas
- ⏰ Sesiones de 25-50 minutos
- 🔄 Repetición espaciada automática
- 🎯 Priorización inteligente

### Entender el Plan Generado

El plan incluye:

- **Sesiones de Estudio**: Cuándo y qué estudiar
- **7 Técnicas Científicas Validadas**:
  - 🎯 **Deep Focus**: Primera exposición, contenido nuevo (40-50 min)
  - 🧠 **Active Recall**: Recuperar información sin notas (25-30 min)
  - ✨ **Feynman**: Explicar conceptos en términos simples (30 min)
  - 📈 **Interleaving**: Mezclar múltiples temas relacionados (50 min)
  - 🔥 **Practice**: Ejercicios y problemas deliberados (30-40 min)
  - 🔄 **Revision**: Repaso espaciado de resúmenes (20-25 min)
  - 🍅 **Pomodoro**: Sesión estándar enfocada (25 min)

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

### 1. Antes de Generar el Plan

✅ **Configura tus materias** en la pestaña "Materias"
✅ **Agrega exámenes** con fechas reales en "Exámenes"
✅ **Define temas** por cada examen (mínimo 3-5 temas)
✅ **Registra tu horario** de clases en "Horario"

### 2. Usando el Plan Generado

🎯 **Sigue las horas recomendadas**
- La IA considera tu horario de clases
- Respeta los horarios óptimos cognitivos
- Mañanas para contenido complejo

🧠 **Aplica las técnicas correctamente**
- **Deep Focus**: Sin distracciones, full concentración
- **Active Recall**: Cierra el libro, escribe lo que recuerdas
- **Feynman**: Explica como si enseñaras a un niño
- **Interleaving**: Alterna temas (no estudies 3h seguidas de matemáticas)
- **Practice**: Resuelve problemas SIN mirar la solución

🔄 **Respeta la Repetición Espaciada**
- **Día 1**: Primera exposición
- **Día 3**: Primera revisión (CRÍTICO)
- **Día 7**: Consolidación a largo plazo
- **Día 14+**: Mantenimiento

### 3. Maximiza Retención

📊 **Estrategias comprobadas**:
1. Estudia en sesiones cortas (25-50 min máximo)
2. Toma descansos de 5-15 minutos
3. Varía las materias (no monotonía)
4. Duerme bien (la consolidación ocurre dormido)
5. Haz ejercicio ligero (mejora cognición)

❌ **Evita**:
- Estudiar 4+ horas seguidas
- "Atracones" la noche antes
- Saltarte las revisiones espaciadas
- Estudiar con sueño o hambre
- Multitasking (música con letra, redes sociales)

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
