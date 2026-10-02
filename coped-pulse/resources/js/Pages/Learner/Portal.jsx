import { Head, Link } from '@inertiajs/react';

export default function Portal({ enrollments }) {
    return (
        <>
            <Head title="My Learning Portal" />
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <span className="text-xl font-bold text-gray-900">CoPED PULSE</span>
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
                        <h1 className="text-3xl font-bold text-gray-900">My Learning Portal</h1>
                        <p className="mt-1 text-gray-500">Your enrolled courses</p>
                    </div>

                    {enrollments.data.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                            <p className="text-gray-500">You are not enrolled in any courses yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {enrollments.data.map(enrollment => (
                                <div key={enrollment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {enrollment.course?.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Instructor: {enrollment.course?.instructor?.name}
                                    </p>
                                    <div className="mt-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            enrollment.status === 'completed'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {enrollment.status}
                                        </span>
                                    </div>
                                    <div className="mt-4">
                                        <Link
                                            href={route('learner.course.learn', enrollment.course)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            Continue Learning
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {enrollments.links && (
                        <div className="mt-6 flex justify-center space-x-2">
                            {enrollments.links.map((link, i) => (
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="px-3 py-1 rounded text-sm bg-white text-gray-400 border border-gray-200"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
