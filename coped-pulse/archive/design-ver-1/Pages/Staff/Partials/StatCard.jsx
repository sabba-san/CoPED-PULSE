export default function StatCard({ value, label, sub = null, tone = 'bg-emerald-50 text-emerald-600' }) {
    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-black ${tone}`}>
                {value}
            </div>
            <p className="mt-4 text-3xl font-black text-gray-900">{value}</p>
            <p className="text-sm font-bold text-gray-500">{label}</p>
            {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
    );
}

export function ProgressBar({ pct, done = false }) {
    const clamped = Math.min(100, Math.max(0, Math.round(Number(pct ?? 0))));
    return (
        <div>
            <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-gray-500">Progress</span>
                <span className={done ? 'text-green-700' : 'text-emerald-700'}>{clamped}%</span>
            </div>
            <div
                className="h-2 bg-gray-100 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={clamped}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    className={`h-full rounded-full transition-all ${
                        done
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600'
                    }`}
                    style={{ width: `${clamped}%` }}
                />
            </div>
        </div>
    );
}
