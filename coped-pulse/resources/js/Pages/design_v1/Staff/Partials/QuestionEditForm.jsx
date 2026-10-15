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
        <div className="bg-white p-4 rounded-xl border border-amber-300 space-y-3">
            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Question</label>
                <textarea
                    rows={2}
                    value={form.question}
                    onChange={(e) => set('question', e.target.value)}
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                />
                {errors.question && <p className="mt-1 text-red-500 text-xs font-medium">{errors.question}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {['a', 'b', 'c', 'd'].map((key) => (
                    <div key={key}>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Option {key.toUpperCase()}</label>
                        <input
                            type="text"
                            value={form[`option_${key}`]}
                            onChange={(e) => set(`option_${key}`, e.target.value)}
                            className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                        />
                        {errors[`option_${key}`] && <p className="mt-1 text-red-500 text-xs font-medium">{errors[`option_${key}`]}</p>}
                    </div>
                ))}
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Correct Answer</label>
                <select
                    value={form.correct_option}
                    onChange={(e) => set('correct_option', e.target.value)}
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                >
                    <option value="a">A</option>
                    <option value="b">B</option>
                    <option value="c">C</option>
                    <option value="d">D</option>
                </select>
                {errors.correct_option && <p className="mt-1 text-red-500 text-xs font-medium">{errors.correct_option}</p>}
            </div>
            <div className="flex justify-end space-x-2 pt-1">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="px-4 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={() => onSave(form)}
                    disabled={saving}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}
