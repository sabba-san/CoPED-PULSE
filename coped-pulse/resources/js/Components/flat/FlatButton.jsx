import { Link } from '@inertiajs/react';

// Flat Design button: solid color block, no shadow, no gradient.
// Scale feedback only, per motion intensity 4.
const variants = {
    primary: 'bg-[#3B82F6] text-white hover:bg-blue-600 focus-visible:ring-blue-500',
    secondary: 'bg-[#F3F4F6] text-[#111827] hover:bg-gray-200 focus-visible:ring-blue-500',
    dark: 'bg-[#111827] text-white hover:bg-gray-800 focus-visible:ring-blue-500',
    accent: 'bg-[#F59E0B] text-[#111827] hover:bg-amber-600 hover:text-white focus-visible:ring-amber-500',
    outline: 'bg-transparent border-4 border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white focus-visible:ring-blue-500',
    onBlue: 'bg-white text-[#111827] hover:bg-[#F3F4F6] focus-visible:ring-white',
    outlineWhite:
        'bg-transparent border-4 border-white text-white hover:bg-white hover:text-[#3B82F6] focus-visible:ring-white',
};

export default function FlatButton({ href, variant = 'primary', type = 'button', className = '', children, ...props }) {
    const cls = `inline-flex items-center justify-center gap-2 h-14 px-6 text-sm font-semibold tracking-wide rounded-md transition-all duration-200 hover:scale-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${variants[variant] ?? variants.primary} ${className}`;

    if (href) {
        return (
            <Link href={href} className={cls} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button type={type} className={cls} {...props}>
            {children}
        </button>
    );
}
