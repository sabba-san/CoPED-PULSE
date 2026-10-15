export default function QuestionCard({ q, index, onEdit, onDelete }) {
    return (
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
            <div className="flex justify-between items-start gap-2">
                <p className="text-sm font-bold text-gray-800">Q{index + 1}. {q.question}</p>
                <div className="flex items-center gap-2 shrink-0">
                    <button onClick={onEdit} className="text-amber-600 hover:text-amber-700 text-xs font-bold">Edit</button>
                    <button onClick={onDelete} className="text-red-400 hover:text-red-600 text-xs font-bold">Delete</button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {['a', 'b', 'c', 'd'].map((key) => (
                    <div
                        key={key}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                            q.correct_option === key
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                                : 'bg-white border-gray-200 text-gray-600'
                        }`}
                    >
                        <span className="uppercase mr-1">{key}.</span> {q[`option_${key}`]}{' '}
                        {q.correct_option === key && '✓ Correct'}
                    </div>
                ))}
            </div>
        </div>
    );
}
