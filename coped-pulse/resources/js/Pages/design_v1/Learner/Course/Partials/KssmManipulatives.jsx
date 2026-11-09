import { useMemo, useState, useRef } from 'react';

// KSSM (secondary) manipulatives for MathPlayground. Each problem has a `kind`; the
// kind decides its state shape (kssmInit), its answer check (isKssmCorrect) and its UI.

const LINEAR = 'Linear';
const NOT_LINEAR = 'Bukan linear';
const QUAD = 'Kuadratik';
const NOT_QUAD = 'Bukan kuadratik';
const BIT_VALUES = [16, 8, 4, 2, 1];
const BIT_LABELS = ['16 (2⁴)', '8 (2³)', '4 (2²)', '2 (2¹)', '1 (2⁰)'];
const SUPERSCRIPT_DIGITS = '₀₁₂₃₄₅₆₇₈₉';

export const KSSM_PROBLEMS = {
    'linear-balance': [
        { id: 'lb-1', kind: 'balance', a: 2, b: 5, r: 13, prompt: 'Selesaikan 2x + 5 = 13 dengan timbangan.', hint: 'Tolak 5 pada kedua-dua belah dahulu, kemudian bahagi 2 pada kedua-dua belah.' },
        { id: 'lb-2', kind: 'balance', a: 3, b: -2, r: 13, prompt: 'Selesaikan 3x - 2 = 13 dengan timbangan.', hint: 'Tambah 2 pada kedua-dua belah dahulu, kemudian bahagi 3.' },
        { id: 'lb-3', kind: 'balance', a: 4, b: 6, r: 22, prompt: 'Selesaikan 4x + 6 = 22 dengan timbangan.', hint: 'Tolak 6 pada kedua-dua belah dahulu, kemudian bahagi 4.' },
        { id: 'lb-4', kind: 'sequence', prompt: 'Susun langkah menyelesaikan 3x - 4 = 11.', steps: ['3x - 4 = 11', '3x = 11 + 4', '3x = 15', 'x = 15 ÷ 3', 'x = 5'], shuffle: [2, 0, 4, 3, 1], hint: 'Mulakan dengan persamaan asal, pindahkan -4, kemudian bahagi 3.' },
        { id: 'lb-5', kind: 'sequence', prompt: 'Susun langkah menyelesaikan 2(x + 3) = 14.', steps: ['2(x + 3) = 14', 'x + 3 = 14 ÷ 2', 'x + 3 = 7', 'x = 7 - 3', 'x = 4'], shuffle: [3, 1, 4, 0, 2], hint: 'Bahagi 2 pada kedua-dua belah dahulu, kemudian tolak 3.' },
    ],
    'algebra-match': [
        { id: 'am-1', kind: 'choices', prompt: 'Kelaskan setiap persamaan.', options: [LINEAR, NOT_LINEAR], items: [{ label: 'x + 5 = 12', answer: LINEAR }, { label: 'x² + 2 = 6', answer: NOT_LINEAR }, { label: '4y - 1 = 7', answer: LINEAR }, { label: 'p + q = 9', answer: NOT_LINEAR }], hint: 'Persamaan linear satu pemboleh ubah: hanya satu huruf dan kuasa tertinggi 1.' },
        { id: 'am-2', kind: 'choices', prompt: 'Kelaskan setiap persamaan.', options: [LINEAR, NOT_LINEAR], items: [{ label: '2m = 10', answer: LINEAR }, { label: 'y³ = 8', answer: NOT_LINEAR }, { label: '5a + 2 = 17', answer: LINEAR }, { label: '2x + y = 4', answer: NOT_LINEAR }], hint: 'y³ berkuasa 3, 2x + y = 4 ada dua pemboleh ubah.' },
        { id: 'am-3', kind: 'choices', prompt: 'Kelaskan setiap persamaan.', options: [LINEAR, NOT_LINEAR], items: [{ label: 'k - 9 = 1', answer: LINEAR }, { label: 'x² - 4 = 0', answer: NOT_LINEAR }, { label: '3(n + 1) = 12', answer: LINEAR }, { label: 'a + b = 5', answer: NOT_LINEAR }], hint: 'Kembangkan 3(n + 1) = 3n + 3: masih linear.' },
        { id: 'am-4', kind: 'choices', prompt: 'Padankan pernyataan dengan persamaan.', items: [{ label: 'Nombor p ditolak 8 menghasilkan 12', options: ['p - 8 = 12', '8 - p = 12', 'p + 8 = 12'], answer: 'p - 8 = 12' }, { label: 'Dua kali nombor x ditambah 5 ialah 13', options: ['2 + x + 5 = 13', '2x + 5 = 13', '2(x + 5) = 13'], answer: '2x + 5 = 13' }, { label: 'Nombor y dibahagi 2 menghasilkan 7', options: ['2y = 7', 'y + 2 = 7', 'y / 2 = 7'], answer: 'y / 2 = 7' }], hint: '"Dua kali" bermaksud darab 2; "dibahagi" bermaksud ÷.' },
        { id: 'am-5', kind: 'choices', prompt: 'Padankan pernyataan dengan persamaan.', items: [{ label: 'Tiga kali nombor n ialah 18', options: ['n + 3 = 18', '3n = 18', 'n - 3 = 18'], answer: '3n = 18' }, { label: 'Umur Ali a tambah 4 ialah 15', options: ['a + 4 = 15', '4a = 15', 'a - 4 = 15'], answer: 'a + 4 = 15' }, { label: 'Hasil tambah x dan 9 ialah 20', options: ['x - 9 = 20', '9x = 20', 'x + 9 = 20'], answer: 'x + 9 = 20' }], hint: '"Hasil tambah" bermaksud +.' },
    ],
    'quadratic-explorer': [
        { id: 'qe-1', kind: 'graph', target: { a: -1, c: 4 }, prompt: 'Bina graf maksimum (masam): a = -1 dan pintasan-y c = 4.', hint: 'a negatif memberi graf masam. Pintasan-y ialah nilai c.' },
        { id: 'qe-2', kind: 'graph', target: { a: 1, c: -3 }, prompt: 'Bina graf minimum (senyum): a = 1 dan pintasan-y c = -3.', hint: 'a positif memberi graf senyum. Tetapkan c = -3.' },
        { id: 'qe-3', kind: 'graph', target: { a: 1, b: -4 }, prompt: 'Dengan a = 1, laraskan b supaya paksi simetri ialah x = 2.', hint: 'Paksi simetri x = -b / 2a. Untuk x = 2 dan a = 1, b = -4.' },
        { id: 'qe-4', kind: 'graph', target: { a: 1, b: -5, c: 6 }, prompt: 'Laraskan (x - 2)(x - 3) = 0: graf memotong paksi-x pada x = 2 dan x = 3.', hint: '(x - 2)(x - 3) = x² - 5x + 6, jadi a = 1, b = -5, c = 6.' },
        { id: 'qe-5', kind: 'graph', target: { a: 1, b: 2, c: -15 }, prompt: 'Laraskan graf supaya punca ialah x = -5 dan x = 3.', hint: '(x + 5)(x - 3) = x² + 2x - 15, jadi a = 1, b = 2, c = -15.' },
    ],
    'number-base-factor': [
        { id: 'nb-1', kind: 'choices', prompt: 'Kelaskan setiap ungkapan.', options: [QUAD, NOT_QUAD], items: [{ label: '3x² - 5x + 2', answer: QUAD }, { label: 'x³ + 1', answer: NOT_QUAD }, { label: '2x + 7', answer: NOT_QUAD }, { label: 'y² - 9', answer: QUAD }], hint: 'Ungkapan kuadratik: kuasa tertinggi pemboleh ubah ialah 2.' },
        { id: 'nb-2', kind: 'sequence', prompt: 'Susun langkah pemfaktoran x² - 5x + 6 = 0.', steps: ['x² - 5x + 6 = 0', '(x - 2)(x - 3) = 0', 'x - 2 = 0 atau x - 3 = 0', 'x = 2 atau x = 3'], shuffle: [2, 0, 3, 1], hint: 'Cari dua nombor darab 6 dan tambah -5: -2 dan -3.' },
        { id: 'nb-3', kind: 'sequence', prompt: 'Susun langkah pemfaktoran x² + 2x - 15 = 0.', steps: ['x² + 2x - 15 = 0', '(x + 5)(x - 3) = 0', 'x + 5 = 0 atau x - 3 = 0', 'x = -5 atau x = 3'], shuffle: [3, 1, 0, 2], hint: 'Cari dua nombor darab -15 dan tambah 2: 5 dan -3.' },
        { id: 'nb-4', kind: 'bits', target: 13, prompt: 'Tukarkan 13₁₀ kepada asas dua.', hint: '13 = 8 + 4 + 1, jadi 01101₂.' },
        { id: 'nb-5', kind: 'bits', target: 21, prompt: 'Tukarkan 21₁₀ kepada asas dua.', hint: '21 = 16 + 4 + 1, jadi 10101₂.' },
    ],
};

const ROOTS_2 = 'Dua punca berbeza';
const ROOTS_1 = 'Dua punca sama';
const ROOTS_0 = 'Tiada punca nyata';

KSSM_PROBLEMS['addmath-functions'] = [
    { id: 'af-1', kind: 'sequence', prompt: 'Susun langkah mencari fg(x) bagi f(x) = 2x - 3 dan g(x) = x + 4.', steps: ['fg(x) = f(g(x))', 'fg(x) = f(x + 4)', 'fg(x) = 2(x + 4) - 3', 'fg(x) = 2x + 5'], shuffle: [2, 0, 3, 1], hint: 'Gantikan g(x) ke dalam f(x).' },
    { id: 'af-2', kind: 'sequence', prompt: 'Susun langkah mencari f⁻¹(x) bagi f(x) = 2x - 3.', steps: ['y = 2x - 3', 'y + 3 = 2x', 'x = (y + 3) / 2', 'f⁻¹(x) = (x + 3) / 2'], shuffle: [3, 1, 0, 2], hint: 'Tulis y = f(x), asingkan x, kemudian tukar y kepada x.' },
    { id: 'af-3', kind: 'choices', prompt: 'Gunakan b² - 4ac untuk menentukan jenis punca.', options: [ROOTS_2, ROOTS_1, ROOTS_0], items: [{ label: 'x² - 4x + 4 = 0', answer: ROOTS_1 }, { label: 'x² - 5x + 6 = 0', answer: ROOTS_2 }, { label: 'x² + 2x + 5 = 0', answer: ROOTS_0 }, { label: '2x² - 3x - 2 = 0', answer: ROOTS_2 }], hint: 'b² - 4ac > 0: dua punca berbeza; = 0: dua punca sama; < 0: tiada punca nyata.' },
    { id: 'af-4', kind: 'sequence', prompt: 'Susun langkah menyempurnakan kuasa dua bagi x² + 6x + 5.', steps: ['x² + 6x + 5', 'x² + 6x + 3² - 3² + 5', '(x + 3)² - 9 + 5', '(x + 3)² - 4'], shuffle: [1, 3, 0, 2], hint: 'Tambah dan tolak (setengah pekali x)² = 3².' },
    { id: 'af-5', kind: 'choices', prompt: 'Padankan hukum indeks dan logaritma.', items: [{ label: 'aᵐ × aⁿ', options: ['aᵐ⁺ⁿ', 'aᵐⁿ', 'aᵐ⁻ⁿ'], answer: 'aᵐ⁺ⁿ' }, { label: 'log_a (xy)', options: ['log_a x + log_a y', 'log_a x × log_a y', 'log_a x - log_a y'], answer: 'log_a x + log_a y' }, { label: 'log_a (x / y)', options: ['log_a x + log_a y', 'log_a x - log_a y', 'log_a x ÷ log_a y'], answer: 'log_a x - log_a y' }], hint: 'Indeks: tambah kuasa apabila mendarab. Logaritma: darab menjadi tambah, bahagi menjadi tolak.' },
];

KSSM_PROBLEMS['addmath-prog-log'] = [
    { id: 'ap-1', kind: 'choices', prompt: 'Janjang aritmetik: Tₙ = a + (n - 1)d.', items: [{ label: 'T₅ bagi 3, 7, 11, ...', options: ['15', '19', '23'], answer: '19' }, { label: 'Beza sepunya d bagi 5, 9, 13, ...', options: ['3', '4', '5'], answer: '4' }, { label: 'S₃ bagi 2, 4, 6, ...', options: ['10', '12', '14'], answer: '12' }], hint: 'T₅ = 3 + 4(4) = 19. d = 9 - 5 = 4. S₃ = 2 + 4 + 6 = 12.' },
    { id: 'ap-2', kind: 'choices', prompt: 'Janjang geometri: Tₙ = arⁿ⁻¹.', items: [{ label: 'Nisbah sepunya r bagi 2, 6, 18, ...', options: ['2', '3', '4'], answer: '3' }, { label: 'T₄ bagi 2, 6, 18, ...', options: ['36', '54', '162'], answer: '54' }, { label: 'T₅ bagi 1, 2, 4, 8, ...', options: ['10', '16', '32'], answer: '16' }], hint: 'r = 6 / 2 = 3. T₄ = 2 × 3³ = 54. T₅ = 1 × 2⁴ = 16.' },
    { id: 'ap-3', kind: 'sequence', prompt: 'Susun langkah mencari T₁₀ bagi janjang 4, 7, 10, ...', steps: ['a = 4, d = 3', 'Tₙ = a + (n - 1)d', 'T₁₀ = 4 + (10 - 1)(3)', 'T₁₀ = 31'], shuffle: [2, 0, 3, 1], hint: 'Cari a dan d dahulu, kemudian gunakan rumus.' },
    { id: 'ap-4', kind: 'sequence', prompt: 'Susun langkah menilai log₂ 8 + log₂ 4.', steps: ['log₂ 8 + log₂ 4', '= log₂ (8 × 4)', '= log₂ 32', '= 5'], shuffle: [3, 1, 0, 2], hint: 'Tambah logaritma bermaksud mendarab nombor di dalamnya. 2⁵ = 32.' },
    { id: 'ap-5', kind: 'choices', prompt: 'Nilaikan setiap ungkapan.', items: [{ label: '2³ × 2⁴', options: ['2⁷', '2¹²', '4⁷'], answer: '2⁷' }, { label: '(3²)³', options: ['3⁵', '3⁶', '3⁸'], answer: '3⁶' }, { label: 'log₁₀ 1000', options: ['2', '3', '10'], answer: '3' }], hint: 'Darab indeks: tambah kuasa. Kuasa bagi kuasa: darab kuasa. 10³ = 1000.' },
];

export const KSSM_MODE_IDS = Object.keys(KSSM_PROBLEMS);

export function kssmInit(problem) {
    switch (problem?.kind) {
        case 'balance':
            return { a: problem.a, b: problem.b, r: problem.r };
        case 'sequence':
            return [];
        case 'choices':
            return problem.items.map(() => null);
        case 'graph':
            return { a: 1, b: 0, c: 0 };
        case 'bits':
            return [0, 0, 0, 0, 0];
        default:
            return null;
    }
}

export function isKssmCorrect(problem, value) {
    if (!problem || value == null) return false;
    switch (problem.kind) {
        case 'balance':
            return value.a === 1 && value.b === 0;
        case 'sequence':
            return value.length === problem.steps.length && value.every((v, i) => v === i);
        case 'choices':
            return problem.items.every((item, i) => value[i] === item.answer);
        case 'graph':
            return Object.entries(problem.target).every(([k, v]) => value[k] === v);
        case 'bits':
            return bitsValue(value) === problem.target;
        default:
            return false;
    }
}

export function kssmDemo(problem) {
    switch (problem?.kind) {
        case 'balance':
            return { a: 1, b: 0, r: (problem.r - problem.b) / problem.a };
        case 'sequence':
            return problem.steps.map((_, i) => i);
        case 'choices':
            return problem.items.map((item) => item.answer);
        case 'graph':
            return { a: 1, b: 0, c: 0, ...problem.target };
        case 'bits':
            return BIT_VALUES.map((v) => (problem.target & v ? 1 : 0));
        default:
            return null;
    }
}

const bitsValue = (bits) => bits.reduce((sum, bit, i) => sum + bit * BIT_VALUES[i], 0);
const toSub = (n) => String(n).replace(/\d/g, (d) => SUPERSCRIPT_DIGITS[d]);
const num = (n) => String(+n.toFixed(2));

function linearSide(a, b) {
    const coef = a === 1 ? '' : a;
    return `${coef}x${b > 0 ? ` + ${b}` : b < 0 ? ` - ${-b}` : ''}`;
}

function quadraticText({ a, b, c }) {
    const aPart = `${a === 1 ? '' : a === -1 ? '-' : a}x²`;
    const bPart = b === 0 ? '' : ` ${b > 0 ? '+' : '-'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x`;
    const cPart = c === 0 ? '' : ` ${c > 0 ? '+' : '-'} ${Math.abs(c)}`;
    return `f(x) = ${aPart}${bPart}${cPart}`;
}

const cardBase = 'rounded-xl border px-3 py-2 text-sm font-extrabold transition-colors';
const cardOff = 'bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#F1F5F9]';
const cardOn = 'bg-[#2563EB] text-white border-[#2563EB]';
const panel = 'bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4';

function BalanceScale({ problem, value, onChange }) {
    const { a, b, r } = value;
    const stepLabel = b > 0 ? `Tolak ${b} pada kedua-dua belah` : `Tambah ${-b} pada kedua-dua belah`;
    return (
        <div className="space-y-3">
            <svg viewBox="0 0 320 130" className="w-full max-w-sm mx-auto" role="img" aria-label="Timbangan persamaan seimbang">
                <polygon points="160,36 142,118 178,118" fill="#CBD5E1" />
                <line x1="40" y1="36" x2="280" y2="36" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                <line x1="75" y1="36" x2="75" y2="72" stroke="#64748B" strokeWidth="2" />
                <line x1="245" y1="36" x2="245" y2="72" stroke="#64748B" strokeWidth="2" />
                <rect x="15" y="72" width="120" height="38" rx="10" fill="#EFF6FF" stroke="#BFDBFE" />
                <rect x="185" y="72" width="120" height="38" rx="10" fill="#ECFDF5" stroke="#A7F3D0" />
                <text x="75" y="96" textAnchor="middle" fontSize="16" fontWeight="800" fill="#1E3A8A" className="font-math">{linearSide(a, b)}</text>
                <text x="245" y="96" textAnchor="middle" fontSize="16" fontWeight="800" fill="#065F46" className="font-math">{r}</text>
            </svg>
            <p className="text-center text-xs font-extrabold text-[#047857]">⚖️ Timbangan sentiasa seimbang</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                    type="button"
                    disabled={b === 0}
                    onClick={() => onChange({ a, b: 0, r: r - b })}
                    className={`${cardBase} ${cardOff} disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                    {b === 0 ? 'Pemalar sudah diasingkan' : stepLabel}
                </button>
                <button
                    type="button"
                    disabled={b !== 0 || a === 1}
                    onClick={() => onChange({ a: 1, b, r: r / a })}
                    className={`${cardBase} ${cardOff} disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                    {a === 1 ? 'x sudah diasingkan' : `Bahagi ${a} pada kedua-dua belah`}
                </button>
            </div>
            {b !== 0 && a !== 1 && <p className="text-xs font-bold text-[#64748B]">Asingkan sebutan pemalar dahulu, kemudian bahagi.</p>}
            <button type="button" onClick={() => onChange(kssmInit(problem))} className="text-xs font-extrabold text-[#2563EB] hover:underline">
                ↺ Mula semula
            </button>
        </div>
    );
}

function StepSequencer({ problem, value, onChange }) {
    const toggle = (idx) => onChange(value.includes(idx) ? value.filter((v) => v !== idx) : [...value, idx]);
    return (
        <div className="space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#475569]">Klik mengikut urutan betul</p>
            <div className="grid grid-cols-1 gap-2">
                {problem.shuffle.map((idx) => {
                    const pos = value.indexOf(idx);
                    return (
                        <button key={idx} type="button" onClick={() => toggle(idx)} className={`${cardBase} text-left flex items-center gap-3 ${pos >= 0 ? cardOn : cardOff}`}>
                            <span className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 border ${pos >= 0 ? 'bg-white text-[#2563EB] border-white' : 'bg-[#F1F5F9] text-[#94A3B8] border-[#CBD5E1]'}`}>
                                {pos >= 0 ? pos + 1 : '?'}
                            </span>
                            <span className="font-math">{problem.steps[idx]}</span>
                        </button>
                    );
                })}
            </div>
            <button type="button" onClick={() => onChange([])} className="text-xs font-extrabold text-[#2563EB] hover:underline">
                ↺ Mula semula
            </button>
        </div>
    );
}

function ChoiceList({ problem, value, onChange }) {
    const set = (i, opt) => onChange(value.map((v, j) => (j === i ? opt : v)));
    return (
        <div className="space-y-2">
            {problem.items.map((item, i) => (
                <div key={item.label} className={`${panel} flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
                    <span className="text-sm sm:text-base font-extrabold text-[#0F172A] font-math">{item.label}</span>
                    <div className="flex flex-wrap gap-1.5">
                        {(item.options || problem.options).map((opt) => (
                            <button key={opt} type="button" onClick={() => set(i, opt)} className={`${cardBase} ${value[i] === opt ? cardOn : cardOff} font-math`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

const X_MIN = -8;
const X_MAX = 8;
const Y_MIN = -20;
const Y_MAX = 20;
const PX = 20;
const PY = 8;
const sx = (x) => (x - X_MIN) * PX;
const sy = (y) => (Y_MAX - y) * PY;
const xFromPx = (px) => X_MIN + px / PX;
const yFromPx = (py) => Y_MAX - py / PY;

const RANGES = { a: [-3, 3], b: [-8, 8], c: [-15, 15] };

function QuadraticGraph({ value, onChange }) {
    const { a, b, c } = value;
    const f = (x) => a * x * x + b * x + c;
    const h = -b / (2 * a);
    const k = f(h);
    const disc = b * b - 4 * a * c;
    const roots = disc >= 0 ? [(-b - Math.sqrt(disc)) / (2 * a), (-b + Math.sqrt(disc)) / (2 * a)].sort((p, q) => p - q) : [];
    const points = useMemo(() => {
        const pts = [];
        for (let x = X_MIN; x <= X_MAX; x += 0.25) pts.push(`${sx(x)},${sy(a * x * x + b * x + c)}`);
        return pts.join(' ');
    }, [a, b, c]);

    const svgRef = useRef(null);
    const [dragMode, setDragMode] = useState(null);
    const dragStartRef = useRef(null);

    const getSvgCoords = (e) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return { x: 160, y: 160 };
        const x = ((e.clientX - rect.left) / rect.width) * 320;
        const y = ((e.clientY - rect.top) / rect.height) * 320;
        return { x, y };
    };

    const handlePointerDown = (mode, e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture?.(e.pointerId);
        const coords = getSvgCoords(e);
        setDragMode(mode);
        dragStartRef.current = {
            pointer: coords,
            a,
            b,
            c,
            h,
            k,
        };
    };

    const handlePointerMove = (e) => {
        if (!dragMode || !dragStartRef.current) return;
        const coords = getSvgCoords(e);
        const { a: a0, b: b0, c: c0, h: h0, k: k0, pointer: p0 } = dragStartRef.current;

        if (dragMode === 'y-intercept') {
            const currentMathY = yFromPx(coords.y);
            const newC = Math.max(-15, Math.min(15, Math.round(currentMathY)));
            if (newC !== c) {
                onChange({ a, b, c: newC });
            }
            return;
        }

        if (dragMode === 'vertex' || dragMode === 'curve') {
            const deltaX = (coords.x - p0.x) / PX;
            const deltaY = -(coords.y - p0.y) / PY;
            const rawH = h0 + deltaX;
            const rawK = k0 + deltaY;

            // Half-unit precision on h allows b to hit both odd and even integers
            const newH = Math.round(rawH * 2) / 2;
            const newB = Math.max(-8, Math.min(8, Math.round(-2 * a0 * newH)));
            const actualH = -newB / (2 * a0);
            const newC = Math.max(-15, Math.min(15, Math.round(rawK + a0 * actualH * actualH)));

            if (newB !== b || newC !== c) {
                onChange({ a: a0, b: newB, c: newC });
            }
        }
    };

    const handlePointerUp = (e) => {
        if (dragMode) {
            e.currentTarget.releasePointerCapture?.(e.pointerId);
            setDragMode(null);
            dragStartRef.current = null;
        }
    };

    const step = (key, delta) => {
        let next = value[key] + delta;
        if (key === 'a' && next === 0) next += delta;
        const [lo, hi] = RANGES[key];
        if (next < lo || next > hi) return;
        onChange({ ...value, [key]: next });
    };

    return (
        <div className="space-y-3">
            <svg
                ref={svgRef}
                viewBox="0 0 320 320"
                className="w-full max-w-md mx-auto bg-white border border-[#E2E8F0] rounded-xl overflow-hidden touch-none select-none cursor-default"
                role="img"
                aria-label="Graf fungsi kuadratik"
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                {/* Background grid markings */}
                {[-6, -4, -2, 2, 4, 6].map((gx) => (
                    <line key={`gx-${gx}`} x1={sx(gx)} y1="0" x2={sx(gx)} y2="320" stroke="#F1F5F9" strokeWidth="1" />
                ))}
                {[-15, -10, -5, 5, 10, 15].map((gy) => (
                    <line key={`gy-${gy}`} x1="0" y1={sy(gy)} x2="320" y2={sy(gy)} stroke="#F1F5F9" strokeWidth="1" />
                ))}

                {/* Coordinate axes intersecting at center (160, 160) */}
                <line x1={sx(0)} y1="0" x2={sx(0)} y2="320" stroke="#64748B" strokeWidth="1.5" />
                <line x1="0" y1={sy(0)} x2="320" y2={sy(0)} stroke="#64748B" strokeWidth="1.5" />

                {/* Axis labels & origin */}
                <text x="308" y="174" fontSize="11" fontWeight="bold" fill="#64748B">x</text>
                <text x="166" y="14" fontSize="11" fontWeight="bold" fill="#64748B">y</text>
                <text x="148" y="174" fontSize="10" fontWeight="bold" fill="#94A3B8">0</text>

                {/* Axis of symmetry */}
                {h >= X_MIN && h <= X_MAX && (
                    <line x1={sx(h)} y1="0" x2={sx(h)} y2="320" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="5 4" />
                )}

                {/* Visible quadratic curve */}
                <polyline points={points} fill="none" stroke="#2563EB" strokeWidth="2.5" />

                {/* Transparent wide hit-area polyline for easy dragging */}
                <polyline
                    points={points}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="24"
                    className="cursor-grab active:cursor-grabbing"
                    onPointerDown={(e) => handlePointerDown('curve', e)}
                />

                {/* Roots */}
                {roots.map((rx, i) => rx >= X_MIN && rx <= X_MAX && (
                    <circle key={i} cx={sx(rx)} cy={sy(0)} r="4.5" fill="#10B981" />
                ))}

                {/* Y-intercept Draggable Dot */}
                {c >= Y_MIN && c <= Y_MAX && (
                    <circle
                        cx={sx(0)}
                        cy={sy(c)}
                        r="6"
                        fill="#EF4444"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        className="cursor-ns-resize"
                        onPointerDown={(e) => handlePointerDown('y-intercept', e)}
                    />
                )}

                {/* Vertex (Turning Point) Draggable Dot */}
                {h >= X_MIN && h <= X_MAX && k >= Y_MIN && k <= Y_MAX && (
                    <circle
                        cx={sx(h)}
                        cy={sy(k)}
                        r="6"
                        fill="#7C3AED"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        className="cursor-grab active:cursor-grabbing"
                        onPointerDown={(e) => handlePointerDown('vertex', e)}
                    />
                )}
            </svg>

            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] font-bold text-[#475569]">
                <span><span className="text-[#7C3AED]">●</span> Titik pusingan (seret)</span>
                <span><span className="text-[#F59E0B]">┆</span> Paksi simetri</span>
                <span><span className="text-[#EF4444]">●</span> Pintasan-y (seret)</span>
                <span><span className="text-[#10B981]">●</span> Punca</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {['a', 'b', 'c'].map((key) => (
                    <div key={key} className={`${panel} flex items-center justify-between gap-1 !p-2`}>
                        <button type="button" onClick={() => step(key, -1)} className={`${cardBase} ${cardOff} !px-2.5 !py-1`} aria-label={`Kurangkan ${key}`}>-</button>
                        <span className="text-sm font-black text-[#0F172A] font-math">{key} = {value[key]}</span>
                        <button type="button" onClick={() => step(key, 1)} className={`${cardBase} ${cardOff} !px-2.5 !py-1`} aria-label={`Tambah ${key}`}>+</button>
                    </div>
                ))}
            </div>

            <div className={`${panel} text-xs sm:text-sm font-bold text-[#0F172A] space-y-0.5`}>
                <p className="font-black font-math text-sm sm:text-base">{quadraticText(value)}</p>
                <p>Titik {a > 0 ? 'minimum' : 'maksimum'}: ({num(h)}, {num(k)}) | Paksi simetri: x = {num(h)}</p>
                <p>Pintasan-y: {c} | {roots.length ? `Punca: x = ${roots.map(num).join(' dan x = ')}` : 'Tiada punca nyata'}</p>
            </div>
        </div>
    );
}

function BitSwitcher({ value, onChange, problem }) {
    const total = bitsValue(value);
    const toggle = (i) => onChange(value.map((bit, j) => (j === i ? 1 - bit : bit)));
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-5 gap-2">
                {BIT_LABELS.map((label, i) => (
                    <button key={label} type="button" onClick={() => toggle(i)} className={`${cardBase} ${value[i] ? cardOn : cardOff} flex flex-col items-center gap-1 !px-1`} aria-pressed={Boolean(value[i])}>
                        <span className="text-[11px]">{label}</span>
                        <span className="text-xl font-black">{value[i]}</span>
                    </button>
                ))}
            </div>
            <div className={`${panel} text-sm font-bold text-[#0F172A] space-y-0.5`}>
                <p>Asas dua: <span className="font-black">{value.join('')}</span>{toSub(2)}</p>
                <p>Kira: {BIT_VALUES.map((v, i) => `${value[i]}×${v}`).join(' + ')} = <span className="font-black">{total}</span>{toSub(10)}</p>
                <p className="text-[#64748B]">Sasaran: {problem.target}{toSub(10)}</p>
            </div>
        </div>
    );
}

export default function KssmManipulative({ problem, value, onChange }) {
    if (!problem || value == null) return null;
    switch (problem.kind) {
        case 'balance':
            return <BalanceScale problem={problem} value={value} onChange={onChange} />;
        case 'sequence':
            return <StepSequencer problem={problem} value={value} onChange={onChange} />;
        case 'choices':
            return <ChoiceList problem={problem} value={value} onChange={onChange} />;
        case 'graph':
            return <QuadraticGraph value={value} onChange={onChange} />;
        case 'bits':
            return <BitSwitcher problem={problem} value={value} onChange={onChange} />;
        default:
            return null;
    }
}
