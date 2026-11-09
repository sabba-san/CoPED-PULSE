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

const cardBase = 'rounded-xl border px-3 py-2 text-sm font-extrabold transition-colors';
const cardOff = 'bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#F1F5F9]';
const cardOn = 'bg-[#2563EB] text-white border-[#2563EB]';
const panel = 'bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4';

// ---------------------------------------------------------------------------
// Native WebGL 3D balance scale (no external libraries). Every object in the
// scene is the same unit cube, drawn with its own translate / rotateZ / scale.
// ---------------------------------------------------------------------------

const VERT_SRC = `
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform mat4 uMVPMatrix;
uniform mat3 uNormalMatrix;
varying vec3 vNormal;
void main() {
    vNormal = uNormalMatrix * aNormal;
    gl_Position = uMVPMatrix * vec4(aPosition, 1.0);
}`;

const FRAG_SRC = `
precision mediump float;
uniform vec3 uColor;
uniform vec3 uLightDir;
varying vec3 vNormal;
void main() {
    float diffuse = max(dot(normalize(vNormal), uLightDir), 0.0);
    gl_FragColor = vec4(uColor * (0.42 + 0.58 * diffuse), 1.0);
}`;

const hexRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const GL_COLORS = {
    floor: hexRgb('#E2E8F0'),
    pedestal: hexRgb('#1E293B'),
    pillar: hexRgb('#334155'),
    beam: hexRgb('#475569'),
    string: hexRgb('#64748B'),
    pan: hexRgb('#94A3B8'),
    x: hexRgb('#4F46E5'),
    plus: hexRgb('#F59E0B'),
    minus: hexRgb('#F43F5E'),
    right: hexRgb('#10B981'),
};
const LIGHT_DIR = (() => {
    const v = [0.45, 0.85, 0.6];
    const len = Math.hypot(...v);
    return new Float32Array(v.map((c) => c / len));
})();

const PIVOT_Y = 1.3;
const ARM = 2.2;
const STRING_LEN = 1.25;
const CAM_TARGET = [0, 0.3, 0];
const DEG = Math.PI / 180;
const CAM_DEFAULT = { yaw: 0.5, pitch: 22 * DEG, dist: 8.5 };
const PITCH_MIN = 10 * DEG;
const PITCH_MAX = 65 * DEG;
const DIST_MIN = 5.5;
const DIST_MAX = 13;
const TILT_AMP = 0.22;
const TILT_SECONDS = 1.6;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function cubeGeometry() {
    const pos = [];
    const nrm = [];
    for (let axis = 0; axis < 3; axis++) {
        for (const s of [-1, 1]) {
            const u = (axis + 1) % 3;
            const v = (axis + 2) % 3;
            const corner = (cu, cv) => {
                const p = [0, 0, 0];
                p[axis] = s * 0.5;
                p[u] = cu * 0.5;
                p[v] = cv * 0.5;
                return p;
            };
            const quad = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)];
            const n = [0, 0, 0];
            n[axis] = s;
            for (const k of [0, 1, 2, 0, 2, 3]) {
                pos.push(...quad[k]);
                nrm.push(...n);
            }
        }
    }
    return { pos: new Float32Array(pos), nrm: new Float32Array(nrm) };
}

// Column-major 4x4 helpers.
function mat4Mul(a, b) {
    const out = new Float32Array(16);
    for (let c = 0; c < 4; c++) {
        for (let r = 0; r < 4; r++) {
            let sum = 0;
            for (let k = 0; k < 4; k++) sum += a[k * 4 + r] * b[c * 4 + k];
            out[c * 4 + r] = sum;
        }
    }
    return out;
}

function perspective(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);
    return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
}

function lookAt(eye, target) {
    const z = eye.map((e, i) => e - target[i]);
    const zl = Math.hypot(...z);
    z.forEach((_, i) => (z[i] /= zl));
    const xl = Math.hypot(z[2], z[0]);
    const x = [z[2] / xl, 0, -z[0] / xl]; // cross(up = +Y, z)
    const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
    const dot = (v) => v[0] * eye[0] + v[1] * eye[1] + v[2] * eye[2];
    return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x), -dot(y), -dot(z), 1]);
}

// Model = T * Rz * S, normal matrix = Rz * S^-1 (inverse-transpose of the 3x3 part).
function modelMatrix({ p, rz, s }) {
    const c = Math.cos(rz);
    const n = Math.sin(rz);
    return new Float32Array([c * s[0], n * s[0], 0, 0, -n * s[1], c * s[1], 0, 0, 0, 0, s[2], 0, p[0], p[1], p[2], 1]);
}

function normalMatrix({ rz, s }) {
    const c = Math.cos(rz);
    const n = Math.sin(rz);
    return new Float32Array([c / s[0], n / s[0], 0, -n / s[1], c / s[1], 0, 0, 0, 1 / s[2]]);
}

function createProgram(gl) {
    const compile = (type, src) => {
        const sh = gl.createShader(type);
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) return null;
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}

// Stack `count` cubes in a cols x rows grid, layer by layer, sitting on `origin`.
function stackCubes(items, count, color, origin, cols, rows) {
    const size = 0.24;
    const step = 0.28;
    for (let i = 0; i < count; i++) {
        const layer = Math.floor(i / (cols * rows));
        const slot = i % (cols * rows);
        items.push({
            p: [origin[0] + ((slot % cols) - (cols - 1) / 2) * step, origin[1] + size / 2 + layer * step, origin[2] + (Math.floor(slot / cols) - (rows - 1) / 2) * step],
            rz: 0,
            s: [size, size, size],
            color,
        });
    }
}

function buildScene({ a, b, r }, theta) {
    const items = [];
    const add = (p, s, color, rz = 0) => items.push({ p, s, color, rz });
    add([0, -1.36, 0], [7, 0.04, 3.6], GL_COLORS.floor);
    add([0, -1.2, 0], [1.6, 0.28, 1.1], GL_COLORS.pedestal);
    add([0, 0.05, 0], [0.26, 2.5, 0.26], GL_COLORS.pillar);
    add([0, PIVOT_Y, 0], [0.34, 0.34, 0.34], GL_COLORS.pedestal);
    add([0, PIVOT_Y, 0], [2 * ARM + 0.5, 0.12, 0.18], GL_COLORS.beam, theta);

    const anchors = [];
    const pans = [-1, 1].map((side) => {
        const endX = side * ARM * Math.cos(theta);
        const endY = PIVOT_Y + side * ARM * Math.sin(theta);
        const panY = endY - STRING_LEN;
        add([endX, endY, 0], [0.07, 0.07, 1.3], GL_COLORS.string);
        add([endX, endY - STRING_LEN / 2, -0.62], [0.025, STRING_LEN, 0.025], GL_COLORS.string);
        add([endX, endY - STRING_LEN / 2, 0.62], [0.025, STRING_LEN, 0.025], GL_COLORS.string);
        add([endX, panY - 0.04, 0], [1.9, 0.08, 1.45], GL_COLORS.pan);
        anchors.push([endX, endY + 0.45, 0]);
        return [endX, panY];
    });

    const [lx, ly] = pans[0];
    const xCount = Math.abs(a);
    for (let i = 0; i < xCount; i++) add([lx + (i - (xCount - 1) / 2) * 0.4, ly + 0.36, -0.4], [0.3, 0.72, 0.3], GL_COLORS.x);
    stackCubes(items, Math.abs(b), b > 0 ? GL_COLORS.plus : GL_COLORS.minus, [lx, ly, 0.32], 5, 2);
    const [rx, ry] = pans[1];
    stackCubes(items, Math.round(Math.abs(r)), GL_COLORS.right, [rx, ry, 0], 5, 4);
    return { items, anchors };
}

let webglSupportCache = null;
function webglSupported() {
    if (webglSupportCache !== null) return webglSupportCache;
    if (typeof document === 'undefined') return false;
    try {
        const probe = document.createElement('canvas');
        const gl = probe.getContext('webgl') || probe.getContext('experimental-webgl');
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
        webglSupportCache = Boolean(gl);
    } catch {
        webglSupportCache = false;
    }
    return webglSupportCache;
}

const iconBtn = 'w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-sm font-black text-[#0F172A] hover:bg-[#F1F5F9]';

function WebglLinearBalanceCanvas({ value, onUnsupported }) {
    const { a, b, r } = value;
    const canvasRef = useRef(null);
    const leftBadgeRef = useRef(null);
    const rightBadgeRef = useRef(null);
    const stateRef = useRef(value);
    const camRef = useRef({ ...CAM_DEFAULT });
    const tiltRef = useRef({ start: 0, amp: 0 });
    const dirtyRef = useRef(true);
    const dragRef = useRef(null);
    const mountedRef = useRef(false);
    const unsupportedRef = useRef(onUnsupported);
    unsupportedRef.current = onUnsupported;

    // Each inverse-operation step kicks the beam: theta(t) = A * e^(-4t) * sin(12t).
    useEffect(() => {
        stateRef.current = { a, b, r };
        dirtyRef.current = true;
        if (!mountedRef.current) {
            mountedRef.current = true;
            return;
        }
        tiltRef.current = { start: performance.now(), amp: TILT_AMP };
    }, [a, b, r]);

    useEffect(() => {
        const canvas = canvasRef.current;
        let gl = null;
        try {
            gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        } catch {
            gl = null;
        }
        const program = gl && createProgram(gl);
        if (!program) {
            unsupportedRef.current();
            return undefined;
        }

        const geo = cubeGeometry();
        const posBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        gl.bufferData(gl.ARRAY_BUFFER, geo.pos, gl.STATIC_DRAW);
        const aPosition = gl.getAttribLocation(program, 'aPosition');
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        const nrmBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nrmBuf);
        gl.bufferData(gl.ARRAY_BUFFER, geo.nrm, gl.STATIC_DRAW);
        const aNormal = gl.getAttribLocation(program, 'aNormal');
        gl.enableVertexAttribArray(aNormal);
        gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);

        gl.useProgram(program);
        const uMVP = gl.getUniformLocation(program, 'uMVPMatrix');
        const uNormal = gl.getUniformLocation(program, 'uNormalMatrix');
        const uColor = gl.getUniformLocation(program, 'uColor');
        gl.uniform3fv(gl.getUniformLocation(program, 'uLightDir'), LIGHT_DIR);
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0.973, 0.98, 0.988, 1);

        const placeBadge = (el, point, vp) => {
            if (!el) return;
            const [x, y, z] = point;
            const cx = vp[0] * x + vp[4] * y + vp[8] * z + vp[12];
            const cy = vp[1] * x + vp[5] * y + vp[9] * z + vp[13];
            const cw = vp[3] * x + vp[7] * y + vp[11] * z + vp[15];
            const sxp = (cx / cw * 0.5 + 0.5) * canvas.clientWidth;
            const syp = (0.5 - cy / cw * 0.5) * canvas.clientHeight;
            el.style.transform = `translate(${sxp}px, ${syp}px) translate(-50%, -100%)`;
        };

        const draw = (theta) => {
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            const { yaw, pitch, dist } = camRef.current;
            const eye = [
                CAM_TARGET[0] + dist * Math.cos(pitch) * Math.sin(yaw),
                CAM_TARGET[1] + dist * Math.sin(pitch),
                CAM_TARGET[2] + dist * Math.cos(pitch) * Math.cos(yaw),
            ];
            const vp = mat4Mul(perspective(0.8, canvas.width / canvas.height, 0.1, 100), lookAt(eye, CAM_TARGET));
            const { items, anchors } = buildScene(stateRef.current, theta);
            for (const item of items) {
                gl.uniformMatrix4fv(uMVP, false, mat4Mul(vp, modelMatrix(item)));
                gl.uniformMatrix3fv(uNormal, false, normalMatrix(item));
                gl.uniform3fv(uColor, item.color);
                gl.drawArrays(gl.TRIANGLES, 0, 36);
            }
            placeBadge(leftBadgeRef.current, anchors[0], vp);
            placeBadge(rightBadgeRef.current, anchors[1], vp);
        };

        let raf = 0;
        const frame = (now) => {
            raf = requestAnimationFrame(frame);
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
            const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                dirtyRef.current = true;
            }
            const tilt = tiltRef.current;
            const t = (now - tilt.start) / 1000;
            if (tilt.amp !== 0 && t >= TILT_SECONDS) {
                tilt.amp = 0;
                dirtyRef.current = true;
            }
            const animating = tilt.amp !== 0;
            if (!animating && !dirtyRef.current) return;
            dirtyRef.current = false;
            draw(animating ? tilt.amp * Math.exp(-4 * t) * Math.sin(12 * t) : 0);
        };
        raf = requestAnimationFrame(frame);

        const onWheel = (e) => {
            e.preventDefault();
            camRef.current.dist = clamp(camRef.current.dist + e.deltaY * 0.01, DIST_MIN, DIST_MAX);
            dirtyRef.current = true;
        };
        const onContextLost = (e) => {
            e.preventDefault();
            unsupportedRef.current();
        };
        canvas.addEventListener('wheel', onWheel, { passive: false });
        canvas.addEventListener('webglcontextlost', onContextLost);

        return () => {
            cancelAnimationFrame(raf);
            canvas.removeEventListener('wheel', onWheel);
            canvas.removeEventListener('webglcontextlost', onContextLost);
            gl.deleteBuffer(posBuf);
            gl.deleteBuffer(nrmBuf);
            gl.deleteProgram(program);
        };
    }, []);

    const onPointerDown = (e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        dragRef.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e) => {
        if (!dragRef.current) return;
        const cam = camRef.current;
        cam.yaw -= (e.clientX - dragRef.current.x) * 0.008;
        cam.pitch = clamp(cam.pitch + (e.clientY - dragRef.current.y) * 0.006, PITCH_MIN, PITCH_MAX);
        dragRef.current = { x: e.clientX, y: e.clientY };
        dirtyRef.current = true;
    };
    const endDrag = () => {
        dragRef.current = null;
    };
    const zoom = (delta) => {
        camRef.current.dist = clamp(camRef.current.dist + delta, DIST_MIN, DIST_MAX);
        dirtyRef.current = true;
    };
    const resetCamera = () => {
        camRef.current = { ...CAM_DEFAULT };
        dirtyRef.current = true;
    };

    return (
        <div className="space-y-2">
            <div className="relative w-full overflow-hidden border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
                <canvas
                    ref={canvasRef}
                    role="img"
                    aria-label={`Timbangan persamaan linear 3D: ${linearSide(a, b)} = ${r}`}
                    className="block w-full h-64 sm:h-80 touch-none select-none cursor-grab active:cursor-grabbing"
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                />
                <div ref={leftBadgeRef} className="pointer-events-none absolute left-0 top-0 px-2 py-0.5 rounded-lg border border-[#C7D2FE] bg-white text-sm font-extrabold text-[#3730A3] font-math whitespace-nowrap">
                    {linearSide(a, b)}
                </div>
                <div ref={rightBadgeRef} className="pointer-events-none absolute left-0 top-0 px-2 py-0.5 rounded-lg border border-[#A7F3D0] bg-white text-sm font-extrabold text-[#065F46] font-math whitespace-nowrap">
                    {r}
                </div>
                <div className="absolute right-2 top-2 flex gap-1">
                    <button type="button" onClick={() => zoom(-1)} className={iconBtn} aria-label="Zum masuk">+</button>
                    <button type="button" onClick={() => zoom(1)} className={iconBtn} aria-label="Zum keluar">−</button>
                </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold text-[#64748B]">🖱️ Klik & seret kanvas 3D untuk memutar pandangan 360°</p>
                <button type="button" onClick={resetCamera} className="text-xs font-extrabold text-[#2563EB] hover:underline">
                    🔄 Reset Sudut 3D
                </button>
            </div>
            <p className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-[#475569]">
                <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#4F46E5] align-middle" /> x</span>
                <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#F59E0B] align-middle" /> +1</span>
                <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#F43F5E] align-middle" /> -1</span>
                <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#10B981] align-middle" /> 1 (kanan)</span>
            </p>
        </div>
    );
}

// ---------------------------------------------------------------------------
// 2D Mario 8-Bit & Angry Birds Inspired Arcade Balance Scale Engine
// ---------------------------------------------------------------------------

function Arcade2DBalanceScale({ value }) {
    const { a, b, r } = value;
    const prevRef = useRef(value);
    const [animTime, setAnimTime] = useState(0);
    const tiltRef = useRef({ start: 0, amp: 0, dir: 1 });
    const bounceRef = useRef({ start: 0, amp: 0 });
    const projectilesRef = useRef([]);
    const particlesRef = useRef([]);
    const isFirstMount = useRef(true);

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
    const xCount = Math.max(0, Math.min(xVal, 4));
    const bCount = Math.max(0, Math.min(Math.abs(bVal), 10));
    const rCount = Math.max(0, Math.min(Math.round(rVal), 25));

    return (
        <div className="space-y-2">
            <div className="relative w-full overflow-hidden border border-[#E2E8F0] rounded-xl bg-[#E0F2FE]">
                <svg
                    viewBox="0 0 640 330"
                    className="w-full h-auto block select-none"
                    role="img"
                    aria-label={`Timbangan persamaan linear 2D: ${linearSide(a, b)} = ${r}`}
                >
                    {/* Sky & Horizon */}
                    <rect x="0" y="0" width="640" height="330" fill="#E0F2FE" />
                    <line x1="0" y1="270" x2="640" y2="270" stroke="#BAE6FD" strokeWidth="2" />

                    {/* Mario Rolling Hills */}
                    <path d="M-20,270 Q90,195 210,270 Z" fill="#BBF7D0" stroke="#86EFAC" strokeWidth="2" />
                    <path d="M360,270 Q490,190 620,270 Z" fill="#A7F3D0" stroke="#6EE7B7" strokeWidth="2" />

                    {/* 8-Bit Pixel Clouds */}
                    <g opacity="0.95">
                        <rect x="60" y="52" width="68" height="18" rx="4" fill="#FFFFFF" />
                        <rect x="74" y="40" width="40" height="24" rx="4" fill="#FFFFFF" />
                        <rect x="86" y="32" width="20" height="20" rx="3" fill="#FFFFFF" />
                    </g>
                    <g opacity="0.9">
                        <rect x="440" y="70" width="60" height="16" rx="4" fill="#FFFFFF" />
                        <rect x="452" y="58" width="36" height="20" rx="4" fill="#FFFFFF" />
                    </g>
                    <g opacity="0.85">
                        <rect x="250" y="36" width="50" height="14" rx="4" fill="#FFFFFF" />
                        <rect x="260" y="28" width="28" height="16" rx="4" fill="#FFFFFF" />
                    </g>

                    {/* Ground Turf & Soil */}
                    <rect x="0" y="270" width="640" height="10" fill="#22C55E" stroke="#16A34A" strokeWidth="1" />
                    <rect x="0" y="280" width="640" height="50" fill="#B45309" />
                    {/* Brick lines */}
                    <line x1="0" y1="295" x2="640" y2="295" stroke="#78350F" strokeWidth="1" />
                    <line x1="0" y1="310" x2="640" y2="310" stroke="#78350F" strokeWidth="1" />
                    <line x1="0" y1="325" x2="640" y2="325" stroke="#78350F" strokeWidth="1" />
                    <line x1="40" y1="280" x2="40" y2="295" stroke="#78350F" strokeWidth="1" />
                    <line x1="120" y1="280" x2="120" y2="295" stroke="#78350F" strokeWidth="1" />
                    <line x1="200" y1="280" x2="200" y2="295" stroke="#78350F" strokeWidth="1" />
                    <line x1="280" y1="280" x2="280" y2="295" stroke="#78350F" strokeWidth="1" />
                    <line x1="360" y1="280" x2="360" y2="295" stroke="#78350F" strokeWidth="1" />
                    <line x1="440" y1="280" x2="440" y2="295" stroke="#78350F" strokeWidth="1" />
                    <line x1="520" y1="280" x2="520" y2="295" stroke="#78350F" strokeWidth="1" />
                    <line x1="600" y1="280" x2="600" y2="295" stroke="#78350F" strokeWidth="1" />
                    <line x1="80" y1="295" x2="80" y2="310" stroke="#78350F" strokeWidth="1" />
                    <line x1="160" y1="295" x2="160" y2="310" stroke="#78350F" strokeWidth="1" />
                    <line x1="240" y1="295" x2="240" y2="310" stroke="#78350F" strokeWidth="1" />
                    <line x1="320" y1="295" x2="320" y2="310" stroke="#78350F" strokeWidth="1" />
                    <line x1="400" y1="295" x2="400" y2="310" stroke="#78350F" strokeWidth="1" />
                    <line x1="480" y1="295" x2="480" y2="310" stroke="#78350F" strokeWidth="1" />
                    <line x1="560" y1="295" x2="560" y2="310" stroke="#78350F" strokeWidth="1" />

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
                    <rect x={px1 - 72} y={py1} width="144" height="10" rx="3" fill="#92400E" stroke="#78350F" strokeWidth="2" />
                    <rect x={px1 - 72} y={py1 - 6} width="6" height="12" rx="1" fill="#78350F" />
                    <rect x={px1 + 66} y={py1 - 6} width="6" height="12" rx="1" fill="#78350F" />

                    {/* Right Pan Tray */}
                    <rect x={px2 - 72} y={py2} width="144" height="10" rx="3" fill="#92400E" stroke="#78350F" strokeWidth="2" />
                    <rect x={px2 - 72} y={py2 - 6} width="6" height="12" rx="1" fill="#78350F" />
                    <rect x={px2 + 66} y={py2 - 6} width="6" height="12" rx="1" fill="#78350F" />

                    {/* Left Pan Blocks: ?x Mystery Crates */}
                    {Array.from({ length: xCount }).map((_, i) => {
                        const startX = bCount === 0 ? px1 - ((xCount - 1) * 30) / 2 - 13 : px1 - 62 + i * 30;
                        const bx = startX;
                        const by = py1 + bounceY - 32;
                        return (
                            <g key={`x-${i}`} transform={`translate(${bx}, ${by})`}>
                                <rect x="0" y="0" width="26" height="32" rx="3" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
                                <rect x="2" y="2" width="22" height="28" rx="2" fill="none" stroke="#FDE68A" strokeWidth="1" />
                                <circle cx="4" cy="4" r="1.2" fill="#78350F" />
                                <circle cx="22" cy="4" r="1.2" fill="#78350F" />
                                <circle cx="4" cy="28" r="1.2" fill="#78350F" />
                                <circle cx="22" cy="28" r="1.2" fill="#78350F" />
                                <text x="13" y="21" textAnchor="middle" fontSize="16" fontWeight="900" fill="#78350F" className="font-math">x</text>
                                <text x="19" y="11" textAnchor="middle" fontSize="8" fontWeight="900" fill="#92400E">?</text>
                            </g>
                        );
                    })}

                    {/* Left Pan Blocks: Constant b Units */}
                    {Array.from({ length: bCount }).map((_, j) => {
                        const col = j % 3;
                        const row = Math.floor(j / 3);
                        const bx = px1 + 8 + col * 20;
                        const by = py1 + bounceY - 18 - row * 20;
                        return b > 0 ? (
                            <g key={`b-${j}`} transform={`translate(${bx}, ${by})`}>
                                <rect x="0" y="0" width="18" height="18" rx="2" fill="#EA580C" stroke="#9A3412" strokeWidth="1.5" />
                                <line x1="0" y1="9" x2="18" y2="9" stroke="#7C2D12" strokeWidth="1" />
                                <line x1="9" y1="0" x2="9" y2="9" stroke="#7C2D12" strokeWidth="1" />
                                <text x="9" y="13" textAnchor="middle" fontSize="10" fontWeight="900" fill="#FEF08A" className="font-math">+1</text>
                            </g>
                        ) : (
                            <g key={`b-neg-${j}`} transform={`translate(${bx}, ${by})`}>
                                <rect x="0" y="0" width="18" height="18" rx="2" fill="#E11D48" stroke="#881337" strokeWidth="1.5" />
                                <rect x="2" y="2" width="14" height="14" rx="1" fill="#BE123C" />
                                <text x="9" y="13" textAnchor="middle" fontSize="10" fontWeight="900" fill="#FFFFFF" className="font-math">-1</text>
                            </g>
                        );
                    })}

                    {/* Right Pan Blocks: Constant r Units */}
                    {Array.from({ length: rCount }).map((_, k) => {
                        const col = k % 5;
                        const row = Math.floor(k / 5);
                        const bx = px2 - 44 + col * 18;
                        const by = py2 + bounceY - 16 - row * 18;
                        return (
                            <g key={`r-${k}`} transform={`translate(${bx}, ${by})`}>
                                <rect x="0" y="0" width="16" height="16" rx="2" fill="#10B981" stroke="#047857" strokeWidth="1.5" />
                                <circle cx="8" cy="8" r="5" fill="#34D399" stroke="#065F46" strokeWidth="1" />
                                <text x="8" y="11" textAnchor="middle" fontSize="9" fontWeight="900" fill="#FFFFFF" className="font-math">1</text>
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
                    <g transform={`translate(${px1}, ${py1 - 65})`}>
                        <rect x="-44" y="-13" width="88" height="24" rx="8" fill="#FFFFFF" stroke="#C7D2FE" strokeWidth="1.5" />
                        <text x="0" y="3" textAnchor="middle" fontSize="13" fontWeight="900" fill="#3730A3" className="font-math">
                            {linearSide(a, b)}
                        </text>
                    </g>
                    <g transform={`translate(${px2}, ${py2 - 65})`}>
                        <rect x="-34" y="-13" width="68" height="24" rx="8" fill="#FFFFFF" stroke="#A7F3D0" strokeWidth="1.5" />
                        <text x="0" y="3" textAnchor="middle" fontSize="13" fontWeight="900" fill="#065F46" className="font-math">
                            {r}
                        </text>
                    </g>

                    {/* Solved Celebration Ribbon */}
                    {a === 1 && b === 0 && (
                        <g transform="translate(320, 36)">
                            <rect x="-105" y="-14" width="210" height="28" rx="8" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.5" />
                            <text x="0" y="4" textAnchor="middle" fontSize="13" fontWeight="900" fill="#047857" className="font-math">
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
                    className="text-xs font-extrabold text-[#2563EB] hover:underline"
                >
                    💥 Ulang Animasi
                </button>
            </div>
        </div>
    );
}

const pillBase = 'px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors border';
const pillOn = 'bg-white text-[#0F172A] border-[#E2E8F0]';
const pillOff = 'text-[#64748B] border-transparent hover:text-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed';

function BalanceScale({ problem, value, onChange }) {
    const val = (value && typeof value === 'object' && typeof value.a === 'number') ? value : kssmInit(problem);
    const { a, b, r } = val;
    const stepLabel = b > 0 ? `Tolak ${b} pada kedua-dua belah` : `Tambah ${-b} pada kedua-dua belah`;
    const [canWebgl, setCanWebgl] = useState(webglSupported);
    const [mode, setMode] = useState('2d');
    const handleUnsupported = () => {
        webglSupportCache = false;
        setCanWebgl(false);
        setMode('2d');
    };
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#475569]">Timbangan Persamaan Linear</span>
                <div role="group" aria-label="Mod paparan timbangan" className="inline-flex gap-1 p-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                    <button
                        type="button"
                        aria-pressed={mode === '2d'}
                        onClick={() => setMode('2d')}
                        className={`${pillBase} ${mode === '2d' ? pillOn : pillOff}`}
                    >
                        🎮 Mod 2D Arked
                    </button>
                    <button
                        type="button"
                        disabled={!canWebgl}
                        aria-pressed={mode === '3d'}
                        onClick={() => setMode('3d')}
                        className={`${pillBase} ${mode === '3d' ? pillOn : pillOff}`}
                    >
                        🧊 Mod 3D WebGL
                    </button>
                </div>
            </div>
            {mode === '3d' ? (
                <WebglLinearBalanceCanvas value={val} onUnsupported={handleUnsupported} />
            ) : (
                <Arcade2DBalanceScale value={val} />
            )}
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
    const list = Array.isArray(value) ? value : [];
    const toggle = (idx) => onChange(list.includes(idx) ? list.filter((v) => v !== idx) : [...list, idx]);
    return (
        <div className="space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#475569]">Klik mengikut urutan betul</p>
            <div className="grid grid-cols-1 gap-2">
                {problem.shuffle.map((idx) => {
                    const pos = list.indexOf(idx);
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
    const list = Array.isArray(value) ? value : [0, 0, 0, 0, 0];
    const total = bitsValue(list);
    const toggle = (i) => onChange(list.map((bit, j) => (j === i ? 1 - bit : bit)));
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-5 gap-2">
                {BIT_LABELS.map((label, i) => (
                    <button key={label} type="button" onClick={() => toggle(i)} className={`${cardBase} ${list[i] ? cardOn : cardOff} flex flex-col items-center gap-1 !px-1`} aria-pressed={Boolean(list[i])}>
                        <span className="text-[11px]">{label}</span>
                        <span className="text-xl font-black">{list[i]}</span>
                    </button>
                ))}
            </div>
            <div className={`${panel} text-sm font-bold text-[#0F172A] space-y-0.5`}>
                <p>Asas dua: <span className="font-black">{list.join('')}</span>{toSub(2)}</p>
                <p>Kira: {BIT_VALUES.map((v, i) => `${list[i]}×${v}`).join(' + ')} = <span className="font-black">{total}</span>{toSub(10)}</p>
                <p className="text-[#64748B]">Sasaran: {problem.target}{toSub(10)}</p>
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
