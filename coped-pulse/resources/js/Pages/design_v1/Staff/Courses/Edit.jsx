import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import StaffLayout from '@/Layouts/design_v1/StaffLayout';
import ModuleCard from './Partials/ModuleCard';

export default function Edit({ course }) {
    const { flash } = usePage().props;
    const { data, setData, put, processing, errors } = useForm({
        title: course.title || '',
        description: course.description || '',
        status: course.status || 'draft',
    });

    const addModule = () => {
        router.post(route('staff.courses.modules.store', course.id), {
            title: 'Untitled Module',
            content_type: 'link',
        });
    };

    const submitCourse = (e) => {
        e.preventDefault();
        put(route('staff.courses.update', course));
    };

    return (
        <StaffLayout>
            <Head title={`Edit: ${course.title}`} />

            <div className="max-w-4xl mx-auto space-y-12">
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-6 py-4 text-sm font-medium">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-4 text-sm font-medium">
                        {flash.error}
                    </div>
                )}
                <div>
                    <Link
                        href={route('staff.courses.index')}
                        className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Courses
                    </Link>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 to-teal-700 tracking-tight">
                        Edit Course
                    </h1>
                </div>

                <form onSubmit={submitCourse} className="bg-white/80 backdrop-blur-md shadow-lg rounded-3xl p-8 space-y-8 border border-gray-100">
                    <div>
                        <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">
                            Course Title
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            required
                            className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 sm:text-sm"
                        />
                        {errors.title && (
                            <p className="mt-2 text-red-500 text-sm font-medium">{errors.title}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">
                            Course Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={5}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 sm:text-sm resize-none"
                        />
                        {errors.description && (
                            <p className="mt-2 text-red-500 text-sm font-medium">{errors.description}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-bold text-gray-700 mb-2">
                            Publication Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            required
                            className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 sm:text-sm appearance-none"
                        >
                            <option value="draft">Draft - Hidden from learners</option>
                            <option value="published">Published - Visible to everyone</option>
                            <option value="archived">Archived - Read only</option>
                        </select>
                        {errors.status && (
                            <p className="mt-2 text-red-500 text-sm font-medium">{errors.status}</p>
                        )}
                    </div>

                    <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-end space-x-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-500 hover:to-teal-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>

                {/* Course Modules Section */}
                <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-3xl p-8 border border-gray-100">
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Course Modules</h2>
                    <p className="text-sm text-gray-500 mb-6">Click a module to edit its content, media, and mini-quiz.</p>
                    
                    <div className="space-y-3 sm:space-y-4 mb-10">
                        {course.modules && course.modules.length > 0 ? (
                            course.modules.map((module, index) => (
                                <ModuleCard
                                    key={module.id}
                                    course={course}
                                    module={module}
                                    index={index}
                                    quizCount={course.assessments?.filter((q) => q.module_id === module.id).length || 0}
                                />
                            ))
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                                <p className="text-gray-500 font-medium">No modules added yet. Create your first module below.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={addModule}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 shadow-md transition-all disabled:opacity-50"
                        >
                            + Add Module
                        </button>
                    </div>
                </div>

                {/* Final Quiz — dedicated page */}
                <Link
                    href={route('staff.courses.assessments.index', course.id)}
                    className="flex items-center gap-2 p-5 sm:p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-emerald-50/60 hover:border-emerald-400 hover:shadow-md transition-all group"
                >
                    <span className="flex items-start gap-4 flex-1 min-w-0">
                        <span className="shrink-0 w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center">
                            ?
                        </span>
                        <span className="flex-1 min-w-0">
                            <span className="block font-bold text-gray-900 text-base sm:text-lg">
                                Final Course Quiz
                            </span>
                            <span className="block text-sm text-gray-600 mt-1 line-clamp-2">Course-wide final exam — manage its questions here.</span>
                            <span className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                                <span className="px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-600">
                                    {course.assessments ? course.assessments.filter(q => !q.module_id).length : 0} questions
                                </span>
                                <span className="px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-600">
                                    100% to pass
                                </span>
                            </span>
                        </span>
                    </span>
                    <span className="shrink-0 p-2 text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all font-black" aria-hidden="true">
                        →
                    </span>
                </Link>
            </div>
        </StaffLayout>
    );
}