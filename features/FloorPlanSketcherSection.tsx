// src/features/FloorPlanSketcherSection.tsx
import React, { useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import fabric from 'fabric';
import { FloorPlanSketcherSectionProps, ReadOnlySketcherProps, SketcherHandles, Wall } from '../types/index';
import { getColorForUserId } from '../lib/colorUtils';
import * as socketService from '../services/socketService';
import { GRID_SIZE } from '../lib/constants';

type CombinedProps = (FloorPlanSketcherSectionProps & { isReadOnly?: false | undefined }) | (ReadOnlySketcherProps & { isReadOnly: true });

// NEW: Snap-to-grid helper function for precision drawing
const snapToGrid = (point: { x: number, y: number }): { x: number, y: number } => {
    return {
        x: Math.round(point.x / GRID_SIZE) * GRID_SIZE,
        y: Math.round(point.y / GRID_SIZE) * GRID_SIZE,
    };
};


export const FloorPlanSketcherSection = React.forwardRef<SketcherHandles, CombinedProps>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const startPoint = useRef<{ x: number, y: number } | null>(null);
  const tempLine = useRef<fabric.Line | null>(null);
  const tempRect = useRef<fabric.Rect | null>(null);
  
  const propsRef = useRef(props);
  useLayoutEffect(() => {
    propsRef.current = props;
  });

  const { levels, activeLevelIndex } = props;
  const isReadOnly = 'isReadOnly' in props && props.isReadOnly;
  const aiFixPreview = !isReadOnly ? (props as FloorPlanSketcherSectionProps).aiFixPreview : null;
  const liveSelections = !isReadOnly ? (props as FloorPlanSketcherSectionProps).liveSelections : {};
  const liveCursors = !isReadOnly ? (props as FloorPlanSketcherSectionProps).liveCursors : {};
  const currentUser = !isReadOnly ? (props as FloorPlanSketcherSectionProps).currentUser : null;

  const drawCanvasContent = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const activeLevel = levels[activeLevelIndex];
    
    canvas.clear();
    
    const gridColor = '#334155';
    for (let i = 0; i < (canvas.width || 0) / (GRID_SIZE * canvas.getZoom()); i++) {
        for (let j = 0; j < (canvas.height || 0) / (GRID_SIZE * canvas.getZoom()); j++) {
            const dot = new fabric.Circle({
                left: i * GRID_SIZE, top: j * GRID_SIZE, radius: 0.5,
                fill: gridColor, selectable: false, evented: false,
                originX: 'center', originY: 'center',
            });
            canvas.add(dot);
        }
    }
    
    (activeLevel.walls || []).forEach(wall => {
        const line = new fabric.Line([wall.x1, wall.y1, wall.x2, wall.y2], {
            stroke: '#e2e8f0', strokeWidth: wall.thickness,
            selectable: true
        });
        (line as any).data = { id: wall.id, type: 'wall', levelIndex: activeLevelIndex };
        canvas.add(line);
    });

    // NEW: Draw room labels
    (activeLevel.rooms || []).forEach(room => {
        if (!room.wallIds || room.wallIds.length === 0) return;

        const roomWalls = room.wallIds.map(id => activeLevel.walls.find(w => w.id === id)).filter(Boolean) as Wall[];
        if (roomWalls.length === 0) return;
        
        const allPoints = roomWalls.flatMap(w => [{x: w.x1, y: w.y1}, {x: w.x2, y: w.y2}]);
        const uniquePoints = Array.from(new Map(allPoints.map(p => [`${p.x},${p.y}`, p])).values());

        if (uniquePoints.length === 0) return;
        
        const centerX = uniquePoints.reduce((sum, p) => sum + p.x, 0) / uniquePoints.length;
        const centerY = uniquePoints.reduce((sum, p) => sum + p.y, 0) / uniquePoints.length;

        const areaText = room.calculatedArea ? `\n${(room.calculatedArea / 100).toFixed(1)} sq. ft.` : '';
        const labelText = `${room.name}${areaText}`;
        
        const label = new fabric.Text(labelText, {
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
            fontSize: 12,
            fill: '#94a3b8',
            textAlign: 'center',
            selectable: true,
            evented: true
        });
        (label as any).data = { id: room.id, type: 'room', levelIndex: activeLevelIndex };
        canvas.add(label);
    });

    (activeLevel.placements || []).forEach(p => {
        const wall = activeLevel.walls.find(w => w.id === p.wallId);
        if(!wall) return;
        const wallVec = new fabric.Point(wall.x2 - wall.x1, wall.y2 - wall.y1);
        const positionOnWall = new fabric.Point(wall.x1, wall.y1).add(wallVec.scalarMultiply(p.positionRatio));
        const angle = fabric.util.radiansToDegrees(Math.atan2(wallVec.y, wallVec.x));
        const rect = new fabric.Rect({
            left: positionOnWall.x, top: positionOnWall.y,
            width: p.width, height: wall.thickness,
            fill: p.type === 'door' ? '#a78bfa' : '#38bdf8',
            originX: 'center', originY: 'center', angle: angle,
            selectable: true
        });
        (rect as any).data = { id: p.id, type: 'placement', levelIndex: activeLevelIndex };
        canvas.add(rect);
    });
    
    (activeLevel.comments || []).forEach(c => {
        const circle = new fabric.Circle({
            left: c.x, top: c.y, radius: 10, fill: c.resolved ? '#10b981' : '#f59e0b',
            originX: 'center', originY: 'center', selectable: true,
        });
        (circle as any).data = { id: c.id, type: 'comment', levelIndex: activeLevelIndex };
        canvas.add(circle);
    });
    
    (activeLevel.zones || []).forEach(zone => {
        const zoneColors: Record<string, string> = { residential: 'rgba(37, 99, 235, 0.5)', commercial: 'rgba(245, 158, 11, 0.5)', green_space: 'rgba(16, 185, 129, 0.5)' };
        const poly = new fabric.Polygon(zone.path, {
            fill: zoneColors[zone.type] || 'rgba(100, 116, 139, 0.5)',
            stroke: '#fff', strokeWidth: 1, strokeDashArray: [3,3],
            selectable: true
        });
        (poly as any).data = { id: zone.id, type: 'zone', levelIndex: activeLevelIndex };
        canvas.add(poly);
    });

    (activeLevel.infrastructure || []).forEach(infra => {
        const polyline = new fabric.Polyline(infra.path, {
            stroke: '#64748b', strokeWidth: infra.width || 10, fill: 'transparent',
            selectable: true
        });
        (polyline as any).data = { id: infra.id, type: 'infrastructure', levelIndex: activeLevelIndex };
        canvas.add(polyline);
    });


    if (aiFixPreview) {
        aiFixPreview.fix.addedWalls?.forEach(wall => {
             const line = new fabric.Line([wall.x1, wall.y1, wall.x2, wall.y2], {
                stroke: 'rgba(139, 92, 246, 0.7)', strokeWidth: 10,
                strokeDashArray: [5, 5], selectable: false, evented: false
            });
            canvas.add(line);
        });
    }

    Object.values(liveSelections).forEach(selection => {
        if(selection.userId === currentUser?.id) return;
        const obj = canvas.getObjects().find(o => (o as any).data?.id === selection.objectId);
        if(obj) { obj.set({ stroke: getColorForUserId(selection.userId), strokeWidth: (obj as any).strokeWidth + 4 }); }
    });
    
    Object.entries(liveCursors).forEach(([userId, cursor]) => {
        if (userId === currentUser?.id) return;
        const cursorShape = new fabric.Text('▼', {
            left: cursor.x, top: cursor.y, fontSize: 16, fill: cursor.color,
            selectable: false, evented: false
        });
        const nameLabel = new fabric.Text(cursor.userName, {
            left: cursor.x + 8, top: cursor.y + 8, fontSize: 10, fill: '#fff',
            backgroundColor: cursor.color, padding: 2, selectable: false, evented: false
        });
        canvas.add(cursorShape);
        canvas.add(nameLabel);
    });

    canvas.renderAll();
  }, [levels, activeLevelIndex, aiFixPreview, liveSelections, liveCursors, currentUser, isReadOnly]);


  useLayoutEffect(() => {
    drawCanvasContent();
  }, [drawCanvasContent]);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = new fabric.Canvas(canvasRef.current, { 
        objectCaching: false,
        selection: !propsRef.current.isReadOnly
    });
    fabricCanvasRef.current = canvas;

    const parentEl = canvasRef.current.parentElement;
    if (!parentEl) return;
    
    const drawCanvasContentRef = { current: drawCanvasContent };
    drawCanvasContentRef.current = drawCanvasContent;

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      canvas.setWidth(width);
      canvas.setHeight(height);
      drawCanvasContentRef.current();
    });
    resizeObserver.observe(parentEl);

    let isPanning = false;
    let lastClientX: number, lastClientY: number;

    const onMouseDown = (opt: fabric.IEvent) => {
        const currentProps = propsRef.current;
        if (currentProps.isReadOnly) return;
        const { currentTool, addPlacement, addComment, levels, activeLevelIndex, addWall, addInfrastructure, addZone } = currentProps as FloorPlanSketcherSectionProps;
        const activeLevel = levels[activeLevelIndex];

        const e = opt.e;
        if (('altKey' in e && e.altKey) || ('button' in e && e.button === 2)) {
            isPanning = true;
            canvas.selection = false;
            lastClientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            lastClientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            return;
        }
      
        const pointer = canvas.getPointer(opt.e);
        // SNAP TO GRID
        startPoint.current = snapToGrid({ x: pointer.x, y: pointer.y });
        isDrawing.current = true;

        if ((currentTool === 'wall' || currentTool === 'road') && (addWall || addInfrastructure)) {
            tempLine.current = new fabric.Line([startPoint.current.x, startPoint.current.y, startPoint.current.x, startPoint.current.y], {
                stroke: 'rgba(255, 255, 255, 0.5)', strokeWidth: 10, selectable: false, evented: false
            });
            canvas.add(tempLine.current);
        } else if (currentTool === 'zone' && addZone) {
            tempRect.current = new fabric.Rect({
                left: startPoint.current.x, top: startPoint.current.y,
                width: 0, height: 0,
                fill: 'rgba(37, 99, 235, 0.3)',
                stroke: 'rgba(59, 130, 246, 0.7)',
                strokeDashArray: [5, 5],
                selectable: false, evented: false
            });
            canvas.add(tempRect.current);
        } else if ((currentTool === 'door' || currentTool === 'window') && addPlacement) {
            if (opt.target && (opt.target as any).data?.type === 'wall') {
                const wallId = (opt.target as any).data.id;
                const wall = activeLevel.walls.find(w => w.id === wallId);
                if (!wall) return;
                const wallVec = { x: wall.x2 - wall.x1, y: wall.y2 - wall.y1 };
                const mouseVec = { x: pointer.x - wall.x1, y: pointer.y - wall.y1 };
                const positionRatio = (mouseVec.x * wallVec.x + mouseVec.y * wallVec.y) / (wallVec.x * wallVec.x + wallVec.y * wallVec.y);
                addPlacement({ wallId, type: currentTool, positionRatio, width: 80, height: 210 });
            }
            isDrawing.current = false;
        } else if (currentTool === 'comment' && addComment) {
            addComment({ text: 'New Comment', x: pointer.x, y: pointer.y });
            isDrawing.current = false;
        } else {
            isDrawing.current = false;
        }
    };

    const onMouseMove = (opt: fabric.IEvent) => {
        const currentProps = propsRef.current;
        if (currentProps.isReadOnly) return;
        const { currentProject } = currentProps as FloorPlanSketcherSectionProps;

        const pointer = canvas.getPointer(opt.e);
        if (currentProject?.id) socketService.emitCursorMove(currentProject.id, pointer);

        if (isPanning) {
            const e = opt.e;
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            const vpt = canvas.viewportTransform;
            if (vpt) {
                vpt[4] += clientX - lastClientX;
                vpt[5] += clientY - lastClientY;
                canvas.requestRenderAll();
            }
            lastClientX = clientX;
            lastClientY = clientY;
        } else if (isDrawing.current && startPoint.current) {
            // SNAP TO GRID
            const snappedPointer = snapToGrid(pointer);
            if (tempRect.current) {
                const w = snappedPointer.x - startPoint.current.x;
                const h = snappedPointer.y - startPoint.current.y;
                tempRect.current.set({
                    width: Math.abs(w),
                    height: Math.abs(h),
                    left: w > 0 ? startPoint.current.x : snappedPointer.x,
                    top: h > 0 ? startPoint.current.y : snappedPointer.y,
                });
            } else if (tempLine.current) {
                tempLine.current.set({ x2: snappedPointer.x, y2: snappedPointer.y });
            }
            canvas.renderAll();
        }
    };

    const onMouseUp = (opt: fabric.IEvent) => {
        const currentProps = propsRef.current;
        if (currentProps.isReadOnly) return;
        const { currentTool, addWall, addInfrastructure, addZone } = currentProps as FloorPlanSketcherSectionProps;

        if (isPanning) {
            isPanning = false;
            canvas.selection = true;
        } else if (isDrawing.current && startPoint.current) {
            const pointer = canvas.getPointer(opt.e);
            // SNAP TO GRID
            const snappedPointer = snapToGrid(pointer);
            if (currentTool === 'wall' && addWall) {
                addWall({ x1: startPoint.current.x, y1: startPoint.current.y, x2: snappedPointer.x, y2: snappedPointer.y, thickness: 10, height: 240 });
            } else if (currentTool === 'road' && addInfrastructure) {
                addInfrastructure({ path: [{x: startPoint.current.x, y: startPoint.current.y}, {x: snappedPointer.x, y: snappedPointer.y}]});
            } else if (currentTool === 'zone' && addZone) {
                const path = [
                    {x: startPoint.current.x, y: startPoint.current.y},
                    {x: snappedPointer.x, y: startPoint.current.y},
                    {x: snappedPointer.x, y: snappedPointer.y},
                    {x: startPoint.current.x, y: snappedPointer.y}
                ];
                addZone({ type: 'residential', path });
            }
            isDrawing.current = false;
            if (tempLine.current) canvas.remove(tempLine.current);
            if (tempRect.current) canvas.remove(tempRect.current);
            tempLine.current = null;
            tempRect.current = null;
        }
    };

    // NEW: Parametric geometry handler
    const onObjectModified = (opt: fabric.IEvent) => {
        const target = opt.target as fabric.Line;
        if (!target || !(target as any).data || (target as any).data.type !== 'wall') {
            return;
        }
    
        const currentProps = propsRef.current;
        if (currentProps.isReadOnly) return;
        const { levels, activeLevelIndex, updateWall, pushToUndoStack } = currentProps as FloorPlanSketcherSectionProps;
        if (!updateWall || !pushToUndoStack) return;

        const movedWallId = (target as any).data.id;
        const originalWalls = levels[activeLevelIndex].walls;
        const originalMovedWall = originalWalls.find(w => w.id === movedWallId);
        if (!originalMovedWall) return;

        const originalPoints = { x1: originalMovedWall.x1, y1: originalMovedWall.y1, x2: originalMovedWall.x2, y2: originalMovedWall.y2 };
        
        // Snap the new points of the moved wall
        const newPoints = {
            x1: snapToGrid({ x: target.x1!, y: target.y1! }).x,
            y1: snapToGrid({ x: target.x1!, y: target.y1! }).y,
            x2: snapToGrid({ x: target.x2!, y: target.y2! }).x,
            y2: snapToGrid({ x: target.x2!, y: target.y2! }).y,
        };

        const dx1 = newPoints.x1 - originalPoints.x1;
        const dy1 = newPoints.y1 - originalPoints.y1;
        const dx2 = newPoints.x2 - originalPoints.x2;
        const dy2 = newPoints.y2 - originalPoints.y2;
    
        pushToUndoStack();

        updateWall(movedWallId, newPoints);
        
        const epsilon = 1.0;
        originalWalls.forEach(wall => {
            if (wall.id === movedWallId) return;
            let needsUpdate = false;
            let wallUpdates: Partial<typeof wall> = {};

            // Check connection at start point
            if (Math.hypot(wall.x1 - originalPoints.x1, wall.y1 - originalPoints.y1) < epsilon) {
                wallUpdates = { ...wallUpdates, x1: wall.x1 + dx1, y1: wall.y1 + dy1 };
                needsUpdate = true;
            }
            if (Math.hypot(wall.x1 - originalPoints.x2, wall.y1 - originalPoints.y2) < epsilon) {
                wallUpdates = { ...wallUpdates, x1: wall.x1 + dx2, y1: wall.y1 + dy2 };
                needsUpdate = true;
            }

            // Check connection at end point
            if (Math.hypot(wall.x2 - originalPoints.x1, wall.y2 - originalPoints.y1) < epsilon) {
                 wallUpdates = { ...wallUpdates, x2: wall.x2 + dx1, y2: wall.y2 + dy2 };
                 needsUpdate = true;
            }
            if (Math.hypot(wall.x2 - originalPoints.x2, wall.y2 - originalPoints.y2) < epsilon) {
                 wallUpdates = { ...wallUpdates, x2: wall.x2 + dx2, y2: wall.y2 + dy2 };
                 needsUpdate = true;
            }

            if (needsUpdate) {
                updateWall(wall.id, wallUpdates);
            }
        });
    };

    const onMouseWheel = (opt: fabric.IEvent) => {
        const e = opt.e as WheelEvent;
        const delta = e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.1) zoom = 0.1;
        canvas.zoomToPoint(new fabric.Point(e.offsetX, e.offsetY), zoom);
        e.preventDefault();
        e.stopPropagation();
    };
    
    const onSelection = (options: fabric.IEvent & { selected?: fabric.Object[] }) => {
        const currentProps = propsRef.current;
        if (currentProps.isReadOnly) return;
        const { setSelectedObject } = currentProps as FloorPlanSketcherSectionProps;
        const obj = options.selected?.[0];
        if (obj && (obj as any).data) {
            setSelectedObject({ id: (obj as any).data.id, type: (obj as any).data.type, levelIndex: (obj as any).data.levelIndex });
        }
    };
    
    const onSelectionCleared = () => {
        const currentProps = propsRef.current;
        if (currentProps.isReadOnly) return;
        const { setSelectedObject } = currentProps as FloorPlanSketcherSectionProps;
        setSelectedObject(null);
    };

    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        const currentProps = propsRef.current;
        if (currentProps.isReadOnly) return;
        const { setContextMenu } = currentProps as FloorPlanSketcherSectionProps;
        const target = canvas.findTarget(e, false);
        const selected = (target && (target as any).data) ? { id: (target as any).data.id, type: (target as any).data.type, levelIndex: (target as any).data.levelIndex } : null;
        setContextMenu({ x: e.clientX, y: e.clientY, object: selected });
    };

    if (!propsRef.current.isReadOnly) {
        canvas.on('mouse:down', onMouseDown as (e: fabric.IEvent) => void);
        canvas.on('mouse:move', onMouseMove as (e: fabric.IEvent) => void);
        canvas.on('mouse:up', onMouseUp as (e: fabric.IEvent) => void);
        canvas.on('object:modified', onObjectModified as (e: fabric.IEvent) => void);
        canvas.on('selection:created', onSelection as (e: fabric.IEvent) => void);
        canvas.on('selection:updated', onSelection as (e: fabric.IEvent) => void);
        canvas.on('selection:cleared', onSelectionCleared);
        canvas.getElement().parentElement?.addEventListener('contextmenu', handleContextMenu);
    }
    
    canvas.on('mouse:wheel', onMouseWheel as (e: fabric.IEvent) => void);

    return () => {
      resizeObserver.disconnect();
      if (!propsRef.current.isReadOnly) {
        canvas.off('object:modified', onObjectModified as (e: fabric.IEvent) => void);
        canvas.getElement().parentElement?.removeEventListener('contextmenu', handleContextMenu);
      }
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [drawCanvasContent]);

  React.useImperativeHandle(ref, () => ({
    exportAsPNG: () => fabricCanvasRef.current?.toDataURL({ format: 'png', multiplier: 2 })
  }));

  return (
    <div className="w-full h-full bg-slate-800/50">
      <canvas ref={canvasRef} />
    </div>
  );
});
