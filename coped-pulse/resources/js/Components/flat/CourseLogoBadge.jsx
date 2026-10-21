import React from 'react';

export const BookIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="9" y1="7" x2="16" y2="7" />
        <line x1="9" y1="11" x2="14" y2="11" />
    </svg>
);

export const COURSE_THEME_COLORS = [
    {
        key: 'blue',
        name: 'Royal Blue',
        hex: '#3B82F6',
        bg: 'bg-[#3B82F6]',
        text: 'text-white',
        border: 'border-[#3B82F6]',
        accent: '#3B82F6',
        badgeBg: 'bg-[#EFF6FF]',
        badgeText: 'text-[#1D4ED8]',
        badgeBorder: 'border-[#BFDBFE]',
        label: 'UUM · CoPED',
        title: 'Applied Curriculum',
        agency: 'Universiti Utara Malaysia',
        icon: BookIcon,
    },
    {
        key: 'emerald',
        name: 'Emerald Green',
        hex: '#10B981',
        bg: 'bg-[#10B981]',
        text: 'text-white',
        border: 'border-[#10B981]',
        accent: '#10B981',
        badgeBg: 'bg-[#ECFDF5]',
        badgeText: 'text-[#065F46]',
        badgeBorder: 'border-[#A7F3D0]',
        label: 'UUM · CoPED',
        title: 'Applied Curriculum',
        agency: 'Universiti Utara Malaysia',
        icon: BookIcon,
    },
    {
        key: 'amber',
        name: 'Warm Amber',
        hex: '#F59E0B',
        bg: 'bg-[#F59E0B]',
        text: 'text-[#111827]',
        border: 'border-[#F59E0B]',
        accent: '#F59E0B',
        badgeBg: 'bg-[#FFFBEB]',
        badgeText: 'text-[#92400E]',
        badgeBorder: 'border-[#FDE68A]',
        label: 'UUM · CoPED',
        title: 'Applied Curriculum',
        agency: 'Universiti Utara Malaysia',
        icon: BookIcon,
    },
    {
        key: 'navy',
        name: 'Deep Navy',
        hex: '#1E3A8A',
        bg: 'bg-[#1E3A8A]',
        text: 'text-white',
        border: 'border-[#1E3A8A]',
        accent: '#1E3A8A',
        badgeBg: 'bg-[#EFF6FF]',
        badgeText: 'text-[#1E3A8A]',
        badgeBorder: 'border-[#BFDBFE]',
        label: 'UUM · CoPED',
        title: 'Applied Curriculum',
        agency: 'Universiti Utara Malaysia',
        icon: BookIcon,
    },
    {
        key: 'rose',
        name: 'Crimson Rose',
        hex: '#E11D48',
        bg: 'bg-[#E11D48]',
        text: 'text-white',
        border: 'border-[#E11D48]',
        accent: '#E11D48',
        badgeBg: 'bg-[#FFF1F2]',
        badgeText: 'text-[#9F1239]',
        badgeBorder: 'border-[#FECDD3]',
        label: 'UUM · CoPED',
        title: 'Applied Curriculum',
        agency: 'Universiti Utara Malaysia',
        icon: BookIcon,
    },
    {
        key: 'charcoal',
        name: 'Classic Ink',
        hex: '#111827',
        bg: 'bg-[#111827]',
        text: 'text-white',
        border: 'border-[#111827]',
        accent: '#111827',
        badgeBg: 'bg-[#F3F4F6]',
        badgeText: 'text-[#111827]',
        badgeBorder: 'border-[#D1D5DB]',
        label: 'UUM · CoPED',
        title: 'Applied Curriculum',
        agency: 'Universiti Utara Malaysia',
        icon: BookIcon,
    },
];

export const RANDOM_THEME_KEYS = COURSE_THEME_COLORS.map((c) => c.key);
export const getRandomThemeKey = () =>
    RANDOM_THEME_KEYS[Math.floor(Math.random() * RANDOM_THEME_KEYS.length)];

// Build LOGO_CONFIG with color keys + legacy compatibility aliases
const colorMap = Object.fromEntries(COURSE_THEME_COLORS.map((c) => [c.key, c]));

export const LOGO_CONFIG = {
    ...colorMap,
    // Legacy industry aliases mapped cleanly to solid color themes
    maritime: colorMap.navy,
    capm: colorMap.amber,
    ai: colorMap.blue,
    cybersecurity: colorMap.emerald,
    child_protection: colorMap.charcoal,
    general: colorMap.charcoal,
};

export default function CourseLogoBadge({
    category = 'charcoal',
    size = 'tile', // 'tile' | 'badge' | 'icon'
    subtitle = null,
    className = '',
}) {
    const config = LOGO_CONFIG[category] || LOGO_CONFIG.charcoal || LOGO_CONFIG.general;
    const IconComponent = config.icon || BookIcon;

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

    // Default: 'tile' (Used on left of course cards & top banners)
    return (
        <div
            className={`${config.bg} ${config.text} p-5 flex flex-col justify-center items-center text-center w-full md:w-44 shrink-0 border-b-2 md:border-b-0 md:border-r-2 border-[#E5E7EB] ${className}`}
        >
            <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center mb-2.5 border border-white/20">
                <IconComponent className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                {config.label}
            </span>
            <span className="text-[11px] font-bold mt-1 leading-tight line-clamp-1">
                {subtitle || config.title}
            </span>
        </div>
    );
}
