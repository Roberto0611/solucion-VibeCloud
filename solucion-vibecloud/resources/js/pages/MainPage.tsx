import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Sparkles, Car, MapPin, Clock } from 'lucide-react';
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
    const [geminiResponse, setGeminiResponse] = React.useState<string>('');
    const [loadingGemini, setLoadingGemini] = React.useState(false);
    const [showResponse, setShowResponse] = React.useState(false);

    const handleSendQuery = async () => {
        if (!query.trim()) {
            return;
        }

        console.log('🤖 Query enviado a Gemini:', query);
        setLoadingGemini(true);
        setGeminiResponse('');
        setShowResponse(false);

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
                setShowResponse(true);
            } else {
                setGeminiResponse('No response received. Please try again.');
                setShowResponse(true);
            }

        } catch (err) {
            console.error('❌ Error:', err);
            setGeminiResponse('Unable to process your request. Please try again.');
            setShowResponse(true);
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
            <Head title="DriveCloud - AI Taxi Booking" />
            
            {/* Minimal Hero Section */}
            <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/10 overflow-hidden flex items-center">
                {/* Elementos decorativos de fondo sutiles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-float" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/3 rounded-full blur-3xl animate-float-delayed" />
                </div>

                <div className="relative container mx-auto px-4 py-12 max-w-4xl">
                    {/* Header minimalista */}
                    <div className="text-center mb-16 animate-fade-in-down">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
                            When and where will you<br />order a taxi?
                        </h1>
                        
                        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                            Describe your trip in natural language
                        </p>
                    </div>

                    {/* Chat Interface - Centro de la pantalla */}
                    <div className="max-w-2xl mx-auto animate-fade-in-up">
                        <div className="bg-card/80 backdrop-blur-md border border-border/50 rounded-3xl shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl">
                            <div className="space-y-6">
                                {/* Input Area */}
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <Input
                                            type="text"
                                            placeholder="Example: I need a taxi tomorrow at 3pm from Times Square to JFK Airport"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            onKeyUp={(e) => {
                                                if (e.key === 'Enter' && !loadingGemini && query.trim()) {
                                                    handleSendQuery();
                                                }
                                            }}
                                            className="pr-14 h-16 text-base rounded-2xl border-2 focus:border-primary/50 transition-all duration-200"
                                            disabled={loadingGemini}
                                        />
                                        <Button
                                            size="icon"
                                            onClick={handleSendQuery}
                                            disabled={loadingGemini || !query.trim()}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-xl transition-all duration-200 hover:scale-105"
                                        >
                                            {loadingGemini ? (
                                                <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                                            ) : (
                                                <Send className="h-5 w-5" />
                                            )}
                                        </Button>
                                    </div>
                                    
                                    <p className="text-sm text-center text-muted-foreground/70">
                                        Press Enter or click send
                                    </p>
                                </div>

                                {/* Loading State */}
                                {loadingGemini && (
                                    <div className="flex items-center justify-center gap-3 p-8 rounded-2xl bg-muted/30 animate-fade-in">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                        <span className="text-sm text-muted-foreground">Processing...</span>
                                    </div>
                                )}

                                {/* Response Area */}
                                {showResponse && geminiResponse && !loadingGemini && (
                                    <div className="animate-fade-in-up">
                                        <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-xl bg-primary/20 mt-1 flex-shrink-0">
                                                    <Sparkles className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="prose prose-sm max-w-none">
                                                        <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed bg-transparent border-0 p-0 m-0">
                                                            {geminiResponse}
                                                        </pre>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in-down {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                @keyframes float {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    50% {
                        transform: translate(30px, -30px) scale(1.1);
                    }
                }
                
                @keyframes float-delayed {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    50% {
                        transform: translate(-30px, 30px) scale(1.05);
                    }
                }
                
                .animate-fade-in-down {
                    animation: fade-in-down 0.8s ease-out;
                }
                
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out 0.2s backwards;
                }
                
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
                
                .animate-float {
                    animation: float 20s ease-in-out infinite;
                }
                
                .animate-float-delayed {
                    animation: float-delayed 25s ease-in-out infinite;
                }
            `}</style>
        </AppLayout>
    );
};

export default MainPage;
