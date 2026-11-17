import React, { useState } from 'react';
import { Award, CheckCircle2, LogOut, RotateCcw, Settings, Share2, X } from '../../components/Icons';

export function ProfileTab({
  user,
  xp,
  streak,
  certificates,
  onResetTutorial,
  onClearEnrollments,
  onLogout,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareToast, setShareToast] = useState('');

  const initials = (user.name || 'AA')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const handleShare = async (cert) => {
    const shareText = `Saya telah menamatkan ${cert.title} (${cert.grade}) di CoPED PULSE · Kod Sijil: ${cert.verifyCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: cert.title,
          text: shareText,
        });
        return;
      } catch {
        // Fallback to clipboard notice below
      }
    }
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareText);
      } catch {
        // Ignore clipboard errors in restricted contexts
      }
    }
    setShareToast(`Pautan sijil ${cert.verifyCode} disalin!`);
    setTimeout(() => setShareToast(''), 2500);
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar px-4 pt-5 pb-24 space-y-5 relative">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-[#111827] border border-[#111827] text-white flex items-center justify-center text-xl font-extrabold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold text-[#111827] truncate">
              {user.name}
            </h1>
            <p className="text-xs text-[#6B7280] truncate">{user.email}</p>
            <p className="text-xs font-semibold text-[#3B82F6] mt-0.5">
              {user.roleLabel}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Tetapan Profil"
          className="w-10 h-10 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-center text-[#111827] shrink-0 active:translate-y-[2px]"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-center">
          <p className="text-xl font-extrabold text-[#111827]">{xp}</p>
          <p className="text-xs text-[#6B7280]">Jumlah XP</p>
        </div>
        <div className="p-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-center">
          <p className="text-xl font-extrabold text-[#111827]">{streak}h</p>
          <p className="text-xs text-[#6B7280]">Streak</p>
        </div>
        <div className="p-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-center">
          <p className="text-xl font-extrabold text-[#111827]">
            {certificates.length}
          </p>
          <p className="text-xs text-[#6B7280]">Sijil</p>
        </div>
      </div>

      {shareToast && (
        <div className="p-3 rounded-xl border border-[#10B981] bg-[#D1FAE5] text-xs font-bold text-[#065F46] text-center">
          {shareToast}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#111827]">
            Achievements
          </h2>
          <span className="text-xs font-semibold text-[#6B7280]">
            Sijil Rasmi
          </span>
        </div>

        <div className="space-y-3">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl border border-[#F59E0B] bg-[#FEF3C7] flex items-center justify-center text-[#92400E] shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-semibold text-[#6B7280]">
                    {cert.issuer}
                  </p>
                  <h3 className="text-sm font-bold text-[#111827] leading-snug">
                    {cert.title}
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#D1FAE5] border border-[#10B981] font-semibold text-[#065F46]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>✓ Completed on {cert.completedAt}</span>
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FEF3C7] border border-[#F59E0B] font-bold text-[#92400E]">
                  ★ Grade: {cert.grade}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleShare(cert)}
                className="w-full min-h-[44px] rounded-xl border border-[#111827] bg-white text-[#111827] text-sm font-semibold flex items-center justify-center gap-2 active:translate-y-[2px] transition-transform duration-75"
              >
                <Share2 className="w-4 h-4" />
                <span>Share...</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {settingsOpen && (
        <div className="fixed inset-0 z-30 max-w-[430px] mx-auto bg-black/50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl border-t border-[#111827] p-5 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-xl font-extrabold text-[#111827]">Tetapan</h2>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="w-9 h-9 rounded-full border border-[#E5E7EB] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onResetTutorial();
                setSettingsOpen(false);
                setShareToast('Tutorial 3-Tap Spotlight telah ditetapkan semula.');
                setTimeout(() => setShareToast(''), 2500);
              }}
              className="w-full min-h-[48px] px-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-sm font-semibold text-[#111827] flex items-center gap-2.5 active:translate-y-[2px]"
            >
              <RotateCcw className="w-4 h-4 text-[#3B82F6]" />
              <span>Set Semula Tutorial 3-Tap Spotlight</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClearEnrollments();
                setSettingsOpen(false);
              }}
              className="w-full min-h-[48px] px-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-sm font-semibold text-[#111827] flex items-center gap-2.5 active:translate-y-[2px]"
            >
              <RotateCcw className="w-4 h-4 text-[#F59E0B]" />
              <span>Kosongkan Kursus (Papar Empty State Learn)</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="w-full min-h-[48px] px-4 rounded-xl border border-[#111827] bg-[#111827] text-white text-sm font-semibold flex items-center justify-center gap-2 active:translate-y-[2px]"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Keluar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

