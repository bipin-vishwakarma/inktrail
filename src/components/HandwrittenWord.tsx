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
    lowInkFade?: boolean;
    lowInkStart?: number;
    lowInkIntensity?: number;
    docProgress?: number;
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
    lowInkFade,
    lowInkStart,
    lowInkIntensity,
    docProgress,
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

    // Low-Ink & Ballpoint Pen Drying Physics
    const startRatio = (lowInkStart ?? 45) / 100;
    const progress = docProgress ?? 0;
    const isDryingActive = Boolean(lowInkFade && progress >= startRatio);
    const fadeRatio = isDryingActive
        ? Math.min(1, Math.max(0, (progress - startRatio) / Math.max(0.1, 1 - startRatio)))
        : 0;
    const effectiveFade = isDryingActive ? fadeRatio * (lowInkIntensity ?? 0.65) : 0;

    // Gradual stroke lightening: as ink runs low, opacity drops smoothly down to 0.5 - 0.6
    const lowInkDrop = effectiveFade * 0.46;
    const finalWordOpacity = Math.max(0.25, baseOpacity - lowInkDrop);

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
                opacity: finalWordOpacity,
                filter: smudgeFilter,
                marginRight: '0.28em',
                verticalAlign: 'baseline',
            }}
        >
            {/* Unified Word Cursive Rendering with OpenType Connecting Ligatures & Human Realism */}
            {charJitter <= 0.8 ? (
                <span 
                    style={{ 
                        fontFamily: fontCss,
                        fontFeatureSettings: '"liga" 1, "calt" 1, "clig" 1, "dlig" 1',
                        fontVariantLigatures: 'normal contextual',
                        textRendering: 'optimizeLegibility',
                    }}
                >
                    {token.text}
                </span>
            ) : (
                /* Disjointed Letter Jitter (for print/block styles when character jitter is explicitly cranked up) */
                token.text.split('').map((char, cIdx) => {
                    const cRng = mulberry32(intSeed + (cIdx + 1) * 31);
                    const cy = (cRng() - 0.5) * charJitter * 1.5;
                    const cr = (cRng() - 0.5) * charJitter * 0.9;
                    const cop = 1 - cRng() * 0.1;

                    return (
                        <span
                            key={cIdx}
                            className="inline-block"
                            style={{
                                fontFamily: fontCss,
                                transform: cy || cr ? `translateY(${cy}px) rotate(${cr}deg)` : undefined,
                                opacity: cop,
                            }}
                        >
                            {char}
                        </span>
                    );
                })
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
        prev.smudge === next.smudge &&
        prev.lowInkFade === next.lowInkFade &&
        prev.lowInkStart === next.lowInkStart &&
        prev.lowInkIntensity === next.lowInkIntensity &&
        prev.docProgress === next.docProgress
    );
});
