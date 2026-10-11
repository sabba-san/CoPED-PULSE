// Flat Design input: gray block idle, hard primary border on focus. No shadow, no glow.
// Label above, error below. Matches inputs section of the Flat system.
export default function FlatInput({
    label,
    id,
    error = null,
    className = '',
    ...props
}) {
    const describedBy = error ? `${id}-error` : undefined;

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <label htmlFor={id} className="text-sm font-semibold text-[#111827]">
                {label}
            </label>
            <input
                id={id}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={describedBy}
                {...props}
                className="block w-full rounded-md bg-[#F3F4F6] px-4 py-3 text-sm text-[#111827] placeholder:text-gray-400 focus:bg-white focus:border-2 focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-2 border-transparent transition-colors duration-200"
            />
            {error && (
                <p id={describedBy} className="text-sm font-medium text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
