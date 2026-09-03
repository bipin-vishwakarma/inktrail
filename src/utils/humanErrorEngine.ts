import type { StrikeStyle } from '../types';

/**
 * Deterministic hash function to generate consistent pseudo-random values
 * based on word, line, page, and seed.
 */
export function getDeterministicRandom(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash % 100000) / 100000;
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
};

// Adjacent QWERTY keyboard keys for typo generation
const KEYBOARD_ADJACENT: Record<string, string[]> = {
    a: ['s', 'q', 'z', 'w'],
    b: ['v', 'g', 'h', 'n'],
    c: ['x', 'd', 'f', 'v'],
    d: ['s', 'e', 'r', 'f', 'x', 'c'],
    e: ['w', 's', 'd', 'r'],
    f: ['d', 'r', 't', 'g', 'c', 'v'],
    g: ['f', 't', 'y', 'h', 'v', 'b'],
    h: ['g', 'y', 'u', 'j', 'b', 'n'],
    i: ['u', 'j', 'k', 'o'],
    j: ['h', 'u', 'i', 'k', 'n', 'm'],
    k: ['j', 'i', 'o', 'l', 'm'],
    l: ['k', 'o', 'p'],
    m: ['n', 'j', 'k'],
    n: ['b', 'h', 'j', 'm'],
    o: ['i', 'k', 'l', 'p'],
    p: ['o', 'l'],
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
 * Generate a realistic simulated human typo from a clean word
 */
export function generateTypo(word: string, seed: string): string {
    const clean = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (clean.length < 3) return word;

    // 1. Check known typo map
    if (TYPO_MAP[clean]) {
        const typo = TYPO_MAP[clean];
        // Preserve original capitalization
        if (word[0] === word[0].toUpperCase()) {
            return typo.charAt(0).toUpperCase() + typo.slice(1);
        }
        return typo;
    }

    const rand = getDeterministicRandom(seed + '-typomode');
    const chars = word.split('');

    if (rand < 0.4 && chars.length > 3) {
        // Swap adjacent letters
        const idx = 1 + Math.floor(getDeterministicRandom(seed + '-swap') * (chars.length - 2));
        const temp = chars[idx];
        chars[idx] = chars[idx + 1];
        chars[idx + 1] = temp;
        return chars.join('');
    } else if (rand < 0.7) {
        // Adjacent key typo
        const idx = Math.floor(getDeterministicRandom(seed + '-adj') * chars.length);
        const origChar = chars[idx].toLowerCase();
        const adjList = KEYBOARD_ADJACENT[origChar];
        if (adjList && adjList.length > 0) {
            const replacement = adjList[Math.floor(getDeterministicRandom(seed + '-key') * adjList.length)];
            chars[idx] = chars[idx] === chars[idx].toUpperCase() ? replacement.toUpperCase() : replacement;
            return chars.join('');
        }
    } else {
        // Double letter or drop letter
        const idx = Math.floor(getDeterministicRandom(seed + '-drop') * chars.length);
        if (getDeterministicRandom(seed + '-dd') > 0.5) {
            chars.splice(idx, 0, chars[idx]); // Double letter
        } else if (chars.length > 4) {
            chars.splice(idx, 1); // Drop letter
        }
        return chars.join('');
    }

    return word;
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
