// Flat Design card: solid color block, generous padding, no shadow, no border.
const tones = {
    white: 'bg-white text-[#111827]',
    blue: 'bg-blue-50 text-[#111827]',
    green: 'bg-green-50 text-[#111827]',
    amber: 'bg-amber-50 text-[#111827]',
    ink: 'bg-[#111827] text-white',
    primary: 'bg-[#3B82F6] text-white',
    secondary: 'bg-[#10B981] text-white',
};

export default function FlatCard({ tone = 'white', className = '', children, hover = true }) {
    return (
        <div
            className={`${tones[tone] ?? tones.white} rounded-lg p-6 md:p-8 transition-all duration-200 ${
                hover ? 'group cursor-default hover:scale-[1.02]' : ''
            } ${className}`}
        >
            {children}
        </div>
    );
}

export function FlatIconBadge({ className = '', children }) {
    return (
        <div
            className={`h-14 w-14 rounded-full bg-white text-[#3B82F6] flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${className}`}
        >
            {children}
        </div>
    );
}
