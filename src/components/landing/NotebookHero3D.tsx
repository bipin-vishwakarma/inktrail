import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface NotebookHero3DProps {
    className?: string;
    interactive?: boolean;
    activeInk?: string;
}

const INSCRIBE_NOTES = [
    "Aim: Determine resistance per unit length of given specimen wire.",
    "Apparatus: Constant DC supply, standard resistor, microammeter.",
    "Formula: V = I × R (Ohm's Law holds at constant temperature).",
    "Slope Calculation: Resistance R is given by ΔV / ΔI.",
    "Observation 1: At V = 2.0 V, Current measured I = 0.41 A.",
    "Observation 2: At V = 4.0 V, Current measured I = 0.83 A.",
    "Observation 3: At V = 6.0 V, Current measured I = 1.25 A.",
    "Observation 4: At V = 8.0 V, Current measured I = 1.66 A.",
    "Observation 5: At V = 10.0 V, Current measured I = 2.08 A.",
    "Calculations: Mean R = Σ(V/I) / 5 = 4.82 Ω ± 0.03 Ω.",
    "Precautions: Connections must be clean, tight, and low-resistance.",
    "Result: Verified by Instructor. Grade: A+ (10/10) [PASS]"
];

export default function NotebookHero3D({ 
    className = '', 
    interactive = true,
    activeInk: propInk,
}: NotebookHero3DProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Synchronize with activeInk prop
    const activeInkColor = propInk || '#1e3a8a';
    const [isPlaying, setIsPlaying] = useState(true);

    // Refs for live engine synchronization
    const inkRef = useRef(activeInkColor);
    const paperRef = useRef('ruled');
    const playRef = useRef(isPlaying);
    const restartTriggerRef = useRef(0);

    useEffect(() => {
        inkRef.current = activeInkColor;
    }, [activeInkColor]);

    useEffect(() => {
        playRef.current = isPlaying;
    }, [isPlaying]);

    const handleRestart = () => {
        restartTriggerRef.current += 1;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        let animationFrameId: number;
        let width = container.clientWidth;
        let height = container.clientHeight;

        // 1. Three.js Scene
        const scene = new THREE.Scene();

        // 2. Camera: Studio perspective lens with realistic depth & uncaged headroom
        const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
        camera.position.set(0, 0.05, 8.8);

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
        renderer.setClearColor(0x000000, 0);

        // 4. Balanced Studio Lighting Rig (Clean contrast, no overexposure)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
        scene.add(ambientLight);

        // Warm Key Light (Top-right studio lamp)
        const keyLight = new THREE.DirectionalLight(0xfffdf0, 1.4);
        keyLight.position.set(5.0, 7.5, 6.0);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.set(1024, 1024);
        keyLight.shadow.bias = -0.0001;
        scene.add(keyLight);

        // Cool Sky Fill Light
        const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.55);
        fillLight.position.set(-5, 4, 4);
        scene.add(fillLight);

        // Specular glint for spiral rings
        const coilGlint = new THREE.PointLight(0x818cf8, 1.0, 10);
        coilGlint.position.set(0, 1.2, 2.2);
        scene.add(coilGlint);

        // 5. Notebook Master Assembly Group
        const notebookGroup = new THREE.Group();
        scene.add(notebookGroup);

        // Soft Radial Gradient Shadow Canvas (Contact & Desk Shadow)
        const shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = 512;
        shadowCanvas.height = 512;
        const sCtx = shadowCanvas.getContext('2d')!;
        const radGrad = sCtx.createRadialGradient(256, 256, 30, 256, 256, 245);
        radGrad.addColorStop(0, 'rgba(15, 23, 42, 0.32)');
        radGrad.addColorStop(0.35, 'rgba(30, 41, 59, 0.16)');
        radGrad.addColorStop(0.7, 'rgba(30, 41, 59, 0.05)');
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        sCtx.fillStyle = radGrad;
        sCtx.fillRect(0, 0, 512, 512);

        const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
        
        // Soft contact shadow placed directly behind the notebook pages (NEVER intersects paper)
        const shadowGeo = new THREE.PlaneGeometry(6.6, 4.8);
        const shadowMat = new THREE.MeshBasicMaterial({
            map: shadowTexture,
            transparent: true,
            opacity: 0.85,
            depthWrite: false,
        });
        const contactShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        contactShadowMesh.position.set(0, 0, -0.05);
        contactShadowMesh.renderOrder = -1;
        notebookGroup.add(contactShadowMesh);

        // Ground ambient desk shadow lying horizontally well below the book
        const floorGeo = new THREE.PlaneGeometry(10.0, 7.0);
        const floorShadowMesh = new THREE.Mesh(floorGeo, shadowMat);
        floorShadowMesh.position.set(0, -2.6, -0.5);
        floorShadowMesh.rotation.x = -Math.PI / 2;
        scene.add(floorShadowMesh);

        // --- LEFT PAGE: Circuit Diagram & Schematic Canvas ---
        const leftCanvas = document.createElement('canvas');
        leftCanvas.width = 1024;
        leftCanvas.height = 1360;
        const lCtx = leftCanvas.getContext('2d')!;

        const renderLeftPage = () => {
            const paperType = paperRef.current;
            lCtx.fillStyle = paperType === 'parchment' ? '#fbf4e6' : '#fdfbf7';
            lCtx.fillRect(0, 0, 1024, 1360);

            // Grid lines
            lCtx.strokeStyle = paperType === 'graph' ? '#bae6fd' : '#e0f2fe';
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

            // Header
            lCtx.font = '700 32px Caveat, cursive, sans-serif';
            lCtx.fillStyle = inkRef.current;
            lCtx.fillText("Fig 4.1: Circuit Schematic · Ohm's Law", 100, 130);

            // Hand-drawn circuit schematic
            lCtx.strokeStyle = inkRef.current;
            lCtx.lineWidth = 4.0;
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
            lCtx.fillStyle = paperType === 'parchment' ? '#fbf4e6' : '#fdfbf7';
            lCtx.fillRect(420, 235, 100, 50);
            lCtx.lineWidth = 4.0;
            lCtx.stroke();
            lCtx.font = 'bold 24px Caveat, cursive';
            lCtx.fillText("+  E  -", 445, 225);

            // Ammeter symbol
            lCtx.fillRect(725, 425, 70, 90);
            lCtx.beginPath();
            lCtx.arc(760, 470, 32, 0, Math.PI * 2);
            lCtx.stroke();
            lCtx.font = 'bold 30px Caveat, cursive';
            lCtx.fillText("A", 751, 480);

            // Resistor zig-zag
            lCtx.fillRect(390, 650, 160, 50);
            lCtx.font = 'bold 24px Caveat, cursive';
            lCtx.fillText("Resistance Specimen (R)", 365, 735);

            // V-I Graph Box
            lCtx.strokeStyle = '#475569';
            lCtx.lineWidth = 2.5;
            lCtx.beginPath();
            lCtx.moveTo(200, 1140);
            lCtx.lineTo(820, 1140);
            lCtx.moveTo(200, 1140);
            lCtx.lineTo(200, 840);
            lCtx.stroke();

            lCtx.font = 'bold 24px Caveat, cursive';
            lCtx.fillText("Voltage V (Volts) →", 460, 1175);
            lCtx.fillText("Current I (mA) ↑", 90, 840);

            // Linear slope line
            lCtx.strokeStyle = '#dc2626';
            lCtx.lineWidth = 3.5;
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
            lCtx.fillStyle = inkRef.current;
            points.forEach(p => {
                lCtx.beginPath();
                lCtx.arc(p.x, p.y, 7, 0, Math.PI * 2);
                lCtx.fill();
                lCtx.stroke();
            });

            lCtx.font = 'bold 26px Caveat, cursive';
            lCtx.fillStyle = inkRef.current;
            lCtx.fillText("Slope = ΔV/ΔI = 4.82 Ω", 530, 965);

            // Spiral puncture holes
            for (let y = 140; y < 1260; y += 44) {
                lCtx.fillStyle = '#cbd5e1';
                lCtx.beginPath();
                lCtx.arc(980, y, 7, 0, Math.PI * 2);
                lCtx.fill();
            }
        };

        renderLeftPage();
        const leftTexture = new THREE.CanvasTexture(leftCanvas);
        leftTexture.anisotropy = 8;

        // --- RIGHT PAGE: DYNAMIC REAL-TIME INSCRIBING NOTEBOOK ---
        const rightCanvas = document.createElement('canvas');
        rightCanvas.width = 1024;
        rightCanvas.height = 1360;
        const rCtx = rightCanvas.getContext('2d')!;

        const rightTexture = new THREE.CanvasTexture(rightCanvas);
        rightTexture.anisotropy = 8;

        // Offscreen static background cache for 60fps write rendering
        const rightBgCanvas = document.createElement('canvas');
        rightBgCanvas.width = 1024;
        rightBgCanvas.height = 1360;
        const rBgCtx = rightBgCanvas.getContext('2d')!;

        const updateRightStaticBackground = () => {
            const paperType = paperRef.current;
            rBgCtx.fillStyle = paperType === 'parchment' ? '#fbf4e6' : '#fdfbf7';
            rBgCtx.fillRect(0, 0, 1024, 1360);

            // Puncture holes along spine
            for (let y = 140; y < 1260; y += 44) {
                rBgCtx.fillStyle = '#cbd5e1';
                rBgCtx.beginPath();
                rBgCtx.arc(44, y, 7, 0, Math.PI * 2);
                rBgCtx.fill();
            }

            // Red margin double line
            rBgCtx.strokeStyle = '#ef4444';
            rBgCtx.lineWidth = 2.5;
            rBgCtx.beginPath();
            rBgCtx.moveTo(140, 0);
            rBgCtx.lineTo(140, 1360);
            rBgCtx.stroke();

            rBgCtx.strokeStyle = '#fca5a5';
            rBgCtx.lineWidth = 1.2;
            rBgCtx.beginPath();
            rBgCtx.moveTo(148, 0);
            rBgCtx.lineTo(148, 1360);
            rBgCtx.stroke();

            // Blue horizontal ruled lines
            rBgCtx.strokeStyle = paperType === 'graph' ? '#bae6fd' : '#93c5fd';
            rBgCtx.lineWidth = 1.4;
            const lineSpacing = 42;
            for (let y = 140; y < 1320; y += lineSpacing) {
                rBgCtx.beginPath();
                rBgCtx.moveTo(60, y);
                rBgCtx.lineTo(980, y);
                rBgCtx.stroke();
            }

            // Header & Title
            rBgCtx.font = 'bold 24px Caveat, cursive, sans-serif';
            rBgCtx.fillStyle = '#64748b';
            rBgCtx.fillText("PAGE: 04", 170, 105);
            rBgCtx.fillText(`DATE: ${new Date().toLocaleDateString('en-GB')}`, 750, 105);

            rBgCtx.font = 'bold 34px Caveat, cursive, sans-serif';
            rBgCtx.fillStyle = inkRef.current;
            rBgCtx.fillText("Verification of Ohm's Law & Wire Resistance", 170, 175);
        };

        updateRightStaticBackground();

        // 3D Curved Pages Assembly (Organic page bend resting naturally on desk)
        const pageW = 2.65;
        const pageH = 3.8;

        const leftGeo = new THREE.PlaneGeometry(pageW, pageH, 32, 32);
        const posL = leftGeo.attributes.position;
        for (let i = 0; i < posL.count; i++) {
            const x = posL.getX(i);
            const normX = (x + 1.325) / 2.65;
            const arch = Math.sin(normX * Math.PI) * 0.05;
            const cornerCurl = normX < 0.12 ? Math.pow(0.12 - normX, 2) * 1.5 : 0;
            posL.setZ(i, arch + cornerCurl + 0.01);
        }
        leftGeo.computeVertexNormals();

        const pageMatConfig = { roughness: 0.85, metalness: 0.0, side: THREE.FrontSide };
        const leftMat = new THREE.MeshStandardMaterial({ map: leftTexture, ...pageMatConfig });
        const leftMesh = new THREE.Mesh(leftGeo, leftMat);
        leftMesh.position.set(-1.35, 0, 0);
        leftMesh.castShadow = true;
        leftMesh.receiveShadow = true;
        notebookGroup.add(leftMesh);

        const rightGeo = new THREE.PlaneGeometry(pageW, pageH, 32, 32);
        const posR = rightGeo.attributes.position;
        for (let i = 0; i < posR.count; i++) {
            const x = posR.getX(i);
            const normX = (1.325 - x) / 2.65;
            const arch = Math.sin(normX * Math.PI) * 0.05;
            const cornerCurl = normX < 0.12 ? Math.pow(0.12 - normX, 2) * 1.5 : 0;
            posR.setZ(i, arch + cornerCurl + 0.01);
        }
        rightGeo.computeVertexNormals();

        const rightMat = new THREE.MeshStandardMaterial({ map: rightTexture, ...pageMatConfig });
        const rightMesh = new THREE.Mesh(rightGeo, rightMat);
        rightMesh.position.set(1.35, 0, 0);
        rightMesh.castShadow = true;
        rightMesh.receiveShadow = true;
        notebookGroup.add(rightMesh);

        // Soft Organic Paper Stack Rim (Warm ivory ream strictly underneath, NO dark boundary box)
        const paperStackMat = new THREE.MeshStandardMaterial({
            color: 0xf5efe6,
            roughness: 0.95,
            metalness: 0.0,
        });
        const stackGeo = new THREE.BoxGeometry(2.62, 3.76, 0.02);
        const leftStackMesh = new THREE.Mesh(stackGeo, paperStackMat);
        leftStackMesh.position.set(-1.35, 0, -0.016);
        notebookGroup.add(leftStackMesh);

        const rightStackMesh = new THREE.Mesh(stackGeo, paperStackMat);
        rightStackMesh.position.set(1.35, 0, -0.016);
        notebookGroup.add(rightStackMesh);

        // Twin-Wire Spiral Coils
        const coilsGroup = new THREE.Group();
        const coilCount = 28;
        const coilSpacing = 3.6 / (coilCount - 1);
        const coilGeo = new THREE.TorusGeometry(0.13, 0.018, 14, 28, Math.PI * 1.96);
        const coilMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.95, roughness: 0.12 });

        for (let i = 0; i < coilCount; i++) {
            const coil = new THREE.Mesh(coilGeo, coilMat);
            coil.position.set(0, 1.8 - i * coilSpacing, 0.02);
            coil.rotation.z = Math.PI / 2;
            coil.rotation.y = 0.15;
            coil.castShadow = true;
            coilsGroup.add(coil);
        }
        notebookGroup.add(coilsGroup);

        // 3D Fountain Pen Assembly (Tip anchored at penGroup origin)
        const penGroup = new THREE.Group();
        
        // Barrel
        const barrelGeo = new THREE.CylinderGeometry(0.042, 0.038, 1.8, 16);
        const barrelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25, metalness: 0.85 });
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        barrel.position.y = 1.15;
        penGroup.add(barrel);

        // 24K Gold Accent Ring
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.95 });
        const ringGeo = new THREE.CylinderGeometry(0.044, 0.044, 0.05, 16);
        const ring = new THREE.Mesh(ringGeo, goldMat);
        ring.position.y = 0.245;
        penGroup.add(ring);

        // Gold Nib (Apex pointed down at local y = 0)
        const nibGeo = new THREE.ConeGeometry(0.038, 0.22, 14);
        const nib = new THREE.Mesh(nibGeo, goldMat);
        nib.position.y = 0.11;
        nib.rotation.x = Math.PI; // point cone apex to y = 0
        penGroup.add(nib);

        // Pen writing angle in hand
        penGroup.rotation.z = -0.42;
        penGroup.rotation.x = 0.38;
        penGroup.position.set(1.4, 0, 0.1);
        notebookGroup.add(penGroup);

        // Real-Time Inscription State
        let currentLine = 0;
        let currentChar = 0;
        let charTimer = 0;
        let pauseTimer = 0;
        let lastRestartId = restartTriggerRef.current;
        let lastInk = inkRef.current;
        let lastPaper = paperRef.current;

        // Viewport tracking & Frameless Floating Scale
        const baseScale = 0.72; // Wide breathing room, uncaged, no boundary box clipping
        let targetRotX = 0.10;  // Upright legible angle (eliminates downward tilt)
        let targetRotY = -0.04; // Subtle angle showing both schematic and writing pages
        let targetZ = 0.0;

        notebookGroup.scale.set(baseScale, baseScale, baseScale);
        notebookGroup.rotation.x = targetRotX;
        notebookGroup.rotation.y = targetRotY;

        let isVisible = true;
        const handlePointerMove = (e: MouseEvent) => {
            if (!interactive || !isVisible) return;
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = -(e.clientY / window.innerHeight) * 2 + 1;
            // Heavily dampened luxury float (stable, non-dizzying)
            targetRotY = -0.04 + x * 0.05;
            targetRotX = 0.10 - y * 0.04;
            targetZ = x * 0.02;
        };
        window.addEventListener('mousemove', handlePointerMove, { passive: true });

        const handleResize = () => {
            if (!container || !renderer) return;
            width = container.clientWidth;
            height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener('resize', handleResize);

        // IntersectionObserver to pause rendering when hero notebook is offscreen
        const observer = new IntersectionObserver(([entry]) => {
            const wasVisible = isVisible;
            isVisible = entry.isIntersecting;
            if (isVisible && !wasVisible) {
                cancelAnimationFrame(animationFrameId);
                animate();
            }
        }, { threshold: 0.05 });
        observer.observe(container);

        // Animation Loop with Real-Time Handwriting Inscription & Pen Gliding
        const clock = new THREE.Clock();
        const lineSpacing = 42;
        const lineBaseY = 258;

        const animate = () => {
            if (!isVisible) return;
            animationFrameId = requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const elapsedTime = clock.getElapsedTime();

            // Detect live control changes (Ink color or paper style)
            if (lastInk !== inkRef.current || lastPaper !== paperRef.current) {
                lastInk = inkRef.current;
                lastPaper = paperRef.current;
                renderLeftPage();
                leftTexture.needsUpdate = true;
                updateRightStaticBackground();
            }

            // Handle manual re-inscribe reset
            if (lastRestartId !== restartTriggerRef.current) {
                lastRestartId = restartTriggerRef.current;
                currentLine = 0;
                currentChar = 0;
                pauseTimer = 0;
                charTimer = 0;
            }

            // Real-Time Handwriting Inscription Loop
            if (playRef.current) {
                if (pauseTimer > 0) {
                    pauseTimer -= delta;
                    if (pauseTimer <= 0) {
                        currentLine = 0;
                        currentChar = 0;
                    }
                } else {
                    charTimer += delta;
                    // Write at ~35 chars/sec with natural rhythm
                    if (charTimer > 0.028) {
                        charTimer = 0;
                        if (currentLine < INSCRIBE_NOTES.length) {
                            const fullLine = INSCRIBE_NOTES[currentLine];
                            if (currentChar < fullLine.length) {
                                currentChar += 1;
                            } else {
                                currentLine += 1;
                                currentChar = 0;
                                if (currentLine >= INSCRIBE_NOTES.length) {
                                    pauseTimer = 4.5; // Hold completed page for 4.5s
                                }
                            }

                            // Re-draw right canvas
                            rCtx.drawImage(rightBgCanvas, 0, 0);
                            rCtx.font = '600 31px Caveat, cursive, sans-serif';
                            rCtx.fillStyle = inkRef.current;

                            // Draw completed lines
                            for (let i = 0; i < currentLine; i++) {
                                rCtx.fillText(INSCRIBE_NOTES[i], 170, lineBaseY + i * lineSpacing);
                            }

                            // Draw active partial line & calculate pen cursor coordinates
                            let penCanvasX = 170;
                            const penCanvasY = lineBaseY + currentLine * lineSpacing;

                            if (currentLine < INSCRIBE_NOTES.length) {
                                const lineStr = INSCRIBE_NOTES[currentLine].slice(0, currentChar);
                                rCtx.fillText(lineStr, 170, penCanvasY);
                                penCanvasX = 170 + rCtx.measureText(lineStr).width;
                            }

                            // If page finished, draw Verified Badge
                            if (currentLine >= INSCRIBE_NOTES.length || (currentLine === INSCRIBE_NOTES.length - 1 && currentChar === INSCRIBE_NOTES[currentLine].length)) {
                                rCtx.strokeStyle = '#059669';
                                rCtx.lineWidth = 2.5;
                                rCtx.strokeRect(680, 1180, 240, 70);
                                rCtx.font = 'bold 22px Caveat, cursive';
                                rCtx.fillStyle = '#059669';
                                rCtx.fillText("VERIFIED · LAB DEPT", 700, 1215);
                                rCtx.font = '16px Caveat, cursive';
                                rCtx.fillText("Sign: Prof. Dr. Sharma", 700, 1240);
                            }

                            rightTexture.needsUpdate = true;

                            // Compute 3D pen tip coordinates from 2D canvas pixel coordinates
                            const u = penCanvasX / 1024;
                            const v = penCanvasY / 1360;
                            const target3DX = 0.025 + u * 2.65;
                            const target3DY = (0.5 - v) * 3.8;
                            const normX = 1 - u;
                            const arch = Math.sin(normX * Math.PI) * 0.05;
                            const cornerCurl = normX < 0.12 ? Math.pow(0.12 - normX, 2) * 1.5 : 0;
                            
                            // Lift pen slightly during line transition
                            const isTransitioning = currentChar === 0;
                            const target3DZ = arch + cornerCurl + (isTransitioning ? 0.08 : 0.025);

                            // Pen micro-bob cadence while writing
                            const penBob = Math.sin(elapsedTime * 28) * 0.004;

                            penGroup.position.x = THREE.MathUtils.lerp(penGroup.position.x, target3DX, 0.35);
                            penGroup.position.y = THREE.MathUtils.lerp(penGroup.position.y, target3DY, 0.35);
                            penGroup.position.z = THREE.MathUtils.lerp(penGroup.position.z, target3DZ + penBob, 0.35);
                        }
                    }
                }
            }

            // Ambient breathing float (calm, subtle micro-movement)
            const idleFloat = Math.sin(elapsedTime * 1.2) * 0.03;
            const idleTilt = Math.cos(elapsedTime * 1.0) * 0.008;

            notebookGroup.position.y = THREE.MathUtils.lerp(notebookGroup.position.y, idleFloat, 0.06);
            notebookGroup.rotation.x = THREE.MathUtils.lerp(notebookGroup.rotation.x, targetRotX + idleTilt, 0.06);
            notebookGroup.rotation.y = THREE.MathUtils.lerp(notebookGroup.rotation.y, targetRotY, 0.06);
            notebookGroup.rotation.z = THREE.MathUtils.lerp(notebookGroup.rotation.z, targetZ, 0.06);

            floorShadowMesh.scale.set(1 + idleFloat * 0.2, 1 + idleFloat * 0.2, 1);
            floorShadowMesh.position.x = notebookGroup.rotation.y * 0.4;
            coilGlint.position.y = 1.2 + Math.sin(elapsedTime * 1.5) * 1.2;

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            observer.disconnect();
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('resize', handleResize);

            leftGeo.dispose();
            leftMat.dispose();
            rightGeo.dispose();
            rightMat.dispose();
            stackGeo.dispose();
            paperStackMat.dispose();
            coilGeo.dispose();
            coilMat.dispose();
            barrelGeo.dispose();
            barrelMat.dispose();
            ringGeo.dispose();
            goldMat.dispose();
            nibGeo.dispose();
            shadowGeo.dispose();
            floorGeo.dispose();
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
            className={`relative w-full h-[460px] sm:h-[540px] lg:h-[620px] select-none ${className}`}
        >
            {/* Subtle Minimal Controls */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 p-1 rounded-full bg-white/85 backdrop-blur-md border border-neutral-200/80 shadow-xs pointer-events-auto">
                <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 rounded-full text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 cursor-pointer transition-colors"
                    title={isPlaying ? 'Pause Inscription' : 'Resume Inscription'}
                    aria-label={isPlaying ? 'Pause Inscription' : 'Resume Inscription'}
                >
                    {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                </button>
                <button
                    type="button"
                    onClick={handleRestart}
                    className="p-1.5 rounded-full text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 cursor-pointer transition-colors"
                    title="Replay Inscription"
                    aria-label="Replay Inscription"
                >
                    <RotateCcw size={13} />
                </button>
            </div>

            {/* Three.js Canvas */}
            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    );
}
