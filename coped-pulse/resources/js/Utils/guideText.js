/**
 * Tokenizes instructor-authored study guide text into renderable blocks:
 * "###"/"####" headings, "- " bullets, "1. " numbered lines and **bold** spans.
 * shortcut: not a full markdown parser (no links, tables or nesting); swap for a markdown lib if authors need more.
 */
export function splitBold(text) {
    return String(text)
        .split(/(\*\*[^*]+\*\*)/g)
        .filter(Boolean)
        .map((part) => (/^\*\*[^*]+\*\*$/.test(part)
            ? { bold: true, text: part.slice(2, -2) }
            : { bold: false, text: part }));
}

export function parseGuide(text) {
    if (!text || typeof text !== 'string') return [];

    return text.split(/\r?\n/).map((raw) => {
        const line = raw.trim();
        if (!line) return { type: 'gap' };

        let m = line.match(/^#{1,6}\s+(.*)$/);
        if (m) return { type: 'heading', parts: splitBold(m[1]) };

        m = line.match(/^[-*]\s+(.*)$/);
        if (m) return { type: 'bullet', parts: splitBold(m[1]) };

        m = line.match(/^(\d+)\.\s+(.*)$/);
        if (m) return { type: 'numbered', marker: m[1], parts: splitBold(m[2]) };

        return { type: 'text', parts: splitBold(line) };
    });
}

