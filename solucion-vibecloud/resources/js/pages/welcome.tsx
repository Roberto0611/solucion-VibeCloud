import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Cloud, Shield, Zap, Users, Lock, TrendingUp } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import EarthPage from './EarthPage';
import Typewriter from '../hooks/useTypewriter';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [viewMode, setViewMode] = React.useState<'countries' | 'cities'>('cities');
    const [selectedDataset, setSelectedDataset] = React.useState('/data/traffic_with_coordinates.json');

    // Update dataset when viewMode changes
    React.useEffect(() => {
        if (viewMode === 'cities') {
            setSelectedDataset('/data/traffic_with_coordinates.json');
        } else {
            setSelectedDataset('/data/traffic_by_country_with_coords.json');
        }
    }, [viewMode]);

    return (
        <>
            <Head title="Welcome to DriveCloud" />
            <div className="min-h-screen bg-black pb-20 overflow-x-hidden">
                <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/80 border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text align-middle ">
                        <div className="flex justify-between items-center h-16 p-md-8">
                            <motion.div
                                className="flex items-center space-x-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Cloud className="h-8 w-8 text-white" />
                                <span className="text-xl font-bold text-white">
                                    DriveCloud
                                </span>
                            </motion.div>
                            <motion.nav
                                className="flex items-center gap-4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                {auth.user ? (
                                    <Button asChild variant="default" size="default">
                                        <Link href={dashboard()}>
                                            Go to Dashboard
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button asChild variant="ghost" size="default">
                                            <Link href={login()}>
                                                Log in
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" size="default">
                                            <Link href={register()}>
                                                Register
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </motion.nav>
                        </div>
                    </div>
                </header>

                <section className="pb-20 px-4 sm:px-6 lg:px-8 space-y-10 pt-60">
                    <div className="max-w-7xl mx-auto  ">
                        <div className="text-center space-y-6">
                            <motion.h1
                                className="text-5xl md:text-7xl text-white font-bold leading-tight"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                Welcome to DriveCloud
                            </motion.h1>
                            <motion.p
                                className="text-lg md:text-xl text-gray-300 font-medium leading-relaxed max-w-3xl mx-auto"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            >
                                Create your free account today and experience saving time and money.
                            </motion.p>

                            <motion.div
                                className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                            >
                                {!auth.user && (
                                    <>
                                        <Button asChild variant="default" size="lg">
                                            <Link href={register()}>
                                                Get Started
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Canvas Section - Dividido en dos columnas */}
                <section className="py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
                    <div className="max-w-7xl mx-auto overflow-hidden">
                        {/* Botón de toggle para cambiar entre Countries y Cities */}
                        <motion.div
                            className="flex justify-center mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                        >

                        </motion.div>

                        <motion.div
                            className="grid md:grid-cols-2 gap-8"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                        >
                            {/* Columna del Canvas */}
                            <div className="flex flex-col items-center space-y-4 w-full max-w-full">
                                <div className="inline-flex rounded-lg border border-white/10 bg-black/50 p-1">
                                    <Button
                                        variant={viewMode === 'cities' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('cities')}
                                        className="px-6"
                                    >
                                        Cities
                                    </Button>
                                    <Button
                                        variant={viewMode === 'countries' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('countries')}
                                        className="px-6"
                                    >
                                        Countries
                                    </Button>
                                </div>
                                <div className="relative w-full max-w-full h-[400px] sm:h-[500px] md:h-[600px] rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
                                    <EarthPage selectedDataset={selectedDataset} />
                                </div>
                                <motion.div
                                    className="mt-8 text-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 1.2 }}
                                >
                                    <p className="text-sm text-gray-400 max-w-3xl mx-auto">
                                        Interactive 3D visualization showing global traffic delays in around 200 cities and 100 countries.
                                        Use your mouse to rotate and explore the globe (Data obtained via Kaggle in range from September 2024 to January 2025).
                                    </p>
                                </motion.div>





                            </div>


                            {/* Columna del Texto */}
                            <div className="flex flex-col justify-center space-y-6 p-8">
                                <motion.h2
                                    className="text-4xl md:text-5xl font-bold text-white"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.8 }}
                                >
                                    Don't be part of the statistics
                                </motion.h2>

                                <motion.p
                                    className="text-lg text-gray-300 leading-relaxed"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 1 }}
                                >
                                    Experience real-time route optimization and traffic analysis.
                                    Our intelligent system helps you save time and money on every trip.
                                </motion.p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section className="py-32 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                Why Choose DriveCloud?
                            </h2>
                            <p className="text-lg text-gray-300 font-medium leading-relaxed max-w-3xl mx-auto">
                                We care about your money and time, we provide a secure, fast, and intelligent solution giving you the best options for your transportation.
                            </p>
                        </motion.div>

                    </div>
                </section>
            </div>

        </>

    )
}





