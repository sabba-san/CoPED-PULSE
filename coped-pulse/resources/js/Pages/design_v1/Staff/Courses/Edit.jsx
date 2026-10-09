import { Head, Link, useForm, router } from '@inertiajs/react';
import StaffLayout from '@/Layouts/design_v1/StaffLayout';

export default function Edit({ course }) {
    const { data, setData, put, processing, errors } = useForm({
        title: course.title || '',
        description: course.description || '',
        status: course.status || 'draft',
    });

    const moduleForm = useForm({
        title: '',
        description: '',
        media_url: '',
        content_type: 'link',
    });

    const quizForm = useForm({
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'b',
    });

    const submitCourse = (e) => {
        e.preventDefault();
        put(route('staff.courses.update', course));
    };

    const submitModule = (e) => {
        e.preventDefault();
        moduleForm.post(route('staff.courses.modules.store', course), {
            preserveScroll: true,
            onSuccess: () => moduleForm.reset(),
        });
    };

    const deleteModule = (module) => {
        if (confirm('Are you sure you want to delete this module?')) {
            router.delete(route('staff.courses.modules.destroy', [course, module]), {
                preserveScroll: true,
            });
        }
    };

    const submitQuiz = (e) => {
        e.preventDefault();
        quizForm.post(route('staff.courses.assessments.store', course), {
            preserveScroll: true,
            onSuccess: () => quizForm.reset(),
        });
    };

    const deleteQuiz = (assessment) => {
        if (confirm('Delete this quiz question?')) {
            router.delete(route('staff.courses.assessments.destroy', [course, assessment]), {
                preserveScroll: true,
            });
        }
    };

    return (
        <StaffLayout>
            <Head title={`Edit: ${course.title}`} />

            <div className="max-w-4xl mx-auto space-y-12">
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
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Course Modules</h2>
                    
                    <div className="space-y-4 mb-10">
                        {course.modules && course.modules.length > 0 ? (
                            course.modules.map((module, index) => (
                                <div key={module.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 group transition-all hover:bg-white hover:shadow-md">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 text-lg">
                                            <span className="text-emerald-600 mr-2">Module {index + 1}:</span>
                                            {module.title}
                                        </h3>
                                        {module.description && (
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{module.description}</p>
                                        )}
                                        {module.media_url && (
                                            <>
                                                <a href={module.media_url} target="_blank" rel="noreferrer" className="inline-flex items-center mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    View Media Attached
                                                </a>
                                                <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${module.content_type === 'embed' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {module.content_type === 'embed' ? 'Embed' : 'Link'}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                                        <button
                                            onClick={() => deleteModule(module)}
                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Module"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                                <p className="text-gray-500 font-medium">No modules added yet. Create your first module below.</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Add New Module</h3>
                        <form onSubmit={submitModule} className="space-y-5">
                            <div>
                                <label htmlFor="module_title" className="block text-sm font-bold text-gray-700 mb-2">Module Title</label>
                                <input
                                    id="module_title"
                                    type="text"
                                    value={moduleForm.data.title}
                                    onChange={e => moduleForm.setData('title', e.target.value)}
                                    required
                                    placeholder="e.g., Introduction to React"
                                    className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 sm:text-sm"
                                />
                                {moduleForm.errors.title && <p className="mt-2 text-red-500 text-sm font-medium">{moduleForm.errors.title}</p>}
                            </div>

                            <div>
                                <label htmlFor="module_desc" className="block text-sm font-bold text-gray-700 mb-2">Description (Optional)</label>
                                <textarea
                                    id="module_desc"
                                    rows={3}
                                    value={moduleForm.data.description}
                                    onChange={e => moduleForm.setData('description', e.target.value)}
                                    placeholder="What will learners accomplish in this module?"
                                    className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 sm:text-sm resize-none"
                                />
                                {moduleForm.errors.description && <p className="mt-2 text-red-500 text-sm font-medium">{moduleForm.errors.description}</p>}
                            </div>

                            <div>
                                <label htmlFor="module_media" className="block text-sm font-bold text-gray-700 mb-2">Media URL (Optional)</label>
                                <input
                                    id="module_media"
                                    type="url"
                                    value={moduleForm.data.media_url}
                                    onChange={e => moduleForm.setData('media_url', e.target.value)}
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 sm:text-sm"
                                />
                                {moduleForm.errors.media_url && <p className="mt-2 text-red-500 text-sm font-medium">{moduleForm.errors.media_url}</p>}
                            </div>

                            <div>
                                <label htmlFor="module_content_type" className="block text-sm font-bold text-gray-700 mb-2">Content Type</label>
                                <select
                                    id="module_content_type"
                                    value={moduleForm.data.content_type}
                                    onChange={e => moduleForm.setData('content_type', e.target.value)}
                                    className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 sm:text-sm appearance-none"
                                >
                                    <option value="link">External Link — open in new tab</option>
                                    <option value="embed">Embed (Slides/PDF/Video) — view inside app</option>
                                </select>
                                <p className="mt-1 text-xs text-gray-500">Embed renders the URL in an iframe on the Learn page. Use an embeddable Slides/PDF/video URL.</p>
                                {moduleForm.errors.content_type && <p className="mt-2 text-red-500 text-sm font-medium">{moduleForm.errors.content_type}</p>}
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={moduleForm.processing}
                                    className="px-6 py-2.5 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 shadow-md transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
                                >
                                    {moduleForm.processing ? 'Adding...' : 'Add Module'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Final Quiz Section */}
                <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-3xl p-8 border border-gray-100">
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Final Quiz</h2>
                    <p className="text-sm text-gray-500 mb-6">Learners need 100% on these questions to complete the course. This is where you put the quiz.</p>

                    <div className="space-y-4 mb-10">
                        {course.assessments && course.assessments.length > 0 ? (
                            course.assessments.map((q, index) => (
                                <div key={q.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-start justify-between gap-4">
                                        <p className="font-bold text-gray-900">
                                            <span className="text-emerald-600 mr-2">Q{index + 1}.</span>
                                            {q.question}
                                        </p>
                                        <button
                                            onClick={() => deleteQuiz(q)}
                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                            title="Delete question"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {['a', 'b', 'c', 'd'].map((key) => (
                                            <div
                                                key={key}
                                                className={`px-3 py-2 rounded-xl text-sm font-medium border ${
                                                    q.correct_option === key
                                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                                        : 'bg-white border-gray-200 text-gray-600'
                                                }`}
                                            >
                                                <span className="font-bold uppercase mr-2">{key}.</span>
                                                {q[`option_${key}`]}
                                                {q.correct_option === key && <span className="ml-2 text-xs font-bold">✓ Correct</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                                <p className="text-gray-500 font-medium">No quiz questions yet. Add the first question below.</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Add Quiz Question</h3>
                        <form onSubmit={submitQuiz} className="space-y-5">
                            <div>
                                <label htmlFor="quiz_question" className="block text-sm font-bold text-gray-700 mb-2">Question</label>
                                <textarea
                                    id="quiz_question"
                                    rows={3}
                                    value={quizForm.data.question}
                                    onChange={e => quizForm.setData('question', e.target.value)}
                                    required
                                    placeholder="e.g., What is the first step in child safeguarding?"
                                    className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 sm:text-sm resize-none"
                                />
                                {quizForm.errors.question && <p className="mt-2 text-red-500 text-sm font-medium">{quizForm.errors.question}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {['a', 'b', 'c', 'd'].map((key) => (
                                    <div key={key}>
                                        <label htmlFor={`quiz_option_${key}`} className="block text-sm font-bold text-gray-700 mb-2">
                                            Option {key.toUpperCase()}
                                            {quizForm.data.correct_option === key && <span className="ml-2 text-xs text-emerald-600">✓ Correct answer</span>}
                                        </label>
                                        <input
                                            id={`quiz_option_${key}`}
                                            type="text"
                                            value={quizForm.data[`option_${key}`]}
                                            onChange={e => quizForm.setData(`option_${key}`, e.target.value)}
                                            required
                                            placeholder={`Option ${key.toUpperCase()}`}
                                            className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 sm:text-sm"
                                        />
                                        {quizForm.errors[`option_${key}`] && <p className="mt-2 text-red-500 text-sm font-medium">{quizForm.errors[`option_${key}`]}</p>}
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label htmlFor="quiz_correct" className="block text-sm font-bold text-gray-700 mb-2">Correct Answer</label>
                                <select
                                    id="quiz_correct"
                                    value={quizForm.data.correct_option}
                                    onChange={e => quizForm.setData('correct_option', e.target.value)}
                                    className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 sm:text-sm appearance-none"
                                >
                                    <option value="a">A</option>
                                    <option value="b">B</option>
                                    <option value="c">C</option>
                                    <option value="d">D</option>
                                </select>
                                {quizForm.errors.correct_option && <p className="mt-2 text-red-500 text-sm font-medium">{quizForm.errors.correct_option}</p>}
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={quizForm.processing}
                                    className="px-6 py-2.5 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 shadow-md transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
                                >
                                    {quizForm.processing ? 'Adding...' : 'Add Question'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </StaffLayout>
    );
}
