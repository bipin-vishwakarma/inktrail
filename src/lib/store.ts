import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, FontPreference } from '../types';

// Default typography values for reset
const DEFAULT_TYPOGRAPHY = {
    fontSize: 28,
    letterSpacing: 0,
    lineHeight: 1.5,
    wordSpacing: 4,
};

export interface HistoryItem {
    id: string;
    timestamp: number;
    text: string;
}

type StateValues = {
    [K in keyof AppState as AppState[K] extends (...args: any[]) => any ? never : K]: AppState[K];
};

const initialState: StateValues = {
    text: '',
    lastSaved: null,
    zoom: 1,
    editorMode: 'plain',
    uploadedFileName: null,
    handwritingStyle: 'Cedarville Cursive',
    fontSize: DEFAULT_TYPOGRAPHY.fontSize,
    letterSpacing: DEFAULT_TYPOGRAPHY.letterSpacing,
    lineHeight: DEFAULT_TYPOGRAPHY.lineHeight,
    wordSpacing: DEFAULT_TYPOGRAPHY.wordSpacing,
    inkColor: '#1e40af',
    paperMaterial: 'ruled',
    paperSize: 'a4',
    paperOrientation: 'portrait',
    customFonts: [],
    customPaperImage: null,

    // Visual & Camera Effects Defaults
    paperShadow: true,
    inkBlur: 0,
    resolutionQuality: 2,
    paperTilt: false,
    paperTexture: true,
    phoneShadow: true,
    phoneShadowAngle: 125,
    phoneShadowIntensity: 0.45,
    phoneShadowVariation: true,
    perspectiveWarp: false,
    tiltX: 4,
    tiltY: -2,
    lightingMode: 'warm-lamp',
    lightingWarmth: 0.4,
    paperCrease: 'center-h',
    sensorNoise: 0.15,
    penType: 'ballpoint-blue',
    randomTilt: false,
    smartMarginIndexing: true,
    coffeeStain: false,
    spiralBinding: false,
    inkBleedThrough: true,
    inkBleedIntensity: 0.12,

    // Per-Page Scoping
    activePageIndex: 0,
    effectScope: 'all',
    pageEffectOverrides: {},

    // UI State
    hasSeenOnboarding: false,
    hasSeenTour: false,
    isSidebarCollapsed: false,
    isSettingsOpen: false,
    isRendering: false,
    renderingProgress: 0,
    expandedPanels: ['handwriting', 'typography', 'paper', 'human-errors', 'camera-lighting', 'effects'],
    isNavbarVisible: true,
    history: [],
    
    // Editor Refinements & Biological Simulation
    jitter: 1.5,
    charJitter: 0.3,
    fatigue: 1.5,
    pressure: 1.0,
    smudge: 0,
    baseline: -1,
    textAlign: 'left',
    marginTop: 60,
    marginBottom: 60,
    marginLeft: 70,
    marginRight: 25,
    showPageNumbers: false,
    showHeader: false,
    headerText: '',
    showNotebookHeaderBox: false,
    notebookDate: new Date().toLocaleDateString('en-GB'),
    notebookBrand: 'YOUVA',
    notebookDayCircle: true,

    // Human Errors & Strikes (Off by default)
    autoTypoRate: 0,
    strikeStyle: 'wavy',
    autoCaret: true,
    correctionColor: 'match',
    lowInkFade: false,
    lowInkStart: 45,
    lowInkIntensity: 0.65,
};

let persistTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingPersistValue: string | null = null;

if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        if (pendingPersistValue !== null) {
            try {
                localStorage.setItem('handwritten-core-storage', pendingPersistValue);
            } catch {
                // Ignore quota errors
            }
        }
    });
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            ...initialState,

            // Actions
            setText: (text) => set({ text }),
            setLastSaved: (lastSaved) => set({ lastSaved }),
            setZoom: (zoom) => set({ zoom }),
            setEditorMode: (editorMode) => set({ editorMode }),
            setUploadedFileName: (uploadedFileName) => set({ uploadedFileName }),
            setHandwritingStyle: (handwritingStyle) => set({ handwritingStyle }),
            setFontSize: (fontSize) => set({ fontSize }),
            setLetterSpacing: (letterSpacing) => set({ letterSpacing }),
            setLineHeight: (lineHeight) => set({ lineHeight }),
            setWordSpacing: (wordSpacing) => set({ wordSpacing }),
            setPaperMaterial: (paperMaterial) => set({ paperMaterial }),
            setPaperSize: (paperSize) => set({ paperSize }),
            setPaperOrientation: (paperOrientation) => set({ paperOrientation }),
            setInkColor: (inkColor) => set({ inkColor }),

            addCustomFont: (font) => set((state) => ({ customFonts: [...state.customFonts, font] })),
            removeCustomFont: (id) => set((state) => ({ customFonts: state.customFonts.filter(f => f.id !== id) })),
            resetTypography: () => set({ ...DEFAULT_TYPOGRAPHY }),
            setCustomPaperImage: (customPaperImage) => set({ customPaperImage }),
            
            // Visual Effects Actions
            setPaperShadow: (paperShadow) => set({ paperShadow }),
            setInkBlur: (inkBlur) => set({ inkBlur }),
            setResolutionQuality: (resolutionQuality) => set({ resolutionQuality }),
            setPaperTilt: (paperTilt) => set({ paperTilt }),
            setPaperTexture: (paperTexture) => set({ paperTexture }),
            setPhoneShadow: (phoneShadow) => set({ phoneShadow }),
            setPhoneShadowAngle: (phoneShadowAngle) => set({ phoneShadowAngle }),
            setPhoneShadowIntensity: (phoneShadowIntensity) => set({ phoneShadowIntensity }),
            setPhoneShadowVariation: (phoneShadowVariation) => set({ phoneShadowVariation }),
            setPerspectiveWarp: (perspectiveWarp) => set({ perspectiveWarp }),
            setTiltX: (tiltX) => set({ tiltX }),
            setTiltY: (tiltY) => set({ tiltY }),
            setLightingMode: (lightingMode) => set({ lightingMode }),
            setLightingWarmth: (lightingWarmth) => set({ lightingWarmth }),
            setPaperCrease: (paperCrease) => set({ paperCrease }),
            setSensorNoise: (sensorNoise) => set({ sensorNoise }),
            setPenType: (penType) => {
                const penColors: Record<string, string> = {
                    'ballpoint-blue': '#1e40af',
                    'gel-black': '#111827',
                    'fountain-blue': '#1d4ed8',
                    'pencil': '#4b5563',
                    'red-pen': '#dc2626',
                };
                set({ 
                    penType, 
                    inkColor: penColors[penType] || '#1e40af',
                    pressure: penType === 'pencil' ? 0.6 : penType === 'fountain-blue' ? 1.4 : 1.0,
                    inkBlur: penType === 'fountain-blue' ? 0.3 : 0
                });
            },
            setRandomTilt: (randomTilt) => set({ randomTilt }),
            setSmartMarginIndexing: (smartMarginIndexing) => set({ smartMarginIndexing }),
            setCoffeeStain: (coffeeStain) => set({ coffeeStain }),
            setSpiralBinding: (spiralBinding) => set({ spiralBinding }),
            setInkBleedThrough: (inkBleedThrough) => set({ inkBleedThrough }),
            setInkBleedIntensity: (inkBleedIntensity) => set({ inkBleedIntensity }),

            // Per-Page Scoping Actions
            setActivePageIndex: (activePageIndex) => set({ activePageIndex }),
            setEffectScope: (effectScope) => set({ effectScope }),
            setPageEffectOverride: (pageIndex, overrides) => set((state) => ({
                pageEffectOverrides: {
                    ...state.pageEffectOverrides,
                    [pageIndex]: {
                        ...state.pageEffectOverrides[pageIndex],
                        ...overrides
                    }
                }
            })),
            clearPageEffectOverrides: (pageIndex) => set((state) => {
                if (pageIndex !== undefined) {
                    const next = { ...state.pageEffectOverrides };
                    delete next[pageIndex];
                    return { pageEffectOverrides: next };
                }
                return { pageEffectOverrides: {} };
            }),
            applyPageEffectsToAll: (pageIndex) => set((state) => {
                const current = state.pageEffectOverrides[pageIndex];
                if (!current) return state;
                return {
                    ...current,
                    pageEffectOverrides: {}
                };
            }),

            // Granular Reset Actions
            resetFormatting: () => set({
                fontSize: DEFAULT_TYPOGRAPHY.fontSize,
                lineHeight: DEFAULT_TYPOGRAPHY.lineHeight,
                letterSpacing: DEFAULT_TYPOGRAPHY.letterSpacing,
                wordSpacing: DEFAULT_TYPOGRAPHY.wordSpacing,
                jitter: 1.5,
                charJitter: 0.3,
                pressure: 1.0,
                baseline: -1,
                fatigue: 1.5,
                autoTypoRate: 0,
                autoCaret: true,
                strikeStyle: 'wavy',
                correctionColor: 'match',
                lowInkFade: false,
                lowInkStart: 45,
                lowInkIntensity: 0.65,
            }),
            resetEffects: () => set({
                paperTilt: false,
                perspectiveWarp: false,
                tiltX: 0,
                tiltY: 0,
                randomTilt: false,
                lightingMode: 'warm-lamp',
                lightingWarmth: 0.4,
                phoneShadow: true,
                phoneShadowAngle: 125,
                phoneShadowIntensity: 0.45,
                phoneShadowVariation: true,
                paperCrease: 'center-h',
                sensorNoise: 0.15,
                coffeeStain: false,
                pageEffectOverrides: {},
            }),
            resetPaperSettings: () => set({
                paperMaterial: 'college',
                paperSize: 'a4',
                paperOrientation: 'portrait',
                penType: 'ballpoint-blue',
                inkColor: '#1e40af',
                handwritingStyle: 'Cedarville Cursive',
                smartMarginIndexing: true,
                marginTop: 60,
                marginBottom: 60,
                marginLeft: 70,
                marginRight: 25,
            }),
            randomizeRealism: () => set((state) => {
                const perturb = (base: number, delta: number, min: number, max: number, decimals = 2) => {
                    const shift = (Math.random() * 2 - 1) * delta;
                    return Number(Math.max(min, Math.min(max, base + shift)).toFixed(decimals));
                };

                // Subtle perturbation around current user settings
                const newJitter = perturb(state.jitter || 1.5, 0.3, 0.8, 3.0, 2);
                const newCharJitter = Number((newJitter * 0.82).toFixed(2));
                const newPressure = perturb(state.pressure || 1.0, 0.08, 0.75, 1.0, 2);
                const newBaseline = perturb(state.baseline || -1, 0.6, -3, 2, 1);
                const newFatigue = perturb(state.fatigue || 1.5, 0.35, 0.5, 3.0, 2);

                // Phone Cast Shadow perturbations (angle +-18 deg, intensity +-0.05)
                const newShadowAngle = Math.round(perturb(state.phoneShadowAngle || 125, 18, 45, 165, 0));
                const newShadowIntensity = perturb(state.phoneShadowIntensity || 0.45, 0.05, 0.28, 0.50, 2);

                // Extremely subtle tilt (+-0.5 deg) so image capturing / export never clips
                const currentTiltX = typeof state.tiltX === 'number' ? state.tiltX : 1.5;
                const newTiltX = perturb(currentTiltX, 0.5, -1.8, 2.0, 1);
                const currentTiltY = typeof state.tiltY === 'number' ? state.tiltY : -1.0;
                const newTiltY = perturb(currentTiltY, 0.4, -1.5, 1.5, 1);

                // Subtle desk lamp warmth variation
                const newWarmth = perturb(state.lightingWarmth || 0.4, 0.06, 0.25, 0.55, 2);

                return {
                    jitter: newJitter,
                    charJitter: newCharJitter,
                    pressure: newPressure,
                    baseline: newBaseline,
                    fatigue: newFatigue,
                    phoneShadow: true,
                    phoneShadowAngle: newShadowAngle,
                    phoneShadowIntensity: newShadowIntensity,
                    phoneShadowVariation: true,
                    tiltX: newTiltX,
                    tiltY: newTiltY,
                    lightingWarmth: newWarmth,
                    randomTilt: true,
                };
            }),

            // Human Error & Fatigue Actions
            setCharJitter: (charJitter) => set({ charJitter }),
            setFatigue: (fatigue) => set({ fatigue }),
            setAutoTypoRate: (autoTypoRate) => set({ autoTypoRate }),
            setStrikeStyle: (strikeStyle) => set({ strikeStyle }),
            setAutoCaret: (autoCaret) => set({ autoCaret }),
            setCorrectionColor: (correctionColor) => set({ correctionColor }),
            setLowInkFade: (lowInkFade) => set({ lowInkFade }),
            setLowInkStart: (lowInkStart) => set({ lowInkStart }),
            setLowInkIntensity: (lowInkIntensity) => set({ lowInkIntensity }),

            completeOnboarding: () => set({ hasSeenOnboarding: true }),
            completeTour: () => set({ hasSeenTour: true }),
            setSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
            setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
            setExpandedPanels: (expandedPanels) => set({ expandedPanels }),
            togglePanel: (panel) => set((state) => ({
                expandedPanels: state.expandedPanels.includes(panel)
                    ? state.expandedPanels.filter(p => p !== panel)
                    : [...state.expandedPanels, panel]
            })),
            setIsRendering: (isRendering) => set({ isRendering }),
            setRenderingProgress: (renderingProgress) => set({ renderingProgress }),
            setNavbarVisible: (isNavbarVisible) => set({ isNavbarVisible }),
            applyPreset: (settings) => set((state) => ({ ...state, ...settings })),
            addToHistory: (item) => set((state) => ({ 
                history: [item, ...state.history].slice(0, 50)
            })),

            // Editor Refinement Actions
            setJitter: (jitter) => set({ jitter }),
            setPressure: (pressure) => set({ pressure }),
            setSmudge: (smudge) => set({ smudge }),
            setBaseline: (baseline) => set({ baseline }),
            setTextAlign: (textAlign) => set({ textAlign }),
            setMargins: (margins) => set((state) => ({
                marginTop: margins.top ?? state.marginTop,
                marginBottom: margins.bottom ?? state.marginBottom,
                marginLeft: margins.left ?? state.marginLeft,
                marginRight: margins.right ?? state.marginRight,
            })),
            setPageOptions: (options) => set((state) => ({
                showPageNumbers: options.showPageNumbers ?? state.showPageNumbers,
                showHeader: options.showHeader ?? state.showHeader,
                headerText: options.headerText ?? state.headerText,
            })),
            setShowNotebookHeaderBox: (showNotebookHeaderBox) => set({ showNotebookHeaderBox }),
            setNotebookDate: (notebookDate) => set({ notebookDate }),
            setNotebookBrand: (notebookBrand) => set({ notebookBrand }),
            setNotebookDayCircle: (notebookDayCircle) => set({ notebookDayCircle }),

            resetStyles: () => set((state) => ({
                ...initialState,
                text: state.text,
                history: state.history,
            })),
            reset: () => set(() => initialState),
        }),
        {
            name: 'handwritten-core-storage',
            storage: {
                getItem: (name) => {
                    const str = localStorage.getItem(name);
                    if (!str) return null;
                    try {
                        const data = JSON.parse(str);
                        if (data?.state) {
                            if (data.state.lastSaved) data.state.lastSaved = new Date(data.state.lastSaved);
                            if (data.state.autoTypoRate === 2) data.state.autoTypoRate = 0;
                            if (typeof data.state.handwritingStyle === 'string') {
                                if (data.state.handwritingStyle.startsWith('handwriting-')) {
                                    data.state.handwritingStyle = data.state.handwritingStyle.replace('handwriting-', 'Handwriting ');
                                }
                                const VALID_HANDWRITING_FONTS = [
                                    'Meddon', 'Kristi', 'WindSong', 'Cedarville Cursive', 'League Script', 'Square Peg',
                                    'La Belle Aurore', 'Waiting for the Sunrise', 'Marck Script', 'Zeyada', 'Dawning of a New Day',
                                    'Handwriting 4', 'Handwriting 20', 'Handwriting 2', 'Handwriting 5',
                                    'Nothing You Could Do', 'Mynerve', 'Just Me Again Down Here', 'Just Another Hand',
                                    'The Girl Next Door', 'Sue Ellen Francisco', 'Loved by the King', 'Give You Glory', 'Bad Script'
                                ];
                                if (!VALID_HANDWRITING_FONTS.includes(data.state.handwritingStyle)) {
                                    data.state.handwritingStyle = 'Cedarville Cursive';
                                }
                            }
                        }
                        return data;
                    } catch {
                        return null;
                    }
                },
                setItem: (name, value) => {
                    // Debounce localStorage writes to prevent frame drops during rapid typing
                    pendingPersistValue = JSON.stringify(value);
                    if (persistTimeout) return;
                    persistTimeout = setTimeout(() => {
                        if (pendingPersistValue !== null) {
                            try {
                                localStorage.setItem(name, pendingPersistValue);
                            } catch (e) {
                                console.warn('LocalStorage save failed:', e);
                            }
                            pendingPersistValue = null;
                        }
                        persistTimeout = null;
                    }, 400);
                },
                removeItem: (name) => {
                    if (persistTimeout) clearTimeout(persistTimeout);
                    pendingPersistValue = null;
                    localStorage.removeItem(name);
                },
            }
        }
    )
);

export const getAvailableFonts = (state: AppState) => {
    const curatedFonts: FontPreference[] = [
        // Rushed Doctor & Frantic Cursive Notes
        { id: 'meddon', name: "Doctor's Prescription (Rapid Connecting Ink Scrawl)", family: 'Meddon', type: 'custom' },
        { id: 'kristi', name: 'Frantic Student Cursive (Rushed Slanted Pen)', family: 'Kristi', type: 'custom' },
        { id: 'windsong', name: 'Rapid Medical Script (Flowing Connected Cursive)', family: 'WindSong', type: 'custom' },
        { id: 'cedarville-cursive', name: 'Student Cursive (Natural Continuous Flow)', family: 'Cedarville Cursive', type: 'custom' },
        { id: 'league-script', name: 'School Running Hand (Continuous Connected Ligatures)', family: 'League Script', type: 'custom' },
        { id: 'square-peg', name: 'Rapid Modern Cursive (Connected Flow)', family: 'Square Peg', type: 'custom' },
        { id: 'la-belle-aurore', name: 'Student Cursive (Fast Ink Pen)', family: 'La Belle Aurore', type: 'custom' },
        { id: 'waiting-for-the-sunrise', name: 'Notebook Cursive (Slanted Homework)', family: 'Waiting for the Sunrise', type: 'custom' },
        { id: 'marck-script', name: 'School Cursive (Fluid Script)', family: 'Marck Script', type: 'custom' },
        { id: 'zeyada', name: 'Loose Cursive (Casual Rushed Student)', family: 'Zeyada', type: 'custom' },
        { id: 'dawning-of-a-new-day', name: 'Fine Ballpoint (Light Cursive)', family: 'Dawning of a New Day', type: 'custom' },
        { id: 'handwriting-4', name: 'Student Cursive (Fluid Natural Slant)', family: 'Handwriting 4', type: 'custom' },
        { id: 'handwriting-20', name: 'Student Cursive (Clean Rapid Flow)', family: 'Handwriting 20', type: 'custom' },
        { id: 'handwriting-2', name: 'Student Pen (Casual Natural Slant)', family: 'Handwriting 2', type: 'custom' },
        { id: 'handwriting-5', name: 'Student Pen (Fast Exam Flow)', family: 'Handwriting 5', type: 'custom' },

        // Authentic Rushed Student Homework & Ballpoint Scribbles
        { id: 'nothing-you-could-do', name: 'Student Homework (Authentic Ballpoint)', family: 'Nothing You Could Do', type: 'custom' },
        { id: 'mynerve', name: 'Rushed Student Scribble (Messy Ballpoint with Real Jitter)', family: 'Mynerve', type: 'custom' },
        { id: 'just-me-again-down-here', name: 'Student Notes (Rushed & Imperfect)', family: 'Just Me Again Down Here', type: 'custom' },
        { id: 'just-another-hand', name: 'Rapid Lecture Scrawl (Narrow Fast Pen)', family: 'Just Another Hand', type: 'custom' },
        { id: 'the-girl-next-door', name: 'Quick Notebook Scrawl (Natural Casual Hand)', family: 'The Girl Next Door', type: 'custom' },
        { id: 'sue-ellen-francisco', name: 'Hurried Fine Scrawl (Quick Notes)', family: 'Sue Ellen Francisco', type: 'custom' },
        { id: 'loved-by-the-king', name: 'Messy Tall Scrawl (Fast Class Notes)', family: 'Loved by the King', type: 'custom' },
        { id: 'give-you-glory', name: 'Hurried Student Hand (Imperfect Exam Notes)', family: 'Give You Glory', type: 'custom' },
        { id: 'bad-script', name: 'Casual Ballpoint (Homework Notes)', family: 'Bad Script', type: 'custom' },
    ];

    return [...curatedFonts, ...state.customFonts];
};

