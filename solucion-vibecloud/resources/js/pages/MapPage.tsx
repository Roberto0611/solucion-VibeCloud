// dependencies
//npm install react@rc react-dom@rc leaflet
//npm install react-leaflet@next
//npm install -D @types/leaflet
//npm install proj4
// npm install --save leaflet-routing-machine


import React, { useEffect, useState } from 'react'
import {
    MapContainer,
    TileLayer,
    useMap,
    useMapEvent,
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

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface LocationData {
    lat: number
    lon: number
    name?: string
    value?: number
}

function AddRoute({ start, end, mapboxToken, onRouteInfo }: { start: [number, number]; end: [number, number]; mapboxToken: string; onRouteInfo?: (info: any) => void }) {
    const map = useMap();

    React.useEffect(() => {
        let layer: L.GeoJSON | null = null;
        let abort = false;

        async function fetchAndDraw() {
            try {
                const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&overview=full&access_token=${mapboxToken}`;
                const res = await fetch(url);
                const json = await res.json();
                console.log('Mapbox directions response:', json);

                const routeGeo = json?.routes?.[0]?.geometry;
                if (!routeGeo || abort) return;

                // prefer creating a simple polyline from the returned geojson coordinates
                const coords = routeGeo.coordinates || []
                console.log('AddRoute: route coordinates sample:', coords?.slice?.(0, 3))

                // ensure a pane with high z-index so the route is visible above other layers
                try {
                    if (!map.getPane('routePane')) {
                        map.createPane('routePane')
                        const p = map.getPane('routePane') as HTMLElement
                        if (p) p.style.zIndex = '650'
                    }
                } catch (e) { }

                // draw as a polyline for more direct control
                const feature: GeoJSON.Feature = { type: 'Feature', geometry: routeGeo, properties: {} }
                layer = L.geoJSON(feature, {
                    pane: 'routePane',
                    style: { color: '#3887be', weight: 8, opacity: 0.98, lineCap: 'round' }
                }).addTo(map) as L.GeoJSON

                try { /* if supported bring to front */
                    if ((layer as any).bringToFront) (layer as any).bringToFront()
                } catch (e) { }

                const bounds = (layer && (layer.getBounds ? layer.getBounds() : null)) as L.LatLngBounds | null
                if (bounds && bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });
                // if parent provided a callback, send route info
                try {
                    const info = json.routes && json.routes[0]
                    console.log('AddRoute: route info distance,duration=', info?.distance, info?.duration)
                    if (onRouteInfo && info) onRouteInfo(info)
                        ; (map as any).__lastRoute = info
                } catch (e) { }
            } catch (e) {
                console.error('Error fetching/drawing route:', e);
            }
        }

        fetchAndDraw();

        return () => {
            abort = true;
            if (layer) map.removeLayer(layer);
        };
    }, [map, start, end, mapboxToken]);

    return null;
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'MapCloud', href: '/map' },
]



export default function MapPage() {

    const mapboxToken = (import.meta.env.VITE_MAPBOX_TOKEN as string) || "pk.eyJ1IjoiYWxkb2thciIsImEiOiJjbWY5MGllcmUwZDhiMmxxMzVvMHI1dXZyIn0.RA1iYVqkrsZEEqlWoy6foQ"
    const [locations, setLocations] = useState<LocationData[]>([])
    const [zones, setZones] = useState<any>(null)

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false) //Para el hover de horario 

    const [selectedDate, setSelectedDate] = React.useState<string | undefined>(undefined);
    const [selectedTime, setSelectedTime] = React.useState<string | undefined>(undefined);
    const [selectedLocationFrom, setSelectedLocationFrom] = React.useState<string | undefined>(undefined);
    const [selectedLocationTo, setSelectedLocationTo] = React.useState<string | undefined>(undefined);

    const [selectedFromCoord, setSelectedFromCoord] = useState<[number, number] | null>(null)
    const [selectedToCoord, setSelectedToCoord] = useState<[number, number] | null>(null)
    const [routeRequested, setRouteRequested] = useState(false)
    const [pendingSelection, setPendingSelection] = useState<{ coord: [number, number]; name?: string; bounds?: L.LatLngBounds } | null>(null)
    const [pendingRole, setPendingRole] = useState<'from' | 'to' | null>(null)
    const [routeInfo, setRouteInfo] = useState<any | null>(null)

    useEffect(() => {
        if (!selectedLocationFrom) return
        const found = locations.find(l => String(l.name) === String(selectedLocationFrom))
        if (found) setSelectedFromCoord([found.lon, found.lat])
    }, [selectedLocationFrom, locations])

    useEffect(() => {
        if (!selectedLocationTo) return
        const found = locations.find(l => String(l.name) === String(selectedLocationTo))
        if (found) setSelectedToCoord([found.lon, found.lat])
    }, [selectedLocationTo, locations])

    const handleLocationClick = (loc: LocationData) => {
        // loc: { lat, lon, name }
        const coord: [number, number] = [loc.lon, loc.lat] // [lng, lat]
        if (!selectedFromCoord) {
            setSelectedFromCoord(coord)
            setSelectedLocationFrom(loc.name)
            return
        }
        if (!selectedToCoord) {
            // avoid picking same as from
            const same = selectedFromCoord[0] === coord[0] && selectedFromCoord[1] === coord[1]
            if (same) {
                // if same, toggle off
                setSelectedFromCoord(coord)
                setSelectedLocationTo(undefined)
                return
            }
            setSelectedToCoord(coord)
            setSelectedLocationTo(loc.name)
            return
        }

        setSelectedFromCoord(coord)
        setSelectedLocationFrom(loc.name)
        setSelectedToCoord(null)
        setSelectedLocationTo(undefined)
    }

    //Datos que se mandan a la prediccion 
    const handleConfirm = () => {
        console.log('=== Datos de configuración manual ===');
        console.log('Fecha:', selectedDate ?? 'No seleccionada');
        console.log('Hora:', selectedTime || 'No seleccionada');
        console.log('Ubicación from:', selectedLocationFrom || 'No seleccionada');
        console.log('Ubicación to:', selectedLocationTo || 'No seleccionada');
    };

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
        // listen for clicks on the polygon and stop propagation to the map
        try {
            ; (layer as any).on('click', (e: any) => {
                try { e.originalEvent.stopPropagation() } catch (err) { }
                const lat = e.latlng?.lat
                const lng = e.latlng?.lng
                const bounds = (layer as any).getBounds ? (layer as any).getBounds() : undefined
                const mapRef = (layer as any)._map ?? undefined
                console.log('Zone clicked:', name, 'at', [lng, lat], 'bounds:', !!bounds)
                // try to zoom to bounds immediately for user feedback
                try {
                    if (bounds && mapRef) mapRef.fitBounds(bounds, { padding: [20, 20] })
                } catch (err) { }
                handleZoneClick(feature, [lng, lat], bounds, mapRef)
            })
        } catch (err) {
            // ignore if layer doesn't support events
        }
    }

    const handleZoneClick = (feature: any, coord: [number, number], bounds?: L.LatLngBounds, mapRef?: L.Map) => {
        // instead of immediately assigning, set a pending selection and zoom to the zone
        const name = feature?.properties?.zone || feature?.properties?.zone_name || 'Zone'
        const role: 'from' | 'to' = !selectedFromCoord ? 'from' : 'to'
        setPendingSelection({ coord, name, bounds })
        setPendingRole(role)
        console.log('Pending selection for', role, name, coord, 'current FROM:', selectedFromCoord, 'TO:', selectedToCoord)
        // zoom to bounds if available
        try {
            if (bounds && mapRef) mapRef.fitBounds(bounds, { padding: [20, 20] })
            else if (bounds) {
                // try to find map via bounds object
                // no-op
            }
        } catch (e) { }
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
                                <Calendar24 onDateChange={setSelectedDate} />
                                <ResponsiveTi onTimeChange={setSelectedTime} />
                                <ResponsiveLoc label="From" onLocationChange={setSelectedLocationFrom} value={selectedLocationFrom} />
                                <ResponsiveLoc label="To" onLocationChange={setSelectedLocationTo} value={selectedLocationTo} />
                            </div>
                            <div className="flex flex-col md:flex-row md:flex-wrap justify-center items-center gap-4 pt-6">
                                <Button className="mt-4 md:mt-0" size="sm" onClick={() => setIsConfirmModalOpen(true)}>Confirm</Button>
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
                                {/* <LayersControl.Overlay name="Data Points" >
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
                                                eventHandlers={{
                                                    click: (ev: L.LeafletMouseEvent) => {
                                                        // stop the click from bubbling to the map-level click handler
                                                        try { ev.originalEvent.stopPropagation() } catch (e) { }
                                                        handleLocationClick(location)
                                                    }
                                                }}
                                            >
                                            </Circle>
                                        ))}

                                        {/* mostrar indicadores de From/To 
                                        {selectedFromCoord && (
                                            <Circle
                                                center={[selectedFromCoord[1], selectedFromCoord[0]]}
                                                radius={80}
                                                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.7 }}
                                            />
                                        )}
                                        {selectedToCoord && (
                                            <Circle
                                                center={[selectedToCoord[1], selectedToCoord[0]]}
                                                radius={80}
                                                pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.7 }}
                                            />
                                        )}
                                    </LayerGroup>
                                </LayersControl.Overlay>
                                */}


                                <LayersControl.Overlay checked name="Taxi Zones (GeoJSON)">
                                    <LayerGroup>
                                        {zones && (
                                            <>
                                                <GeoJSON data={zones} style={zoneStyle} onEachFeature={(f, layer) => onEachZone(f, layer)} />
                                                {/* <FitToGeoJson geo={zones} /> */}
                                            </>
                                        )}
                                        {!zones && <div style={{ padding: 8, color: '#fff' }}>Cargando polígonos...</div>}
                                    </LayerGroup>
                                </LayersControl.Overlay>
                            </LayersControl>
                            {/* Capture clicks on the map (outside of circles) */}
                            <MapClickHandler onMapClick={(coord) => {
                                // Create a pending selection instead of assigning immediately
                                const role: 'from' | 'to' = !selectedFromCoord ? 'from' : 'to'
                                setPendingSelection({ coord, name: undefined })
                                setPendingRole(role)
                                console.log('Pending selection via map click for', role, coord)
                            }} />
                            {/* dibujar ruta solo cuando se hizo confirm y hay dos coords */}
                            {routeRequested && selectedFromCoord && selectedToCoord && (
                                <AddRoute start={selectedFromCoord} end={selectedToCoord} mapboxToken={mapboxToken} onRouteInfo={(info) => setRouteInfo(info)} />
                            )}
                        </MapContainer>
                        {/* Pending selection confirm UI (overlay) */}
                        {pendingSelection && (
                            <div style={{ position: 'absolute', right: 12, top: 12, zIndex: 9999 }}>
                                <div className="bg-background p-3 rounded shadow">
                                    <div className="text-sm font-medium">Confirm selection</div>
                                    <div className="text-xs text-muted-foreground">{pendingSelection.name}</div>
                                    <div className="text-xs mt-1">Coord: [{pendingSelection.coord[0].toFixed(6)}, {pendingSelection.coord[1].toFixed(6)}]</div>
                                    <div className="mt-2 flex gap-2">
                                        <Button size="sm" onClick={() => {
                                            const coordLabel = `${pendingSelection.coord[1].toFixed(6)}, ${pendingSelection.coord[0].toFixed(6)}`
                                            // Determine effective role (don't overwrite FROM if already set)
                                            const effectiveRole = (pendingRole === 'from' && selectedFromCoord) ? 'to' : pendingRole

                                            console.log('Confirm click: pendingRole, selectedFromCoord, selectedToCoord, effectiveRole, pendingCoord', {
                                                pendingRole,
                                                selectedFromCoord,
                                                selectedToCoord,
                                                effectiveRole,
                                                pendingCoord: pendingSelection.coord
                                            })

                                            // compute newFrom/newTo synchronously
                                            const newFrom = (effectiveRole === 'from') ? pendingSelection.coord : selectedFromCoord
                                            const newTo = (effectiveRole === 'to') ? pendingSelection.coord : selectedToCoord

                                            if (effectiveRole === 'from') {
                                                setSelectedFromCoord(pendingSelection.coord)
                                                const nameToSet = pendingSelection.name ?? coordLabel
                                                console.log('Setting selectedLocationFrom ->', nameToSet)
                                                setSelectedLocationFrom(nameToSet)
                                            } else {
                                                setSelectedToCoord(pendingSelection.coord)
                                                const nameToSet = pendingSelection.name ?? coordLabel
                                                console.log('Setting selectedLocationTo ->', nameToSet)
                                                setSelectedLocationTo(nameToSet)
                                            }

                                            // clear pending
                                            setPendingSelection(null)
                                            setPendingRole(null)

                                            // clear previous route info when requesting a new route
                                            setRouteInfo(null)

                                            // if both coords present now, request route using computed values
                                            if (newFrom && newTo) {
                                                console.log('Requesting route with', newFrom, newTo, 'computed from effectiveRole', effectiveRole)
                                                // set state so AddRoute renders with up-to-date coords
                                                setSelectedFromCoord(newFrom)
                                                setSelectedToCoord(newTo)
                                                setRouteRequested(true)
                                            }
                                        }}>Confirm</Button>
                                        <Button size="sm" onClick={() => { setPendingSelection(null); setPendingRole(null); }}>Cancel</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Route info panel */}
                        {routeInfo && (
                            <div style={{ position: 'absolute', left: 12, top: 12, zIndex: 9999 }}>
                                <div className="bg-background p-3 rounded shadow max-w-sm">
                                    <div className="font-medium">Route summary</div>
                                    <div className="text-sm">Distance: {(routeInfo.distance / 1000).toFixed(2)} km</div>
                                    <div className="text-sm">Duration: {(routeInfo.duration / 60).toFixed(1)} min</div>
                                    <details className="mt-2 text-xs">
                                        <summary>Raw JSON</summary>
                                        <pre className="text-xs overflow-auto" style={{ maxHeight: 200 }}>{JSON.stringify(routeInfo, null, 2)}</pre>
                                    </details>
                                </div>
                            </div>
                        )}
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>

            <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
                <DialogContent className="sm:max-w-md z-[10000]">
                    <DialogHeader>
                        <DialogTitle>Confirm Trip Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="font-medium">Time:</span>
                            <span>{selectedTime || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Date:</span>
                            <span>{selectedDate || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between">

                            <span className="font-medium">From:</span>
                            <span>{selectedLocationFrom || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">To:</span>
                            <span>{selectedLocationTo || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Distance:</span>
                            <span>{routeInfo ? `${(routeInfo.distance / 1000).toFixed(2)} km` : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Time:</span>
                            <span>{routeInfo ? `${Math.round(routeInfo.duration / 60)} min` : 'N/A'}</span>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Price:</span>
                        <span>${routeInfo ? 10 : 'N/A'}</span>
                    </div>
                    <Button
                        className="w-full"
                        onClick={() => {
                            // Lógica de "Schedule in Calendar" (por ahora, solo loguea y cierra)
                            console.log('=== Trip Scheduled ===');
                            console.log('Time:', selectedTime);
                            console.log('Date:', selectedDate);
                            console.log('From:', selectedLocationFrom);
                            console.log('To:', selectedLocationTo);
                            console.log('Distance:', routeInfo ? `${(routeInfo.distance / 1000).toFixed(2)} km` : 'N/A');
                            console.log('Price:', routeInfo ? 10 : 'N/A');
                            // Aquí puedes integrar con calendario real (ej: enviar a API de calendario)
                            setIsConfirmModalOpen(false)
                            // Limpiar inputs como antes
                            setSelectedLocationFrom(undefined)
                            setSelectedLocationTo(undefined)
                            setSelectedDate(undefined)
                            setSelectedTime(undefined)
                        }}
                    >
                        Schedule in Calendar
                    </Button>
                </DialogContent>
            </Dialog>
        </AppLayout>
    )
}

function MapClickHandler({ onMapClick }: { onMapClick: (coord: [number, number]) => void }) {
    useMapEvent('click', (e: L.LeafletMouseEvent) => {
        const lat = e.latlng.lat
        const lng = e.latlng.lng
        console.log('Map clicked at', [lng, lat])
        onMapClick([lng, lat])
    })
    return null
}