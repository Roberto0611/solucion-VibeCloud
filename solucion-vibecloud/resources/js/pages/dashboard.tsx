import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import HomePage from './EarthPage';
import FiltroMay from '../charts/filtromay';
import React, { useState } from 'react';
import SelectDataDashboard from '@/components/selectDataDashboard';



const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },


];

export default function Dashboard() {
    const [selectedDataset, setSelectedDataset] = useState('../DatosJSON/csvjson2020.json');

    //Con esto obtengo el usuario desde Intertia
    const { auth } = usePage().props as any;
    const userName = auth?.user?.name ?? auth?.user?.first_name ?? 'Usuario';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />


            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video flex items-center justify-center overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className="p-4 text-center text-foreground">
                            <h2 className="text-2xl font-semibold">
                                Bienvenid@ {userName}
                            </h2>
                        </div>
                    </div>
                    <div className="relative aspect-video flex items-center justify-center overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className="p-4 text-center text-foreground">
                            <h2 className="text-2xl font-semibold">
                                Hoy {new Date().toLocaleDateString()} pronosticamos 30 pedidos de taxis en Brooklyn
                            </h2>
                        </div>
                    </div>
                    <div className="relative aspect-video flex items-center justify-center overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className="p-4 text-center text-foreground">
                            <h2 className="text-2xl font-semibold">
                                Dale un visatazo a tu horario de viajes
                            </h2>
                        </div>
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    {/* <HomePage selectedDataset={selectedDataset} /> */}
                    Imagen
                </div>
            </div>
        </AppLayout>
    );
}
