import { Head, Link, router } from '@inertiajs/react';
import StaffLayout from '@/Layouts/StaffLayout';

export default function Index({ courses }) {
    const destroy = (course) => {
        if (confirm(`Are you sure you want to delete "${course.title}"?`)) {
            router.delete(route('staff.courses.destroy', course));
        }
    };

    return (
        <StaffLayout>
            <Head title="Courses" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
                    <p className="mt-1 text-gray-500">Manage your training courses</p>
                </div>
                <Link
                    href={route('staff.courses.create')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    + New Course
                </Link>
            </div>

            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                {courses.data.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No courses yet.</p>
                        <Link
                            href={route('staff.courses.create')}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Create your first course
                        </Link>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {courses.data.map(course => (
                                <tr key={course.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <Link href={route('staff.courses.show', course)} className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                                            {course.title}
                                        </Link>
                                        {course.description && (
                                            <p className="mt-1 text-sm text-gray-500 line-clamp-1">{course.description}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            course.status === 'published' ? 'bg-green-100 text-green-800' :
                                            course.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {course.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(course.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                                        <Link href={route('staff.courses.edit', course)} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                                        <button onClick={() => destroy(course)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {courses.links && (
                <div className="mt-6 flex justify-center space-x-2">
                    {courses.links.map((link, i) => (
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
        </StaffLayout>
    );
}
