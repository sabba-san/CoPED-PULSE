const youTubeId = (url) => {
    const m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
    return m?.[1] ?? null;
};

const vimeoId = (url) => {
    const m = String(url).match(/vimeo\.com\/(\d+)/);
    return m?.[1] ?? null;
};

const isVideoFile = (url) => /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(String(url));

/**
 * Center-stage player: YouTube / Vimeo embeds, direct video files,
 * PDF preview, graceful link fallback otherwise. 16:9 for video.
 */
export default function VideoPlayer({ module, mediaUrl }) {
    if (!mediaUrl) return null;

    const yt = youTubeId(mediaUrl);
    if (yt) {
        return (
            <div className="mt-4 overflow-hidden rounded-md border-2 border-[#111827] bg-black">
                <div className="aspect-video w-full">
                    <iframe
                        src={`https://www.youtube.com/embed/${yt}`}
                        title={module?.title || 'Lesson video'}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                    />
                </div>
            </div>
        );
    }

    const vm = vimeoId(mediaUrl);
    if (vm) {
        return (
            <div className="mt-4 overflow-hidden rounded-md border-2 border-[#111827] bg-black">
                <div className="aspect-video w-full">
                    <iframe
                        src={`https://player.vimeo.com/video/${vm}`}
                        title={module?.title || 'Lesson video'}
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                    />
                </div>
            </div>
        );
    }

    if (isVideoFile(mediaUrl)) {
        return (
            <div className="mt-4 overflow-hidden rounded-md border-2 border-[#111827] bg-black">
                <video src={mediaUrl} controls preload="metadata" className="aspect-video w-full">
                    Your browser does not support the video tag.
                </video>
            </div>
        );
    }

    if (mediaUrl.startsWith('/storage/') && mediaUrl.toLowerCase().endsWith('.pdf')) {
        return (
            <div className="mt-4 rounded-md overflow-hidden border-2 border-[#E5E7EB] bg-white">
                <iframe src={mediaUrl} title={module?.title || 'Attachment'} className="w-full h-[50vh] sm:h-[60vh] bg-white" />
            </div>
        );
    }

    return (
        <div className="mt-5">
            <a
                href={mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#10B981] text-white font-bold hover:bg-emerald-600 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                {module?.content_type === 'file' ? 'View / Download Uploaded File' : 'View Media in New Tab'}
                <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
        </div>
    );
}
