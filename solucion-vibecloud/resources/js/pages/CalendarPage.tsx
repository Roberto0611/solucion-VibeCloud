import React from 'react'
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
import { ChartBarIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [

    {
        title: 'Calendar',
        href: '/calendar',
    },
];

const CalendarPage = () => {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar" />

        </AppLayout>
    )
}

export default CalendarPage
