import React, { useEffect, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  HelpCircle,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  X,
} from '../components/Icons';
import { SpotlightTutorial } from '../components/SpotlightTutorial';

const STAGE_LABELS = ['1. Video', '2. Aktiviti Interaktif', '3. Nota Ringkas', '4. Imbasan & Kuiz'];

export function LessonPlayer({
  course,
  node,
  xp,
  ftueActive,
  ftueStep,
  containerRef,
  onFtueNext,
  onFtueSkip,
  onReplayTutorial,
  onClose,
  onCompleteNode,
}) {
  const initialStage = node?.stage ?? 0;
  const [stage, setStage] = useState(initialStage);

  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoStep, setVideoStep] = useState(0);

  const [canvasMode, setCanvasMode] = useState(
    course.interactiveKind === 'quadratic' ? 'quadratic' : 'balance'
  );
  const [balance, setBalance] = useState({ a: 2, b: 5, r: 13, tilt: 0 });
  const [quad, setQuad] = useState({ a: 1, b: 0, c: 0 });

  const [noteChecked, setNoteChecked] = useState(false);

  const [scanned, setScanned] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const [feedback, setFeedback] = useState(null);

  const displayedStage = ftueActive && ftueStep === 1 ? 1 : stage;

  useEffect(() => {
    if (!videoPlaying || displayedStage !== 0) return;
    const timer = setInterval(() => {
      setVideoStep((prev) => (prev + 1) % 3);
    }, 2200);
    return () => clearInterval(timer);
  }, [videoPlaying, displayedStage]);

  const isBalanceSolved = balance.a === 1 && balance.b === 0 && balance.r === 4;
  const isQuadSolved = quad.a === -1 && quad.c === 4;

  const handleBalanceOp = (op) => {
    setFeedback(null);
    setBalance((prev) => {
      if (op === 'sub5' && prev.b === 5) {
        return { a: prev.a, b: 0, r: prev.r - 5, tilt: 0 };
      }
      if (op === 'div2' && prev.b === 0 && prev.a === 2) {
        return { a: 1, b: 0, r: prev.r / 2, tilt: 0 };
      }
      if (op === 'div2' && prev.b !== 0) {
        return { ...prev, tilt: -6 };
      }
      return { ...prev, tilt: 6 };
    });
  };

  const resetBalance = () => {
    setBalance({ a: 2, b: 5, r: 13, tilt: 0 });
    setFeedback(null);
  };

  const handlePrimaryCta = () => {
    if (displayedStage === 0) {
      setStage(1);
      setFeedback(null);
      return;
    }

    if (displayedStage === 1) {
      const ok = canvasMode === 'balance' ? isBalanceSolved : isQuadSolved;
      if (ok) {
        setFeedback({
          ok: true,
          title: 'Tepat Sekali! +15 XP',
          message:
            canvasMode === 'balance'
              ? 'Timbangan seimbang pada x = 4.'
              : 'Graf kuadratik maksimum (a = -1, c = 4) berjaya dibina.',
        });
      } else {
        setFeedback({
          ok: false,
          title: 'Belum Selesai',
          message:
            canvasMode === 'balance'
              ? 'Tolak 5 dahulu pada kedua-dua belah, kemudian bahagi 2 untuk dapatkan x.'
              : 'Laraskan nilai a = -1 dan c = 4 pada kawalan graf.',
        });
      }
      return;
    }

    if (displayedStage === 2) {
      setStage(3);
      setFeedback(null);
      return;
    }

    if (!selectedOption) {
      setFeedback({
        ok: false,
        title: 'Pilih Jawapan',
        message: 'Sila pilih satu jawapan sebelum menyemak.',
      });
      return;
    }

    if (selectedOption === course.lesson.quizAnswer) {
      setFeedback({
        ok: true,
        title: `Tahniah! +${node.xp} XP`,
        message: course.lesson.quizExplanation,
        isFinal: true,
      });
    } else {
      setFeedback({
        ok: false,
        title: 'Cuba Lagi',
        message: 'Jawapan belum tepat. Semak semula langkah persamaan di atas.',
      });
    }
  };

  const handleFeedbackContinue = () => {
    const wasFinal = feedback?.isFinal;
    const wasOk = feedback?.ok;
    setFeedback(null);
    if (!wasOk) return;

    if (wasFinal) {
      onCompleteNode(course.id, node.id, node.xp);
      return;
    }
    if (stage < 3) {
      setStage(stage + 1);
    }
  };

  const buildParabolaPath = () => {
    const pts = [];
    for (let x = -5; x <= 5; x += 0.25) {
      const y = quad.a * x * x + quad.b * x + quad.c;
      const sx = 120 + x * 20;
      const sy = 90 - y * 10;
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${Math.max(-20, Math.min(200, sy)).toFixed(1)}`);
    }
    return pts.join(' ');
  };

  const progressPercent = ((displayedStage + 1) / 4) * 100;

  return (
    <div className="h-[100dvh] w-full bg-white flex flex-col justify-between overflow-hidden relative">
      <div className="px-4 pt-4 pb-3 border-b border-[#E5E7EB] flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onClose}
          aria-label="Keluar Pelajaran"
          className="w-9 h-9 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-center text-[#111827] shrink-0 active:translate-y-[2px]"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          data-spotlight="progress-bar"
          className="flex-1 flex flex-col gap-1 px-1 py-0.5 rounded-xl"
        >
          <div className="h-3 w-full rounded-full bg-[#F3F4F6] border border-[#E5E7EB] overflow-hidden">
            <div
              className="h-full bg-[#10B981] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-bold text-[#6B7280]">
            <span>{STAGE_LABELS[displayedStage]}</span>
            <span>{displayedStage + 1}/4</span>
          </div>
        </div>

        <div
          data-spotlight="xp-pill"
          className="px-2.5 py-1.5 rounded-xl border border-[#F59E0B] bg-[#FEF3C7] flex items-center gap-1 text-xs font-extrabold text-[#92400E] shrink-0"
        >
          <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#D97706]" />
          <span>{xp} XP</span>
        </div>

        <button
          type="button"
          onClick={onReplayTutorial}
          aria-label="Ulang Tutorial"
          className="w-9 h-9 rounded-xl border border-[#E5E7EB] bg-white flex items-center justify-center text-[#3B82F6] shrink-0 active:translate-y-[2px]"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 px-4 py-3 flex flex-col justify-center overflow-hidden">
        <div
          data-spotlight="math-canvas"
          className="w-full h-full max-h-[540px] flex flex-col justify-between gap-3"
        >
          {displayedStage === 0 && (
            <>
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#3B82F6]">
                  LANGKAH 1 · VIDEO &amp; KONSEP
                </p>
                <h1 className="text-xl font-extrabold text-[#111827] leading-snug">
                  {course.lesson.videoTitle}
                </h1>
              </div>

              <div className="rounded-2xl border border-[#111827] bg-[#111827] text-white p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-[#1F2937] border border-[#374151] text-xs font-semibold text-[#10B981]">
                    Animasi Konsep
                  </span>
                  <button
                    type="button"
                    onClick={() => setVideoPlaying((p) => !p)}
                    className="px-3 py-1 rounded-full bg-white text-[#111827] text-xs font-bold flex items-center gap-1 active:translate-y-[2px]"
                  >
                    {videoPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Jeda</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Main</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="h-28 rounded-xl border border-[#374151] bg-[#1F2937] flex flex-col items-center justify-center text-center px-3">
                  <p className="text-xs font-semibold text-[#9CA3AF]">
                    Langkah Visual {videoStep + 1}/3
                  </p>
                  <p className="text-xl font-extrabold text-white mt-1">
                    {course.interactiveKind === 'quadratic'
                      ? ['y = ax² + bx + c', 'a < 0 -> Maksimum', 'c = Pintasan-y'][videoStep]
                      : ['2x + 5 = 13', '2x = 13 - 5 = 8', 'x = 8 ÷ 2 = 4'][videoStep]}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-3.5 space-y-2">
                {course.lesson.videoPoints.map((pt, i) => (
                  <p key={i} className="text-xs font-medium text-[#374151] leading-relaxed">
                    · {pt}
                  </p>
                ))}
              </div>
            </>
          )}

          {displayedStage === 1 && (
            <>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-[#10B981]">
                    LANGKAH 2 · AKTIVITI INTERAKTIF
                  </p>
                  <h1 className="text-xl font-extrabold text-[#111827]">
                    {canvasMode === 'balance'
                      ? 'Timbangan Persamaan Linear'
                      : 'Peneroka Graf Kuadratik'}
                  </h1>
                </div>
                <div className="flex rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] p-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setCanvasMode('balance');
                      setFeedback(null);
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      canvasMode === 'balance'
                        ? 'bg-[#111827] text-white'
                        : 'text-[#6B7280]'
                    }`}
                  >
                    ⚖️ Linear
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCanvasMode('quadratic');
                      setFeedback(null);
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      canvasMode === 'quadratic'
                        ? 'bg-[#111827] text-white'
                        : 'text-[#6B7280]'
                    }`}
                  >
                    📈 Graf
                  </button>
                </div>
              </div>

              {canvasMode === 'balance' ? (
                <div className="flex-1 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#111827]">
                      Selesaikan: 2x + 5 = 13
                    </p>
                    <button
                      type="button"
                      onClick={resetBalance}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#6B7280]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>

                  <div className="py-3 flex flex-col items-center justify-center">
                    <div
                      className="w-full flex items-end justify-between px-2 transition-transform duration-200"
                      style={{ transform: `rotate(${balance.tilt}deg)` }}
                    >
                      <div className="w-[42%] rounded-xl border border-[#3B82F6] bg-[#DBEAFE] p-2.5 text-center space-y-1">
                        <p className="text-xs font-bold text-[#1D4ED8]">KIRI</p>
                        <div className="flex flex-wrap justify-center gap-1">
                          {Array.from({ length: balance.a }).map((_, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 rounded-lg bg-[#3B82F6] text-white text-xs font-extrabold"
                            >
                              x
                            </span>
                          ))}
                          {balance.b > 0 && (
                            <span className="px-2 py-1 rounded-lg bg-white border border-[#3B82F6] text-[#1D4ED8] text-xs font-extrabold">
                              +{balance.b}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-xl font-extrabold text-[#111827] pb-2">
                        =
                      </span>

                      <div className="w-[42%] rounded-xl border border-[#10B981] bg-[#D1FAE5] p-2.5 text-center space-y-1">
                        <p className="text-xs font-bold text-[#065F46]">KANAN</p>
                        <div className="inline-block px-3 py-1 rounded-lg bg-[#10B981] text-white text-sm font-extrabold">
                          {balance.r}
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-1.5 bg-[#111827] rounded-full mt-1" />
                    <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[16px] border-l-transparent border-r-transparent border-b-[#111827]" />

                    <p className="mt-2 text-sm font-extrabold text-[#111827]">
                      {balance.a === 1 ? 'x' : `${balance.a}x`}
                      {balance.b > 0 ? ` + ${balance.b}` : ''} = {balance.r}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleBalanceOp('sub5')}
                      disabled={balance.b === 0}
                      className={`min-h-[44px] rounded-xl border text-xs font-bold active:translate-y-[2px] transition-transform duration-75 ${
                        balance.b === 0
                          ? 'bg-[#E5E7EB] border-[#D1D5DB] text-[#9CA3AF]'
                          : 'bg-white border-[#111827] text-[#111827]'
                      }`}
                    >
                      Tolak 5 (-5) Kedua Belah
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBalanceOp('div2')}
                      disabled={balance.a === 1}
                      className={`min-h-[44px] rounded-xl border text-xs font-bold active:translate-y-[2px] transition-transform duration-75 ${
                        balance.a === 1
                          ? 'bg-[#E5E7EB] border-[#D1D5DB] text-[#9CA3AF]'
                          : 'bg-white border-[#111827] text-[#111827]'
                      }`}
                    >
                      Bahagi 2 (÷2) Kedua Belah
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#111827]">
                      Sasaran: Graf Maksimum (a = -1, c = 4)
                    </p>
                    <span className="text-xs font-extrabold text-[#3B82F6]">
                      y = {quad.a}x² {quad.c >= 0 ? `+ ${quad.c}` : `- ${Math.abs(quad.c)}`}
                    </span>
                  </div>

                  <div className="rounded-xl border border-[#E5E7EB] bg-white p-2 flex items-center justify-center">
                    <svg viewBox="0 0 240 160" className="w-full h-36">
                      <line x1="0" y1="90" x2="240" y2="90" stroke="#E5E7EB" strokeWidth="1.5" />
                      <line x1="120" y1="0" x2="120" y2="160" stroke="#E5E7EB" strokeWidth="1.5" />
                      <path
                        d={buildParabolaPath()}
                        fill="none"
                        stroke={isQuadSolved ? '#10B981' : '#3B82F6'}
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <circle cx="120" cy={90 - quad.c * 10} r="4.5" fill="#111827" />
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-[#E5E7EB] bg-white p-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111827]">a = {quad.a}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setQuad((q) => ({ ...q, a: -1 }))}
                          className={`px-2 py-1 rounded-lg border text-xs font-bold ${
                            quad.a === -1 ? 'bg-[#111827] text-white border-[#111827]' : 'bg-[#F3F4F6] border-[#E5E7EB]'
                          }`}
                        >
                          -1
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuad((q) => ({ ...q, a: 1 }))}
                          className={`px-2 py-1 rounded-lg border text-xs font-bold ${
                            quad.a === 1 ? 'bg-[#111827] text-white border-[#111827]' : 'bg-[#F3F4F6] border-[#E5E7EB]'
                          }`}
                        >
                          +1
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#E5E7EB] bg-white p-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111827]">c = {quad.c}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setQuad((q) => ({ ...q, c: Math.max(-4, q.c - 1) }))}
                          className="w-7 h-7 rounded-lg border border-[#E5E7EB] bg-[#F3F4F6] text-xs font-bold"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuad((q) => ({ ...q, c: Math.min(5, q.c + 1) }))}
                          className="w-7 h-7 rounded-lg border border-[#E5E7EB] bg-[#F3F4F6] text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {displayedStage === 2 && (
            <>
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#F59E0B]">
                  LANGKAH 3 · NOTA RINGKAS
                </p>
                <h1 className="text-xl font-extrabold text-[#111827]">
                  {course.lesson.noteTitle}
                </h1>
              </div>

              <div className="rounded-2xl border border-[#111827] bg-[#FEF3C7] p-4 text-center space-y-1">
                <p className="text-xs font-bold text-[#92400E]">RUMUS UTAMA</p>
                <p className="text-sm font-extrabold text-[#111827]">
                  {course.lesson.noteFormula}
                </p>
              </div>

              <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 space-y-2.5">
                {course.lesson.noteSteps.map((st, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-[#E5E7EB] bg-white text-xs font-semibold text-[#111827]"
                  >
                    {st}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setNoteChecked((v) => !v)}
                className={`min-h-[44px] px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 active:translate-y-[2px] ${
                  noteChecked
                    ? 'bg-[#D1FAE5] border-[#10B981] text-[#065F46]'
                    : 'bg-white border-[#E5E7EB] text-[#111827]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {noteChecked
                    ? 'Nota difahami! Sedia untuk kuiz.'
                    : 'Tandakan Saya Faham Nota Ini'}
                </span>
              </button>
            </>
          )}

          {displayedStage === 3 && (
            <>
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#3B82F6]">
                  LANGKAH 4 · IMBASAN KERTAS &amp; KUIZ
                </p>
                <h1 className="text-xl font-extrabold text-[#111827] leading-snug">
                  {course.lesson.quizQuestion}
                </h1>
              </div>

              <button
                type="button"
                onClick={() => setScanned(true)}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between gap-3 text-left active:translate-y-[2px] transition-transform duration-75 ${
                  scanned
                    ? 'border-[#10B981] bg-[#D1FAE5]'
                    : 'border-[#E5E7EB] bg-[#F9FAFB]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#111827]">
                    {scanned ? (
                      <Sparkles className="w-5 h-5 text-[#10B981]" />
                    ) : (
                      <Camera className="w-5 h-5 text-[#3B82F6]" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#111827]">
                      {scanned
                        ? '✓ Kerja kertas diimbas!'
                        : 'Imbasan Kertas Kerja (Pilihan)'}
                    </p>
                    <p className="text-xs text-[#4B5563]">
                      {scanned
                        ? 'Langkah pengiraan disahkan kemas.'
                        : 'Ketik untuk simulasi imbasan kamera.'}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB] text-xs font-bold text-[#111827]">
                  {scanned ? 'Selesai' : 'Imbas'}
                </span>
              </button>

              <div className="grid grid-cols-1 gap-2">
                {course.lesson.quizOptions.map((opt) => {
                  const chosen = selectedOption === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSelectedOption(opt);
                        setFeedback(null);
                      }}
                      className={`w-full min-h-[48px] px-4 rounded-xl border text-left text-sm font-bold flex items-center justify-between active:translate-y-[2px] transition-transform duration-75 ${
                        chosen
                          ? 'bg-[#DBEAFE] border-[#3B82F6] text-[#1D4ED8]'
                          : 'bg-white border-[#E5E7EB] text-[#111827]'
                      }`}
                    >
                      <span>{opt}</span>
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                          chosen
                            ? 'bg-[#3B82F6] border-[#3B82F6] text-white'
                            : 'border-[#D1D5DB]'
                        }`}
                      >
                        {chosen ? '✓' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="px-4 pb-5 pt-2 bg-white border-t border-[#E5E7EB] shrink-0">
        <button
          type="button"
          onClick={handlePrimaryCta}
          className="w-full min-h-[48px] rounded-xl bg-[#111827] text-white text-sm font-semibold border border-[#111827] active:translate-y-[2px] transition-transform duration-75"
        >
          {displayedStage === 1 || displayedStage === 3
            ? 'Semak Jawapan'
            : 'Teruskan →'}
        </button>
      </div>

      {feedback && (
        <div
          className={`absolute inset-x-0 bottom-0 z-30 border-t-2 p-5 space-y-3 ${
            feedback.ok
              ? 'bg-[#D1FAE5] border-[#10B981]'
              : 'bg-[#FEF3C7] border-[#F59E0B]'
          }`}
        >
          <div className="space-y-1">
            <h3
              className={`text-xl font-extrabold ${
                feedback.ok ? 'text-[#065F46]' : 'text-[#92400E]'
              }`}
            >
              {feedback.title}
            </h3>
            <p className="text-sm font-medium text-[#111827]">
              {feedback.message}
            </p>
          </div>
          <button
            type="button"
            onClick={handleFeedbackContinue}
            className={`w-full min-h-[48px] rounded-xl text-sm font-semibold text-white active:translate-y-[2px] ${
              feedback.ok ? 'bg-[#10B981]' : 'bg-[#111827]'
            }`}
          >
            {feedback.ok
              ? feedback.isFinal
                ? 'Tuntut XP & Kembali ✓'
                : 'Teruskan →'
              : 'Cuba Semula'}
          </button>
        </div>
      )}

      {ftueActive && (
        <SpotlightTutorial
          containerRef={containerRef}
          stepIndex={ftueStep}
          onNext={onFtueNext}
          onSkip={onFtueSkip}
        />
      )}
    </div>
  );
}

