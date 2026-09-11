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

        // 2. Camera: Studio perspective lens with realistic depth
        const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
        camera.position.set(0.05, 0.75, 7.8);

        // 3. High-Fidelity Renderer
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

        // 4. Lighting Rig
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.45);
        scene.add(ambientLight);

        // Warm Key Light (Top-right studio lamp)
        const keyLight = new THREE.DirectionalLight(0xfffdf0, 2.7);
        keyLight.position.set(5.0, 7.5, 6.0);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.set(1024, 1024);
        keyLight.shadow.bias = -0.0001;
        scene.add(keyLight);

        // Cool Sky Fill Light
        const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.2);
        fillLight.position.set(-5, 4, 4);
        scene.add(fillLight);

        // Soft Tabletop Bounce
        const bounceLight = new THREE.DirectionalLight(0xfef3c7, 0.5);
        bounceLight.position.set(0, -4, 2);
        scene.add(bounceLight);

        // Specular glint for spiral rings
        const coilGlint = new THREE.PointLight(0x818cf8, 2.0, 10);
        coilGlint.position.set(0, 1.2, 2.2);
        scene.add(coilGlint);

        // 5. Notebook Master Assembly Group
        const notebookGroup = new THREE.Group();
        scene.add(notebookGroup);

        // Ground Soft Contact Shadow
        const shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = 512;
        shadowCanvas.height = 512;
        const sCtx = shadowCanvas.getContext('2d')!;
        const radGrad = sCtx.createRadialGradient(256, 256, 30, 256, 256, 240);
        radGrad.addColorStop(0, 'rgba(15, 23, 42, 0.28)');
        radGrad.addColorStop(0.45, 'rgba(30, 41, 59, 0.10)');
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        sCtx.fillStyle = radGrad;
        sCtx.fillRect(0, 0, 512, 512);

        const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
        const shadowGeo = new THREE.PlaneGeometry(7.4, 5.2);
        const shadowMat = new THREE.MeshBasicMaterial({
            map: shadowTexture,
            transparent: true,
            opacity: 0.85,
            depthWrite: false,
        });
        const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        shadowMesh.position.set(0, -0.7, -0.35);
        shadowMesh.rotation.x = -Math.PI * 0.18;
        scene.add(shadowMesh);

        // Helper: Procedural paper grain for tactile realism
        const applyPaperGrain = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            const imgData = ctx.getImageData(0, 0, w, h);
            const data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
                const grain = (Math.random() - 0.5) * 6;
                data[i] = Math.min(255, Math.max(0, data[i] + grain));
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
            }
            ctx.putImageData(imgData, 0, 0);
        };

        // --- LEFT PAGE: Circuit Diagram & Schematic Canvas ---
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

        // Hand-drawn circuit schematic
        lCtx.strokeStyle = '#1e3a8a';
        lCtx.lineWidth = 3.5;
        lCtx.lineCap = 'round';
        lCtx.lineJoin = 'round';

        lCtx.beginPath();
        lCtx.moveTo(180, 260);
        lCtx.lineTo(760, 260);
        lCtx.lineTo(760, 680);
        lCtx.lineTo(180, 680);
        lCtx.closePath();
        lCtx.stroke();

        // Battery symbol
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

        // Resistor
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

        // V-I Graph Box
        lCtx.strokeStyle = '#64748b';
        lCtx.lineWidth = 2;
        lCtx.beginPath();
        lCtx.moveTo(200, 1140);
        lCtx.lineTo(820, 1140);
        lCtx.moveTo(200, 1140);
        lCtx.lineTo(200, 840);
        lCtx.stroke();

        lCtx.font = '22px Caveat, cursive';
        lCtx.fillText("Voltage V (Volts) →", 460, 1175);
        lCtx.fillText("Current I (mA) ↑", 90, 840);

        // Linear slope line
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

        lCtx.font = 'bold 24px Caveat, cursive';
        lCtx.fillText("Slope = ΔV/ΔI = 4.82 Ω", 540, 970);

        // Spiral puncture holes along inner edge
        for (let y = 140; y < 1260; y += 44) {
            lCtx.fillStyle = '#cbd5e1';
            lCtx.beginPath();
            lCtx.arc(980, y, 7, 0, Math.PI * 2);
            lCtx.fill();
        }

        applyPaperGrain(lCtx, 1024, 1360);
        const leftTexture = new THREE.CanvasTexture(leftCanvas);
        leftTexture.anisotropy = 8;

        // --- RIGHT PAGE: Ruled Handwritten Write-Up ---
        const rightCanvas = document.createElement('canvas');
        rightCanvas.width = 1024;
        rightCanvas.height = 1360;
        const rCtx = rightCanvas.getContext('2d')!;

        rCtx.fillStyle = '#fdfbf7';
        rCtx.fillRect(0, 0, 1024, 1360);

        // Puncture holes
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

        // Header & Title
        rCtx.font = 'bold 24px Caveat, cursive, sans-serif';
        rCtx.fillStyle = '#64748b';
        rCtx.fillText("PAGE: 04", 170, 105);
        rCtx.fillText("DATE: 12 / 09 / 2026", 750, 105);

        rCtx.font = 'bold 36px Caveat, cursive, sans-serif';
        rCtx.fillStyle = '#1e3a8a';
        rCtx.fillText("Verification of Ohm's Law & Wire Resistance", 170, 175);

        // Handwritten Text Lines in authentic fountain pen ink
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

        // Verified Stamp Badge
        rCtx.strokeStyle = '#059669';
        rCtx.lineWidth = 2;
        rCtx.strokeRect(680, 1180, 240, 70);
        rCtx.font = 'bold 22px Caveat, cursive';
        rCtx.fillStyle = '#059669';
        rCtx.fillText("VERIFIED · LAB DEPT", 700, 1215);
        rCtx.font = '16px Caveat, cursive';
        rCtx.fillText("Sign: Prof. Dr. Sharma", 700, 1240);

        applyPaperGrain(rCtx, 1024, 1360);
        const rightTexture = new THREE.CanvasTexture(rightCanvas);
        rightTexture.anisotropy = 8;

        // --- 3D CURVED PAGES (Natural Arched Geometry Resting on Desk) ---
        const pageW = 2.65;
        const pageH = 3.8;

        // Left Page: Natural organic arch (z remains strictly positive: +0.01 to +0.06)
        const leftGeo = new THREE.PlaneGeometry(pageW, pageH, 32, 32);
        const posL = leftGeo.attributes.position;
        for (let i = 0; i < posL.count; i++) {
            const x = posL.getX(i);
            const normX = (x + 1.325) / 2.65; // 0 = outer left, 1 = spine
            const arch = Math.sin(normX * Math.PI) * 0.05;
            const cornerCurl = normX < 0.12 ? Math.pow(0.12 - normX, 2) * 1.5 : 0;
            posL.setZ(i, arch + cornerCurl + 0.01);
        }
        leftGeo.computeVertexNormals();

        const pageMatConfig = {
            roughness: 0.85,
            metalness: 0.0,
            side: THREE.FrontSide,
        };
        const leftMat = new THREE.MeshStandardMaterial({
            map: leftTexture,
            ...pageMatConfig
        });
        const leftMesh = new THREE.Mesh(leftGeo, leftMat);
        leftMesh.position.set(-1.35, 0, 0);
        leftMesh.castShadow = true;
        leftMesh.receiveShadow = true;
        notebookGroup.add(leftMesh);

        // Right Page: Symmetrical natural arch
        const rightGeo = new THREE.PlaneGeometry(pageW, pageH, 32, 32);
        const posR = rightGeo.attributes.position;
        for (let i = 0; i < posR.count; i++) {
            const x = posR.getX(i);
            const normX = (1.325 - x) / 2.65; // 0 = outer right, 1 = spine
            const arch = Math.sin(normX * Math.PI) * 0.05;
            const cornerCurl = normX < 0.12 ? Math.pow(0.12 - normX, 2) * 1.5 : 0;
            posR.setZ(i, arch + cornerCurl + 0.01);
        }
        rightGeo.computeVertexNormals();

        const rightMat = new THREE.MeshStandardMaterial({
            map: rightTexture,
            ...pageMatConfig
        });
        const rightMesh = new THREE.Mesh(rightGeo, rightMat);
        rightMesh.position.set(1.35, 0, 0);
        rightMesh.castShadow = true;
        rightMesh.receiveShadow = true;
        notebookGroup.add(rightMesh);

        // --- SUBTLE PAPER STACK RIM (Physical 100-Sheet Edge Underneath) ---
        // Sits strictly underneath at Z = -0.02, colored warm ivory paper
        const paperStackMat = new THREE.MeshStandardMaterial({
            color: 0xf4f0ea, // Warm page edge rim
            roughness: 0.9,
            metalness: 0.0,
        });
        const stackGeo = new THREE.BoxGeometry(2.62, 3.76, 0.025);

        const leftStackMesh = new THREE.Mesh(stackGeo, paperStackMat);
        leftStackMesh.position.set(-1.35, 0, -0.018);
        notebookGroup.add(leftStackMesh);

        const rightStackMesh = new THREE.Mesh(stackGeo, paperStackMat);
        rightStackMesh.position.set(1.35, 0, -0.018);
        notebookGroup.add(rightStackMesh);

        // --- ELEGANT BACK COVER (Hardboard Backing Strictly Underneath) ---
        // Sits safely behind the stack at Z = -0.045, extending 2mm beyond paper
        const coverMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b, // Deep matte slate-indigo backing
            roughness: 0.5,
            metalness: 0.1,
        });
        const coverGeo = new THREE.BoxGeometry(2.72, 3.86, 0.02);

        const leftCoverMesh = new THREE.Mesh(coverGeo, coverMat);
        leftCoverMesh.position.set(-1.38, 0, -0.045);
        leftCoverMesh.castShadow = true;
        notebookGroup.add(leftCoverMesh);

        const rightCoverMesh = new THREE.Mesh(coverGeo, coverMat);
        rightCoverMesh.position.set(1.38, 0, -0.045);
        rightCoverMesh.castShadow = true;
        notebookGroup.add(rightCoverMesh);

        // --- 3D METALLIC CHROME TWIN-WIRE SPIRAL ---
        const coilsGroup = new THREE.Group();
        const coilCount = 28;
        const coilRadius = 0.13;
        const tubeRadius = 0.018;
        const coilSpacing = 3.6 / (coilCount - 1);
        const startY = 1.8;

        const coilGeo = new THREE.TorusGeometry(coilRadius, tubeRadius, 14, 28, Math.PI * 1.96);
        const coilMat = new THREE.MeshStandardMaterial({
            color: 0xf8fafc,
            metalness: 0.95,
            roughness: 0.12,
        });

        for (let i = 0; i < coilCount; i++) {
            const coil = new THREE.Mesh(coilGeo, coilMat);
            coil.position.set(0, startY - i * coilSpacing, 0.02);
            coil.rotation.z = Math.PI / 2;
            coil.rotation.y = 0.15;
            coil.castShadow = true;
            coilsGroup.add(coil);
        }
        notebookGroup.add(coilsGroup);

        // --- LUXURY FOUNTAIN PEN ACCENT (Resting Beside Notebook) ---
        const penGroup = new THREE.Group();
        // Barrel
        const barrelGeo = new THREE.CylinderGeometry(0.045, 0.04, 2.2, 16);
        const barrelMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a, // Deep obsidian lacquer
            roughness: 0.25,
            metalness: 0.85,
        });
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        penGroup.add(barrel);

        // Gold Trim Band
        const ringGeo = new THREE.CylinderGeometry(0.047, 0.047, 0.06, 16);
        const goldMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            roughness: 0.2,
            metalness: 0.95,
        });
        const ring = new THREE.Mesh(ringGeo, goldMat);
        ring.position.y = 0.3;
        penGroup.add(ring);

        // Gold Nib
        const nibGeo = new THREE.ConeGeometry(0.04, 0.25, 12);
        const nib = new THREE.Mesh(nibGeo, goldMat);
        nib.position.y = 1.22;
        penGroup.add(nib);

        // Position pen angled on the desk beside the notebook
        penGroup.position.set(2.80, -0.35, 0.04);
        penGroup.rotation.z = -0.35;
        penGroup.rotation.x = 0.2;
        penGroup.castShadow = true;
        notebookGroup.add(penGroup);

        // Dynamic Viewport & Orientation Targets
        const baseScale = 0.88;
        let targetRotX = 0.38;
        let targetRotY = -0.14;
        let targetZ = 0.02;
        let targetScale = baseScale;

        notebookGroup.scale.set(baseScale, baseScale, baseScale);
        notebookGroup.rotation.x = targetRotX;
        notebookGroup.rotation.y = targetRotY;
        notebookGroup.rotation.z = targetZ;

        // Window-wide pointer tracking for hero
        const handlePointerMove = (e: MouseEvent) => {
            if (!interactive) return;
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = -(e.clientY / window.innerHeight) * 2 + 1;

            targetRotY = -0.14 + x * 0.22;
            targetRotX = 0.38 - y * 0.18;
            targetZ = 0.02 + x * 0.04;
        };

        const handleScroll = () => {
            const scrollY = window.scrollY || window.pageYOffset;
            const progress = Math.min(scrollY / 800, 1);
            targetRotX = 0.38 + progress * 0.22;
            targetScale = baseScale - progress * 0.05;
        };

        window.addEventListener('mousemove', handlePointerMove, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });

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

            // Organic breathing float
            const idleFloat = Math.sin(elapsedTime * 1.2) * 0.05;
            const idleTilt = Math.cos(elapsedTime * 1.0) * 0.015;

            notebookGroup.position.y = THREE.MathUtils.lerp(notebookGroup.position.y, idleFloat, 0.06);
            notebookGroup.rotation.x = THREE.MathUtils.lerp(notebookGroup.rotation.x, targetRotX + idleTilt, 0.06);
            notebookGroup.rotation.y = THREE.MathUtils.lerp(notebookGroup.rotation.y, targetRotY, 0.06);
            notebookGroup.rotation.z = THREE.MathUtils.lerp(notebookGroup.rotation.z, targetZ, 0.06);

            const s = THREE.MathUtils.lerp(notebookGroup.scale.x, targetScale, 0.06);
            notebookGroup.scale.set(s, s, s);

            // Shadow follows tilt
            shadowMesh.scale.set(1 + idleFloat * 0.25, 1 + idleFloat * 0.25, 1);
            shadowMesh.position.x = notebookGroup.rotation.y * 0.4;

            // Specular glint movement
            coilGlint.position.y = 1.2 + Math.sin(elapsedTime * 1.5) * 1.2;

            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);

            leftGeo.dispose();
            leftMat.dispose();
            rightGeo.dispose();
            rightMat.dispose();
            stackGeo.dispose();
            paperStackMat.dispose();
            coverGeo.dispose();
            coverMat.dispose();
            coilGeo.dispose();
            coilMat.dispose();
            barrelGeo.dispose();
            barrelMat.dispose();
            ringGeo.dispose();
            goldMat.dispose();
            nibGeo.dispose();
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
            className={`relative w-full h-[460px] sm:h-[580px] lg:h-[660px] select-none ${className}`}
        >
            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    );
}
