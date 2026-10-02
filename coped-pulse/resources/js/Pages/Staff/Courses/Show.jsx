import { Head, Link } from '@inertiajs/react';
import StaffLayout from '@/Layouts/StaffLayout';

export default function Show({ course }) {
    return (
        <StaffLayout>
            <Head title={course.title} />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Link href={route('staff.courses.index')} className="text-sm text-gray-500 hover:text-gray-700">
                        ← Back to Courses
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">{course.title}</h1>
                    <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        course.status === 'published' ? 'bg-green-100 text-green-800' :
                        course.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                        {course.status}
                    </span>
                </div>
                <Link
                    href={route('staff.courses.edit', course)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Edit Course
                </Link>
            </div>

            {course.description && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
                    <p className="text-gray-600">{course.description}</p>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Modules</h2>
                </div>

                {(!course.modules || course.modules.length === 0) ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No modules yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {course.modules.map((module, i) => (
                            <div key={module.id} className="p-6">
                                <h3 className="text-md font-medium text-gray-900">
                                    Module {i + 1}: {module.title}
                                </h3>
                                {module.lessons && module.lessons.length > 0 && (
                                    <ul className="mt-3 space-y-2">
                                        {module.lessons.map((lesson, j) => (
                                            <li key={lesson.id} className="flex items-center text-sm text-gray-600">
                                                <span className="mr-2 text-gray-400">{j + 1}.</span>
                                                {lesson.title}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </StaffLayout>
    );
}
