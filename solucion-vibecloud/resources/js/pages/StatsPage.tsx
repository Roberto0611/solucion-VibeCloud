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
import { Button } from '@/components/ui/button'
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import ResponsiveYear from './Responsive/ResponsiveYear.tsx/ResponsiveYear'
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

function normalizeGeoJSON(gj: any, taxiType: 'uber' | 'yellowTaxi'): any {
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
    const basePrice = taxiType === 'uber' ? 35 : 25;
    const variance = taxiType === 'uber' ? 25 : 20;

    newGj.features = newGj.features.map((f: any) => {
        if (!f.geometry || !f.geometry.coordinates) return f
        f.geometry.coordinates = transformCoordsRecursively(f.geometry.coordinates, true)
        // Asignar precio según tipo de taxi
        f.properties.price = Math.floor(Math.random() * variance + basePrice);
        return f;
    })
    return newGj
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Stats', href: '/stats' },
]

// Generar datos mensuales para el año completo
const generateMonthlyData = (year: number, taxiType: 'uber' | 'yellowTaxi') => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const basePrice = taxiType === 'uber' ? 28 : 20;
    const variance = taxiType === 'uber' ? 12 : 10;
    const baseTips = taxiType === 'uber' ? 5 : 3;
    const tipsVariance = taxiType === 'uber' ? 3 : 2;

    return months.map((month, index) => ({
        month,
        avgPrice: parseFloat((Math.random() * variance + basePrice).toFixed(2)),
        trips: Math.floor(Math.random() * 50000 + 20000),
        avgTips: parseFloat((Math.random() * tipsVariance + baseTips).toFixed(2))
    }));
};

// Custom Tooltip con estilos de Shadcn
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-background p-3 shadow-md">
                <p className="font-semibold text-foreground mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {`${entry.name}: ${entry.dataKey === 'avgPrice' || entry.dataKey === 'avgTips' ? '$' + entry.value : entry.value.toLocaleString()}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function StatsPage() {

    const [locations, setLocations] = useState<LocationData[]>([])
    const [uberZones, setUberZones] = useState<any>(null)
    const [yellowTaxiZones, setYellowTaxiZones] = useState<any>(null)

    const [selectedYear, setSelectedYear] = React.useState<string>('2024'); // Default 2024
    const [selectedTaxiType, setSelectedTaxiType] = React.useState<'uber' | 'yellowTaxi'>('uber');
    const [selectedMetric, setSelectedMetric] = React.useState<'price' | 'traffic' | 'tips'>('price');

    const [monthlyData, setMonthlyData] = React.useState<any[]>(generateMonthlyData(2024, 'uber'));

    // Update charts when year or taxi type changes
    useEffect(() => {
        if (selectedYear) {
            const year = parseInt(selectedYear);
            setMonthlyData(generateMonthlyData(year, selectedTaxiType));
        }
    }, [selectedYear, selectedTaxiType]);

    useEffect(() => {
        fetch('/data/locations.json')
            .then(r => r.json())
            .then(data => setLocations(data))
            .catch(err => console.error('Error cargando ubicaciones:', err))

        // load taxi zones GeoJSON (put taxi_zones.json into public/data/)
        fetch('/data/taxi_zones.json')
            .then(r => r.json())
            .then((gj) => {
                const normalizedUber = normalizeGeoJSON(gj, 'uber')
                const normalizedYellowTaxi = normalizeGeoJSON(gj, 'yellowTaxi')
                setUberZones(normalizedUber)
                setYellowTaxiZones(normalizedYellowTaxi)
            })
            .catch(err => console.error('Error cargando taxi_zones.json:', err))
    }, [])

    const zoneStyle = (feature: any, taxiType: 'uber' | 'yellowTaxi') => {
        const price = feature?.properties?.price || 0;
        let color = taxiType === 'uber' ? '#10b981' : '#ffc658'; // Base color (verde para Uber, amarillo para Yellow Taxi)

        // Ajustar intensidad según precio con sistema de semáforo
        if (taxiType === 'uber') {
            if (price <= 40) color = '#10b981'; // Verde - Precio bajo
            else if (price > 40 && price <= 50) color = '#fbbf24'; // Amarillo - Precio medio
            else if (price > 50) color = '#ef4444'; // Rojo - Precio alto
        } else {
            if (price <= 30) color = '#10b981'; // Verde - Precio bajo
            else if (price > 30 && price <= 40) color = '#fbbf24'; // Amarillo - Precio medio
            else if (price > 40) color = '#ef4444'; // Rojo - Precio alto
        }

        return {
            color,
            weight: 2,
            fillOpacity: 0.5
        }
    }



    const onEachZone = (feature: any, layer: L.Layer, taxiType: 'uber' | 'yellowTaxi') => {
        const name = feature?.properties?.zone || feature?.properties?.zone_name || 'Zone'
        const borough = feature?.properties?.borough || feature?.properties?.Borough || ''
        const price = feature?.properties?.price || 0;
        const taxiLabel = taxiType === 'uber' ? ' Uber' : ' Yellow Taxi';
        layer.bindPopup(`<strong>${name}</strong><br/>${borough}<br/>${taxiLabel}<br/>Price: $${price}`)
        // listen for clicks on the polygon and stop propagation to the map
        try {
            ; (layer as any).on('click', (e: any) => {
                try { e.originalEvent.stopPropagation() } catch (err) { }
            })
        } catch (err) {
            // ignore if layer doesn't support events
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stats" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Controls Section */}
                <div className="rounded-xl border border-sidebar-border/70 bg-background p-6 dark:border-sidebar-border">
                    <h1 className="text-2xl font-bold text-center mb-4">Statistics Dashboard</h1>
                    <div className="flex flex-wrap justify-center items-center gap-4">
                        <ResponsiveYear onYearChange={setSelectedYear} value={selectedYear} />

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Taxi Type</label>
                            <Select value={selectedTaxiType} onValueChange={(value: 'uber' | 'yellowTaxi') => setSelectedTaxiType(value)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="uber"> Uber</SelectItem>
                                    <SelectItem value="yellowTaxi"> Yellow Taxi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Metric</label>
                            <Select value={selectedMetric} onValueChange={(value: 'price' | 'traffic' | 'tips') => setSelectedMetric(value)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select metric" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="price"> Price</SelectItem>
                                    <SelectItem value="traffic"> Traffic</SelectItem>
                                    <SelectItem value="tips"> Tips</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="flex-1 rounded-xl border border-sidebar-border/70 bg-background p-6 dark:border-sidebar-border" style={{ minHeight: '500px' }}>
                    <h2 className="text-xl font-bold mb-4 text-center">
                        {selectedMetric === 'price' && `Average Price by Month - ${selectedYear} (${selectedTaxiType === 'uber' ? 'Uber' : 'Yellow Taxi'})`}
                        {selectedMetric === 'traffic' && `Traffic Volume by Month - ${selectedYear} (${selectedTaxiType === 'uber' ? 'Uber' : 'Yellow Taxi'})`}
                        {selectedMetric === 'tips' && `Average Tips by Month - ${selectedYear} (${selectedTaxiType === 'uber' ? 'Uber' : 'Yellow Taxi'})`}
                    </h2>
                    <div style={{ width: '100%', height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            {selectedMetric === 'price' && (
                                <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="avgPrice"
                                        stroke={selectedTaxiType === 'uber' ? '#10b981' : '#ffc658'}
                                        strokeWidth={3}
                                        name="Avg Price"
                                        dot={{ r: 5 }}
                                    />
                                </LineChart>
                            )}
                            {selectedMetric === 'traffic' && (
                                <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis label={{ value: 'Trips', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar
                                        dataKey="trips"
                                        fill={selectedTaxiType === 'uber' ? '#10b981' : '#ffc658'}
                                        name="Total Trips"
                                    />
                                </BarChart>
                            )}
                            {selectedMetric === 'tips' && (
                                <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis label={{ value: 'Tips ($)', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="avgTips"
                                        stroke={selectedTaxiType === 'uber' ? '#10b981' : '#ffc658'}
                                        strokeWidth={3}
                                        name="Avg Tips"
                                        dot={{ r: 5 }}
                                    />
                                </LineChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Map Section */}
                <div className="rounded-xl border border-sidebar-border/70 bg-background p-6 dark:border-sidebar-border" style={{ height: '400px' }}>
                    <h2 className="text-xl font-bold mb-4 text-center">
                        {selectedTaxiType === 'uber' ? ' Uber Zone Price Distribution' : ' Yellow Taxi Zone Price Distribution'}
                    </h2>
                    <div style={{ height: 'calc(100% - 50px)' }}>
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
                                <LayersControl.Overlay checked={selectedTaxiType === 'uber'} name=" Uber Zones">
                                    <LayerGroup>
                                        {uberZones && selectedTaxiType === 'uber' && (
                                            <GeoJSON
                                                data={uberZones}
                                                style={(feature) => zoneStyle(feature, 'uber')}
                                                onEachFeature={(f, layer) => onEachZone(f, layer, 'uber')}
                                            />
                                        )}
                                    </LayerGroup>
                                </LayersControl.Overlay>
                                <LayersControl.Overlay checked={selectedTaxiType === 'yellowTaxi'} name=" Yellow Taxi Zones">
                                    <LayerGroup>
                                        {yellowTaxiZones && selectedTaxiType === 'yellowTaxi' && (
                                            <GeoJSON
                                                data={yellowTaxiZones}
                                                style={(feature) => zoneStyle(feature, 'yellowTaxi')}
                                                onEachFeature={(f, layer) => onEachZone(f, layer, 'yellowTaxi')}
                                            />
                                        )}
                                    </LayerGroup>
                                </LayersControl.Overlay>
                            </LayersControl>
                        </MapContainer>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}