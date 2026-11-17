import React from 'react';

export function BrandMark({ size = 'md' }) {
  const boxClass =
    size === 'lg'
      ? 'w-16 h-16 rounded-2xl'
      : size === 'sm'
      ? 'w-9 h-9 rounded-xl'
      : 'w-11 h-11 rounded-xl';
  const iconSize = size === 'lg' ? 32 : size === 'sm' ? 18 : 22;

  return (
    <div
      className={`${boxClass} bg-[#111827] border border-[#111827] flex items-center justify-center shrink-0`}
      aria-hidden="true"
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 12H7L9.5 5.5L13.5 18.5L16.5 10L18.5 12H21"
          stroke="#10B981"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="18.5" cy="6.5" r="2" fill="#3B82F6" />
      </svg>
    </div>
  );
}

