/**
 * Robust Media & Video URL Utilities for CoPED PULSE.
 * Safely resolves YouTube, Vimeo, direct video files, and storage documents
 * for embedded in-app playback without redirecting away from the website.
 */

export function safeUrl(url) {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (trimmed.startsWith('/storage/')) return trimmed;

    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return null;
        }
        return parsed.href;
    } catch {
        return null;
    }
}

export function getYouTubeId(url) {
    const safe = safeUrl(url);
    if (!safe) return null;

    try {
        const parsed = new URL(safe);
        const host = parsed.hostname.toLowerCase();

        // 1. Check youtu.be/ID
        if (host === 'youtu.be') {
            const id = parsed.pathname.slice(1).split('/')[0];
            return id && id.length >= 6 ? id : null;
        }

        // 2. Check youtube.com / m.youtube.com
        if (host.includes('youtube.com')) {
            // Check query param ?v=ID or &v=ID
            const vParam = parsed.searchParams.get('v');
            if (vParam) return vParam;

            // Check path formats: /embed/ID, /shorts/ID, /live/ID, /v/ID
            const pathParts = parsed.pathname.split('/').filter(Boolean);
            if (['embed', 'shorts', 'live', 'v'].includes(pathParts[0]) && pathParts[1]) {
                return pathParts[1];
            }
        }
    } catch {
        // Fallback regex if URL parsing encounters an unusual edge case
    }

    const match = safe.match(/(?:youtube\.com\/(?:watch\?.*v=|shorts\/|live\/|embed\/|v\/)|youtu\.be\/)([\w-]{6,12})/i);
    return match?.[1] ?? null;
}

export function getVimeoId(url) {
    const safe = safeUrl(url);
    if (!safe) return null;
    const match = safe.match(/vimeo\.com\/(\d+)/i);
    return match?.[1] ?? null;
}

export function isVideoFile(url) {
    const safe = safeUrl(url);
    if (!safe) return false;
    return /\.(mp4|mov|webm|m4v|ogg)(\?|#|$)/i.test(safe);
}

export function isPdfFile(url) {
    const safe = safeUrl(url);
    if (!safe) return false;
    return /\.pdf(\?|#|$)/i.test(safe);
}

export function isVideoUrl(url) {
    const safe = safeUrl(url);
    if (!safe) return false;
    return Boolean(getYouTubeId(safe) || getVimeoId(safe) || isVideoFile(safe));
}

export function formatEmbedUrl(url) {
    const safe = safeUrl(url);
    if (!safe) return null;

    const ytId = getYouTubeId(safe);
    if (ytId) {
        return `https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0&modestbranding=1&playsinline=1`;
    }

    const vimeoId = getVimeoId(safe);
    if (vimeoId) {
        return `https://player.vimeo.com/video/${vimeoId}?autoplay=0&dnt=1`;
    }

    return safe;
}

export function fileNameFromUrl(url) {
    try {
        const raw = decodeURIComponent(String(url).split('?')[0].split('/').pop() || '');
        return raw.replace(/^\d+_/, '') || raw || 'attachment';
    } catch {
        return 'attachment';
    }
}
