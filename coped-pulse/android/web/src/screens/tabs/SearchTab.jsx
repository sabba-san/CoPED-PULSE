import React, { useState } from 'react';
import { ArrowRight, Search, X } from '../../components/Icons';
import { COURSES, SEARCH_CHIPS } from '../../data/curriculum';

export function SearchTab({ enrolledIds, onEnrollCourse, onOpenCourse }) {
  const [query, setQuery] = useState('');

  const normalized = query.trim().toLowerCase();
  const results = COURSES.filter((course) => {
    if (!normalized) return true;
    const haystack = `${course.title} ${course.unitTitle} ${course.topic} ${course.institution} ${course.shortDesc}`.toLowerCase();
    return haystack.includes(normalized);
  });

  return (
    <div className="h-full overflow-y-auto no-scrollbar px-4 pt-5 pb-24 space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-[#6B7280]">
          Carian Pantas Topik &amp; Kursus
        </p>
        <h1 className="text-xl font-extrabold text-[#111827]">Search</h1>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari topik, bab, atau sijil..."
          className="w-full min-h-[48px] pl-10 pr-10 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#3B82F6] focus:bg-white"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Padam carian"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#E5E7EB] flex items-center justify-center text-[#111827]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#6B7280]">Topik Popular</p>
        <div className="flex flex-wrap gap-2">
          {SEARCH_CHIPS.map((chip) => {
            const active = normalized === chip.toLowerCase();
            return (
              <button
                key={chip}
                type="button"
                onClick={() => setQuery(active ? '' : chip)}
                className={`px-3 py-1.5 rounded-full border text-xs font-semibold active:translate-y-[2px] transition-transform duration-75 ${
                  active
                    ? 'bg-[#111827] border-[#111827] text-white'
                    : 'bg-white border-[#E5E7EB] text-[#111827]'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5 pt-1">
        <p className="text-xs font-semibold text-[#6B7280]">
          Keputusan ({results.length})
        </p>

        {results.length === 0 ? (
          <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] text-center space-y-1">
            <p className="text-sm font-bold text-[#111827]">
              Tiada padanan ditemui
            </p>
            <p className="text-xs text-[#6B7280]">
              Cuba kata kunci lain seperti Persamaan Linear atau Data Science.
            </p>
          </div>
        ) : (
          results.map((course) => {
            const isEnrolled = enrolledIds.includes(course.id);
            return (
              <button
                key={course.id}
                type="button"
                onClick={() =>
                  isEnrolled ? onOpenCourse(course.id) : onEnrollCourse(course.id)
                }
                className="w-full p-3.5 rounded-2xl border border-[#E5E7EB] bg-white flex items-center justify-between gap-3 text-left active:translate-y-[2px] transition-transform duration-75"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded-full border text-xs font-bold"
                      style={{
                        backgroundColor: course.accentBg,
                        borderColor: course.accentBorder,
                        color: course.accentText,
                      }}
                    >
                      {course.badgeCode}
                    </span>
                    <span className="text-xs text-[#6B7280]">
                      {course.institution}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#111827] truncate">
                    {course.title}
                  </p>
                  <p className="text-xs text-[#6B7280] truncate">
                    {course.unitCode} · {course.unitTitle}
                  </p>
                </div>

                <div className="w-9 h-9 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-center text-[#111827] shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

