

// dependencies
//npm install react@rc react-dom@rc leaflet
//npm install react-leaflet@next
//npm install -D @types/leaflet


import React, { useRef, useEffect, useState } from 'react'
import {
    MapContainer,
    TileLayer,
    useMap,
    Marker,
    Popup,
    CircleMarker,
    Circle,
    LayersControl,
    LayerGroup
} from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import { Icon } from 'leaflet'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { type BreadcrumbItem } from '@/types'
import ResponsiveLoc from './Responsive/ResponsiveLocation.tsx/ResponsiveLoc'
import ResponsiveTi from './Responsive/ResponsiveTime.tsx/ResponsiveTi'
import { Button } from '@/components/ui/button'
import { Calendar24 } from './CalendarPrime'
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"

// Tipo para las ubicaciones del JSON
interface LocationData {
    lat: number
    lon: number
    name?: string
    value?: number
    // Agrega más campos según necesites
}

// Esto es para que se actualice el mapa al redimensionar el panel 
// porque por defecto no lo hace y se quedaba blanco X_X
function MapResizeHandler() {
    const map = useMap()

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            map.invalidateSize()
        })

        const container = map.getContainer()
        resizeObserver.observe(container)

        return () => {
            resizeObserver.disconnect()
        }
    }, [map])

    return null
}

const redOptions = { color: 'red' }
const blackOptions = { color: 'black' }
const purpleOptions = { color: 'purple' }
const greenOptions = { color: 'green' }
const yellowOptions = { color: 'yellow' }


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'MapCloud',
        href: '/map',
    },
]

export default function MapPage() {
    // Estado para guardar las ubicaciones del JSON
    const [locations, setLocations] = useState<LocationData[]>([])

    // useEffect para cargar el JSON cuando se monta el componente
    useEffect(() => {
        //Cargar desde un archivo JSON en public/
        fetch('/data/locations.json')
            .then(response => response.json())
            .then(data => setLocations(data))
            .catch(error => console.error('Error cargando ubicaciones:', error))

    }, [])

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Map" />
            <ResizablePanelGroup direction="horizontal" style={{ height: "100%" }}>
                <ResizablePanel defaultSize={29}>
                    {/* Columna izquierda: Formulario */}
                    <div style={{ padding: "20px", height: "100%" }} className='bg-background'>
                        <h1 style={{ fontSize: "20px", fontWeight: "bold" }} className='text-center'>Explore MapCloud</h1>
                        <br />

                        <div className="flex flex-col md:flex-row md:flex-wrap justify-center items-center gap-4">
                            <div className="flex flex-col md:flex-row md:flex-wrap justify-center items-center gap-4">
                                <Calendar24 />
                                <ResponsiveTi />
                                <ResponsiveLoc />

                            </div>
                            <div className="flex flex-col md:flex-row md:flex-wrap justify-center items-center gap-4 pt-6">
                                <Button className="mt-4 md:mt-0" size="sm">Confirm</Button>

                            </div>

                        </div>
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={71}>

                    {/* Columna derecha: Mapa */}
                    <div style={{ position: "relative", height: "100%", width: "100%" }}>
                        <MapContainer
                            center={[40.714, -74.006]}
                            zoom={12}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />
                            <MapResizeHandler />

                            <LayersControl position="topright" >

                                {/* Nueva capa: Ubicaciones desde JSON */}
                                <LayersControl.Overlay checked name="Data Points">
                                    <LayerGroup>
                                        {locations.map((location, index) => (
                                            <Circle
                                                key={index}
                                                center={[location.lat, location.lon]}
                                                radius={200}
                                                pathOptions={{
                                                    color: 'green', //Esto le pondre una funcion porque no todos van a ser verdes, estan los rojos y amarillos tambien
                                                    fillColor: 'green', //Estetica nada mas
                                                    fillOpacity: 0.6, //Estetica nada mas
                                                    weight: 1 //Este es el grosor del borde
                                                }}
                                            >
                                                {location.name && (
                                                    <Popup>
                                                        <div>
                                                            {location.value && <p>Value: {location.value.toFixed(2)}$</p>}
                                                        </div>
                                                    </Popup>
                                                )}
                                            </Circle>
                                        ))}
                                    </LayerGroup>
                                </LayersControl.Overlay>

                                <LayersControl.Overlay checked name="Traffic Layer">
                                    <Circle
                                        center={[40.714, -74.006]}
                                        pathOptions={redOptions}
                                        radius={200}
                                        bubblingMouseEvents={false}
                                    >
                                    </Circle>
                                </LayersControl.Overlay>

                                <LayersControl.Overlay checked name="Prices Heatmap">
                                    <Circle
                                        center={[40.714, -74.006]}
                                        pathOptions={greenOptions}
                                        radius={400}
                                        bubblingMouseEvents={false}
                                    >
                                    </Circle>
                                </LayersControl.Overlay>

                                <LayersControl.Overlay checked name="Tips Layer">
                                    <LayerGroup>
                                        <Circle
                                            center={[40.714, -74.006]}
                                            pathOptions={yellowOptions}
                                            radius={1000}
                                            bubblingMouseEvents={false}
                                        >
                                        </Circle>
                                    </LayerGroup>
                                </LayersControl.Overlay>
                            </LayersControl>
                        </MapContainer>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </AppLayout>
    )
}



