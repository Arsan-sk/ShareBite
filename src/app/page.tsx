import Link from 'next/link'
import Image from 'next/image'
import { ContrastCarousel } from '@/components/ContrastCarousel'
import { Button } from '@/components/ui/button'
import { ArrowRight, Heart, Utensils, Info, Shield, Users, MapPin, Star, Linkedin, Github, Instagram } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'


export default async function LandingPage() {
    // Note: Middleware redirects logged-in users to /feed, so we don't strictly need auth check here.
    // Keeping it simple for guests.

    return (
        <div className="flex min-h-screen flex-col bg-white text-gray-900 font-sans selection:bg-green-100 selection:text-green-900">

            {/* 1️⃣ Navbar (Sticky & Minimal) */}
            <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <Heart className="h-6 w-6 text-green-600 fill-green-600 animate-pulse-slow" />
                        <span className="text-xl font-bold tracking-tight text-gray-900">ShareBite</span>
                    </div>
                    <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
                        <Link href="#problem" className="hover:text-green-600 transition-colors">Problem</Link>
                        <Link href="#solution" className="hover:text-green-600 transition-colors">Solution</Link>
                        <Link href="#impact" className="hover:text-green-600 transition-colors">Impact</Link>
                        <Link href="#community" className="hover:text-green-600 transition-colors">Community</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors">
                            Log in
                        </Link>
                        <Button asChild className="rounded-full bg-green-600 text-white hover:bg-green-700 px-6 shadow-lg shadow-green-200">
                            <Link href="/signup">Get Started</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1">

                {/* 2️⃣ Hero Section */}
                <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-800 mb-8 animate-fade-in-up">
                                <span className="flex h-2 w-2 rounded-full bg-green-600 mr-2 animate-pulse"></span>
                                Join the food rescue revolution
                            </div>
                            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6 leading-tight animate-fade-in-up delay-100">
                                Good food should <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">never go to waste.</span>
                            </h1>
                            <p className="mt-6 text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200">
                                Every day, tons of edible food are thrown away while millions go hungry. ShareBite connects surplus food to people who need it — in real time.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
                                <Button asChild size="lg" className="rounded-full bg-green-600 text-white hover:bg-green-700 px-8 text-lg h-12 shadow-xl shadow-green-200 hover:transform hover:scale-105 transition-all duration-300">
                                    <Link href="/signup">
                                        Start Sharing <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                {/* UPDATED: "See How It Works" button - changed to white text on dark background as requested */}
                                <Button asChild variant="outline" size="lg" className="rounded-full border-2 border-transparent bg-gray-900 text-white hover:bg-gray-800 hover:text-white px-8 text-lg h-12 hover:shadow-lg transition-all">
                                    <Link href="#solution">See How It Works</Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Background Blob */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-100/50 rounded-full blur-3xl -z-10 opacity-60 mix-blend-multiply animate-blob"></div>
                </section>

                {/* 3️⃣ The Contrast Section (Problem Reality) */}
                <section id="problem" className="py-24 bg-gray-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8">
                                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">The Reality We Can&apos;t Ignore.</h2>
                                <div className="space-y-6">
                                    <div className="p-6 bg-white rounded-2xl shadow-sm border-l-4 border-red-500">
                                        <div className="text-4xl font-bold text-gray-900 mb-2">1/3</div>
                                        <p className="text-gray-600 text-lg">of global food is wasted every single year.</p>
                                    </div>
                                    <div className="p-6 bg-white rounded-2xl shadow-sm border-l-4 border-orange-500">
                                        <div className="text-4xl font-bold text-gray-900 mb-2">9 Million+</div>
                                        <p className="text-gray-600 text-lg">deaths annually from hunger-related causes.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/20 to-transparent rounded-3xl z-10 pointer-events-none"></div>
                                {/* Updated: Using ContrastCarousel for animated loop */}
                                <div className="aspect-square rounded-3xl bg-gray-200 overflow-hidden relative shadow-2xl">
                                    <ContrastCarousel />
                                </div>
                                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl z-20 max-w-xs transition-transform hover:scale-105 duration-300">
                                    <p className="text-gray-900 font-medium italic">&quot;This is happening every day — even though we have enough food.&quot;</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4️⃣ Our Solution (ShareBite Explained) */}
                <section id="solution" className="py-24">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">How ShareBite Works</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">We built a seamless bridge between surplus and scarcity.</p>
                    </div>

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-8 relative">
                            {/* Connector Line (Desktop) */}
                            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-200 to-transparent -z-10"></div>

                            {[
                                { title: 'Source', icon: Utensils, desc: 'Restaurants & Homes post surplus food.' },
                                { title: 'Platform', icon: Heart, desc: 'ShareBite notifies nearby NGOs instantly.' },
                                { title: 'Logistics', icon: MapPin, desc: 'Volunteers execute pickup & delivery.' },
                                { title: 'Impact', icon: Users, desc: 'Food reaches those in need while fresh.' },
                            ].map((step, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg shadow-green-900/5 text-center hover:-translate-y-1 transition-transform border border-gray-100">
                                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6 text-green-600 relative z-10 ring-4 ring-white">
                                        <step.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                                    <p className="text-gray-600">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 5️⃣ Roles We Connect */}
                <section id="community" className="py-24 bg-green-900 text-white">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold sm:text-4xl mb-4">Everyone Has a Role to Play</h2>
                            <p className="text-lg text-green-100/80">Join the ecosystem of change-makers.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { role: 'Restaurant', icon: Utensils, action: 'Donate Surplus' },
                                { role: 'NGO', icon: Shield, action: 'Receive Food' },
                                { role: 'Volunteer', icon: MapPin, action: 'Deliver Items' },
                                { role: 'Resident', icon: Heart, action: 'Share & Support' },
                            ].map((card, idx) => (
                                <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
                                    <card.icon className="w-10 h-10 text-green-400 mb-4" />
                                    <h3 className="text-xl font-bold mb-1">{card.role}</h3>
                                    <p className="text-green-200 text-sm">{card.action}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 6️⃣ Live Impact Counters */}
                <section id="impact" className="py-20 bg-green-50 border-b border-green-100">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-green-200/50">
                            {[
                                { label: 'Meals Shared', val: '12.5k+' },
                                { label: 'Restaurants', val: '120+' },
                                { label: 'NGOs Connected', val: '45' },
                                { label: 'Volunteers', val: '300+' },
                            ].map((stat, idx) => (
                                <div key={idx} className="p-4">
                                    <div className="text-4xl lg:text-5xl font-extrabold text-green-700 mb-2">{stat.val}</div>
                                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 7️⃣ Why ShareBite is Different */}
                <section className="py-24">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row gap-16 items-center">
                            <div className="lg:w-1/2 ">
                                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-6">Why ShareBite?</h2>
                                <div className="space-y-6">
                                    {[
                                        { title: 'Real-time Matching', desc: 'Instant notifications ensure food is saved while fresh.' },
                                        { title: 'Verified NGOs', desc: 'We vet every partner to ensure safety and trust.' },
                                        { title: 'Impact Score', desc: 'Track your contribution and earn badges.' },
                                        { title: 'Hyper-local', desc: 'Community-first approach to minimize carbon footprint.' },
                                    ].map((feat, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                                                <Star className="w-5 h-5 fill-current" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{feat.title}</h4>
                                                <p className="text-gray-600 text-sm">{feat.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="lg:w-1/2 relative">
                                <div className="aspect-video rounded-3xl bg-gray-900 shadow-2xl flex items-center justify-center text-white overflow-hidden relative">
                                    {/* Updated: Using generated app mockup */}
                                    <Image
                                        src="/images/mockup.png"
                                        alt="ShareBite App Interface"
                                        fill
                                        className="object-cover"
                                        quality={95}
                                    />
                                </div>
                                {/* Decorative Elements */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-200 rounded-full blur-2xl -z-10 opacity-50"></div>
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-200 rounded-full blur-2xl -z-10 opacity-50"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 8️⃣ Join the Movement */}
                <section className="py-24 bg-gray-900 text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <h2 className="text-4xl font-bold mb-6">Be the reason someone eats today.</h2>
                        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">Whether you have food to give or time to share, your action matters.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" className="rounded-full bg-green-600 hover:bg-green-500 text-white px-8 h-14 text-lg">
                                <Link href="/signup?role=restaurant">Join as Restaurant</Link>
                            </Button>
                            <Button asChild size="lg" variant="secondary" className="rounded-full bg-white hover:bg-gray-100 text-gray-900 px-8 h-14 text-lg">
                                <Link href="/signup?role=volunteer">Join as Volunteer</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="rounded-full border-green-700 text-green-400 hover:text-green-300 hover:bg-green-900/50 px-8 h-14 text-lg">
                                <Link href="/signup?role=ngo">Partnet as NGO</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* 9️⃣ Contact Section */}
                <section id="contact" className="py-24 bg-white">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900">Get in Touch</h2>
                            <p className="text-gray-600">Have questions? We&apos;d love to hear from you.</p>
                        </div>

                        <form className="space-y-6 bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-lg shadow-gray-200/50">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                                    <input type="text" className="w-full h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500" placeholder="Your name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                    <input type="email" className="w-full h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500" placeholder="you@example.com" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                                <textarea rows={4} className="w-full rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500" placeholder="How can we help?"></textarea>
                            </div>
                            <Button className="w-full h-12 rounded-xl bg-gray-900 text-white hover:bg-gray-800 font-semibold text-lg">
                                Send Message
                            </Button>
                        </form>
                    </div>
                </section>
            </main>

            {/* 🔟 Footer */}
            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Heart className="h-6 w-6 text-green-600 fill-green-600" />
                        <span className="text-xl font-bold text-gray-900">ShareBite</span>
                    </div>
                    <div className="text-sm text-gray-500">
                        © {new Date().getFullYear()} ShareBite. All rights reserved.
                    </div>
                    <div className="flex gap-6">
                        <a href="https://www.linkedin.com/in/arsan-sk/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-600 transition-colors">
                            <span className="sr-only">LinkedIn</span>
                            <Linkedin className="w-6 h-6" />
                        </a>
                        <a href="https://github.com/Arsan-sk" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-600 transition-colors">
                            <span className="sr-only">GitHub</span>
                            <Github className="w-6 h-6" />
                        </a>
                        <a href="https://www.instagram.com/arsan_sk_09/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-600 transition-colors">
                            <span className="sr-only">Instagram</span>
                            <Instagram className="w-6 h-6" />
                        </a>
                    </div>
                </div>
            </footer>

        </div>
    )
}
