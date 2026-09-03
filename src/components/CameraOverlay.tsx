import React from 'react';
import type { LightingMode, PaperCrease } from '../types';

interface CameraOverlayProps {
    phoneShadow: boolean;
    phoneShadowAngle: number;
    phoneShadowIntensity: number;
    lightingMode: LightingMode;
    lightingWarmth: number;
    paperCrease: PaperCrease;
    sensorNoise: number;
}

export const CameraOverlay: React.FC<CameraOverlayProps> = ({
    phoneShadow,
    phoneShadowAngle,
    phoneShadowIntensity,
    lightingMode,
    lightingWarmth,
    paperCrease,
    sensorNoise,
}) => {
    // Calculate Phone Shadow gradient based on angle
    const rad = (phoneShadowAngle * Math.PI) / 180;
    const shadowX = Math.round(50 + Math.cos(rad) * 45);
    const shadowY = Math.round(50 + Math.sin(rad) * 45);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[ inherit ] z-20">
            {/* 1. ROOM LIGHTING MODE OVERLAY */}
            {lightingMode === 'warm-lamp' && (
                <div
                    className="absolute inset-0 mix-blend-color"
                    style={{
                        background: `radial-gradient(ellipse at 25% 15%, rgba(255, 238, 195, ${lightingWarmth * 0.75}) 0%, rgba(245, 220, 160, ${lightingWarmth * 0.45}) 50%, rgba(180, 150, 100, ${lightingWarmth * 0.25}) 100%)`,
                        opacity: 0.9,
                    }}
                />
            )}

            {lightingMode === 'cool-daylight' && (
                <div
                    className="absolute inset-0 mix-blend-overlay"
                    style={{
                        background: 'linear-gradient(135deg, rgba(235, 245, 255, 0.3) 0%, rgba(200, 225, 255, 0.15) 100%)',
                    }}
                />
            )}

            {lightingMode === 'flash' && (
                <div
                    className="absolute inset-0 mix-blend-overlay"
                    style={{
                        background: 'radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.15) 45%, rgba(0, 0, 0, 0.35) 100%)',
                    }}
                />
            )}

            {lightingMode === 'scanner-contrast' && (
                <div
                    className="absolute inset-0 mix-blend-contrast"
                    style={{
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(0,0,0,0.08))',
                    }}
                />
            )}

            {/* 2. REALISTIC SMARTPHONE CAST SHADOW */}
            {phoneShadow && (
                <div
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(ellipse 70% 55% at ${shadowX}% ${shadowY}%, rgba(15, 23, 42, ${phoneShadowIntensity * 0.75}) 0%, rgba(30, 41, 59, ${phoneShadowIntensity * 0.35}) 40%, transparent 75%)`,
                        mixBlendMode: 'multiply',
                    }}
                />
            )}

            {/* 3. PAPER CREASES & FOLDS */}
            {paperCrease === 'center-h' && (
                <div className="absolute inset-0 pointer-events-none">
                    {/* Horizontal Center Crease */}
                    <div
                        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px]"
                        style={{
                            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.12), rgba(255, 255, 255, 0.25) 50%, rgba(0, 0, 0, 0.08) 100%)',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                        }}
                    />
                </div>
            )}

            {paperCrease === 'cross' && (
                <div className="absolute inset-0 pointer-events-none">
                    {/* Horizontal Fold */}
                    <div
                        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px]"
                        style={{
                            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.12), rgba(255, 255, 255, 0.25) 50%, rgba(0, 0, 0, 0.08) 100%)',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                        }}
                    />
                    {/* Vertical Fold */}
                    <div
                        className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px]"
                        style={{
                            background: 'linear-gradient(to right, rgba(0, 0, 0, 0.12), rgba(255, 255, 255, 0.25) 50%, rgba(0, 0, 0, 0.08) 100%)',
                            boxShadow: '1px 0 3px rgba(0, 0, 0, 0.06)',
                        }}
                    />
                </div>
            )}

            {paperCrease === 'corner-fold' && (
                <div
                    className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
                    style={{
                        background: 'linear-gradient(135deg, transparent 49%, rgba(0,0,0,0.12) 50%, rgba(255,255,255,0.4) 52%, rgba(0,0,0,0.06) 55%, transparent 60%)',
                    }}
                />
            )}

            {/* 4. SENSOR NOISE & GRAIN */}
            {sensorNoise > 0.05 && (
                <div
                    className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='${sensorNoise * 0.8}'/%3E%3C/svg%3E")`,
                    }}
                />
            )}

            {/* 5. LENS VIGNETTE (FALLOFF AT CORNERS) */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(0, 0, 0, 0.08) 100%)',
                }}
            />
        </div>
    );
};
