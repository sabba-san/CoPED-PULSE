import { Head, Link, useForm } from '@inertiajs/react';
import StaffLayout from '@/Layouts/StaffLayout';

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
                <div className="mb-6">
                    <Link
                        href={route('staff.courses.index')}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        ← Back to Courses
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">Create Course</h1>
                </div>

                <form onSubmit={submit} className="bg-white shadow-sm rounded-lg p-6 space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={data.title}
                            onChange={(e) => setData(e.target.name, e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {errors.title && (
                            <span className="text-red-500 text-sm">{errors.title}</span>
                        )}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            value={data.description}
                            onChange={(e) => setData(e.target.name, e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {errors.description && (
                            <span className="text-red-500 text-sm">{errors.description}</span>
                        )}
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={data.status}
                            onChange={(e) => setData(e.target.name, e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                        {errors.status && (
                            <span className="text-red-500 text-sm">{errors.status}</span>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Link
                            href={route('staff.courses.index')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {processing ? 'Creating...' : 'Create Course'}
                        </button>
                    </div>
                </form>
            </div>
        </StaffLayout>
    );
}