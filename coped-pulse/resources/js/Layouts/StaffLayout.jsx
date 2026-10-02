import { Link } from '@inertiajs/react';

export default function StaffLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href={route('dashboard')} className="text-xl font-bold text-gray-900">
                                CoPED PULSE
                            </Link>
                            <div className="ml-8 flex space-x-4">
                                <Link
                                    href={route('staff.courses.index')}
                                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                                >
                                    Courses
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="text-sm font-medium text-gray-500 hover:text-gray-700"
                            >
                                Logout
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}