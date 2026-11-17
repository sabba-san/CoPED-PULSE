import React from 'react';
import { Award, CheckCircle2, ChevronRight, Layers } from '../../components/Icons';
import { CAREER_TRACKS, COURSES } from '../../data/curriculum';

export function CareerTab({ enrolledIds, onEnrollTrack }) {
  return (
    <div className="h-full overflow-y-auto no-scrollbar px-4 pt-5 pb-24 space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-[#6B7280]">
          Laluan Pembelajaran Berstruktur
        </p>
        <h1 className="text-xl font-extrabold text-[#111827]">Career</h1>
      </div>

      <div className="space-y-3.5">
        {CAREER_TRACKS.map((track) => {
          const allEnrolled = track.courseIds.every((id) =>
            enrolledIds.includes(id)
          );
          const includedCourses = COURSES.filter((c) =>
            track.courseIds.includes(c.id)
          );

          return (
            <div
              key={track.id}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="px-2.5 py-1 rounded-full border text-xs font-bold"
                  style={{
                    backgroundColor: track.accentBg,
                    borderColor: track.accentBorder,
                    color: track.accentText,
                  }}
                >
                  {track.badge}
                </span>
                <span className="text-xs font-medium text-[#6B7280]">
                  {track.duration}
                </span>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-[#111827] leading-snug">
                  {track.title}
                </h2>
                <p className="text-xs font-semibold text-[#6B7280]">
                  {track.provider}
                </p>
              </div>

              <p className="text-sm text-[#4B5563] leading-relaxed">
                {track.outcomes}
              </p>

              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#111827]">
                  <Layers className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Kursus Dalam Laluan ({includedCourses.length})</span>
                </div>
                <div className="space-y-1.5">
                  {includedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between text-xs text-[#374151]"
                    >
                      <span className="font-medium truncate pr-2">
                        · {course.title}
                      </span>
                      <span className="shrink-0 font-semibold text-[#6B7280]">
                        {course.badgeCode}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onEnrollTrack(track.courseIds)}
                className={`w-full min-h-[48px] rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 active:translate-y-[2px] transition-transform duration-75 ${
                  allEnrolled
                    ? 'bg-[#D1FAE5] border-[#10B981] text-[#065F46]'
                    : 'bg-[#111827] border-[#111827] text-white'
                }`}
              >
                {allEnrolled ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Buka Laluan di Learn</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>Sertai Laluan Ini</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

