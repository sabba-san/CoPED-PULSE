import React, { useEffect, useState } from 'react';
import { BrandMark } from '../components/BrandMark';

export function SplashScreen({ onComplete }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 550);
    const doneTimer = setTimeout(() => onComplete(), 800);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <button
      type="button"
      onClick={onComplete}
      className={`w-full h-full bg-white flex flex-col items-center justify-center px-6 text-center transition-opacity duration-250 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
      aria-label="CoPED PULSE Splash Screen"
    >
      <div className="flex flex-col items-center gap-4">
        <BrandMark size="lg" />
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold tracking-tight text-[#111827]">
            CoPED PULSE
          </h1>
          <p className="text-sm font-semibold text-[#3B82F6]">
            One Stop Learn Center
          </p>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-[#F3F4F6]">
        <span className="w-2 h-2 rounded-full bg-[#10B981]" />
        <span className="text-xs font-medium text-[#4B5563]">
          UUM CoPED · KSSM &amp; KSSR Mobile
        </span>
      </div>
    </button>
  );
}

