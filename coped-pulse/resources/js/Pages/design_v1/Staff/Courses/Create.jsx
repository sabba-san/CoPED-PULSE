import { Head, Link, useForm } from '@inertiajs/react';
import StaffLayout from '@/Layouts/design_v1/StaffLayout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        status: 'draft',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('staff.courses.store'));
    };

    return (
        <StaffLayout>
            <Head title="Create Course" />

            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link
                        href={route('staff.courses.index')}
                        className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Courses
                    </Link>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 to-teal-700 tracking-tight">
                        Create New Course
                    </h1>
                </div>

                <form onSubmit={submit} className="bg-white/80 backdrop-blur-md shadow-lg rounded-3xl p-8 space-y-8 border border-gray-100">
                    <div>
                        <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">
                            Course Title
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={data.title}
                            onChange={(e) => setData(e.target.name, e.target.value)}
                            required
                            placeholder="e.g. Introduction to Machine Learning"
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
                            onChange={(e) => setData(e.target.name, e.target.value)}
                            placeholder="Describe what learners will gain from this course..."
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
                            onChange={(e) => setData(e.target.name, e.target.value)}
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
                        <Link
                            href={route('staff.courses.index')}
                            className="px-6 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-500 hover:to-teal-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                        >
                            {processing ? 'Creating...' : 'Create Course'}
                        </button>
                    </div>
                </form>
            </div>
        </StaffLayout>
    );
}
