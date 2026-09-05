/**
 * Camera Shadow Simulation Engine
 * Generates realistic, organic smartphone cast shadow variations across multi-page documents.
 * Simulates human handheld camera repositioning, distance variance, micro-tilts and directional light falloff.
 */

export interface PageShadowParams {
    enabled: boolean;
    angle: number;
    intensity: number;
    shadowX: number;
    shadowY: number;
    width: number;
    height: number;
    penumbra: number;
}

export interface ShadowOverrideInput {
    phoneShadow?: boolean;
    phoneShadowAngle?: number;
    phoneShadowIntensity?: number;
}

/**
 * Computes deterministic, natural per-page variations for smartphone cast shadows.
 * Page 1 matches user base settings cleanly.
 * Subsequent pages feature natural organic shifts in angle (+-15° to 22°), position (+-10%),
 * intensity (+-0.06), and shadow ellipse dimensions (+-8%), mimicking real photo captures.
 */
export function computePagePhoneShadow(
    pageIndex: number,
    baseEnabled: boolean,
    baseAngle: number,
    baseIntensity: number,
    seed: number = 0,
    variationEnabled: boolean = true,
    pageOverride?: ShadowOverrideInput
): PageShadowParams {
    const enabled = pageOverride?.phoneShadow !== undefined ? pageOverride.phoneShadow : baseEnabled;
    if (!enabled) {
        return {
            enabled: false,
            angle: baseAngle,
            intensity: baseIntensity,
            shadowX: 50,
            shadowY: 50,
            width: 70,
            height: 55,
            penumbra: 75,
        };
    }

    const hasCustomAngle = pageOverride?.phoneShadowAngle !== undefined;
    const hasCustomIntensity = pageOverride?.phoneShadowIntensity !== undefined;

    // If active page has manual custom overrides, or variation is disabled, respect exact values
    if (hasCustomAngle || hasCustomIntensity || !variationEnabled) {
        const angle = pageOverride?.phoneShadowAngle !== undefined ? pageOverride.phoneShadowAngle : baseAngle;
        const intensity = pageOverride?.phoneShadowIntensity !== undefined ? pageOverride.phoneShadowIntensity : baseIntensity;
        const rad = (angle * Math.PI) / 180;
        return {
            enabled: true,
            angle,
            intensity,
            shadowX: Math.round(50 + Math.cos(rad) * 45),
            shadowY: Math.round(50 + Math.sin(rad) * 45),
            width: 72,
            height: 56,
            penumbra: 75,
        };
    }

    // Page 0 (First Sheet): reflects base chosen angle and intensity
    if (pageIndex === 0) {
        const rad = (baseAngle * Math.PI) / 180;
        return {
            enabled: true,
            angle: baseAngle,
            intensity: baseIntensity,
            shadowX: Math.round(50 + Math.cos(rad) * 45),
            shadowY: Math.round(50 + Math.sin(rad) * 45),
            width: 72,
            height: 56,
            penumbra: 75,
        };
    }

    // Multi-page variation (pageIndex > 0): organic hand-held smartphone drift
    const p = pageIndex + 1;
    const s = seed || 1;

    // 1. Natural angle rotation (+-14° to 22°)
    const angleDrift = Math.sin(p * 4.87 + s * 1.31) * 16 + Math.cos(p * 2.73 + s * 0.73) * 7;
    const angle = Math.round(((baseAngle + angleDrift) % 360 + 360) % 360);

    // 2. Natural intensity / height fluctuation (+-0.06)
    const intensityDrift = Math.sin(p * 5.63 + s * 2.19) * 0.065;
    const intensity = Math.min(0.75, Math.max(0.18, Number((baseIntensity + intensityDrift).toFixed(2))));

    // 3. Natural handheld lateral offset (X, Y)
    const rad = (angle * Math.PI) / 180;
    const offsetX = Math.cos(p * 3.41 + s * 0.88) * 8 + Math.sin(p * 1.95) * 4;
    const offsetY = Math.sin(p * 3.89 + s * 1.15) * 8 + Math.cos(p * 2.13) * 3;
    const shadowX = Math.round(Math.min(92, Math.max(8, 50 + Math.cos(rad) * 45 + offsetX)));
    const shadowY = Math.round(Math.min(92, Math.max(8, 50 + Math.sin(rad) * 45 + offsetY)));

    // 4. Subtle variance in ellipse width & height (simulating phone tilt & distance)
    const width = Math.round(72 + Math.sin(p * 4.15 + s) * 7); // 65% - 79%
    const height = Math.round(56 + Math.cos(p * 3.71 + s) * 6); // 50% - 62%
    const penumbra = Math.round(75 + Math.sin(p * 2.9) * 4);

    return {
        enabled: true,
        angle,
        intensity,
        shadowX,
        shadowY,
        width,
        height,
        penumbra,
    };
}
