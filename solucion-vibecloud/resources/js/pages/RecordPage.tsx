import React from 'react';
import { Calendar24 } from './CalendarPrime';
import { BreadcrumbTime } from './Responsive/ResponsiveTime.tsx/BreadcrumbTime';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MapPin, Clock, DollarSign, Timer } from 'lucide-react';
import ResponsiveLoc from './Responsive/ResponsiveLocation.tsx/ResponsiveLoc';
import ResponsiveTi from './Responsive/ResponsiveTime.tsx/ResponsiveTi';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { ChartBarIcon } from 'lucide-react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Record',
        href: '/record',
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

const RecordPage = () => {
    const [query, setQuery] = React.useState('');
    const [events, setEvents] = React.useState<Event[]>([]);

    // Cargar eventos desde localStorage al montar
    React.useEffect(() => {
        const storedEvents = localStorage.getItem('scheduledEvents');
        if (storedEvents) {
            setEvents(JSON.parse(storedEvents));
        }
    }, []);

    // Función para filtrar eventos (solo pasados)
    const filteredEvents = events.filter(event => {
        const eventDateTime = new Date(`${event.date}T${event.time}`);
        const now = new Date();
        return eventDateTime < now; // Solo pasados
    });

    // Mapear eventos a formato de RecordPage (viajes completados)
    const tripHistory = filteredEvents.map(event => ({
        id: event.id,
        origin: event.from,
        destination: event.to,
        time: event.time,
        date: event.date,
        savedMoney: typeof event.price === 'string' ? parseFloat(event.price.replace('$', '')) : 0, // Check si es string
        savedMinutes: typeof event.distance === 'string' ? Math.round(parseFloat(event.distance.replace(' km', '')) * 1.5) : 0, // Check si es string
    }));

    // Calcular totales basados en viajes filtrados
    const totalSavedMoney = tripHistory.reduce((sum, trip) => sum + trip.savedMoney, 0);
    const totalSavedMinutes = tripHistory.reduce((sum, trip) => sum + trip.savedMinutes, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Charts" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Sección de Total Ahorrado */}
                <div className="bg-background rounded-lg border border-sidebar-border/70 dark:border-sidebar-border px-4 py-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Total Savings: <span className="font-semibold text-green-600 dark:text-green-400">${totalSavedMoney.toFixed(2)}</span> • <span className="font-semibold text-orange-600 dark:text-orange-400">{totalSavedMinutes} min</span> • {tripHistory.length} trips
                    </p>
                </div>

                <div className="grid auto-rows-min gap-4 grid-cols-1">
                    {tripHistory.map((trip) => (
                        <div key={trip.id} className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-background">
                            <div className="p-6">
                                {/* Header con fecha y hora */}
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {trip.time}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            • {new Date(trip.date).toLocaleDateString()} {/* Formato legible */}
                                        </span>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                                        Completed
                                    </div>
                                </div>

                                {/* Origen y Destino */}
                                <div className="mb-6 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                            <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="bg-background">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {trip.origin}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                            <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div className="bg-background">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {trip.destination}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Ahorros */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-background border border-green-200 dark:border-green-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                                Money Saved
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                                            ${trip.savedMoney.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-background border border-orange-200 dark:border-orange-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Timer className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                                Traffic Saved
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                                            {trip.savedMinutes} min
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </AppLayout>
    );
};

export default RecordPage;