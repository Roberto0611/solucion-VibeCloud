import { Chart as ChartJS, registerables } from 'chart.js';
import React, { useEffect, useRef } from 'react';

// Registrar todos los componentes de Chart.js
ChartJS.register(...registerables);

type MayChartProps = {
    labels: string[];
    data: number[];
    label?: string;
    type?: 'bar' | 'line' | 'pie' | 'doughnut';
}

const MayChart: React.FC<MayChartProps> = ({
    labels,
    data,
    label = 'Los 5 paises con mayor población',
    type = 'bar'
}) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<ChartJS | null>(null);

    useEffect(() => {
        if (!chartRef.current || labels.length === 0) return;

        // Destruir el gráfico anterior si existe
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        // Crear el nuevo gráfico
        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        chartInstanceRef.current = new ChartJS(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                    ],
                    borderColor: [
                        'rgb(255, 99, 132)',
                        'rgb(54, 162, 235)',
                        'rgb(255, 206, 86)',
                        'rgb(75, 192, 192)',
                        'rgb(153, 102, 255)',
                        'rgb(255, 159, 64)',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: 0
                },
                scales: type === 'bar' || type === 'line' ? {
                    y: {
                        beginAtZero: true
                    }
                } : undefined
            }
        });

        // Cleanup al desmontar
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [labels, data, label, type]);

    return (
        <div style={{ backgroundColor: 'black', width: '100%', height: '100%' }}>
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default MayChart;