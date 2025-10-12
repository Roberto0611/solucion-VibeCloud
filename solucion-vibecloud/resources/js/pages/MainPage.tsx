import React from 'react';
import { Calendar24 } from './CalendarPrime';
import { BreadcrumbTime } from './Responsive/ResponsiveTime.tsx/BreadcrumbTime';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import ResponsiveLoc from './Responsive/ResponsiveLocation.tsx/ResponsiveLoc';
import ResponsiveTi from './Responsive/ResponsiveTime.tsx/ResponsiveTi';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [

    {
        title: 'DriveCloud',
        href: '/main',
    },
];

const MainPage = () => {
    const [query, setQuery] = React.useState('');
    //const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
    const [selectedDate, setSelectedDate] = React.useState<string | undefined>(undefined);
    const [selectedTime, setSelectedTime] = React.useState<string | undefined>(undefined);
    const [selectedLocationFrom, setSelectedLocationFrom] = React.useState<string | undefined>(undefined);
    const [selectedLocationTo, setSelectedLocationTo] = React.useState<string | undefined>(undefined);

    const handleSendQuery = () => {
        console.log('Query enviado:', query);
    };

    const handleConfirm = () => {
        console.log('=== Datos de configuración manual ===');
        console.log('Fecha:', selectedDate ?? 'No seleccionada');
        console.log('Hora:', selectedTime || 'No seleccionada');
        console.log('Ubicación from:', selectedLocationFrom || 'No seleccionada');
        console.log('Ubicación to:', selectedLocationTo || 'No seleccionada');
    };

    console.log('Selected Date:', selectedDate);
    console.log('Selected Time:', selectedTime);
    console.log('Selected Location From:', selectedLocationFrom);
    console.log('Selected Location To:', selectedLocationTo);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="DriveSave" />
            <div className="bg-background">
                <div className="container mx-auto px-4 py-16 max-w-4xl">


                    <div className="mb-12">
                        <div className="space-y-4">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-semibold text-foreground">When and where will you order a taxi?</h2>
                                <p className="text-sm text-muted-foreground mt-2">Say it in your own words</p>
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder="Example: I want to order a taxi tomorrow at 15:00 in Brooklyn, New York"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyUp={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSendQuery();
                                        }
                                    }}
                                    className="flex-1"

                                />
                                <Button size="icon" onClick={handleSendQuery}>
                                    <Send className="h-4 w-4" />

                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Division */}
                    <div className="relative mb-12">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Manual Configuration</span>
                        </div>
                    </div>

                    {/* Seccion de configuracion manual */}
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-semibold text-foreground">Manual Selection</h3>
                            <p className="text-sm text-muted-foreground mt-1">Choose date, time and, location</p>
                        </div>



                        <div className="flex flex-col md:flex-row md:flex-wrap justify-center items-center gap-4">
                            <div className="flex flex-col md:flex-row md:flex-wrap justify-center items-center gap-4">
                                <Calendar24 onDateChange={setSelectedDate} />
                                <ResponsiveTi onTimeChange={setSelectedTime} />
                                <div className="flex flex-col md:flex-row gap-2">
                                    <ResponsiveLoc label="From" onLocationChange={setSelectedLocationFrom} />
                                    <ResponsiveLoc label="To" onLocationChange={setSelectedLocationTo} />
                                </div>


                            </div>
                            <div className="flex flex-col md:flex-row md:flex-wrap justify-center items-center gap-4 pt-6">
                                <Button className="mt-4 md:mt-0" size="sm" onClick={handleConfirm}>Confirm</Button>

                            </div>


                        </div>

                    </div>

                </div>
            </div>
        </AppLayout>
    );
};

export default MainPage;
