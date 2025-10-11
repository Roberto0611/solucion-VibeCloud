import React from 'react'

// Lista de archivos JSON que vamos a poner-
//  Tienen que ser lo mismo pero con diferentes datos, para no errores.
//  Están en resources/DatosJSON

const files = [
    'csvjson2000.json',
    'csvjson2005.json',
    'csvjson2010.json',
    'csvjson2015.json',
    'csvjson2020.json'
]

//Componente que cargaremos, el principal
const Prueba = () => {
    // Estado del select: archivo seleccionado
    const [selected, setSelected] = React.useState(files[0])
    // data: JSON cargado del archivo seleccionado
    const [data, setData] = React.useState<any>(null)
    // loading / error: control visual y manejo de fallos
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    // Whitelist: columnas que el desarrollador quiere VER y USAR.
    // Sólo los campos listados aquí se conservarán en los objetos que se guardan en `data`.
    // Edita esta lista para indicar las claves que te interesan.
    const defaultIncluded = ['Name', 'Pop', "PWC_Lat", "PWC_Lon"]
    const includedColumns = React.useMemo(() => defaultIncluded.map(s => s.trim()).filter(Boolean), [])

    // Efecto: cada vez que cambia `selected` volvemos a cargar el archivo.
    // Usamos import.meta.url y new URL(...) para resolver la ruta relativa
    // de forma compatible con Vite (y para que los assets se sirvan correctamente).
    React.useEffect(() => {
        let mounted = true
        const load = async () => {
            setLoading(true)
            setError(null)
            setData(null)
            try {
                // Resolve URL relative to this module so Vite bundles/serves it correctly
                // ../DatosJSON/<file> because este archivo está en resources/js/pages
                const url = new URL(`../DatosJSON/${selected}`, import.meta.url).href
                const res = await fetch(url)
                // Si el servidor devuelve un error HTTP lo transformamos en excepción
                if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
                const json = await res.json()
                // Si el JSON es un array de objetos y hemos definido una whitelist (includedColumns),
                // normalizamos los objetos para mantener sólo las claves incluidas. Así el filtrado
                // no es sólo visual: `data` contendrá únicamente las columnas que tú quieres usar.
                let final = json
                if (Array.isArray(json)) {
                    // Detectar si es array de objetos
                    const firstObj = json.find((d: any) => d && typeof d === 'object' && !Array.isArray(d))
                    if (firstObj && includedColumns.length > 0) {
                        final = json.map((row: any) => {
                            const obj: any = {}
                            includedColumns.forEach((k: string) => {
                                // Copiamos sólo si existe la clave; si no, queda undefined
                                obj[k] = row[k]
                            })
                            return obj
                        })
                    }
                }
                // Guardamos los datos filtrados sólo si el componente sigue montado
                if (mounted) setData(final)
            } catch (err: any) {
                // Registrar en consola y mostrar en la UI
                console.error('Error cargando JSON', err)
                if (mounted) setError(String(err))
            } finally {
                if (mounted) setLoading(false)
            }
        }
        load()
        // Clean-up: evitamos setState si el componente se desmonta antes de que acabe el fetch
        return () => { mounted = false }
    }, [selected])

    // renderPreview: función que decide cómo mostrar el JSON cargado
    // - Si es un array de objetos: genera una tabla con las columnas basadas en la primera fila
    // - Si es un array de valores no-objeto: muestra los primeros 50 elementos como JSON
    // - Si es un objeto: pretty print
    const renderPreview = () => {
        if (!data) return null
        if (Array.isArray(data)) {
            // If array of objects, render a simple table header from keys
            const first = data.find((d: any) => d && typeof d === 'object') || data[0]
            if (first && typeof first === 'object' && !Array.isArray(first)) {
                // Decide columnas a mostrar:
                // - Si se definió una whitelist (`includedColumns`) la usamos
                // - Si no, derivamos las columnas de la primera fila
                const cols = (includedColumns && includedColumns.length > 0) ? includedColumns : Object.keys(first)
                return (
                    <div style={{ overflow: 'auto', maxHeight: 400 }}>
                        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                            <thead>
                                <tr>
                                    {cols.map(c => <th key={c} style={{ border: '1px solid #ddd', padding: 6, textAlign: 'left' }}>{c}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {data.slice(0, 50).map((row: any, i: number) => (
                                    <tr key={i}>
                                        {cols.map(c => <td key={c} style={{ border: '1px solid #eee', padding: 6 }}>{String(row[c] ?? '')}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            }
            // Otherwise, show first 50 rows as JSON
            return <pre style={{ maxHeight: 400, overflow: 'auto' }}>{JSON.stringify(data.slice(0, 50), null, 2)}</pre>
        }
        // If object, pretty print
        return <pre style={{ maxHeight: 400, overflow: 'auto' }}>{JSON.stringify(data, null, 2)}</pre>
    }

    return (
        <div style={{ padding: 20 }}>
            {/* Título de la página de prueba */}
            <h2>Probar JSONs</h2>

            {/* Selector de archivos. Cambiar `selected` fuerza recarga por el useEffect */}
            <div style={{ marginBottom: 12 }}>
                <label>Archivo: </label>
                <select value={selected} onChange={e => setSelected(e.target.value)}>
                    {files.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
            </div>

            {/* Columnas ocultas (definidas por el desarrollador): {defaultExcluded.join(', ')} */}
            {/* Columnas incluidas / whitelist (definidas por el desarrollador): {includedColumns.join(', ')} */}

            {/* Estado: muestra carga / error / número de elementos cargados */}
            <div style={{ marginBottom: 12 }}>
                <strong>Estado:</strong> {loading ? 'Cargando...' : error ? `Error: ${error}` : data ? `Cargado (${Array.isArray(data) ? data.length : Object.keys(data).length} elementos)` : '—'}
            </div>

            {/* Previsualización inteligente del JSON */}
            {renderPreview()}

            {/* Detalle completo: muestra el JSON completo si quieres inspeccionarlo */}
            <div style={{ marginTop: 12 }}>
                <details>
                    <summary>Ver JSON completo</summary>
                    <pre style={{ maxHeight: 400, overflow: 'auto' }}>{data ? JSON.stringify(data, null, 2) : 'No hay datos'}</pre>
                </details>
            </div>
        </div>
    )
}

export default Prueba
