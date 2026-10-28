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
export default function VideoPlayer({ module, mediaUrl, activeTitle = null, contentType = null, onEnded = null }) {
    const safe = safeUrl(mediaUrl);
    if (!safe) return null;

    const ytId = getYouTubeId(safe);
    const vimeoId = getVimeoId(safe);
    const isVideo = isVideoFile(safe);
    const isPdf = isPdfFile(safe, contentType);
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

    const isMedia = Boolean(ytId || vimeoId || isVideo || isPdf);
    const domain = (() => {
        try {
            return new URL(safe).hostname.replace(/^www\./, '');
        } catch {
            return 'external-resource';
        }
    })();

    const ytEmbedUrl = ytId
        ? formatEmbedUrl(safe, typeof window !== 'undefined' ? window.location.origin : '')
        : null;

    if (isPdf) {
        return (
            <div key={safe} className="mt-4 animate-fade-in space-y-2">
                {/* Top PDF Utility Strip with Download Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 bg-[#111827] text-white rounded-t-md text-xs font-bold border-2 border-b-0 border-[#111827] gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded shrink-0">
                            PDF DOCUMENT
                        </span>
                        <span className="text-gray-200 truncate max-w-xs sm:max-w-md">
                            {titleText}
                        </span>
                    </div>
                    <a
                        href={safe}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-extrabold rounded transition-colors shrink-0"
                    >
                        <span>⬇</span>
                        <span>Download PDF Document</span>
                    </a>
                </div>

                {/* Main PDF Frame */}
                <div className="overflow-hidden border-2 border-[#111827] bg-[#F3F4F6]">
                    <iframe
                        src={safe}
                        title={titleText}
                        className="w-full h-[60vh] sm:h-[70vh] border-0 bg-white"
                    />
                </div>

                {/* Bottom PDF Download Action Strip */}
                <div className="p-3 bg-[#F9FAFB] border-2 border-t-0 border-[#111827] rounded-b-md flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs text-gray-600 font-medium">
                        Need offline access? Download the verified lecture PDF to your device.
                    </span>
                    <a
                        href={safe}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#111827] hover:bg-gray-800 text-white text-xs font-extrabold rounded transition-colors shrink-0"
                    >
                        <span>⬇</span>
                        <span>Download PDF Document</span>
                    </a>
                </div>
            </div>
        );
    }

    if (!isMedia) {
        return (
            <div key={safe} className="mt-4 animate-fade-in space-y-2">
                {/* Top Utility Strip */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-white text-[#111827] rounded-t-md text-xs font-bold border-2 border-b-0 border-[#111827]">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded border border-[#BFDBFE]">
                            OFFICIAL RESOURCE
                        </span>
                        <span className="text-[11px] font-mono font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            {domain}
                        </span>
                    </div>
                    <span className="text-gray-500 text-[11px] font-semibold hidden sm:inline-block">
                        Verified Curriculum Reference
                    </span>
                </div>

                {/* Main Reference Stage */}
                <div className="bg-[#F8FAFC] border-2 border-[#111827] rounded-b-md p-6 sm:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2 min-w-0 flex-1">
                            <h3 className="font-display font-extrabold text-lg sm:text-xl text-[#111827]">
                                {titleText}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-2xl">
                                {module?.description || 'Official curriculum reference documentation, standards, or study materials for this unit.'}
                            </p>
                            <div className="pt-1">
                                <span className="text-[11px] font-mono text-[#2563EB] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded inline-block truncate max-w-md">
                                    {safe}
                                </span>
                            </div>
                        </div>

                        <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2">
                            <a
                                href={safe}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs transition-colors border-2 border-[#111827] min-h-[44px]"
                            >
                                <span>Open Official Resource</span>
                                <span className="text-sm font-bold">↗</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div key={safe} className="mt-4 animate-fade-in space-y-2">
            {/* Top Player Utility Strip */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#111827] text-white rounded-t-md text-xs font-bold border-2 border-b-0 border-[#111827] gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse-dot inline-block shrink-0" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#10B981] shrink-0">
                        INLINE PLAYBACK
                    </span>
                    <span className="text-gray-300 truncate max-w-xs sm:max-w-md">
                        {titleText}
                    </span>
                </div>
                {ytId && (
                    <a
                        href={`https://www.youtube.com/watch?v=${ytId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-gray-300 hover:text-white underline shrink-0"
                    >
                        Open on YouTube ↗
                    </a>
                )}
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
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
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
                ) : (
                    <div className="w-full bg-white">
                        <iframe
                            src={safe}
                            title={titleText}
                            className="w-full h-[55vh] sm:h-[65vh] border-0"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
