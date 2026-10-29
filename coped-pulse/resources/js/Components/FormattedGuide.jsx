import { parseGuide } from '@/Utils/guideText';

const Inline = ({ parts }) => parts.map((p, i) => (p.bold
    ? <strong key={i} className="font-extrabold text-[#111827]">{p.text}</strong>
    : <span key={i}>{p.text}</span>));

/** Renders study guide text with headings, lists and bold spans instead of raw "###" / "**" symbols. */
export default function FormattedGuide({ text, className = '' }) {
    const blocks = parseGuide(text);
    if (blocks.length === 0) return null;

    return (
        <div className={`text-sm sm:text-base text-gray-800 leading-relaxed break-words space-y-2 ${className}`}>
            {blocks.map((b, i) => {
                if (b.type === 'gap') return <div key={i} className="h-2" aria-hidden="true" />;
                if (b.type === 'heading') {
                    return <h4 key={i} className="font-display font-extrabold text-base sm:text-lg text-[#111827] mt-4 mb-1.5"><Inline parts={b.parts} /></h4>;
                }
                if (b.type === 'bullet') {
                    return (
                        <p key={i} className="relative pl-5">
                            <span className="absolute left-0 text-gray-500 font-bold" aria-hidden="true">•</span>
                            <Inline parts={b.parts} />
                        </p>
                    );
                }
                if (b.type === 'numbered') {
                    return (
                        <p key={i} className="relative pl-6">
                            <span className="absolute left-0 font-extrabold text-[#111827]">{b.marker}.</span>
                            <Inline parts={b.parts} />
                        </p>
                    );
                }
                return <p key={i}><Inline parts={b.parts} /></p>;
            })}
        </div>
    );
}

