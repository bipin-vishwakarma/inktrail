export type HandwritingStyle = string;

export interface FontPreference {
    id: string;
    name: string;
    family: string;
    type: 'google' | 'custom';
    url?: string;
}

export type PaperMaterial = 'white' | 'ruled' | 'graph' | 'dotted' | 'vintage' | 'aged' | 'cream' | 'college' | 'wide' | 'love-letter' | 'birthday' | 'christmas' | 'professional' | 'custom';
export type PaperSize = 'a4' | 'letter' | 'a5' | 'a6' | 'legal' | 'tabloid';
export type PaperOrientation = 'portrait' | 'landscape';

export type StrikeStyle = 'wavy' | 'dense' | 'single' | 'double';
export type LightingMode = 'flat' | 'warm-lamp' | 'cool-daylight' | 'scanner-contrast' | 'flash';
export type PaperCrease = 'none' | 'center-h' | 'cross' | 'corner-fold' | 'letter-tri-fold' | 'crumpled' | 'spiral-holes' | 'diagonal-crease' | 'vintage-worn';
export type PenType = 'ballpoint-blue' | 'gel-black' | 'fountain-blue' | 'pencil' | 'red-pen' | 'custom';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Token {
    type: 'tag' | 'text';
    tagName?: string;
    isClosing?: boolean;
    attributes?: { src?: string };
    content?: string;
}

export interface HistoryItem {
    id: string;
    timestamp: number;
    text: string;
}

export interface PageEffectOverrides {
    paperCrease?: PaperCrease;
    coffeeStain?: boolean;
    perspectiveWarp?: boolean;
    tiltX?: number;
    tiltY?: number;
    lightingMode?: LightingMode;
    lightingWarmth?: number;
    phoneShadow?: boolean;
    phoneShadowIntensity?: number;
    phoneShadowAngle?: number;
    sensorNoise?: number;
}

export interface AppState {
    penType: PenType;
    text: string;
    // History
    history: HistoryItem[];
    lastSaved: Date | null;
    zoom: number;
    editorMode: 'plain' | 'rich';
    uploadedFileName: string | null;
    handwritingStyle: HandwritingStyle;
    fontSize: number;
    letterSpacing: number;
    lineHeight: number;
    wordSpacing: number;
    inkColor: string;
    paperMaterial: PaperMaterial;
    paperSize: PaperSize;
    paperOrientation: PaperOrientation;
    customFonts: FontPreference[];
    customPaperImage: string | null;
    hasSeenOnboarding: boolean;
    hasSeenTour: boolean;

    // Visual & Camera Effects
    paperShadow: boolean;
    inkBlur: number;
    resolutionQuality: number;
    paperTilt: boolean;
    paperTexture: boolean;
    phoneShadow: boolean;
    phoneShadowAngle: number;
    phoneShadowIntensity: number;
    perspectiveWarp: boolean;
    tiltX: number;
    tiltY: number;
    lightingMode: LightingMode;
    lightingWarmth: number;
    paperCrease: PaperCrease;
    sensorNoise: number;
    randomTilt: boolean;
    smartMarginIndexing: boolean;
    coffeeStain: boolean;

    // Per-Page Scoping & Overrides
    activePageIndex: number;
    effectScope: 'current' | 'all';
    pageEffectOverrides: Record<number, PageEffectOverrides>;

    // UI State
    isSidebarCollapsed: boolean;
    isSettingsOpen: boolean;
    isRendering: boolean;
    renderingProgress: number;
    expandedPanels: string[];
    isNavbarVisible: boolean;
    
    // Editor Refinements & Biological Simulation
    jitter: number;
    charJitter: number;
    fatigue: number;
    pressure: number;
    smudge: number;
    baseline: number;
    textAlign: 'left' | 'center' | 'right' | 'justify';
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
    showPageNumbers: boolean;
    showHeader: boolean;
    headerText: string;

    // Human Errors, Strikes & Ink Drying
    autoTypoRate: number;
    strikeStyle: StrikeStyle;
    autoCaret: boolean;
    lowInkFade: boolean;
    lowInkStart: number;
    lowInkIntensity: number;

    // Actions
    setText: (text: string) => void;
    setLastSaved: (date: Date | null) => void;
    setZoom: (zoom: number) => void;
    setEditorMode: (mode: 'plain' | 'rich') => void;
    setUploadedFileName: (name: string | null) => void;
    setHandwritingStyle: (style: HandwritingStyle) => void;
    setFontSize: (size: number) => void;
    setLetterSpacing: (spacing: number) => void;
    setLineHeight: (height: number) => void;
    setWordSpacing: (spacing: number) => void;
    setPaperMaterial: (material: PaperMaterial) => void;
    setPaperSize: (size: PaperSize) => void;
    setPaperOrientation: (orientation: PaperOrientation) => void;
    setInkColor: (color: string) => void;
    addCustomFont: (font: FontPreference) => void;
    removeCustomFont: (id: string) => void;
    resetTypography: () => void;
    setCustomPaperImage: (image: string | null) => void;

    // Visual Effects Actions
    setPaperShadow: (enabled: boolean) => void;
    setInkBlur: (value: number) => void;
    setResolutionQuality: (value: number) => void;
    setPaperTilt: (enabled: boolean) => void;
    setPaperTexture: (enabled: boolean) => void;
    setPhoneShadow: (enabled: boolean) => void;
    setPhoneShadowAngle: (angle: number) => void;
    setPhoneShadowIntensity: (intensity: number) => void;
    setPerspectiveWarp: (enabled: boolean) => void;
    setTiltX: (deg: number) => void;
    setTiltY: (deg: number) => void;
    setLightingMode: (mode: LightingMode) => void;
    setLightingWarmth: (val: number) => void;
    setPaperCrease: (crease: PaperCrease) => void;
    setSensorNoise: (val: number) => void;
    setPenType: (pen: PenType) => void;
    setRandomTilt: (enabled: boolean) => void;
    setSmartMarginIndexing: (enabled: boolean) => void;
    setCoffeeStain: (enabled: boolean) => void;

    // Per-Page Scoping Actions
    setActivePageIndex: (index: number) => void;
    setEffectScope: (scope: 'current' | 'all') => void;
    setPageEffectOverride: (pageIndex: number, overrides: Partial<PageEffectOverrides>) => void;
    clearPageEffectOverrides: (pageIndex?: number) => void;
    applyPageEffectsToAll: (pageIndex: number) => void;

    // Granular Reset & Randomizer Actions
    resetFormatting: () => void;
    resetEffects: () => void;
    resetPaperSettings: () => void;
    randomizeRealism: () => void;

    // Human Error & Fatigue Actions
    setCharJitter: (val: number) => void;
    setFatigue: (val: number) => void;
    setAutoTypoRate: (rate: number) => void;
    setStrikeStyle: (style: StrikeStyle) => void;
    setAutoCaret: (enabled: boolean) => void;
    setLowInkFade: (enabled: boolean) => void;
    setLowInkStart: (val: number) => void;
    setLowInkIntensity: (val: number) => void;

    // Onboarding Actions
    completeOnboarding: () => void;
    completeTour: () => void;

    // UI Actions
    setSidebarCollapsed: (collapsed: boolean) => void;
    setSettingsOpen: (open: boolean) => void;
    setExpandedPanels: (panels: string[]) => void;
    togglePanel: (panel: string) => void;
    setIsRendering: (isRendering: boolean) => void;
    setRenderingProgress: (progress: number) => void;
    setNavbarVisible: (visible: boolean) => void;
    
    // Editor Refinement Actions
    setJitter: (value: number) => void;
    setPressure: (value: number) => void;
    setSmudge: (value: number) => void;
    setBaseline: (value: number) => void;
    setTextAlign: (align: 'left' | 'center' | 'right' | 'justify') => void;
    setMargins: (margins: { top?: number; bottom?: number; left?: number; right?: number }) => void;
    setPageOptions: (options: { showPageNumbers?: boolean; showHeader?: boolean; headerText?: string }) => void;
    
    applyPreset: (settings: Partial<AppState>) => void;
    addToHistory: (item: HistoryItem) => void;

    resetStyles: () => void;
    reset: () => void;
}

