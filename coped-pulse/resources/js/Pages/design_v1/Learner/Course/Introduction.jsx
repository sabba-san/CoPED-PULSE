import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import LearnerLayout from '@/Layouts/design_v1/LearnerLayout';
import CourseLogoBadge from '@/Components/flat/CourseLogoBadge';
import {
    ArrowRightIcon,
    BookOpenIcon,
    CircleCheckIcon,
    GraduationCapIcon,
    XMarkIcon,
} from '@/Components/flat/icons';

export default function Introduction({ course, isEnrolled }) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const price = Number(course.price || 0);
    const isCommercial = course.billing_type !== 'free' && price > 0;

    const enroll = () => {
        router.post(route('learner.catalog.enroll', course.id), {
            redirect_to_learn: true,
        });
    };

    const handleEnroll = () => {
        if (isCommercial) {
            setShowConfirmation(true);
            return;
        }

        enroll();
    };

    return (
        <LearnerLayout>
            <Head title={`${course.title} · Course Introduction`} />

            <div className="max-w-5xl mx-auto space-y-5">
                <Link
                    href={route('learner.catalog')}
                    aria-label="Back to Browse Catalog"
                    className="group inline-flex min-h-10 items-center gap-2 rounded-md border border-[#D1D5DB] bg-white px-3.5 text-sm font-bold text-[#111827] transition-colors hover:border-[#111827] hover:bg-[#F9FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2"
                >
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-[#F3F4F6] transition-colors group-hover:bg-white">
                        <ArrowRightIcon className="h-4 w-4 rotate-180" />
                    </span>
                    <span>Browse Catalog</span>
                </Link>

                <article className="bg-white border-2 border-[#E5E7EB] rounded-lg overflow-hidden">
                    <CourseLogoBadge
                        category={course.category_logo}
                        size="tile"
                        subtitle={`${course.modules_count ?? 0} modules`}
                        className="!w-full !border-b-2 !border-r-0 !py-8"
                    />

                    <div className="p-6 sm:p-8 space-y-7">
                        <header>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="inline-flex items-center px-2.5 py-1 bg-[#F3F4F6] text-[#374151] rounded text-xs font-bold">
                                    {course.academic_year || 'Course'}
                                </span>
                                {isEnrolled && (
                                    <span className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-bold">
                                        Enrolled
                                    </span>
                                )}
                            </div>
                            <h1 className="font-display text-2xl sm:text-3xl font-black text-[#111827]">
                                {course.title}
                            </h1>
                            <p className="text-sm text-gray-600 mt-2">
                                Instructor: {course.instructor?.name || 'Faculty Instructor'}
                            </p>
                        </header>

                        <section aria-labelledby="course-about-heading">
                            <h2 id="course-about-heading" className="text-lg font-extrabold text-[#111827] mb-2">
                                About this course
                            </h2>
                            <p className="text-sm leading-7 text-gray-600 whitespace-pre-line">
                                {course.description || 'Course information will be available soon.'}
                            </p>
                        </section>

                        <section aria-labelledby="course-learning-heading">
                            <h2 id="course-learning-heading" className="text-lg font-extrabold text-[#111827] mb-3">
                                What you&apos;ll learn
                            </h2>
                            {course.modules?.length ? (
                                <ul className="space-y-3">
                                    {course.modules.map((module) => (
                                        <li
                                            key={module.id}
                                            className="flex items-start gap-3 p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md"
                                        >
                                            <CircleCheckIcon className="w-5 h-5 mt-0.5 text-[#10B981] shrink-0" />
                                            <div>
                                                <h3 className="text-sm font-bold text-[#111827]">{module.title}</h3>
                                                {module.description && (
                                                    <p className="text-sm leading-6 text-gray-600 mt-1 whitespace-pre-line">
                                                        {module.description}
                                                    </p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm leading-6 text-gray-600">
                                    Learning topics will be available soon.
                                </p>
                            )}
                        </section>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md">
                                <BookOpenIcon className="w-5 h-5 text-[#3B82F6] shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-gray-500">Course content</p>
                                    <p className="text-sm font-bold text-[#111827]">
                                        {course.modules_count ?? 0} modules
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md">
                                <GraduationCapIcon className="w-5 h-5 text-[#10B981] shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-gray-500">
                                        {course.cert_title ? 'Certification' : 'Course format'}
                                    </p>
                                    <p className="text-sm font-bold text-[#111827]">
                                        {course.cert_title || 'Self-paced learning'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="border-t-2 border-[#E5E7EB] bg-[#F9FAFB] p-6 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                Course fee
                            </p>
                            <p className="text-lg font-black text-[#111827]">
                                {isCommercial ? `RM ${price.toFixed(2)}` : 'Free'}
                            </p>
                        </div>
                        {isEnrolled ? (
                            <Link
                                href={route('learner.course.learn', course.id)}
                                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-sm rounded transition-colors"
                            >
                                Continue Learning
                                <ArrowRightIcon className="w-4 h-4" />
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={handleEnroll}
                                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 bg-[#111827] hover:bg-gray-800 text-white font-bold text-sm rounded transition-colors"
                            >
                                Enroll in Course
                                <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        )}
                    </footer>
                </article>
            </div>

            {showConfirmation && isCommercial && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="enrollment-confirmation-title"
                        className="bg-white border-2 border-[#111827] rounded-lg max-w-lg w-full p-6 sm:p-8 space-y-6"
                    >
                        <div className="flex items-start justify-between border-b-2 border-[#E5E7EB] pb-4">
                            <div>
                                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#10B981]">
                                    Enrollment Confirmation
                                </span>
                                <h2
                                    id="enrollment-confirmation-title"
                                    className="text-xl font-black text-[#111827] font-display mt-0.5"
                                >
                                    {course.title}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowConfirmation(false)}
                                aria-label="Close confirmation"
                                className="text-gray-400 hover:text-[#111827] p-1"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="border-2 border-[#E5E7EB] rounded-md divide-y-2 divide-[#E5E7EB] text-sm">
                            <div className="p-3.5 flex items-center justify-between gap-4">
                                <span className="font-semibold text-gray-600">Plan</span>
                                <span className="font-extrabold text-[#111827] text-right">
                                    {course.billing_type === 'subscription' ? 'Subscription' : 'One-time purchase'}
                                </span>
                            </div>
                            <div className="p-3.5 flex items-center justify-between bg-amber-50/50">
                                <span className="font-semibold text-gray-700">Course fee</span>
                                <span className="font-black text-[#111827]">RM {price.toFixed(2)}</span>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500">
                            Confirm to enroll in this course and continue to its learning page.
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowConfirmation(false)}
                                className="px-5 py-2.5 text-xs font-bold text-[#111827] bg-[#F3F4F6] hover:bg-gray-200 rounded transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={enroll}
                                className="px-6 py-2.5 text-xs font-bold text-white bg-[#10B981] hover:bg-emerald-600 rounded transition-colors"
                            >
                                Confirm Enrollment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </LearnerLayout>
    );
}
