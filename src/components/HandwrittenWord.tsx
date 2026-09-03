import React, { useMemo } from 'react';
import { generateScribblePath, getDeterministicRandom, type WordToken } from '../utils/humanErrorEngine';

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

export const HandwrittenWord: React.FC<HandwrittenWordProps> = ({
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
    const seed = `${pageIndex}-${lineIndex}-${wordIndex}-${token.text}-${randomSeed}`;

    // Word-level jitter
    const wordY = (getDeterministicRandom(seed + 'wy') - 0.5) * jitter * 2.8;
    const wordRot = (getDeterministicRandom(seed + 'wr') - 0.5) * jitter * 1.6;

    // Progressive fatigue: as lines go down the page, fatigue increases slant and baseline drift
    const fatigueProgress = totalLines > 0 ? lineIndex / totalLines : 0;
    const fatigueSag = fatigue * fatigueProgress * (getDeterministicRandom(seed + 'fatigue') * 2.5 - 0.5);
    const fatigueSlant = fatigue * fatigueProgress * (getDeterministicRandom(seed + 'fatslant') * 1.8 - 0.9);

    // Opacity / pen pressure
    const baseOpacity = 1 - getDeterministicRandom(seed + 'op') * (1 - pressure) * 0.35;
    const smudgeFilter = smudge > 0 ? `blur(${getDeterministicRandom(seed + 'sm') * smudge * 0.4}px)` : 'none';

    // Character length approximation for SVG scribble dimensions
    const approxWidth = Math.max(token.text.length * (fontSize * 0.55), 20);
    const approxHeight = fontSize * 1.1;

    // Generate SVG path for scribble if word is struck
    const scribblePath = useMemo(() => {
        if (!token.isStruck) return '';
        return generateScribblePath(approxWidth, approxHeight, token.strikeStyle, seed + 'scribble');
    }, [token.isStruck, token.strikeStyle, approxWidth, approxHeight, seed]);

    return (
        <span
            onClick={onClick}
            className={`inline-block relative whitespace-nowrap ${onClick ? 'cursor-pointer' : ''}`}
            style={{
                transform: `translateY(${wordY + fatigueSag}px) rotate(${wordRot + fatigueSlant}deg)`,
                opacity: baseOpacity,
                filter: smudgeFilter,
                marginRight: '0.28em',
                verticalAlign: 'baseline',
            }}
        >
            {/* Render Characters with Micro-Jitter */}
            {charJitter > 0.2 ? (
                token.text.split('').map((char, cIdx) => {
                    const cSeed = `${seed}-c${cIdx}`;
                    const cy = (getDeterministicRandom(cSeed + 'y') - 0.5) * charJitter * 1.8;
                    const cr = (getDeterministicRandom(cSeed + 'r') - 0.5) * charJitter * 1.2;
                    const cop = 1 - getDeterministicRandom(cSeed + 'o') * 0.12;

                    return (
                        <span
                            key={cIdx}
                            className="inline-block"
                            style={{
                                transform: `translateY(${cy}px) rotate(${cr}deg)`,
                                opacity: cop,
                            }}
                        >
                            {char}
                        </span>
                    );
                })
            ) : (
                <span>{token.text}</span>
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
                        fontFamily,
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
