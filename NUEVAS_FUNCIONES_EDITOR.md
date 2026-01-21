# 🎨 Nuevas Funcionalidades del Editor de Notas

¡Tu editor de notas ha sido mejorado con funcionalidades profesionales! Ahora es un editor multimedia completo con inteligencia para crear conexiones automáticas en tu grafo de conocimiento.

---

## ✨ Resumen de Mejoras

### 1. **📚 Asociación de Materias** (Reemplaza el "Tip")
- Botón visual con dropdown elegante
- Vincular cualquier nota a una materia
- Sincronización automática con Supabase

### 2. **🖼️ Editor Multimedia Completo**
- Imágenes: arrastrar, pegar o seleccionar
- Links con estilo visual mejorado
- **NUEVO: Fórmulas matemáticas con LaTeX**

### 3. **🕸️ Grafo Inteligente Automático**
- Detección de hashtags `#tema`
- Análisis de títulos para conexiones
- Creación automática de nodos y enlaces

### 4. **🎭 Estética Neón/Morada**
- Modo oscuro con gradientes purple-pink
- Efectos glow en bordes y sombras
- Indicadores visuales de estado

---

## 📘 Guía de Uso Detallada

### 1️⃣ Vincular Nota a Materia

**Antes (texto estático):**
```
Tip: Usa [[nombre]] para crear enlaces...
```

**Ahora (botón interactivo):**

1. **Haz click** en el botón **"Vincular a Materia"** (arriba a la izquierda, junto al título)
2. Se abre un **dropdown** con todas tus materias
3. **Selecciona** la materia deseada
4. La nota queda **automáticamente vinculada** y se muestra el nombre de la materia con su color

**Visual:**
```
┌─────────────────────────────────────┐
│ 📖 Cálculo Integral          ▼     │ ← Click aquí
└─────────────────────────────────────┘
           ↓ Abre dropdown
┌─────────────────────────────────────┐
│ Selecciona una Materia              │
├─────────────────────────────────────┤
│ ✕ Sin materia                       │
│ 🔵 Cálculo Integral (MAT301)        │ ← Selecciona
│ 🟢 Física Cuántica (FIS401)         │
│ 🔴 Química Orgánica (QUI201)        │
└─────────────────────────────────────┘
```

**Beneficios:**
- ✅ La nota aparece en el grafo vinculada a esa materia
- ✅ Puedes filtrar notas por materia
- ✅ Se guarda automáticamente en `subject_id`

---

### 2️⃣ Insertar Imágenes

**3 Formas de Agregar Imágenes:**

#### Opción A: Arrastrar y Soltar 🖱️
```
1. Arrastra una imagen desde tu explorador de archivos
2. Suéltala en cualquier parte del editor
3. La imagen se inserta automáticamente
```

#### Opción B: Pegar desde Portapapeles 📋
```
1. Copia una imagen (Ctrl+C)
2. Pega en el editor (Ctrl+V)
3. La imagen aparece inmediatamente
```

#### Opción C: Seleccionar desde Botón 🖼️
```
1. Click en el botón de imagen en la barra de herramientas
2. Selecciona la imagen desde tu computadora
3. La imagen se inserta
```

**Mientras se carga:**
```
⏳ Subiendo imagen... (indicador azul pulsante)
```

**Características:**
- ✅ Convierte a base64 (no necesitas servidor de imágenes)
- ✅ Almacena directamente en la nota
- ✅ Bordes redondeados y sombra automática
- ✅ Responsive (se adapta al tamaño del editor)

---

### 3️⃣ Insertar Fórmulas Matemáticas 📐

**Botón nuevo:** `ƒ(x)` en la barra de herramientas

**Cómo usar:**
```
1. Click en el botón ƒ(x)
2. Escribe la fórmula en formato LaTeX
3. La fórmula se renderiza automáticamente
```

**Ejemplos de Fórmulas LaTeX:**

| Fórmula | LaTeX | Resultado |
|---------|-------|-----------|
| Ecuación de Einstein | `E = mc^2` | E = mc² |
| Teorema de Pitágoras | `a^2 + b^2 = c^2` | a² + b² = c² |
| Integral | `\int_{0}^{\infty} e^{-x} dx` | ∫₀^∞ e⁻ˣ dx |
| Sumatoria | `\sum_{i=1}^{n} i = \frac{n(n+1)}{2}` | Σᵢ₌₁ⁿ i = n(n+1)/2 |
| Derivada | `\frac{d}{dx}(x^2) = 2x` | d/dx(x²) = 2x |
| Límite | `\lim_{x \to 0} \frac{\sin x}{x} = 1` | lim_{x→0} (sin x)/x = 1 |
| Matriz | `\begin{pmatrix} a & b \\ c & d \end{pmatrix}` | [a b; c d] |
| Raíz | `\sqrt{x^2 + y^2}` | √(x² + y²) |

**Estilo Visual:**
- Fondo: Púrpura oscuro translúcido
- Borde: Púrpura con glow
- Tipografía: KaTeX (profesional)

**Ejemplo de Nota con Fórmula:**
```markdown
# Teorema Fundamental del Cálculo

La derivada de una integral es la función original:

$\frac{d}{dx} \int_{a}^{x} f(t) dt = f(x)$

Esto conecta los conceptos de [[Derivadas]] e [[Integrales]].
```

---

### 4️⃣ Usar Hashtags para el Grafo 🏷️

**Cómo Funcionan los Hashtags:**

1. **Escribe hashtags** en cualquier parte de la nota:
   ```
   Hoy estudié #cálculo y resolví problemas de #integrales.
   También repasé #derivadas y #límites.
   ```

2. **Detección Automática:**
   - Se detectan en tiempo real mientras escribes
   - Aparecen en el **footer** de la nota con estilo visual
   ```
   🏷️ Hashtags: #cálculo #integrales #derivadas #límites
   ```

3. **Creación de Nodos:**
   - Cada hashtag crea un **nodo en el grafo**
   - Si el hashtag ya existe, lo reutiliza
   - La nota se **conecta automáticamente** al nodo del hashtag

4. **Visualización en el Grafo:**
   ```
   [Nota: Teorema Fundamental] ─────→ [#cálculo]
                             ├─────→ [#integrales]
                             ├─────→ [#derivadas]
                             └─────→ [#límites]
   ```

**Ejemplo Completo:**
```markdown
Título: Introducción al Cálculo Diferencial

Hoy aprendí sobre #derivadas y cómo se relacionan con las #tangentes.
El concepto de #límite es fundamental para entender esto.

También vi ejemplos de #optimización usando derivadas.
```

**Resultado en el Grafo:**
- ✅ Nodo: "Introducción al Cálculo Diferencial"
- ✅ Nodo: "#derivadas"
- ✅ Nodo: "#tangentes"
- ✅ Nodo: "#límite"
- ✅ Nodo: "#optimización"
- ✅ **4 enlaces automáticos** conectando la nota a cada hashtag

---

### 5️⃣ Conexiones Automáticas por Título 🔗

**Magia del Análisis de Títulos:**

El sistema analiza el título de cada nota y busca **palabras clave coincidentes** con otras notas.

**Algoritmo:**
1. Extrae palabras del título (>3 caracteres)
2. Ignora palabras comunes (el, la, de, etc.)
3. Compara con títulos de otras notas
4. Si encuentra **≥2 palabras en común**, crea un enlace automático

**Ejemplo:**

```
Nota A: "Teorema Fundamental del Cálculo Integral"
Nota B: "Aplicaciones del Cálculo Integral en Física"

Palabras clave en común: ["Cálculo", "Integral"] (2 coincidencias)

Resultado: ✅ Enlace automático creado
```

**Visualización en Consola:**
```
🔗 Enlace automático creado con "Aplicaciones del Cálculo Integral" (2 coincidencias)
Palabras clave: cálculo, integral
```

**Más Ejemplos:**

| Nota 1 | Nota 2 | Coincidencias | ¿Enlace? |
|--------|--------|---------------|----------|
| "Derivadas Parciales" | "Derivadas Totales" | derivadas (1) | ❌ (necesita ≥2) |
| "Integrales Definidas" | "Integrales Indefinidas" | integrales (1) | ❌ |
| "Teorema de Green" | "Teorema de Stokes" | teorema (1) | ❌ |
| "Ecuaciones Diferenciales Ordinarias" | "Ecuaciones Diferenciales Parciales" | ecuaciones, diferenciales (2) | ✅ |
| "Álgebra Lineal Básica" | "Álgebra Lineal Avanzada" | álgebra, lineal (2) | ✅ |

---

## 🎨 Estética y UX

### Colores y Estilos

**Paleta Neón/Morada:**
```css
Background: #111827 (gray-900)
Bordes: #A855F7/30 (purple-500 con transparencia)
Gradientes: from-purple-900 to-pink-900
Texto: #E9D5FF (purple-100)
Links: #C084FC (purple-400)
Hashtags: #F9A8D4 (pink-300)
```

**Estados Visuales:**

1. **Guardando:**
   ```
   🟣 Guardando... (punto púrpura pulsante)
   ```

2. **Guardado:**
   ```
   🟢 Guardado 1:08:46 (punto verde + timestamp)
   ```

3. **Subiendo Imagen:**
   ```
   🔵 Subiendo imagen... (spinner azul)
   ```

4. **Hashtags Detectados:**
   ```
   🏷️ 3 hashtags (badge rosa con contador)
   ```

### Animaciones

- **Hover en botones:** Escala 1.05 + cambio de color
- **Dropdown:** Slide down con ease-in-out
- **Guardando:** Pulse suave en el indicador
- **Subiendo imagen:** Spinner rotativo

---

## 📊 Integración con el Grafo

### Cómo Aparecen las Notas en el Grafo

1. **Nodos de Notas:**
   - Color: Según la materia asociada (o gris si no tiene)
   - Tamaño: Proporcional al tiempo Pomodoro (si está asociada a sesiones)
   - Etiqueta: Título de la nota

2. **Nodos de Hashtags:**
   - Color: Rosa (#F9A8D4)
   - Ícono: # visible
   - Etiqueta: #nombre del tag

3. **Enlaces:**
   - **Hashtag → Nota:** Línea rosa con grosor según frecuencia
   - **Nota → Nota:** Línea púrpura con grosor según peso
   - **Nota → Materia:** Línea con color de la materia

### Ejemplo de Grafo

```
                 [#cálculo]
                    ↓  ↑
    [Materia: Cálculo Integral]
           ↓         ↓          ↓
    [Nota 1]  ←→  [Nota 2]  ←→  [Nota 3]
       ↓                           ↓
   [#derivadas]              [#integrales]
```

---

## 🚀 Flujo de Trabajo Recomendado

### Caso de Uso 1: Tomar Apuntes de Clase

```
1. Crear nueva nota
2. Escribir título: "Clase 5: Derivadas Parciales"
3. Vincular a materia: Cálculo Multivariable
4. Escribir contenido con hashtags:
   "Hoy vimos #derivadas parciales aplicadas a funciones de varias variables.

   Fórmula principal: $\frac{\partial f}{\partial x}$

   Relación con #gradientes y #planos tangentes."

5. Insertar imagen del pizarrón (arrastrar foto)
6. Auto-guardado: ✓ Guardado 10:45:23
```

**Resultado:**
- ✅ Nota vinculada a "Cálculo Multivariable"
- ✅ 3 nodos de hashtag creados
- ✅ Fórmula renderizada con KaTeX
- ✅ Imagen del pizarrón almacenada
- ✅ Conexiones automáticas con otras notas sobre derivadas

---

### Caso de Uso 2: Resumir un Libro

```
1. Título: "Resumen Capítulo 3: Integrales Definidas"
2. Vincular a: Cálculo I
3. Contenido:
   "El #teorema fundamental del #cálculo conecta derivadas e integrales.

   $\int_{a}^{b} f(x) dx = F(b) - F(a)$

   Aplicaciones en #física y #geometría."

4. Agregar imagen: diagrama del libro (pegar desde portapapeles)
```

**Resultado:**
- ✅ Enlace automático con "Teorema Fundamental" (si existe)
- ✅ 4 hashtags detectados y vinculados
- ✅ Fórmula matemática profesional
- ✅ Diagrama almacenado

---

### Caso de Uso 3: Conectar Conceptos

```
Tienes 3 notas:
- "Ecuaciones Diferenciales Ordinarias"
- "Ecuaciones Diferenciales Parciales"
- "Métodos Numéricos para EDOs"

Al crear la tercera, el sistema detecta:
🔗 2 palabras clave con "Ecuaciones Diferenciales Ordinarias"
🔗 Enlace automático creado

Resultado: Las 3 notas quedan conectadas en el grafo
```

---

## 🎯 Consejos y Mejores Prácticas

### Para Hashtags

✅ **Hazlo:**
- Usa hashtags consistentes: `#cálculo` siempre en minúscula
- Hashtags descriptivos: `#integración_por_partes`
- Múltiples hashtags por nota (3-5 ideal)

❌ **Evita:**
- Hashtags muy generales: `#matemáticas`
- Inconsistencia: `#Calculo` vs `#cálculo` vs `#CALCULO`
- Demasiados hashtags (>10 por nota)

### Para Títulos

✅ **Hazlo:**
- Títulos descriptivos: "Teorema de Green y sus Aplicaciones"
- Incluir palabras clave del tema
- Longitud media (3-8 palabras)

❌ **Evita:**
- Títulos vagos: "Apuntes 1", "Notas varias"
- Solo fechas: "2024-01-21"
- Muy largos (>15 palabras)

### Para Fórmulas

✅ **Hazlo:**
- Numerar ecuaciones importantes
- Explicar variables después de la fórmula
- Usar `\frac` para fracciones: `\frac{numerador}{denominador}`

❌ **Evita:**
- Fórmulas sin contexto
- Usar `/` en lugar de `\frac`: `a/b` vs `\frac{a}{b}`
- Omitir paréntesis: `{}`

---

## 🔍 Solución de Problemas

### La imagen no se carga

**Problema:** Spinner azul infinito

**Solución:**
1. Verifica que la imagen sea <5MB
2. Formatos soportados: JPG, PNG, GIF, WebP
3. Recarga la página si persiste

---

### Los hashtags no aparecen en el footer

**Problema:** Escribí `#tema` pero no aparece abajo

**Solución:**
1. Verifica que uses `#` seguido de letras/números (sin espacios)
2. Guarda la nota (auto-guardado cada 3 segundos)
3. Los hashtags aparecen en tiempo real, espera 1 segundo

---

### La fórmula LaTeX no se renderiza

**Problema:** Aparece el código LaTeX en lugar de la fórmula

**Solución:**
1. Verifica que la sintaxis LaTeX sea correcta
2. Usa `$formula$` para inline o `$$formula$$` para bloque
3. Prueba con fórmulas simples primero: `$E = mc^2$`

---

### No se crean enlaces automáticos

**Problema:** Tengo notas similares pero no se conectan

**Solución:**
1. Verifica que tengan ≥2 palabras clave en común
2. Las palabras deben tener >3 caracteres
3. Palabras comunes (el, la, de) no cuentan
4. Revisa la consola: `🔗 Enlace automático creado...`

---

## 📈 Próximas Mejoras Planeadas

🔮 **Roadmap:**

- [ ] Links como tarjetas visuales (preview de URL)
- [ ] @ menciones a otras notas/personas
- [ ] Templates de notas (plantillas pre-definidas)
- [ ] Exportar nota a PDF/Markdown
- [ ] Búsqueda en tiempo real mientras escribes
- [ ] Sugerencias de hashtags basadas en contenido
- [ ] Mapa mental visual del grafo por nota

---

## ✅ Checklist de Funcionalidades

Verifica que todo funcione:

- [ ] ✅ Crear nota nueva
- [ ] ✅ Escribir título
- [ ] ✅ Vincular a materia desde dropdown
- [ ] ✅ Escribir contenido con formato (negrita, cursiva)
- [ ] ✅ Arrastrar imagen al editor
- [ ] ✅ Pegar imagen desde portapapeles
- [ ] ✅ Insertar fórmula LaTeX
- [ ] ✅ Escribir hashtags y verlos en footer
- [ ] ✅ Ver indicador "Guardando..."
- [ ] ✅ Ver indicador "Guardado HH:MM:SS"
- [ ] ✅ Verificar en consola: `🔗 Enlace automático creado`
- [ ] ✅ Verificar en consola: `🏷️ Nodo de hashtag creado`
- [ ] ✅ Abrir vista Grafo y ver la nota conectada
- [ ] ✅ Ver nodos de hashtags en el grafo (color rosa)

---

**¡Disfruta tu nuevo editor potenciado!** 🎉

Si tienes dudas o ideas de mejora, ¡házmelo saber! 🚀
