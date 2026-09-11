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
    // Unique ID prefix to avoid SVG filter collisions when multiple logos are rendered
    const id = React.useId().replace(/:/g, '');

    const iconSvg = (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`shrink-0 overflow-visible transition-transform duration-300 ${
                animated ? 'hover:scale-108 hover:rotate-1' : ''
            }`}
            aria-label="InkTrail Logo"
        >
            <defs>
                {/* Nib 3D Metallic Gradient */}
                <linearGradient id={`nibGradLeft-${id}`} x1="30" y1="20" x2="60" y2="70" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="35%" stopColor="#cbd5e1" />
                    <stop offset="70%" stopColor="#64748b" />
                    <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>

                <linearGradient id={`nibGradRight-${id}`} x1="70" y1="20" x2="40" y2="70" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="40%" stopColor="#94a3b8" />
                    <stop offset="80%" stopColor="#475569" />
                    <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>

                {/* Gold Inlay Trim Gradient */}
                <linearGradient id={`goldGrad-${id}`} x1="35" y1="30" x2="65" y2="60" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fde047" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#ca8a04" />
                </linearGradient>

                {/* 3D Fluid Neon Trail Gradient */}
                <linearGradient id={`trailGrad-${id}`} x1="10" y1="85" x2="90" y2="30" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="30%" stopColor="#3b82f6" />
                    <stop offset="65%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>

                {/* Trail Depth Shadow Gradient */}
                <linearGradient id={`trailShadowGrad-${id}`} x1="20" y1="85" x2="80" y2="40" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#083344" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.8" />
                </linearGradient>

                {/* Nib Specular Highlight */}
                <linearGradient id={`specular-${id}`} x1="45" y1="15" x2="55" y2="65" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>

                {/* Glow Filter */}
                <filter id={`glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Soft 3D Drop Shadow */}
                <filter id={`shadow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* ================= BACKGROUND 3D FLUID NEON TRAIL ================= */}
            {/* Ambient Outer Glow Layer */}
            <path
                d="M 12 80 C 22 92, 45 94, 58 82 C 72 70, 78 50, 70 38 C 64 28, 48 30, 46 42 C 44 54, 54 64, 66 62 C 78 60, 88 48, 92 36"
                stroke={`url(#trailGrad-${id})`}
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.35"
                filter={`url(#glow-${id})`}
            />

            {/* Trail Under-Shadow Ribbon (Creates 3D Over/Under Depth) */}
            <path
                d="M 14 78 C 24 88, 44 90, 56 80 C 68 70, 74 52, 68 40 C 62 32, 50 34, 48 44 C 46 54, 54 62, 64 60 C 74 58, 84 48, 88 38"
                stroke={`url(#trailShadowGrad-${id})`}
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.6"
            />

            {/* Main Fluid Luminous Ribbon */}
            <path
                d="M 14 78 C 24 88, 44 90, 56 80 C 68 70, 74 52, 68 40 C 62 32, 50 34, 48 44 C 46 54, 54 62, 64 60 C 74 58, 84 48, 88 38"
                stroke={`url(#trailGrad-${id})`}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Specular Ridge on Ink Trail */}
            <path
                d="M 17 76 C 26 84, 42 86, 54 78 C 64 70, 70 54, 66 42 C 62 36, 52 38, 50 46"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.65"
            />

            {/* Floating Dynamic Ink Drops */}
            <circle cx="22" cy="65" r="2.5" fill="#3b82f6" filter={`url(#glow-${id})`} />
            <circle cx="23" cy="64.5" r="0.8" fill="#ffffff" />

            <circle cx="84" cy="28" r="3.2" fill="#ec4899" filter={`url(#glow-${id})`} />
            <circle cx="85" cy="27.2" r="1.1" fill="#ffffff" />

            <circle cx="89" cy="46" r="1.8" fill="#8b5cf6" />

            {/* ================= 3D METALLIC FOUNTAIN PEN NIB ================= */}
            <g filter={`url(#shadow-${id})`} transform="translate(4, -2)">
                {/* Left Half of Pen Nib (Light Specular Facet) */}
                <path
                    d="M 50 14 L 33 46 C 35 56, 38 60, 44 64 L 50 65 Z"
                    fill={`url(#nibGradLeft-${id})`}
                />

                {/* Right Half of Pen Nib (Deep Shadow Facet) */}
                <path
                    d="M 50 14 L 67 46 C 65 56, 62 60, 56 64 L 50 65 Z"
                    fill={`url(#nibGradRight-${id})`}
                />

                {/* Nib Gold Trim Inlay Line */}
                <path
                    d="M 37 47 C 42 53, 46 54, 50 54 C 54 54, 58 53, 63 47"
                    stroke={`url(#goldGrad-${id})`}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    fill="none"
                />

                {/* Central Capillary Slit */}
                <line
                    x1="50"
                    y1="14"
                    x2="50"
                    y2="42"
                    stroke="#090d16"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                />

                {/* Heart-Shaped Breather Hole */}
                <circle
                    cx="50"
                    cy="43"
                    r="2.6"
                    fill="#0f172a"
                    stroke={`url(#goldGrad-${id})`}
                    strokeWidth="0.8"
                />

                {/* Ultra-Sharp Platinum Nib Point */}
                <polygon
                    points="48.5,14 51.5,14 50,11"
                    fill="#ffffff"
                />

                {/* Metallic Bevel Specular Sheen */}
                <path
                    d="M 50 14 L 37 44 L 43 45 L 50 20 Z"
                    fill={`url(#specular-${id})`}
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
                {/* Luminous Micro-Pulse at Tip */}
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300 blur-[1px] opacity-70 animate-pulse pointer-events-none" />
            </div>

            <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                    <span className="text-xl sm:text-2xl font-black font-display tracking-tight text-neutral-950 dark:text-white leading-none">
                        Ink<span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">Trail</span>
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
