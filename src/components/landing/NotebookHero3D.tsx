import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface NotebookHero3DProps {
    className?: string;
    interactive?: boolean;
}

export default function NotebookHero3D({ className = '', interactive = true }: NotebookHero3DProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        let animationFrameId: number;
        let width = container.clientWidth;
        let height = container.clientHeight;

        // 1. Scene setup
        const scene = new THREE.Scene();

        // 2. Camera setup
        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        camera.position.set(0, 0.15, 7.0);

        // 3. Renderer with high performance & antialiasing
        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // 4. Studio Lighting (Daylight / Warm Paper Gallery)
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
        scene.add(ambientLight);

        // Key light (warm morning studio spotlight)
        const keyLight = new THREE.DirectionalLight(0xfffdf5, 2.6);
        keyLight.position.set(4.5, 7.5, 6.0);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        keyLight.shadow.bias = -0.0002;
        scene.add(keyLight);

        // Sky Fill light (subtle cool blue-indigo fill for high-end depth)
        const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.1);
        fillLight.position.set(-6, 2, 4.5);
        scene.add(fillLight);

        // Desk Bounce light (warm amber bounce from below)
        const bounceLight = new THREE.DirectionalLight(0xfef3c7, 0.5);
        bounceLight.position.set(0, -5, 3);
        scene.add(bounceLight);

        // Specular point light moving along coils
        const coilGlint = new THREE.PointLight(0x6366f1, 2.2, 12);
        coilGlint.position.set(-2, 2, 3);
        scene.add(coilGlint);

        // 5. Build 3D Notebook
        const notebookGroup = new THREE.Group();
        scene.add(notebookGroup);

        // --- Paper Texture Generation via Canvas ---
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = 1024;
        pageCanvas.height = 1360;
        const ctx = pageCanvas.getContext('2d')!;
        
        // Cream paper background
        ctx.fillStyle = '#fdfbf7';
        ctx.fillRect(0, 0, 1024, 1360);

        // Margin red double line
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(160, 0);
        ctx.lineTo(160, 1360);
        ctx.stroke();

        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(168, 0);
        ctx.lineTo(168, 1360);
        ctx.stroke();

        // Blue ruled lines
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 1.5;
        const lineSpacing = 42;
        for (let y = 140; y < 1320; y += lineSpacing) {
            ctx.beginPath();
            ctx.moveTo(80, y);
            ctx.lineTo(960, y);
            ctx.stroke();
        }

        // Header Title
        ctx.font = 'bold 36px Caveat, cursive, sans-serif';
        ctx.fillStyle = '#1e3a8a';
        ctx.fillText("Physics Lab · Experiment #04", 190, 115);

        // Handwritten realistic text sample
        ctx.font = '28px Caveat, cursive, sans-serif';
        ctx.fillStyle = '#1e293b';
        const sampleLines = [
            "Aim: Determine the Planck's Constant using Photoelectric Effect.",
            "Apparatus: Photo emissive cell, variable DC source, microammeter.",
            "Theory: When light of frequency ν strikes the photosensitive cathode,",
            "photoelectrons are ejected. The kinetic energy Kmax = hν - Φ.",
            "Stopping Potential (Vs) vs Frequency (ν) graph yields a straight line.",
            "Slope = h/e. Hence h = Slope × 1.602 × 10⁻¹⁹ J·s.",
            "Mean Measured Value: h = 6.626 × 10⁻³⁴ J·s (Error < 0.4%).",
            "Result: Authenticated by Lab Instructor. Grade: A+"
        ];
        sampleLines.forEach((line, idx) => {
            const y = 195 + idx * lineSpacing;
            ctx.fillText(line, 190, y);
        });

        const pageTexture = new THREE.CanvasTexture(pageCanvas);
        pageTexture.anisotropy = 8;

        // Front Page Mesh
        const pageGeo = new THREE.BoxGeometry(3.4, 4.6, 0.03);
        const pageMat = new THREE.MeshStandardMaterial({
            map: pageTexture,
            roughness: 0.85,
            metalness: 0.02,
        });
        const pageMesh = new THREE.Mesh(pageGeo, pageMat);
        pageMesh.position.set(0.15, 0, 0.05);
        pageMesh.castShadow = true;
        pageMesh.receiveShadow = true;
        notebookGroup.add(pageMesh);

        // Back Cover (Premium Dark Leatherboard/Hardboard)
        const backCoverGeo = new THREE.BoxGeometry(3.5, 4.7, 0.08);
        const backCoverMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.5,
            metalness: 0.15,
        });
        const backCoverMesh = new THREE.Mesh(backCoverGeo, backCoverMat);
        backCoverMesh.position.set(0.15, 0, -0.06);
        backCoverMesh.castShadow = true;
        notebookGroup.add(backCoverMesh);

        // Inner Page Block (Stack thickness)
        const stackGeo = new THREE.BoxGeometry(3.38, 4.58, 0.09);
        const stackMat = new THREE.MeshStandardMaterial({
            color: 0xf6f3ea,
            roughness: 0.9,
            metalness: 0.02,
        });
        const stackMesh = new THREE.Mesh(stackGeo, stackMat);
        stackMesh.position.set(0.15, 0, 0);
        notebookGroup.add(stackMesh);

        // --- 3D Metallic Twin-Wire Spiral Binding ---
        const coilsGroup = new THREE.Group();
        const coilCount = 28;
        const coilRadius = 0.16;
        const tubeRadius = 0.022;
        const coilSpacing = 4.3 / (coilCount - 1);
        const startY = 2.15;

        const coilGeo = new THREE.TorusGeometry(coilRadius, tubeRadius, 14, 28, Math.PI * 1.85);
        const coilMat = new THREE.MeshStandardMaterial({
            color: 0xf1f5f9,
            metalness: 0.95,
            roughness: 0.14,
        });

        for (let i = 0; i < coilCount; i++) {
            const coil = new THREE.Mesh(coilGeo, coilMat);
            coil.position.set(-1.6, startY - i * coilSpacing, 0.02);
            coil.rotation.z = Math.PI / 2;
            coil.rotation.y = 0.15;
            coil.castShadow = true;
            coilsGroup.add(coil);
        }
        notebookGroup.add(coilsGroup);

        // --- Floating Ink Spark / Airborne Dust Motes ---
        const particleCount = 65;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const scales = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
            scales[i] = Math.random();
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMat = new THREE.PointsMaterial({
            color: 0x4338ca,
            size: 0.055,
            transparent: true,
            opacity: 0.35,
        });
        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // Target rotations for smooth lerping
        let targetRotX = 0.14;
        let targetRotY = -0.32;
        let targetZ = 0;
        let targetScale = 1;

        // Initial notebook orientation
        notebookGroup.rotation.x = targetRotX;
        notebookGroup.rotation.y = targetRotY;

        // Pointer tracking
        const handlePointerMove = (e: PointerEvent) => {
            if (!interactive) return;
            const rect = container.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

            targetRotY = -0.32 + x * 0.45;
            targetRotX = 0.14 - y * 0.35;
            targetZ = x * 0.1;
        };

        const handleScroll = () => {
            const scrollY = window.scrollY || window.pageYOffset;
            const progress = Math.min(scrollY / 800, 1);
            // Gentle tilt on scroll
            targetRotX = 0.14 + progress * 0.22;
            targetScale = 1 - progress * 0.06;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        container.addEventListener('pointermove', handlePointerMove);

        // Resize Observer
        const handleResize = () => {
            if (!container || !renderer) return;
            width = container.clientWidth;
            height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener('resize', handleResize);

        // Animation Loop
        const clock = new THREE.Clock();
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            // Floating gentle idle wave
            const idleFloat = Math.sin(elapsedTime * 1.5) * 0.08;
            const idleRotate = Math.cos(elapsedTime * 1.2) * 0.03;

            notebookGroup.position.y = THREE.MathUtils.lerp(notebookGroup.position.y, idleFloat, 0.05);
            notebookGroup.rotation.x = THREE.MathUtils.lerp(notebookGroup.rotation.x, targetRotX + idleRotate, 0.06);
            notebookGroup.rotation.y = THREE.MathUtils.lerp(notebookGroup.rotation.y, targetRotY, 0.06);
            notebookGroup.rotation.z = THREE.MathUtils.lerp(notebookGroup.rotation.z, targetZ, 0.06);

            const s = THREE.MathUtils.lerp(notebookGroup.scale.x, targetScale, 0.05);
            notebookGroup.scale.set(s, s, s);

            // Animate particles slowly
            particles.rotation.y = elapsedTime * 0.03;
            particles.rotation.x = elapsedTime * 0.015;

            // Point light breath
            coilGlint.position.x = -1.6 + Math.sin(elapsedTime * 2.0) * 0.5;
            coilGlint.position.y = Math.cos(elapsedTime * 2.0) * 1.8;

            renderer.render(scene, camera);
        };
        animate();

        // Cleanup on unmount
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('scroll', handleScroll);
            container.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('resize', handleResize);

            pageGeo.dispose();
            pageMat.dispose();
            backCoverGeo.dispose();
            backCoverMat.dispose();
            stackGeo.dispose();
            stackMat.dispose();
            coilGeo.dispose();
            coilMat.dispose();
            particleGeo.dispose();
            particleMat.dispose();
            pageTexture.dispose();
            renderer.dispose();
        };
    }, [interactive]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-[420px] sm:h-[540px] lg:h-[620px] select-none cursor-grab active:cursor-grabbing ${className}`}
        >
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Ambient Soft Studio Focus Vignette */}
            <div className="pointer-events-none absolute inset-0 bg-radial-[circle_at_50%_50%_rgba(99,102,241,0.05)_0%,transparent_70%]" />

            {/* Interactive Control Pill Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-stone-200/90 text-[11px] font-bold text-stone-700 shadow-md shadow-stone-300/40 flex items-center gap-2 pointer-events-none whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Move cursor or touch to inspect 3D notebook</span>
            </div>
        </div>
    );
}
