# 🗺️ Agregar Coordenadas a Ciudades

## 📋 Descripción
Script que busca automáticamente las coordenadas (latitud y longitud) de cada ciudad en el JSON de tráfico usando la API gratuita de OpenStreetMap (Nominatim).

## 🚀 Uso

### 1. Instalar dependencia
```bash
pip install geopy
```

### 2. Ejecutar el script
```bash
python add_coordinates.py
```

### 3. Esperar
⏱️ **Tiempo estimado**: ~7 minutos para 387 ciudades
- La API gratuita tiene límite de 1 request por segundo
- El script hace una pausa de 1.1 segundos entre cada ciudad

## 📊 Proceso

El script:
1. ✅ Lee `traffic_averagest.json`
2. 🔍 Para cada ciudad, busca sus coordenadas en OpenStreetMap
3. 📝 Agrega `lat` y `lon` al JSON
4. 💾 Guarda todo en `traffic_with_coordinates.json`

## 📝 Formato del JSON resultante

```json
[
  {
    "country": "TUR",
    "city": "istanbul",
    "lat": 41.0082,
    "lon": 28.9784,
    "average_delay": 2.3187
  }
]
```

## ⚠️ Notas importantes

### Ciudades no encontradas
Algunas ciudades pueden no encontrarse si:
- El nombre está mal escrito
- El formato con guiones no coincide (ej: `new-york` vs `New York`)
- La ciudad es muy pequeña

En estos casos, el script guarda:
```json
{
  "lat": null,
  "lon": null
}
```

### Límites de la API
- **Máximo**: 1 request por segundo
- **No requiere API key** (servicio gratuito)
- **Puede fallar** si hay muchos requests en poco tiempo

### Mejoras si hay errores
Si algunas ciudades no se encuentran, puedes:
1. Editar el script para buscar manualmente esas ciudades
2. Usar una API de pago (Google Maps, Mapbox)
3. Crear un archivo CSV manual con las coordenadas

## 🔧 Solución de problemas

### Error: ModuleNotFoundError: No module named 'geopy'
```bash
pip install geopy
```

### Error: GeocoderTimedOut
- La API está tardando mucho
- El script reintentará automáticamente
- Aumenta el timeout en el código: `timeout=20`

### Muchas ciudades no encontradas
Edita el script y cambia la línea:
```python
location = geolocator.geocode(f"{city_formatted}, {country}", timeout=10)
```

Por una más específica:
```python
# Agregar más contexto
location = geolocator.geocode(f"{city_formatted} city, {country}", timeout=10)
```

## 💡 Tips

1. **No ejecutar múltiples veces seguidas**: Respeta el límite de la API
2. **Verificar resultados**: Revisa que las coordenadas sean correctas
3. **Backup**: Guarda una copia de `traffic_averagest.json` antes de ejecutar

## 🗺️ Uso en el mapa de Leaflet

Una vez generado `traffic_with_coordinates.json`, puedes usarlo directamente en MapPage.tsx:

```typescript
fetch('/data/traffic_with_coordinates.json')
    .then(response => response.json())
    .then(data => setLocations(data))
```

Y renderizar así:
```typescript
{locations.map((location, index) => (
    location.lat && location.lon && (
        <Circle
            key={index}
            center={[location.lat, location.lon]}
            radius={location.average_delay * 100}
            pathOptions={{
                color: location.average_delay > 1 ? 'red' : 'green',
                fillOpacity: 0.4
            }}
        >
            <Popup>
                <strong>{location.city}</strong>
                <p>Delay: {location.average_delay.toFixed(2)} min</p>
            </Popup>
        </Circle>
    )
))}
```
