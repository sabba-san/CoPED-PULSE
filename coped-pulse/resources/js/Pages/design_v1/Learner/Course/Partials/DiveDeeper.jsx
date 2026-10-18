import { useState } from 'react';

/**
 * Expandable "Dive deeper" drawer: shows the instructor's transcript
 * when provided, otherwise the module description. No AI involved -
 * wire an LLM endpoint here later for generated summaries.
 */
export default function DiveDeeper({ module, transcript = null, open, onToggle }) {
    const [expanded, setExpanded] = useState(false);
    const isOpen = open ?? expanded;
    const toggle = () => {
        setExpanded((v) => !v);
        onToggle?.(!isOpen);
    };
    const text = transcript ?? module.transcript;

    return (
        <div className="mt-4 rounded-md border-2 border-[#E5E7EB] bg-blue-50/60 overflow-hidden">
            <button
                type="button"
                onClick={toggle}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-3 p-4 text-left"
            >
                <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                    Dive deeper on this topic
                </span>
                <svg
                    className={`w-4 h-4 text-[#3B82F6] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="px-4 pb-4">
                    {text ? (
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">
                            {text}
                        </p>
                    ) : (
                        <>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">
                                {module.description || 'No additional notes for this module yet.'}
                            </p>
                            <p className="mt-2 text-[11px] text-gray-400">
                                Transcripts appear here once the instructor adds one.
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
