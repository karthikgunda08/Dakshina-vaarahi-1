// src/features/editor/components/Basic3dViewPanel.tsx
import React, { useLayoutEffect, useRef, useEffect, forwardRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { motion, AnimatePresence } from 'framer-motion';
import type { Level, Placement, PropertyLine, TerrainMesh, SunPosition, SelectedObject, HolocronHotspot, DigitalTwinData, LiveSelection, User, Collaborator, ConstructionPhase, DigitalTwinDataOverlay, Wall, Zone, InfrastructureLine, Room, Point3D, View3DHandles } from '../../../types/index';
import { PREDEFINED_MATERIALS, DRACO_DECODER_PATH, PREDEFINED_3D_MODELS } from '../../../lib/constants';
import { getColorForUserId } from '../../../lib/colorUtils';

const MotionDiv = motion.div as any;

export interface Basic3dViewPanelProps {
    levels: Level[];
    zones: Zone[];
    infrastructure: InfrastructureLine[];
    activeLevelIndex: number;
    propertyLines: PropertyLine[];
    terrainMesh: TerrainMesh | null;
    selectedObject: SelectedObject | null;
    setSelectedObject: (payload: React.SetStateAction<SelectedObject | null>) => void;
    sunPosition: SunPosition;
    isWalkthroughActive: boolean;
    setIsWalkthroughActive: (active: boolean) => void;
    constructionSequence: ConstructionPhase[] | null;
    activeTimelineWeek: number | null;
    hotspots?: HolocronHotspot[];
    onHotspotClick?: (hotspot: HolocronHotspot) => void;
    isDigitalTwinModeActive: boolean;
    digitalTwinData: DigitalTwinData | null;
    activeDataOverlays: DigitalTwinDataOverlay;
    liveSelections: Record<string, LiveSelection>;
    currentUser: User | null;
    collaborators: Collaborator[];
    onAddHotspot?: (position: Point3D) => void;
    isHolocronAuthoringMode: boolean;
}

// --- Caching and Loaders ---
const textureLoader = new THREE.TextureLoader();
const textureCache = new Map<string, THREE.Texture>();
const originalMaterialsCache = new Map<string, THREE.Material | THREE.Material[]>();
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(DRACO_DECODER_PATH);
gltfLoader.setDRACOLoader(dracoLoader);
const modelCache = new Map<string, THREE.Group>();

const loadTexture = (url: string, uvScale: { x: number; y: number } = { x: 1, y: 1 }) => {
    if (textureCache.has(url)) {
        const texture = textureCache.get(url)!.clone();
        texture.repeat.set(uvScale.x, uvScale.y);
        texture.needsUpdate = true;
        return texture;
    }
    const texture = textureLoader.load(url);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(uvScale.x, uvScale.y);
    textureCache.set(url, texture);
    return texture;
};

const createMaterial = (materialKey?: string, appliesTo: 'wall' | 'floor' = 'wall') => {
    const materialDef = PREDEFINED_MATERIALS.find(m => m.key === materialKey);
    if (!materialDef) {
        return new THREE.MeshStandardMaterial({ color: appliesTo === 'floor' ? 0x888888 : 0xcccccc, side: THREE.DoubleSide });
    }

    const materialProps: THREE.MeshStandardMaterialParameters = { side: THREE.DoubleSide };
    if (materialDef.type === 'color') {
        materialProps.color = new THREE.Color(materialDef.value);
    } else {
        materialProps.map = loadTexture(materialDef.value, materialDef.uvScale);
    }
    if (materialDef.metalness) materialProps.metalness = materialDef.metalness;
    if (materialDef.roughness) materialProps.roughness = materialDef.roughness;

    return new THREE.MeshStandardMaterial(materialProps);
};

// --- Geometry Creation ---
const createWallWithOpenings = (wall: Wall, placements: Placement[], levelElevation: number, room?: Room) => {
    const wallGroup = new THREE.Group();
    const wallVec = new THREE.Vector2(wall.x2 - wall.x1, wall.y2 - wall.y1);
    const wallLength = wallVec.length();
    const wallAngle = Math.atan2(wallVec.y, wallVec.x);

    const wallMaterial = createMaterial(wall.material || room?.wallMaterialOverride, 'wall');

    // Position the group at the wall's center and rotate it
    wallGroup.position.set((wall.x1 + wall.x2) / 2, wall.height / 2 + levelElevation, -(wall.y1 + wall.y2) / 2);
    wallGroup.rotation.y = -wallAngle;

    let currentPosition = -wallLength / 2;

    const openings = placements
        .filter(p => p.wallId === wall.id)
        .map(p => {
            const posOnWall = p.positionRatio * wallLength;
            return {
                start: posOnWall - p.width / 2 - (wallLength / 2),
                end: posOnWall + p.width / 2 - (wallLength / 2),
                height: p.height,
            };
        })
        .sort((a, b) => a.start - b.start);

    openings.forEach(opening => {
        // Wall segment before opening
        const segmentLength = opening.start - currentPosition;
        if (segmentLength > 0.01) { // Use a small epsilon
            const segment = new THREE.Mesh(new THREE.BoxGeometry(segmentLength, wall.height, wall.thickness), wallMaterial.clone());
            segment.position.x = currentPosition + segmentLength / 2;
            wallGroup.add(segment);
        }
        
        // Wall segment above opening (lintel)
        const lintelHeight = wall.height - opening.height;
        if (lintelHeight > 0.01) {
             const lintel = new THREE.Mesh(new THREE.BoxGeometry(opening.end - opening.start, lintelHeight, wall.thickness), wallMaterial.clone());
            lintel.position.x = opening.start + (opening.end - opening.start) / 2;
            lintel.position.y = (wall.height / 2) - (lintelHeight / 2); // Position relative to group center
            wallGroup.add(lintel);
        }

        currentPosition = opening.end;
    });

    // Final wall segment after last opening
    const finalSegmentLength = (wallLength / 2) - currentPosition;
    if (finalSegmentLength > 0.01) {
        const finalSegment = new THREE.Mesh(new THREE.BoxGeometry(finalSegmentLength, wall.height, wall.thickness), wallMaterial.clone());
        finalSegment.position.x = currentPosition + finalSegmentLength / 2;
        wallGroup.add(finalSegment);
    }
    
    // If there are no openings, create a single wall segment
    if (openings.length === 0 && wallLength > 0) {
        const fullWall = new THREE.Mesh(new THREE.BoxGeometry(wallLength, wall.height, wall.thickness), wallMaterial.clone());
        wallGroup.add(fullWall);
    }
    
    return wallGroup;
};

const createZoneMesh = (zone: Zone) => {
    const zoneColors: Record<string, number> = {
        residential: 0x2563eb,
        commercial: 0xf59e0b,
        green_space: 0x10b981,
        infrastructure: 0x64748b,
    };
    const shape = new THREE.Shape(zone.path.map(p => new THREE.Vector2(p.x, -p.y)));
    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshStandardMaterial({
        color: zoneColors[zone.type] || 0x94a3b8,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.5; // Slightly above ground
    mesh.userData = { id: zone.id, type: 'zone' };
    return mesh;
};

const createRoadMesh = (road: InfrastructureLine) => {
    const roadGroup = new THREE.Group();
    roadGroup.userData = { id: road.id, type: 'infrastructure' };
    const material = new THREE.MeshStandardMaterial({ color: 0x475569 });
    
    for (let i = 0; i < road.path.length - 1; i++) {
        const p1 = road.path[i];
        const p2 = road.path[i + 1];
        const segmentVec = new THREE.Vector2(p2.x - p1.x, p2.y - p1.y);
        const length = segmentVec.length();
        const angle = Math.atan2(segmentVec.y, segmentVec.x);

        const geometry = new THREE.BoxGeometry(length, 2, road.width || 10);
        const segmentMesh = new THREE.Mesh(geometry, material);
        segmentMesh.position.set(p1.x + segmentVec.x / 2, 1, -(p1.y + segmentVec.y / 2));
        segmentMesh.rotation.y = -angle;
        roadGroup.add(segmentMesh);
    }
    return roadGroup;
};

export const Basic3dViewPanel = forwardRef<View3DHandles, Basic3dViewPanelProps>((props, ref) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const { levels, activeLevelIndex, selectedObject, setSelectedObject, isWalkthroughActive, setIsWalkthroughActive, onAddHotspot, isHolocronAuthoringMode } = props;

    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const projectGroupRef = useRef<THREE.Group | null>(null);
    
    // Walkthrough refs
    const pointerLockControlsRef = useRef<PointerLockControls | null>(null);
    const moveForward = useRef(false);
    const moveBackward = useRef(false);
    const moveLeft = useRef(false);
    const moveRight = useRef(false);
    const velocity = useRef(new THREE.Vector3());
    const direction = useRef(new THREE.Vector3());
    const prevTime = useRef(performance.now());
    const isWalkthroughActiveRef = useRef(isWalkthroughActive);
    useEffect(() => { isWalkthroughActiveRef.current = isWalkthroughActive }, [isWalkthroughActive]);

    const isHolocronAuthoringModeRef = useRef(isHolocronAuthoringMode);
    useEffect(() => { isHolocronAuthoringModeRef.current = isHolocronAuthoringMode }, [isHolocronAuthoringMode]);


    const highlightMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xaa6c0b, side: THREE.DoubleSide }), []);
    const stressMaterial = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide }), []);


    useEffect(() => {
        if (!mountRef.current) return;
        const currentMount = mountRef.current;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1e293b);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 10000);
        camera.position.set(400, 500, -600);
        cameraRef.current = camera;
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.shadowMap.enabled = true; // Enable shadows
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        rendererRef.current = renderer;
        currentMount.appendChild(renderer.domElement);
        
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controlsRef.current = controls;
        
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
        hemiLight.position.set(0, 300, 0);
        scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
        dirLight.position.set(150, 200, 100);
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 1000;
        dirLight.shadow.camera.bottom = -1000;
        dirLight.shadow.camera.left = -1000;
        dirLight.shadow.camera.right = 1000;
        scene.add(dirLight);

        const gridHelper = new THREE.GridHelper(2000, 50, 0x444444, 0x444444);
        scene.add(gridHelper);

        const projectGroup = new THREE.Group();
        projectGroup.position.y = 0.1; // Lift slightly above grid
        projectGroupRef.current = projectGroup;
        scene.add(projectGroup);

        const animate = () => {
            requestAnimationFrame(animate);

            if (isWalkthroughActiveRef.current && pointerLockControlsRef.current?.isLocked) {
                const time = performance.now();
                const delta = (time - prevTime.current) / 1000;

                velocity.current.x -= velocity.current.x * 10.0 * delta;
                velocity.current.z -= velocity.current.z * 10.0 * delta;

                direction.current.z = Number(moveForward.current) - Number(moveBackward.current);
                direction.current.x = Number(moveRight.current) - Number(moveLeft.current);
                direction.current.normalize();

                if (moveForward.current || moveBackward.current) velocity.current.z -= direction.current.z * 400.0 * delta;
                if (moveLeft.current || moveRight.current) velocity.current.x -= direction.current.x * 400.0 * delta;

                pointerLockControlsRef.current.moveRight(-velocity.current.x * delta);
                pointerLockControlsRef.current.moveForward(-velocity.current.z * delta);
                
                pointerLockControlsRef.current.getObject().position.y = levels[activeLevelIndex].elevation + 160;

                prevTime.current = time;
            } else {
                controls.update();
            }
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (currentMount && rendererRef.current && cameraRef.current) {
                cameraRef.current.aspect = currentMount.clientWidth / currentMount.clientHeight;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        const onCanvasClick = (event: MouseEvent) => {
            if (isWalkthroughActiveRef.current) return;
            if (!mountRef.current || !cameraRef.current || !projectGroupRef.current) return;

            const rect = mountRef.current.getBoundingClientRect();
            const mouse = new THREE.Vector2();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, cameraRef.current);

            const intersects = raycaster.intersectObjects(projectGroupRef.current.children, true);

            if (intersects.length > 0) {
                let clickedObject: THREE.Object3D | null = intersects[0].object;
                while (clickedObject && !clickedObject.userData.id) {
                    clickedObject = clickedObject.parent;
                }
                
                if (clickedObject && clickedObject.userData.id) {
                    if (clickedObject.userData.type === 'hotspot' && props.onHotspotClick) {
                        props.onHotspotClick(clickedObject.userData.hotspotData);
                        return;
                    }
                    const { id, type, levelIndex } = clickedObject.userData;
                    setSelectedObject({ id, type, levelIndex });
                }
            } else {
                setSelectedObject(null);
            }
        };
        currentMount.addEventListener('click', onCanvasClick);

        const onCanvasDblClick = (event: MouseEvent) => {
            if (!isHolocronAuthoringModeRef.current || !onAddHotspot || !mountRef.current || !cameraRef.current || !projectGroupRef.current) return;

            const rect = mountRef.current.getBoundingClientRect();
            const mouse = new THREE.Vector2();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, cameraRef.current);

            const intersects = raycaster.intersectObjects(projectGroupRef.current.children, true);

            if (intersects.length > 0) {
                const intersectionPoint = intersects[0].point;
                onAddHotspot({ x: intersectionPoint.x, y: intersectionPoint.y, z: intersectionPoint.z });
            }
        };
        currentMount.addEventListener('dblclick', onCanvasDblClick);

        return () => {
            window.removeEventListener('resize', handleResize);
            currentMount.removeEventListener('click', onCanvasClick);
            currentMount.removeEventListener('dblclick', onCanvasDblClick);
            if (currentMount && rendererRef.current) {
                currentMount.removeChild(rendererRef.current.domElement);
            }
            rendererRef.current?.dispose();
        };
    }, [setSelectedObject, onAddHotspot]);

    useEffect(() => {
        if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;

        if (isWalkthroughActive) {
            const plc = new PointerLockControls(cameraRef.current, rendererRef.current.domElement);
            pointerLockControlsRef.current = plc;
            sceneRef.current.add(plc.getObject());
            (controlsRef.current as any)!.enabled = false;

            const onKeyDown = (e: KeyboardEvent) => {
                switch (e.code) {
                    case 'KeyW': moveForward.current = true; break;
                    case 'KeyA': moveLeft.current = true; break;
                    case 'KeyS': moveBackward.current = true; break;
                    case 'KeyD': moveRight.current = true; break;
                }
            };
            const onKeyUp = (e: KeyboardEvent) => {
                switch (e.code) {
                    case 'KeyW': moveForward.current = false; break;
                    case 'KeyA': moveLeft.current = false; break;
                    case 'KeyS': moveBackward.current = false; break;
                    case 'KeyD': moveRight.current = false; break;
                }
            };
            const onPointerLockChange = () => {
                if (!plc.isLocked) setIsWalkthroughActive(false);
            };

            document.addEventListener('keydown', onKeyDown);
            document.addEventListener('keyup', onKeyUp);
            document.addEventListener('pointerlockchange', onPointerLockChange);

            return () => {
                document.removeEventListener('keydown', onKeyDown);
                document.removeEventListener('keyup', onKeyUp);
                document.removeEventListener('pointerlockchange', onPointerLockChange);
                if (sceneRef.current && pointerLockControlsRef.current) {
                    sceneRef.current.remove(pointerLockControlsRef.current.getObject());
                }
                (controlsRef.current as any)!.enabled = true;
            };
        }
    }, [isWalkthroughActive, setIsWalkthroughActive]);


    useLayoutEffect(() => {
        const projectGroup = projectGroupRef.current;
        if (!projectGroup) return;

        while (projectGroup.children.length) {
            projectGroup.remove(projectGroup.children[0]);
        }
        
        const groundGeo = new THREE.PlaneGeometry(2000, 2000);
        const groundMat = new THREE.ShadowMaterial({ opacity: 0.3 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI/2;
        ground.receiveShadow = true;
        projectGroup.add(ground);
        
        const activeLevel = props.levels[props.activeLevelIndex];
        if (activeLevel) {
            activeLevel.walls.forEach(wall => {
                const room = activeLevel.rooms.find(r => r.wallIds.includes(wall.id));
                const wallMesh = createWallWithOpenings(wall, activeLevel.placements, activeLevel.elevation, room);
                wallMesh.traverse(child => { 
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    } 
                });
                wallMesh.userData = { id: wall.id, type: 'wall', levelIndex: props.activeLevelIndex };
                projectGroup.add(wallMesh);
            });
            
            activeLevel.rooms.forEach(room => {
                const roomWalls = room.wallIds.map(id => activeLevel.walls.find(w => w.id === id)).filter(Boolean) as Wall[];
                if (roomWalls.length < 3) return;

                const points: THREE.Vector2[] = [];
                roomWalls.forEach(w => {
                    points.push(new THREE.Vector2(w.x1, w.y1));
                    points.push(new THREE.Vector2(w.x2, w.y2));
                });
                const uniquePoints = Array.from(new Set(points.map(p => `${p.x},${p.y}`))).map(s => {
                    const [x,y] = s.split(',').map(parseFloat);
                    return new THREE.Vector2(x,y);
                });
                
                const center = uniquePoints.reduce((acc, p) => acc.add(p), new THREE.Vector2()).divideScalar(uniquePoints.length);
                uniquePoints.sort((a, b) => Math.atan2(a.y - center.y, a.x - center.x) - Math.atan2(b.y - center.y, b.x - center.x));

                if(uniquePoints.length > 2) {
                    const floorShape = new THREE.Shape(uniquePoints.map(p => new THREE.Vector2(p.x, -p.y)));
                    const floorGeom = new THREE.ShapeGeometry(floorShape);
                    const floorMaterial = createMaterial(room.floorMaterial, 'floor');
                    const floorMesh = new THREE.Mesh(floorGeom, floorMaterial);
                    floorMesh.rotation.x = -Math.PI / 2;
                    floorMesh.position.y = activeLevel.elevation + 0.5; // Slightly above ground plane
                    floorMesh.userData = { id: room.id, type: 'room', levelIndex: props.activeLevelIndex, originalMaterial: floorMaterial };
                    floorMesh.receiveShadow = true;
                    projectGroup.add(floorMesh);
                }
            });

            (activeLevel.placedModels || []).forEach(modelData => {
                const modelDef = PREDEFINED_3D_MODELS.find(m => m.key === modelData.modelKey);
                if (!modelDef) return;

                if (modelDef.modelUrl) {
                    const addModelToScene = (gltfScene: THREE.Group) => {
                        const modelInstance = gltfScene.clone();
                        modelInstance.position.set(modelData.x, activeLevel.elevation, -modelData.y);
                        modelInstance.rotation.y = -THREE.MathUtils.degToRad(modelData.rotation);
                        
                        const box = new THREE.Box3().setFromObject(modelInstance);
                        const size = box.getSize(new THREE.Vector3());
                        const scaleFactor = Math.min(modelData.width / size.x, modelData.depth / size.z, modelData.height3d / size.y);
                        modelInstance.scale.set(scaleFactor, scaleFactor, scaleFactor);

                        modelInstance.traverse(child => {
                            if (child instanceof THREE.Mesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                            }
                        });
                        modelInstance.userData = { id: modelData.id, type: 'placedModel', levelIndex: props.activeLevelIndex };
                        projectGroup.add(modelInstance);
                    };

                    if (modelCache.has(modelDef.modelUrl)) {
                        addModelToScene(modelCache.get(modelDef.modelUrl)!);
                    } else {
                        gltfLoader.load(modelDef.modelUrl, (gltf) => {
                            modelCache.set(modelDef.modelUrl, gltf.scene);
                            addModelToScene(gltf.scene);
                        });
                    }
                } else {
                    // Render a placeholder box if no modelUrl
                    const placeholderGeo = new THREE.BoxGeometry(modelData.width, modelData.height3d, modelData.depth);
                    const placeholderMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
                    const placeholderMesh = new THREE.Mesh(placeholderGeo, placeholderMat);
                    placeholderMesh.position.set(modelData.x, activeLevel.elevation + modelData.height3d / 2, -modelData.y);
                    placeholderMesh.rotation.y = -THREE.MathUtils.degToRad(modelData.rotation);
                    placeholderMesh.castShadow = true;
                    placeholderMesh.receiveShadow = true;
                    placeholderMesh.userData = { id: modelData.id, type: 'placedModel', levelIndex: props.activeLevelIndex };
                    projectGroup.add(placeholderMesh);
                }
            });
        }
        
        (props.zones || []).forEach(zone => {
            const zoneMesh = createZoneMesh(zone);
            projectGroup.add(zoneMesh);
        });

        (props.infrastructure || []).forEach(road => {
            if(road.type === 'road') {
                const roadMesh = createRoadMesh(road);
                roadMesh.traverse(child => {
                    if (child instanceof THREE.Mesh) child.castShadow = true;
                });
                projectGroup.add(roadMesh);
            }
        });

    }, [props.levels, props.activeLevelIndex, props.zones, props.infrastructure]);


    useLayoutEffect(() => {
        const projectGroup = projectGroupRef.current;
        if (!projectGroup) return;

        projectGroup.traverse(child => {
            const data = child.userData;
            if (data.type === 'room' || data.type === 'wall' || data.type === 'road' || data.type === 'zone' || data.type === 'placedModel') {
                 child.traverse(c => { 
                    if (c instanceof THREE.Mesh && c.userData.originalMaterial) {
                        c.material = c.userData.originalMaterial;
                    }
                 });
            }
        });
        
        if (selectedObject && selectedObject.levelIndex === activeLevelIndex) {
            const objectToHighlight = projectGroup.children.find(child => child.userData.id === selectedObject.id);
            if (objectToHighlight) {
                objectToHighlight.traverse(child => {
                    if (child instanceof THREE.Mesh && !(child instanceof THREE.ShadowMaterial)) {
                        child.userData.originalMaterial = child.material;
                        child.material = highlightMaterial;
                    }
                });
            }
        }
    }, [selectedObject, activeLevelIndex, highlightMaterial]);

    useLayoutEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        // Restore previously highlighted objects by collaboration selections
        originalMaterialsCache.forEach((material, uuid) => {
            const object = scene.getObjectByProperty('uuid', uuid);
            if (object) { (object as THREE.Mesh).material = material; }
        });
        originalMaterialsCache.clear();
    
        // Apply new highlights for collaboration
        Object.values(props.liveSelections).forEach((selection: LiveSelection) => {
            if (!selection.objectId || selection.userId === props.currentUser?.id) return;
    
            const objectToHighlight = scene.getObjectByProperty('userData', (ud: any) => ud && ud.id === selection.objectId);
    
            if (objectToHighlight) {
                const color = new THREE.Color(getColorForUserId(selection.userId));
                const selectionMaterial = new THREE.MeshStandardMaterial({
                    color: color, emissive: color, emissiveIntensity: 0.6, transparent: true, opacity: 0.5, side: THREE.DoubleSide
                });
    
                objectToHighlight.traverse(child => {
                    if (child instanceof THREE.Mesh && !(child instanceof THREE.ShadowMaterial)) {
                        if (!originalMaterialsCache.has(child.uuid)) {
                            originalMaterialsCache.set(child.uuid, child.material);
                        }
                        child.material = selectionMaterial;
                    }
                });
            }
        });
    }, [props.liveSelections, props.currentUser?.id]);
    
    useLayoutEffect(() => {
        const projectGroup = projectGroupRef.current;
        if (!projectGroup) return;

        projectGroup.traverse(child => {
            if (child.userData.type === 'wall') {
                const originalMat = child.userData.originalMaterial;
                if(originalMat) {
                    child.traverse(c => { if(c instanceof THREE.Mesh) c.material = originalMat; });
                    delete child.userData.originalMaterial;
                }
            }
        });

        if (props.isDigitalTwinModeActive && props.activeDataOverlays.stress && props.digitalTwinData) {
            props.digitalTwinData.structuralStress.forEach(stressData => {
                const wallObject = projectGroup.children.find(c => c.userData.id === stressData.wallId);
                if (wallObject) {
                    const color = new THREE.Color().setHSL(0.3 * (1 - stressData.stressFactor), 1.0, 0.5); // Green to Red
                    
                    wallObject.traverse(c => {
                        if (c instanceof THREE.Mesh) {
                            if (!wallObject.userData.originalMaterial) {
                                wallObject.userData.originalMaterial = c.material;
                            }
                            c.material = new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide });
                        }
                    });
                }
            });
        }
    }, [props.isDigitalTwinModeActive, props.activeDataOverlays.stress, props.digitalTwinData, stressMaterial]);

    React.useImperativeHandle(ref, () => ({
        exportAsPNG: () => rendererRef.current?.domElement.toDataURL('image/png'),
        exportAsGLB: (projectName: string) => {
            const exporter = new GLTFExporter();
            if (projectGroupRef.current) {
                exporter.parse(
                    projectGroupRef.current,
                    (gltf) => { // gltf is an ArrayBuffer when binary: true
                        if (!(gltf instanceof ArrayBuffer)) {
                            console.error('An error happened during GLB export: expected ArrayBuffer.');
                            return;
                        }
                        const blob = new Blob([gltf], { type: 'model/gltf-binary' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `${projectName}.glb`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(link.href);
                    },
                    (error) => {
                        console.error('An error happened during GLB export:', error);
                    },
                    { binary: true } // Export as a binary GLB file
                );
            }
        },
    }));

    return (
        <div className="w-full h-full bg-slate-900 relative" ref={mountRef}>
             {isHolocronAuthoringMode && (
                <div className="absolute top-2 left-2 bg-purple-600/80 text-white text-xs font-semibold px-3 py-1 rounded-full animate-pulse z-10 pointer-events-none">
                    Hotspot Authoring Mode
                </div>
            )}
            <AnimatePresence>
                {isWalkthroughActive && !pointerLockControlsRef.current?.isLocked && (
                    <MotionDiv
                        className="absolute inset-0 bg-black/70 flex items-center justify-center cursor-pointer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => pointerLockControlsRef.current?.lock()}
                    >
                        <p className="text-white text-lg font-semibold">Click to enter Walkthrough Mode</p>
                    </MotionDiv>
                )}
            </AnimatePresence>
            {isWalkthroughActive && pointerLockControlsRef.current?.isLocked && (
                <>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-2xl pointer-events-none">+</div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-md pointer-events-none">WASD to Move | ESC to Exit</div>
                </>
            )}
        </div>
    );
});

Basic3dViewPanel.displayName = 'Basic3dViewPanel';