import React, { useState } from 'react';
import { BookOpen, Check, FileText, Flame, HelpCircle, X, Zap } from '../../components/Icons';
import { COURSES } from '../../data/curriculum';

const NODE_OFFSETS = [0, 38, 0, -38, 0];

export function LearnTab({
  enrolledIds,
  activeCourseId,
  onSelectCourse,
  onUnenrollCourse,
  completedNodeIds,
  xp,
  streak,
  onGoExplore,
  onStartNode,
  onReplayTutorial,
}) {
  const [syllabusOpen, setSyllabusOpen] = useState(false);

  const enrolledCourses = COURSES.filter((c) => enrolledIds.includes(c.id));
  const activeCourse =
    enrolledCourses.find((c) => c.id === activeCourseId) || enrolledCourses[0];

  if (!activeCourse) {
    return (
      <div className="h-full px-5 pt-6 pb-24 flex flex-col justify-between bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-[#111827]">Learn</h1>
          <span className="px-2.5 py-1 rounded-full border border-[#E5E7EB] bg-[#F3F4F6] text-xs font-semibold text-[#4B5563]">
            0 Kursus
          </span>
        </div>

        <div className="flex flex-col items-center text-center px-3 space-y-4">
          <div className="w-24 h-24 rounded-3xl border border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-center relative">
            <BookOpen className="w-11 h-11 text-[#3B82F6]" strokeWidth={1.8} />
            <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#FEF3C7] border border-[#F59E0B] flex items-center justify-center text-xs font-extrabold text-[#92400E]">
              ✦
            </span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-[#111827] leading-snug">
              You haven&apos;t enrolled in any courses (yet)
            </h2>
            <p className="text-sm text-[#6B7280]">
              Start by enrolling in a course and learn something new.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoExplore}
          className="w-full min-h-[48px] rounded-xl bg-[#111827] text-white text-sm font-semibold border border-[#111827] active:translate-y-[2px] transition-transform duration-75"
        >
          Explore courses
        </button>
      </div>
    );
  }

  const courseCompletedNodes = completedNodeIds[activeCourse.id] || [];

  return (
    <div className="h-full flex flex-col bg-white relative">
      <div className="px-4 pt-4 pb-3 border-b border-[#E5E7EB] bg-white flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSyllabusOpen(true)}
            className="px-2.5 py-1.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-xs font-extrabold text-[#111827] active:translate-y-[2px] transition-transform duration-75"
          >
            {activeCourse.badgeCode} ▾
          </button>

          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#F59E0B] bg-[#FEF3C7] text-xs font-extrabold text-[#92400E]">
            <Flame className="w-3.5 h-3.5 fill-[#F59E0B] text-[#D97706]" />
            <span>{streak}</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#3B82F6] bg-[#DBEAFE] text-xs font-extrabold text-[#1D4ED8]">
            <Zap className="w-3.5 h-3.5 fill-[#3B82F6] text-[#1D4ED8]" />
            <span>{xp} XP</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onReplayTutorial(activeCourse)}
          className="px-2.5 py-1.5 rounded-xl border border-[#E5E7EB] bg-white text-xs font-bold text-[#111827] flex items-center gap-1 active:translate-y-[2px] transition-transform duration-75"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span>? Tutorial</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-28 space-y-5">
        <div
          className="rounded-2xl border p-4 flex items-center justify-between gap-3"
          style={{
            backgroundColor: activeCourse.solidColor,
            borderColor: '#111827',
          }}
        >
          <div className="space-y-0.5 text-white">
            <p className="text-xs font-bold opacity-90 uppercase tracking-wide">
              {activeCourse.unitCode}
            </p>
            <h1 className="text-xl font-extrabold leading-snug">
              {activeCourse.unitTitle}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setSyllabusOpen(true)}
            aria-label="Panduan Silibus"
            className="w-11 h-11 rounded-xl bg-white border border-[#111827] flex items-center justify-center text-[#111827] shrink-0 active:translate-y-[2px] transition-transform duration-75"
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>

        <div className="relative py-2 flex flex-col items-center">
          <svg
            className="absolute top-8 bottom-8 w-[180px] pointer-events-none"
            viewBox="0 0 180 420"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M90 15 C140 65, 140 95, 128 115 C115 145, 70 175, 90 210 C110 245, 50 275, 52 310 C55 345, 90 375, 90 405"
              stroke="#E5E7EB"
              strokeWidth="4"
              strokeDasharray="8 8"
              strokeLinecap="round"
            />
          </svg>

          <div className="relative z-10 w-full flex flex-col items-center space-y-5">
            {activeCourse.nodes.map((node, index) => {
              const offset = NODE_OFFSETS[index % NODE_OFFSETS.length];
              const isDone = courseCompletedNodes.includes(node.id);
              const firstIncompleteIdx = activeCourse.nodes.findIndex(
                (n) => !courseCompletedNodes.includes(n.id)
              );
              const isActive =
                firstIncompleteIdx === -1
                  ? index === 0
                  : index === firstIncompleteIdx;
              const isChest = node.kind === 'chest';

              return (
                <div
                  key={node.id}
                  style={{ transform: `translateX(${offset}px)` }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="relative">
                    {isActive && (
                      <span
                        className="absolute -inset-2 rounded-full border-2 animate-node-ring pointer-events-none"
                        style={{ borderColor: activeCourse.solidColor }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => onStartNode(activeCourse, node)}
                      className={`w-[72px] h-[72px] rounded-full border-2 flex items-center justify-center text-xl font-extrabold active:translate-y-[2px] transition-transform duration-75 ${
                        isDone
                          ? 'bg-[#10B981] border-[#111827] text-white'
                          : isActive
                          ? 'bg-[#111827] border-[#111827] text-white'
                          : isChest
                          ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#92400E]'
                          : 'bg-[#F9FAFB] border-[#D1D5DB] text-[#111827]'
                      }`}
                    >
                      {isDone ? <Check className="w-7 h-7" strokeWidth={3} /> : node.icon}
                    </button>
                  </div>

                  <div className="px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB] text-center">
                    <span className="text-xs font-bold text-[#111827]">
                      {node.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {syllabusOpen && (
        <div className="absolute inset-0 z-30 bg-black/50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl border-t border-[#111827] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#111827]">
                Panduan Silibus &amp; Kursus
              </h2>
              <button
                type="button"
                onClick={() => setSyllabusOpen(false)}
                className="w-9 h-9 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#111827]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#6B7280]">
                Kursus Berdaftar ({enrolledCourses.length})
              </p>
              {enrolledCourses.map((c) => {
                const selected = c.id === activeCourse.id;
                return (
                  <div
                    key={c.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                      selected
                        ? 'border-[#111827] bg-[#F9FAFB]'
                        : 'border-[#E5E7EB] bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCourse(c.id);
                        setSyllabusOpen(false);
                      }}
                      className="text-left flex-1 min-w-0"
                    >
                      <p className="text-sm font-bold text-[#111827] truncate">
                        {c.badgeCode} · {c.title}
                      </p>
                      <p className="text-xs text-[#6B7280]">{c.unitTitle}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUnenrollCourse(c.id);
                        if (enrolledCourses.length <= 1) setSyllabusOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-[#E5E7EB] text-xs font-semibold text-[#DC2626] bg-white"
                    >
                      Keluar
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setSyllabusOpen(false)}
              className="w-full min-h-[48px] rounded-xl bg-[#111827] text-white text-sm font-semibold active:translate-y-[2px]"
            >
              Tutup Panduan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

