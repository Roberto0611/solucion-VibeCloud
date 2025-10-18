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
    const [selectedDate, setSelectedDate] = React.useState<string | undefined>(undefined);
    const [selectedTime, setSelectedTime] = React.useState<string | undefined>(undefined);
    const [selectedLocationFrom, setSelectedLocationFrom] = React.useState<string | undefined>(undefined);
    const [selectedLocationTo, setSelectedLocationTo] = React.useState<string | undefined>(undefined);
    const [loading, setLoading] = React.useState(false);
    const [geminiResponse, setGeminiResponse] = React.useState<string>('');
    const [loadingGemini, setLoadingGemini] = React.useState(false);

    const handleSendQuery = async () => {
        if (!query.trim()) {
            alert('Please enter a query');
            return;
        }

        console.log('🤖 Query enviado a Gemini:', query);
        setLoadingGemini(true);
        setGeminiResponse('');

        try {
            const response = await fetch('/api/gemini/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('❌ Error del servidor:', errorData);
                throw new Error(`Error ${response.status}: ${errorData?.message || response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Respuesta de Gemini:', data);
            
            if (data.success && data.response) {
                setGeminiResponse(data.response);
            } else {
                setGeminiResponse('No response received from Gemini');
            }

        } catch (err) {
            console.error('❌ Error:', err);
            setGeminiResponse('Error processing your query. Please try again.');
        } finally {
            setLoadingGemini(false);
        }
    };

    const handleConfirm = async () => {
        // Validar que tengamos los datos necesarios
        if (!selectedDate || !selectedTime || !selectedLocationFrom || !selectedLocationTo) {
            alert('Por favor completa todos los campos');
            return;
        }

        // Formato correcto: "YYYY-MM-DD HH:MM:SS"
        // selectedTime ya viene en formato "HH:MM:SS" del input type="time"
        const pickupDateTime = `${selectedDate} ${selectedTime}`;
        const payload = {
            pickup_dt_str: pickupDateTime,
            pulocationid: parseInt(selectedLocationFrom, 10), // Convertir a número
            dolocationid: parseInt(selectedLocationTo, 10),   // Convertir a número
            trip_miles: 5.2
        };

        console.log('✅ Enviando datos:', payload);
        setLoading(true);

        try {
            // 🧪 Usando endpoint de PRUEBA (cambia a '/api/predict' para usar AWS SageMaker real)
            const response = await fetch('/api/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                // Intentar leer el mensaje de error del servidor
                const errorData = await response.json().catch(() => null);
                console.error(' Error del servidor:', errorData);
                throw new Error(`Error ${response.status}: ${errorData?.message || response.statusText}`);
            }

            const data = await response.json();
            console.log('Respuesta recibida:', data);
            console.log('Estructura completa:', JSON.stringify(data, null, 2));
            
            // Mostrar predicción en alert
            // AWS SageMaker generalmente retorna { predictions: [...] }
            const prediction = data.predictions?.[0] || data.prediction || data;
            alert(`Precio estimado: $${prediction} dólares`);

        } catch (err) {
            console.error(' Error:', err);
            alert('Error al obtener la predicción');
        } finally {
            setLoading(false);
        }
    };

    // console.log('Selected Date:', selectedDate);
    // console.log('Selected Time:', selectedTime);
    // console.log('Selected Location From:', selectedLocationFrom);
    // console.log('Selected Location To:', selectedLocationTo);


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
                                        if (e.key === 'Enter' && !loadingGemini) {
                                            handleSendQuery();
                                        }
                                    }}
                                    className="flex-1"
                                    disabled={loadingGemini}
                                />
                                <Button 
                                    size="icon" 
                                    onClick={handleSendQuery}
                                    disabled={loadingGemini}
                                >
                                    {loadingGemini ? (
                                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>

                            {/* Mostrar respuesta de Gemini */}
                            {geminiResponse && (
                                <div className="mt-4 p-4 rounded-lg border bg-muted">
                                    <h3 className="font-semibold text-foreground mb-2">🤖 Gemini Response:</h3>
                                    <p className="text-sm text-foreground whitespace-pre-wrap">{geminiResponse}</p>
                                </div>
                            )}
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
                                <Button 
                                    className="mt-4 md:mt-0" 
                                    size="sm" 
                                    onClick={handleConfirm}
                                    disabled={loading}
                                >
                                    {loading ? 'Procesando...' : 'Confirm'}
                                </Button>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </AppLayout>
    );
};

export default MainPage;
