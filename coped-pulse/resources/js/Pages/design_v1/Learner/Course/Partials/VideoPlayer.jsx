import { useEffect, useRef } from 'react';
import {
    safeUrl,
    getYouTubeId,
    getVimeoId,
    isVideoFile,
    isPdfFile,
    formatEmbedUrl,
} from '@/Utils/mediaUtils';

/**
 * Universal In-App Video & Media Player for CoPED PULSE.
 * Guarantees inline YouTube / Vimeo / MP4 playback inside the website.
 * Emits onEnded() when a video completes for automated progress tracking.
 */
export default function VideoPlayer({ module, mediaUrl, activeTitle = null, onEnded = null }) {
    const safe = safeUrl(mediaUrl);
    if (!safe) return null;

    const ytId = getYouTubeId(safe);
    const vimeoId = getVimeoId(safe);
    const isVideo = isVideoFile(safe);
    const isPdf = isPdfFile(safe);
    const titleText = activeTitle || module?.title || 'Lesson Unit';
    const iframeRef = useRef(null);

    // YouTube IFrame API & postMessage listener for automated completion on video end
    useEffect(() => {
        if (!onEnded || !ytId) return;

        const handleMessage = (event) => {
            if (!event.origin || (!event.origin.includes('youtube.com') && !event.origin.includes('youtube-nocookie.com'))) return;

            try {
                let data = event.data;
                if (typeof data === 'string') {
                    data = JSON.parse(data);
                }

                // YouTube postMessage: playerState 0 represents ENDED
                if (
                    (data?.event === 'infoDelivery' && data?.info?.playerState === 0) ||
                    (data?.event === 'onStateChange' && data?.info === 0)
                ) {
                    onEnded();
                }
            } catch {}
        };

        window.addEventListener('message', handleMessage);

        // Tell YouTube iframe that parent window is listening
        const timer = setTimeout(() => {
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage(
                    JSON.stringify({ event: 'listening' }),
                    '*'
                );
            }
        }, 1200);

        return () => {
            window.removeEventListener('message', handleMessage);
            clearTimeout(timer);
        };
    }, [ytId, onEnded]);

    // Vimeo postMessage listener
    useEffect(() => {
        if (!onEnded || !vimeoId) return;

        const handleVimeoMessage = (event) => {
            if (!event.origin || !event.origin.includes('vimeo.com')) return;
            try {
                let data = event.data;
                if (typeof data === 'string') data = JSON.parse(data);
                if (data?.event === 'finish' || data?.event === 'ended') {
                    onEnded();
                }
            } catch {}
        };

        window.addEventListener('message', handleVimeoMessage);
        return () => window.removeEventListener('message', handleVimeoMessage);
    }, [vimeoId, onEnded]);

    const ytEmbedUrl = ytId
        ? formatEmbedUrl(safe, typeof window !== 'undefined' ? window.location.origin : '')
        : null;

    return (
        <div key={safe} className="mt-4 animate-fade-in space-y-2">
            {/* Top Player Utility Strip */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#111827] text-white rounded-t-md text-xs font-bold border-2 border-b-0 border-[#111827]">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse-dot inline-block" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#10B981]">
                        INLINE PLAYBACK
                    </span>
                </div>
                <span className="text-gray-300 truncate max-w-xs sm:max-w-md">
                    {titleText}
                </span>
            </div>

            {/* Main Stage Frame */}
            <div className="overflow-hidden rounded-b-md border-2 border-t-0 border-[#111827] bg-black">
                {ytId ? (
                    <div className="aspect-video w-full bg-black">
                        <iframe
                            ref={iframeRef}
                            id={`yt-player-${ytId}`}
                            src={ytEmbedUrl}
                            title={titleText}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="h-full w-full border-0"
                        />
                    </div>
                ) : vimeoId ? (
                    <div className="aspect-video w-full bg-black">
                        <iframe
                            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=0&dnt=1&api=1`}
                            title={titleText}
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            className="h-full w-full border-0"
                        />
                    </div>
                ) : isVideo ? (
                    <div className="aspect-video w-full bg-black flex items-center justify-center">
                        <video
                            src={safe}
                            controls
                            playsInline
                            preload="metadata"
                            onEnded={() => onEnded && onEnded()}
                            className="h-full w-full"
                        >
                            Your browser does not support HTML5 video playback.
                        </video>
                    </div>
                ) : isPdf ? (
                    <div className="w-full bg-white">
                        <iframe
                            src={safe}
                            title={titleText}
                            className="w-full h-[55vh] sm:h-[65vh] border-0"
                        />
                    </div>
                ) : (
                    <div className="p-8 text-center text-white space-y-4 bg-[#1F2937]">
                        <div className="w-12 h-12 bg-gray-800 rounded-md flex items-center justify-center mx-auto text-xl">
                            📄
                        </div>
                        <div>
                            <p className="font-bold text-base">{titleText}</p>
                            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                                Attached course material or document. Click below to view or download.
                            </p>
                        </div>
                        <a
                            href={safe}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs transition-transform active:scale-[0.98]"
                        >
                            <span>Open Material in Viewer</span>
                            <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
