import { useMemo, useState, useRef, useEffect } from 'react';

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
        { id: 'qe-1', kind: 'graph', target: { a: -1, c: 4 }, prompt: 'Bina graf kuadratik maksimum (masam, |a| = 1) dengan pintasan-y pada 4.', hint: 'Graf maksimum (masam) bermaksud a negatif (-1). Pintasan-y ialah nilai c = 4.' },
        { id: 'qe-2', kind: 'graph', target: { a: 1, c: -3 }, prompt: 'Bina graf kuadratik minimum (senyum, a = 1) yang melalui titik (0, -3).', hint: 'Titik (0, -3) berada pada paksi-y, jadi pintasan-y ialah c = -3.' },
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
            return Boolean(value && typeof value === 'object' && value.a === 1 && value.b === 0);
        case 'sequence':
            return Array.isArray(value) && value.length === problem.steps.length && value.every((v, i) => v === i);
        case 'choices':
            return Array.isArray(value) && problem.items.every((item, i) => value[i] === item.answer);
        case 'graph':
            return Boolean(value && typeof value === 'object' && problem.target && Object.entries(problem.target).every(([k, v]) => value[k] === v));
        case 'bits':
            return Array.isArray(value) && bitsValue(value) === problem.target;
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
    const aVal = Number(a) || 0;
    const bVal = Number(b) || 0;
    const coef = aVal === 1 ? '' : aVal;
    return `${coef}x${bVal > 0 ? ` + ${bVal}` : bVal < 0 ? ` - ${-bVal}` : ''}`;
}

function quadraticText({ a, b, c }) {
    const aPart = `${a === 1 ? '' : a === -1 ? '-' : a}x²`;
    const bPart = b === 0 ? '' : ` ${b > 0 ? '+' : '-'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x`;
    const cPart = c === 0 ? '' : ` ${c > 0 ? '+' : '-'} ${Math.abs(c)}`;
    return `f(x) = ${aPart}${bPart}${cPart}`;
}

const cardBase = 'rounded-xl border px-3.5 py-2.5 min-h-[48px] text-sm sm:text-base font-extrabold transition-all touch-manipulation active:scale-[0.99]';
const cardOff = 'bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#F1F5F9]';
const cardOn = 'bg-[#2563EB] text-white border-[#2563EB]';
const panel = 'bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4';

// ---------------------------------------------------------------------------
// 2D Mario 8-Bit & Angry Birds Inspired Arcade Balance Scale Engine
// ---------------------------------------------------------------------------

function Arcade2DBalanceScale({ value, wobbleKey = 0 }) {
    const { a, b, r } = value;
    const prevRef = useRef(value);
    const [animTime, setAnimTime] = useState(0);
    const tiltRef = useRef({ start: 0, amp: 0, dir: 1 });
    const bounceRef = useRef({ start: 0, amp: 0 });
    const projectilesRef = useRef([]);
    const particlesRef = useRef([]);
    const isFirstMount = useRef(true);

    useEffect(() => {
        if (!wobbleKey) return;
        const now = performance.now();
        tiltRef.current = { start: now, amp: 0.24, dir: 1 };
        bounceRef.current = { start: now, amp: 4 };
        setAnimTime(now);
    }, [wobbleKey]);

    const burst = (cx, cy, count, colors) => {
        const pts = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
            const speed = 70 + Math.random() * 150;
            pts.push({
                id: Math.random() + i,
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 40,
                size: Math.random() > 0.4 ? 5 : 7,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1.0,
            });
        }
        particlesRef.current = [...particlesRef.current, ...pts];
    };

    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            prevRef.current = { a, b, r };
            return;
        }

        const prev = prevRef.current;
        const now = performance.now();
        const diffA = prev.a - a;
        const diffB = Math.abs(prev.b) - Math.abs(b);
        const diffR = prev.r - r;

        // Trigger spring seesaw tilt and bounce
        const tiltDir = diffR > 0 || diffB > 0 ? (Math.random() > 0.5 ? 1 : -1) : 1;
        tiltRef.current = { start: now, amp: 0.16, dir: tiltDir };
        bounceRef.current = { start: now, amp: 8 };

        const newProjs = [];

        // Variable 'x' mystery blocks launched (divided)
        if (diffA > 0) {
            for (let i = 0; i < diffA; i++) {
                newProjs.push({
                    id: Math.random() + i,
                    type: 'x',
                    x: 130 + i * 24,
                    y: 205,
                    vx: -75 - Math.random() * 85,
                    vy: -230 - Math.random() * 90,
                    rot: 0,
                    vrot: -260 - Math.random() * 180,
                    life: 1.0,
                });
            }
            burst(140, 215, 16, ['#F59E0B', '#FACC15', '#FB923C', '#FFFFFF']);
        }

        // Constant b blocks launched (subtracted or eliminated)
        if (diffB > 0) {
            const count = Math.min(diffB, 8);
            for (let i = 0; i < count; i++) {
                newProjs.push({
                    id: Math.random() + i + 10,
                    type: prev.b > 0 ? 'plus' : 'minus',
                    x: 175 + (i % 3) * 18,
                    y: 215 - Math.floor(i / 3) * 18,
                    vx: -60 - Math.random() * 80,
                    vy: -240 - Math.random() * 80,
                    rot: 0,
                    vrot: -220 - Math.random() * 160,
                    life: 1.0,
                });
            }
            burst(180, 220, 16, prev.b > 0 ? ['#EA580C', '#F59E0B', '#FFFFFF'] : ['#E11D48', '#FDA4AF', '#FFFFFF']);
        }

        // Right pan units launched
        if (diffR > 0) {
            const count = Math.min(diffR, 12);
            for (let i = 0; i < count; i++) {
                newProjs.push({
                    id: Math.random() + i + 20,
                    type: 'unit',
                    x: 485 + (i % 4) * 18,
                    y: 215 - Math.floor(i / 4) * 18,
                    vx: 65 + Math.random() * 85,
                    vy: -230 - Math.random() * 80,
                    rot: 0,
                    vrot: 220 + Math.random() * 160,
                    life: 1.0,
                });
            }
            burst(505, 220, 16, ['#10B981', '#34D399', '#FACC15', '#FFFFFF']);
        }

        // Celebration burst when solved
        if (a === 1 && b === 0) {
            burst(320, 150, 24, ['#FACC15', '#F59E0B', '#10B981', '#38BDF8', '#FFFFFF']);
        }

        projectilesRef.current = [...projectilesRef.current, ...newProjs];
        prevRef.current = { a, b, r };
        setAnimTime(now);
    }, [a, b, r]);

    useEffect(() => {
        let rafId;
        let lastTime = performance.now();

        const loop = (now) => {
            const dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;

            const tilt = tiltRef.current;
            const tiltTime = (now - tilt.start) / 1000;
            const isTilting = tilt.amp > 0.001 && tiltTime < 1.6;
            if (!isTilting && tilt.amp > 0) {
                tilt.amp = 0;
            }

            const bounce = bounceRef.current;
            const bounceTime = (now - bounce.start) / 1000;
            const isBouncing = bounce.amp > 0.01 && bounceTime < 1.2;
            if (!isBouncing && bounce.amp > 0) {
                bounce.amp = 0;
            }

            let projActive = false;
            if (projectilesRef.current.length > 0) {
                projectilesRef.current = projectilesRef.current
                    .map((p) => ({
                        ...p,
                        x: p.x + p.vx * dt,
                        y: p.y + p.vy * dt,
                        vy: p.vy + 720 * dt,
                        rot: p.rot + p.vrot * dt,
                        life: p.life - dt / 1.3,
                    }))
                    .filter((p) => p.life > 0 && p.y < 360);
                if (projectilesRef.current.length > 0) projActive = true;
            }

            let partActive = false;
            if (particlesRef.current.length > 0) {
                particlesRef.current = particlesRef.current
                    .map((pt) => ({
                        ...pt,
                        x: pt.x + pt.vx * dt,
                        y: pt.y + pt.vy * dt,
                        vy: pt.vy + 280 * dt,
                        life: pt.life - dt / 0.7,
                    }))
                    .filter((pt) => pt.life > 0);
                if (particlesRef.current.length > 0) partActive = true;
            }

            if (isTilting || isBouncing || projActive || partActive) {
                setAnimTime(now);
            }

            rafId = requestAnimationFrame(loop);
        };

        rafId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafId);
    }, []);

    const replay = () => {
        const now = performance.now();
        tiltRef.current = { start: now, amp: 0.16, dir: 1 };
        bounceRef.current = { start: now, amp: 8 };
        burst(320, 190, 16, ['#FACC15', '#F59E0B', '#38BDF8', '#FFFFFF']);
        setAnimTime(now);
    };

    // Physics calculations
    const tilt = tiltRef.current;
    const t = (animTime - tilt.start) / 1000;
    const theta = tilt.amp > 0 && t < 1.6
        ? tilt.amp * Math.exp(-4 * t) * Math.sin(12 * t) * tilt.dir
        : 0;
    const thetaDeg = (theta * 180) / Math.PI;

    const bounce = bounceRef.current;
    const tb = (animTime - bounce.start) / 1000;
    const bounceY = bounce.amp > 0 && tb < 1.2
        ? -bounce.amp * Math.exp(-5 * tb) * Math.abs(Math.cos(14 * tb))
        : 0;

    // Beam geometry
    const CX = 320;
    const CY = 192;
    const L = 186;
    const x1 = CX - L * Math.cos(theta);
    const y1 = CY - L * Math.sin(theta);
    const x2 = CX + L * Math.cos(theta);
    const y2 = CY + L * Math.sin(theta);

    const px1 = x1;
    const py1 = y1 + 56;
    const px2 = x2;
    const py2 = y2 + 56;

    // Sitting blocks layout
    const xVal = Number(a) || 0;
    const bVal = Number(b) || 0;
    const rVal = Number(r) || 0;
    const xCount = Math.max(0, Math.min(xVal, 6));
    const bCount = Math.max(0, Math.min(Math.abs(bVal), 12));
    const rCount = Math.max(0, Math.min(Math.round(Math.abs(rVal)), 25));

    return (
        <div className="space-y-2.5">
            <div className="relative w-full overflow-hidden border border-[#E2E8F0] rounded-xl bg-[#E0F2FE]">
                <svg
                    viewBox="46 44 548 258"
                    preserveAspectRatio="xMidYMid meet"
                    className="w-full h-auto min-h-[235px] sm:min-h-[300px] block select-none"
                    role="img"
                    aria-label={`Timbangan persamaan linear 2D: ${linearSide(a, b)} = ${r}`}
                >
                    {/* Sky & Horizon */}
                    <rect x="40" y="40" width="560" height="270" fill="#E0F2FE" />
                    <line x1="40" y1="270" x2="600" y2="270" stroke="#BAE6FD" strokeWidth="2" />

                    {/* Mario Rolling Hills */}
                    <path d="M20,270 Q110,202 220,270 Z" fill="#BBF7D0" stroke="#86EFAC" strokeWidth="2" />
                    <path d="M360,270 Q485,198 600,270 Z" fill="#A7F3D0" stroke="#6EE7B7" strokeWidth="2" />

                    {/* 8-Bit Pixel Clouds */}
                    <g opacity="0.95">
                        <rect x="70" y="64" width="68" height="18" rx="4" fill="#FFFFFF" />
                        <rect x="84" y="54" width="40" height="22" rx="4" fill="#FFFFFF" />
                    </g>
                    <g opacity="0.9">
                        <rect x="442" y="72" width="60" height="16" rx="4" fill="#FFFFFF" />
                        <rect x="454" y="62" width="36" height="18" rx="4" fill="#FFFFFF" />
                    </g>

                    {/* Ground Turf & Soil */}
                    <rect x="40" y="270" width="560" height="10" fill="#22C55E" stroke="#16A34A" strokeWidth="1" />
                    <rect x="40" y="280" width="560" height="32" fill="#B45309" />
                    {/* Brick lines */}
                    <line x1="40" y1="295" x2="600" y2="295" stroke="#78350F" strokeWidth="1" />
                    <line x1="80" y1="280" x2="80" y2="295" stroke="#78350F" strokeWidth="1" />
                    <line x1="160" y1="280" x2="160" y2="295" stroke="#78350F" strokeWidth="1" />
                    <line x1="240" y1="280" x2="240" y2="295" stroke="#78350F" strokeWidth="1" />
                    <line x1="320" y1="280" x2="320" y2="295" stroke="#78350F" strokeWidth="1" />
                    <line x1="400" y1="280" x2="400" y2="295" stroke="#78350F" strokeWidth="1" />
                    <line x1="480" y1="280" x2="480" y2="295" stroke="#78350F" strokeWidth="1" />
                    <line x1="560" y1="280" x2="560" y2="295" stroke="#78350F" strokeWidth="1" />
                    <line x1="120" y1="295" x2="120" y2="312" stroke="#78350F" strokeWidth="1" />
                    <line x1="200" y1="295" x2="200" y2="312" stroke="#78350F" strokeWidth="1" />
                    <line x1="280" y1="295" x2="280" y2="312" stroke="#78350F" strokeWidth="1" />
                    <line x1="360" y1="295" x2="360" y2="312" stroke="#78350F" strokeWidth="1" />
                    <line x1="440" y1="295" x2="440" y2="312" stroke="#78350F" strokeWidth="1" />
                    <line x1="520" y1="295" x2="520" y2="312" stroke="#78350F" strokeWidth="1" />

                    {/* Green Warp Pipe Fulcrum */}
                    <rect x="301" y="214" width="38" height="56" fill="#16A34A" stroke="#14532D" strokeWidth="2" />
                    <rect x="306" y="214" width="5" height="56" fill="#4ADE80" />
                    <rect x="327" y="214" width="8" height="56" fill="#15803D" />
                    <rect x="294" y="196" width="52" height="18" rx="2" fill="#22C55E" stroke="#14532D" strokeWidth="2" />
                    <rect x="300" y="198" width="6" height="14" fill="#86EFAC" />
                    <rect x="334" y="198" width="8" height="14" fill="#15803D" />

                    {/* Balance Beam (Tilts by thetaDeg around 320, 192) */}
                    <g transform={`rotate(${thetaDeg}, ${CX}, ${CY})`}>
                        <rect x="130" y="186" width="380" height="12" rx="2" fill="#D97706" stroke="#92400E" strokeWidth="2" />
                        <line x1="140" y1="192" x2="500" y2="192" stroke="#B45309" strokeWidth="1.5" />
                        <rect x="126" y="183" width="12" height="18" rx="2" fill="#475569" stroke="#1E293B" strokeWidth="1.5" />
                        <rect x="502" y="183" width="12" height="18" rx="2" fill="#475569" stroke="#1E293B" strokeWidth="1.5" />
                    </g>

                    {/* Brass Central Pivot Hub */}
                    <circle cx="320" cy="192" r="10" fill="#F59E0B" stroke="#78350F" strokeWidth="2" />
                    <circle cx="320" cy="192" r="4" fill="#78350F" />

                    {/* Suspension Ropes / Chains */}
                    <line x1={x1} y1={y1} x2={px1 - 65} y2={py1} stroke="#78350F" strokeWidth="2" strokeDasharray="4 2" />
                    <line x1={x1} y1={y1} x2={px1 + 65} y2={py1} stroke="#78350F" strokeWidth="2" strokeDasharray="4 2" />
                    <line x1={x2} y1={y2} x2={px2 - 65} y2={py2} stroke="#78350F" strokeWidth="2" strokeDasharray="4 2" />
                    <line x1={x2} y1={y2} x2={px2 + 65} y2={py2} stroke="#78350F" strokeWidth="2" strokeDasharray="4 2" />

                    {/* Wooden Trays (Remain Horizontal) */}
                    {/* Left Pan Tray */}
                    <rect x={px1 - 74} y={py1} width="148" height="11" rx="3" fill="#92400E" stroke="#78350F" strokeWidth="2" />
                    <rect x={px1 - 74} y={py1 - 6} width="6" height="12" rx="1" fill="#78350F" />
                    <rect x={px1 + 68} y={py1 - 6} width="6" height="12" rx="1" fill="#78350F" />

                    {/* Right Pan Tray */}
                    <rect x={px2 - 74} y={py2} width="148" height="11" rx="3" fill="#92400E" stroke="#78350F" strokeWidth="2" />
                    <rect x={px2 - 74} y={py2 - 6} width="6" height="12" rx="1" fill="#78350F" />
                    <rect x={px2 + 68} y={py2 - 6} width="6" height="12" rx="1" fill="#78350F" />

                    {/* Left Pan Blocks: ?x Mystery Crates */}
                    <g>
                        {Array.from({ length: xCount }).map((_, i) => {
                            const crateW = bCount === 0 ? 28 : xCount <= 2 ? 26 : xCount <= 4 ? 19 : 14;
                            const stepX = bCount === 0 ? (xCount <= 4 ? 32 : 24) : xCount <= 2 ? 30 : xCount <= 4 ? 20 : 14;
                            const startX = bCount === 0
                                ? px1 - ((xCount - 1) * stepX + crateW) / 2
                                : px1 - 68;
                            const bx = startX + i * stepX;
                            const by = py1 + bounceY - 34;
                            return (
                                <g key={`x-${i}`} transform={`translate(${bx}, ${by})`}>
                                    <rect x="0" y="0" width={crateW} height="34" rx="3" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
                                    <rect x="2" y="2" width={Math.max(4, crateW - 4)} height="30" rx="2" fill="none" stroke="#FDE68A" strokeWidth="1" />
                                    <text x={crateW / 2} y="23" textAnchor="middle" fontSize={crateW >= 22 ? 17 : 13} fontWeight="900" fill="#78350F" className="font-math">x</text>
                                </g>
                            );
                        })}
                    </g>

                    {/* Left Pan Blocks: Constant b Units */}
                    <g>
                        {Array.from({ length: bCount }).map((_, j) => {
                            const col = j % 3;
                            const row = Math.floor(j / 3);
                            const bx = px1 + 12 + col * 19;
                            const by = py1 + bounceY - 19 - row * 19;
                            return b > 0 ? (
                                <g key={`b-${j}`} transform={`translate(${bx}, ${by})`}>
                                    <rect x="0" y="0" width="18" height="18" rx="2" fill="#EA580C" stroke="#9A3412" strokeWidth="1.5" />
                                    <text x="9" y="13" textAnchor="middle" fontSize="10" fontWeight="900" fill="#FEF08A" className="font-math">+1</text>
                                </g>
                            ) : (
                                <g key={`b-neg-${j}`} transform={`translate(${bx}, ${by})`}>
                                    <rect x="0" y="0" width="18" height="18" rx="2" fill="#E11D48" stroke="#881337" strokeWidth="1.5" />
                                    <text x="9" y="13" textAnchor="middle" fontSize="10" fontWeight="900" fill="#FFFFFF" className="font-math">-1</text>
                                </g>
                            );
                        })}
                    </g>

                    {/* Right Pan Blocks: Constant r Units */}
                    {Array.from({ length: rCount }).map((_, k) => {
                        const col = k % 5;
                        const row = Math.floor(k / 5);
                        const bx = px2 - 46 + col * 18;
                        const by = py2 + bounceY - 17 - row * 18;
                        return rVal >= 0 ? (
                            <g key={`r-${k}`} transform={`translate(${bx}, ${by})`}>
                                <rect x="0" y="0" width="17" height="17" rx="2" fill="#10B981" stroke="#047857" strokeWidth="1.5" />
                                <circle cx="8.5" cy="8.5" r="5" fill="#34D399" stroke="#065F46" strokeWidth="1" />
                                <text x="8.5" y="11.5" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#FFFFFF" className="font-math">1</text>
                            </g>
                        ) : (
                            <g key={`r-neg-${k}`} transform={`translate(${bx}, ${by})`}>
                                <rect x="0" y="0" width="17" height="17" rx="2" fill="#E11D48" stroke="#881337" strokeWidth="1.5" />
                                <text x="8.5" y="12" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#FFFFFF" className="font-math">-1</text>
                            </g>
                        );
                    })}

                    {/* Flying Angry Birds Launch Projectiles */}
                    {projectilesRef.current.map((p) => (
                        <g
                            key={p.id}
                            transform={`translate(${p.x}, ${p.y}) rotate(${p.rot})`}
                            opacity={Math.max(0, p.life)}
                        >
                            {p.type === 'x' ? (
                                <g transform="translate(-13, -16)">
                                    <rect x="0" y="0" width="26" height="32" rx="3" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
                                    <text x="13" y="21" textAnchor="middle" fontSize="16" fontWeight="900" fill="#78350F" className="font-math">x</text>
                                    <text x="19" y="11" textAnchor="middle" fontSize="8" fontWeight="900" fill="#92400E">?</text>
                                </g>
                            ) : p.type === 'plus' ? (
                                <g transform="translate(-9, -9)">
                                    <rect x="0" y="0" width="18" height="18" rx="2" fill="#EA580C" stroke="#9A3412" strokeWidth="1.5" />
                                    <text x="9" y="13" textAnchor="middle" fontSize="10" fontWeight="900" fill="#FEF08A" className="font-math">+1</text>
                                </g>
                            ) : p.type === 'minus' ? (
                                <g transform="translate(-9, -9)">
                                    <rect x="0" y="0" width="18" height="18" rx="2" fill="#E11D48" stroke="#881337" strokeWidth="1.5" />
                                    <text x="9" y="13" textAnchor="middle" fontSize="10" fontWeight="900" fill="#FFFFFF" className="font-math">-1</text>
                                </g>
                            ) : (
                                <g transform="translate(-8, -8)">
                                    <rect x="0" y="0" width="16" height="16" rx="2" fill="#10B981" stroke="#047857" strokeWidth="1.5" />
                                    <circle cx="8" cy="8" r="5" fill="#34D399" stroke="#065F46" strokeWidth="1" />
                                    <text x="8" y="11" textAnchor="middle" fontSize="9" fontWeight="900" fill="#FFFFFF" className="font-math">1</text>
                                </g>
                            )}
                        </g>
                    ))}

                    {/* 8-Bit Pixel Particle Bursts */}
                    {particlesRef.current.map((pt) => (
                        <rect
                            key={pt.id}
                            x={pt.x - pt.size / 2}
                            y={pt.y - pt.size / 2}
                            width={pt.size}
                            height={pt.size}
                            fill={pt.color}
                            opacity={Math.max(0, pt.life)}
                        />
                    ))}

                    {/* Live Algebraic Expression Badges */}
                    <g transform={`translate(${px1}, ${py1 - 72})`}>
                        <rect x="-54" y="-15" width="108" height="28" rx="9" fill="#FFFFFF" stroke="#C7D2FE" strokeWidth="1.8" />
                        <text x="0" y="4" textAnchor="middle" fontSize="15" fontWeight="900" fill="#3730A3" className="font-math">
                            {linearSide(a, b)}
                        </text>
                    </g>
                    <g transform={`translate(${px2}, ${py2 - 72})`}>
                        <rect x="-40" y="-15" width="80" height="28" rx="9" fill="#FFFFFF" stroke="#A7F3D0" strokeWidth="1.8" />
                        <text x="0" y="4" textAnchor="middle" fontSize="15" fontWeight="900" fill="#065F46" className="font-math">
                            {r}
                        </text>
                    </g>

                    {/* Solved Celebration Ribbon */}
                    {a === 1 && b === 0 && (
                        <g transform="translate(320, 68)">
                            <rect x="-112" y="-15" width="224" height="30" rx="9" fill="#ECFDF5" stroke="#10B981" strokeWidth="2" />
                            <text x="0" y="5" textAnchor="middle" fontSize="14" fontWeight="900" fill="#047857" className="font-math">
                                ★ SELESAI: x = {r} ★
                            </text>
                        </g>
                    )}
                </svg>
            </div>

            {/* Stage Footer & Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-bold text-[#475569]">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-3.5 h-3.5 rounded-sm bg-[#F59E0B] border border-[#B45309] text-[9px] font-black text-[#78350F] text-center leading-3 font-math">x</span>
                        <span>Pemboleh ubah x</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-3 h-3 rounded-sm bg-[#EA580C] border border-[#9A3412]" />
                        <span>Unit (+1)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-3 h-3 rounded-sm bg-[#10B981] border border-[#047857]" />
                        <span>Unit Kanan</span>
                    </span>
                </div>
                <button
                    type="button"
                    onClick={replay}
                    className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] bg-white text-xs font-extrabold text-[#2563EB] hover:bg-[#F8FAFC] touch-manipulation active:scale-95"
                >
                    💥 Ulang Animasi
                </button>
            </div>
        </div>
    );
}

const BALANCE_OPS = [
    { id: '+', sym: '+', label: 'Tambah' },
    { id: '-', sym: '−', label: 'Tolak' },
    { id: '×', sym: '×', label: 'Darab' },
    { id: '÷', sym: '÷', label: 'Bahagi' },
];

function buildBalanceCandidates(a, b, r, problem) {
    const raw = [
        Math.abs(b),
        a,
        Math.abs(r),
        Math.abs(problem.b),
        problem.a,
        Math.abs(r - b),
        2,
        3,
        4,
    ].filter((n) => Number.isInteger(n) && n >= 1 && n <= 30);
    return Array.from(new Set(raw)).sort((m, n) => m - n).slice(0, 6);
}

function BalanceScale({ problem, value, onChange }) {
    const val = (value && typeof value === 'object' && typeof value.a === 'number') ? value : kssmInit(problem);
    const { a, b, r } = val;
    const [op, setOp] = useState(null);
    const [chosenNum, setChosenNum] = useState(null);
    const [history, setHistory] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [wobbleKey, setWobbleKey] = useState(0);

    const candidates = useMemo(() => buildBalanceCandidates(a, b, r, problem), [a, b, r, problem]);
    const isSolved = a === 1 && b === 0;

    const applyOperation = () => {
        if (!op || !chosenNum || isSolved) return;
        const n = chosenNum;

        if (op === '+' || op === '-') {
            const delta = op === '+' ? n : -n;
            const nextB = b + delta;
            const nextR = r + delta;
            if (Math.abs(nextB) > 20 || Math.abs(nextR) > 40) {
                setWobbleKey((k) => k + 1);
                setFeedback({ type: 'bad', text: 'Nilai terlalu besar untuk timbangan. Cuba operasi songsang untuk kecilkan nilai!' });
                return;
            }
            setHistory((h) => [...h, { a, b, r }]);
            onChange({ a, b: nextB, r: nextR });
            if (nextB === 0 && b !== 0) {
                setFeedback({ type: 'good', text: `Tepat! Pemalar dihapuskan. Kini tinggal ${linearSide(a, 0)} = ${nextR}. Apakah langkah seterusnya?` });
                setOp(null);
                setChosenNum(null);
            } else if (Math.abs(nextB) < Math.abs(b)) {
                setFeedback({ type: 'good', text: `Bagus! Pemalar semakin berkurang (${linearSide(a, nextB)} = ${nextR}).` });
            } else {
                setFeedback({ type: 'warn', text: `Seimbang (${linearSide(a, nextB)} = ${nextR}), tetapi pemalar makin besar. Guna operasi songsang untuk jadikan pemalar 0!` });
            }
            return;
        }

        if (op === '÷') {
            if (n <= 1) {
                setWobbleKey((k) => k + 1);
                setFeedback({ type: 'warn', text: 'Bahagi dengan 1 tidak mengubah nilai persamaan.' });
                return;
            }
            if (a % n === 0 && b % n === 0 && r % n === 0) {
                const nextA = a / n;
                const nextB = b / n;
                const nextR = r / n;
                setHistory((h) => [...h, { a, b, r }]);
                onChange({ a: nextA, b: nextB, r: nextR });
                setOp(null);
                setChosenNum(null);
                if (nextA === 1 && nextB === 0) {
                    setFeedback({ type: 'good', text: `Syabas! x = ${nextR} berjaya diasingkan. Tekan "Semak Jawapan" di bawah!` });
                } else {
                    setFeedback({ type: 'good', text: `Seimbang! Kedua-dua belah dibahagi ${n}: ${linearSide(nextA, nextB)} = ${nextR}.` });
                }
            } else if (b !== 0 && a % n === 0 && b % n !== 0) {
                setWobbleKey((k) => k + 1);
                setFeedback({ type: 'bad', text: `Tidak boleh bahagi ${n} lagi! Pemalar ${b > 0 ? `+${b}` : b} tidak boleh dibahagi tepat dengan ${n}. Asingkan pemalar dahulu!` });
            } else {
                setWobbleKey((k) => k + 1);
                setFeedback({ type: 'bad', text: `Tidak boleh bahagi tepat dengan ${n} kerana menghasilkan pecahan. Semak semula pekali ${a} dan nilai ${r}.` });
            }
            return;
        }

        if (op === '×') {
            const nextA = a * n;
            const nextB = b * n;
            const nextR = r * n;
            if (nextA > 12 || Math.abs(nextB) > 20 || Math.abs(nextR) > 40) {
                setWobbleKey((k) => k + 1);
                setFeedback({ type: 'bad', text: `Darab ${n} menjadikan blok terlalu besar. Cuba operasi songsang untuk mengasingkan x.` });
                return;
            }
            setHistory((h) => [...h, { a, b, r }]);
            onChange({ a: nextA, b: nextB, r: nextR });
            setFeedback({ type: 'warn', text: `Seimbang (${linearSide(nextA, nextB)} = ${nextR}), tetapi semua sebutan digandakan ×${n}.` });
        }
    };

    const undoStep = () => {
        if (history.length === 0) return;
        const prev = history[history.length - 1];
        setHistory((h) => h.slice(0, -1));
        setFeedback(null);
        onChange(prev);
    };

    const resetAll = () => {
        setHistory([]);
        setOp(null);
        setChosenNum(null);
        setFeedback(null);
        onChange(kssmInit(problem));
    };

    const opSym = BALANCE_OPS.find((item) => item.id === op)?.sym || '';

    return (
        <div className="space-y-3">
            <Arcade2DBalanceScale value={val} wobbleKey={wobbleKey} />

            {feedback && (
                <div
                    role="status"
                    className={`p-3 rounded-xl border text-xs sm:text-sm font-bold ${
                        feedback.type === 'good'
                            ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                            : feedback.type === 'warn'
                            ? 'bg-[#FFFBEB] border-[#FCD34D] text-[#92400E]'
                            : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
                    }`}
                >
                    {feedback.text}
                </div>
            )}

            {!isSolved && (
                <div className={`${panel} !p-3 sm:!p-4 space-y-3`}>
                    <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569] block mb-1.5">
                            1. Pilih Operasi pada Kedua-dua Belah:
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                            {BALANCE_OPS.map((item) => {
                                const active = op === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setOp(item.id)}
                                        className={`rounded-xl border min-h-[48px] px-1 py-1.5 flex flex-col items-center justify-center transition-all touch-manipulation active:scale-95 ${
                                            active ? cardOn : cardOff
                                        }`}
                                    >
                                        <span className="text-lg font-black leading-none font-math">{item.sym}</span>
                                        <span className="text-[11px] font-extrabold mt-0.5">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">
                                2. Pilih Nilai:
                            </span>
                            <div className="inline-flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setChosenNum((n) => Math.max(1, (n ?? 1) - 1))}
                                    aria-label="Kurangkan nilai pilihan"
                                    className="w-8 h-8 rounded-lg border border-[#CBD5E1] bg-white text-sm font-black text-[#0F172A] hover:bg-[#F1F5F9] touch-manipulation active:scale-95"
                                >
                                    −
                                </button>
                                <span className="min-w-[36px] text-center text-sm font-black text-[#0F172A] font-math">
                                    {chosenNum ?? '?'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setChosenNum((n) => Math.min(30, (n ?? 0) + 1))}
                                    aria-label="Tambah nilai pilihan"
                                    className="w-8 h-8 rounded-lg border border-[#CBD5E1] bg-white text-sm font-black text-[#0F172A] hover:bg-[#F1F5F9] touch-manipulation active:scale-95"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {candidates.map((c) => {
                                const active = chosenNum === c;
                                return (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setChosenNum(c)}
                                        className={`min-h-[44px] rounded-xl border text-base font-black font-math transition-all touch-manipulation active:scale-95 ${
                                            active ? cardOn : cardOff
                                        }`}
                                    >
                                        {c}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={!op || !chosenNum}
                        onClick={applyOperation}
                        className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-extrabold transition-all touch-manipulation active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed font-math"
                    >
                        {op && chosenNum
                            ? `Laksana: ${opSym} ${chosenNum} pada Kedua-dua Belah`
                            : 'Pilih operasi & nilai di atas'}
                    </button>
                </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-3">
                    {history.length > 0 && (
                        <button
                            type="button"
                            onClick={undoStep}
                            className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-xs font-extrabold text-[#334155] hover:bg-[#F1F5F9] touch-manipulation active:scale-95"
                        >
                            ↶ Undur ({history.length})
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={resetAll}
                        className="text-xs font-extrabold text-[#2563EB] hover:underline py-1 touch-manipulation"
                    >
                        ↺ Mula semula
                    </button>
                </div>
                <span className="text-xs font-extrabold text-[#047857]">⚖️ Persamaan: {linearSide(a, b)} = {r}</span>
            </div>
        </div>
    );
}

function StepSequencer({ problem, value, onChange }) {
    const list = Array.isArray(value) ? value : [];
    const toggle = (idx) => onChange(list.includes(idx) ? list.filter((v) => v !== idx) : [...list, idx]);
    const undoLast = () => list.length > 0 && onChange(list.slice(0, -1));
    return (
        <div className="space-y-3">
            {/* Live Ordered Solution Tray (reduces cognitive load on mobile) */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">
                        Langkah Penyelesaian Anda ({list.length}/{problem.steps.length})
                    </span>
                    {list.length > 0 && (
                        <button
                            type="button"
                            onClick={undoLast}
                            className="px-2 py-1 rounded-lg border border-[#CBD5E1] bg-white text-[11px] font-extrabold text-[#334155] hover:bg-[#F1F5F9] touch-manipulation active:scale-95"
                        >
                            ↶ Undur
                        </button>
                    )}
                </div>
                {list.length === 0 ? (
                    <p className="text-xs font-bold text-[#64748B]">
                        Tap langkah di bawah mengikut urutan betul (1 → {problem.steps.length}).
                    </p>
                ) : (
                    <div className="flex flex-wrap items-center gap-1.5">
                        {list.map((stepIdx, orderIdx) => (
                            <span
                                key={`seq-${stepIdx}`}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#BFDBFE] text-xs font-extrabold text-[#1E40AF] font-math"
                            >
                                <span className="w-4 h-4 rounded-full bg-[#2563EB] text-white text-[10px] font-black flex items-center justify-center">
                                    {orderIdx + 1}
                                </span>
                                <span>{problem.steps[stepIdx]}</span>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <p className="text-xs font-extrabold uppercase tracking-wider text-[#475569]">Klik mengikut urutan betul</p>
            <div className="grid grid-cols-1 gap-2">
                {problem.shuffle.map((idx) => {
                    const pos = list.indexOf(idx);
                    return (
                        <button key={idx} type="button" onClick={() => toggle(idx)} className={`${cardBase} text-left flex items-center gap-3 ${pos >= 0 ? cardOn : cardOff}`}>
                            <span className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center shrink-0 border ${pos >= 0 ? 'bg-white text-[#2563EB] border-white' : 'bg-[#F1F5F9] text-[#94A3B8] border-[#CBD5E1]'}`}>
                                {pos >= 0 ? pos + 1 : '?'}
                            </span>
                            <span className="font-math">{problem.steps[idx]}</span>
                        </button>
                    );
                })}
            </div>
            <button type="button" onClick={() => onChange([])} className="text-xs font-extrabold text-[#2563EB] hover:underline py-1 touch-manipulation">
                ↺ Mula semula
            </button>
        </div>
    );
}

function ChoiceList({ problem, value, onChange }) {
    const list = Array.isArray(value) ? value : [];
    const set = (i, opt) => onChange(list.map((v, j) => (j === i ? opt : v)));
    return (
        <div className="space-y-2">
            {problem.items.map((item, i) => (
                <div key={item.label} className={`${panel} flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
                    <span className="text-sm sm:text-base font-extrabold text-[#0F172A] font-math">{item.label}</span>
                    <div className="flex flex-wrap gap-1.5">
                        {(item.options || problem.options).map((opt) => (
                            <button key={opt} type="button" onClick={() => set(i, opt)} className={`${cardBase} ${list[i] === opt ? cardOn : cardOff} font-math`}>
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
                className="w-full max-w-lg min-h-[290px] mx-auto bg-white border border-[#E2E8F0] rounded-xl overflow-hidden touch-none select-none cursor-default"
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

                {/* Numeric tick labels for mobile readability */}
                {[-4, -2, 2, 4].map((gx) => (
                    <text key={`tx-${gx}`} x={sx(gx)} y="172" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#94A3B8">{gx}</text>
                ))}
                {[-10, -5, 5, 10].map((gy) => (
                    <text key={`ty-${gy}`} x="155" y={sy(gy) + 3} textAnchor="end" fontSize="9.5" fontWeight="bold" fill="#94A3B8">{gy}</text>
                ))}

                {/* Axis labels & origin */}
                <text x="308" y="174" fontSize="12" fontWeight="bold" fill="#475569">x</text>
                <text x="166" y="14" fontSize="12" fontWeight="bold" fill="#475569">y</text>
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

                {/* Y-intercept Draggable Dot (44px touch hit target) */}
                {c >= Y_MIN && c <= Y_MAX && (
                    <g
                        className="cursor-ns-resize"
                        onPointerDown={(e) => handlePointerDown('y-intercept', e)}
                    >
                        <circle cx={sx(0)} cy={sy(c)} r="11" fill="#EF4444" opacity="0.22" />
                        <circle cx={sx(0)} cy={sy(c)} r="6.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
                        <circle cx={sx(0)} cy={sy(c)} r="22" fill="transparent" />
                    </g>
                )}

                {/* Vertex (Turning Point) Draggable Dot (44px touch hit target) */}
                {h >= X_MIN && h <= X_MAX && k >= Y_MIN && k <= Y_MAX && (
                    <g
                        className="cursor-grab active:cursor-grabbing"
                        onPointerDown={(e) => handlePointerDown('vertex', e)}
                    >
                        <circle cx={sx(h)} cy={sy(k)} r="11" fill="#7C3AED" opacity="0.22" />
                        <circle cx={sx(h)} cy={sy(k)} r="6.5" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="2" />
                        <circle cx={sx(h)} cy={sy(k)} r="22" fill="transparent" />
                    </g>
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
                    <div key={key} className={`${panel} flex items-center justify-between gap-1 !p-1.5 sm:!p-2`}>
                        <button type="button" onClick={() => step(key, -1)} className={`${cardBase} ${cardOff} !px-0 !py-0 min-w-[42px] min-h-[42px] flex items-center justify-center`} aria-label={`Kurangkan ${key}`}>-</button>
                        <span className="text-xs sm:text-sm font-black text-[#0F172A] font-math">{key} = {value[key]}</span>
                        <button type="button" onClick={() => step(key, 1)} className={`${cardBase} ${cardOff} !px-0 !py-0 min-w-[42px] min-h-[42px] flex items-center justify-center`} aria-label={`Tambah ${key}`}>+</button>
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
    const list = Array.isArray(value) ? value : [0, 0, 0, 0, 0];
    const toggle = (i) => onChange(list.map((bit, j) => (j === i ? 1 - bit : bit)));
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-5 gap-2">
                {BIT_LABELS.map((label, i) => (
                    <button key={label} type="button" onClick={() => toggle(i)} className={`${cardBase} ${list[i] ? cardOn : cardOff} min-h-[64px] flex flex-col items-center justify-center gap-1 !px-1`} aria-pressed={Boolean(list[i])}>
                        <span className="text-[11px]">{label}</span>
                        <span className="text-2xl font-black">{list[i]}</span>
                    </button>
                ))}
            </div>
            <div className={`${panel} text-sm sm:text-base font-bold text-[#0F172A] space-y-1`}>
                <p>Asas dua: <span className="font-black">{list.join('')}</span>{toSub(2)}</p>
                <p>Kira nilai: {BIT_VALUES.map((v, i) => `${list[i]}×${v}`).join(' + ')} = <span className="font-black text-[#2563EB]">?</span></p>
                <p className="text-[#64748B]">Sasaran: <span className="font-black text-[#0F172A]">{problem.target}{toSub(10)}</span> (kira jumlah sendiri sebelum semak)</p>
            </div>
        </div>
    );
}

function isKssmValueValid(problem, value) {
    if (!problem || value == null) return false;
    switch (problem.kind) {
        case 'balance':
            return typeof value === 'object' && !Array.isArray(value) && typeof value.a === 'number';
        case 'sequence':
        case 'choices':
        case 'bits':
            return Array.isArray(value);
        case 'graph':
            return typeof value === 'object' && !Array.isArray(value) && typeof value.a === 'number';
        default:
            return false;
    }
}

export default function KssmManipulative({ problem, value, onChange }) {
    if (!problem) return null;
    const safeValue = isKssmValueValid(problem, value) ? value : kssmInit(problem);
    if (safeValue == null) return null;
    switch (problem.kind) {
        case 'balance':
            return <BalanceScale problem={problem} value={safeValue} onChange={onChange} />;
        case 'sequence':
            return <StepSequencer problem={problem} value={safeValue} onChange={onChange} />;
        case 'choices':
            return <ChoiceList problem={problem} value={safeValue} onChange={onChange} />;
        case 'graph':
            return <QuadraticGraph value={safeValue} onChange={onChange} />;
        case 'bits':
            return <BitSwitcher problem={problem} value={safeValue} onChange={onChange} />;
        default:
            return null;
    }
}
