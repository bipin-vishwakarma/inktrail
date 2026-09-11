import React from 'react';

interface InkTrailLogoProps {
    size?: number;
    className?: string;
    variant?: 'icon' | 'full';
    showBetaBadge?: boolean;
    animated?: boolean;
}

export const InkTrailLogo: React.FC<InkTrailLogoProps> = ({
    size = 36,
    className = '',
    variant = 'icon',
    showBetaBadge = false,
    animated = true,
}) => {
    // Unique ID prefix to avoid SVG filter/gradient collisions across instances
    const id = React.useId().replace(/:/g, '');

    const iconSvg = (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`shrink-0 overflow-visible transition-transform duration-300 ${
                animated ? 'hover:scale-108' : ''
            }`}
            aria-label="InkTrail Logo"
        >
            <style>{`
                @keyframes inkTrailFlow_${id} {
                    0% { stroke-dashoffset: 320; }
                    100% { stroke-dashoffset: 0; }
                }
                @keyframes tipGlow_${id} {
                    0%, 100% { opacity: 0.45; transform: scale(0.85); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                @keyframes dropletHover_${id} {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-2.5px); }
                }
                @keyframes nibShimmer_${id} {
                    0%, 100% { opacity: 0.7; }
                    50% { opacity: 1; }
                }
                .ink-ribbon-anim-${id} {
                    stroke-dasharray: 160 40;
                    animation: inkTrailFlow_${id} 6s linear infinite;
                }
                .ink-tip-pulse-${id} {
                    transform-origin: 50px 14px;
                    animation: tipGlow_${id} 2.4s ease-in-out infinite;
                }
                .ink-droplet-${id} {
                    animation: dropletHover_${id} 3s ease-in-out infinite;
                }
                .nib-shimmer-${id} {
                    animation: nibShimmer_${id} 3.5s ease-in-out infinite;
                }
            `}</style>

            <defs>
                {/* 3D Fountain Pen Nib: Polished Chrome / Platinum Left */}
                <linearGradient id={`nibLeft-${id}`} x1="32" y1="18" x2="52" y2="65" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="25%" stopColor="#e2e8f0" />
                    <stop offset="60%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#334155" />
                </linearGradient>

                {/* 3D Fountain Pen Nib: Deep Titanium Shadow Right */}
                <linearGradient id={`nibRight-${id}`} x1="68" y1="18" x2="48" y2="65" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#cbd5e1" />
                    <stop offset="40%" stopColor="#64748b" />
                    <stop offset="85%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>

                {/* 24K Gold Filigree & Collar Inlay */}
                <linearGradient id={`goldTrim-${id}`} x1="35" y1="35" x2="65" y2="55" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="45%" stopColor="#eab308" />
                    <stop offset="85%" stopColor="#ca8a04" />
                    <stop offset="100%" stopColor="#854d0e" />
                </linearGradient>

                {/* Flowing Liquid Metallic Ink Ribbon: Electric Cobalt to Royal Violet to Magenta */}
                <linearGradient id={`fluidTrail-${id}`} x1="12" y1="88" x2="92" y2="28" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="28%" stopColor="#2563eb" />
                    <stop offset="65%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>

                {/* Trail Ambient Backlight */}
                <linearGradient id={`trailAura-${id}`} x1="10" y1="86" x2="90" y2="30" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#d946ef" stopOpacity="0.8" />
                </linearGradient>

                {/* Specular Highlight Streak */}
                <linearGradient id={`specularFacet-${id}`} x1="48" y1="14" x2="38" y2="45" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="70%" stopColor="#ffffff" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>

                {/* Soft Radial Ambient Glow */}
                <filter id={`ambientGlow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* 3D Drop Shadow */}
                <filter id={`nibShadow-${id}`} x="-25%" y="-25%" width="150%" height="150%">
                    <feDropShadow dx="1.5" dy="3.5" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.28" />
                </filter>
            </defs>

            {/* ================= 1. FLOWING LIQUID INK RIBBON ================= */}
            {/* Luminous Outer Halo */}
            <path
                d="M 12 80 C 22 93, 44 94, 58 82 C 72 70, 78 50, 70 38 C 64 28, 48 30, 46 42 C 44 54, 54 64, 66 62 C 78 60, 88 48, 92 36"
                stroke={`url(#trailAura-${id})`}
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.3"
                filter={`url(#ambientGlow-${id})`}
            />

            {/* Deep Contact Shadow Beneath Ink Ribbon */}
            <path
                d="M 14 78 C 24 88, 44 90, 56 80 C 68 70, 74 52, 68 40 C 62 32, 50 34, 48 44 C 46 54, 54 62, 64 60 C 74 58, 84 48, 88 38"
                stroke="#0f172a"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.18"
            />

            {/* Main Fluid Ink Ribbon with Infinite Flow Animation */}
            <path
                d="M 14 78 C 24 88, 44 90, 56 80 C 68 70, 74 52, 68 40 C 62 32, 50 34, 48 44 C 46 54, 54 62, 64 60 C 74 58, 84 48, 88 38"
                stroke={`url(#fluidTrail-${id})`}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={animated ? `ink-ribbon-anim-${id}` : ''}
            />

            {/* Specular Ridge on Ink Trail */}
            <path
                d="M 17 76 C 26 84, 42 86, 54 78 C 64 70, 70 54, 66 42 C 62 36, 52 38, 50 46"
                stroke="#ffffff"
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity="0.75"
            />

            {/* Micro Floating Ink Droplets */}
            <g className={animated ? `ink-droplet-${id}` : ''}>
                <circle cx="21" cy="65" r="2.6" fill="#2563eb" filter={`url(#ambientGlow-${id})`} />
                <circle cx="22" cy="64.3" r="0.9" fill="#ffffff" opacity="0.9" />

                <circle cx="85" cy="27" r="3.2" fill="#ec4899" filter={`url(#ambientGlow-${id})`} />
                <circle cx="86" cy="26.2" r="1.1" fill="#ffffff" opacity="0.9" />

                <circle cx="90" cy="46" r="1.8" fill="#7c3aed" />
            </g>

            {/* ================= 2. 3D METALLIC FOUNTAIN PEN NIB ================= */}
            <g filter={`url(#nibShadow-${id})`} transform="translate(3.5, -2)">
                {/* Left Beveled Facet (Reflective Chrome) */}
                <path
                    d="M 50 14 L 33 46 C 35 56, 38 60, 44 64 L 50 65 Z"
                    fill={`url(#nibLeft-${id})`}
                    className={animated ? `nib-shimmer-${id}` : ''}
                />

                {/* Right Beveled Facet (Shadowed Titanium) */}
                <path
                    d="M 50 14 L 67 46 C 65 56, 62 60, 56 64 L 50 65 Z"
                    fill={`url(#nibRight-${id})`}
                />

                {/* Specular Sheen on Left Ridge */}
                <path
                    d="M 50 14 L 37 44 L 43 45 L 50 20 Z"
                    fill={`url(#specularFacet-${id})`}
                />

                {/* Gold Engraved Filigree Trim */}
                <path
                    d="M 37 47 C 42 53, 46 54, 50 54 C 54 54, 58 53, 63 47"
                    stroke={`url(#goldTrim-${id})`}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    fill="none"
                />

                {/* Precision Capillary Slit */}
                <line
                    x1="50"
                    y1="14"
                    x2="50"
                    y2="42"
                    stroke="#020617"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                />

                {/* Capillary Ink Core Glow */}
                <line
                    x1="50"
                    y1="18"
                    x2="50"
                    y2="38"
                    stroke="#2563eb"
                    strokeWidth="0.6"
                    strokeLinecap="round"
                    opacity="0.8"
                />

                {/* Breather Hole with Gold Ring */}
                <circle
                    cx="50"
                    cy="43"
                    r="2.8"
                    fill="#0f172a"
                    stroke={`url(#goldTrim-${id})`}
                    strokeWidth="0.9"
                />

                {/* Diamond Iridium Pen Tip */}
                <polygon
                    points="48.5,14 51.5,14 50,11"
                    fill="#ffffff"
                />

                {/* Active Luminous Tip Pulse */}
                <circle
                    cx="50"
                    cy="12"
                    r="2"
                    fill="#38bdf8"
                    className={animated ? `ink-tip-pulse-${id}` : ''}
                />
            </g>
        </svg>
    );

    if (variant === 'icon') {
        return (
            <div className={`inline-flex items-center justify-center ${className}`}>
                {iconSvg}
            </div>
        );
    }

    return (
        <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
            <div className="relative flex items-center justify-center">
                {iconSvg}
            </div>

            <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                    <span className="text-xl sm:text-2xl font-black font-display tracking-tight text-neutral-900 leading-none">
                        Ink<span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">Trail</span>
                        <span className="text-violet-600 font-serif">.</span>
                    </span>

                    {showBetaBadge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-md shadow-xs">
                            Beta
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InkTrailLogo;
