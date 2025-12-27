import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, Layout, QrCode, Smartphone, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            {/* Navigation */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="container px-4 md:px-6 h-14 flex items-center justify-between mx-auto">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <Layout className="h-6 w-6 text-primary" />
                        <span>MenuBuilder</span>
                    </div>
                    <nav className="flex items-center gap-4 sm:gap-6">
                        <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
                            Features
                        </Link>
                        <Link className="text-sm font-medium hover:underline underline-offset-4" href="#pricing">
                            Pricing
                        </Link>
                        <Link href="/admin">
                            <Button size="sm">Dashboard</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 px-4 md:px-6">
                    <div className="container mx-auto grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
                        <div className="flex flex-col justify-center space-y-4">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">Create Digital Menus in Minutes</h1>
                                <p className="max-w-150 text-gray-500 md:text-xl dark:text-gray-400">
                                    Transform your restaurant&apos;s dining experience with contactless QR code menus. Real-time updates, beautiful designs, and
                                    zero friction.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                <Link href="/admin">
                                    <Button size="lg" className="w-full min-[400px]:w-auto group">
                                        Get Started <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                                <Link href="#features">
                                    <Button variant="outline" size="lg" className="w-full min-[400px]:w-auto">
                                        Learn More
                                    </Button>
                                </Link>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" /> No credit card required
                                </div>
                                <div className="flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" /> Free tier available
                                </div>
                            </div>
                        </div>

                        {/* Hero Image / Monitor Mockup */}
                        <div className="mx-auto aspect-video overflow-hidden rounded-xl border bg-muted/50 w-full lg:order-last relative shadow-2xl">
                            <div className="absolute inset-0 bg-linear-to-tr from-primary/10 to-background flex items-center justify-center">
                                <div className="text-center p-6 space-y-4">
                                    <Smartphone className="h-16 w-16 mx-auto text-primary animate-pulse" />
                                    <p className="text-muted-foreground font-medium">Scan & Order Preview</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
                    <div className="container px-4 md:px-6 mx-auto">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Key Features</div>
                            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Everything you need to run your menu</h2>
                            <p className="max-w-225 text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                                Our platform provides all the tools to manage your items, categories, and availability instantly.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="bg-background/60 backdrop-blur-sm">
                                <CardHeader>
                                    <QrCode className="h-10 w-10 text-primary mb-2" />
                                    <CardTitle>Instant QR Codes</CardTitle>
                                    <CardDescription>Generate unique QR codes for each table or shop location instantly. Print and go.</CardDescription>
                                </CardHeader>
                            </Card>
                            <Card className="bg-background/60 backdrop-blur-sm">
                                <CardHeader>
                                    <Zap className="h-10 w-10 text-primary mb-2" />
                                    <CardTitle>Real-time Updates</CardTitle>
                                    <CardDescription>Change prices, hide out-of-stock items, or add specials instantly without re-printing.</CardDescription>
                                </CardHeader>
                            </Card>
                            <Card className="bg-background/60 backdrop-blur-sm">
                                <CardHeader>
                                    <Layout className="h-10 w-10 text-primary mb-2" />
                                    <CardTitle>Easy Management</CardTitle>
                                    <CardDescription>Drag-and-drop interface to organize categories and items. Simple, intuitive admin panel.</CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6 mx-auto">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center bg-primary text-primary-foreground rounded-3xl p-8 md:p-16">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to digitize your restaurant?</h2>
                                <p className="max-w-150 mx-auto text-primary-foreground/80 md:text-xl">
                                    Join thousands of restaurant owners who have modernized their ordering process.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 min-[400px]:flex-row pt-4">
                                <Link href="/admin">
                                    <Button size="lg" variant="secondary" className="w-full min-[400px]:w-auto font-bold">
                                        Create Free Account
                                    </Button>
                                </Link>
                                <Link href="#">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full min-[400px]:w-auto bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                                    >
                                        Contact Sales
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
                <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 MenuBuilder Inc. All rights reserved.</p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-xs hover:underline underline-offset-4" href="#">
                        Terms of Service
                    </Link>
                    <Link className="text-xs hover:underline underline-offset-4" href="#">
                        Privacy
                    </Link>
                </nav>
            </footer>
        </div>
    );
}
