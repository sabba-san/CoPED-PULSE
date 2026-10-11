// Vendored Lucide icon paths (stroke 2, round caps).
// Temporary fallback because npm registry is offline in this environment.
// When online, replace with: import { ArrowRight, ... } from 'lucide-react'
// and delete this file. Paths match lucide.dev official geometry.
function base({ children, className = 'h-5 w-5', ...rest }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
            {...rest}
        >
            {children}
        </svg>
    );
}

export function ArrowRightIcon(props) {
    return base({
        ...props,
        children: (
            <>
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
            </>
        ),
    });
}

export function BookOpenIcon(props) {
    return base({
        ...props,
        children: (
            <>
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </>
        ),
    });
}

export function GraduationCapIcon(props) {
    return base({
        ...props,
        children: (
            <>
                <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
                <path d="M22 10v6" />
                <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
            </>
        ),
    });
}

export function ShieldCheckIcon(props) {
    return base({
        ...props,
        children: (
            <>
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                <path d="m9 12 2 2 4-4" />
            </>
        ),
    });
}

export function LinkIcon(props) {
    return base({
        ...props,
        children: (
            <>
                <path d="M9 17H7A5 5 0 0 1 7 7h2" />
                <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
                <line x1="8" x2="16" y1="12" y2="12" />
            </>
        ),
    });
}

export function ClipboardCheckIcon(props) {
    return base({
        ...props,
        children: (
            <>
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path d="m9 14 2 2 4-4" />
            </>
        ),
    });
}

export function ChartColumnIcon(props) {
    return base({
        ...props,
        children: (
            <>
                <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                <path d="M18 17V9" />
                <path d="M13 17V5" />
                <path d="M8 17v-3" />
            </>
        ),
    });
}

export function CircleCheckIcon(props) {
    return base({
        ...props,
        children: (
            <>
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
            </>
        ),
    });
}
