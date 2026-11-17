import React, { useEffect, useState } from 'react';

const STEPS = [
  {
    id: 0,
    targetAttr: 'progress-bar',
    title: 'Langkah 1 daripada 3 · Bar Kemajuan',
    text: 'Ikuti 4 langkah mudah: Video -> Aktiviti -> Nota -> Latihan & Kuiz.',
    placement: 'below',
  },
  {
    id: 1,
    targetAttr: 'math-canvas',
    title: 'Langkah 2 daripada 3 · Kanvas Interaktif',
    text: 'Sentuh dan gerakkan objek matematik di sini.',
    placement: 'above',
  },
  {
    id: 2,
    targetAttr: 'xp-pill',
    title: 'Langkah 3 daripada 3 · Mata XP & Sijil',
    text: 'Kumpul XP dan capai 100% untuk sijil anda.',
    placement: 'below',
  },
];

export function SpotlightTutorial({ containerRef, stepIndex, onNext, onSkip }) {
  const [rect, setRect] = useState(null);
  const step = STEPS[stepIndex] || STEPS[0];

  useEffect(() => {
    const measure = () => {
      const container = containerRef?.current;
      if (!container) return;
      const target = container.querySelector(`[data-spotlight="${step.targetAttr}"]`);
      if (!target) {
        setRect(null);
        return;
      }
      const cBox = container.getBoundingClientRect();
      const tBox = target.getBoundingClientRect();
      const pad = 6;
      setRect({
        x: Math.max(8, tBox.left - cBox.left - pad),
        y: Math.max(8, tBox.top - cBox.top - pad),
        width: Math.min(cBox.width - 16, tBox.width + pad * 2),
        height: tBox.height + pad * 2,
        containerW: cBox.width,
        containerH: cBox.height,
      });
    };

    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [containerRef, step.targetAttr, stepIndex]);

  const isLast = stepIndex === STEPS.length - 1;

  const tooltipStyle = (() => {
    if (!rect) return { bottom: '24px' };
    if (step.placement === 'below') {
      return { top: `${Math.min(rect.y + rect.height + 14, rect.containerH - 210)}px` };
    }
    return {
      bottom: `${Math.max(20, rect.containerH - rect.y + 14)}px`,
    };
  })();

  return (
    <div
      className="absolute inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Tutorial 3-Tap Spotlight"
    >
      {rect ? (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${rect.containerW} ${rect.containerH}`}
          preserveAspectRatio="none"
        >
          <defs>
            <mask id="coped-spotlight-mask">
              <rect
                x="0"
                y="0"
                width={rect.containerW}
                height={rect.containerH}
                fill="white"
              />
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                rx="14"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width={rect.containerW}
            height={rect.containerH}
            fill="rgba(0, 0, 0, 0.62)"
            mask="url(#coped-spotlight-mask)"
          />
          <rect
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            rx="14"
            fill="none"
            stroke="#10B981"
            strokeWidth="2.5"
          />
        </svg>
      ) : (
        <div className="absolute inset-0 bg-black/60 pointer-events-none" />
      )}

      <div
        style={tooltipStyle}
        className="absolute left-4 right-4 z-10 rounded-2xl border border-[#111827] bg-white p-4 space-y-3"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#D1FAE5] border border-[#10B981] text-xs font-bold text-[#065F46]">
            {step.title}
          </span>
          <div className="flex items-center gap-1">
            {STEPS.map((s) => (
              <span
                key={s.id}
                className={`h-1.5 rounded-full ${
                  s.id === stepIndex ? 'w-4 bg-[#111827]' : 'w-1.5 bg-[#D1D5DB]'
                }`}
              />
            ))}
          </div>
        </div>

        <p className="text-sm font-semibold text-[#111827] leading-relaxed">
          {step.text}
        </p>

        <div className="flex items-center justify-between gap-2.5 pt-1">
          <button
            type="button"
            onClick={onSkip}
            className="min-h-[44px] px-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-xs font-bold text-[#4B5563] active:translate-y-[2px] transition-transform duration-75"
          >
            Langkau
          </button>

          <button
            type="button"
            onClick={onNext}
            className="flex-1 min-h-[44px] px-4 rounded-xl border border-[#111827] bg-[#111827] text-white text-sm font-semibold active:translate-y-[2px] transition-transform duration-75"
          >
            {isLast ? 'Mula Belajar ✓' : 'Seterusnya →'}
          </button>
        </div>
      </div>
    </div>
  );
}

