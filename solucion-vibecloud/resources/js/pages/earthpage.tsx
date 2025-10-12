import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'  // Contenedor 3D
import Earth from './earth'  // Componente de la Tierra con texturas reales
import { getDensityDescriptors } from '../processfetch'


type HomePageProps = {
    selectedDataset?: string;
}

const EarthPage: React.FC<HomePageProps> = ({ selectedDataset: propSelectedDataset }) => {
    const [selectedDataset, setSelectedDataset] = React.useState(propSelectedDataset || "/data/traffic_with_coordinates.json")
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
        setLoadingMarkers(true)

        // Call getDensityDescriptors with the URL
        getDensityDescriptors({ url: selectedDataset })
            .then(descriptors => {
                console.log('Descriptores cargados:', descriptors && descriptors.length)
                if (!cancelled) {
                    setMarkers(descriptors);
                }
            })
            .catch(err => {
                console.error('Problema cargando descriptores:', err)
                if (!cancelled) {
                    setMarkers([])
                    setMarkersError(String(err))
                }
            })
            .finally(() => {
                if (!cancelled) setLoadingMarkers(false)
            });

        return () => { cancelled = true }
    }, [selectedDataset])

    return (
        <Suspense fallback={null}>
            <div style={{
                width: '100%',      // Ancho completo del viewport
                height: '100%',     // Alto completo del viewport
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

export default EarthPage;
