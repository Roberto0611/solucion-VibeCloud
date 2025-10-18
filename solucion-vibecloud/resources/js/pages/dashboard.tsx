import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import HomePage from './EarthPage';
import FiltroMay from '../charts/filtromay';
import React, { useState, useEffect } from 'react';
import SelectDataDashboard from '@/components/selectDataDashboard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

// Función fallback para generar datos si la API falla
const generateMonthlyDataFallback = (year: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
        month,
        year,
        avgPriceUber: parseFloat((Math.random() * 30 + 15).toFixed(2)),
        avgPriceYellowTaxi: parseFloat((Math.random() * 25 + 12).toFixed(2))
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
                        {`${entry.name}: $${entry.value}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const [selectedDataset, setSelectedDataset] = useState('../DatosJSON/csvjson2020.json');
    const [funFact, setFunFact] = useState<string>('Loading prediction...');
    const [loadingFact, setLoadingFact] = useState(true);
    const [chartData, setChartData] = useState<any[]>([]);
    const [currentYear, setCurrentYear] = useState(2019);
    const [allYearsData, setAllYearsData] = useState<any[]>([]); // Datos de todos los años desde la API
    const [loadingData, setLoadingData] = useState(true);

    const { auth } = usePage().props as any;
    const userName = auth?.user?.name ?? auth?.user?.first_name ?? 'Usuario';

    // Cargar datos del dashboard desde la API
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoadingData(true);
                const response = await fetch('/api/dashboard-data');
                const result = await response.json();
                
                if (result.success && result.data) {
                    setAllYearsData(result.data);
                    console.log('✅ Datos del dashboard cargados:', result.data);
                } else {
                    console.error('❌ Error en la respuesta:', result);
                    // Usar datos de fallback
                    setAllYearsData([]);
                }
            } catch (error) {
                console.error('❌ Error cargando datos del dashboard:', error);
                setAllYearsData([]);
            } finally {
                setLoadingData(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Fetch predicción para el fun fact
    useEffect(() => {
        const fetchFunFact = async () => {
            try {
                // Obtener hora actual + 1 hora para el pronóstico
                const now = new Date();
                const futureHour = new Date(now.getTime() + 60 * 60 * 1000);
                const pickupDateTime = `${futureHour.getFullYear()}-${String(futureHour.getMonth() + 1).padStart(2, '0')}-${String(futureHour.getDate()).padStart(2, '0')} ${String(futureHour.getHours()).padStart(2, '0')}:00`;

                // Zonas de ejemplo: Central Park (43) → Forest Hills (100), distancia aprox 10 millas
                const payload = {
                    pickup_dt_str: pickupDateTime,
                    pulocationid: 43,  // Central Park
                    dolocationid: 100, // Forest Hills
                    trip_miles: 10.5
                };

                const response = await fetch('/api/predict', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error('Prediction failed');
                }

                const data = await response.json();
                const prediction = data.predictions?.[0] || data.prediction || data;
                const price = typeof prediction === 'number' ? prediction : prediction?.price || 0;
                const formattedPrice = parseFloat(price.toFixed(2));

                const timeStr = `${String(futureHour.getHours()).padStart(2, '0')}:${String(futureHour.getMinutes()).padStart(2, '0')}`;
                setFunFact(`Today at ${timeStr} from Central Park to Forest Hills will cost $${formattedPrice}`);
            } catch (error) {
                console.error('Error fetching fun fact:', error);
                setFunFact('Fun fact: NYC taxis complete over 600,000 trips daily!');
            } finally {
                setLoadingFact(false);
            }
        };

        fetchFunFact();
    }, []);

    // Animación de la gráfica - cambia de año cada 3 segundos
    useEffect(() => {
        if (loadingData || allYearsData.length === 0) return;

        const years = [2019, 2020, 2021, 2022, 2023, 2024];
        let yearIndex = 0;

        const updateChart = () => {
            const year = years[yearIndex];
            setCurrentYear(year);
            
            // Buscar datos del año desde la API
            const yearData = allYearsData.find(d => d.year === year);
            if (yearData && yearData.months) {
                setChartData(yearData.months);
            } else {
                // Fallback a datos random si no hay datos para ese año
                console.warn(`⚠️ No hay datos para el año ${year}, usando fallback`);
                setChartData(generateMonthlyDataFallback(year));
            }
            
            yearIndex = (yearIndex + 1) % years.length;
        };

        updateChart(); // Initial load
        const interval = setInterval(updateChart, 3000); // Cambia cada 3 segundos

        return () => clearInterval(interval);
    }, [allYearsData, loadingData]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video flex items-center justify-center overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className="p-4 text-center text-foreground">
                            <h2 className="text-2xl font-semibold">
                                Welcome {userName}!
                            </h2>
                        </div>
                    </div>
                    <div className="relative aspect-video flex items-center justify-center overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className="p-4 text-center text-foreground">
                            <h2 className="text-lg font-semibold">
                                {loadingFact ? (
                                    <span className="animate-pulse">Loading prediction...</span>
                                ) : (
                                    <>
                                        <span className="text-primary">{funFact}</span>
                                    </>
                                )}
                            </h2>
                        </div>
                    </div>
                    <div className="relative aspect-video flex items-center justify-center overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className="p-4 text-center text-foreground">
                            <Link
                                href="/schedule"
                                className="ml-2 text-lg text-primary hover:underline font-bold "
                            >
                                Check your trip schedule
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-6" style={{ minHeight: '500px' }}>
                    <div className="flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-4 text-center">
                            Average Taxi Prices by Month - {currentYear}
                            <Link
                                href="/stats"
                                className="ml-2 text-sm text-primary hover:underline"
                            >
                                For more information, check stats
                            </Link>
                        </h2>
                        {loadingData ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-muted-foreground">Loading chart data...</p>
                                </div>
                            </div>
                        ) : (
                        <div style={{ width: '100%', height: '450px' }}>
                            <ResponsiveContainer>
                                <LineChart
                                    data={chartData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="month"
                                        label={{ value: 'Month', position: 'insideBottom', offset: -15 }}
                                    />
                                    <YAxis
                                        label={{ value: 'Average Price ($)', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        wrapperStyle={{ paddingTop: '30px' }}
                                        iconSize={18}
                                        layout="horizontal"
                                        verticalAlign="bottom"
                                        align="center"
                                        iconType="line"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="avgPriceUber"
                                        stroke="#8884d8"
                                        strokeWidth={3}
                                        name="Uber"
                                        animationDuration={1500}
                                        animationEasing="ease-in-out"
                                        dot={{ r: 6 }}
                                        activeDot={{ r: 8 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="avgPriceYellowTaxi"
                                        stroke="#ffc658"
                                        strokeWidth={3}
                                        name="Yellow Taxi"
                                        animationDuration={1500}
                                        animationEasing="ease-in-out"
                                        dot={{ r: 6 }}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}