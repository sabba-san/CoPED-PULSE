import { Head, Link, useForm } from '@inertiajs/react';

export default function Login() {
    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('login'));
    };

    return (
        <>
            <Head title="Login" />
            
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Decorative background blobs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

                <div className="max-w-md w-full relative z-10">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 sm:p-10 transition-all duration-300">
                        <div className="text-center mb-10">
                            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
                                CoPED PULSE
                            </h2>
                            <p className="mt-3 text-base text-gray-500 font-medium">
                                Welcome back! Please enter your details.
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={submit}>
                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">Email address</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={form.data.email}
                                        onChange={e => form.setData('email', e.target.value)}
                                        className="appearance-none block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                                        placeholder="Enter your email"
                                    />
                                    {form.errors.email && <p className="mt-2 text-red-500 text-sm font-medium">{form.errors.email}</p>}
                                </div>
                                
                                <div>
                                    <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={form.data.password}
                                        onChange={e => form.setData('password', e.target.value)}
                                        className="appearance-none block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                                        placeholder="Enter your password"
                                    />
                                    {form.errors.password && <p className="mt-2 text-red-500 text-sm font-medium">{form.errors.password}</p>}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember"
                                        name="remember"
                                        type="checkbox"
                                        checked={form.data.remember}
                                        onChange={e => form.setData('remember', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                    />
                                    <label htmlFor="remember" className="ml-2 block text-sm font-medium text-gray-600 cursor-pointer select-none">Remember me for 30 days</label>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                                >
                                    {form.processing ? 'Signing in...' : 'Sign in'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link href={route('register')} className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                                    Sign up for free
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
