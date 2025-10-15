import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Calendar',
        href: '/calendar',
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

const CalendarPage = () => {
    const [events, setEvents] = useState<Event[]>([]);

    // Cargar eventos desde localStorage al montar
    useEffect(() => {
        const storedEvents = localStorage.getItem('scheduledEvents');
        if (storedEvents) {
            setEvents(JSON.parse(storedEvents));
        }
    }, []);

    // Guardar eventos en localStorage cuando cambien
    useEffect(() => {
        localStorage.setItem('scheduledEvents', JSON.stringify(events));
    }, [events]);

    // Función para filtrar eventos (solo próximos)
    const filteredEvents = events.filter(event => {
        const eventDateTime = new Date(`${event.date}T${event.time}`);
        const now = new Date();
        return eventDateTime >= now; // Solo próximos
    });

    // Ordenar eventos por fecha (más recientes primero)
    const sortedEvents = filteredEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar" />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4 pl-1">Agenda de Viajes Programados</h1>

                {sortedEvents.length > 0 ? (
                    <div className="space-y-4">
                        {sortedEvents.map(event => (
                            <Card key={event.id} className="w-full">
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Viaje programado para {new Date(event.date).toLocaleDateString()}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        <Badge variant="outline">Hora: {event.time}</Badge>
                                        <Badge variant="outline">Distancia: {event.distance}</Badge>
                                        <Badge variant="outline">Precio: {event.price}</Badge>
                                        <Badge variant="outline">Desde: {event.from}</Badge>
                                        <Badge variant="outline">Hasta: {event.to}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">No hay viajes programados aún. Programa uno desde la página del mapa.</p>
                )}
            </div>
        </AppLayout>
    );
};

export default CalendarPage;