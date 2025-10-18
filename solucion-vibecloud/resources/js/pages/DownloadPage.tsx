import React from 'react'
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Button } from '@/components/ui/button';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [

    {
        title: 'Download Charts',
        href: '/download',
    },
];

interface Event {
    id: string;
    time: string;
    date: string;
    distance: string;
    price: string;
    from: string;
    to: string;
}

const DownloadPage = () => {
    const [recordData, setRecordData] = React.useState<Event[]>([]);

    // Cargar datos de RecordPage desde localStorage
    React.useEffect(() => {
        const storedEvents = localStorage.getItem('scheduledEvents');
        if (storedEvents) {
            setRecordData(JSON.parse(storedEvents));
        }
    }, []);

    // Función para convertir datos a CSV
    const downloadCSV = () => {
        if (recordData.length === 0) {
            alert('No hay datos para descargar');
            return;
        }

        // Crear encabezados CSV
        const headers = ['ID', 'Date', 'Time', 'From', 'To', 'Distance', 'Price'];

        // Convertir datos a filas CSV
        const rows = recordData.map(event => [
            event.id,
            event.date,
            event.time,
            event.from,
            event.to,
            event.distance,
            event.price
        ]);

        // Combinar encabezados y filas
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Crear blob y descargar
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `trip_records_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Función para descargar JSON
    const downloadJSON = () => {
        if (recordData.length === 0) {
            alert('No hay datos para descargar');
            return;
        }

        const jsonContent = JSON.stringify(recordData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `trip_records_${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Función para descargar estadísticas agregadas
    const downloadStats = () => {
        if (recordData.length === 0) {
            alert('No hay datos para descargar');
            return;
        }

        // Calcular estadísticas
        const totalTrips = recordData.length;
        const totalPrice = recordData.reduce((sum, event) => sum + parseFloat(event.price || '0'), 0);
        const avgPrice = totalPrice / totalTrips;

        const totalDistance = recordData.reduce((sum, event) => {
            const dist = parseFloat(event.distance?.replace(' mi', '') || '0');
            return sum + dist;
        }, 0);
        const avgDistance = totalDistance / totalTrips;

        const stats = {
            summary: {
                total_trips: totalTrips,
                total_price: totalPrice.toFixed(2),
                average_price: avgPrice.toFixed(2),
                total_distance_miles: totalDistance.toFixed(2),
                average_distance_miles: avgDistance.toFixed(2),
                report_date: new Date().toISOString()
            },
            trips: recordData
        };

        const jsonContent = JSON.stringify(stats, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `trip_statistics_${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Download Data" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header con información */}
                <div className="rounded-xl border border-sidebar-border/70 bg-background p-6 dark:border-sidebar-border">
                    <h2 className="text-2xl font-bold mb-2">Download Trip Data</h2>
                    <p className="text-muted-foreground mb-4">
                        Export your trip records and statistics in different formats
                    </p>
                    <div className="flex gap-2 text-sm">
                        <span className="font-medium">Total Records:</span>
                        <span className="text-muted-foreground">{recordData.length} trips</span>
                    </div>
                </div>

                {/* Cards de descarga */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* CSV Download */}
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-background p-6 dark:border-sidebar-border">
                        <div className="flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-3">
                                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                                <div>
                                    <h3 className="font-semibold">CSV Export</h3>
                                    <p className="text-xs text-muted-foreground">Excel compatible</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 flex-1">
                                Download trip records as CSV file. Perfect for Excel, Google Sheets, and data analysis.
                            </p>
                            <Button
                                onClick={downloadCSV}
                                className="w-full"
                                disabled={recordData.length === 0}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download CSV
                            </Button>
                        </div>
                    </div>

                    {/* JSON Download */}
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-background p-6 dark:border-sidebar-border">
                        <div className="flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-3">
                                <FileJson className="h-8 w-8 text-blue-600" />
                                <div>
                                    <h3 className="font-semibold">JSON Export</h3>
                                    <p className="text-xs text-muted-foreground">Raw data format</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 flex-1">
                                Download raw trip data in JSON format. Ideal for developers and data processing.
                            </p>
                            <Button
                                onClick={downloadJSON}
                                className="w-full"
                                variant="outline"
                                disabled={recordData.length === 0}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download JSON
                            </Button>
                        </div>
                    </div>

                    {/* Statistics Report */}
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-background p-6 dark:border-sidebar-border">
                        <div className="flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-3">
                                <Download className="h-8 w-8 text-purple-600" />
                                <div>
                                    <h3 className="font-semibold">Statistics Report</h3>
                                    <p className="text-xs text-muted-foreground">With summary data</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 flex-1">
                                Download complete report with trip statistics and aggregated data.
                            </p>
                            <Button
                                onClick={downloadStats}
                                className="w-full"
                                variant="secondary"
                                disabled={recordData.length === 0}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download Report
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Preview de datos */}
                <div className="relative min-h-[40vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-background p-6 dark:border-sidebar-border">
                    <h3 className="font-semibold mb-4">Data Preview</h3>
                    {recordData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                            <p className="relative z-10">No trip data available</p>
                            <p className="text-sm relative z-10">Complete trips in MapPage to see data here</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">Date</th>
                                        <th className="text-left p-2">Time</th>
                                        <th className="text-left p-2">From</th>
                                        <th className="text-left p-2">To</th>
                                        <th className="text-left p-2">Distance</th>
                                        <th className="text-left p-2">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recordData.slice(0, 10).map((event) => (
                                        <tr key={event.id} className="border-b hover:bg-muted/50">
                                            <td className="p-2">{event.date}</td>
                                            <td className="p-2">{event.time}</td>
                                            <td className="p-2">{event.from}</td>
                                            <td className="p-2">{event.to}</td>
                                            <td className="p-2">{event.distance}</td>
                                            <td className="p-2">${event.price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {recordData.length > 10 && (
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                    Showing 10 of {recordData.length} records
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    )
}

export default DownloadPage
