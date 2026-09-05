import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { generateScribblePath, fastStringHash, mulberry32, getFontFamilyCss, measureWordWidth, type WordToken } from '../utils/humanErrorEngine';

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

    // Track real DOM rendered width for pixel-perfect strike bounding boxes
    const textRef = useRef<HTMLSpanElement>(null);
    const [domWidth, setDomWidth] = useState<number>(0);

    useLayoutEffect(() => {
        if (textRef.current) {
            const rect = textRef.current.getBoundingClientRect();
            if (rect.width > 0 && Math.abs(rect.width - domWidth) > 0.5) {
                setDomWidth(rect.width);
            }
        }
    }, [token.text, fontFamily, fontSize, charJitter]);

    const canvasWidth = useMemo(() => {
        return Math.max(measureWordWidth(token.text, fontFamily, fontSize), 15);
    }, [token.text, fontFamily, fontSize]);

    const effectiveWidth = domWidth > 0 ? domWidth : canvasWidth;
    const effectiveHeight = fontSize;

    // Generate SVG path for scribble if word is struck
    const scribblePath = useMemo(() => {
        if (!token.isStruck) return '';
        return generateScribblePath(effectiveWidth, effectiveHeight, token.strikeStyle, seedString + '_sc');
    }, [token.isStruck, token.strikeStyle, effectiveWidth, effectiveHeight, seedString]);

    const fontCss = getFontFamilyCss(fontFamily);

    return (
        <span
            onClick={onClick}
            className={`inline-block relative whitespace-nowrap select-text ${onClick ? 'cursor-pointer' : ''}`}
            style={{
                fontFamily: fontCss,
                lineHeight: 1,
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
                    ref={textRef}
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
                <span ref={textRef} className="inline-block">
                    {token.text.split('').map((char, cIdx) => {
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
                    })}
                </span>
            )}

            {/* Scribble Strike Overlay */}
            {token.isStruck && (
                <svg
                    className="absolute top-0 left-0 pointer-events-none overflow-visible"
                    style={{
                        width: `${effectiveWidth}px`,
                        height: `${effectiveHeight}px`,
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

            {/* Authentic Hand-Drawn Caret Insertion Mark & Replacement Word */}
            {token.caretCorrection && (
                <span
                    className="absolute pointer-events-none whitespace-nowrap z-20 flex flex-col items-center"
                    style={{
                        left: '50%',
                        bottom: '100%',
                        marginBottom: `-${Math.max(3, Math.round(fontSize * 0.16))}px`,
                        transform: 'translateX(-50%)',
                        lineHeight: 1,
                    }}
                >
                    {/* Handwritten Replacement Word floating above line */}
                    <span
                        style={{
                            fontFamily: fontCss,
                            fontSize: `${Math.round(fontSize * 0.72)}px`,
                            color,
                            transform: 'rotate(-2.2deg)',
                            fontWeight: 600,
                            marginBottom: '1.5px',
                        }}
                    >
                        {token.caretCorrection}
                    </span>
                    {/* Hand-Drawn Vector Ink Caret Mark pointing up at replacement */}
                    <svg width="11" height="7" viewBox="0 0 11 7" className="overflow-visible">
                        <path
                            d="M 1.5 6.5 Q 3.5 3.5 5.5 1 L 9.5 6"
                            fill="none"
                            stroke={color}
                            strokeWidth={Math.max(1.7, fontSize * 0.065)}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity={0.9}
                        />
                    </svg>
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
