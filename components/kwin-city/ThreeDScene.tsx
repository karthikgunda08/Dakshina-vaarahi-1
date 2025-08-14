// src/components/kwin-city/ThreeDScene.tsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeDScene: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0d111c);
        scene.fog = new THREE.Fog(0x0d111c, 200, 800);

        // Camera setup
        const camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        camera.position.set(150, 200, 300);

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxPolarAngle = Math.PI / 2.1;
        controls.target.set(0, 0, 0);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404090, 2);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
        directionalLight.position.set(50, 100, 75);
        scene.add(directionalLight);

        // Ground plane
        const groundGeo = new THREE.PlaneGeometry(1000, 1000);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a233a });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        scene.add(ground);

        // City generation
        const buildingMaterial = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.1, roughness: 0.8 });
        const greenMaterial = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 1 });
        const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

        const gridSize = 20;
        const spacing = 15;
        for (let i = -gridSize / 2; i < gridSize / 2; i++) {
            for (let j = -gridSize / 2; j < gridSize / 2; j++) {
                const isGreenSpace = Math.random() > 0.75;
                const building = new THREE.Mesh(
                    isGreenSpace ? new THREE.PlaneGeometry(spacing * 0.8, spacing * 0.8) : boxGeometry,
                    isGreenSpace ? greenMaterial : buildingMaterial
                );

                if (isGreenSpace) {
                    building.rotation.x = -Math.PI / 2;
                    building.position.set(i * spacing, 0.1, j * spacing);
                } else {
                    const height = Math.random() * 80 + 10;
                    const width = Math.random() * (spacing * 0.6) + (spacing * 0.2);
                    const depth = Math.random() * (spacing * 0.6) + (spacing * 0.2);
                    building.scale.set(width, height, depth);
                    building.position.set(i * spacing, height / 2, j * spacing);
                }
                scene.add(building);
            }
        }

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Handle resize
        const handleResize = () => {
            if (mountRef.current) {
                camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} className="w-full h-full" />;
};
