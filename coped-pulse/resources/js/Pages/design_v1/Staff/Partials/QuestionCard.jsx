export default function QuestionCard({ q, index, onEdit, onDelete }) {
    return (
        <div className="bg-[#F9FAFB] p-5 rounded-lg border-2 border-[#E5E7EB] space-y-3">
            <div className="flex justify-between items-start gap-3">
                <div className="flex items-start gap-2">
                    <span className="text-xs font-black bg-[#E5E7EB] text-[#111827] px-2 py-0.5 rounded">
                        Q{index + 1}
                    </span>
                    <p className="text-sm font-bold text-[#111827] leading-snug">{q.question}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-xs font-bold">
                    <button
                        type="button"
                        onClick={onEdit}
                        className="text-[#3B82F6] hover:underline"
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        className="text-red-600 hover:underline"
                    >
                        Delete
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {['a', 'b', 'c', 'd'].map((key) => {
                    const isCorrect = q.correct_option === key;
                    return (
                        <div
                            key={key}
                            className={`px-3 py-2 rounded-md text-xs font-semibold border-2 flex items-center justify-between ${
                                isCorrect
                                    ? 'bg-emerald-50 border-[#10B981] text-[#059669]'
                                    : 'bg-white border-[#E5E7EB] text-gray-700'
                            }`}
                        >
                            <span>
                                <span className="uppercase font-bold mr-1.5">{key}.</span> {q[`option_${key}`]}
                            </span>
                            {isCorrect && (
                                <span className="font-extrabold text-[10px] uppercase bg-[#10B981] text-white px-1.5 py-0.5 rounded ml-2 shrink-0">
                                    Correct
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
