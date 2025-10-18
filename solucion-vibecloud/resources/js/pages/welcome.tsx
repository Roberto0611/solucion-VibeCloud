import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Cloud, Shield, Zap, Users, Lock, TrendingUp, MapPin, BarChart3, Download, Calendar, Globe, Smartphone } from 'lucide-react';
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

    const features = [
        {
            icon: <MapPin className="h-12 w-12 text-blue-500" />,
            title: "Smart Route Planning",
            description: "Plan your trips with real-time price predictions. Select pickup and drop-off zones on an interactive map and get instant fare estimates for both Uber and Yellow Taxi services."
        },
        {
            icon: <BarChart3 className="h-12 w-12 text-green-500" />,
            title: "Advanced Analytics",
            description: "Access comprehensive statistics with interactive charts showing price trends, traffic volume, and tip amounts. Compare Uber vs Yellow Taxi data across different months and years (2019-2024)."
        },
        {
            icon: <Download className="h-12 w-12 text-purple-500" />,
            title: "Export Your Data",
            description: "Download your trip history in multiple formats (CSV, JSON). Generate detailed reports with statistics including total trips, average prices, and total distances traveled."
        },
        {
            icon: <Calendar className="h-12 w-12 text-yellow-500" />,
            title: "Trip History & Schedule",
            description: "Keep track of all your planned trips with date, time, route details, and predicted prices. Easily manage and review your transportation history in one place."
        },
        {
            icon: <Globe className="h-12 w-12 text-cyan-500" />,
            title: "Interactive Zone Maps",
            description: "Visualize NYC taxi zones with color-coded price ranges (green for low, yellow for medium, red for high). Explore 200+ pickup/drop-off locations with detailed zone information."
        },
        {
            icon: <Smartphone className="h-12 w-12 text-pink-500" />,
            title: "Fully Responsive Design",
            description: "Access DriveCloud seamlessly on any device - desktop, tablet, or mobile. Our adaptive interface ensures a perfect experience regardless of screen size, so you can plan trips on the go."
        },
        {
            icon: <TrendingUp className="h-12 w-12 text-orange-500" />,
            title: "Real-Time Predictions",
            description: "Our AI-powered model analyzes pickup time, location, and distance to provide accurate fare predictions. Get instant insights on expected costs before booking your ride."
        },
        {
            icon: <Shield className="h-12 w-12 text-red-500" />,
            title: "Secure & Private",
            description: "Your data is stored locally with complete privacy. We prioritize security with encrypted connections and don't share your personal information with third parties."
        },
        {
            icon: <Zap className="h-12 w-12 text-indigo-500" />,
            title: "Lightning Fast",
            description: "Experience instant route calculations and price predictions. Our optimized system ensures you get results in milliseconds, saving you valuable time when planning your trips."
        }
    ];

    return (
        <>
            <Head title="Welcome to DriveCloud" />
            <div className="min-h-screen bg-black overflow-x-hidden">
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
                <section className="py-16 md:py-32 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            className="grid md:grid-cols-2 gap-8 md:gap-12"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                        >
                            {/* Columna del Canvas */}
                            <div className="flex flex-col items-center space-y-4 w-full">
                                <div className="inline-flex rounded-lg border border-white/10 bg-black/50 p-1">
                                    <Button
                                        variant={viewMode === 'cities' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('cities')}
                                        className="px-4 sm:px-6 text-xs sm:text-sm"
                                    >
                                        Cities
                                    </Button>
                                    <Button
                                        variant={viewMode === 'countries' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('countries')}
                                        className="px-4 sm:px-6 text-xs sm:text-sm"
                                    >
                                        Countries
                                    </Button>
                                </div>
                                <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
                                    <EarthPage selectedDataset={selectedDataset} />
                                </div>
                                <motion.div
                                    className="mt-4 text-center px-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 1.2 }}
                                >
                                    <p className="text-xs sm:text-sm text-gray-400 max-w-3xl mx-auto">
                                        Interactive 3D visualization showing the average global traffic delays in around 200 cities and 100 countries.
                                        Use your mouse to rotate and explore the globe (Data obtained via Kaggle in range from September 2024 to January 2025, the negative numbers represents that the delay was lower than the last range).
                                    </p>
                                </motion.div>
                            </div>

                            {/* Columna del Texto */}
                            <div className="flex flex-col justify-center space-y-4 sm:space-y-6 p-4 sm:p-6 md:p-8">
                                <motion.h2
                                    className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.8 }}
                                >
                                    Don't be part of the statistics
                                </motion.h2>

                                <motion.p
                                    className="text-base sm:text-lg text-gray-300 leading-relaxed"
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

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    className="relative p-8 rounded-2xl bg-black border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <div className="mb-4">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA Section */}
                        <motion.div
                            className="mt-20 text-center"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                Ready to Start Saving?
                            </h3>

                            {/* Footer Credits */}
                            <div className="mt-16 pt-8 border-t border-white/10">
                                <div className="flex flex-col items-center gap-3">
                                    <p className="text-sm text-gray-500">
                                        Powered by <span className="text-orange-500 font-semibold">Amazon Web Services (AWS)</span>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Created by <span className="text-white font-medium">Aldo Karim</span> & <span className="text-white font-medium">Roberto Ochoa</span>
                                    </p>
                                    <p className="text-xs text-gray-600 mt-2">
                                        © {new Date().getFullYear()} DriveCloud.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
        </>
    );
}