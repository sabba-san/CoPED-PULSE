import { Head, Link } from '@inertiajs/react';
import LearnerLayout from '@/Layouts/design_v1/LearnerLayout';

export default function Portal({ enrollments }) {
    return (
        <LearnerLayout>
            <Head title="My Learning Portal" />
            
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-700 tracking-tight mb-4">
                    My Learning Portal
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
                    Welcome back! Here are the courses you are currently enrolled in.
                </p>
            </div>

            {enrollments.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-sm">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-xl text-gray-500 font-medium mb-6">You are not enrolled in any courses yet.</p>
                    <Link
                        href={route('learner.catalog')}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                        Browse Course Catalog
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {enrollments.data.map(enrollment => (
                        <div 
                            key={enrollment.id} 
                            className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-indigo-500/5 mix-blend-overlay group-hover:bg-indigo-500/10 transition-colors duration-300"></div>
                                <h3 className="text-xl font-bold text-indigo-900 text-center relative z-10 group-hover:scale-105 transition-transform duration-300">
                                    {enrollment.course?.title}
                                </h3>
                                
                                <div className="absolute top-4 right-4 z-20">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${
                                        enrollment.completed_at
                                            ? 'bg-green-100/90 text-green-800 border border-green-200'
                                            : 'bg-blue-100/90 text-blue-800 border border-blue-200'
                                    }`}>
                                        {enrollment.completed_at ? 'COMPLETED' : 'ENROLLED'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-8 flex flex-col flex-grow">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                                        {enrollment.course?.instructor?.name?.charAt(0)}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">
                                        {enrollment.course?.instructor?.name || 'Instructor'}
                                    </span>
                                </div>
                                
                                <div className="flex-grow"></div>
                                
                                <Link
                                    href={route('learner.course.learn', enrollment.course)}
                                    className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg hover:from-indigo-500 hover:to-purple-500 transform hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex justify-center items-center space-x-2"
                                >
                                    <span>Continue Learning</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {enrollments.links && enrollments.links.length > 3 && (
                <div className="mt-12 flex justify-center space-x-2">
                    {enrollments.links.map((link, i) => (
                        link.url ? (
                            <Link
                                key={i}
                                href={link.url}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    link.active 
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={i}
                                className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 text-gray-400 border border-gray-100"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )
                    ))}
                </div>
            )}
        </LearnerLayout>
    );
}
