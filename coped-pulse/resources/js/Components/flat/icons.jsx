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

export function CheckIcon(props) {
    return base({
        ...props,
        children: <path d="M20 6 9 17l-5-5" />,
    });
}

export function MagnifyingGlassIcon(props) {
    return base({
        ...props,
        children: (
            <>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
            </>
        ),
    });
}

export function XMarkIcon(props) {
    return base({
        ...props,
        children: (
            <>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
            </>
        ),
    });
}

export function CalendarIcon(props) {
    return base({
        ...props,
        children: (
            <>
                <path d="M8 2v4" />
                <path d="M16 2v4" />
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <path d="M3 10h18" />
            </>
        ),
    });
}

export function TrophyIcon(props) {
    return base({
        ...props,
        children: (
            <>
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </>
        ),
    });
}

export function TargetIcon(props) {
    return base({
        ...props,
        children: (
            <>
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
            </>
        ),
    });
}

export function ClockIcon(props) {
    return base({
        ...props,
        children: (
            <>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </>
        ),
    });
}

export function EyeIcon(props) {
    return base({
        ...props,
        children: (
            <>
                <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                <circle cx="12" cy="12" r="3" />
            </>
        ),
    });
}

export function EyeOffIcon(props) {
    return base({
        ...props,
        children: (
            <>
                <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                <path d="M17.479 17.499A10.75 10.75 0 0 1 2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 2.827-4.103" />
                <line x1="2" x2="22" y1="2" y2="22" />
            </>
        ),
    });
}



