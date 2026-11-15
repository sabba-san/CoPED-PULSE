import { useEffect, useId, useRef, useState } from 'react';
import { CheckIcon } from '@/Components/flat/icons';

/**
 * Single "Sort" button that opens a panel of option groups.
 * groups: [{ id, label, value, defaultValue, onChange, options: [{ value, label }] }]
 */
export default function SortMenu({ groups = [], label = 'Sort' }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const panelId = useId();
    const isCustomized = groups.some((g) => g.value !== g.defaultValue);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
        };
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls={panelId}
                className={`px-4 py-2 text-xs font-bold rounded-md border-2 transition-colors min-h-[38px] inline-flex items-center gap-2 ${
                    open || isCustomized
                        ? 'bg-[#111827] text-white border-[#111827]'
                        : 'bg-white text-[#111827] border-[#E5E7EB] hover:border-[#111827]'
                }`}
            >
                <span>{label}</span>
                {isCustomized && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" aria-hidden="true" />}
                <span aria-hidden="true" className="text-[10px]">▾</span>
            </button>

            {open && (
                <div
                    id={panelId}
                    className="absolute right-0 mt-2 w-56 z-30 bg-white border-2 border-[#111827] rounded-md py-2"
                >
                    {groups.map((group, gi) => (
                        <div
                            key={group.id}
                            role="radiogroup"
                            aria-label={group.label}
                            className={gi > 0 ? 'mt-2 pt-2 border-t-2 border-[#E5E7EB]' : ''}
                        >
                            <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                                {group.label}
                            </div>
                            {group.options.map((opt) => {
                                const checked = group.value === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={checked}
                                        onClick={() => group.onChange(opt.value)}
                                        className={`w-full px-3 py-1.5 text-left text-xs font-bold flex items-center justify-between hover:bg-[#F3F4F6] ${
                                            checked ? 'text-[#111827]' : 'text-gray-600'
                                        }`}
                                    >
                                        <span>{opt.label}</span>
                                        {checked && <CheckIcon className="w-3.5 h-3.5 text-[#10B981]" />}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
