import { useState, useEffect, useMemo } from 'react';

const MANIPULATIVE_MODES = [
    {
        id: 'counting-box',
        shortLabel: '🍎 Kotak Bilang',
        title: 'Nombor Hingga 100: Masukkan Objek ke Dalam Kotak',
        year: 1,
    },
    {
        id: 'place-value',
        shortLabel: '🧱 Blok Puluh & Sa',
        title: 'Nilai Tempat: Bina Nombor & Operasi Tambah/Tolak',
        year: 1,
    },
    {
        id: 'fraction-grid',
        shortLabel: '🍕 Pecahan & Perpuluhan',
        title: 'Pecahan Wajar & Perpuluhan Persepuluh',
        year: 2,
    },
    {
        id: 'money-clock',
        shortLabel: '💵 Wang RM & Jam',
        title: 'Pengiraan Wang RM & Muka Jam Analog',
        year: 2,
    },
    {
        id: 'measurement-metric',
        shortLabel: '🧪 Sukatan Metrik',
        title: 'Sukatan Cecair (l/ml) & Panjang (m/cm)',
        year: 3,
    },
    {
        id: 'polygon-explorer',
        shortLabel: '🔷 Poligon Sekata',
        title: 'Peneroka Bucu & Paksi Simetri Poligon Sekata',
        year: 3,
    },
];

const PROBLEMS_BY_MODE = {
    'counting-box': [
        {
            id: 'cb-1',
            prompt: 'Masukkan 7 biji epal merah ke dalam kotak.',
            target: 7,
            icon: '🍎',
            unitLabel: 'biji epal',
            hint: 'Klik butang [+5] sekali dan [+1] dua kali supaya jumlah epal di dalam kotak menjadi 7.',
        },
        {
            id: 'cb-2',
            prompt: 'Masukkan 13 biji guli (1 kumpulan 10 dan 3 sa) ke dalam kotak.',
            target: 13,
            icon: '🔮',
            unitLabel: 'biji guli',
            hint: '13 ialah 1 puluh dan 3 sa. Klik [+10 (1 Puluh)] sekali dan [+1] tiga kali.',
        },
        {
            id: 'cb-3',
            prompt: 'Masukkan 16 ekor rama-rama ke dalam kotak.',
            target: 16,
            icon: '🦋',
            unitLabel: 'ekor rama-rama',
            hint: '16 terdiri daripada 10 dan 6. Gunakan [+10], [+5], dan [+1] untuk mendapat 16.',
        },
        {
            id: 'cb-4',
            prompt: 'Masukkan 20 biji buah oren (2 kumpulan sepuluh) ke dalam kotak.',
            target: 20,
            icon: '🍊',
            unitLabel: 'biji oren',
            hint: '20 ialah 2 puluh dan 0 sa. Klik [+10 (1 Puluh)] sebanyak dua kali.',
        },
        {
            id: 'cb-5',
            prompt: 'Masukkan 24 ketul kiub matematik ke dalam kotak.',
            target: 24,
            icon: '🟦',
            unitLabel: 'ketul kiub',
            hint: '24 mempunyai 2 kumpulan 10 (20) dan 4 unit sa.',
        },
    ],
    'place-value': [
        {
            id: 'pv-1',
            prompt: 'Bina nombor 34 menggunakan blok Puluh (10) dan blok Sa (1).',
            target: 34,
            hint: 'Nombor 34 mempunyai 3 blok Puluh (nilai digit 30) dan 4 blok Sa (nilai digit 4).',
        },
        {
            id: 'pv-2',
            prompt: 'Bina nombor 58 menggunakan blok Puluh (10) dan blok Sa (1).',
            target: 58,
            hint: 'Dalam nombor 58, angka 5 berada di nilai tempat Puluh (50) dan 8 di nilai tempat Sa (8).',
        },
        {
            id: 'pv-3',
            prompt: 'Tambah Mudah: Selesaikan 25 + 13 dan bina jawapannya dengan blok Puluh & Sa.',
            target: 38,
            hint: 'Tambah Sa: 5 + 3 = 8 sa. Tambah Puluh: 2 + 1 = 3 puluh. Jawapannya ialah 38.',
        },
        {
            id: 'pv-4',
            prompt: 'Tambah Mengumpul Semula: Kira 18 + 34 dan bina jumlahnya dengan blok Puluh & Sa.',
            target: 52,
            hint: '8 sa + 4 sa = 12 sa (tukar 10 sa kepada 1 puluh, tinggal 2 sa). 1 + 1 + 3 = 5 puluh. Jumlah = 52.',
        },
        {
            id: 'pv-5',
            prompt: 'Bundarkan nombor 65 kepada puluh yang terdekat dan bina dengan blok Puluh.',
            target: 70,
            hint: 'Digit sa bagi 65 ialah 5, maka tambah 1 pada Puluh menjadi 70 (7 blok Puluh, 0 blok Sa).',
        },
    ],
    'fraction-grid': [
        {
            id: 'fg-1',
            prompt: 'Klik petak untuk warnakan pecahan wajar 4/9 (4 daripada 9 bahagian sama besar).',
            total: 9,
            target: 4,
            isDecimal: false,
            color: '#2563EB',
            hint: 'Pengangka ialah 4 dan penyebut ialah 9. Klik tepat 4 petak daripada 9 petak.',
        },
        {
            id: 'fg-2',
            prompt: 'Tukar pecahan 7/10 kepada perpuluhan dengan mewarnakan 0.7 pada jalur persepuluh.',
            total: 10,
            target: 7,
            isDecimal: true,
            color: '#059669',
            hint: '0.7 bersamaan 7 persepuluh (7/10). Warnakan 7 daripada 10 petak.',
        },
        {
            id: 'fg-3',
            prompt: 'Warnakan 3/8 daripada bahagian kek coklat di bawah.',
            total: 8,
            target: 3,
            isDecimal: false,
            color: '#D97706',
            hint: 'Pecahan 3/8 bermaksud 3 bahagian berwarna daripada 8 bahagian kesemuanya.',
        },
        {
            id: 'fg-4',
            prompt: 'Warnakan nilai perpuluhan 0.4 pada jalur persepuluh ini.',
            total: 10,
            target: 4,
            isDecimal: true,
            color: '#7C3AED',
            hint: 'Sifar perpuluhan empat (0.4) ialah 4 bahagian daripada 10 bahagian sama besar.',
        },
        {
            id: 'fg-5',
            prompt: 'Warnakan pecahan wajar 5/6 pada petak rajah di bawah.',
            total: 6,
            target: 5,
            isDecimal: false,
            color: '#2563EB',
            hint: 'Klik 5 petak supaya hanya tinggal 1 petak putih daripada 6 petak.',
        },
    ],
    'money-clock': [
        {
            id: 'mc-1',
            subType: 'money',
            itemTitle: '🎂 Kek Hari Jadi Istimewa',
            prompt: 'Klik wang kertas dan syiling untuk membayar harga Kek Hari Jadi berjumlah RM37.50.',
            targetCents: 3750,
            hint: 'Gunakan RM20 + RM10 + RM5 + RM1 + RM1 (= RM37) dan syiling 50 sen (= RM37.50).',
        },
        {
            id: 'mc-2',
            subType: 'money',
            itemTitle: '👛 Baki Wang Siti (Buku Teks Tahun 2)',
            prompt: 'Siti ada RM90. Dia beli kek RM54.60 dan hadiah RM27. Masukkan baki wang Siti (RM8.40) ke dalam dulang.',
            targetCents: 840,
            hint: 'RM90.00 - RM54.60 = RM35.40. Kemudian RM35.40 - RM27.00 = RM8.40 (RM5 + RM1x3 + 20 sen x 2).',
        },
        {
            id: 'mc-3',
            subType: 'money',
            itemTitle: '🎒 Set Alat Tulis & Buku Cerita',
            prompt: 'Masukkan wang yang tepat untuk membayar RM24.80.',
            targetCents: 2480,
            hint: 'Pilih RM20 + RM1x4 (= RM24) serta syiling 50 sen + 20 sen + 10 sen (= 80 sen).',
        },
        {
            id: 'mc-4',
            subType: 'clock',
            prompt: 'Gerakkan jarum minit ke Pukul 5:15 (Suku Jam = 15 Minit).',
            hour: 5,
            targetMinutes: 15,
            hint: 'Setiap nombor pada muka jam ialah gandaan 5 minit. Suku jam (15 minit) menunjuk tepat ke nombor 3.',
        },
        {
            id: 'mc-5',
            subType: 'clock',
            prompt: 'Gerakkan jarum minit setengah pusingan dari 12 ke 6 untuk menunjukkan Pukul 8:30 (Setengah Jam).',
            hour: 8,
            targetMinutes: 30,
            hint: 'Setengah pusingan muka jam ialah 30 minit (nombor 6 pada muka jam).',
        },
    ],
    'measurement-metric': [
        {
            id: 'mm-1',
            prompt: 'Tuangkan air ke dalam bikar penyukat sehingga mencapai 2 l 400 ml (2,400 ml).',
            targetVal: 2400,
            unit: 'ml',
            maxVal: 4000,
            hint: 'Formula Buku Teks Tahun 3: 1 liter (l) = 1,000 mililiter (ml). Maka 2 l 400 ml = 2,000 ml + 400 ml = 2,400 ml.',
        },
        {
            id: 'mm-2',
            prompt: 'Sukatkan 1 l 700 ml (1,700 ml) cecair menggunakan jag penyukat.',
            targetVal: 1700,
            unit: 'ml',
            maxVal: 4000,
            hint: 'Tuangkan +1 Liter (1,000 ml), diikuti +500 ml, dan dua kali +100 ml untuk mendapat 1,700 ml.',
        },
        {
            id: 'mm-3',
            prompt: 'Tukarkan ukuran panjang 9 m 20 cm kepada unit sentimeter (cm) pada pita ukuran.',
            targetVal: 920,
            unit: 'cm',
            maxVal: 1200,
            hint: '1 meter (m) = 100 sentimeter (cm). Maka 9 m = 900 cm. Campurkan 900 cm + 20 cm = 920 cm.',
        },
        {
            id: 'mm-4',
            prompt: 'Kira pertukaran ukuran panjang: 3 m 50 cm = ___ cm.',
            targetVal: 350,
            unit: 'cm',
            maxVal: 1200,
            hint: '3 m bersamaan 300 cm. Tambah lagi 50 cm menjadi 350 cm pada pita ukuran.',
        },
        {
            id: 'mm-5',
            prompt: 'Sukatkan 3 l 200 ml (3,200 ml) cecair kordial pada bikar penyukat.',
            targetVal: 3200,
            unit: 'ml',
            maxVal: 4000,
            hint: '3 liter = 3,000 ml. Tambahkan 3,000 ml dengan 200 ml untuk mencapai 3,200 ml.',
        },
    ],
    'polygon-explorer': [
        {
            id: 'pe-1',
            shapeName: 'Pentagon Sekata',
            sides: 5,
            prompt: 'Klik dan nyalakan kesemua 5 bucu pada Pentagon Sekata ini untuk mengesahkan sifat poligon.',
            hint: 'Pentagon sekata mempunyai 5 sisi lurus yang sama panjang dan 5 bucu. Klik kelima-lima bulatan bucu pada rajah.',
        },
        {
            id: 'pe-2',
            shapeName: 'Heksagon Sekata',
            sides: 6,
            prompt: 'Klik dan nyalakan kesemua 6 bucu pada Heksagon Sekata (6 sisi lurus sama panjang).',
            hint: 'Heksagon sekata mempunyai 6 bucu dan 6 sisi lurus sama panjang. Klik kesemua 6 titik bucu.',
        },
        {
            id: 'pe-3',
            shapeName: 'Heptagon Sekata',
            sides: 7,
            prompt: 'Klik dan nyalakan kesemua 7 bucu pada Heptagon Sekata (7 sisi lurus sama panjang).',
            hint: 'Heptagon sekata mempunyai 7 bucu dan 7 sisi lurus. Klik kesemua 7 bulatan bucu.',
        },
        {
            id: 'pe-4',
            shapeName: 'Oktagon Sekata',
            sides: 8,
            prompt: 'Klik dan nyalakan kesemua 8 bucu pada Oktagon Sekata (8 sisi lurus sama panjang).',
            hint: 'Oktagon sekata mempunyai 8 bucu dan 8 sisi lurus yang sama panjang. Klik kesemua 8 titik bucu.',
        },
        {
            id: 'pe-5',
            shapeName: 'Segi Tiga Sama Sisi',
            sides: 3,
            prompt: 'Klik dan nyalakan kesemua 3 bucu pada Segi Tiga Sama Sisi (3 sisi lurus dan 3 bucu).',
            hint: 'Segi tiga sama sisi mempunyai 3 sisi sama panjang dan 3 bucu. Klik kesemua 3 bucu.',
        },
    ],
};

function getDefaultModeForCourse(year, moduleIdx) {
    if (year === 1) {
        return moduleIdx === 0 ? 'counting-box' : 'place-value';
    }
    if (year === 2) {
        return moduleIdx === 0 ? 'fraction-grid' : 'money-clock';
    }
    return moduleIdx === 0 ? 'measurement-metric' : 'polygon-explorer';
}

export default function MathPlayground({
    yearLevel = 1,
    moduleIndex = 0,
    onEarnXp = null,
    onCompleteStep = null,
}) {
    const currentYear = Number(yearLevel) || 1;
    const availableModes = useMemo(() => {
        const list = MANIPULATIVE_MODES.filter((m) => m.year === currentYear);
        return list.length > 0 ? list : MANIPULATIVE_MODES.filter((m) => m.year === 1);
    }, [currentYear]);

    const [activeMode, setActiveMode] = useState(() => getDefaultModeForCourse(currentYear, moduleIndex));
    const [problemIdx, setProblemIdx] = useState(0);
    const [completedByMode, setCompletedByMode] = useState({});
    const [showHint, setShowHint] = useState(false);
    const [checkStatus, setCheckStatus] = useState(null); // null | 'correct' | 'wrong'
    const [celebrationPopup, setCelebrationPopup] = useState(null);

    // Manipulative interactive states
    const [boxCount, setBoxCount] = useState(0);
    const [tensCount, setTensCount] = useState(0);
    const [onesCount, setOnesCount] = useState(0);
    const [shadedIndices, setShadedIndices] = useState([]);
    const [moneyTray, setMoneyTray] = useState([]); // array of { label, cents }
    const [clockMinutes, setClockMinutes] = useState(0);
    const [measureValue, setMeasureValue] = useState(0);
    const [litVertices, setLitVertices] = useState([]);
    const [showSymmetryAxis, setShowSymmetryAxis] = useState(true);

    useEffect(() => {
        const nextMode = getDefaultModeForCourse(currentYear, moduleIndex);
        setActiveMode(nextMode);
        setProblemIdx(0);
    }, [currentYear, moduleIndex]);

    useEffect(() => {
        if (!availableModes.some((m) => m.id === activeMode)) {
            setActiveMode(availableModes[0]?.id || 'counting-box');
            setProblemIdx(0);
        }
    }, [availableModes, activeMode]);

    const problems = PROBLEMS_BY_MODE[activeMode] || PROBLEMS_BY_MODE[availableModes[0]?.id] || [];
    const currentProblem = problems[problemIdx] || problems[0] || {};

    // Reset manipulative canvas when problem or mode changes
    useEffect(() => {
        setBoxCount(0);
        setTensCount(0);
        setOnesCount(0);
        setShadedIndices([]);
        setMoneyTray([]);
        setClockMinutes(0);
        setMeasureValue(0);
        setLitVertices([]);
        setCheckStatus(null);
        setShowHint(false);
    }, [activeMode, problemIdx]);

    const modeCompletedSet = useMemo(() => {
        return new Set(completedByMode[activeMode] || []);
    }, [completedByMode, activeMode]);

    const moneyTotalCents = useMemo(() => {
        return moneyTray.reduce((acc, item) => acc + item.cents, 0);
    }, [moneyTray]);

    const isCurrentProblemCorrect = () => {
        if (activeMode === 'counting-box') {
            return boxCount === currentProblem.target;
        }
        if (activeMode === 'place-value') {
            return tensCount * 10 + onesCount === currentProblem.target;
        }
        if (activeMode === 'fraction-grid') {
            return shadedIndices.length === currentProblem.target;
        }
        if (activeMode === 'money-clock') {
            if (currentProblem.subType === 'money') {
                return moneyTotalCents === currentProblem.targetCents;
            }
            return clockMinutes === currentProblem.targetMinutes;
        }
        if (activeMode === 'measurement-metric') {
            return measureValue === currentProblem.targetVal;
        }
        if (activeMode === 'polygon-explorer') {
            return litVertices.length === currentProblem.sides;
        }
        return false;
    };

    const handleCheckAnswer = () => {
        if (isCurrentProblemCorrect()) {
            setCheckStatus('correct');
            const alreadyDone = modeCompletedSet.has(currentProblem.id);
            if (!alreadyDone) {
                setCompletedByMode((prev) => ({
                    ...prev,
                    [activeMode]: [...(prev[activeMode] || []), currentProblem.id],
                }));
                if (onEarnXp) {
                    onEarnXp(20, 'Aktiviti Interaktif Tepat! (+20 XP)');
                }
            }
            setCelebrationPopup({
                title: 'Syabas! Jawapan Tepat! (+20 XP)',
                sub:
                    problemIdx < problems.length - 1
                        ? 'Teruskan ke aktiviti seterusnya.'
                        : 'Anda telah menguasai kesemua 5 aktiviti dalam kemahiran ini!',
            });
        } else {
            setCheckStatus('wrong');
            setCelebrationPopup(null);
        }
    };

    const handleNextProblem = () => {
        setCelebrationPopup(null);
        setCheckStatus(null);
        if (problemIdx < problems.length - 1) {
            setProblemIdx((prev) => prev + 1);
        } else if (onCompleteStep) {
            onCompleteStep();
        }
    };

    const fillCorrectAnswerDemo = () => {
        setCheckStatus(null);
        if (activeMode === 'counting-box') {
            setBoxCount(currentProblem.target);
        } else if (activeMode === 'place-value') {
            setTensCount(Math.floor(currentProblem.target / 10));
            setOnesCount(currentProblem.target % 10);
        } else if (activeMode === 'fraction-grid') {
            setShadedIndices(Array.from({ length: currentProblem.target }, (_, i) => i));
        } else if (activeMode === 'money-clock') {
            if (currentProblem.subType === 'money') {
                const notes = [
                    { label: 'RM50', cents: 5000, bg: 'bg-[#0D9488] text-white' },
                    { label: 'RM20', cents: 2000, bg: 'bg-[#F59E0B] text-[#111827]' },
                    { label: 'RM10', cents: 1000, bg: 'bg-[#EF4444] text-white' },
                    { label: 'RM5', cents: 500, bg: 'bg-[#10B981] text-white' },
                    { label: 'RM1', cents: 100, bg: 'bg-[#2563EB] text-white' },
                    { label: '50 sen', cents: 50, bg: 'bg-[#FDE047] text-[#111827]' },
                    { label: '20 sen', cents: 20, bg: 'bg-[#FDE047] text-[#111827]' },
                    { label: '10 sen', cents: 10, bg: 'bg-[#E2E8F0] text-[#111827]' },
                ];
                let rem = currentProblem.targetCents;
                const picked = [];
                notes.forEach((n) => {
                    while (rem >= n.cents) {
                        picked.push(n);
                        rem -= n.cents;
                    }
                });
                setMoneyTray(picked);
            } else {
                setClockMinutes(currentProblem.targetMinutes);
            }
        } else if (activeMode === 'measurement-metric') {
            setMeasureValue(currentProblem.targetVal);
        } else if (activeMode === 'polygon-explorer') {
            setLitVertices(Array.from({ length: currentProblem.sides }, (_, i) => i));
        }
    };

    // Polygon SVG coordinates helper
    const polygonPoints = useMemo(() => {
        const sides = currentProblem?.sides || 5;
        const cx = 130;
        const cy = 115;
        const r = 82;
        return Array.from({ length: sides }, (_, idx) => {
            const angle = (idx * 2 * Math.PI) / sides - Math.PI / 2;
            return {
                x: Math.round(cx + r * Math.cos(angle)),
                y: Math.round(cy + r * Math.sin(angle)),
            };
        });
    }, [currentProblem?.sides]);

    return (
        <div className="relative bg-white border border-[#E2E8F0] rounded-xl overflow-hidden flex flex-col justify-between">
            {/* Top Manipulative Selector & Header - ONLY shows activities for current standard */}
            <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-xs font-black uppercase tracking-wider mr-1">
                        Tahun {currentYear}
                    </span>
                    {availableModes.map((m) => {
                        const isSelected = activeMode === m.id;
                        return (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                    setActiveMode(m.id);
                                    setProblemIdx(0);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors border ${
                                    isSelected
                                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                                        : 'bg-white text-[#334155] border-[#CBD5E1] hover:bg-[#F1F5F9]'
                                }`}
                            >
                                {m.shortLabel}
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    onClick={fillCorrectAnswerDemo}
                    className="px-2.5 py-1 rounded-lg bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border border-[#FCD34D] text-[11px] font-extrabold transition-colors shrink-0"
                    title="Isi jawapan contoh secara automatik untuk demonstrasi"
                >
                    ⚡ Auto-Isi Jawapan (Demo)
                </button>
            </div>

            {/* Main Interactive Stage (Fits cleanly in 1 viewport) */}
            <div className="p-4 sm:p-6 space-y-4">
                {/* Question Prompt Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-[11px] font-extrabold uppercase tracking-wider">
                                Aktiviti {problemIdx + 1} daripada {problems.length}
                            </span>
                            {modeCompletedSet.has(currentProblem.id) && (
                                <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] text-[11px] font-extrabold">
                                    ✓ Selesai (+20 XP)
                                </span>
                            )}
                        </div>
                        <h3 className="font-display font-extrabold text-base sm:text-xl text-[#0F172A] leading-snug">
                            {currentProblem.prompt}
                        </h3>
                    </div>
                </div>

                {/* MANIPULATIVE 1: KHAN ACADEMY COUNTING BOX (TAHUN 1) */}
                {activeMode === 'counting-box' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        {/* Left: Object Supply Buttons */}
                        <div className="lg:col-span-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
                            <p className="text-xs font-extrabold uppercase tracking-wider text-[#475569]">
                                1. Klik untuk Masukkan {currentProblem.unitLabel}:
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setBoxCount((c) => Math.min(50, c + 1));
                                        setCheckStatus(null);
                                    }}
                                    className="p-3 rounded-xl bg-white hover:bg-[#EFF6FF] border border-[#CBD5E1] hover:border-[#2563EB] flex flex-col items-center gap-1 transition-transform active:scale-95"
                                >
                                    <span className="text-2xl">{currentProblem.icon}</span>
                                    <span className="text-xs font-extrabold text-[#0F172A]">+1 {currentProblem.unitLabel}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setBoxCount((c) => Math.min(50, c + 5));
                                        setCheckStatus(null);
                                    }}
                                    className="p-3 rounded-xl bg-white hover:bg-[#EFF6FF] border border-[#CBD5E1] hover:border-[#2563EB] flex flex-col items-center gap-1 transition-transform active:scale-95"
                                >
                                    <span className="text-2xl">{currentProblem.icon}{currentProblem.icon}</span>
                                    <span className="text-xs font-extrabold text-[#2563EB]">+5 Sekaligus</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setBoxCount((c) => Math.min(50, c + 10));
                                        setCheckStatus(null);
                                    }}
                                    className="col-span-2 p-2.5 rounded-xl bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#F59E0B] flex items-center justify-center gap-2 transition-transform active:scale-95"
                                >
                                    <span className="text-lg">📦</span>
                                    <span className="text-xs sm:text-sm font-extrabold text-[#92400E]">
                                        +10 (Tambah 1 Kumpulan Puluh)
                                    </span>
                                </button>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <button
                                    type="button"
                                    disabled={boxCount === 0}
                                    onClick={() => {
                                        setBoxCount((c) => Math.max(0, c - 1));
                                        setCheckStatus(null);
                                    }}
                                    className="flex-1 py-2 px-3 rounded-lg bg-white border border-[#CBD5E1] text-xs font-bold text-[#334155] hover:bg-gray-50 disabled:opacity-40"
                                >
                                    -1 Keluarkan
                                </button>
                                <button
                                    type="button"
                                    disabled={boxCount === 0}
                                    onClick={() => {
                                        setBoxCount(0);
                                        setCheckStatus(null);
                                    }}
                                    className="py-2 px-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-40"
                                >
                                    Kosongkan
                                </button>
                            </div>
                        </div>

                        {/* Right: Target Counting Box */}
                        <div className="lg:col-span-8 bg-[#FFFBEB] border border-[#FCD34D] rounded-xl p-4 min-h-[210px] flex flex-col justify-between">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#FDE68A]">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-[#92400E]">
                                    📥 Kotak Sasaran Murid (Klik objek untuk keluarkan):
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-full bg-white border border-[#F59E0B] text-xs sm:text-sm font-black text-[#0F172A]">
                                        Jumlah: {boxCount} ({Math.floor(boxCount / 10)} puluh {boxCount % 10} sa)
                                    </span>
                                </div>
                            </div>

                            {boxCount === 0 ? (
                                <div className="my-auto py-8 text-center text-sm font-bold text-[#92400E]/70">
                                    Kotak masih kosong (0). Klik butang di sebelah kiri untuk memasukkan {currentProblem.unitLabel}!
                                </div>
                            ) : (
                                <div className="py-3 space-y-2">
                                    {/* Group by 10s so Year 1 kids clearly see Puluh & Sa */}
                                    {Array.from({ length: Math.ceil(boxCount / 10) }, (_, rowIdx) => {
                                        const countInRow = Math.min(10, boxCount - rowIdx * 10);
                                        const isFullTen = countInRow === 10;
                                        return (
                                            <div
                                                key={rowIdx}
                                                className={`p-2 rounded-lg border flex flex-wrap items-center gap-1.5 ${
                                                    isFullTen
                                                        ? 'bg-[#FEF3C7] border-[#F59E0B]'
                                                        : 'bg-white border-[#E2E8F0]'
                                                }`}
                                            >
                                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white border border-[#CBD5E1] text-[#334155] mr-1">
                                                    {isFullTen ? '1 Puluh (10)' : `${countInRow} Sa`}
                                                </span>
                                                {Array.from({ length: countInRow }, (__, itemIdx) => (
                                                    <button
                                                        key={itemIdx}
                                                        type="button"
                                                        onClick={() => {
                                                            setBoxCount((c) => Math.max(0, c - 1));
                                                            setCheckStatus(null);
                                                        }}
                                                        title="Klik untuk keluarkan 1"
                                                        className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] hover:border-rose-400 flex items-center justify-center text-lg transition-transform hover:scale-105"
                                                    >
                                                        {currentProblem.icon}
                                                    </button>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* MANIPULATIVE 2: MATHIGON PLACE VALUE BLOCKS (PULUH & SA) */}
                {activeMode === 'place-value' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Column 1: Rumah Puluh (10) */}
                            <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-black uppercase tracking-wider text-[#C2410C] block">
                                            Rumah Nilai Tempat: PULUH (10)
                                        </span>
                                        <span className="text-lg font-black text-[#0F172A]">
                                            {tensCount} Puluh = {tensCount * 10}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            disabled={tensCount === 0}
                                            onClick={() => {
                                                setTensCount((t) => Math.max(0, t - 1));
                                                setCheckStatus(null);
                                            }}
                                            className="px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-xs font-extrabold text-[#0F172A] disabled:opacity-40"
                                        >
                                            -1 Puluh
                                        </button>
                                        <button
                                            type="button"
                                            disabled={tensCount >= 9}
                                            onClick={() => {
                                                setTensCount((t) => Math.min(9, t + 1));
                                                setCheckStatus(null);
                                            }}
                                            className="px-3 py-1.5 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-extrabold transition-colors"
                                        >
                                            +1 Blok Puluh (10)
                                        </button>
                                    </div>
                                </div>

                                <div className="min-h-[120px] p-3 rounded-lg bg-white border border-[#FFEDD5] flex flex-wrap items-end gap-2">
                                    {tensCount === 0 ? (
                                        <span className="text-xs font-semibold text-gray-400 m-auto">
                                            Tiada blok Puluh (0). Klik [+1 Blok Puluh (10)] di atas.
                                        </span>
                                    ) : (
                                        Array.from({ length: tensCount }, (_, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    setTensCount((t) => Math.max(0, t - 1));
                                                    setCheckStatus(null);
                                                }}
                                                title="Klik untuk keluarkan 1 blok Puluh"
                                                className="cursor-pointer flex flex-col border border-[#C2410C] rounded overflow-hidden hover:opacity-80"
                                            >
                                                {Array.from({ length: 10 }, (__, seg) => (
                                                    <div
                                                        key={seg}
                                                        className="w-6 h-2.5 bg-[#FB923C] border-b border-[#C2410C] last:border-b-0"
                                                    />
                                                ))}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Column 2: Rumah Sa (1) */}
                            <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-black uppercase tracking-wider text-[#15803D] block">
                                            Rumah Nilai Tempat: SA (1)
                                        </span>
                                        <span className="text-lg font-black text-[#0F172A]">
                                            {onesCount} Sa = {onesCount}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            disabled={onesCount === 0}
                                            onClick={() => {
                                                setOnesCount((o) => Math.max(0, o - 1));
                                                setCheckStatus(null);
                                            }}
                                            className="px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-xs font-extrabold text-[#0F172A] disabled:opacity-40"
                                        >
                                            -1 Sa
                                        </button>
                                        <button
                                            type="button"
                                            disabled={onesCount >= 9}
                                            onClick={() => {
                                                setOnesCount((o) => Math.min(9, o + 1));
                                                setCheckStatus(null);
                                            }}
                                            className="px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-extrabold transition-colors"
                                        >
                                            +1 Blok Sa (1)
                                        </button>
                                    </div>
                                </div>

                                <div className="min-h-[120px] p-3 rounded-lg bg-white border border-[#DCFCE7] flex flex-wrap items-center content-center gap-2">
                                    {onesCount === 0 ? (
                                        <span className="text-xs font-semibold text-gray-400 m-auto">
                                            Tiada blok Sa (0). Klik [+1 Blok Sa (1)] di atas.
                                        </span>
                                    ) : (
                                        Array.from({ length: onesCount }, (_, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => {
                                                    setOnesCount((o) => Math.max(0, o - 1));
                                                    setCheckStatus(null);
                                                }}
                                                title="Klik untuk keluarkan 1 blok Sa"
                                                className="w-8 h-8 rounded bg-[#22C55E] border border-[#15803D] text-white text-xs font-black flex items-center justify-center hover:opacity-80"
                                            >
                                                1
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Live Equation Summary Bar */}
                        <div className="px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs sm:text-sm font-bold text-[#475569]">
                                Nilai Nombor Yang Dibina:
                            </span>
                            <span className="text-base sm:text-xl font-black text-[#0F172A]">
                                {tensCount} Puluh ({tensCount * 10}) + {onesCount} Sa ({onesCount}) ={' '}
                                <span className="px-3 py-1 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                                    {tensCount * 10 + onesCount}
                                </span>
                            </span>
                        </div>
                    </div>
                )}

                {/* MANIPULATIVE 3: INTERACTIVE FRACTION & DECIMAL BAR (TAHUN 2) */}
                {activeMode === 'fraction-grid' && (
                    <div className="space-y-4">
                        <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-[#475569]">
                                    Klik petak di bawah untuk warnakan atau nyahwarna bahagian:
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-lg bg-white border border-[#CBD5E1] text-sm font-black text-[#0F172A]">
                                        Pecahan: {shadedIndices.length} / {currentProblem.total}
                                    </span>
                                    {currentProblem.total === 10 && (
                                        <span className="px-3 py-1 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-sm font-black text-[#047857]">
                                            Perpuluhan: {(shadedIndices.length / 10).toFixed(1)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Interactive Fraction / Decimal Strip */}
                            <div
                                className="grid gap-2"
                                style={{
                                    gridTemplateColumns: `repeat(${currentProblem.total}, minmax(0, 1fr))`,
                                }}
                            >
                                {Array.from({ length: currentProblem.total }, (_, idx) => {
                                    const isShaded = shadedIndices.includes(idx);
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                setCheckStatus(null);
                                                setShadedIndices((prev) =>
                                                    prev.includes(idx)
                                                        ? prev.filter((i) => i !== idx)
                                                        : [...prev, idx]
                                                );
                                            }}
                                            style={{
                                                backgroundColor: isShaded ? currentProblem.color : '#FFFFFF',
                                            }}
                                            className={`h-20 sm:h-24 rounded-xl border transition-transform active:scale-95 flex flex-col items-center justify-center gap-1 ${
                                                isShaded
                                                    ? 'text-white border-[#0F172A]'
                                                    : 'text-[#64748B] border-[#CBD5E1] hover:border-[#2563EB]'
                                            }`}
                                        >
                                            <span className="text-xs sm:text-sm font-black">
                                                1/{currentProblem.total}
                                            </span>
                                            {currentProblem.total === 10 && (
                                                <span className="text-[10px] font-bold opacity-85">0.1</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCheckStatus(null);
                                            if (shadedIndices.length < currentProblem.total) {
                                                const nextIdx = Array.from(
                                                    { length: currentProblem.total },
                                                    (_, i) => i
                                                ).find((i) => !shadedIndices.includes(i));
                                                if (nextIdx !== undefined) {
                                                    setShadedIndices((prev) => [...prev, nextIdx]);
                                                }
                                            }
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-extrabold"
                                    >
                                        + Warnakan 1 Bahagian
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCheckStatus(null);
                                            setShadedIndices((prev) => prev.slice(0, -1));
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-xs font-bold text-[#334155]"
                                    >
                                        - Kurangkan 1
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCheckStatus(null);
                                        setShadedIndices([]);
                                    }}
                                    className="text-xs font-bold text-rose-600 hover:underline"
                                >
                                    Padam Semua Warna
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MANIPULATIVE 4: MONEY RM TRAY & ANALOG CLOCK (TAHUN 2) */}
                {activeMode === 'money-clock' && (
                    <div>
                        {currentProblem.subType === 'money' ? (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                                {/* Left: Malaysian Banknotes & Coins */}
                                <div className="lg:col-span-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
                                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#475569] block">
                                        Klik Wang Kertas & Syiling Malaysia untuk Membayar:
                                    </span>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {[
                                            { label: 'RM50', cents: 5000, bg: 'bg-[#0D9488] text-white' },
                                            { label: 'RM20', cents: 2000, bg: 'bg-[#F59E0B] text-[#111827]' },
                                            { label: 'RM10', cents: 1000, bg: 'bg-[#EF4444] text-white' },
                                            { label: 'RM5', cents: 500, bg: 'bg-[#10B981] text-white' },
                                            { label: 'RM1', cents: 100, bg: 'bg-[#2563EB] text-white' },
                                            { label: '50 sen', cents: 50, bg: 'bg-[#FDE047] text-[#111827]' },
                                            { label: '20 sen', cents: 20, bg: 'bg-[#FDE047] text-[#111827]' },
                                            { label: '10 sen', cents: 10, bg: 'bg-[#E2E8F0] text-[#111827]' },
                                        ].map((note) => (
                                            <button
                                                key={note.label}
                                                type="button"
                                                onClick={() => {
                                                    setCheckStatus(null);
                                                    setMoneyTray((prev) => [...prev, note]);
                                                }}
                                                className={`py-2.5 px-2 rounded-lg border border-[#0F172A]/20 font-black text-xs sm:text-sm transition-transform active:scale-95 ${note.bg}`}
                                            >
                                                + {note.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-[11px] font-semibold text-gray-500">
                                            Klik mana-mana wang di dalam dulang untuk keluarkan.
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCheckStatus(null);
                                                setMoneyTray([]);
                                            }}
                                            className="text-xs font-bold text-rose-600 hover:underline"
                                        >
                                            Kosongkan Dulang
                                        </button>
                                    </div>
                                </div>

                                {/* Right: Payment Tray */}
                                <div className="lg:col-span-6 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-4 flex flex-col justify-between space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#A7F3D0]">
                                        <span className="text-xs font-extrabold text-[#065F46]">
                                            {currentProblem.itemTitle}
                                        </span>
                                        <span className="px-3 py-1 rounded-lg bg-white border border-[#10B981] text-sm font-black text-[#065F46]">
                                            Jumlah: RM{(moneyTotalCents / 100).toFixed(2)} / Sasaran: RM
                                            {(currentProblem.targetCents / 100).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="min-h-[110px] flex flex-wrap items-center content-start gap-2">
                                        {moneyTray.length === 0 ? (
                                            <span className="text-xs font-semibold text-[#047857]/70 m-auto">
                                                Dulang bayaran kosong (RM0.00). Klik wang di sebelah kiri.
                                            </span>
                                        ) : (
                                            moneyTray.map((item, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => {
                                                        setCheckStatus(null);
                                                        setMoneyTray((prev) => prev.filter((_, i) => i !== idx));
                                                    }}
                                                    className={`px-2.5 py-1.5 rounded-lg border border-[#0F172A]/20 text-xs font-black ${item.bg}`}
                                                >
                                                    {item.label} ✕
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Interactive Analog Clock Mode */
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                                <div className="md:col-span-5 flex flex-col items-center">
                                    <svg width="210" height="210" viewBox="0 0 220 220" className="bg-white rounded-full border border-[#CBD5E1]">
                                        <circle cx="110" cy="110" r="100" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
                                        {Array.from({ length: 12 }, (_, i) => {
                                            const num = i + 1;
                                            const mins = (num % 12) * 5;
                                            const angle = (num * 30 - 90) * (Math.PI / 180);
                                            const nx = 110 + 78 * Math.cos(angle);
                                            const ny = 110 + 78 * Math.sin(angle);
                                            const isPicked = clockMinutes === mins;
                                            return (
                                                <g
                                                    key={num}
                                                    onClick={() => {
                                                        setCheckStatus(null);
                                                        setClockMinutes(mins);
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    <circle
                                                        cx={nx}
                                                        cy={ny}
                                                        r="14"
                                                        fill={isPicked ? '#2563EB' : '#F1F5F9'}
                                                    />
                                                    <text
                                                        x={nx}
                                                        y={ny + 4}
                                                        textAnchor="middle"
                                                        fontSize="12"
                                                        fontWeight="bold"
                                                        fill={isPicked ? '#FFFFFF' : '#0F172A'}
                                                    >
                                                        {num}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                        {/* Hour Hand */}
                                        {(() => {
                                            const hAngle =
                                                ((currentProblem.hour % 12) * 30 + clockMinutes * 0.5 - 90) *
                                                (Math.PI / 180);
                                            return (
                                                <line
                                                    x1="110"
                                                    y1="110"
                                                    x2={110 + 48 * Math.cos(hAngle)}
                                                    y2={110 + 48 * Math.sin(hAngle)}
                                                    stroke="#0F172A"
                                                    strokeWidth="6"
                                                    strokeLinecap="round"
                                                />
                                            );
                                        })()}
                                        {/* Minute Hand */}
                                        {(() => {
                                            const mAngle = (clockMinutes * 6 - 90) * (Math.PI / 180);
                                            return (
                                                <line
                                                    x1="110"
                                                    y1="110"
                                                    x2={110 + 68 * Math.cos(mAngle)}
                                                    y2={110 + 68 * Math.sin(mAngle)}
                                                    stroke="#2563EB"
                                                    strokeWidth="4"
                                                    strokeLinecap="round"
                                                />
                                            );
                                        })()}
                                        <circle cx="110" cy="110" r="6" fill="#EF4444" />
                                    </svg>
                                </div>

                                <div className="md:col-span-7 space-y-3">
                                    <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-between">
                                        <span className="text-xs font-extrabold uppercase text-[#475569]">
                                            Waktu Pada Jam Sekarang:
                                        </span>
                                        <span className="text-xl font-black text-[#2563EB]">
                                            Pukul {currentProblem.hour}:{String(clockMinutes).padStart(2, '0')} (
                                            {clockMinutes} Minit)
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-[#475569]">
                                        Klik nombor 1 hingga 12 pada muka jam atau gunakan butang senggatan 5 minit di bawah:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCheckStatus(null);
                                                setClockMinutes((m) => (m - 5 + 60) % 60);
                                            }}
                                            className="px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs font-extrabold text-[#0F172A]"
                                        >
                                            - 5 Minit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCheckStatus(null);
                                                setClockMinutes((m) => (m + 5) % 60);
                                            }}
                                            className="px-3.5 py-2 rounded-lg bg-[#2563EB] text-white text-xs font-extrabold"
                                        >
                                            + 5 Minit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCheckStatus(null);
                                                setClockMinutes(15);
                                            }}
                                            className="px-3.5 py-2 rounded-lg bg-[#FEF3C7] border border-[#F59E0B] text-xs font-extrabold text-[#92400E]"
                                        >
                                            Suku Jam (15 Minit)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCheckStatus(null);
                                                setClockMinutes(30);
                                            }}
                                            className="px-3.5 py-2 rounded-lg bg-[#ECFDF5] border border-[#10B981] text-xs font-extrabold text-[#065F46]"
                                        >
                                            Setengah Jam (30 Minit)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* MANIPULATIVE 5: POLYGON EXPLORER (TAHUN 3) */}
                {activeMode === 'polygon-explorer' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                        <div className="md:col-span-5 flex flex-col items-center">
                            <svg width="260" height="230" viewBox="0 0 260 230" className="bg-white rounded-xl border border-[#CBD5E1]">
                                <polygon
                                    points={polygonPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                                    fill="#EFF6FF"
                                    stroke="#2563EB"
                                    strokeWidth="3"
                                />
                                {showSymmetryAxis && (
                                    <line
                                        x1="130"
                                        y1="15"
                                        x2="130"
                                        y2="215"
                                        stroke="#F59E0B"
                                        strokeWidth="2"
                                        strokeDasharray="6 4"
                                    />
                                )}
                                {polygonPoints.map((pt, idx) => {
                                    const isLit = litVertices.includes(idx);
                                    return (
                                        <g
                                            key={idx}
                                            onClick={() => {
                                                setCheckStatus(null);
                                                setLitVertices((prev) =>
                                                    prev.includes(idx)
                                                        ? prev.filter((i) => i !== idx)
                                                        : [...prev, idx]
                                                );
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <circle
                                                cx={pt.x}
                                                cy={pt.y}
                                                r="13"
                                                fill={isLit ? '#10B981' : '#FFFFFF'}
                                                stroke="#0F172A"
                                                strokeWidth="2"
                                            />
                                            <text
                                                x={pt.x}
                                                y={pt.y + 4}
                                                textAnchor="middle"
                                                fontSize="11"
                                                fontWeight="bold"
                                                fill={isLit ? '#FFFFFF' : '#0F172A'}
                                            >
                                                {idx + 1}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>

                        <div className="md:col-span-7 space-y-3">
                            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-extrabold uppercase text-[#475569] block">
                                        Poligon Sekata Tahun 3: {currentProblem.shapeName}
                                    </span>
                                    <span className="text-lg font-black text-[#0F172A]">
                                        Bucu Dinyalakan: {litVertices.length} / {currentProblem.sides} Bucu
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowSymmetryAxis((v) => !v)}
                                    className="px-3 py-1.5 rounded-lg bg-[#FEF3C7] border border-[#F59E0B] text-xs font-extrabold text-[#92400E]"
                                >
                                    {showSymmetryAxis ? '✓ Paksi Simetri Aktif' : 'Tunjuk Paksi Simetri'}
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCheckStatus(null);
                                        setLitVertices(
                                            Array.from({ length: currentProblem.sides }, (_, i) => i)
                                        );
                                    }}
                                    className="px-4 py-2 rounded-lg bg-[#2563EB] text-white text-xs font-extrabold"
                                >
                                    ⚡ Nyalakan Semua {currentProblem.sides} Bucu
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCheckStatus(null);
                                        setLitVertices([]);
                                    }}
                                    className="px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs font-bold text-[#334155]"
                                >
                                    Reset Bucu
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MANIPULATIVE 6: MEASUREMENT METRIC LAB (TAHUN 3) */}
                {activeMode === 'measurement-metric' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                        <div className="md:col-span-7 space-y-3">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-[#475569] block">
                                Klik Alat Sukatan untuk Menambah / Mengurangkan Bacaan ({currentProblem.unit}):
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {(currentProblem.unit === 'ml'
                                    ? [
                                          { label: '+1 Liter (1,000 ml)', delta: 1000, primary: true },
                                          { label: '+500 ml', delta: 500, primary: false },
                                          { label: '+100 ml', delta: 100, primary: false },
                                          { label: '-100 ml', delta: -100, primary: false },
                                      ]
                                    : [
                                          { label: '+3 Meter (300 cm)', delta: 300, primary: true },
                                          { label: '+1 Meter (100 cm)', delta: 100, primary: true },
                                          { label: '+10 cm', delta: 10, primary: false },
                                          { label: '-10 cm', delta: -10, primary: false },
                                      ]
                                ).map((btn) => (
                                    <button
                                        key={btn.label}
                                        type="button"
                                        onClick={() => {
                                            setCheckStatus(null);
                                            setMeasureValue((v) =>
                                                Math.max(0, Math.min(currentProblem.maxVal, v + btn.delta))
                                            );
                                        }}
                                        className={`p-3 rounded-xl font-extrabold text-xs transition-transform active:scale-95 border ${
                                            btn.primary
                                                ? 'bg-[#2563EB] text-white border-[#2563EB]'
                                                : 'bg-white text-[#0F172A] border-[#CBD5E1] hover:border-[#2563EB]'
                                        }`}
                                    >
                                        {btn.label}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCheckStatus(null);
                                        setMeasureValue(0);
                                    }}
                                    className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs"
                                >
                                    Kosongkan (0 {currentProblem.unit})
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-5 bg-white border border-[#CBD5E1] rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold uppercase text-[#475569]">
                                    Bacaan Semasa:
                                </span>
                                <span className="text-lg font-black text-[#0284C7]">
                                    {measureValue.toLocaleString()} {currentProblem.unit}
                                </span>
                            </div>
                            {/* Animated Graduated Cylinder / Bar */}
                            <div className="w-full h-24 bg-[#F1F5F9] border border-[#94A3B8] rounded-xl overflow-hidden flex items-end p-1">
                                <div
                                    className="w-full bg-[#38BDF8] rounded-lg transition-all duration-300 flex items-center justify-center text-xs font-black text-[#0F172A]"
                                    style={{
                                        height: `${Math.min(
                                            100,
                                            Math.round((measureValue / currentProblem.maxVal) * 100)
                                        )}%`,
                                    }}
                                >
                                    {measureValue > 0 ? `${measureValue} ${currentProblem.unit}` : ''}
                                </div>
                            </div>
                            <p className="text-[11px] font-bold text-[#64748B] text-center">
                                Sasaran: {currentProblem.targetVal.toLocaleString()} {currentProblem.unit}
                            </p>
                        </div>
                    </div>
                )}

                {/* Collapsible KPM Textbook Step-by-Step Hint */}
                {showHint && (
                    <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FCD34D] text-xs sm:text-sm font-bold text-[#92400E] flex items-start justify-between gap-3">
                        <div>
                            <span className="font-black uppercase tracking-wider block text-[11px] text-[#B45309]">
                                💡 Penerangan Langkah Demi Langkah (Buku Teks KPM):
                            </span>
                            <p className="mt-0.5">{currentProblem.hint}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowHint(false)}
                            className="text-xs font-black text-[#92400E] hover:underline shrink-0"
                        >
                            Tutup
                        </button>
                    </div>
                )}

                {checkStatus === 'wrong' && (
                    <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs sm:text-sm font-bold text-[#991B1B] flex items-center justify-between gap-2">
                        <span>
                            ✗ Belum tepat lagi. Cuba laraskan semula nilai pada aktiviti di atas atau klik [💡 Tunjuk Cara Kira].
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowHint(true)}
                            className="px-2.5 py-1 rounded bg-white border border-[#FCA5A5] text-xs font-extrabold text-[#991B1B] shrink-0"
                        >
                            Lihat Petunjuk
                        </button>
                    </div>
                )}
            </div>

            {/* Khan Academy Sticky Bottom Progress & Check Bar */}
            <div className="px-4 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={() => setShowHint((h) => !h)}
                    className="px-3 py-2 rounded-lg bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] text-xs font-extrabold text-[#334155] transition-colors"
                >
                    💡 {showHint ? 'Sembunyi Cara Kira' : 'Tunjuk Cara Kira (Hint)'}
                </button>

                {/* Center: Selesaikan 5 aktiviti: ✓ ● ○ ○ ○ */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#475569] hidden sm:inline">
                        Selesaikan {problems.length} aktiviti:
                    </span>
                    <div className="flex items-center gap-1.5">
                        {problems.map((p, idx) => {
                            const isDone = modeCompletedSet.has(p.id);
                            const isCurr = idx === problemIdx;
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setProblemIdx(idx)}
                                    title={`Aktiviti ${idx + 1}`}
                                    className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center border transition-colors ${
                                        isDone
                                            ? 'bg-[#10B981] text-white border-[#10B981]'
                                            : isCurr
                                            ? 'bg-[#2563EB] text-white border-[#2563EB]'
                                            : 'bg-white text-[#64748B] border-[#CBD5E1]'
                                    }`}
                                >
                                    {isDone ? '✓' : idx + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Check Answer / Next Question */}
                <div className="flex items-center gap-2">
                    {checkStatus === 'correct' ? (
                        <button
                            type="button"
                            onClick={handleNextProblem}
                            className="px-5 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs sm:text-sm transition-colors"
                        >
                            {problemIdx < problems.length - 1
                                ? 'Soalan Seterusnya →'
                                : 'Selesai & Teruskan →'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleCheckAnswer}
                            className="px-5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs sm:text-sm transition-colors"
                        >
                            Semak Jawapan
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom-Right Khan Academy Celebration Popup */}
            {celebrationPopup && (
                <div className="fixed bottom-6 right-6 z-40 bg-white border-2 border-[#10B981] rounded-xl p-4 flex items-center gap-3 max-w-sm animate-fade-in">
                    <span className="w-9 h-9 rounded-full bg-[#10B981] text-white font-black text-base flex items-center justify-center shrink-0">
                        ✓
                    </span>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-extrabold text-[#065F46]">
                            {celebrationPopup.title}
                        </p>
                        <p className="text-xs text-[#047857] mt-0.5">{celebrationPopup.sub}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleNextProblem}
                        className="px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-extrabold shrink-0"
                    >
                        Terus →
                    </button>
                </div>
            )}
        </div>
    );
}

