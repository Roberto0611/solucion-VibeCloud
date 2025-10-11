"""
Script para calcular el promedio de minutos de tráfico por PAÍS desde un CSV
y generar un archivo JSON con los resultados
"""
import csv
import json
from collections import defaultdict

# Nombre del archivo CSV de entrada
INPUT_CSV = r'C:\Users\HP\OneDrive\Escritorio\DataRushPractice\my-app\database\Traffic.csv'
OUTPUT_JSON = r'C:\Users\HP\OneDrive\Escritorio\DataRushPractice\my-app\public\data\traffic_by_country.json'


def calculate_country_averages(csv_file):
    """
    Lee un CSV con Country, City, MinsDelay y calcula el promedio por PAÍS
    """
    # Diccionario para acumular los datos por país
    country_data = defaultdict(lambda: {'total': 0, 'count': 0, 'delays': []})

    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            for row in reader:
                country = row['Country']
                mins_delay = float(row['MinsDelay'])

                country_data[country]['total'] += mins_delay
                country_data[country]['count'] += 1
                country_data[country]['delays'].append(mins_delay)

        # Calcular promedios
        results = []
        for country, data in country_data.items():
            average = data['total'] / data['count'] if data['count'] > 0 else 0

            results.append({
                'country': country,
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

    results = calculate_country_averages(INPUT_CSV)

    if results:
        # Guardar en JSON
        with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        print(f"\n✅ Procesamiento completado!")
        print(f"📊 Total de países: {len(results)}")
        print(f"💾 Resultados guardados en '{OUTPUT_JSON}'")

        # Mostrar top 10 países con más tráfico
        print("\n🚦 Top 10 países con más delay promedio:")
        print("-" * 50)
        print(f"{'País':<10} {'Delay Promedio':>20}")
        print("-" * 50)
        for i, country in enumerate(results[:10], 1):
            print(
                f"{country['country']:<10} {country['average_delay']:>20.4f} mins")

        # Mostrar top 10 países con menos tráfico
        print("\n✅ Top 10 países con menos delay promedio:")
        print("-" * 50)
        print(f"{'País':<10} {'Delay Promedio':>20}")
        print("-" * 50)
        for i, country in enumerate(results[-10:], 1):
            print(
                f"{country['country']:<10} {country['average_delay']:>20.4f} mins")
    else:
        print("\n❌ No se pudo procesar el archivo")


if __name__ == "__main__":
    main()
