import { Head, Link } from '@inertiajs/react';
import StaffLayout from '@/Layouts/design_v1/StaffLayout';

export default function Show({ course }) {
    return (
        <StaffLayout>
            <Head title={course.title} />

            <div className="mb-8">
                <Link
                    href={route('staff.courses.index')}
                    className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 mb-4 transition-colors"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Courses
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-3">
                            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 to-teal-700 tracking-tight">
                                {course.title}
                            </h1>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                                course.status === 'published' ? 'bg-green-100 text-green-800 border border-green-200' :
                                course.status === 'archived' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                                'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            }`}>
                                {course.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <Link
                        href={route('staff.courses.edit', course)}
                        className="inline-flex items-center px-6 py-2.5 border border-gray-200 text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all duration-200"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Edit Course
                    </Link>
                </div>
            </div>

            {course.description && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                        Description
                    </h2>
                    <p className="text-gray-600 leading-relaxed text-lg">{course.description}</p>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <svg className="w-5 h-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        Course Curriculum
                    </h2>
                </div>

                {(!course.modules || course.modules.length === 0) ? (
                    <div className="text-center py-16 px-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </div>
                        <p className="text-gray-500 font-medium">No modules have been added to this course yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {course.modules.map((module, i) => (
                            <div key={module.id} className="p-8 hover:bg-gray-50/50 transition-colors">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 text-sm mr-3">
                                        {i + 1}
                                    </span>
                                    {module.title}
                                </h3>
                                
                                {module.lessons && module.lessons.length > 0 ? (
                                    <div className="ml-11 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                        <ul className="divide-y divide-gray-50">
                                            {module.lessons.map((lesson, j) => (
                                                <li key={lesson.id} className="flex items-center p-4 hover:bg-gray-50 transition-colors group">
                                                    <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold mr-3 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                                        {j + 1}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{lesson.title}</span>
                                                    
                                                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="ml-11 text-sm text-gray-500 italic">No lessons in this module.</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </StaffLayout>
    );
}
