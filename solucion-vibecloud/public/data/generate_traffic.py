"""
Script para calcular el promedio de minutos de tráfico por ciudad desde un CSV
y generar un archivo JSON con los resultados
"""
import csv
import json
from collections import defaultdict

# Nombre del archivo CSV de entrada
INPUT_CSV = r'C:\Users\HP\OneDrive\Escritorio\DataRushPractice\my-app\database\Traffic.csv'
OUTPUT_JSON = r'C:\Users\HP\OneDrive\Escritorio\DataRushPractice\my-app\public\data\traffic_averagest.json'


def calculate_city_averages(csv_file):
    """
    Lee un CSV con Country, City, MinsDelay y calcula el promedio por ciudad
    """
    # Diccionario para acumular los datos por ciudad
    city_data = defaultdict(
        lambda: {'country': '', 'total': 0, 'count': 0, 'delays': []})

    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            for row in reader:
                country = row['Country']
                city = row['City']
                mins_delay = float(row['MinsDelay'])

                # Usamos la combinación de país y ciudad como clave única
                key = f"{country}_{city}"

                city_data[key]['country'] = country
                city_data[key]['total'] += mins_delay
                city_data[key]['count'] += 1
                city_data[key]['delays'].append(mins_delay)

        # Calcular promedios
        results = []
        for key, data in city_data.items():
            country, city = key.split('_', 1)
            average = data['total'] / data['count'] if data['count'] > 0 else 0

            results.append({
                'country': data['country'],
                'city': city,
                'average_delay': round(average, 4)
            })

        # Ordenar por promedio de delay (de mayor a menor)
        results.sort(key=lambda x: x['average_delay'], reverse=True)

        return results

    except FileNotFoundError:
        print(f"❌ Error: No se encontró el archivo '{csv_file}'")
        print("📝 Por favor, asegúrate de que el archivo existe en esta carpeta")
        return []
    except KeyError as e:
        print(f"❌ Error: Falta la columna {e} en el CSV")
        print("📝 El CSV debe tener las columnas: Country, City, MinsDelay")
        return []
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return []


def main():
    print(f"🔄 Procesando archivo '{INPUT_CSV}'...")

    results = calculate_city_averages(INPUT_CSV)

    if results:
        # Guardar en JSON
        with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        print(f"\n✅ Procesamiento completado!")
        print(f"📊 Total de ciudades: {len(results)}")
        print(f"💾 Resultados guardados en '{OUTPUT_JSON}'")

        # Mostrar top 10 ciudades con más tráfico
        print("\n🚦 Top 10 ciudades con más delay promedio:")
        print("-" * 70)
        print(f"{'País':<15} {'Ciudad':<25} {'Delay Promedio':>15}")
        print("-" * 70)
        for i, city in enumerate(results[:10], 1):
            print(
                f"{city['country']:<15} {city['city']:<25} {city['average_delay']:>15.2f} mins")

        # Mostrar top 10 ciudades con menos tráfico
        print("\n✅ Top 10 ciudades con menos delay promedio:")
        print("-" * 70)
        print(f"{'País':<15} {'Ciudad':<25} {'Delay Promedio':>15}")
        print("-" * 70)
        for i, city in enumerate(results[-10:], 1):
            print(
                f"{city['country']:<15} {city['city']:<25} {city['average_delay']:>15.2f} mins")
    else:
        print("\n❌ No se pudo procesar el archivo")


if __name__ == "__main__":
    main()
