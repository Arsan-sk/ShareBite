import { signup } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Heart, ArrowRight } from 'lucide-react'
import { PasswordInput } from '@/components/PasswordInput'

export default async function SignupPage(props: {
    searchParams: Promise<{ message: string }>
}) {
    const searchParams = await props.searchParams
    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side: Hero/Brand Area */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-teal-600 to-green-800 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="relative z-10 flex flex-col justify-between h-full p-12">
                    <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <Heart className="h-8 w-8 text-green-300 fill-green-300" />
                        <span>ShareBite</span>
                    </div>

                    <div className="space-y-6 max-w-lg mb-12">
                        <h1 className="text-5xl font-extrabold leading-tight">
                            Join the <br />
                            <span className="text-teal-200">Revolution.</span>
                        </h1>
                        <p className="text-lg text-green-100/90 leading-relaxed font-light">
                            Be the change your community needs. Whether you're a restaurant, an NGO, or a neighbor, your contribution matters.
                        </p>

                        <div className="grid grid-cols-2 gap-6 pt-4">
                            <div>
                                <div className="text-3xl font-bold text-teal-200">500+</div>
                                <div className="text-sm opacity-80">Meals Saved</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-teal-200">200+</div>
                                <div className="text-sm opacity-80">Volunteers</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute top-24 right-24 w-48 h-48 bg-emerald-400 rounded-full opacity-20 blur-3xl"></div>
            </div>

            {/* Right Side: Form Area */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-1/2 xl:px-24 bg-gray-50/50">
                <div className="mx-auto w-full max-w-sm lg:w-96 animate-fade-in-up">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                            Create your account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Already part of the family?{' '}
                            <Link href="/login" className="font-semibold text-green-600 hover:text-green-500 hover:underline transition-all">
                                Sign in instead
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8">
                        <div className="bg-white px-8 py-8 shadow-xl shadow-green-900/5 rounded-2xl border border-gray-100 ring-1 ring-black/5">
                            <form className="space-y-5">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1">
                                        Full Name / Organization
                                    </label>
                                    <Input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        required
                                        placeholder="Jane Doe / Tasty Bites Inc."
                                        className="h-11 rounded-xl bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-green-500 focus:border-green-500 transition-all"
                                    />
                                </div>

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
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        placeholder="••••••••"
                                        className="h-11 rounded-xl bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-green-500 focus:border-green-500 transition-all font-mono tracking-widest"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1">
                                        I am joining as...
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="role"
                                            name="role"
                                            className="block w-full h-11 pl-3 pr-10 text-base border-gray-200 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-xl bg-gray-50 transition-all cursor-pointer hover:bg-white"
                                            defaultValue="resident"
                                        >
                                            <option value="resident">🏠 Resident (Food Donor)</option>
                                            <option value="restaurant">🍳 Restaurant / Caterer</option>
                                            <option value="ngo">🤝 NGO / Charity</option>
                                            <option value="volunteer">🚚 Volunteer (Pickup & Deliver)</option>
                                        </select>
                                        {/* Custom chevron if needed, but browser default is okay for now */}
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">Choosing the right role helps us tailor your experience.</p>
                                </div>

                                {searchParams.message && (
                                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 flex items-center justify-center font-medium animate-pulse">
                                        {searchParams.message}
                                    </div>
                                )}

                                <div className="pt-2">
                                    <Button formAction={signup} className="w-full flex justify-center h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white shadow-lg shadow-teal-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                        Create Account
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
