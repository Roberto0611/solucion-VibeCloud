import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'  // Contenedor 3D
import Earth from '../../js/pages/earth'  // Componente de la Tierra con texturas reales
import { getDensityDescriptors } from '../../js/processfetch'


type HomePageProps = {
    selectedDataset?: string;
}

const HomePage: React.FC<HomePageProps> = ({ selectedDataset: propSelectedDataset }) => {
    const [selectedDataset, setSelectedDataset] = React.useState(propSelectedDataset || '../DatosJSON/csvjson2020.json')
    const [markers, setMarkers] = React.useState<any[] | null>(null)
    const [loadingMarkers, setLoadingMarkers] = React.useState(false)
    const [markersError, setMarkersError] = React.useState<string | null>(null)

    // Update selectedDataset when prop changes
    React.useEffect(() => {
        if (propSelectedDataset) {
            setSelectedDataset(propSelectedDataset);
        }
    }, [propSelectedDataset]);

    // Load descriptors when selectedDataset changes
    React.useEffect(() => {
        let cancelled = false
        setMarkers(null)
        setMarkersError(null)
        setLoadingMarkers(true) // Indicamos que estamos cargando
        try {
            // Resolve the selectedDataset relative to this module (earthpage) so fetch path is correct
            const resolved = new URL(selectedDataset, import.meta.url).href
            console.log('Cargando', selectedDataset, 'Sin error:', resolved)
            getDensityDescriptors({ url: resolved })
                .then(list => {
                    console.log('Cargado, los datos:', list && list.length)
                    if (!cancelled) setMarkers(list)
                })
                .catch(err => {
                    console.error('Problema cargando descriptores:', err)
                    if (!cancelled) {
                        setMarkers([])
                        setMarkersError(String(err))
                    }
                }).finally(() => { if (!cancelled) setLoadingMarkers(false) })
        } catch (err) {
            console.error('Problema con la URL del dataset:', err)
            setMarkers([])
            setMarkersError(String(err))
            setLoadingMarkers(false)
        }
        return () => { cancelled = true }
    }, [selectedDataset])

    return (
        <Suspense fallback={null}>
            <div style={{
                width: '100vw',      // Ancho completo del viewport
                height: '100vh',     // Alto completo del viewport
                display: 'flex',     // Layout flexbox horizontal
                background: 'black', // Fondo negro espacial
            }}>

                <Canvas>
                    <Suspense fallback={null}>
                        <Earth datasetUrl={selectedDataset} markers={markers ?? []} />
                    </Suspense>
                </Canvas>
            </div>
        </Suspense>
    )
}

export default HomePage
