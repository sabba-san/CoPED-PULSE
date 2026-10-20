import { Head, Link, router } from '@inertiajs/react';
import StaffLayout from '@/Layouts/design_v1/StaffLayout';
import Can from '@/Components/Can';
import CourseLogoBadge from '@/Components/flat/CourseLogoBadge';

export default function Index({ courses }) {
    const destroy = (course) => {
        if (confirm(`Are you sure you want to delete "${course.title}"?`)) {
            router.delete(route('staff.courses.destroy', course));
        }
    };

    return (
        <StaffLayout>
            <Head title="Courses" />

            <Link
                href={route('dashboard')}
                className="inline-flex items-center text-sm font-semibold text-[#10B981] hover:text-emerald-700 mb-4 transition-colors"
            >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Main page
            </Link>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight font-display">
                        My Courses
                    </h1>
                    <p className="mt-2 text-base sm:text-lg text-gray-600">
                        Manage your training curriculum
                    </p>
                </div>
                <Can roles={['staff']}>
                    <Link
                        href={route('staff.courses.create')}
                        className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold rounded-md text-white bg-[#10B981] hover:bg-emerald-600 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        New Course
                    </Link>
                </Can>
            </div>

            <div className="bg-white rounded-md border-2 border-[#E5E7EB] overflow-hidden">
                {courses.data.length === 0 ? (
                    <div className="text-center py-20 px-4">
                        <div className="w-20 h-20 bg-emerald-50 rounded-md flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-[#111827] mb-2 font-display">No courses yet</h3>
                        <p className="text-gray-600 max-w-sm mx-auto mb-8 text-sm">Get started by creating your first course and sharing your knowledge.</p>
                        <Can roles={['staff']}>
                            <Link
                                href={route('staff.courses.create')}
                                className="inline-flex items-center px-6 py-3 text-sm font-bold rounded-md text-white bg-[#10B981] hover:bg-emerald-600 transition-colors"
                            >
                                Create your first course
                            </Link>
                        </Can>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y-2 divide-[#E5E7EB]">
                            <thead className="bg-[#F9FAFB]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Course Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y-2 divide-[#E5E7EB]">
                                {courses.data.map(course => (
                                    <tr key={course.id} className="hover:bg-[#F9FAFB] transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                <CourseLogoBadge category={course.category_logo} size="badge" />
                                                <span className="text-[10px] font-bold text-gray-600 bg-[#F3F4F6] border border-[#E5E7EB] px-2 py-0.5 rounded">
                                                    📅 {course.academic_year || '2026 / 2027'}
                                                </span>
                                                {course.billing_type === 'subscription' ? (
                                                    <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded">
                                                        RM {Number(course.price || 0).toFixed(2)}/mo
                                                    </span>
                                                ) : course.billing_type === 'one_time' ? (
                                                    <span className="text-[10px] font-extrabold text-blue-800 bg-blue-50 border border-blue-300 px-2 py-0.5 rounded">
                                                        RM {Number(course.price || 0).toFixed(2)}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                                                        FREE
                                                    </span>
                                                )}
                                            </div>
                                            <Link href={route('staff.courses.show', course)} className="text-base font-bold text-[#111827] hover:text-[#10B981] transition-colors block mb-1">
                                                {course.title}
                                            </Link>
                                            {course.description && (
                                                <p className="text-sm text-gray-600 line-clamp-1 max-w-md">{course.description}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                                                course.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                                                course.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {course.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gray-600 font-medium">
                                            {new Date(course.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5 text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-3">
                                                {course.status === 'draft' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(route('staff.courses.deploy', course.id), {}, { preserveScroll: true })}
                                                        className="text-xs font-bold bg-[#10B981] hover:bg-emerald-600 text-white px-2.5 py-1 rounded transition-colors"
                                                    >
                                                        Deploy Live
                                                    </button>
                                                )}
                                                <Link href={route('staff.courses.edit', course)} className="text-[#3B82F6] hover:underline font-bold transition-colors">Edit</Link>
                                                <button onClick={() => destroy(course)} className="text-red-600 hover:underline font-bold transition-colors">Delete</button>
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
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${
                                    link.active 
                                        ? 'bg-[#111827] text-white' 
                                        : 'bg-white text-gray-700 border-2 border-[#E5E7EB] hover:bg-[#F3F4F6]'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={i}
                                className="px-4 py-2 rounded-md text-sm font-bold bg-[#F3F4F6] text-gray-400 border-2 border-transparent"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )
                    ))}
                </div>
            )}
        </StaffLayout>
    );
}
