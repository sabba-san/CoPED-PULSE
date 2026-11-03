import { useEffect, useRef, useState } from 'react';
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
 * Includes an Interactive In-Video Pop-Up Quiz Checkpoint overlay.
 */
export default function VideoPlayer({
    module,
    mediaUrl,
    activeTitle = null,
    contentType = null,
    onEnded = null,
    popupQuiz = null,
    isKidTheme = false,
    onCheckpointPass = null,
}) {
    const safe = safeUrl(mediaUrl);
    if (!safe) return null;

    const ytId = getYouTubeId(safe);
    const vimeoId = getVimeoId(safe);
    const isVideo = isVideoFile(safe);
    const isPdf = isPdfFile(safe, contentType);
    const titleText = activeTitle || module?.title || 'Lesson Unit';
    const iframeRef = useRef(null);
    const videoRef = useRef(null);

    // Interactive In-Video Pop-Up Quiz Checkpoint state
    const [showPopupQuiz, setShowPopupQuiz] = useState(false);
    const [selectedOpt, setSelectedOpt] = useState(null);
    const [checkpointDone, setCheckpointDone] = useState(false);

    const hasAutoTriggeredRef = useRef(false);
    const checkpointDoneRef = useRef(false);

    const activeCheckpointQuiz = popupQuiz || {
        question: `Semakan Pantas Video: Apakah fokus utama dalam topik "${titleText}" ini?`,
        option_a: module?.title || 'Memahami konsep asas dan langkah penyelesaian mengikut topik',
        option_b: 'Menukar tetapan skrin komputer sahaja',
        option_c: 'Memadam nota pembelajaran',
        option_d: 'Melangkau latihan tanpa membaca panduan',
        correct_option: 'a',
    };

    useEffect(() => {
        setShowPopupQuiz(false);
        setSelectedOpt(null);
        setCheckpointDone(false);
        hasAutoTriggeredRef.current = false;
        checkpointDoneRef.current = false;
    }, [safe, module?.id, popupQuiz?.id]);

    const isAnswerCorrect =
        selectedOpt &&
        String(selectedOpt).toLowerCase() === String(activeCheckpointQuiz.correct_option || 'a').toLowerCase();

    // Helper functions to pause and resume playback across platforms
    const pauseMedia = () => {
        if (iframeRef.current?.contentWindow) {
            try {
                // YouTube pause command
                iframeRef.current.contentWindow.postMessage(
                    JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
                    '*'
                );
                // Vimeo pause command
                iframeRef.current.contentWindow.postMessage(
                    JSON.stringify({ method: 'pause' }),
                    '*'
                );
            } catch {}
        }
        if (videoRef.current && !videoRef.current.paused) {
            try {
                videoRef.current.pause();
            } catch {}
        }
    };

    const resumeMedia = () => {
        if (iframeRef.current?.contentWindow) {
            try {
                // YouTube play command
                iframeRef.current.contentWindow.postMessage(
                    JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
                    '*'
                );
                // Vimeo play command
                iframeRef.current.contentWindow.postMessage(
                    JSON.stringify({ method: 'play' }),
                    '*'
                );
            } catch {}
        }
        if (videoRef.current && videoRef.current.paused) {
            try {
                videoRef.current.play();
            } catch {}
        }
    };

    const triggerCheckpoint = () => {
        if (!isKidTheme || hasAutoTriggeredRef.current || checkpointDoneRef.current) return;
        hasAutoTriggeredRef.current = true;
        pauseMedia();
        setShowPopupQuiz(true);
    };

    const handleResume = () => {
        setShowPopupQuiz(false);
        resumeMedia();
    };

    const handleCloseOverlay = () => {
        setShowPopupQuiz(false);
    };

    // YouTube IFrame API & postMessage listener for automated completion and in-video checkpoint
    useEffect(() => {
        if (!ytId) return;

        let playTimer = null;
        let elapsedPlaySeconds = 0;

        const handleMessage = (event) => {
            if (!event.origin || (!event.origin.includes('youtube.com') && !event.origin.includes('youtube-nocookie.com'))) return;

            try {
                let data = event.data;
                if (typeof data === 'string') {
                    data = JSON.parse(data);
                }

                // YouTube postMessage: playerState 0 represents ENDED, 1 represents PLAYING, 2 represents PAUSED
                const pState =
                    data?.event === 'infoDelivery' && data?.info?.playerState !== undefined
                        ? data.info.playerState
                        : data?.event === 'onStateChange'
                        ? data.info
                        : null;

                const curTime = data?.info?.currentTime;

                if (pState === 0) {
                    if (playTimer) clearInterval(playTimer);
                    playTimer = null;
                    if (onEnded) onEnded();
                } else if (pState === 1) {
                    // Video is playing: track playback duration to trigger checkpoint at 15s
                    if (!playTimer && !hasAutoTriggeredRef.current && !checkpointDoneRef.current) {
                        playTimer = setInterval(() => {
                            elapsedPlaySeconds += 1;
                            if (elapsedPlaySeconds >= 15) {
                                clearInterval(playTimer);
                                playTimer = null;
                                triggerCheckpoint();
                            }
                        }, 1000);
                    }
                } else if (pState === 2) {
                    if (playTimer) {
                        clearInterval(playTimer);
                        playTimer = null;
                    }
                }

                if (typeof curTime === 'number' && curTime >= 15) {
                    if (!hasAutoTriggeredRef.current && !checkpointDoneRef.current) {
                        if (playTimer) {
                            clearInterval(playTimer);
                            playTimer = null;
                        }
                        triggerCheckpoint();
                    }
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
            if (playTimer) clearInterval(playTimer);
        };
    }, [ytId, onEnded]);

    // Vimeo postMessage listener
    useEffect(() => {
        if (!vimeoId) return;

        const handleVimeoMessage = (event) => {
            if (!event.origin || !event.origin.includes('vimeo.com')) return;
            try {
                let data = event.data;
                if (typeof data === 'string') data = JSON.parse(data);
                if (data?.event === 'finish' || data?.event === 'ended') {
                    if (onEnded) onEnded();
                }
                if (data?.event === 'timeupdate' && typeof data?.data?.seconds === 'number') {
                    if (data.data.seconds >= 15 && !hasAutoTriggeredRef.current && !checkpointDoneRef.current) {
                        triggerCheckpoint();
                    }
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
            <div key={safe} className="mt-2 animate-fade-in">
                {/* Top PDF Utility Strip with Download Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2.5 bg-[#0F172A] text-white rounded-t-xl text-xs font-bold border border-b-0 border-[#E2E8F0] gap-2">
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
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-extrabold rounded-lg transition-colors shrink-0"
                    >
                        <span>⬇</span>
                        <span>Download PDF Document</span>
                    </a>
                </div>

                {/* Main PDF Frame */}
                <div className="overflow-hidden border border-[#E2E8F0] rounded-b-xl bg-[#F8FAFC]">
                    <iframe
                        src={safe}
                        title={titleText}
                        className="w-full h-[52vh] sm:h-[58vh] border-0 bg-white"
                    />
                </div>
            </div>
        );
    }

    if (!isMedia) {
        return (
            <div key={safe} className="mt-2 animate-fade-in">
                {/* Top Utility Strip */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#F8FAFC] text-[#0F172A] rounded-t-xl text-xs font-bold border border-b-0 border-[#E2E8F0]">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded border border-[#BFDBFE]">
                            OFFICIAL RESOURCE
                        </span>
                        <span className="text-[11px] font-mono font-bold text-gray-600 bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
                            {domain}
                        </span>
                    </div>
                    <span className="text-gray-500 text-[11px] font-semibold hidden sm:inline-block">
                        Verified Curriculum Reference
                    </span>
                </div>

                {/* Main Reference Stage */}
                <div className="bg-white border border-[#E2E8F0] rounded-b-xl p-5 sm:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5 min-w-0 flex-1">
                            <h3 className="font-display font-extrabold text-base sm:text-lg text-[#0F172A]">
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
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs transition-colors border border-[#1D4ED8] min-h-[42px]"
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
        <div key={safe} className="mt-2 animate-fade-in">
            {/* Top Player Utility Strip */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#0F172A] text-white rounded-t-xl text-xs font-bold border border-b-0 border-[#CBD5E1] gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse-dot inline-block shrink-0" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#10B981] shrink-0">
                        INLINE PLAYBACK
                    </span>
                    <span className="text-gray-300 truncate max-w-xs sm:max-w-md hidden md:inline-block">
                        {titleText}
                    </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {isKidTheme && (
                        <button
                            type="button"
                            onClick={() => {
                                pauseMedia();
                                setShowPopupQuiz(true);
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold border transition-colors ${
                                checkpointDone
                                    ? 'bg-[#10B981] hover:bg-[#059669] text-white border-[#059669]'
                                    : 'bg-[#F59E0B] hover:bg-[#D97706] text-[#111827] border-[#D97706]'
                            }`}
                            title={checkpointDone ? 'Checkpoint kuiz selesai' : 'Pop-up kuiz video (muncul automatik pada 0:15)'}
                        >
                            <span>{checkpointDone ? '✓' : '⚡'}</span>
                            <span>{checkpointDone ? 'Checkpoint Kuiz Selesai' : 'Checkpoint Kuiz (Auto 0:15)'}</span>
                        </button>
                    )}

                    {ytId && (
                        <a
                            href={`https://www.youtube.com/watch?v=${ytId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-semibold text-gray-300 hover:text-white underline hidden sm:inline-block"
                        >
                            Open on YouTube ↗
                        </a>
                    )}
                </div>
            </div>

            {/* Main Stage Frame with In-Video Pop-Up Quiz Overlay */}
            <div className="relative overflow-hidden border border-t-0 border-[#CBD5E1] rounded-b-xl bg-black">
                {ytId ? (
                    <div className="aspect-video w-full max-h-[54vh] bg-black">
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
                    <div className="aspect-video w-full max-h-[54vh] bg-black">
                        <iframe
                            ref={iframeRef}
                            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=0&dnt=1&api=1`}
                            title={titleText}
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            className="h-full w-full border-0"
                        />
                    </div>
                ) : isVideo ? (
                    <div className="aspect-video w-full max-h-[54vh] bg-black flex items-center justify-center">
                        <video
                            ref={videoRef}
                            src={safe}
                            controls
                            playsInline
                            preload="metadata"
                            onTimeUpdate={(e) => {
                                if (
                                    e.currentTarget.currentTime >= 15 &&
                                    !hasAutoTriggeredRef.current &&
                                    !checkpointDoneRef.current
                                ) {
                                    triggerCheckpoint();
                                }
                            }}
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
                            className="w-full h-[52vh] sm:h-[58vh] border-0"
                        />
                    </div>
                )}

                {/* In-Video Interactive Pop-Up Quiz Overlay Card */}
                {showPopupQuiz && (
                    <div className="absolute inset-0 z-20 bg-[#0F172A]/85 p-3 sm:p-6 flex items-center justify-center overflow-y-auto">
                        <div className="w-full max-w-2xl bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-6 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-lg bg-[#FEF3C7] border border-[#F59E0B] text-[#92400E] text-xs font-black uppercase tracking-wider">
                                        ⚡ Pop-Up Kuiz Video
                                    </span>
                                    <span className="text-xs sm:text-sm font-extrabold text-[#0F172A]">
                                        Checkpoint Semasa Menonton (0:15)
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCloseOverlay}
                                    className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[#334155] hover:bg-gray-100 text-xs font-black"
                                >
                                    ✕ Tutup Sementara
                                </button>
                            </div>

                            <p className="font-display font-extrabold text-base sm:text-lg text-[#0F172A] leading-snug">
                                {activeCheckpointQuiz.question}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {['a', 'b', 'c', 'd'].map((optKey) => {
                                    const optLabel = activeCheckpointQuiz[`option_${optKey}`];
                                    if (!optLabel) return null;
                                    const isPicked = selectedOpt === optKey;
                                    const isRightChoice =
                                        String(activeCheckpointQuiz.correct_option || 'a').toLowerCase() === optKey;

                                    let btnStyle = 'bg-white text-[#0F172A] border border-[#CBD5E1] hover:border-[#2563EB] hover:bg-[#EFF6FF]';
                                    if (isPicked) {
                                        btnStyle = isRightChoice
                                            ? 'bg-[#10B981] text-white border border-[#059669]'
                                            : 'bg-[#EF4444] text-white border border-[#DC2626]';
                                    }

                                    return (
                                        <button
                                            key={optKey}
                                            type="button"
                                            onClick={() => {
                                                setSelectedOpt(optKey);
                                                if (isRightChoice && !checkpointDoneRef.current) {
                                                    setCheckpointDone(true);
                                                    checkpointDoneRef.current = true;
                                                    if (onCheckpointPass) {
                                                        onCheckpointPass(20, 'Kuiz Checkpoint Video Tepat! (+20 XP)');
                                                    }
                                                }
                                            }}
                                            className={`w-full text-left p-3 sm:p-3.5 rounded-xl transition-colors flex items-center gap-3 ${btnStyle} ${
                                                isKidTheme ? 'text-base sm:text-lg font-extrabold' : 'text-sm sm:text-base font-bold'
                                            }`}
                                        >
                                            <span className="w-7 h-7 rounded-full bg-[#0F172A] text-white text-xs font-black uppercase flex items-center justify-center shrink-0">
                                                {optKey}
                                            </span>
                                            <span className="flex-1 leading-snug">{optLabel}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {selectedOpt && isAnswerCorrect && (
                                <div className="p-3.5 sm:p-4 rounded-xl bg-[#ECFDF5] border border-[#10B981] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <span className="text-sm sm:text-base font-extrabold text-[#065F46]">
                                        🌟 Tahniah! Jawapan Tepat (+20 XP)! Teruskan menonton video.
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleResume}
                                        className="px-4 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs sm:text-sm font-black shrink-0"
                                    >
                                        [ ▶ Sambung Tonton Video ]
                                    </button>
                                </div>
                            )}

                            {selectedOpt && !isAnswerCorrect && (
                                <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs sm:text-sm font-extrabold text-[#991B1B]">
                                    💡 Kurang tepat. Cuba pilih jawapan lain berdasarkan penerangan dalam video!
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
