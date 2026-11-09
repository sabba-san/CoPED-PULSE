const NON_MATH_WORDS = new Set([
    'antara', 'berikut', 'yang', 'manakah', 'persamaan', 'linear', 'dalam', 'satu', 'pemboleh',
    'ubah', 'selesaikan', 'apakah', 'nilai', 'diberi', 'cari', 'jika', 'ialah', 'atau', 'sahaja',
    'dan', 'bagi', 'fungsi', 'kuadratik', 'graf', 'titik', 'minimum', 'maksimum', 'garis', 'lurus',
    'punca', 'nyata', 'dua', 'sama', 'berbeza', 'tiada', 'tiga', 'nombor', 'asas', 'sepuluh',
    'kedua-dua', 'belah', 'hasil', 'tambah', 'luas', 'perimeter', 'panjang',
    'julat', 'mod', 'median', 'kebarangkalian', 'sudut', 'darjah', 'hipotenus', 'segi', 'set',
    'unsur', 'pelengkap', 'kembangan', 'faktor', 'gandaan', 'hukum', 'indeks', 'logaritma',
    'janjang', 'aritmetik', 'geometri', 'bentuk', 'senyum', 'masam', 'paksi', 'simetri',
    'pintasan-y', 'pintasan-x', 'mengufuk', 'mencancang', 'padu', 'putus-putus', 'lengkung',
    'kedua', 'empat', 'lima', 'enam', 'tujuh', 'lapan', 'sembilan', 'sebutan', 'pertama', 'kaedah',
    'pemfaktoran', 'merupakan', 'ungkapan', 'suatu', 'ditolak', 'menghasilkan', 'dengannya', 'dengan',
    'dua-dua', 'tentukan', 'nyatakan', 'padankan', 'kelaskan', 'setiap', 'susun', 'langkah',
    'sebuah', 'mempunyai', 'sisi', 'baki', 'wang', 'kertas', 'latihan', 'tunjukkan', 'pengiraan'
]);

const MATH_VARS = new Set([
    'x', 'y', 'z', 'a', 'b', 'c', 'd', 'n', 'p', 'q', 'm', 'k', 'r', 't', 'f', 'g', 'i', 'j', 's', 'h',
    'ax', 'bx', 'cx', 'xy', 'fg'
]);

function looksLikeMathToken(token) {
    if (!token) return false;
    const clean = token.replace(/^[({["']+|[)}\],;:?!."']+$/g, '');
    if (!clean) return false;
    const lower = clean.toLowerCase();
    if (NON_MATH_WORDS.has(lower)) return false;
    if (MATH_VARS.has(lower)) return true;
    if (/[=><≥≤+\-×÷/²³⁴⁻¹ˣ√₁₀₂₈%]/.test(clean)) return true;
    if (/^\d+[a-z]+$/i.test(clean)) return true;
    if (/^[fgh](⁻¹)?\([^)]*\)$/i.test(clean)) return true;
    if (/^\d+(\.\d+)?$/.test(clean)) return true;
    return false;
}

function formatMathSegment(mathStr, keyPrefix) {
    const parts = mathStr.split(/(\b[a-zA-Z]\b|(?<=\d)[a-zA-Z]\b|[fgh](?=\()|\b[a-zA-Z](?=[²³⁴]))/g);
    return (
        <span key={keyPrefix} className="font-math tracking-wide text-[#0F172A]">
            {parts.map((p, idx) => {
                if (/^[a-zA-Z]$/.test(p) && !/^[A-D]$/.test(p)) {
                    return (
                        <em key={idx} className="font-math italic not-italic-none">
                            {p}
                        </em>
                    );
                }
                return p;
            })}
        </span>
    );
}

export function renderMathText(text, isSecondaryMath = true) {
    if (!isSecondaryMath || !text || typeof text !== 'string') return text;

    let prefix = '';
    let body = text;
    const prefixMatch = text.match(/^([A-D]\)|\([a-d]\))\s*/i);
    if (prefixMatch) {
        prefix = prefixMatch[0];
        body = text.slice(prefix.length);
    }

    const words = body.split(/(\s+)/);
    const groups = [];
    let curGroup = { type: null, text: '' };

    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (!w) continue;
        if (/^\s+$/.test(w)) {
            if (curGroup.type) curGroup.text += w;
            continue;
        }

        const matchPunct = w.match(/^([({["']*)(.*?)([)}\],;:?!."']*)$/);
        const leadingPunct = matchPunct ? matchPunct[1] : '';
        const core = matchPunct ? matchPunct[2] : w;
        const trailingPunct = matchPunct ? matchPunct[3] : '';

        let isMath = looksLikeMathToken(core);

        if (isMath && /^\d+$/.test(core)) {
            if (curGroup.type !== 'math') {
                let nextCore = '';
                for (let j = i + 1; j < words.length; j++) {
                    if (!/^\s+$/.test(words[j])) {
                        const m = words[j].match(/^([({["']*)(.*?)([)}\],;:?!."']*)$/);
                        nextCore = m ? m[2] : words[j];
                        break;
                    }
                }
                if (!looksLikeMathToken(nextCore) || NON_MATH_WORDS.has(nextCore.toLowerCase()) || /^(cm|m|kg|ml|l|RM|sen)$/i.test(nextCore)) {
                    isMath = false;
                }
            }
        }

        if (/^(cm|cm²|m|kg|ml|l|RM|sen)$/i.test(core)) {
            isMath = false;
        }

        if (isMath) {
            if (curGroup.type === 'math') {
                curGroup.text += (leadingPunct + core);
            } else {
                if (curGroup.type) groups.push(curGroup);
                curGroup = { type: 'math', text: leadingPunct + core };
            }
            if (trailingPunct) {
                if (/^[)}\]]$/.test(trailingPunct)) {
                    curGroup.text += trailingPunct;
                } else {
                    groups.push(curGroup);
                    curGroup = { type: 'text', text: trailingPunct };
                }
            }
        } else {
            if (curGroup.type === 'text') {
                curGroup.text += w;
            } else {
                if (curGroup.type) groups.push(curGroup);
                curGroup = { type: 'text', text: w };
            }
        }
    }
    if (curGroup.type) groups.push(curGroup);

    return (
        <>
            {prefix && <span>{prefix}</span>}
            {groups.map((g, idx) => {
                if (g.type === 'math') {
                    return formatMathSegment(g.text, `math-${idx}`);
                }
                return <span key={`text-${idx}`}>{g.text}</span>;
            })}
        </>
    );
}

export default renderMathText;

