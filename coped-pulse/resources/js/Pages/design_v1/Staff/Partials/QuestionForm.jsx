import { useForm } from '@inertiajs/react';

export default function QuestionForm({ course, moduleId = null, allowAddAnother = false, onDone = null, onSaved = null, title = 'Add Question' }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        module_id: moduleId,
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'b',
    });

    const submit = (e, closeAfter = true) => {
        e?.preventDefault();
        // Ensure scoped module_id is sent: null = final exam, id = mini-quiz
        setData('module_id', moduleId);
        post(route('staff.courses.assessments.store', course.id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                reset();
                setData('module_id', moduleId);
                onSaved?.('Mini-quiz question saved.');
                if (closeAfter && onDone) onDone();
            },
        });
    };

    return (
        <form onSubmit={(e) => submit(e, true)} className="pt-6 border-t-2 border-[#E5E7EB] space-y-4">
            <h3 className="font-display font-bold text-base text-[#111827]">{title}</h3>
            <div>
                <label htmlFor="question-text" className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                    Question Text
                </label>
                <textarea
                    id="question-text"
                    rows={2}
                    value={data.question}
                    onChange={(e) => setData('question', e.target.value)}
                    required
                    placeholder="Enter question text..."
                    className="block w-full p-3 bg-white border-2 border-[#E5E7EB] rounded-md text-sm text-[#111827] placeholder:text-gray-400 focus:outline-none focus:border-[#111827] resize-none"
                />
                {errors.question && <p className="mt-1 text-red-600 text-xs font-bold">{errors.question}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['a', 'b', 'c', 'd'].map((key) => (
                    <div key={key}>
                        <label htmlFor={`option-${key}`} className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                            Option {key.toUpperCase()}
                            {data.correct_option === key && <span className="ml-1 text-[#10B981] font-black">✓ Correct</span>}
                        </label>
                        <input
                            id={`option-${key}`}
                            type="text"
                            value={data[`option_${key}`]}
                            onChange={(e) => setData(`option_${key}`, e.target.value)}
                            required
                            placeholder={`Option ${key.toUpperCase()}`}
                            className="block w-full p-2.5 bg-white border-2 border-[#E5E7EB] rounded-md text-sm text-[#111827] placeholder:text-gray-400 focus:outline-none focus:border-[#111827]"
                        />
                        {errors[`option_${key}`] && <p className="mt-1 text-red-600 text-xs font-bold">{errors[`option_${key}`]}</p>}
                    </div>
                ))}
            </div>

            <div>
                <label htmlFor="correct-option-select" className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                    Correct Option
                </label>
                <select
                    id="correct-option-select"
                    value={data.correct_option}
                    onChange={(e) => setData('correct_option', e.target.value)}
                    className="block w-full p-2.5 bg-white border-2 border-[#E5E7EB] rounded-md text-sm text-[#111827] font-bold focus:outline-none focus:border-[#111827] cursor-pointer"
                >
                    <option value="a">Option A</option>
                    <option value="b">Option B</option>
                    <option value="c">Option C</option>
                    <option value="d">Option D</option>
                </select>
                {errors.correct_option && <p className="mt-1 text-red-600 text-xs font-bold">{errors.correct_option}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-2">
                {allowAddAnother && (
                    <button
                        type="button"
                        disabled={processing}
                        onClick={(e) => submit(e, false)}
                        className="px-4 py-2.5 text-xs font-bold text-[#111827] bg-[#F3F4F6] hover:bg-gray-200 border-2 border-[#E5E7EB] rounded-md transition-colors disabled:opacity-50"
                    >
                        {processing ? 'Saving...' : '+ Save & Add Another'}
                    </button>
                )}
                <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-[#111827] hover:bg-gray-800 rounded-md transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                    {processing ? 'Saving...' : allowAddAnother ? 'Save & Done' : 'Add Question'}
                </button>
            </div>
        </form>
    );
}
