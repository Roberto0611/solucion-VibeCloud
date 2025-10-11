# 🚦 Calculador de Promedios de Tráfico

## 📋 Descripción
Script Python que procesa un CSV con datos de tráfico y calcula el promedio de minutos de delay por ciudad.

## 📁 Formato del CSV

Tu archivo CSV debe tener exactamente estas 3 columnas:

```csv
Country,City,MinsDelay
ARE,abu-dhabi,1.349
ARE,abu-dhabi,0.971
USA,new-york,5.2
USA,new-york,4.8
```

### Columnas requeridas:
- `Country`: Código o nombre del país (ej: USA, GBR, ARE)
- `City`: Nombre de la ciudad (ej: new-york, london, tokyo)
- `MinsDelay`: Minutos de delay (número decimal, puede ser negativo)

## 🚀 Uso

### 1. Preparar tu archivo CSV
Coloca tu archivo CSV en esta carpeta (`public/data/`) con el nombre `traffic_data.csv`

### 2. Ejecutar el script
```bash
cd public/data
python generate_traffic.py
```

### 3. Resultado
Se generará un archivo `traffic_averages.json` con este formato:

```json
[
  {
    "country": "USA",
    "city": "los-angeles",
    "average_delay": 7.5333,
    "total_records": 3,
    "min_delay": 6.9,
    "max_delay": 8.2
  },
  {
    "country": "USA",
    "city": "new-york",
    "average_delay": 5.0,
    "total_records": 4,
    "min_delay": 3.9,
    "max_delay": 6.1
  }
]
```

## 📊 Campos del JSON resultante

- `country`: País de la ciudad
- `city`: Nombre de la ciudad
- `average_delay`: **Promedio** de minutos de delay
- `total_records`: Cantidad de registros para esa ciudad
- `min_delay`: Delay mínimo registrado
- `max_delay`: Delay máximo registrado

## 🎯 Características

✅ Calcula el promedio por ciudad
✅ Agrupa automáticamente por país + ciudad
✅ Muestra top 10 ciudades con más tráfico
✅ Muestra top 10 ciudades con menos tráfico
✅ Incluye estadísticas (min, max, total de registros)
✅ Ordena resultados por delay promedio (mayor a menor)

## 📝 Ejemplo de salida en consola

```
🔄 Procesando archivo 'traffic_data.csv'...

✅ Procesamiento completado!
📊 Total de ciudades: 5
💾 Resultados guardados en 'traffic_averages.json'

🚦 Top 10 ciudades con más delay promedio:
----------------------------------------------------------------------
País            Ciudad                    Delay Promedio
----------------------------------------------------------------------
USA             los-angeles                         7.53 mins
USA             new-york                            5.00 mins
GBR             london                              4.83 mins
JPN             tokyo                               2.30 mins
ARE             abu-dhabi                           0.23 mins
```

## 🔧 Personalización

### Cambiar el nombre del archivo CSV de entrada:
Edita la línea 9 de `generate_traffic.py`:
```python
INPUT_CSV = 'mi_archivo_trafico.csv'
```

### Cambiar el nombre del JSON de salida:
Edita la línea 10:
```python
OUTPUT_JSON = 'mis_promedios.json'
```

## ⚠️ Manejo de errores

El script maneja automáticamente:
- ❌ Archivo CSV no encontrado
- ❌ Columnas faltantes en el CSV
- ❌ Valores no numéricos en MinsDelay
- ❌ Archivo vacío

## 💡 Tips

1. **Valores negativos**: El script acepta delays negativos (adelantos)
2. **Duplicados**: Si la misma ciudad aparece múltiples veces, se promedian todos los valores
3. **Ciudades únicas**: Se usa la combinación de País + Ciudad como identificador único
4. **Encoding**: El script soporta UTF-8 para caracteres especiales

## 🗺️ Integración con el mapa

Una vez generado el JSON, puedes usarlo en el mapa. Solo necesitas agregar las coordenadas lat/lon a cada ciudad.

Ver `generate_locations.py` para un ejemplo de cómo generar coordenadas.
