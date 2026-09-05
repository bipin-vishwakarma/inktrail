import type { StrikeStyle } from '../types';

/**
 * Fast 32-bit FNV-1a string hash to convert any string seed to an integer.
 */
export function fastStringHash(str: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

/**
 * Fast 32-bit Mulberry32 PRNG.
 */
export function mulberry32(a: number) {
    return function() {
        let t = (a += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Deterministic pseudo-random number generator [0, 1) based on a string seed.
 */
export function getDeterministicRandom(seed: string): number {
    const intSeed = fastStringHash(seed);
    const rng = mulberry32(intSeed);
    return rng();
}

/**
 * Relative character width multipliers per handwriting font to ensure accurate word wrapping
 */
export const FONT_WIDTH_RATIOS: Record<string, number> = {
    'Handwriting 1': 0.55,
    'Handwriting 2': 0.58,
    'Handwriting 3': 0.54,
    'Handwriting 4': 0.60,
    'Handwriting 5': 0.56,
    'Handwriting 6': 0.55,
    'Handwriting 7': 0.62,
    'Handwriting 8': 0.54,
    'Handwriting 9': 0.52,
    'Handwriting 10': 0.56,
    'Handwriting 11': 0.58,
    'Handwriting 12': 0.57,
    'Handwriting 13': 0.50,
    'Handwriting 14': 0.62,
    'Hindi Handwriting': 0.62,
    'Hindi Devnagari Hand': 0.62,
    'Caveat': 0.52,
    'Indie Flower': 0.58,
    'Patrick Hand': 0.56,
    'Homemade Apple': 0.68,
    'Shadows Into Light': 0.50,
    'Kalam': 0.62,
    'Gloria Hallelujah': 0.66,
    'Reenie Beanie': 0.46,
    // Hyphenated aliases
    'handwriting-1': 0.58,
    'handwriting-2': 0.56,
    'handwriting-3': 0.52,
    'handwriting-4': 0.60,
    'handwriting-5': 0.58,
    'handwriting-6': 0.54,
    'handwriting-7': 0.54,
    'handwriting-8': 0.50,
    'handwriting-9': 0.58,
    'handwriting-10': 0.56,
    'handwriting-11': 0.58,
    'handwriting-12': 0.57,
    'handwriting-13': 0.50,
    'handwriting-14': 0.62,
};

/**
 * Ensures font-family is strictly valid CSS with quotes around custom names containing spaces/numbers,
 * followed by organic cursive and sans-serif fallbacks.
 */
export function getFontFamilyCss(font: string): string {
    if (!font) return '"Caveat", cursive, sans-serif';
    const cleanFont = font.replace(/['"]/g, '').trim();
    return `"${cleanFont}", cursive, sans-serif`;
}

export function getFontWidthRatio(fontFamily: string): number {
    const clean = fontFamily.replace(/['"]/g, '').trim();
    return FONT_WIDTH_RATIOS[clean] || FONT_WIDTH_RATIOS[fontFamily] || 0.56;
}

let measureCanvas: HTMLCanvasElement | null = null;
let measureCtx: CanvasRenderingContext2D | null = null;
const widthCache = new Map<string, number>();

export function clearWidthCache(): void {
    widthCache.clear();
}

/**
 * Pixel-accurate word width measurement via Canvas 2D with fallback to font ratios.
 */
export function measureWordWidth(word: string, font: string, fontSize: number): number {
    if (!word) return 0;
    const fontCss = getFontFamilyCss(font);
    const key = `${fontCss}:${fontSize}:${word}`;
    const cached = widthCache.get(key);
    if (cached !== undefined) return cached;

    if (typeof document !== 'undefined') {
        if (!measureCtx) {
            measureCanvas = document.createElement('canvas');
            measureCtx = measureCanvas.getContext('2d');
        }
        if (measureCtx) {
            measureCtx.font = `${fontSize}px ${fontCss}`;
            const width = measureCtx.measureText(word).width;
            if (widthCache.size > 3000) widthCache.clear();
            widthCache.set(key, width);
            return width;
        }
    }

    const ratio = getFontWidthRatio(font);
    return word.length * (fontSize * ratio);
}

export interface WordToken {
    text: string;
    isStruck: boolean;
    strikeStyle: StrikeStyle;
    caretCorrection?: string;
    isTypo?: boolean;
}

// Common realistic typos for English words
const TYPO_MAP: Record<string, string> = {
    the: 'teh',
    their: 'thier',
    receive: 'recieve',
    because: 'becuase',
    definitely: 'definately',
    separate: 'seperate',
    until: 'untill',
    which: 'whch',
    writing: 'writting',
    assignment: 'assignemnt',
    homework: 'homewrok',
    important: 'importent',
    problem: 'probelm',
    equation: 'equasion',
    function: 'funtion',
    solution: 'soluton',
    result: 'resutl',
    example: 'exampel',
    question: 'quesiton',
    answer: 'asnwerr',
    student: 'studnet',
    university: 'univeristy',
    college: 'colledge',
    school: 'shcool',
    different: 'diffrent',
    formula: 'formual',
    calculate: 'calcualte',
    method: 'mehtod',
    process: 'proccess',
    between: 'betewen',
    sentence: 'sentance',
    experience: 'experiance',
    development: 'developement',
    government: 'goverment',
    environment: 'enviorment',
    necessary: 'neccessary',
    accommodate: 'accomodate',
    beginning: 'begining',
    calendar: 'calender',
    discipline: 'descipline',
    embarrass: 'embarass',
    independent: 'independant',
    knowledge: 'knowlege',
    occurrence: 'occurance',
    perseverance: 'perseverence',
    possession: 'posession',
    privilege: 'privelege',
    rhythm: 'rythm',
    tomorrow: 'tommorrow',
    truly: 'truely',
    weird: 'wierd',
};

// Keyboard adjacency map for realistic slip typos (QWERTY layout)
const KEYBOARD_ADJACENT: Record<string, string[]> = {
    a: ['q', 'w', 's', 'z'],
    b: ['v', 'g', 'h', 'n'],
    c: ['x', 'd', 'f', 'v'],
    d: ['s', 'e', 'r', 'f', 'c', 'x'],
    e: ['w', 's', 'd', 'r'],
    f: ['d', 'r', 't', 'g', 'v', 'c'],
    g: ['f', 't', 'y', 'h', 'b', 'v'],
    h: ['g', 'y', 'u', 'j', 'n', 'b'],
    i: ['u', 'j', 'k', 'o'],
    j: ['h', 'u', 'i', 'k', 'm', 'n'],
    k: ['j', 'i', 'o', 'l', 'm'],
    l: ['k', 'o', 'p'],
    m: ['n', 'j', 'k'],
    n: ['b', 'h', 'j', 'm'],
    o: ['i', 'k', 'l', 'p'],
    p: ['o', 'l'],
    q: ['w', 'a'],
    r: ['e', 'd', 'f', 't'],
    s: ['a', 'w', 'e', 'd', 'x', 'z'],
    t: ['r', 'f', 'g', 'y'],
    u: ['y', 'h', 'j', 'i'],
    v: ['c', 'f', 'g', 'b'],
    w: ['q', 'a', 's', 'e'],
    x: ['z', 's', 'd', 'c'],
    y: ['t', 'g', 'h', 'u'],
};

/**
 * Generate a realistic simulated human typo from a clean word with punctuation preservation
 */
export function generateTypo(word: string, seed: string): string {
    const leadingPunct = word.match(/^[^a-zA-Z0-9]+/)?.[0] || '';
    const trailingPunct = word.match(/[^a-zA-Z0-9]+$/)?.[0] || '';
    const clean = word.replace(/^[^a-zA-Z0-9]+/, '').replace(/[^a-zA-Z0-9]+$/, '');
    const cleanLower = clean.toLowerCase();
    if (clean.length < 3) return word;

    let typoWord = clean;

    // 1. Check known typo map
    if (TYPO_MAP[cleanLower]) {
        const mapped = TYPO_MAP[cleanLower];
        typoWord = (clean[0] === clean[0].toUpperCase())
            ? mapped.charAt(0).toUpperCase() + mapped.slice(1)
            : mapped;
        return leadingPunct + typoWord + trailingPunct;
    }

    const rand = getDeterministicRandom(seed + '-typomode');
    const chars = clean.split('');

    if (rand < 0.4 && chars.length > 3) {
        // Swap adjacent letters
        const idx = 1 + Math.floor(getDeterministicRandom(seed + '-swap') * (chars.length - 2));
        const temp = chars[idx];
        chars[idx] = chars[idx + 1];
        chars[idx + 1] = temp;
        typoWord = chars.join('');
    } else if (rand < 0.7) {
        // Adjacent key typo
        const idx = Math.floor(getDeterministicRandom(seed + '-adj') * chars.length);
        const origChar = chars[idx]?.toLowerCase();
        const adjList = origChar ? KEYBOARD_ADJACENT[origChar] : null;
        if (adjList && adjList.length > 0) {
            const replacement = adjList[Math.floor(getDeterministicRandom(seed + '-key') * adjList.length)];
            chars[idx] = chars[idx] === chars[idx]?.toUpperCase() ? replacement.toUpperCase() : replacement;
            typoWord = chars.join('');
        }
    } else if (chars.length >= 3) {
        // Double letter or drop letter
        const idx = Math.floor(getDeterministicRandom(seed + '-drop') * chars.length);
        if (chars[idx] && getDeterministicRandom(seed + '-dd') > 0.5) {
            chars.splice(idx, 0, chars[idx]); // Double letter
        } else if (chars.length > 4) {
            chars.splice(idx, 1); // Drop letter
        }
        typoWord = chars.join('');
    }

    return leadingPunct + typoWord + trailingPunct;
}

/**
 * Parse a raw word into tokens, handling manual syntax (`~~strike~~` or `~~typo~~^correction`)
 * and simulated auto-typos.
 */
export function parseWordToken(
    rawWord: string,
    wordIndex: number,
    lineIndex: number,
    pageIndex: number,
    randomSeed: string,
    autoTypoRate: number,
    strikeStyle: StrikeStyle,
    autoCaret: boolean
): WordToken[] {
    // 1. Check manual strike markup: ~~word~~^correction or ~~word~~
    const strikeWithCaretMatch = rawWord.match(/^~~(.*?)~~\^(.*?)$/);
    if (strikeWithCaretMatch) {
        return [
            {
                text: strikeWithCaretMatch[1],
                isStruck: true,
                strikeStyle,
                caretCorrection: strikeWithCaretMatch[2],
            },
        ];
    }

    const strikeOnlyMatch = rawWord.match(/^~~(.*?)~~$/);
    if (strikeOnlyMatch) {
        return [
            {
                text: strikeOnlyMatch[1],
                isStruck: true,
                strikeStyle,
            },
        ];
    }

    // 2. Check if Auto-Typo should trigger for this word
    // Avoid triggering on tiny words, pure numbers, or punctuation
    const cleanWord = rawWord.replace(/[^a-zA-Z]/g, '');
    if (autoTypoRate > 0 && cleanWord.length >= 4) {
        const wordSeed = `${pageIndex}-${lineIndex}-${wordIndex}-${cleanWord}-${randomSeed}`;
        const typoChance = getDeterministicRandom(wordSeed + '-chance') * 100;

        // Auto typo rate is roughly 0 to 10% (scaled by rate setting)
        if (typoChance < autoTypoRate * 1.8) {
            const misspelled = generateTypo(rawWord, wordSeed);
            if (misspelled !== rawWord) {
                if (autoCaret) {
                    // Struck typo with caret correction above it
                    return [
                        {
                            text: misspelled,
                            isStruck: true,
                            strikeStyle,
                            caretCorrection: rawWord,
                            isTypo: true,
                        },
                    ];
                } else {
                    // Struck typo followed immediately by correct word
                    return [
                        {
                            text: misspelled,
                            isStruck: true,
                            strikeStyle,
                            isTypo: true,
                        },
                        {
                            text: rawWord,
                            isStruck: false,
                            strikeStyle,
                        },
                    ];
                }
            }
        }
    }

    // Normal non-struck word
    return [
        {
            text: rawWord,
            isStruck: false,
            strikeStyle,
        },
    ];
}

/**
 * Generate realistic SVG path data for a scratch-out scribble over a word
 */
export function generateScribblePath(
    width: number,
    height: number,
    style: StrikeStyle,
    seed: string
): string {
    const w = Math.max(width, 24);
    const h = Math.max(height, 16);
    const centerY = h * 0.52;

    switch (style) {
        case 'single': {
            // A swift, slightly angled horizontal strike
            const y1 = centerY + (getDeterministicRandom(seed + 's1') - 0.5) * 6;
            const y2 = centerY + (getDeterministicRandom(seed + 's2') - 0.5) * 6;
            return `M -3 ${y1} Q ${w * 0.5} ${centerY + (getDeterministicRandom(seed + 'sc') - 0.5) * 4}, ${w + 4} ${y2}`;
        }

        case 'double': {
            // Two rapid parallel horizontal strikes
            const y1 = centerY - 3 + (getDeterministicRandom(seed + 'd1') - 0.5) * 3;
            const y2 = centerY + 3 + (getDeterministicRandom(seed + 'd2') - 0.5) * 3;
            return `M -2 ${y1} L ${w + 3} ${y1 + (getDeterministicRandom(seed + 'd3') - 0.5) * 4} M -3 ${y2} L ${w + 4} ${y2 + (getDeterministicRandom(seed + 'd4') - 0.5) * 4}`;
        }

        case 'dense': {
            // A dense, vigorous back-and-forth blackout scribble
            const loops = Math.max(6, Math.floor(w / 7));
            let path = `M -2 ${centerY}`;
            const step = w / loops;
            for (let i = 0; i <= loops; i++) {
                const x = i * step;
                const topY = centerY - (h * 0.38) + (getDeterministicRandom(seed + 'dt' + i) - 0.5) * 4;
                const botY = centerY + (h * 0.38) + (getDeterministicRandom(seed + 'db' + i) - 0.5) * 4;
                if (i % 2 === 0) {
                    path += ` Q ${x - step * 0.2} ${topY}, ${x} ${topY}`;
                } else {
                    path += ` Q ${x - step * 0.2} ${botY}, ${x} ${botY}`;
                }
            }
            return path;
        }

        case 'wavy':
        default: {
            // Natural wavy back-and-forth loops
            const loops = Math.max(4, Math.floor(w / 12));
            let path = `M -4 ${centerY}`;
            const step = w / loops;
            for (let i = 0; i <= loops; i++) {
                const x = i * step;
                const yOffset = (i % 2 === 0 ? -1 : 1) * (h * 0.28 + getDeterministicRandom(seed + 'w' + i) * 3);
                path += ` S ${x - step * 0.5} ${centerY + yOffset}, ${x} ${centerY + (i % 2 === 0 ? 2 : -2)}`;
            }
            return path;
        }
    }
}
