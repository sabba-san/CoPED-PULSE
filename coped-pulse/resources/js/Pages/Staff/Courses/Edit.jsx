import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function Edit({ course }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        content_type: 'file',
        media_url: '',
        file: null,
    });

    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            setData('file', droppedFile);
            setData('content_type', 'file');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('staff.courses.modules.store', course.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Edit Course & Modules: {course.title}</h1>

            {/* Add Module Form with Drag and Drop */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Module</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Module Title</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                        {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    {/* Drag and Drop Upload Zone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Upload Document / Slide (PDF, DOCX, PPTX)
                        </label>
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                                isDragging ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                            }`}
                            onClick={() => document.getElementById('file-upload-input').click()}
                        >
                            <input
                                id="file-upload-input"
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.ppt,.pptx"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setData('file', e.target.files[0]);
                                        setData('content_type', 'file');
                                    }
                                }}
                            />
                            {data.file ? (
                                <div className="text-sm text-indigo-600 font-semibold">
                                    Selected file: {data.file.name}
                                </div>
                            ) : (
                                <div className="space-y-1 text-sm text-gray-600">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p><span className="font-medium text-indigo-600 hover:text-indigo-500">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-gray-500">PDF, DOC, DOCX, PPT, PPTX up to 15MB</p>
                                </div>
                            )}
                        </div>
                        {errors.file && <div className="text-red-500 text-xs mt-1">{errors.file}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Or External Media URL (Optional)</label>
                        <input
                            type="text"
                            value={data.media_url}
                            onChange={(e) => {
                                setData('media_url', e.target.value);
                                if (e.target.value) setData('content_type', 'link');
                            }}
                            placeholder="https://..."
                            className="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            {processing ? 'Uploading...' : 'Add Module'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}