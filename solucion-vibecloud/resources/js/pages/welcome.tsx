import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Cloud, Shield, Zap, Users, Lock, TrendingUp } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';

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
                            </nav>
                        </div>
                    </div>
                </header>

                <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center space-y-6">
                            <h1 className="text-5xl text-white font-bold leading-tight">
                                Welcome to DriveCloud
                            </h1>
                            <p className="text-lg text-white font-bold leading-tight">
                                Create your free account today and experience of saving time and money.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                                {!auth.user && (
                                    <>
                                        <Button asChild variant="default" size="lg">
                                            <Link href={register()}>
                                                Get Started
                                            </Link>
                                        </Button>
                                    </>
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
                                We care about your money and time, we provide a secure, fast, and intelligent solution giving you the best options for your transportation.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}

