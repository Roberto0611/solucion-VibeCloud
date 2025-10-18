# 📸 Guía de Imágenes para el README

Esta carpeta debe contener las siguientes imágenes para completar el README del Data Rush.

## ✅ Imágenes Requeridas

### 1. **Logo y Branding**

#### `logo-vibecloud.png`
- **Descripción**: Logo principal de VibeCloud/DriveCloud
- **Dimensiones**: 300x150px (aproximadamente)
- **Formato**: PNG con fondo transparente
- **Contenido sugerido**: 
  - Nombre "VibeCloud" o "DriveCloud"
  - Icono de taxi o nube
  - Colores: Azul (#3887be), negro, blanco

#### `footer-banner.png`
- **Descripción**: Banner decorativo para el footer
- **Dimensiones**: 800x200px
- **Contenido sugerido**: Skyline de NYC con taxis animados

---

### 2. **Video y Presentación**

#### `video-thumbnail.png`
- **Descripción**: Thumbnail para el video de YouTube
- **Dimensiones**: 1280x720px (16:9)
- **Contenido sugerido**:
  - Captura del mapa interactivo
  - Título: "VibeCloud - Predicción Inteligente de Tarifas NYC"
  - Logo del equipo
  - Texto: "Data Rush 2025 | 12 min"

---

### 3. **Arquitectura y Diagramas**

#### `solution-diagram.png`
- **Descripción**: Diagrama de flujo de la solución
- **Dimensiones**: 800x600px
- **Contenido**:
```
Usuario → Interfaz Web → Laravel Backend
                            ↓
                    ┌───────┴────────┐
                    ↓                ↓
              AWS Athena      AWS SageMaker
                    ↓                ↓
            Datos Históricos    Predicción ML
                    ↓                ↓
              Visualización ← Resultado
```

#### `aws-architecture.png`
- **Descripción**: Arquitectura completa de AWS
- **Dimensiones**: 900x700px
- **Contenido**:
```
┌─────────────────────────────────────────────┐
│           Frontend (React + Leaflet)        │
└────────────────┬────────────────────────────┘
                 ↓
┌────────────────────────────────────────────┐
│         Backend (Laravel 11)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │   API    │  │  Inertia │  │  Cache   │ │
│  └──────────┘  └──────────┘  └──────────┘ │
└─────┬────────────┬──────────────┬──────────┘
      ↓            ↓              ↓
┌─────────┐  ┌──────────┐  ┌────────────┐
│   S3    │  │  Athena  │  │ SageMaker  │
│  Data   │  │  Query   │  │   Model    │
└─────────┘  └──────────┘  └────────────┘
      ↓            ↓              ↓
┌─────────────────────────────────────────┐
│        AWS Open Data Registry           │
│     NYC TLC Trip Records (1.5TB)        │
└─────────────────────────────────────────┘
```

#### `scalable-architecture.png`
- **Descripción**: Arquitectura escalable con Load Balancer, Auto Scaling, etc.
- **Dimensiones**: 800x600px
- **Contenido**: Diagrama mostrando CloudFront → ALB → ECS → Microservicios

---

### 4. **Capturas de Pantalla de la Aplicación**

#### `prediction-demo.png`
- **Descripción**: Interfaz de predicción con resultados
- **Dimensiones**: 700x500px
- **Captura de**: Página principal con:
  - Selector de origen (Times Square)
  - Selector de destino (JFK Airport)
  - Fecha/hora seleccionada
  - Resultado: "$42.85" mostrado prominentemente
  - Metadata: rush hour, distance, etc.

#### `map-interface.png`
- **Descripción**: Mapa interactivo de NYC
- **Dimensiones**: 700x500px
- **Captura de**: 
  - Mapa de Leaflet con zonas de NYC coloreadas
  - Ruta dibujada entre dos puntos
  - Popup con información de zona
  - Controles de zoom visibles

#### `dashboard.png`
- **Descripción**: Dashboard analítico completo
- **Dimensiones**: 700x500px
- **Captura de**:
  - Gráfico de barras (Top zones)
  - Line chart (Trip trends)
  - Estadísticas numéricas
  - Mapa de calor

#### `ai-assistant.png`
- **Descripción**: Interfaz del asistente AI (Gemini)
- **Dimensiones**: 700x500px
- **Captura de**:
  - Chat box con pregunta del usuario
  - Respuesta formateada de Gemini
  - UI estilo moderno (burbujas de chat)

---

### 5. **Análisis y Visualizaciones**

#### `top-zones-analysis.png`
- **Descripción**: Gráfico de barras de zonas más caras
- **Dimensiones**: 700x400px
- **Contenido**:
  - Bar chart con Recharts
  - X-axis: Nombres de zonas
  - Y-axis: Precio promedio
  - Top 10 zonas destacadas

#### `temporal-patterns.png`
- **Descripción**: Gráfico de patrones por hora del día
- **Dimensiones**: 700x400px
- **Contenido**:
  - Line chart mostrando demanda por hora
  - Marcadores en rush hours (7-9 AM, 5-7 PM)
  - Colores: Rush hour en rojo, normal en azul

#### `price-distance-correlation.png`
- **Descripción**: Scatter plot de precio vs distancia
- **Dimensiones**: 700x400px
- **Contenido**:
  - Scatter chart con línea de regresión
  - X-axis: Trip distance (miles)
  - Y-axis: Total amount ($)
  - R² = 0.89 mostrado

#### `trips-by-hour.png`
- **Descripción**: Histograma de viajes por hora
- **Dimensiones**: 700x400px
- **Contenido**:
  - Histograma con 24 barras (0-23h)
  - Colores diferenciados por intensidad

#### `demand-heatmap.png`
- **Descripción**: Mapa de calor de demanda en NYC
- **Dimensiones**: 700x500px
- **Contenido**:
  - Mapa de NYC con overlay heatmap
  - Colores: Verde (baja) → Amarillo → Rojo (alta)
  - Leaflet heatmap layer

---

### 6. **Casos de Uso**

#### `use-case-1.png`
- **Descripción**: Mockup/screenshot de caso de uso del pasajero
- **Dimensiones**: 700x500px
- **Contenido**: Secuencia visual mostrando:
  1. Selección de ubicaciones
  2. Predicción mostrada
  3. Consulta a AI
  4. Sugerencia recibida

#### `use-case-2.png`
- **Descripción**: Mockup/screenshot de caso de uso del conductor
- **Dimensiones**: 700x500px
- **Contenido**:
  - Dashboard de zonas rentables
  - Mapa de calor
  - Estadísticas de ganancias

---

### 7. **Equipo**

#### `team-photo.png`
- **Descripción**: Foto del equipo
- **Dimensiones**: 600x400px
- **Contenido**: 
  - Foto grupal del equipo
  - Alternativamente: Avatares/fotos individuales en mosaico
  - Fondo profesional

---

## 🛠️ Herramientas Sugeridas para Crear Imágenes

### Para Capturas de Pantalla
1. **Windows Snipping Tool** o **Win + Shift + S**
2. **Chrome DevTools** para responsive screenshots
3. **Lightshot** (https://app.prntscr.com/)

### Para Diagramas
1. **Lucidchart** (https://lucid.app/) - Diagramas profesionales
2. **Draw.io** (https://app.diagrams.net/) - Gratis y potente
3. **Excalidraw** (https://excalidraw.com/) - Estilo sketch

### Para Gráficos
1. **Tomar screenshots** de tu aplicación corriendo
2. **Recharts** (ya implementado en tu proyecto)
3. **Chart.js** o **D3.js** para mockups

### Para Logos y Branding
1. **Canva** (https://canva.com/) - Templates de logos
2. **Figma** (https://figma.com/) - Diseño profesional
3. **Adobe Express** - Logo maker online

### Para Mockups
1. **Figma** - Diseño de UI/UX
2. **Mockflow** - Wireframes rápidos
3. **Placeit** - Mockups en contexto

---

## 📝 Consejos para Mejores Capturas

### Capturas de Pantalla de la App
```bash
1. Ejecutar la aplicación:
   cd solucion-vibecloud
   php artisan serve
   npm run dev

2. Abrir Chrome DevTools
   - F12 → Toggle Device Toolbar
   - Responsive 1920x1080

3. Para cada captura:
   - Limpiar datos de prueba
   - Usar datos realistas
   - Asegurar buena iluminación/contraste
   - Ocultar información sensible (API keys)
```

### Arquitectura AWS
```bash
1. Usar draw.io o Lucidchart
2. Iconos oficiales de AWS:
   https://aws.amazon.com/architecture/icons/

3. Colores sugeridos:
   - AWS Services: Naranja (#FF9900)
   - Frontend: Azul (#61DAFB)
   - Backend: Rojo (#FF2D20)
   - Flechas: Gris oscuro (#333)
```

### Gráficos y Visualizaciones
```bash
1. Asegurar que los ejes estén etiquetados
2. Usar paleta de colores consistente
3. Incluir leyenda si hay múltiples series
4. Exportar en alta resolución (2x)
```

---

## ✅ Checklist de Imágenes

Marca las imágenes a medida que las agregues:

- [ ] logo-vibecloud.png
- [ ] footer-banner.png
- [ ] video-thumbnail.png
- [ ] solution-diagram.png
- [ ] aws-architecture.png
- [ ] scalable-architecture.png
- [ ] prediction-demo.png
- [ ] map-interface.png
- [ ] dashboard.png
- [ ] ai-assistant.png
- [ ] top-zones-analysis.png
- [ ] temporal-patterns.png
- [ ] price-distance-correlation.png
- [ ] trips-by-hour.png
- [ ] demand-heatmap.png
- [ ] use-case-1.png
- [ ] use-case-2.png
- [ ] team-photo.png

---

## 🎨 Paleta de Colores del Proyecto

```css
/* Colores principales */
--primary-blue: #3887be;
--primary-dark: #2c5f7f;
--secondary-orange: #FF9900;

/* AWS Colors */
--aws-orange: #FF9900;
--aws-dark: #232F3E;
--aws-blue: #146EB4;

/* Semantic Colors */
--success-green: #10B981;
--warning-yellow: #F59E0B;
--error-red: #EF4444;
--info-blue: #3B82F6;

/* Neutrals */
--gray-50: #F9FAFB;
--gray-900: #111827;
```

---

## 📧 Soporte

Si tienes dudas sobre qué imágenes crear, contacta al equipo o revisa ejemplos en:
- [Lucidchart Templates](https://www.lucidchart.com/pages/templates)
- [AWS Architecture Examples](https://aws.amazon.com/architecture/)
- [Dribbble - Dashboard Inspiration](https://dribbble.com/tags/dashboard)

---

<p align="center">
  <strong>¡Buena suerte con las imágenes! 🎨</strong>
</p>
