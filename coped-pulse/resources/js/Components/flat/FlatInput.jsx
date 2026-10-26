import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './icons';

// Flat Design input: gray block idle, hard primary border on focus. No shadow, no glow.
// Label above, error below. Matches inputs section of the Flat system.
export default function FlatInput({
    label,
    id,
    type = 'text',
    error = null,
    className = '',
    inputClassName = '',
    ...props
}) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const computedType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const describedBy = error ? `${id}-error` : undefined;

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {label && (
                <label htmlFor={id} className="text-sm font-semibold text-[#111827]">
                    {label}
                </label>
            )}
            <div className="relative w-full">
                <input
                    id={id}
                    type={computedType}
                    aria-invalid={error ? 'true' : undefined}
                    aria-describedby={describedBy}
                    {...props}
                    className={`block w-full text-sm placeholder:text-gray-400 focus:outline-none transition-colors duration-200 ${
                        inputClassName
                            ? inputClassName
                            : 'rounded-md bg-[#F3F4F6] px-4 py-3 text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-2 border-transparent'
                    } ${isPassword ? 'pr-11' : ''}`}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#111827] focus:outline-none focus:text-[#3B82F6] p-1 rounded transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        title={showPassword ? 'Hide password' : 'Show password'}
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOffIcon className="h-5 w-5" />
                        ) : (
                            <EyeIcon className="h-5 w-5" />
                        )}
                    </button>
                )}
            </div>
            {error && (
                <p id={describedBy} className="text-sm font-medium text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

