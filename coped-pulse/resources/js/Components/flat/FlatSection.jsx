// Flat Design section: sharp color transitions, no thin dividers, rigid container.
const backgrounds = {
    white: 'bg-white text-[#111827]',
    muted: 'bg-[#F3F4F6] text-[#111827]',
    primary: 'bg-[#3B82F6] text-white',
    secondary: 'bg-[#10B981] text-white',
    accent: 'bg-[#F59E0B] text-[#111827]',
    ink: 'bg-[#111827] text-white',
};

export default function FlatSection({ bg = 'white', className = '', children }) {
    return (
        <section className={`${backgrounds[bg] ?? backgrounds.white} ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">{children}</div>
        </section>
    );
}
