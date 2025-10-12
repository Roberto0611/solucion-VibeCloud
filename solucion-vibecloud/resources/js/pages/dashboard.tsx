import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            {/* <SelectDataDashboard value={selectedDataset} onChange={setSelectedDataset} /> */}

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        {/* <FiltroMay datasetUrl={selectedDataset} /> */}
                        Hoy en Brooklyin se registraron 30 pedidos de taxis
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        Conoce las noticias del momento
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        Dale un vistazo a tu calendario
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    {/* <HomePage selectedDataset={selectedDataset} /> */}
                    Fun facts
                </div>
            </div>
        </AppLayout>
    );
}
