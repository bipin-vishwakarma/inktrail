import React, { useMemo } from 'react';
import { generateScribblePath, fastStringHash, mulberry32, getFontWidthRatio, getFontFamilyCss, type WordToken } from '../utils/humanErrorEngine';

interface HandwrittenWordProps {
    token: WordToken;
    pageIndex: number;
    lineIndex: number;
    wordIndex: number;
    totalLines: number;
    randomSeed: string;
    fontFamily: string;
    fontSize: number;
    color: string;
    jitter: number;
    charJitter: number;
    fatigue: number;
    pressure: number;
    smudge: number;
    onClick?: () => void;
}

const HandwrittenWordComponent: React.FC<HandwrittenWordProps> = ({
    token,
    pageIndex,
    lineIndex,
    wordIndex,
    totalLines,
    randomSeed,
    fontFamily,
    fontSize,
    color,
    jitter,
    charJitter,
    fatigue,
    pressure,
    smudge,
    onClick,
}) => {
    // Fast integer seed - 0 string concatenation in the loop
    const seedString = `${pageIndex}_${lineIndex}_${wordIndex}_${token.text}_${randomSeed}`;
    const intSeed = fastStringHash(seedString);
    const rng = mulberry32(intSeed);

    // Word-level organic jitter
    const wordY = (rng() - 0.5) * jitter * 2.8;
    const wordRot = (rng() - 0.5) * jitter * 1.6;

    // Progressive fatigue: as lines go down the page, fatigue increases slant and baseline drift
    const fatigueProgress = totalLines > 0 ? lineIndex / totalLines : 0;
    const fatigueSag = fatigue * fatigueProgress * (rng() * 2.5 - 0.5);
    const fatigueSlant = fatigue * fatigueProgress * (rng() * 1.8 - 0.9);

    // Opacity / pen pressure
    const baseOpacity = 1 - rng() * (1 - pressure) * 0.35;
    const smudgeFilter = smudge > 0 ? `blur(${rng() * smudge * 0.35}px)` : 'none';

    // Character length approximation for SVG scribble dimensions using font metrics
    const fontRatio = getFontWidthRatio(fontFamily);
    const approxWidth = Math.max(token.text.length * (fontSize * fontRatio * 1.15), 20);
    const approxHeight = fontSize * 1.1;

    // Generate SVG path for scribble if word is struck
    const scribblePath = useMemo(() => {
        if (!token.isStruck) return '';
        return generateScribblePath(approxWidth, approxHeight, token.strikeStyle, seedString + '_sc');
    }, [token.isStruck, token.strikeStyle, approxWidth, approxHeight, seedString]);

    const fontCss = getFontFamilyCss(fontFamily);

    return (
        <span
            onClick={onClick}
            className={`inline-block relative whitespace-nowrap select-text ${onClick ? 'cursor-pointer' : ''}`}
            style={{
                fontFamily: fontCss,
                transform: `translateY(${wordY + fatigueSag}px) rotate(${wordRot + fatigueSlant}deg)`,
                opacity: baseOpacity,
                filter: smudgeFilter,
                marginRight: '0.28em',
                verticalAlign: 'baseline',
            }}
        >
            {/* Render Characters with Micro-Jitter (only when enabled to save DOM nodes) */}
            {charJitter > 0.2 ? (
                token.text.split('').map((char, cIdx) => {
                    const cRng = mulberry32(intSeed + (cIdx + 1) * 31);
                    const cy = (cRng() - 0.5) * charJitter * 1.8;
                    const cr = (cRng() - 0.5) * charJitter * 1.2;
                    const cop = 1 - cRng() * 0.12;

                    return (
                        <span
                            key={cIdx}
                            className="inline-block"
                            style={{
                                fontFamily: fontCss,
                                transform: `translateY(${cy}px) rotate(${cr}deg)`,
                                opacity: cop,
                            }}
                        >
                            {char}
                        </span>
                    );
                })
            ) : (
                <span style={{ fontFamily: fontCss }}>{token.text}</span>
            )}

            {/* Scribble Strike Overlay */}
            {token.isStruck && (
                <svg
                    className="absolute top-0 left-0 pointer-events-none overflow-visible"
                    style={{
                        width: `${approxWidth}px`,
                        height: `${approxHeight}px`,
                    }}
                >
                    <path
                        d={scribblePath}
                        fill="none"
                        stroke={color}
                        strokeWidth={Math.max(1.8, fontSize * 0.075)}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={0.92}
                    />
                </svg>
            )}

            {/* Caret Insertion Correction Mark */}
            {token.caretCorrection && (
                <span
                    className="absolute pointer-events-none whitespace-nowrap"
                    style={{
                        left: '50%',
                        bottom: `${approxHeight * 0.82}px`,
                        transform: 'translateX(-50%)',
                        fontFamily: fontCss,
                        fontSize: `${fontSize * 0.72}px`,
                        color,
                        lineHeight: 1,
                    }}
                >
                    {/* Handwritten Caret Icon */}
                    <span
                        className="inline-block font-sans font-bold"
                        style={{
                            fontSize: `${fontSize * 0.75}px`,
                            marginRight: '2px',
                            verticalAlign: '-2px',
                        }}
                    >
                        ^
                    </span>
                    <span className="underline decoration-wavy decoration-1 opacity-90">
                        {token.caretCorrection}
                    </span>
                </span>
            )}
        </span>
    );
};

export const HandwrittenWord = React.memo(HandwrittenWordComponent, (prev, next) => {
    return (
        prev.token.text === next.token.text &&
        prev.token.isStruck === next.token.isStruck &&
        prev.token.strikeStyle === next.token.strikeStyle &&
        prev.token.caretCorrection === next.token.caretCorrection &&
        prev.pageIndex === next.pageIndex &&
        prev.lineIndex === next.lineIndex &&
        prev.wordIndex === next.wordIndex &&
        prev.totalLines === next.totalLines &&
        prev.randomSeed === next.randomSeed &&
        prev.fontFamily === next.fontFamily &&
        prev.fontSize === next.fontSize &&
        prev.color === next.color &&
        prev.jitter === next.jitter &&
        prev.charJitter === next.charJitter &&
        prev.fatigue === next.fatigue &&
        prev.pressure === next.pressure &&
        prev.smudge === next.smudge
    );
});
