import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { formatEmbedUrl, isVideoUrl, safeUrl } from '@/Utils/mediaUtils';

const MAX_MODULE_FILE_SIZE = 15 * 1024 * 1024;
const MAX_MODULE_FILE_LABEL = '15MB';

const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function ModuleForm({ course }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        media_url: '',
        content_type: 'link',
        file: null,
    });

    const [isDragging, setIsDragging] = useState(false);
    const [fileAlert, setFileAlert] = useState(null);

    const handleModuleFile = (file) => {
        if (!file) return;
        if (file.size > MAX_MODULE_FILE_SIZE) {
            setFileAlert(
                `File is too large. "${file.name}" is ${formatBytes(file.size)} - limit is ${MAX_MODULE_FILE_LABEL}. Please choose a smaller file.`
            );
            setData('file', null);
            const input = document.getElementById('module-file-input');
            if (input) input.value = '';
            return;
        }
        setFileAlert(null);
        setData('file', file);
    };

    const submit = (e) => {
        e.preventDefault();
        if (fileAlert) return;
        post(route('staff.courses.modules.store', course.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setFileAlert(null);
            },
        });
    };

    return (
        <div className="pt-6 border-t-2 border-[#E5E7EB]">
            <h3 className="text-lg font-bold text-[#111827] mb-4">Add New Module</h3>
            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label htmlFor="module_title" className="block text-sm font-bold text-[#111827] mb-2">Module Title</label>
                    <input
                        id="module_title"
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        required
                        placeholder="e.g., Introduction to Safeguarding"
                        className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] placeholder:text-gray-400 focus:bg-white focus:border-[#10B981] focus:outline-none transition-colors"
                    />
                    {errors.title && <p className="mt-2 text-red-600 text-sm font-medium">{errors.title}</p>}
                </div>

                <div>
                    <label htmlFor="module_desc" className="block text-sm font-bold text-[#111827] mb-2">Description (Optional)</label>
                    <textarea
                        id="module_desc"
                        rows={3}
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="What will learners accomplish in this module?"
                        className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] placeholder:text-gray-400 focus:bg-white focus:border-[#10B981] focus:outline-none transition-colors resize-none"
                    />
                    {errors.description && <p className="mt-2 text-red-600 text-sm font-medium">{errors.description}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="module_content_type" className="block text-sm font-bold text-[#111827] mb-2">Content Type</label>
                        <select
                            id="module_content_type"
                            value={data.content_type}
                            onChange={(e) => {
                                setData('content_type', e.target.value);
                                if (e.target.value !== 'file') setFileAlert(null);
                            }}
                            className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none transition-colors"
                        >
                            <option value="link">External Link - open in new tab</option>
                            <option value="file">Upload Document / Slide (PDF, DOCX, PPTX)</option>
                        </select>
                        {errors.content_type && <p className="mt-2 text-red-600 text-sm font-medium">{errors.content_type}</p>}
                    </div>

                    {data.content_type === 'link' && (
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="module_media" className="block text-sm font-bold text-[#111827] mb-2">Media URL (YouTube or Direct Video)</label>
                                <input
                                    id="module_media"
                                    type="text"
                                    value={data.media_url}
                                    onChange={(e) => setData('media_url', e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] placeholder:text-gray-400 focus:bg-white focus:border-[#10B981] focus:outline-none transition-colors"
                                />
                                {errors.media_url && <p className="mt-2 text-red-600 text-sm font-medium">{errors.media_url}</p>}
                            </div>

                            {/* Live Video Preview Box */}
                            {safeUrl(data.media_url) && formatEmbedUrl(data.media_url) && isVideoUrl(data.media_url) && (
                                <div className="border-2 border-[#E5E7EB] rounded-md overflow-hidden bg-[#111827] animate-fade-in">
                                    <div className="p-2 bg-[#1F2937] text-white flex items-center justify-between text-xs font-bold border-b border-gray-700">
                                        <div className="inline-flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse-dot" />
                                            <span>Inline Video Preview</span>
                                        </div>
                                        <span className="text-gray-400 text-[11px]">Will embed inline for learners</span>
                                    </div>
                                    <div className="aspect-video w-full">
                                        <iframe
                                            src={formatEmbedUrl(data.media_url)}
                                            title="Module Video Preview"
                                            className="w-full h-full border-0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {data.content_type === 'file' && (
                    <div>
                        <label className="block text-sm font-bold text-[#111827] mb-2">Upload Document / Slide (PDF, DOCX, PPTX)</label>
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                if (e.dataTransfer.files?.[0]) handleModuleFile(e.dataTransfer.files[0]);
                            }}
                            onClick={() => document.getElementById('module-file-input').click()}
                            className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                                isDragging ? 'border-[#10B981] bg-emerald-50' : 'border-[#E5E7EB] hover:border-[#10B981] bg-[#F9FAFB]'
                            }`}
                        >
                            <input
                                id="module-file-input"
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.ppt,.pptx"
                                onChange={(e) => { if (e.target.files?.[0]) handleModuleFile(e.target.files[0]); }}
                            />
                            {data.file ? (
                                <div className="text-sm text-emerald-700 font-bold">Selected file: {data.file.name}</div>
                            ) : (
                                <div className="space-y-1 text-sm text-gray-600">
                                    <p><span className="font-bold text-[#10B981]">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-gray-500">PDF, DOC, DOCX, PPT, PPTX up to 15MB</p>
                                </div>
                            )}
                        </div>
                        {errors.file && <p className="mt-2 text-red-600 text-sm font-medium">{errors.file}</p>}
                        {fileAlert && <p className="mt-2 text-sm font-bold text-red-600">{fileAlert}</p>}
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={processing || !!fileAlert}
                        className="px-6 py-3 text-sm font-bold text-white bg-[#111827] rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {processing ? 'Adding...' : 'Add Module'}
                    </button>
                </div>
            </form>
        </div>
    );
}
