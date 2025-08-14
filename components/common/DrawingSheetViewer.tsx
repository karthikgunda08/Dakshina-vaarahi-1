// src/components/common/DrawingSheetViewer.tsx
import React, { useState, useMemo } from 'react';
import jspdf from 'jspdf';
import * as THREE from 'three';
import { GFCDrawingSet, ProjectData, Level, DimensionLine, Room, Placement, Wall, User } from '../../types/index';
import { calculateRoomArea } from '../../lib/geometryUtils';
import { SVG_WIDTH, SVG_HEIGHT, DRAWING_AREA_PADDING, TITLE_BLOCK_HEIGHT, PROJECT_UNITS_TO_METERS } from '../../lib/drawingConstants';

interface DrawingSheetViewerProps {
    sheet: GFCDrawingSet;
    projectData: ProjectData;
    currentUser: User | null;
}

const projectToSvgCoords = (point: {x: number, y: number}, bounds: {minX: number, minY: number, scale: number, offsetX: number, offsetY: number}) => {
    const svgX = (point.x - bounds.minX) * bounds.scale + bounds.offsetX;
    const svgY = (point.y - bounds.minY) * bounds.scale + bounds.offsetY;
    return { x: svgX, y: svgY };
};

const getProjectBounds = (level: Level) => {
    const allPoints = level.walls.flatMap(w => [{x: w.x1, y: w.y1}, {x: w.x2, y: w.y2}]);
    if (allPoints.length === 0) return { minX: 0, minY: 0, width: 1, height: 1 };
    const minX = Math.min(...allPoints.map(p => p.x));
    const minY = Math.min(...allPoints.map(p => p.y));
    const maxX = Math.max(...allPoints.map(p => p.x));
    const maxY = Math.max(...allPoints.map(p => p.y));
    return { minX, minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
};

const TitleBlock: React.FC<{ projectName: string, sheetName: string, userName: string }> = ({ projectName, sheetName, userName }) => (
    <g className="title-block">
        <rect x="0" y={SVG_HEIGHT - TITLE_BLOCK_HEIGHT} width={SVG_WIDTH} height={TITLE_BLOCK_HEIGHT} className="fill" />
        <line x1="0" y1={SVG_HEIGHT - TITLE_BLOCK_HEIGHT} x2={SVG_WIDTH} y2={SVG_HEIGHT - TITLE_BLOCK_HEIGHT} className="stroke-heavy"/>
        <line x1={SVG_WIDTH - 250} y1={SVG_HEIGHT - TITLE_BLOCK_HEIGHT} x2={SVG_WIDTH - 250} y2={SVG_HEIGHT} className="stroke-light"/>
        <text x="20" y={SVG_HEIGHT - 60} className="title-text">{projectName}</text>
        <text x="20" y={SVG_HEIGHT - 35} className="subtitle-text">Architect: {userName}</text>
        <text x={SVG_WIDTH - 230} y={SVG_HEIGHT - 60} className="sheet-text">{sheetName}</text>
        <text x={SVG_WIDTH - 230} y={SVG_HEIGHT - 35} className="date-text">Date: {new Date().toLocaleDateString()}</text>
    </g>
);

const Dimension: React.FC<{ dim: DimensionLine, bounds: any }> = ({ dim, bounds }) => {
    const p1 = {x: dim.p1.x, y: dim.p1.y};
    const p2 = {x: dim.p2.x, y: dim.p2.y};
    const vec = new THREE.Vector2(p2.x - p1.x, p2.y - p1.y);
    const length = vec.length();
    const perpendicular = vec.clone().normalize().rotateAround({x:0, y:0}, Math.PI / 2).multiplyScalar(dim.offsetDistance);
    
    const start = projectToSvgCoords({ x: p1.x + perpendicular.x, y: p1.y + perpendicular.y }, bounds);
    const end = projectToSvgCoords({ x: p2.x + perpendicular.x, y: p2.y + perpendicular.y }, bounds);
    const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
    
    const textAngle = vec.angle() * (180 / Math.PI);
    const displayLength = (length * PROJECT_UNITS_TO_METERS).toFixed(2) + 'm';

    return (
        <g className="dimension">
            <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
            <text x={mid.x} y={mid.y - 5} transform={`rotate(${textAngle > 90 || textAngle < -90 ? textAngle + 180 : textAngle}, ${mid.x}, ${mid.y})`}>
                {displayLength}
            </text>
        </g>
    );
};

const Door: React.FC<{ placement: Placement, wall: Wall, bounds: any }> = ({ placement, wall, bounds }) => {
    const wallVec = new THREE.Vector2(wall.x2 - wall.x1, wall.y2 - wall.y1);
    const wallAngle = wallVec.angle() * (180 / Math.PI);
    const positionOnWall = wallVec.clone().multiplyScalar(placement.positionRatio).add(new THREE.Vector2(wall.x1, wall.y1));
    const centerSvg = projectToSvgCoords(positionOnWall, bounds);
    const widthSvg = placement.width * bounds.scale;
    const thicknessSvg = wall.thickness * bounds.scale;

    return (
        <g transform={`translate(${centerSvg.x}, ${centerSvg.y}) rotate(${wallAngle})`} className="door">
             <rect x={-widthSvg / 2} y={-thicknessSvg / 2} width={widthSvg} height={thicknessSvg} className="opening-fill" />
             <rect x={-widthSvg / 2} y={-thicknessSvg / 2} width={widthSvg} height={4} className="leaf-stroke" />
             <path d={`M ${-widthSvg/2} ${-thicknessSvg/2} A ${widthSvg} ${widthSvg} 0 0 1 ${widthSvg/2} ${-thicknessSvg/2 + widthSvg}`} className="swing-arc"/>
        </g>
    );
}

const Window: React.FC<{ placement: Placement, wall: Wall, bounds: any }> = ({ placement, wall, bounds }) => {
    const wallVec = new THREE.Vector2(wall.x2 - wall.x1, wall.y2 - wall.y1);
    const wallAngle = wallVec.angle() * (180 / Math.PI);
    const positionOnWall = wallVec.clone().multiplyScalar(placement.positionRatio).add(new THREE.Vector2(wall.x1, wall.y1));
    const centerSvg = projectToSvgCoords(positionOnWall, bounds);
    const widthSvg = placement.width * bounds.scale;
    const thicknessSvg = wall.thickness * bounds.scale;
    
    return (
         <g transform={`translate(${centerSvg.x}, ${centerSvg.y}) rotate(${wallAngle})`} className="window">
             <rect x={-widthSvg / 2} y={-thicknessSvg / 2} width={widthSvg} height={thicknessSvg} className="opening-fill" />
             <rect x={-widthSvg / 2} y={-thicknessSvg / 2} width={widthSvg} height={thicknessSvg} className="leaf-stroke" />
             <line x1={-widthSvg / 2} y1={0} x2={widthSvg / 2} y2={0} className="leaf-stroke" />
        </g>
    );
}


export const DrawingSheetViewer: React.FC<DrawingSheetViewerProps> = ({ projectData, currentUser }) => {
    const [activeLevelIndex, setActiveLevelIndex] = useState(0);

    const handleExportToPDF = () => {
        const svgElement = document.getElementById('drawing-svg-export');
        if (!svgElement) return;

        const doc = new jspdf({
            orientation: 'landscape',
            unit: 'px',
            format: [SVG_WIDTH, SVG_HEIGHT]
        });

        doc.html(svgElement.outerHTML, {
            callback: function(doc) {
                doc.save(`${projectData.name}_${projectData.levels[activeLevelIndex].name}.pdf`);
            },
            x: 0,
            y: 0,
            width: SVG_WIDTH,
            windowWidth: SVG_WIDTH
        });
    };

    const activeLevel = projectData.levels[activeLevelIndex];
    
    const projectBounds = useMemo(() => getProjectBounds(activeLevel), [activeLevel]);
    
    const drawingArea = {
        width: SVG_WIDTH - DRAWING_AREA_PADDING * 2,
        height: SVG_HEIGHT - DRAWING_AREA_PADDING * 2 - TITLE_BLOCK_HEIGHT,
    };
    
    const scale = Math.min(
        drawingArea.width / projectBounds.width,
        drawingArea.height / projectBounds.height
    );
    
    const offsetX = (drawingArea.width - projectBounds.width * scale) / 2 + DRAWING_AREA_PADDING;
    const offsetY = (drawingArea.height - projectBounds.height * scale) / 2 + DRAWING_AREA_PADDING;
    
    const bounds = { minX: projectBounds.minX, minY: projectBounds.minY, scale, offsetX, offsetY };

    const getRoomCentroid = (room: Room) => {
        const roomWalls = room.wallIds.map(id => activeLevel.walls.find(w => w.id === id)).filter(Boolean) as Wall[];
        const points = roomWalls.flatMap(w => [{ x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 }]);
        const uniquePoints = Array.from(new Map(points.map(p => [`${p.x},${p.y}`, p])).values());
        if (uniquePoints.length === 0) return { x: 0, y: 0 };
        const centroid = uniquePoints.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
        centroid.x /= uniquePoints.length;
        centroid.y /= uniquePoints.length;
        return centroid;
    };


    return (
        <div className="w-full bg-slate-700 p-2 rounded-lg">
             <div className="flex justify-between items-center mb-2 px-2">
                 <div className="flex gap-1 bg-slate-800 p-1 rounded-md">
                    {projectData.levels.map((level, index) => (
                        <button key={level.id} onClick={() => setActiveLevelIndex(index)} className={`px-3 py-1 text-xs rounded ${activeLevelIndex === index ? 'bg-sky-600 text-white' : 'hover:bg-slate-700'}`}>
                            {level.name}
                        </button>
                    ))}
                 </div>
                 <button onClick={handleExportToPDF} className="px-4 py-1 text-xs font-semibold bg-sky-600 hover:bg-sky-500 rounded-md">Export PDF</button>
             </div>
            <svg id="drawing-svg-export" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-auto bg-white rounded-md">
                <style>{`
                    .stroke-heavy { stroke: #000; stroke-width: 0.8; }
                    .stroke-medium { stroke: #000; stroke-width: 0.5; }
                    .stroke-light { stroke: #000; stroke-width: 0.2; }
                    .fill { fill: white; }
                    .opening-fill { fill: white; }
                    .dimension { stroke: #555; stroke-width: 0.2; fill: #555; font-size: 8px; font-family: sans-serif; text-anchor: middle; }
                    .room-label { fill: #000; font-size: 10px; font-family: sans-serif; text-anchor: middle; }
                    .door .leaf-stroke { stroke: #000; stroke-width: 0.3; fill: none; }
                    .door .swing-arc { stroke: #888; stroke-width: 0.2; fill: none; stroke-dasharray: 2,2; }
                    .window .leaf-stroke { stroke: #000; stroke-width: 0.3; fill: none; }
                    .title-block { font-family: sans-serif; }
                    .title-block .title-text { font-size: 20px; font-weight: bold; }
                    .title-block .subtitle-text { font-size: 14px; }
                    .title-block .sheet-text { font-size: 18px; font-weight: bold; }
                    .title-block .date-text { font-size: 12px; }
                `}</style>
                <g id="main-drawing">
                    {activeLevel.walls.map(wall => {
                        const p1 = projectToSvgCoords({ x: wall.x1, y: wall.y1 }, bounds);
                        const p2 = projectToSvgCoords({ x: wall.x2, y: wall.y2 }, bounds);
                        return <line key={wall.id} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className="stroke-heavy" />;
                    })}

                    {activeLevel.placements.map(p => {
                        const wall = activeLevel.walls.find(w => w.id === p.wallId);
                        if (!wall) return null;
                        if (p.type === 'door') return <Door key={p.id} placement={p} wall={wall} bounds={bounds} />;
                        if (p.type === 'window') return <Window key={p.id} placement={p} wall={wall} bounds={bounds} />;
                        return null;
                    })}

                    {activeLevel.rooms.map(room => {
                        const center = getRoomCentroid(room);
                        const svgCenter = projectToSvgCoords(center, bounds);
                        const area = (calculateRoomArea(room.wallIds.map(id => activeLevel.walls.find(w => w.id === id)).filter(Boolean) as Wall[]) * PROJECT_UNITS_TO_METERS * PROJECT_UNITS_TO_METERS).toFixed(1);
                        return (
                            <text key={room.id} x={svgCenter.x} y={svgCenter.y} className="room-label">
                                <tspan x={svgCenter.x} dy="0">{room.name}</tspan>
                                <tspan x={svgCenter.x} dy="1.2em">{area} sq.m</tspan>
                            </text>
                        );
                    })}

                    {(activeLevel.dimensionLines || []).map(dim => (
                        <Dimension key={dim.id} dim={dim} bounds={bounds} />
                    ))}
                </g>
                <TitleBlock projectName={projectData.name || 'Untitled'} sheetName={activeLevel.name} userName={currentUser?.name || 'AuraOS User'} />
            </svg>
        </div>
    );
};