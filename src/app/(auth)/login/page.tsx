import { login } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Heart, ArrowRight } from 'lucide-react'
import { PasswordInput } from '@/components/PasswordInput'

export default async function LoginPage(props: {
    searchParams: Promise<{ message: string }>
}) {
    const searchParams = await props.searchParams

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side: Hero/Brand Area - Hidden on mobile, visible on lg screens */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-green-600 to-emerald-800 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="relative z-10 flex flex-col justify-between h-full p-12">
                    <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <Heart className="h-8 w-8 text-green-300 fill-green-300" />
                        <span>ShareBite</span>
                    </div>

                    <div className="space-y-6 max-w-lg mb-12">
                        <h1 className="text-5xl font-extrabold leading-tight">
                            Share Food. <br />
                            <span className="text-green-200">Share Love.</span>
                        </h1>
                        <p className="text-lg text-green-100/90 leading-relaxed font-light">
                            Join our community of donors and volunteers making sure no food goes to waste.
                            Connect, share, and make a real difference in your neighborhood today.
                        </p>

                        <div className="flex gap-4 pt-4">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-green-600 bg-green-200" />
                                ))}
                            </div>
                            <div className="text-sm flex flex-col justify-center">
                                <span className="font-bold">1k+ Community Members</span>
                                <span className="text-green-200 text-xs">Making impact daily</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-500 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-400 rounded-full opacity-20 blur-3xl"></div>
            </div>

            {/* Right Side: Form Area */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-1/2 xl:px-24 bg-gray-50/50">
                <div className="mx-auto w-full max-w-sm lg:w-96 animate-fade-in-up">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                            Welcome back
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="font-semibold text-green-600 hover:text-green-500 hover:underline transition-all">
                                Join the movement
                            </Link>
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="bg-white px-8 py-8 shadow-xl shadow-green-900/5 rounded-2xl border border-gray-100 ring-1 ring-black/5">
                            <form className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                                        Email address
                                    </label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        placeholder="you@example.com"
                                        className="h-11 rounded-xl bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-green-500 focus:border-green-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                            Password
                                        </label>
                                        <div className="text-sm">
                                            <a href="#" className="font-medium text-green-600 hover:text-green-500">
                                                Forgot password?
                                            </a>
                                        </div>
                                    </div>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        autoComplete="current-password"
                                        required
                                        placeholder="••••••••"
                                        className="h-11 rounded-xl bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-green-500 focus:border-green-500 transition-all font-mono tracking-widest"
                                    />
                                </div>

                                {searchParams.message && (
                                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 flex items-center justify-center font-medium animate-pulse">
                                        {searchParams.message}
                                    </div>
                                )}

                                <div>
                                    <Button formAction={login} className="w-full flex justify-center h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                        Sign in
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
