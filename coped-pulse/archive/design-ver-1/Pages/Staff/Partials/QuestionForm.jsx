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
        <form onSubmit={(e) => submit(e, true)} className="pt-6 border-t border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Question</label>
                <textarea
                    rows={2}
                    value={data.question}
                    onChange={(e) => setData('question', e.target.value)}
                    required
                    placeholder="Enter question..."
                    className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl sm:text-sm resize-none focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
                {errors.question && <p className="mt-2 text-red-500 text-sm font-medium">{errors.question}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['a', 'b', 'c', 'd'].map((key) => (
                    <div key={key}>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Option {key.toUpperCase()}
                            {data.correct_option === key && <span className="ml-1 text-emerald-600">✓</span>}
                        </label>
                        <input
                            type="text"
                            value={data[`option_${key}`]}
                            onChange={(e) => setData(`option_${key}`, e.target.value)}
                            required
                            placeholder={`Option ${key.toUpperCase()}`}
                            className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl sm:text-sm focus:bg-white focus:border-emerald-500 focus:outline-none"
                        />
                        {errors[`option_${key}`] && <p className="mt-2 text-red-500 text-sm font-medium">{errors[`option_${key}`]}</p>}
                    </div>
                ))}
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Correct Answer</label>
                <select
                    value={data.correct_option}
                    onChange={(e) => setData('correct_option', e.target.value)}
                    className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl sm:text-sm"
                >
                    <option value="a">A</option>
                    <option value="b">B</option>
                    <option value="c">C</option>
                    <option value="d">D</option>
                </select>
                {errors.correct_option && <p className="mt-2 text-red-500 text-sm font-medium">{errors.correct_option}</p>}
            </div>
            <div className="flex justify-end gap-2">
                {allowAddAnother && (
                    <button
                        type="button"
                        disabled={processing}
                        onClick={(e) => submit(e, false)}
                        className="px-4 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors disabled:opacity-50"
                    >
                        {processing ? 'Saving...' : '+ Save & Add Another'}
                    </button>
                )}
                <button
                    type="submit"
                    disabled={processing}
                    className="px-6 py-2.5 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-xl shadow-md disabled:opacity-50"
                >
                    {processing ? 'Saving...' : allowAddAnother ? 'Save & Done' : 'Add Question'}
                </button>
            </div>
        </form>
    );
}
