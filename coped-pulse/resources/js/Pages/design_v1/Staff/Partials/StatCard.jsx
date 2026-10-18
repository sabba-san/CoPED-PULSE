export default function StatCard({ value, label, sub = null, tone = 'bg-[#F3F4F6] text-[#111827]' }) {
    return (
        <div className="bg-white rounded-lg border-2 border-[#E5E7EB] p-6 space-y-3">
            <div className={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-extrabold border-2 border-[#E5E7EB] ${tone}`}>
                {value}
            </div>
            <div>
                <p className="text-3xl font-display font-extrabold text-[#111827]">{value}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">{label}</p>
                {sub && <p className="mt-1 text-xs text-gray-600">{sub}</p>}
            </div>
        </div>
    );
}

export function ProgressBar({ pct, done = false }) {
    const clamped = Math.min(100, Math.max(0, Math.round(Number(pct ?? 0))));
    return (
        <div>
            <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-gray-500">Progress</span>
                <span className={done ? 'text-[#10B981]' : 'text-[#111827]'}>{clamped}%</span>
            </div>
            <div
                className="h-2.5 bg-[#F3F4F6] border border-[#E5E7EB] rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={clamped}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    className={`h-full rounded-full transition-all duration-300 ${
                        done ? 'bg-[#10B981]' : 'bg-[#111827]'
                    }`}
                    style={{ width: `${clamped}%` }}
                />
            </div>
        </div>
    );
}
