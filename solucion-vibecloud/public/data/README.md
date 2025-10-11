# Mapeo de Múltiples Ubicaciones en Leaflet

## 📍 Descripción
Este componente permite renderizar hasta 1000+ círculos en un mapa de Leaflet basándose en datos de un archivo JSON con coordenadas.

## 🚀 Uso

### Opción 1: Usar el archivo JSON de ejemplo
El componente ya está configurado para cargar `/public/data/locations.json` automáticamente.

### Opción 2: Generar 1000 ubicaciones aleatorias
```bash
cd public/data
python generate_locations.py
```
Esto creará un archivo `locations_1000.json` con 1000 ubicaciones.

Luego actualiza la ruta en MapPage.tsx:
```typescript
fetch('/data/locations_1000.json')
```

### Opción 3: Usar datos hardcodeados (para testing rápido)
En MapPage.tsx, comenta el fetch y descomenta el código de dummyData:
```typescript
// fetch('/data/locations.json')
//     .then(response => response.json())
//     .then(data => setLocations(data))
//     .catch(error => console.error('Error cargando ubicaciones:', error))

const dummyData = Array.from({ length: 1000 }, (_, i) => ({
    lat: 40.714 + (Math.random() - 0.5) * 0.5,
    lon: -74.006 + (Math.random() - 0.5) * 0.5,
    name: `Location ${i}`,
    value: Math.random() * 100
}))
setLocations(dummyData)
```

## 📋 Formato del JSON

Tu archivo JSON debe tener esta estructura:

```json
[
  {
    "lat": 40.7128,
    "lon": -74.0060,
    "name": "New York City",
    "value": 95.5
  },
  {
    "lat": 40.7589,
    "lon": -73.9851,
    "name": "Times Square",
    "value": 87.3
  }
  // ... más ubicaciones
]
```

### Campos requeridos:
- `lat`: Latitud (número)
- `lon`: Longitud (número)

### Campos opcionales:
- `name`: Nombre del lugar (string)
- `value`: Valor asociado (número)
- Puedes agregar más campos personalizados

## 🎨 Personalización

### Cambiar el color de los círculos:
```typescript
<CircleMarker
    pathOptions={{ 
        color: 'red',           // Color del borde
        fillColor: '#ff0000',   // Color de relleno
        fillOpacity: 0.6,       // Opacidad (0-1)
        weight: 1               // Grosor del borde
    }}
/>
```

### Cambiar el tamaño de los círculos:
```typescript
<CircleMarker
    radius={10}  // Radio en píxeles
/>
```

### Colorear según valor:
```typescript
pathOptions={{ 
    fillColor: location.value > 50 ? '#ff0000' : '#0000ff',
    fillOpacity: location.value / 100
}}
```

## ⚡ Rendimiento

- ✅ **Hasta 1000 puntos**: Funciona perfectamente
- ⚠️ **1000-5000 puntos**: Puede haber lag al hacer zoom
- ❌ **5000+ puntos**: Considera usar clustering (react-leaflet-cluster)

### Optimización para muchos puntos:
```bash
npm install react-leaflet-cluster
```

## 🗺️ Control de Capas

El componente usa `LayersControl` para que puedas activar/desactivar las capas:
- **Data Points**: Tus ubicaciones del JSON
- **Traffic Layer**: Ejemplo de capa adicional
- **Prices Heatmap**: Ejemplo de capa adicional
- **Tips Layer**: Ejemplo de capa adicional

## 🔧 Troubleshooting

### Los círculos no aparecen:
1. Verifica que el archivo JSON existe en `/public/data/`
2. Abre la consola del navegador y busca errores
3. Verifica que las coordenadas estén en el rango visible del mapa

### El mapa no se actualiza al redimensionar:
El componente ya incluye `MapResizeHandler` que soluciona esto automáticamente.

### Performance lento:
- Reduce el número de puntos
- Usa `CircleMarker` en vez de `Circle` (más eficiente)
- Implementa clustering
