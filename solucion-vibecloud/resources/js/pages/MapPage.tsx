

// dependencies
//npm install react@rc react-dom@rc leaflet
//npm install react-leaflet@next
//npm install -D @types/leaflet
//npm install proj4


import React, { useEffect, useState } from 'react'
import {
    MapContainer,
    TileLayer,
    useMap,
    Circle,
    LayersControl,
    LayerGroup,
    GeoJSON
} from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import L from 'leaflet'
import proj4 from 'proj4'
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

interface LocationData {
    lat: number
    lon: number
    name?: string
    value?: number
}

// Helper: convert NY State Plane (EPSG:2263) -> WGS84 (EPSG:4326) using proj4
function mercatorToLatLng(x: number, y: number) {
    // EPSG:2263 - NAD83 / New York Long Island (ftUS)
    const epsg2263 = '+proj=lcc +lat_1=41.03333333333333 +lat_2=40.66666666666666 +lat_0=40.16666666666666 +lon_0=-74 +x_0=300000.0000000001 +y_0=0 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs'
    const epsg4326 = '+proj=longlat +datum=WGS84 +no_defs'
    const [lon, lat] = proj4(epsg2263, epsg4326, [x, y])
    return [lat, lon] // Leaflet expects [lat, lon]
}

function transformCoordsRecursively(coords: any, isProjected: boolean): any {
    if (!isProjected) return coords

    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        const [lat, lon] = mercatorToLatLng(coords[0], coords[1])
        return [lon, lat] // GeoJSON expects [lon, lat]
    }

    return coords.map((c: any) => transformCoordsRecursively(c, isProjected))
}

function normalizeGeoJSON(gj: any): any {
    if (!gj || !gj.features || !Array.isArray(gj.features)) return gj

    // try to detect if coordinates look projected (very large numbers)
    const feat = gj.features[0]
    if (!feat || !feat.geometry || !feat.geometry.coordinates) return gj

    const sampleCoords = feat.geometry.coordinates
    // dig into first numeric pair
    let samplePair: any = null
    const findPair = (c: any): any => {
        if (!c) return null
        if (typeof c[0] === 'number' && typeof c[1] === 'number') return c
        for (const v of c) {
            const p = findPair(v)
            if (p) return p
        }
        return null
    }
    samplePair = findPair(sampleCoords)
    const isProjected = samplePair && (Math.abs(samplePair[0]) > 360 || Math.abs(samplePair[1]) > 90)

    if (!isProjected) return gj

    // transform all features
    const newGj = JSON.parse(JSON.stringify(gj))
    newGj.features = newGj.features.map((f: any) => {
        if (!f.geometry || !f.geometry.coordinates) return f
        f.geometry.coordinates = transformCoordsRecursively(f.geometry.coordinates, true)
        return f
    })
    return newGj
}

function FitToGeoJson({ geo }: { geo: any }) {
    const map = useMap()
    useEffect(() => {
        if (!geo) return
        try {
            const layer = L.geoJSON(geo)
            const bounds = layer.getBounds()
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] })
            }
        } catch (e) {
            console.error('FitToGeoJson error', e)
        }
    }, [geo, map])
    return null
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'MapCloud', href: '/map' },
]

export default function MapPage() {
    const [locations, setLocations] = useState<LocationData[]>([])
    const [zones, setZones] = useState<any>(null)

    useEffect(() => {
        fetch('/data/locations.json')
            .then(r => r.json())
            .then(data => setLocations(data))
            .catch(err => console.error('Error cargando ubicaciones:', err))

        // load taxi zones GeoJSON (put taxi_zones.json into public/data/)
        fetch('/data/taxi_zones.json')
            .then(r => r.json())
            .then((gj) => {
                const normalized = normalizeGeoJSON(gj)
                setZones(normalized)
            })
            .catch(err => console.error('Error cargando taxi_zones.json:', err))
    }, [])

    const zoneStyle = (feature: any) => {
        // color by borough or default
        const borough = feature?.properties?.borough || ''
        const colorMap: Record<string, string> = {
            'Manhattan': '#f87171',
            'Brooklyn': '#60a5fa',
            'Queens': '#34d399',
            'Bronx': '#fbbf24',
            'Staten Island': '#a78bfa'
        }
        const color = colorMap[borough] ?? '#8884d8'
        return {
            color,
            weight: 1,
            fillOpacity: 0.25
        }
    }

    const onEachZone = (feature: any, layer: L.Layer) => {
        const name = feature?.properties?.zone || feature?.properties?.zone_name || 'Zone'
        const borough = feature?.properties?.borough || feature?.properties?.Borough || ''
        layer.bindPopup(`<strong>${name}</strong><br/>${borough}`)
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Map" />
            <ResizablePanelGroup direction="horizontal" style={{ height: "100%" }}>
                <ResizablePanel defaultSize={29}>
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
                    <div style={{ position: "relative", height: "100%", width: "100%" }}>
                        <MapContainer
                            center={[40.7128, -74.0060]}
                            zoom={11}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />

                            <LayersControl position="topright" >
                                <LayersControl.Overlay name="Data Points" >
                                    <LayerGroup>
                                        {locations.map((location, index) => (
                                            <Circle
                                                key={index}
                                                center={[location.lat, location.lon]}
                                                radius={200}
                                                pathOptions={{
                                                    color: 'green',
                                                    fillColor: 'green',
                                                    fillOpacity: 0.6,
                                                    weight: 1
                                                }}
                                            >
                                            </Circle>
                                        ))}
                                    </LayerGroup>
                                </LayersControl.Overlay>

                                <LayersControl.Overlay name="Traffic Layer">
                                    <Circle center={[40.714, -74.006]} pathOptions={{ color: 'red' }} radius={200} />
                                </LayersControl.Overlay>

                                <LayersControl.Overlay name="Prices Heatmap">
                                    <Circle center={[40.714, -74.006]} pathOptions={{ color: 'green' }} radius={400} />
                                </LayersControl.Overlay>

                                <LayersControl.Overlay checked name="Taxi Zones (GeoJSON)">
                                    <LayerGroup>
                                        {zones && (
                                            <>
                                                <GeoJSON data={zones} style={zoneStyle} onEachFeature={onEachZone} />
                                                {/* <FitToGeoJson geo={zones} /> */}
                                            </>
                                        )}
                                        {!zones && <div style={{ padding: 8, color: '#fff' }}>Cargando polígonos...</div>}
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