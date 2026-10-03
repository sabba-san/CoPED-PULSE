import { Head, Link } from '@inertiajs/react';
import LearnerLayout from '@/Layouts/design_v1/LearnerLayout';

/**
 * Only allow http(s) URLs to be rendered as links.
 * Prevents javascript:/data: URLs (stored XSS) from becoming clickable.
 */
const safeMediaUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    try {
        const parsed = new URL(url.trim());
        return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null;
    } catch {
        return null;
    }
};

export default function Learn({ course, enrollment }) {
    const modules = course.modules || [];

    return (
        <LearnerLayout>
            <Head title={`Learn: ${course.title}`} />

            <div className="max-w-5xl mx-auto space-y-8">
                {/* Course Header */}
                <div className="bg-white/80 backdrop-blur-md shadow-sm border border-gray-100 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>

                    <Link
                        href={route('portal')}
                        className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 mb-6 transition-colors relative z-10"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Portal
                    </Link>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
                                {course.title}
                            </h1>
                            {course.description && (
                                <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
                                    {course.description}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col items-start md:items-end space-y-3 shrink-0">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                                enrollment?.completed_at
                                    ? 'bg-green-100/90 text-green-800 border border-green-200'
                                    : 'bg-blue-100/90 text-blue-800 border border-blue-200'
                            }`}>
                                {enrollment?.completed_at ? 'COMPLETED' : 'IN PROGRESS'}
                            </span>
                            <div className="text-sm text-gray-500 font-medium bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                {modules.length} {modules.length === 1 ? 'Module' : 'Modules'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modules List */}
                {modules.length > 0 ? (
                    <div className="space-y-4">
                        {modules.map((module, index) => {
                            const mediaUrl = safeMediaUrl(module.media_url);

                            return (
                                <article
                                    key={module.id}
                                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 p-6 flex gap-5"
                                >
                                    <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                                        {index + 1}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-xl font-bold text-gray-900 break-words">
                                            {module.title}
                                        </h2>

                                        {module.description && (
                                            <p className="mt-2 text-gray-500 leading-relaxed whitespace-pre-line break-words">
                                                {module.description}
                                            </p>
                                        )}

                                        {mediaUrl && (
                                            <a
                                                href={mediaUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                View Media
                                                <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </a>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 border-dashed">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <p className="text-lg text-gray-500 font-medium">No modules available yet.</p>
                        <p className="text-sm text-gray-400 mt-2">Check back later once the instructor adds content.</p>
                    </div>
                )}
            </div>
        </LearnerLayout>
    );
}
