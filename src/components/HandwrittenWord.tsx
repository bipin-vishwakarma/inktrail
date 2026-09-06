import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import type { CorrectionColor } from '../types';
import { 
    generateScribblePath, 
    generateDoubleUnderlinePath, 
    generateWobblyBoxPath, 
    fastStringHash, 
    mulberry32, 
    getFontFamilyCss, 
    measureWordWidth, 
    isCursiveConnectingFont,
    type WordToken 
} from '../utils/humanErrorEngine';

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
    correctionColor?: CorrectionColor;
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
    correctionColor = 'match',
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

    // Dynamic Correction vs Pen Ink Color
    const activeCorrectionColor = correctionColor === 'red'
        ? '#dc2626'
        : correctionColor === 'green'
        ? '#16a34a'
        : correctionColor === 'purple'
        ? '#7e22ce'
        : color;

    const strikeStrokeColor = correctionColor !== 'match' ? activeCorrectionColor : color;
    const caretColor = activeCorrectionColor;

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

    const fontCss = getFontFamilyCss(fontFamily);

    // Standalone missing-word caret (e.g. ^to, ^from, ^because, ^at)
    if (token.text === '' && token.caretCorrection) {
        const caretSlotWidth = Math.max(14, Math.round(fontSize * 0.45));
        return (
            <span
                onClick={onClick}
                className={`inline-block relative whitespace-nowrap select-text ${onClick ? 'cursor-pointer' : ''}`}
                style={{
                    width: `${caretSlotWidth}px`,
                    height: `${fontSize * 0.8}px`,
                    marginRight: '0.28em',
                    verticalAlign: 'baseline',
                    transform: `translateY(${wordY + fatigueSag}px) rotate(${wordRot + fatigueSlant}deg)`,
                }}
            >
                <span
                    className="absolute pointer-events-none whitespace-nowrap z-20 flex flex-col items-center"
                    style={{
                        left: '50%',
                        bottom: '0px',
                        transform: 'translateX(-50%)',
                        lineHeight: 1,
                    }}
                >
                    {/* Missing word floating above line */}
                    <span
                        style={{
                            fontFamily: fontCss,
                            fontSize: `${Math.round(fontSize * 0.72)}px`,
                            color: caretColor,
                            transform: 'rotate(-2.5deg)',
                            fontWeight: 600,
                            marginBottom: '1.5px',
                        }}
                    >
                        {token.caretCorrection}
                    </span>
                    {/* Hand-Drawn Vector Ink Caret Mark sitting directly on the writing line */}
                    <svg width="12" height="8" viewBox="0 0 12 8" className="overflow-visible">
                        <path
                            d="M 1.5 7.2 Q 4 3 6 1 L 10.5 7.2"
                            fill="none"
                            stroke={caretColor}
                            strokeWidth={Math.max(1.8, fontSize * 0.07)}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity={0.92}
                        />
                    </svg>
                </span>
            </span>
        );
    }

    // Track real DOM rendered width for pixel-perfect strike bounding boxes
    const textRef = useRef<HTMLSpanElement>(null);
    const [domWidth, setDomWidth] = useState<number>(0);

    useLayoutEffect(() => {
        if (textRef.current) {
            const w = textRef.current.offsetWidth;
            if (w > 0 && Math.abs(w - domWidth) > 0.5) {
                setDomWidth(w);
            }
        }
    }, [token.text, fontFamily, fontSize, charJitter]);

    const canvasWidth = useMemo(() => {
        return Math.max(measureWordWidth(token.text, fontFamily, fontSize), 6);
    }, [token.text, fontFamily, fontSize]);

    const effectiveWidth = domWidth > 0 ? domWidth : canvasWidth;
    const effectiveHeight = fontSize;

    // Generate SVG path for scribble if word is struck
    const scribblePath = useMemo(() => {
        if (!token.isStruck) return '';
        return generateScribblePath(effectiveWidth, effectiveHeight, token.strikeStyle, seedString + '_sc');
    }, [token.isStruck, token.strikeStyle, effectiveWidth, effectiveHeight, seedString]);

    // Generate SVG path for double underline if present
    const doubleUnderlinePath = useMemo(() => {
        if (!token.isDoubleUnderline) return '';
        return generateDoubleUnderlinePath(effectiveWidth, effectiveHeight, seedString + '_du');
    }, [token.isDoubleUnderline, effectiveWidth, effectiveHeight, seedString]);

    // Generate SVG path for wobbly box if present
    const wobblyBoxPath = useMemo(() => {
        if (!token.isBoxed) return '';
        return generateWobblyBoxPath(effectiveWidth, effectiveHeight, seedString + '_box');
    }, [token.isBoxed, effectiveWidth, effectiveHeight, seedString]);

    return (
        <span
            onClick={onClick}
            className={`handwritten-word inline-block relative whitespace-nowrap select-text ${onClick ? 'cursor-pointer' : ''}`}
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
            {(isCursiveConnectingFont(fontFamily) || charJitter <= 0.8) ? (
                <span 
                    ref={textRef}
                    style={{ 
                        fontFamily: fontCss,
                        fontFeatureSettings: '"liga" 1, "calt" 1, "clig" 1, "dlig" 1',
                        fontVariantLigatures: 'normal contextual',
                        textRendering: 'optimizeLegibility',
                        letterSpacing: isCursiveConnectingFont(fontFamily) ? '-0.012em' : undefined,
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
                        stroke={strikeStrokeColor}
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
                        marginBottom: `-${Math.max(4, Math.round(fontSize * 0.22))}px`,
                        transform: 'translateX(-50%)',
                        lineHeight: 1,
                    }}
                >
                    {/* Handwritten Replacement Word floating above line */}
                    <span
                        style={{
                            fontFamily: fontCss,
                            fontSize: `${Math.round(fontSize * 0.72)}px`,
                            color: caretColor,
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
                            stroke={caretColor}
                            strokeWidth={Math.max(1.7, fontSize * 0.065)}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity={0.9}
                        />
                    </svg>
                </span>
            )}

            {/* Hand-Drawn Heading Double Underline */}
            {token.isDoubleUnderline && (
                <svg
                    className="absolute top-0 left-0 pointer-events-none overflow-visible"
                    style={{
                        width: `${effectiveWidth}px`,
                        height: `${effectiveHeight}px`,
                        zIndex: 2,
                    }}
                >
                    <path
                        d={doubleUnderlinePath}
                        fill="none"
                        stroke={color}
                        strokeWidth={Math.max(1.5, fontSize * 0.06)}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={0.88}
                    />
                </svg>
            )}

            {/* Hand-Drawn Wobbly Formula Box */}
            {token.isBoxed && (
                <svg
                    className="absolute top-0 left-0 pointer-events-none overflow-visible"
                    style={{
                        width: `${effectiveWidth}px`,
                        height: `${effectiveHeight}px`,
                        zIndex: 2,
                    }}
                >
                    <path
                        d={wobblyBoxPath}
                        fill="none"
                        stroke={color}
                        strokeWidth={Math.max(1.6, fontSize * 0.065)}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={0.85}
                    />
                </svg>
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
        prev.token.isHighlighted === next.token.isHighlighted &&
        prev.token.highlightColor === next.token.highlightColor &&
        prev.token.isDoubleUnderline === next.token.isDoubleUnderline &&
        prev.token.isBoxed === next.token.isBoxed &&
        prev.correctionColor === next.correctionColor &&
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
