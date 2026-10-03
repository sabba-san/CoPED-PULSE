import { Head, Link, router } from '@inertiajs/react';
import StaffLayout from '@/Layouts/design_v1/StaffLayout';

export default function Index({ courses }) {
    const destroy = (course) => {
        if (confirm(`Are you sure you want to delete "${course.title}"?`)) {
            router.delete(route('staff.courses.destroy', course));
        }
    };

    return (
        <StaffLayout>
            <Head title="Courses" />

            <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 to-teal-700 tracking-tight">
                        My Courses
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Manage your training curriculum
                    </p>
                </div>
                <Link
                    href={route('staff.courses.create')}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-full text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New Course
                </Link>
            </div>

            <div className="bg-white shadow-sm rounded-3xl border border-gray-100 overflow-hidden">
                {courses.data.length === 0 ? (
                    <div className="text-center py-20 px-4">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No courses yet</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8">Get started by creating your first course and sharing your knowledge.</p>
                        <Link
                            href={route('staff.courses.create')}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-full text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md transition-all duration-200"
                        >
                            Create your first course
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Course Details</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {courses.data.map(course => (
                                    <tr key={course.id} className="hover:bg-gray-50/80 transition-colors duration-150">
                                        <td className="px-8 py-6">
                                            <Link href={route('staff.courses.show', course)} className="text-base font-bold text-gray-900 hover:text-emerald-600 transition-colors block mb-1">
                                                {course.title}
                                            </Link>
                                            {course.description && (
                                                <p className="text-sm text-gray-500 line-clamp-1 max-w-md">{course.description}</p>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                                course.status === 'published' ? 'bg-green-100/80 text-green-800 border border-green-200' :
                                                course.status === 'archived' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                                                'bg-yellow-100/80 text-yellow-800 border border-yellow-200'
                                            }`}>
                                                {course.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                                            {new Date(course.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6 text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-4">
                                                <Link href={route('staff.courses.edit', course)} className="text-indigo-500 hover:text-indigo-700 font-bold transition-colors">Edit</Link>
                                                <button onClick={() => destroy(course)} className="text-red-500 hover:text-red-700 font-bold transition-colors">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {courses.links && courses.links.length > 3 && (
                <div className="mt-8 flex justify-center space-x-2">
                    {courses.links.map((link, i) => (
                        link.url ? (
                            <Link
                                key={i}
                                href={link.url}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                                    link.active 
                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' 
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={i}
                                className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-50 text-gray-400 border border-gray-100"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )
                    ))}
                </div>
            )}
        </StaffLayout>
    );
}
