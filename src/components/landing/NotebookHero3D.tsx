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

        // 1. Scene
        const scene = new THREE.Scene();

        // 2. Camera: Wide studio lens with perspective depth
        const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
        camera.position.set(0, 0.4, 7.6);

        // 3. Renderer with antialiasing & soft shadows
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

        // 4. Studio Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
        scene.add(ambientLight);

        // Warm Key Light (Top-right studio daylight)
        const keyLight = new THREE.DirectionalLight(0xfffdf5, 2.8);
        keyLight.position.set(5.0, 8.0, 6.5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        keyLight.shadow.bias = -0.0002;
        scene.add(keyLight);

        // Sky Fill Light (Cool daylight fill)
        const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.2);
        fillLight.position.set(-6, 3, 4.5);
        scene.add(fillLight);

        // Desk Bounce (Warm tabletop bounce)
        const bounceLight = new THREE.DirectionalLight(0xfef3c7, 0.6);
        bounceLight.position.set(0, -6, 3);
        scene.add(bounceLight);

        // Coil glint spotlight
        const coilGlint = new THREE.PointLight(0x6366f1, 2.5, 12);
        coilGlint.position.set(0, 1.5, 2.5);
        scene.add(coilGlint);

        // 5. Open Dual-Page Spiral Notebook Group
        const notebookGroup = new THREE.Group();
        scene.add(notebookGroup);

        // --- Realistic Ground Contact Shadow Plane ---
        const shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = 512;
        shadowCanvas.height = 512;
        const sCtx = shadowCanvas.getContext('2d')!;
        const radGrad = sCtx.createRadialGradient(256, 256, 40, 256, 256, 250);
        radGrad.addColorStop(0, 'rgba(15, 23, 42, 0.22)');
        radGrad.addColorStop(0.5, 'rgba(30, 41, 59, 0.08)');
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        sCtx.fillStyle = radGrad;
        sCtx.fillRect(0, 0, 512, 512);

        const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
        const shadowGeo = new THREE.PlaneGeometry(7.2, 5.0);
        const shadowMat = new THREE.MeshBasicMaterial({
            map: shadowTexture,
            transparent: true,
            opacity: 0.85,
            depthWrite: false,
        });
        const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        shadowMesh.position.set(0, -0.6, -0.4);
        shadowMesh.rotation.x = -Math.PI * 0.15;
        scene.add(shadowMesh);

        // --- LEFT PAGE (Diagram & Schematic Canvas) ---
        const leftCanvas = document.createElement('canvas');
        leftCanvas.width = 1024;
        leftCanvas.height = 1360;
        const lCtx = leftCanvas.getContext('2d')!;

        // Cream paper base
        lCtx.fillStyle = '#fdfbf7';
        lCtx.fillRect(0, 0, 1024, 1360);

        // Subtle millimeter grid
        lCtx.strokeStyle = '#e0f2fe';
        lCtx.lineWidth = 1;
        for (let x = 60; x < 960; x += 32) {
            lCtx.beginPath();
            lCtx.moveTo(x, 80);
            lCtx.lineTo(x, 1280);
            lCtx.stroke();
        }
        for (let y = 80; y < 1280; y += 32) {
            lCtx.beginPath();
            lCtx.moveTo(60, y);
            lCtx.lineTo(960, y);
            lCtx.stroke();
        }

        // Left Page Header
        lCtx.font = 'bold 30px Caveat, cursive, sans-serif';
        lCtx.fillStyle = '#1e40af';
        lCtx.fillText("Fig 4.1: Circuit Schematic · Ohm's Law", 100, 130);

        // Hand-drawn circuit schematic in blue ink
        lCtx.strokeStyle = '#1e3a8a';
        lCtx.lineWidth = 3.5;
        lCtx.lineCap = 'round';
        lCtx.lineJoin = 'round';

        // Main circuit loop
        lCtx.beginPath();
        lCtx.moveTo(180, 260);
        lCtx.lineTo(760, 260);
        lCtx.lineTo(760, 680);
        lCtx.lineTo(180, 680);
        lCtx.closePath();
        lCtx.stroke();

        // Battery symbol (+ -)
        lCtx.fillStyle = '#fdfbf7';
        lCtx.fillRect(420, 240, 100, 40);
        lCtx.strokeStyle = '#1e3a8a';
        lCtx.lineWidth = 4;
        lCtx.beginPath();
        lCtx.moveTo(440, 245);
        lCtx.lineTo(440, 275);
        lCtx.moveTo(460, 252);
        lCtx.lineTo(460, 268);
        lCtx.moveTo(480, 245);
        lCtx.lineTo(480, 275);
        lCtx.stroke();
        lCtx.font = 'bold 22px Caveat, cursive';
        lCtx.fillText("+  E  -", 445, 230);

        // Ammeter Circle
        lCtx.fillStyle = '#fdfbf7';
        lCtx.fillRect(730, 430, 60, 80);
        lCtx.beginPath();
        lCtx.arc(760, 470, 30, 0, Math.PI * 2);
        lCtx.stroke();
        lCtx.font = 'bold 28px Caveat, cursive';
        lCtx.fillText("A", 752, 478);

        // Unknown Resistor (Zig-zag)
        lCtx.fillStyle = '#fdfbf7';
        lCtx.fillRect(400, 660, 140, 40);
        lCtx.beginPath();
        lCtx.moveTo(400, 680);
        lCtx.lineTo(415, 665);
        lCtx.lineTo(435, 695);
        lCtx.lineTo(455, 665);
        lCtx.lineTo(475, 695);
        lCtx.lineTo(495, 665);
        lCtx.lineTo(515, 695);
        lCtx.lineTo(530, 680);
        lCtx.lineTo(540, 680);
        lCtx.stroke();
        lCtx.fillText("Unknown Resistance (R)", 375, 735);

        // V-I Characteristic Graph Box
        lCtx.strokeStyle = '#64748b';
        lCtx.lineWidth = 2;
        lCtx.beginPath();
        lCtx.moveTo(200, 1140);
        lCtx.lineTo(820, 1140); // X axis
        lCtx.moveTo(200, 1140);
        lCtx.lineTo(200, 840);  // Y axis
        lCtx.stroke();

        lCtx.font = '22px Caveat, cursive';
        lCtx.fillText("Voltage V (Volts) →", 460, 1175);
        lCtx.fillText("Current I (mA) ↑", 90, 840);

        // Linear slope line with experimental data dots
        lCtx.strokeStyle = '#ef4444';
        lCtx.lineWidth = 3;
        lCtx.beginPath();
        lCtx.moveTo(200, 1140);
        lCtx.lineTo(760, 880);
        lCtx.stroke();

        // Data points
        const points = [
            { x: 300, y: 1095 },
            { x: 420, y: 1040 },
            { x: 530, y: 990 },
            { x: 640, y: 935 },
            { x: 740, y: 890 }
        ];
        lCtx.fillStyle = '#1e3a8a';
        points.forEach(p => {
            lCtx.beginPath();
            lCtx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            lCtx.fill();
            lCtx.stroke();
        });

        lCtx.fillStyle = '#1e3a8a';
        lCtx.font = 'bold 24px Caveat, cursive';
        lCtx.fillText("Slope = ΔV/ΔI = 4.82 Ω", 540, 970);

        // Left Page Puncture Holes along the right spine
        for (let y = 140; y < 1260; y += 44) {
            lCtx.fillStyle = '#cbd5e1';
            lCtx.beginPath();
            lCtx.arc(980, y, 7, 0, Math.PI * 2);
            lCtx.fill();
        }

        const leftTexture = new THREE.CanvasTexture(leftCanvas);
        leftTexture.anisotropy = 8;

        // --- RIGHT PAGE (Ruled Handwriting Write-Up) ---
        const rightCanvas = document.createElement('canvas');
        rightCanvas.width = 1024;
        rightCanvas.height = 1360;
        const rCtx = rightCanvas.getContext('2d')!;

        // Cream paper base
        rCtx.fillStyle = '#fdfbf7';
        rCtx.fillRect(0, 0, 1024, 1360);

        // Right Page Puncture Holes along left spine
        for (let y = 140; y < 1260; y += 44) {
            rCtx.fillStyle = '#cbd5e1';
            rCtx.beginPath();
            rCtx.arc(44, y, 7, 0, Math.PI * 2);
            rCtx.fill();
        }

        // Red margin double line
        rCtx.strokeStyle = '#ef4444';
        rCtx.lineWidth = 2.5;
        rCtx.beginPath();
        rCtx.moveTo(140, 0);
        rCtx.lineTo(140, 1360);
        rCtx.stroke();

        rCtx.strokeStyle = '#fca5a5';
        rCtx.lineWidth = 1.2;
        rCtx.beginPath();
        rCtx.moveTo(148, 0);
        rCtx.lineTo(148, 1360);
        rCtx.stroke();

        // Blue horizontal ruled lines
        rCtx.strokeStyle = '#93c5fd';
        rCtx.lineWidth = 1.4;
        const lineSpacing = 42;
        for (let y = 140; y < 1320; y += lineSpacing) {
            rCtx.beginPath();
            rCtx.moveTo(60, y);
            rCtx.lineTo(980, y);
            rCtx.stroke();
        }

        // Date & Page Header
        rCtx.font = 'bold 24px Caveat, cursive, sans-serif';
        rCtx.fillStyle = '#64748b';
        rCtx.fillText("PAGE: 04", 170, 105);
        rCtx.fillText("DATE: 12 / 09 / 2026", 750, 105);

        // Main Title
        rCtx.font = 'bold 36px Caveat, cursive, sans-serif';
        rCtx.fillStyle = '#1e3a8a';
        rCtx.fillText("Verification of Ohm's Law & Wire Resistance", 170, 175);

        // Handwritten Text Lines in dark fountain pen ink
        rCtx.font = '28px Caveat, cursive, sans-serif';
        rCtx.fillStyle = '#1e293b';
        const notes = [
            "Aim: Determine resistance per unit length of given specimen wire.",
            "Apparatus: Constant voltage supply, standard resistor, microammeter.",
            "Formula: According to Ohm's Law, V = I × R at constant temperature.",
            "Hence, the resistance R is given by the reciprocal of the slope.",
            "Observation 1: At V = 2.0 V, Current measured I = 0.41 A.",
            "Observation 2: At V = 4.0 V, Current measured I = 0.83 A.",
            "Observation 3: At V = 6.0 V, Current measured I = 1.25 A.",
            "Observation 4: At V = 8.0 V, Current measured I = 1.66 A.",
            "Observation 5: At V = 10.0 V, Current measured I = 2.07 A.",
            "Calculations: Mean R = Σ(V/I) / 5 = 4.82 Ω ± 0.04 Ω.",
            "Precautions: Connections should be clean and firmly tightened.",
            "Remove plug key between observations to avoid heating errors.",
            "Result: Authenticated by Lab Instructor. Grade: A+ (10/10)"
        ];
        notes.forEach((text, idx) => {
            const y = 258 + idx * lineSpacing;
            rCtx.fillText(text, 170, y);
        });

        // Stamp badge at the bottom
        rCtx.strokeStyle = '#059669';
        rCtx.lineWidth = 2;
        rCtx.strokeRect(680, 1180, 240, 70);
        rCtx.font = 'bold 22px Caveat, cursive';
        rCtx.fillStyle = '#059669';
        rCtx.fillText("VERIFIED · LAB DEPT", 700, 1215);
        rCtx.font = '16px Caveat, cursive';
        rCtx.fillText("Sign: Prof. Dr. Sharma", 700, 1240);

        const rightTexture = new THREE.CanvasTexture(rightCanvas);
        rightTexture.anisotropy = 8;

        // --- BUILD 3D CURVED PAGES (Natural Organic Curvature) ---
        const pageW = 2.7;
        const pageH = 3.8;

        // Left Curved Page Mesh
        const leftGeo = new THREE.PlaneGeometry(pageW, pageH, 24, 24);
        const posL = leftGeo.attributes.position;
        for (let i = 0; i < posL.count; i++) {
            const x = posL.getX(i);
            // x runs from -1.35 to +1.35
            const normX = (x + 1.35) / 2.7; // 0 at left edge, 1 at center spine
            const curve = -Math.sin(normX * Math.PI * 0.5) * 0.12;
            const edgeLift = normX < 0.15 ? Math.sin((0.15 - normX) * 8) * 0.04 : 0;
            posL.setZ(i, curve + edgeLift);
        }
        leftGeo.computeVertexNormals();

        const leftMat = new THREE.MeshStandardMaterial({
            map: leftTexture,
            roughness: 0.82,
            metalness: 0.02,
            side: THREE.DoubleSide,
        });
        const leftMesh = new THREE.Mesh(leftGeo, leftMat);
        leftMesh.position.set(-1.38, 0, 0);
        leftMesh.castShadow = true;
        leftMesh.receiveShadow = true;
        notebookGroup.add(leftMesh);

        // Right Curved Page Mesh
        const rightGeo = new THREE.PlaneGeometry(pageW, pageH, 24, 24);
        const posR = rightGeo.attributes.position;
        for (let i = 0; i < posR.count; i++) {
            const x = posR.getX(i);
            // x runs from -1.35 to +1.35
            const normX = (1.35 - x) / 2.7; // 0 at right edge, 1 at center spine
            const curve = -Math.sin(normX * Math.PI * 0.5) * 0.12;
            const edgeLift = normX < 0.15 ? Math.sin((0.15 - normX) * 8) * 0.04 : 0;
            posR.setZ(i, curve + edgeLift);
        }
        rightGeo.computeVertexNormals();

        const rightMat = new THREE.MeshStandardMaterial({
            map: rightTexture,
            roughness: 0.82,
            metalness: 0.02,
            side: THREE.DoubleSide,
        });
        const rightMesh = new THREE.Mesh(rightGeo, rightMat);
        rightMesh.position.set(1.38, 0, 0);
        rightMesh.castShadow = true;
        rightMesh.receiveShadow = true;
        notebookGroup.add(rightMesh);

        // --- SUBTLE PAPER STACK BASE & COVER ---
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.6,
            metalness: 0.1,
        });
        const leftBaseGeo = new THREE.BoxGeometry(2.72, 3.82, 0.04);
        const leftBaseMesh = new THREE.Mesh(leftBaseGeo, baseMat);
        leftBaseMesh.position.set(-1.39, 0, -0.06);
        leftBaseMesh.castShadow = true;
        notebookGroup.add(leftBaseMesh);

        const rightBaseGeo = new THREE.BoxGeometry(2.72, 3.82, 0.04);
        const rightBaseMesh = new THREE.Mesh(rightBaseGeo, baseMat);
        rightBaseMesh.position.set(1.39, 0, -0.06);
        rightBaseMesh.castShadow = true;
        notebookGroup.add(rightBaseMesh);

        // --- CENTER 3D METALLIC TWIN-WIRE SPIRAL BINDING ---
        const coilsGroup = new THREE.Group();
        const coilCount = 28;
        const coilRadius = 0.14;
        const tubeRadius = 0.02;
        const coilSpacing = 3.6 / (coilCount - 1);
        const startY = 1.8;

        const coilGeo = new THREE.TorusGeometry(coilRadius, tubeRadius, 14, 26, Math.PI * 1.95);
        const coilMat = new THREE.MeshStandardMaterial({
            color: 0xf1f5f9,
            metalness: 0.96,
            roughness: 0.12,
        });

        for (let i = 0; i < coilCount; i++) {
            const coil = new THREE.Mesh(coilGeo, coilMat);
            coil.position.set(0, startY - i * coilSpacing, -0.01);
            coil.rotation.z = Math.PI / 2;
            coil.rotation.y = 0.2;
            coil.castShadow = true;
            coilsGroup.add(coil);
        }
        notebookGroup.add(coilsGroup);

        // --- FLOATING AIRBORNE INK MOTES ---
        const particleCount = 45;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 11;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMat = new THREE.PointsMaterial({
            color: 0x4338ca,
            size: 0.05,
            transparent: true,
            opacity: 0.3,
        });
        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // Orientation targets for silky smooth interpolation
        let targetRotX = 0.22;
        let targetRotY = -0.06;
        let targetZ = 0;
        let targetScale = 1;

        notebookGroup.rotation.x = targetRotX;
        notebookGroup.rotation.y = targetRotY;

        // Pointer tracking
        const handlePointerMove = (e: PointerEvent) => {
            if (!interactive) return;
            const rect = container.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

            targetRotY = -0.06 + x * 0.35;
            targetRotX = 0.22 - y * 0.25;
            targetZ = x * 0.06;
        };

        const handleScroll = () => {
            const scrollY = window.scrollY || window.pageYOffset;
            const progress = Math.min(scrollY / 700, 1);
            targetRotX = 0.22 + progress * 0.28;
            targetScale = 1 - progress * 0.06;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        container.addEventListener('pointermove', handlePointerMove);

        // Resize
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

            // Gentle natural floating wave
            const idleFloat = Math.sin(elapsedTime * 1.3) * 0.06;
            const idleTilt = Math.cos(elapsedTime * 1.1) * 0.02;

            notebookGroup.position.y = THREE.MathUtils.lerp(notebookGroup.position.y, idleFloat, 0.05);
            notebookGroup.rotation.x = THREE.MathUtils.lerp(notebookGroup.rotation.x, targetRotX + idleTilt, 0.05);
            notebookGroup.rotation.y = THREE.MathUtils.lerp(notebookGroup.rotation.y, targetRotY, 0.05);
            notebookGroup.rotation.z = THREE.MathUtils.lerp(notebookGroup.rotation.z, targetZ, 0.05);

            const s = THREE.MathUtils.lerp(notebookGroup.scale.x, targetScale, 0.05);
            notebookGroup.scale.set(s, s, s);

            // Shadow reacts to notebook float & tilt
            shadowMesh.scale.set(1 + idleFloat * 0.3, 1 + idleFloat * 0.3, 1);
            shadowMesh.position.x = notebookGroup.rotation.y * 0.5;

            // Animate particles
            particles.rotation.y = elapsedTime * 0.02;

            // Specular coil glint breath
            coilGlint.position.y = Math.sin(elapsedTime * 1.8) * 1.6;

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('scroll', handleScroll);
            container.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('resize', handleResize);

            leftGeo.dispose();
            leftMat.dispose();
            rightGeo.dispose();
            rightMat.dispose();
            leftBaseGeo.dispose();
            rightBaseGeo.dispose();
            baseMat.dispose();
            coilGeo.dispose();
            coilMat.dispose();
            particleGeo.dispose();
            particleMat.dispose();
            shadowGeo.dispose();
            shadowMat.dispose();
            shadowTexture.dispose();
            leftTexture.dispose();
            rightTexture.dispose();
            renderer.dispose();
        };
    }, [interactive]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-[440px] sm:h-[560px] lg:h-[640px] select-none ${className}`}
        >
            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    );
}
