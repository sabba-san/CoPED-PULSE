import React from 'react';

export const LOGO_CONFIG = {
    maritime: {
        key: 'maritime',
        label: 'MARITIME · JLM',
        title: 'Maritime & Marine Ops',
        agency: 'Jabatan Laut Malaysia',
        bg: 'bg-[#1E3A8A]',
        text: 'text-white',
        border: 'border-[#1E3A8A]',
        accent: '#1E3A8A',
        badgeBg: 'bg-[#EFF6FF]',
        badgeText: 'text-[#1E3A8A]',
        badgeBorder: 'border-[#BFDBFE]',
        icon: (props) => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
                <circle cx="12" cy="5" r="3" />
                <line x1="12" y1="8" x2="12" y2="21" />
                <path d="M5 12H19" />
                <path d="M5 12a7 7 0 0 0 14 0" />
            </svg>
        ),
    },
    capm: {
        key: 'capm',
        label: 'PMI · CAPM',
        title: 'Project Management',
        agency: 'PMI Global Standard',
        bg: 'bg-[#F59E0B]',
        text: 'text-[#111827]',
        border: 'border-[#F59E0B]',
        accent: '#F59E0B',
        badgeBg: 'bg-[#FFFBEB]',
        badgeText: 'text-[#92400E]',
        badgeBorder: 'border-[#FDE68A]',
        icon: (props) => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="12" cy="12" r="1" />
            </svg>
        ),
    },
    ai: {
        key: 'ai',
        label: 'AI & SYSTEMS',
        title: 'Artificial Intelligence',
        agency: 'CoPED Tech & Analytics',
        bg: 'bg-[#3B82F6]',
        text: 'text-white',
        border: 'border-[#3B82F6]',
        accent: '#3B82F6',
        badgeBg: 'bg-[#EFF6FF]',
        badgeText: 'text-[#1D4ED8]',
        badgeBorder: 'border-[#BFDBFE]',
        icon: (props) => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="9" y="9" width="6" height="6" />
                <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
            </svg>
        ),
    },
    cybersecurity: {
        key: 'cybersecurity',
        label: 'CYBERSEC',
        title: 'Cybersecurity & Defense',
        agency: 'Digital Defense & Audit',
        bg: 'bg-[#10B981]',
        text: 'text-[#111827]',
        border: 'border-[#10B981]',
        accent: '#10B981',
        badgeBg: 'bg-[#ECFDF5]',
        badgeText: 'text-[#065F46]',
        badgeBorder: 'border-[#A7F3D0]',
        icon: (props) => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <rect x="9" y="11" width="6" height="5" rx="1" />
                <path d="M10 11V9a2 2 0 0 1 4 0v2" />
            </svg>
        ),
    },
    child_protection: {
        key: 'child_protection',
        label: 'PROTECTION',
        title: 'Child Safeguarding',
        agency: 'Humanitarian & Welfare',
        bg: 'bg-[#111827]',
        text: 'text-white',
        border: 'border-[#111827]',
        accent: '#111827',
        badgeBg: 'bg-[#F3F4F6]',
        badgeText: 'text-[#111827]',
        badgeBorder: 'border-[#D1D5DB]',
        icon: (props) => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 9c-1.5-1.5-3-1-3.5 0-.7 1.3.5 2.5 3.5 4.5 3-2 4.2-3.2 3.5-4.5-.5-1-2-1.5-3.5 0z" />
            </svg>
        ),
    },
    general: {
        key: 'general',
        label: 'UUM · CoPED',
        title: 'General Curriculum',
        agency: 'Universiti Utara Malaysia',
        bg: 'bg-[#111827]',
        text: 'text-white',
        border: 'border-[#111827]',
        accent: '#111827',
        badgeBg: 'bg-[#F3F4F6]',
        badgeText: 'text-[#111827]',
        badgeBorder: 'border-[#E5E7EB]',
        icon: (props) => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <line x1="9" y1="7" x2="16" y2="7" />
                <line x1="9" y1="11" x2="14" y2="11" />
            </svg>
        ),
    },
};

export default function CourseLogoBadge({
    category = 'general',
    size = 'tile', // 'tile' | 'badge' | 'icon' | 'selector'
    subtitle = null,
    className = '',
    selected = false,
    onClick = null,
}) {
    const config = LOGO_CONFIG[category] || LOGO_CONFIG.general;
    const IconComponent = config.icon;

    if (size === 'badge') {
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-extrabold border ${config.badgeBg} ${config.badgeText} ${config.badgeBorder} ${className}`}
            >
                <IconComponent className="w-3.5 h-3.5 shrink-0" />
                <span>{config.label}</span>
            </span>
        );
    }

    if (size === 'icon') {
        return (
            <div className={`inline-flex items-center gap-2 ${className}`}>
                <div className={`p-1.5 rounded ${config.bg} ${config.text}`}>
                    <IconComponent className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#111827]">{config.label}</span>
            </div>
        );
    }

    if (size === 'selector') {
        return (
            <button
                type="button"
                onClick={onClick}
                className={`flex flex-col items-center justify-center p-3 rounded-md border-2 text-center transition-all ${
                    selected
                        ? 'border-[#111827] bg-[#F9FAFB] ring-2 ring-[#111827]'
                        : 'border-[#E5E7EB] bg-white hover:border-gray-400'
                } ${className}`}
            >
                <div className={`w-10 h-10 rounded flex items-center justify-center mb-2 ${config.bg} ${config.text}`}>
                    <IconComponent className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-[#111827] leading-tight block">
                    {config.label}
                </span>
                <span className="text-[10px] text-gray-500 font-semibold mt-0.5 block truncate max-w-[120px]">
                    {config.title}
                </span>
            </button>
        );
    }

    // Default: 'tile' (Used on left of course cards & top banners)
    return (
        <div
            className={`${config.bg} ${config.text} p-5 flex flex-col justify-center items-center text-center w-full md:w-44 shrink-0 border-b-2 md:border-b-0 md:border-r-2 border-[#E5E7EB] ${className}`}
        >
            <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center mb-2.5 border border-white/20">
                <IconComponent className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                {config.label}
            </span>
            <span className="text-[11px] font-bold text-white mt-1 leading-tight line-clamp-1">
                {subtitle || config.title}
            </span>
        </div>
    );
}
