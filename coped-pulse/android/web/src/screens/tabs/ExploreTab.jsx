import React, { useRef, useState } from 'react';
import { BookOpen, CheckCircle2, Star } from '../../components/Icons';
import { BrandMark } from '../../components/BrandMark';
import { COURSES, EXPLORE_TOPICS } from '../../data/curriculum';

export function ExploreTab({ enrolledIds, onEnrollCourse, onOpenCourse }) {
  const [selectedTopic, setSelectedTopic] = useState('all');
  const carouselRef = useRef(null);

  const filteredCourses =
    selectedTopic === 'all'
      ? COURSES
      : COURSES.filter((course) => course.topic === selectedTopic);

  const handleBannerAction = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar px-4 pt-5 pb-24 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#6B7280]">Katalog Kurikulum</p>
          <h1 className="text-xl font-extrabold text-[#111827]">Explore</h1>
        </div>
        <BrandMark size="sm" />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#6B7280]">Topik Pilihan</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {EXPLORE_TOPICS.map((topic) => {
            const active = selectedTopic === topic.id;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => setSelectedTopic(topic.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold transition-transform duration-75 active:translate-y-[2px] ${
                  active
                    ? 'bg-[#111827] text-white border-[#111827]'
                    : 'bg-[#F9FAFB] text-[#111827] border-[#E5E7EB]'
                }`}
              >
                <span>{topic.icon}</span>
                <span>{topic.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[#111827] bg-[#111827] text-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-full bg-[#1F2937] border border-[#374151] text-xs font-semibold text-[#10B981]">
            One Stop Learn Center
          </span>
          <span className="text-xs font-medium text-[#9CA3AF]">UUM · KPM</span>
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold leading-snug">
            CoPED PULSE · One Stop Learn Center
          </h2>
          <p className="text-sm text-[#D1D5DB]">
            Daftar kursus KSSM, KSSR dan sijil profesional dalam 1 sentuhan.
          </p>
        </div>
        <button
          type="button"
          onClick={handleBannerAction}
          className="w-full min-h-[48px] rounded-xl bg-[#10B981] text-[#111827] text-sm font-extrabold border border-[#10B981] active:translate-y-[2px] transition-transform duration-75"
        >
          Teroka Sekarang
        </button>
      </div>

      <div ref={carouselRef} className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#111827]">
            Kursus Pilihan ({filteredCourses.length})
          </h2>
          <span className="text-xs font-medium text-[#6B7280]">
            Leret ke kanan →
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledIds.includes(course.id);
            return (
              <div
                key={course.id}
                onClick={() => (isEnrolled ? onOpenCourse(course.id) : onEnrollCourse(course.id))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    isEnrolled ? onOpenCourse(course.id) : onEnrollCourse(course.id);
                  }
                }}
                className="w-[268px] shrink-0 snap-start rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden flex flex-col justify-between active:translate-y-[2px] transition-transform duration-75 cursor-pointer"
              >
                <div
                  className="h-28 p-3.5 flex flex-col justify-between border-b border-[#E5E7EB]"
                  style={{ backgroundColor: course.accentBg }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2.5 py-1 rounded-full bg-white border text-xs font-bold"
                      style={{
                        borderColor: course.accentBorder,
                        color: course.accentText,
                      }}
                    >
                      {course.badgeCode}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center">
                      <BookOpen
                        className="w-4 h-4"
                        style={{ color: course.accentText }}
                      />
                    </div>
                  </div>
                  <p
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: course.accentText }}
                  >
                    {course.topic}
                  </p>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-[#6B7280]">
                      {course.institution}
                    </p>
                    <h3 className="text-sm font-bold text-[#111827] leading-snug line-clamp-2">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#111827]">
                      <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                      <span>{course.rating}</span>
                      <span className="text-[#6B7280] font-normal">
                        · ({course.reviews})
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-full min-h-[40px] px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      isEnrolled
                        ? 'bg-[#D1FAE5] border-[#10B981] text-[#065F46]'
                        : 'bg-[#111827] border-[#111827] text-white'
                    }`}
                  >
                    {isEnrolled ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Teruskan Belajar</span>
                      </>
                    ) : (
                      <span>Daftar 1-Sentuhan</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-bold text-[#111827]">Semua Program Tersedia</h2>
        <div className="space-y-2">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledIds.includes(course.id);
            return (
              <button
                key={`list-${course.id}`}
                type="button"
                onClick={() => (isEnrolled ? onOpenCourse(course.id) : onEnrollCourse(course.id))}
                className="w-full p-3 rounded-xl border border-[#E5E7EB] bg-white flex items-center justify-between gap-3 text-left active:translate-y-[2px] transition-transform duration-75"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl border flex items-center justify-center text-xs font-extrabold shrink-0"
                    style={{
                      backgroundColor: course.accentBg,
                      borderColor: course.accentBorder,
                      color: course.accentText,
                    }}
                  >
                    {course.badgeCode.split(' ')[1] || course.badgeCode}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#111827] truncate">
                      {course.title}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {course.institution} · ★ {course.rating}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold border ${
                    isEnrolled
                      ? 'bg-[#D1FAE5] border-[#10B981] text-[#065F46]'
                      : 'bg-[#F3F4F6] border-[#E5E7EB] text-[#111827]'
                  }`}
                >
                  {isEnrolled ? 'Aktif' : 'Daftar'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

