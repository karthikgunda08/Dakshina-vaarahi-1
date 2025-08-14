
// src/components/landing/BlueprintCanvas.tsx
import React, { useEffect, useRef } from 'react';
import fabric from 'fabric';
import type { Room, Wall } from '../../types/index';
import { calculateRoomArea } from '../../lib/geometryUtils';

interface BlueprintCanvasProps {
    walls: Pick<Wall, 'id' | 'x1' | 'y1' | 'x2' | 'y2' | 'thickness'>[];
    rooms?: Pick<Room, 'name' | 'wallIds'>[];
    isLoading: boolean;
}

export const BlueprintCanvas: React.FC<BlueprintCanvasProps> = ({ walls, rooms, isLoading }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

    const drawBlueprint = () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        canvas.clear();
        canvas.backgroundColor = '#1e293b'; // slate-800

        // Add a subtle grid
        const gridSize = 50;
        const gridColor = '#334155'; // slate-700
        for (let i = 1; i < canvas.getWidth() / gridSize; i++) {
            for (let j = 1; j < canvas.getHeight() / gridSize; j++) {
                canvas.add(new fabric.Circle({ left: i * gridSize, top: j * gridSize, radius: 0.5, fill: gridColor, selectable: false, evented: false }));
            }
        }

        if (!walls || walls.length === 0) {
            canvas.renderAll();
            return;
        }
        
        const wallObjects = walls.map(wall => {
            const vec = new fabric.Point(wall.x2 - wall.x1, wall.y2 - wall.y1);
            const length = Math.hypot(vec.x, vec.y);
            const unitX = length > 0 ? vec.x / length : 0;
            const unitY = length > 0 ? vec.y / length : 0;
            // Rotate 90 degrees: (x, y) -> (-y, x) then scale
            const perpendicular = new fabric.Point(-unitY, unitX).scalarMultiply(wall.thickness / 2);
            
            const p1 = new fabric.Point(wall.x1, wall.y1);
            const p2 = new fabric.Point(wall.x2, wall.y2);
            
            const points = [
                p1.add(perpendicular),
                p2.add(perpendicular),
                p2.subtract(perpendicular),
                p1.subtract(perpendicular)
            ];

            return new fabric.Polygon(points, {
                fill: '#e2e8f0', // slate-200
                stroke: '#94a3b8', // slate-400
                strokeWidth: 0.5,
                selectable: false,
                evented: false,
            });
        });
        
        canvas.add(...wallObjects);

        const roomLabels = (rooms || []).map(room => {
            if (!room.wallIds || room.wallIds.length === 0) return null;

            const roomWallPoints = room.wallIds.flatMap(wallId => {
                const wall = walls.find(w => w.id === wallId);
                return wall ? [{x: wall.x1, y: wall.y1}, {x: wall.x2, y: wall.y2}] : [];
            });

            if (roomWallPoints.length === 0) return null;

            const centerX = roomWallPoints.reduce((sum, p) => sum + p.x, 0) / roomWallPoints.length;
            const centerY = roomWallPoints.reduce((sum, p) => sum + p.y, 0) / roomWallPoints.length;

            const roomWallsForArea = room.wallIds.map(id => walls.find(w => w.id === id)).filter(Boolean) as Wall[];
            const area = calculateRoomArea(roomWallsForArea);
            // Assume 10 units = 1 foot for a reasonable display number. 100 sq units = 1 sq.ft.
            const areaInSqFt = (area / 100).toFixed(0);
            
            const labelText = `${room.name}\n${areaInSqFt} sq.ft.`;

            return new fabric.Text(labelText, {
                left: centerX,
                top: centerY,
                originX: 'center',
                originY: 'center',
                fontSize: 14,
                fill: '#94a3b8', // slate-400
                fontFamily: 'Inter, sans-serif',
                textAlign: 'center',
                lineHeight: 1.2,
                selectable: false,
                evented: false,
            });
        }).filter(Boolean) as fabric.Object[];

        if(roomLabels.length > 0) {
            canvas.add(...roomLabels);
        }

        // Center and zoom the content
        const group = new fabric.Group([...wallObjects, ...roomLabels], { selectable: false, evented: false });
        canvas.centerObject(group);
        const zoom = Math.min(
            (canvas.width * 0.9) / group.getScaledWidth(),
            (canvas.height * 0.9) / group.getScaledHeight()
        );
        canvas.zoomToPoint(new fabric.Point(canvas.width / 2, canvas.height / 2), zoom);
        
        canvas.renderAll();
    };

    useEffect(() => {
        if (!canvasRef.current) return;
        
        const canvas = new fabric.Canvas(canvasRef.current, {
            interactive: false,
        });
        fabricCanvasRef.current = canvas;

        const parentEl = canvasRef.current.parentElement;
        if (!parentEl) return;

        const resizeObserver = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            canvas.setWidth(width);
            canvas.setHeight(height);
            drawBlueprint();
        });
        
        resizeObserver.observe(parentEl);

        return () => {
            resizeObserver.disconnect();
            canvas.dispose();
            fabricCanvasRef.current = null;
        };
    }, []);

    useEffect(() => {
        drawBlueprint();
    }, [walls, rooms]);

    return (
        <div className="w-full h-full relative">
            <canvas ref={canvasRef} />
            {isLoading && (
                <div className="absolute inset-0 bg-slate-800/80 flex flex-col items-center justify-center text-center">
                    <p className="text-primary font-mono tracking-widest animate-pulse">GENERATING BLUEPRINT...</p>
                </div>
            )}
        </div>
    );
};