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

const CameraOverlayComponent: React.FC<CameraOverlayProps> = ({
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
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] z-20">
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
                    className="absolute inset-0 mix-blend-overlay"
                    style={{
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(0,0,0,0.12))',
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

            {paperCrease === 'letter-tri-fold' && (
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="absolute left-0 right-0 top-[33.3%] -translate-y-1/2 h-[2px]"
                        style={{
                            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.14), rgba(255, 255, 255, 0.3) 50%, rgba(0, 0, 0, 0.08) 100%)',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                        }}
                    />
                    <div
                        className="absolute left-0 right-0 top-[66.6%] -translate-y-1/2 h-[2px]"
                        style={{
                            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.14), rgba(255, 255, 255, 0.3) 50%, rgba(0, 0, 0, 0.08) 100%)',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                        }}
                    />
                </div>
            )}

            {paperCrease === 'crumpled' && (
                <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-40">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <line x1="8%" y1="0%" x2="42%" y2="52%" stroke="rgba(0,0,0,0.22)" strokeWidth="1.5" filter="blur(0.5px)" />
                        <line x1="42%" y1="52%" x2="92%" y2="38%" stroke="rgba(0,0,0,0.18)" strokeWidth="1.2" />
                        <line x1="42%" y1="52%" x2="28%" y2="100%" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" />
                        <line x1="0%" y1="35%" x2="42%" y2="52%" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
                        <line x1="68%" y1="12%" x2="42%" y2="52%" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
                        <line x1="42%" y1="52%" x2="88%" y2="88%" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
                        <line x1="18%" y1="78%" x2="42%" y2="52%" stroke="rgba(0,0,0,0.16)" strokeWidth="1" />
                        <line x1="58%" y1="0%" x2="72%" y2="45%" stroke="rgba(0,0,0,0.12)" strokeWidth="1.2" />
                        <line x1="72%" y1="45%" x2="100%" y2="68%" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
                        <polygon points="10,0 420,520 280,1000 0,600" fill="rgba(0,0,0,0.03)" />
                        <polygon points="420,520 900,380 880,880" fill="rgba(255,255,255,0.05)" />
                    </svg>
                </div>
            )}

            {paperCrease === 'spiral-holes' && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 bottom-0 left-[26px] border-r border-dashed border-neutral-300 opacity-60" />
                    <div className="absolute top-4 bottom-4 left-[8px] flex flex-col justify-between items-center w-[12px]">
                        {Array.from({ length: 18 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-[10px] h-[10px] rounded-full bg-[#dce3ec] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.4)] border border-neutral-300/40"
                            />
                        ))}
                    </div>
                </div>
            )}

            {paperCrease === 'diagonal-crease' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div
                        className="absolute -inset-10 origin-center rotate-[26deg] h-[2px] top-1/2"
                        style={{
                            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.16), rgba(255, 255, 255, 0.35) 50%, rgba(0, 0, 0, 0.09) 100%)',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                        }}
                    />
                </div>
            )}

            {paperCrease === 'vintage-worn' && (
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="absolute inset-0 mix-blend-multiply"
                        style={{
                            background: 'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(180, 130, 70, 0.3) 92%, rgba(120, 80, 40, 0.5) 100%)',
                        }}
                    />
                    <div
                        className="absolute bottom-16 right-16 w-24 h-24 rounded-full pointer-events-none mix-blend-multiply opacity-30"
                        style={{
                            border: '3px solid #8c5a2b',
                            filter: 'blur(1px)',
                            boxShadow: 'inset 0 0 6px #8c5a2b',
                        }}
                    />
                </div>
            )}

            {/* 4. SENSOR NOISE & GRAIN (Lightweight single-octave grain) */}
            {sensorNoise > 0.05 && (
                <div
                    className="absolute inset-0 pointer-events-none mix-blend-overlay"
                    style={{
                        opacity: sensorNoise * 0.45,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.7'/%3E%3C/svg%3E")`,
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

export const CameraOverlay = React.memo(CameraOverlayComponent);
