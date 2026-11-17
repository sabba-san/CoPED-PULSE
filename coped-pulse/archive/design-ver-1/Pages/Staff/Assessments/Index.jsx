import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import StaffLayout from '@/Layouts/design_v1/StaffLayout';
import QuestionCard from '../Partials/QuestionCard';
import QuestionEditForm from '../Partials/QuestionEditForm';
import QuestionForm from '../Partials/QuestionForm';

export default function Index({ course, assessments = [] }) {
    const { flash } = usePage().props;
    const [editingId, setEditingId] = useState(null);
    const [editErrors, setEditErrors] = useState({});
    const [editSaving, setEditSaving] = useState(false);

    const deleteQuiz = (assessment) => {
        if (confirm('Delete this question?')) {
            router.delete(route('staff.courses.assessments.destroy', [course.id, assessment.id]), {
                preserveScroll: true,
            });
        }
    };

    const startEdit = (q) => {
        setEditingId(q.id);
        setEditErrors({});
    };

    const saveEdit = (q, data) => {
        setEditSaving(true);
        setEditErrors({});
        router.put(route('staff.courses.assessments.update', [course.id, q.id]), {
            module_id: null,
            ...data,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => setEditingId(null),
            onError: (errs) => setEditErrors(errs),
            onFinish: () => setEditSaving(false),
        });
    };

    return (
        <StaffLayout>
            <Head title={`Final Quiz: ${course.title}`} />

            <div className="max-w-4xl mx-auto space-y-8">
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-6 py-4 text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                <div>
                    <Link
                        href={route('staff.courses.edit', course.id)}
                        className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Course
                    </Link>
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{course.title}</p>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 to-teal-700 tracking-tight">
                        Final Course Quiz
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {assessments.length} {assessments.length === 1 ? 'question' : 'questions'} — learners need 100% to pass.
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-3xl p-8 border border-gray-100">
                    <div className="space-y-4 mb-10">
                        {assessments.length > 0 ? (
                            assessments.map((q, index) => (
                                editingId === q.id ? (
                                    <QuestionEditForm
                                        key={q.id}
                                        initial={q}
                                        saving={editSaving}
                                        errors={editErrors}
                                        onCancel={() => setEditingId(null)}
                                        onSave={(data) => saveEdit(q, data)}
                                    />
                                ) : (
                                    <QuestionCard
                                        key={q.id}
                                        q={q}
                                        index={index}
                                        onEdit={() => startEdit(q)}
                                        onDelete={() => deleteQuiz(q)}
                                    />
                                )
                            ))
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                                <p className="text-gray-500 font-medium">No final quiz questions yet. Add the first one below.</p>
                            </div>
                        )}
                    </div>

                    <QuestionForm course={course} moduleId={null} title="Add Final Quiz Question" />
                </div>
            </div>
        </StaffLayout>
    );
}
