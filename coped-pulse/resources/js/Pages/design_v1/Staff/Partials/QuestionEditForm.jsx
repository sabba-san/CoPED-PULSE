import { useState } from 'react';

export default function QuestionEditForm({ initial, saving, errors, onCancel, onSave }) {
    const [form, setForm] = useState({
        question: initial.question || '',
        option_a: initial.option_a || '',
        option_b: initial.option_b || '',
        option_c: initial.option_c || '',
        option_d: initial.option_d || '',
        correct_option: initial.correct_option || 'b',
    });

    const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    return (
        <div className="bg-white p-5 rounded-lg border-2 border-[#111827] space-y-4">
            <div>
                <label htmlFor="edit-question-text" className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                    Question
                </label>
                <textarea
                    id="edit-question-text"
                    rows={2}
                    value={form.question}
                    onChange={(e) => set('question', e.target.value)}
                    className="block w-full p-2.5 bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-md text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827] resize-none"
                />
                {errors.question && <p className="mt-1 text-red-600 text-xs font-bold">{errors.question}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['a', 'b', 'c', 'd'].map((key) => (
                    <div key={key}>
                        <label htmlFor={`edit-option-${key}`} className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                            Option {key.toUpperCase()}
                        </label>
                        <input
                            id={`edit-option-${key}`}
                            type="text"
                            value={form[`option_${key}`]}
                            onChange={(e) => set(`option_${key}`, e.target.value)}
                            className="block w-full p-2 bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-md text-sm text-[#111827] focus:bg-white focus:outline-none focus:border-[#111827]"
                        />
                        {errors[`option_${key}`] && <p className="mt-1 text-red-600 text-xs font-bold">{errors[`option_${key}`]}</p>}
                    </div>
                ))}
            </div>

            <div>
                <label htmlFor="edit-correct-option" className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                    Correct Option
                </label>
                <select
                    id="edit-correct-option"
                    value={form.correct_option}
                    onChange={(e) => set('correct_option', e.target.value)}
                    className="block w-full p-2 bg-white border-2 border-[#E5E7EB] rounded-md text-sm text-[#111827] font-bold focus:outline-none focus:border-[#111827] cursor-pointer"
                >
                    <option value="a">A</option>
                    <option value="b">B</option>
                    <option value="c">C</option>
                    <option value="d">D</option>
                </select>
                {errors.correct_option && <p className="mt-1 text-red-600 text-xs font-bold">{errors.correct_option}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t-2 border-[#E5E7EB]">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border-2 border-[#E5E7EB] hover:border-[#111827] rounded-md transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={() => onSave(form)}
                    disabled={saving}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#111827] hover:bg-gray-800 rounded-md transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}
