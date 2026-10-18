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
                        className="inline-flex items-center text-sm font-semibold text-[#10B981] hover:text-emerald-700 mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Courses
                    </Link>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight font-display">
                        Create New Course
                    </h1>
                </div>

                <form onSubmit={submit} className="bg-white rounded-md border-2 border-[#E5E7EB] p-6 sm:p-8 space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-bold text-[#111827] mb-2">
                            Course Title
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={data.title}
                            onChange={(e) => setData(e.target.name, e.target.value)}
                            required
                            placeholder="e.g. Introduction to Safeguarding"
                            className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] placeholder:text-gray-400 focus:bg-white focus:border-[#10B981] focus:outline-none transition-colors"
                        />
                        {errors.title && (
                            <p className="mt-2 text-red-600 text-sm font-medium">{errors.title}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-bold text-[#111827] mb-2">
                            Course Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={5}
                            value={data.description}
                            onChange={(e) => setData(e.target.name, e.target.value)}
                            placeholder="Describe what learners will gain from this course..."
                            className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] placeholder:text-gray-400 focus:bg-white focus:border-[#10B981] focus:outline-none transition-colors resize-none"
                        />
                        {errors.description && (
                            <p className="mt-2 text-red-600 text-sm font-medium">{errors.description}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-bold text-[#111827] mb-2">
                            Publication Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={data.status}
                            onChange={(e) => setData(e.target.name, e.target.value)}
                            required
                            className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none transition-colors"
                        >
                            <option value="draft">Draft - Hidden from learners</option>
                            <option value="published">Published - Visible to everyone</option>
                            <option value="archived">Archived - Read only</option>
                        </select>
                        {errors.status && (
                            <p className="mt-2 text-red-600 text-sm font-medium">{errors.status}</p>
                        )}
                    </div>

                    <div className="pt-6 mt-6 border-t-2 border-[#E5E7EB] flex items-center justify-end space-x-4">
                        <Link
                            href={route('staff.courses.index')}
                            className="px-6 py-3 text-sm font-bold text-[#111827] bg-[#F3F4F6] hover:bg-gray-200 rounded-md transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-8 py-3 text-sm font-bold text-white bg-[#10B981] rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        >
                            {processing ? 'Creating...' : 'Create Course'}
                        </button>
                    </div>
                </form>
            </div>
        </StaffLayout>
    );
}
