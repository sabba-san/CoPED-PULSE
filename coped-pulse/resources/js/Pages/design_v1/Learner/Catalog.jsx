import { Head, Link, router } from '@inertiajs/react';
import LearnerLayout from '@/Layouts/design_v1/LearnerLayout';

export default function Catalog({ courses }) {
    const handleEnroll = (courseId) => {
        router.post(route('learner.catalog.enroll', courseId));
    };

    return (
        <LearnerLayout>
            <Head title="Course Catalog" />
            
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-700 tracking-tight mb-4">
                    Explore Courses
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
                    Discover new skills and knowledge. Browse our curated selection of high-quality courses and enroll today.
                </p>
            </div>

            {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-sm">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-xl text-gray-500 font-medium">No published courses available right now.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => (
                        <div 
                            key={course.id} 
                            className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-indigo-500/5 mix-blend-overlay group-hover:bg-indigo-500/10 transition-colors duration-300"></div>
                                <h3 className="text-2xl font-bold text-indigo-900 text-center relative z-10 group-hover:scale-105 transition-transform duration-300">
                                    {course.title}
                                </h3>
                            </div>
                            
                            <div className="p-8 flex flex-col flex-grow">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                                        {course.instructor?.name?.charAt(0)}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">
                                        {course.instructor?.name || 'Instructor'}
                                    </span>
                                </div>
                                
                                <p className="text-gray-600 line-clamp-3 mb-8 flex-grow leading-relaxed">
                                    {course.description || 'No description provided.'}
                                </p>
                                
                                <button
                                    onClick={() => handleEnroll(course.id)}
                                    className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg hover:from-indigo-500 hover:to-purple-500 transform hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex justify-center items-center space-x-2"
                                >
                                    <span>Enroll Now</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </LearnerLayout>
    );
}
