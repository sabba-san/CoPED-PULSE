import { Head, Link } from '@inertiajs/react';

export default function Learn({ course, enrollment }) {
    return (
        <>
            <Head title={`Learn: ${course.title}`} />
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <div className="flex items-center space-x-4">
                                <Link href={route('portal')} className="text-sm text-gray-500 hover:text-gray-700">
                                    ← My Portal
                                </Link>
                                <span className="text-xl font-bold text-gray-900">{course.title}</span>
                            </div>
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
                </nav>

                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                        <p className="mt-1 text-gray-500">{course.description}</p>
                        <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            enrollment.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                        }`}>
                            {enrollment.status}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {course.modules?.map(module => (
                            <div key={module.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="p-4 border-b border-gray-200">
                                    <h2 className="text-lg font-medium text-gray-900">{module.title}</h2>
                                </div>
                                <ul className="divide-y divide-gray-200">
                                    {module.lessons?.map(lesson => (
                                        <li key={lesson.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                            <span className="text-sm text-gray-700">{lesson.title}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {(!course.modules || course.modules.length === 0) && (
                            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                                <p className="text-gray-500">No modules available yet.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
