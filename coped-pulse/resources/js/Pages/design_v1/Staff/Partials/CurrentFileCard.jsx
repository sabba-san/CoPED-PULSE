const fileNameFromUrl = (url) => {
    try {
        const raw = decodeURIComponent(String(url).split('?')[0].split('/').pop() || '');
        // Stored as <timestamp>_<original> - strip the prefix for display.
        return raw.replace(/^\d+_/, '') || raw || 'attachment';
    } catch {
        return 'attachment';
    }
};

/**
 * Minimal attachment row: just the filename.
 * Clicking the name opens the file in a new tab.
 */
export default function CurrentFileCard({ mediaUrl, contentType = 'file' }) {
    if (!mediaUrl) return null;

    const name = contentType === 'file' ? fileNameFromUrl(mediaUrl) : mediaUrl;

    return (
        <a
            href={mediaUrl}
            target="_blank"
            rel="noreferrer"
            title={`Open ${name} in a new tab`}
            className="mt-3 flex items-center gap-3 rounded-md border-2 border-[#E5E7EB] bg-white px-4 py-3 transition-colors hover:border-[#10B981] hover:bg-emerald-50"
        >
            <svg className="h-5 w-5 shrink-0 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#111827] hover:text-[#10B981] hover:underline">
                {name}
            </span>
            <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
        </a>
    );
}
