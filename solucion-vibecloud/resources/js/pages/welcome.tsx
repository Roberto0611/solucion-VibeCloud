import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Cloud, Shield, Zap, Users, Lock, TrendingUp } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome to DriveCloud" />
            <div className="min-h-screen bg-black">
                <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-black">
                        <div className="flex justify-between items-center h-16 bg-black">
                            <div className="flex items-center space-x-2 bg-black">
                                <Cloud className="h-8 w-8 bg-black" />
                                <span className="text bg-black">
                                    DriveCloud
                                </span>
                            </div>

                            <nav className="flex items-center gap-4 bg-black">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex items-center px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="inline-flex items-center px-6 py-2 rounded-lg text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center px-6 py-2 rounded-lg text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center space-y-8">
                            <h1 className="text-5xl text-white font-bold leading-tight">
                                Your Data, Elevated to the Cloud
                            </h1>
                            <p className="text-lg text-white font-bold leading-tight">
                                Secure, fast, and intelligent cloud storage solution for modern businesses and individuals.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                                {!auth.user && (
                                    <>
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center px-8 py-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 text-white dark:text-slate-300 text-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                                {auth.user && (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex items-center px-8 py-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 text-white dark:text-slate-300 text-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                                    >
                                        Go to Dashboard
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                                Why Choose DriveCloud?
                            </h2>
                            <p className="text-lg text-white font-bold leading-tight">
                                Care about your money and time
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}

