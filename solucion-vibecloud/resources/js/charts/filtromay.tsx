import React, { useEffect, useState } from 'react';
import MayChart from './MayChart';

type FiltroMayProps = {
    datasetUrl?: string;
}

const FiltroMay: React.FC<FiltroMayProps> = ({ datasetUrl = '../DatosJSON/csvjson2020.json' }) => {
    const [labels, setLabels] = useState<string[]>([]);
    const [data, setData] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Ruta al JSON de población
                const url = new URL(datasetUrl, import.meta.url).href;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error('Error al cargar los datos');
                }

                const jsonData = await response.json();

                // 1. Hacer una copia y ordenar por población de mayor a menor
                const sortedData = [...jsonData].sort((a: any, b: any) => {
                    const popA = a.Pop || a.pop || 0;
                    const popB = b.Pop || b.pop || 0;
                    return popB - popA; // Descendente (mayor a menor)
                });

                // 2. Tomar solo los primeros 5
                const top5 = sortedData.slice(0, 5);

                // 3. Extraer labels y data de los top 5
                setLabels(top5.map((item: any) => item.Name || item.name || 'N/A'));
                setData(top5.map((item: any) => item.Pop || item.pop || 0));

                console.log('Top 5 países:', top5.map((item: any) => item.Name));
                console.log('Cantidad de países a mostrar:', top5.length);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [datasetUrl]);

    if (loading) return <div style={{ color: 'white' }}>Cargando datos...</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

    return (
        <MayChart
            labels={labels}
            data={data}
            label="Los 5 países con mayor población"
            type="bar"
        />
    );
};

export default FiltroMay;