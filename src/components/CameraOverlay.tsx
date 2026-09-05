import React from 'react';
import type { LightingMode, PaperCrease } from '../types';

interface CameraOverlayProps {
    phoneShadow: boolean;
    phoneShadowAngle: number;
    phoneShadowIntensity: number;
    phoneShadowX?: number;
    phoneShadowY?: number;
    phoneShadowWidth?: number;
    phoneShadowHeight?: number;
    phoneShadowPenumbra?: number;
    lightingMode: LightingMode;
    lightingWarmth: number;
    paperCrease: PaperCrease;
    sensorNoise: number;
    coffeeStain?: boolean;
}

const CameraOverlayComponent: React.FC<CameraOverlayProps> = ({
    phoneShadow,
    phoneShadowAngle,
    phoneShadowIntensity,
    phoneShadowX,
    phoneShadowY,
    phoneShadowWidth,
    phoneShadowHeight,
    phoneShadowPenumbra,
    lightingMode,
    lightingWarmth,
    paperCrease,
    sensorNoise,
    coffeeStain = false,
}) => {
    // Calculate Phone Shadow coordinates based on angle or custom per-page values
    const rad = (phoneShadowAngle * Math.PI) / 180;
    const shadowX = phoneShadowX !== undefined ? phoneShadowX : Math.round(50 + Math.cos(rad) * 45);
    const shadowY = phoneShadowY !== undefined ? phoneShadowY : Math.round(50 + Math.sin(rad) * 45);
    const shadowW = phoneShadowWidth !== undefined ? phoneShadowWidth : 72;
    const shadowH = phoneShadowHeight !== undefined ? phoneShadowHeight : 56;
    const penumbra = phoneShadowPenumbra !== undefined ? phoneShadowPenumbra : 75;

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

            {/* 2. REALISTIC SMARTPHONE CAST SHADOW & NATURAL LIGHT OCCLUSION */}
            {phoneShadow && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
                    {/* Primary phone body core shadow */}
                    <div
                        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
                        style={{
                            background: `radial-gradient(ellipse ${shadowW}% ${shadowH}% at ${shadowX}% ${shadowY}%, rgba(15, 23, 42, ${phoneShadowIntensity * 0.78}) 0%, rgba(30, 41, 59, ${phoneShadowIntensity * 0.38}) 42%, transparent ${penumbra}%)`,
                            mixBlendMode: 'multiply',
                        }}
                    />
                    {/* Subtle directional hand & device silhouette light falloff */}
                    <div
                        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
                        style={{
                            background: `linear-gradient(${phoneShadowAngle}deg, rgba(15, 23, 42, ${phoneShadowIntensity * 0.22}) 0%, transparent 48%)`,
                            mixBlendMode: 'multiply',
                        }}
                    />
                </div>
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
                </div>
            )}

            {/* HYPER-REALISTIC ORGANIC COFFEE CUP RING STAIN */}
            {(paperCrease === 'vintage-worn' || coffeeStain) && (
                <div 
                    className="absolute bottom-10 right-10 w-44 h-44 pointer-events-none mix-blend-multiply select-none"
                    style={{ opacity: 0.85, transform: 'rotate(-12deg)' }}
                >
                    <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                        <defs>
                            <radialGradient id="coffeeWashGrad" cx="48%" cy="48%" r="50%">
                                <stop offset="0%" stopColor="#8c5828" stopOpacity="0.03" />
                                <stop offset="55%" stopColor="#7a491e" stopOpacity="0.07" />
                                <stop offset="82%" stopColor="#5d3514" stopOpacity="0.18" />
                                <stop offset="94%" stopColor="#48270d" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#2e1706" stopOpacity="0.75" />
                            </radialGradient>
                            <radialGradient id="coffeeDotGrad" cx="35%" cy="35%" r="65%">
                                <stop offset="0%" stopColor="#7a491e" stopOpacity="0.8" />
                                <stop offset="85%" stopColor="#48270d" stopOpacity="0.9" />
                                <stop offset="100%" stopColor="#2e1706" stopOpacity="0.98" />
                            </radialGradient>
                            <filter id="coffeeEdgeDistort" x="-15%" y="-15%" width="130%" height="130%">
                                <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="turb" />
                                <feDisplacementMap in="SourceGraphic" in2="turb" scale="4.5" xChannelSelector="R" yChannelSelector="G" />
                            </filter>
                        </defs>
                        
                        {/* Dried puddle mottled center wash */}
                        <circle cx="100" cy="100" r="74" fill="url(#coffeeWashGrad)" filter="url(#coffeeEdgeDistort)" />
                        
                        {/* Primary Capillary Rim (Dark outer ring where evaporation deposits solids) */}
                        <ellipse 
                            cx="100" 
                            cy="99" 
                            rx="74" 
                            ry="72" 
                            fill="none" 
                            stroke="#3b1d08" 
                            strokeWidth="3.6" 
                            strokeDasharray="160 14 85 8 40 5"
                            strokeLinecap="round"
                            filter="url(#coffeeEdgeDistort)"
                            opacity="0.88"
                        />
                        
                        {/* Secondary heavier capillary segment (cup pressure puddle deposit) */}
                        <path 
                            d="M 32,106 A 72,70 0 0,0 162,126 A 71,72 0 0,0 170,90" 
                            fill="none" 
                            stroke="#2b1304" 
                            strokeWidth="4.2" 
                            strokeLinecap="round"
                            filter="url(#coffeeEdgeDistort)"
                            opacity="0.75"
                        />
                        
                        {/* Faint sliding double ring / mug displacement mark */}
                        <ellipse 
                            cx="104" 
                            cy="95" 
                            rx="72" 
                            ry="70" 
                            fill="none" 
                            stroke="#6f421f" 
                            strokeWidth="1.8" 
                            strokeDasharray="50 30 70 20"
                            strokeLinecap="round"
                            filter="url(#coffeeEdgeDistort)"
                            opacity="0.5"
                        />

                        {/* Inner dried coffee sediment ring */}
                        <ellipse 
                            cx="98" 
                            cy="102" 
                            rx="66" 
                            ry="64" 
                            fill="none" 
                            stroke="#7a491e" 
                            strokeWidth="1.2" 
                            strokeDasharray="25 45 65 35"
                            opacity="0.32"
                        />

                        {/* Real satellite splatter droplets near cup rim */}
                        <ellipse cx="186" cy="82" rx="2.8" ry="2.2" fill="url(#coffeeDotGrad)" />
                        <ellipse cx="180" cy="70" rx="1.6" ry="1.3" fill="url(#coffeeDotGrad)" />
                        <ellipse cx="20" cy="122" rx="3.2" ry="2.4" fill="url(#coffeeDotGrad)" transform="rotate(18 20 122)" />
                        <ellipse cx="14" cy="135" rx="1.8" ry="1.4" fill="url(#coffeeDotGrad)" />
                        <ellipse cx="122" cy="186" rx="2.5" ry="2.0" fill="url(#coffeeDotGrad)" />
                        <ellipse cx="134" cy="194" rx="1.5" ry="1.2" fill="url(#coffeeDotGrad)" />
                    </svg>
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
