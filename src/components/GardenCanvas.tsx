import React, { useState } from 'react';
import { 
  GardenPlant, 
  GardenStructure, 
  GardenZone, 
  StructureTexture
} from '../types/garden';
import { CanvasPatterns } from './CanvasPatterns';
import { PlanOverview } from './PlanOverview';
import { AddStructureModal } from './AddStructureModal';
import { EditStructureModal } from './EditStructureModal';
import { EditPlantModal } from './EditPlantModal';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sparkles 
} from 'lucide-react';
import { MONTH_SEASONS } from '../data/defaultGarden';

interface GardenCanvasProps {
  plants: GardenPlant[];
  structures: GardenStructure[];
  zones: GardenZone[];
  selectedMonth: number;
  onSelectMonth: (month: number) => void;
  selectedPlantId: string | null;
  onSelectPlant: (plant: GardenPlant | null) => void;
  onUpdatePlantPosition: (plantId: string, position: { x: number; y: number }) => void;
  onUpdatePlant: (plant: GardenPlant) => void;
  onDeletePlant: (plantId: string) => void;
  onOpenAddPlant: () => void;
  onAddPlantAtPosition: (position: { x: number; y: number }) => void;
  onAddStructure: (structure: Omit<GardenStructure, 'id'>) => void;
  onUpdateStructure: (structure: GardenStructure) => void;
  onDeleteStructure: (structureId: string) => void;
  onToggleHideStructure?: (structureId: string) => void;
  onToggleHidePlant?: (plantId: string) => void;
  onToggleLockStructure?: (structureId: string) => void;
  onToggleLockPlant?: (plantId: string) => void;
  onEditPlantRequest?: (plant: GardenPlant) => void;
}

export const GardenCanvas: React.FC<GardenCanvasProps> = ({
  plants,
  structures,
  selectedMonth,
  onSelectMonth,
  selectedPlantId,
  onSelectPlant,
  onUpdatePlantPosition,
  onUpdatePlant,
  onDeletePlant,
  onOpenAddPlant,
  onAddPlantAtPosition,
  onAddStructure,
  onUpdateStructure,
  onDeleteStructure,
  onToggleHideStructure,
  onToggleHidePlant,
  onToggleLockStructure,
  onToggleLockPlant,
  onEditPlantRequest,
}) => {
  // Canvas Viewport Controls
  const [scale, setScale] = useState<number>(32); // pixels per meter
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Toggles
  const [showSpreads, setShowSpreads] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showBloomsOnly, setShowBloomsOnly] = useState<boolean>(false);

  // Overview Panel State
  const [isOverviewOpen, setIsOverviewOpen] = useState<boolean>(true);
  const [overviewWidth, setOverviewWidth] = useState<number>(280);

  // Hover state from overview or canvas
  const [hoveredEntityId, setHoveredEntityId] = useState<string | null>(null);

  // Selection & Modals
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [isAddStructureOpen, setIsAddStructureOpen] = useState<boolean>(false);
  const [editingStructure, setEditingStructure] = useState<GardenStructure | null>(null);
  const [editingPlant, setEditingPlant] = useState<GardenPlant | null>(null);

  // Dragging state
  const [draggingEntity, setDraggingEntity] = useState<{
    type: 'plant' | 'structure';
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Cursor position in canvas meters
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  const gardenWidthM = 30;
  const gardenHeightM = 20;

  // Convert screen coordinates to meters
  const screenToMeters = (screenX: number, screenY: number) => {
    const canvasElement = document.getElementById('garden-svg-canvas');
    if (!canvasElement) return { x: 0, y: 0 };
    const rect = canvasElement.getBoundingClientRect();
    const xPx = screenX - rect.left - pan.x;
    const yPx = screenY - rect.top - pan.y;
    const xMeters = Math.max(0, Math.min(gardenWidthM, xPx / scale));
    const yMeters = Math.max(0, Math.min(gardenHeightM, yPx / scale));
    return {
      x: Math.round(xMeters * 10) / 10,
      y: Math.round(yMeters * 10) / 10,
    };
  };

  // Handle Mouse Down
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;

    if (e.altKey || e.shiftKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const target = e.target as SVGElement;
    if (target.getAttribute('data-bg') === 'true') {
      onSelectPlant(null);
      setSelectedStructureId(null);
    }
  };

  // Handle Mouse Move
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const { x, y } = screenToMeters(e.clientX, e.clientY);
    setCursorPos({ x, y });

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (draggingEntity) {
      const newX = Math.max(0.5, Math.min(gardenWidthM - 0.5, Math.round((x - draggingEntity.offsetX) * 2) / 2));
      const newY = Math.max(0.5, Math.min(gardenHeightM - 0.5, Math.round((y - draggingEntity.offsetY) * 2) / 2));

      if (draggingEntity.type === 'plant') {
        const pl = plants.find(p => p.id === draggingEntity.id);
        if (pl && !pl.locked) {
          onUpdatePlantPosition(draggingEntity.id, { x: newX, y: newY });
        }
      } else if (draggingEntity.type === 'structure') {
        const struct = structures.find(s => s.id === draggingEntity.id);
        if (struct && !struct.locked) {
          onUpdateStructure({ ...struct, x: newX, y: newY });
        }
      }
    }
  };

  // Handle Mouse Up
  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingEntity(null);
  };

  // Handle Zoom Wheel
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(60, Math.max(16, scale * zoomFactor));
    setScale(newScale);
  };

  // Helper Texture URL Resolver (Fixed with #pat- prefix matching CanvasPatterns.tsx)
  const getTextureFill = (texture: StructureTexture) => {
    switch (texture) {
      case 'roof_slate':
        return 'url(#pat-roof-slate)';
      case 'roof_tile':
        return 'url(#pat-roof-tile)';
      case 'roof_glass':
        return 'url(#pat-roof-glass)';
      case 'paving':
        return 'url(#pat-paving)';
      case 'gravel':
        return 'url(#pat-gravel)';
      case 'soil':
        return 'url(#pat-soil)';
      case 'water':
        return 'url(#pat-water)';
      case 'grass':
        return 'url(#pat-grass)';
      default:
        return 'url(#pat-paving)';
    }
  };

  // Get dynamic seasonal appearance for a plant
  const getPlantVisual = (plant: GardenPlant) => {
    const b = plant.botanicalData;
    const isBlooming = b.bloomMonths.includes(selectedMonth);
    const isAutumn = [9, 10, 11].includes(selectedMonth);
    const isWinter = [12, 1, 2].includes(selectedMonth);
    const isSpring = [3, 4, 5].includes(selectedMonth);

    let foliageColor = '#4a7c59';

    if (b.foliageType === 'Persistant') {
      foliageColor = '#2d5a3c';
    } else if (isAutumn && b.autumnColorHex) {
      foliageColor = b.autumnColorHex;
    } else if (isWinter) {
      foliageColor = '#8c7b6c';
    } else if (isSpring) {
      foliageColor = '#68a063';
    }

    const spreadW = plant.currentSpreadWidth || b.spreadM;
    const spreadH = plant.currentSpreadHeight || b.spreadM;

    return {
      isBlooming,
      foliageColor,
      flowerColor: b.flowerColorHex || '#f48fb1',
      spreadWidthPx: spreadW * scale,
      spreadHeightPx: spreadH * scale,
    };
  };

  const currentSeason = MONTH_SEASONS.find(s => s.month === selectedMonth) || MONTH_SEASONS[selectedMonth - 1];
  const selectedPlant = plants.find(p => p.id === selectedPlantId);
  const selectedStructure = structures.find(s => s.id === selectedStructureId);

  const visibleStructures = structures.filter(s => !s.hidden);

  const visiblePlants = showBloomsOnly 
    ? plants.filter(p => !p.hidden && p.botanicalData.bloomMonths.includes(selectedMonth))
    : plants.filter(p => !p.hidden);

  return (
    <div className="flex h-full bg-[#fbf9f4] border border-[#e5dfd3] rounded-3xl shadow-sm overflow-hidden select-none">
      
      {/* 1. LEFT OVERVIEW PANEL */}
      <PlanOverview
        structures={structures}
        plants={plants}
        selectedStructureId={selectedStructureId}
        selectedPlantId={selectedPlantId}
        onSelectStructure={(id) => {
          setSelectedStructureId(id);
          onSelectPlant(null);
        }}
        onSelectPlant={(plant) => {
          onSelectPlant(plant);
          setSelectedStructureId(null);
        }}
        onEditStructure={(struct) => setEditingStructure(struct)}
        onEditPlant={(plant) => {
          if (onEditPlantRequest) {
            onEditPlantRequest(plant);
          } else {
            setEditingPlant(plant);
          }
        }}
        onDeleteStructure={onDeleteStructure}
        onDeletePlant={onDeletePlant}
        onToggleHideStructure={onToggleHideStructure}
        onToggleHidePlant={onToggleHidePlant}
        onToggleLockStructure={onToggleLockStructure}
        onToggleLockPlant={onToggleLockPlant}
        onHoverEntity={setHoveredEntityId}
        onOpenAddStructure={() => setIsAddStructureOpen(true)}
        onOpenAddPlant={onOpenAddPlant}
        isOpen={isOverviewOpen}
        onToggleOpen={() => setIsOverviewOpen(!isOverviewOpen)}
        width={overviewWidth}
        onWidthChange={setOverviewWidth}
      />

      {/* 2. RIGHT CANVAS & TOOLBAR CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Top Toolbar */}
        <div className="bg-[#f5efe4] border-b border-[#e5dfd3] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Layer Toggles */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSpreads(!showSpreads)}
              className={`px-3 py-1 text-xs rounded-lg border flex items-center gap-1 font-medium transition-all ${
                showSpreads 
                  ? 'bg-[#e8f1e9] text-[#244833] border-[#a3cfbb]' 
                  : 'bg-white/60 text-stone-500 border-stone-200'
              }`}
              title="Afficher ou masquer les envergures actuelles"
            >
              <span>Envergures</span>
            </button>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-2 py-1 text-xs rounded-lg border flex items-center gap-1 transition-all ${
                showLabels 
                  ? 'bg-[#e8f1e9] text-[#244833] border-[#a3cfbb]' 
                  : 'bg-white/60 text-stone-500 border-stone-200'
              }`}
              title="Afficher ou masquer les noms simples sur le plan"
            >
              <span>Étiquettes</span>
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-2 py-1 text-xs rounded-lg border flex items-center gap-1 transition-all ${
                showGrid 
                  ? 'bg-[#e8f1e9] text-[#244833] border-[#a3cfbb]' 
                  : 'bg-white/60 text-stone-500 border-stone-200'
              }`}
              title="Grille métrique (1 mètre par carreau)"
            >
              <span>Grille (1m)</span>
            </button>
          </div>

          {/* Seasonal Simulation Ribbon */}
          <div className="flex items-center gap-2 bg-white/90 border border-[#e0d6c5] px-3 py-1 rounded-xl shadow-xs">
            <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Saison :</span>
            </span>
            <select
              value={selectedMonth}
              onChange={(e) => onSelectMonth(parseInt(e.target.value, 10))}
              className="bg-stone-50 text-stone-900 font-bold text-xs py-0.5 px-2 rounded-lg border border-stone-300 focus:outline-none"
            >
              {MONTH_SEASONS.map((m) => (
                <option key={m.month} value={m.month}>
                  {m.name} ({m.season})
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowBloomsOnly(!showBloomsOnly)}
              className={`px-2 py-0.5 text-[11px] rounded-md font-semibold transition-colors ${
                showBloomsOnly
                  ? 'bg-pink-100 text-pink-800 border border-pink-300'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              🌸 Floraisons uniquement
            </button>
          </div>

          {/* Zoom & Reset Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setScale(Math.min(60, scale * 1.15))}
              className="p-1.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700"
              title="Zoom Avant"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setScale(Math.max(16, scale * 0.85))}
              className="p-1.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700"
              title="Zoom Arrière"
            >
              <ZoomIn className="w-3.5 h-3.5 rotate-180" />
            </button>
            <button
              onClick={() => {
                setScale(32);
                setPan({ x: 40, y: 30 });
              }}
              className="p-1.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700"
              title="Réinitialiser la vue"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Selected Entity Actions Ribbon */}
        {(selectedPlant || selectedStructure) && (
          <div className="bg-[#ede6d8] border-b border-[#ded5c5] px-4 py-2 flex items-center justify-between text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#2d5a3c] bg-white/80 px-2 py-0.5 rounded-md border border-[#cbe0ce]">
                {selectedPlant ? 'Plante sélectionnée' : 'Aménagement sélectionné'}
              </span>
              <span className="font-semibold text-stone-800">
                {selectedPlant ? (selectedPlant.simpleName || selectedPlant.name) : selectedStructure?.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {selectedPlant && (
                <button
                  onClick={() => {
                    if (onEditPlantRequest) {
                      onEditPlantRequest(selectedPlant);
                    } else {
                      setEditingPlant(selectedPlant);
                    }
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-[#2d5a3c] hover:text-white border border-[#ded5c5] rounded-lg text-stone-800 font-semibold transition-colors"
                >
                  Éditer
                </button>
              )}
              {selectedStructure && (
                <button
                  onClick={() => setEditingStructure(selectedStructure)}
                  className="px-2.5 py-1 bg-white hover:bg-[#2d5a3c] hover:text-white border border-[#ded5c5] rounded-lg text-stone-800 font-semibold transition-colors"
                >
                  Éditer
                </button>
              )}
              <button
                onClick={() => {
                  if (selectedPlant) onDeletePlant(selectedPlant.id);
                  if (selectedStructure) onDeleteStructure(selectedStructure.id);
                  onSelectPlant(null);
                  setSelectedStructureId(null);
                }}
                className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-semibold transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        )}

        {/* Canvas SVG Body */}
        <div className="flex-1 relative overflow-hidden bg-[#e0d6c3]/40 cursor-crosshair">
          <svg
            id="garden-svg-canvas"
            className="w-full h-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            onClick={(e) => {
              const target = e.target as SVGElement;
              if (target.getAttribute('data-bg') === 'true') {
                onSelectPlant(null);
                setSelectedStructureId(null);
              }
            }}
            onDoubleClick={(e) => {
              const { x, y } = screenToMeters(e.clientX, e.clientY);
              onAddPlantAtPosition({ x, y });
            }}
          >
            {/* SVG Patterns Definition */}
            <CanvasPatterns />

            {/* Main Transform Container for Pan & Zoom */}
            <g transform={`translate(${pan.x}, ${pan.y})`}>
              
              {/* Background Lawn Canvas Area */}
              <rect
                data-bg="true"
                x="0"
                y="0"
                width={gardenWidthM * scale}
                height={gardenHeightM * scale}
                fill="#84a98c"
                fillOpacity="0.88"
                stroke="#52796f"
                strokeWidth="3"
                rx="16"
              />

              {/* 1m Grid Layer */}
              {showGrid && (
                <g pointerEvents="none" opacity="0.25">
                  {Array.from({ length: gardenWidthM + 1 }).map((_, i) => (
                    <line
                      key={`grid-x-${i}`}
                      x1={i * scale}
                      y1="0"
                      x2={i * scale}
                      y2={gardenHeightM * scale}
                      stroke="#ffffff"
                      strokeWidth={i % 5 === 0 ? "1.5" : "0.5"}
                    />
                  ))}
                  {Array.from({ length: gardenHeightM + 1 }).map((_, i) => (
                    <line
                      key={`grid-y-${i}`}
                      x1="0"
                      y1={i * scale}
                      x2={gardenWidthM * scale}
                      y2={i * scale}
                      stroke="#ffffff"
                      strokeWidth={i % 5 === 0 ? "1.5" : "0.5"}
                    />
                  ))}
                </g>
              )}

              {/* 1. Structures Layer */}
              {visibleStructures.map((struct) => {
                const xPx = struct.x * scale;
                const yPx = struct.y * scale;
                const wPx = struct.width * scale;
                const hPx = struct.height * scale;
                const cxPx = xPx + wPx / 2;
                const cyPx = yPx + hPx / 2;
                const isSelected = selectedStructureId === struct.id;
                const isHoveredFromOverview = hoveredEntityId === struct.id;
                const fillPattern = getTextureFill(struct.texture);
                const rot = struct.rotation || 0;

                const ridgePct = (struct.ridgePositionPercent ?? 50) / 100;
                const isRoofTexture = (struct.texture || '').startsWith('roof_');
                const leftWidthPx = wPx * ridgePct;
                const rightWidthPx = wPx * (1 - ridgePct);
                const ridgePx = xPx + leftWidthPx;

                // Structure stroke: purple when hovered from overview, blue when selected, otherwise default
                const structureStroke = isHoveredFromOverview
                  ? '#8b5cf6'
                  : isSelected
                    ? '#2563eb'
                    : struct.strokeColor || '#8d6e63';

                return (
                  <g
                    key={struct.id}
                    className={`group ${struct.locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (struct.locked) return; // Locked structures cannot be selected
                      setSelectedStructureId(struct.id);
                      onSelectPlant(null);
                    }}
                    onMouseDown={(e) => {
                      if (e.button === 0) {
                        e.stopPropagation();
                        if (struct.locked) return; // Locked structures cannot be moved
                        const { x, y } = screenToMeters(e.clientX, e.clientY);
                        setDraggingEntity({
                          type: 'structure',
                          id: struct.id,
                          offsetX: x - struct.x,
                          offsetY: y - struct.y
                        });
                      }
                    }}
                  >
                    {/* Render according to Texture & Shape */}
                    <g transform={rot !== 0 ? `rotate(${rot}, ${cxPx}, ${cyPx})` : undefined}>
                      {struct.shape === 'oval' ? (
                        <ellipse
                          cx={cxPx}
                          cy={cyPx}
                          rx={wPx / 2}
                          ry={hPx / 2}
                          fill={fillPattern}
                          stroke={structureStroke}
                          strokeWidth={isHoveredFromOverview || isSelected ? '3' : '1.5'}
                          strokeDasharray={isSelected ? '4 3' : undefined}
                        />
                      ) : struct.shape === 'triangle' ? (
                        <polygon
                          points={`${cxPx},${yPx} ${xPx + wPx},${yPx + hPx} ${xPx},${yPx + hPx}`}
                          fill={fillPattern}
                          stroke={structureStroke}
                          strokeWidth={isHoveredFromOverview || isSelected ? '3' : '1.5'}
                          strokeDasharray={isSelected ? '4 3' : undefined}
                        />
                      ) : (
                        <rect
                          x={xPx}
                          y={yPx}
                          width={wPx}
                          height={hPx}
                          rx={struct.type === 'bed' ? 8 : 4}
                          fill={fillPattern}
                          stroke={structureStroke}
                          strokeWidth={isHoveredFromOverview || isSelected ? '3' : '1.5'}
                          strokeDasharray={isSelected ? '4 3' : undefined}
                        />
                      )}

                      {/* Dynamic Ridge Lighting Effect for Roof Textures */}
                      {isRoofTexture && (
                        <g pointerEvents="none">
                          {leftWidthPx > 0 && (
                            <rect
                              x={xPx}
                              y={yPx}
                              width={leftWidthPx}
                              height={hPx}
                              fill="#000000"
                              fillOpacity="0.10"
                            />
                          )}
                          {rightWidthPx > 0 && (
                            <rect
                              x={ridgePx}
                              y={yPx}
                              width={rightWidthPx}
                              height={hPx}
                              fill="#ffffff"
                              fillOpacity="0.10"
                            />
                          )}
                          {ridgePct > 0 && ridgePct < 1 && (
                            <line
                              x1={ridgePx}
                              y1={yPx}
                              x2={ridgePx}
                              y2={yPx + hPx}
                              stroke="#ffffff"
                              strokeOpacity="0.35"
                              strokeWidth="1.5"
                            />
                          )}
                        </g>
                      )}

                      {/* Structure Label */}
                      {showLabels && (
                        <text
                          x={cxPx}
                          y={cyPx}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={isRoofTexture ? '#f1f5f9' : '#3e3832'}
                          fontSize={Math.max(9, Math.min(13, scale * 0.35))}
                          fontWeight="600"
                          pointerEvents="none"
                          className="drop-shadow-xs"
                        >
                          {struct.name}
                        </text>
                      )}
                    </g>
                  </g>
                );
              })}

              {/* 2. Plants Layer */}
              {visiblePlants.map((plant) => {
                const xPx = plant.position.x * scale;
                const yPx = plant.position.y * scale;
                const visual = getPlantVisual(plant);
                const isSelected = selectedPlantId === plant.id;
                const isHoveredFromOverview = hoveredEntityId === plant.id;
                const b = plant.botanicalData;

                const displayName = plant.simpleName || plant.name;

                // Point color: purple when hovered from overview, blue when selected, otherwise custom plant color or foliage/flower fallback
                const pointColor = isHoveredFromOverview
                  ? '#8b5cf6'
                  : isSelected
                    ? '#2563eb'
                    : plant.customColor || (visual.isBlooming ? visual.flowerColor : visual.foliageColor);

                return (
                  <g
                    key={plant.id}
                    className={`group ${plant.locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (plant.locked) return; // Locked plants cannot be selected
                      onSelectPlant(plant);
                      setSelectedStructureId(null);
                    }}
                    onMouseDown={(e) => {
                      if (e.button === 0) {
                        e.stopPropagation();
                        if (plant.locked) return; // Locked plants cannot be moved
                        const { x, y } = screenToMeters(e.clientX, e.clientY);
                        setDraggingEntity({
                          type: 'plant',
                          id: plant.id,
                          offsetX: x - plant.position.x,
                          offsetY: y - plant.position.y
                        });
                      }
                    }}
                  >
                    {/* Mature / Current Spread shape (ellipse or rectangle) */}
                    {showSpreads && (
                      (plant.spreadShape || 'oval') === 'rect' ? (
                        <rect
                          x={xPx - visual.spreadWidthPx / 2}
                          y={yPx - visual.spreadHeightPx / 2}
                          width={visual.spreadWidthPx}
                          height={visual.spreadHeightPx}
                          rx={4}
                          transform={plant.rotation ? `rotate(${plant.rotation}, ${xPx}, ${yPx})` : undefined}
                          fill={visual.isBlooming ? visual.flowerColor : visual.foliageColor}
                          fillOpacity={visual.isBlooming ? 0.22 : 0.12}
                          stroke={visual.isBlooming ? visual.flowerColor : visual.foliageColor}
                          strokeWidth="1.2"
                          strokeDasharray="3 3"
                        />
                      ) : (
                        <ellipse
                          cx={xPx}
                          cy={yPx}
                          rx={visual.spreadWidthPx / 2}
                          ry={visual.spreadHeightPx / 2}
                          transform={plant.rotation ? `rotate(${plant.rotation}, ${xPx}, ${yPx})` : undefined}
                          fill={visual.isBlooming ? visual.flowerColor : visual.foliageColor}
                          fillOpacity={visual.isBlooming ? 0.22 : 0.12}
                          stroke={visual.isBlooming ? visual.flowerColor : visual.foliageColor}
                          strokeWidth="1.2"
                          strokeDasharray="3 3"
                        />
                      )
                    )}

                    {/* Flowering Halo effect if blooming */}
                    {visual.isBlooming && (
                      <circle
                        cx={xPx}
                        cy={yPx}
                        r={Math.max(14, (visual.spreadWidthPx / 2) * 0.75)}
                        fill="none"
                        stroke={visual.flowerColor}
                        strokeWidth="2.5"
                        opacity="0.8"
                        className="animate-pulse"
                      />
                    )}

                    {/* Plant Center Node (Purple when hovered, Blue when selected, otherwise custom plant color) */}
                    <circle
                      cx={xPx}
                      cy={yPx}
                      r={Math.max(8, Math.min(20, scale * 0.38))}
                      fill={pointColor}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="drop-shadow-md transition-colors duration-150"
                    />

                    {/* Category or Blooming dot */}
                    {visual.isBlooming ? (
                      <circle cx={xPx} cy={yPx} r={Math.max(2.5, scale * 0.12)} fill="#fff9c4" stroke="#f57f17" strokeWidth="0.8" />
                    ) : b.category === 'Arbre' ? (
                      <circle cx={xPx} cy={yPx} r={Math.max(2, scale * 0.08)} fill="#ffffff" opacity="0.8" />
                    ) : null}

                    {/* Simple Name Label Tag */}
                    {showLabels && (
                      <g pointerEvents="none">
                        <rect
                          x={xPx - (displayName.length * 3.4)}
                          y={yPx + (visual.spreadHeightPx / 2 > 16 ? visual.spreadHeightPx / 2 + 2 : 16)}
                          width={displayName.length * 6.8}
                          height={16}
                          rx="3"
                          fill="#ffffff"
                          fillOpacity="0.88"
                          stroke="#d4cfc5"
                          strokeWidth="0.5"
                        />
                        <text
                          x={xPx}
                          y={yPx + (visual.spreadHeightPx / 2 > 16 ? visual.spreadHeightPx / 2 + 14 : 28)}
                          textAnchor="middle"
                          fill="#1c2b1e"
                          fontSize="10"
                          fontWeight="700"
                        >
                          {displayName}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Bottom HUD */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs border border-stone-200 px-3 py-1.5 rounded-lg shadow-xs text-xs text-stone-600 flex items-center gap-3">
            <span>Terrain : <strong>{gardenWidthM}m × {gardenHeightM}m</strong></span>
            {cursorPos && (
              <span className="font-mono text-stone-800">
                X: {cursorPos.x}m / Y: {cursorPos.y}m
              </span>
            )}
            <span>Objets : <strong>{structures.length + plants.length}</strong></span>
          </div>

        </div>
      </div>

      {/* MODALS */}
      <AddStructureModal
        isOpen={isAddStructureOpen}
        onClose={() => setIsAddStructureOpen(false)}
        onAddStructure={onAddStructure}
      />

      <EditStructureModal
        structure={editingStructure}
        isOpen={!!editingStructure}
        onClose={() => setEditingStructure(null)}
        onSave={onUpdateStructure}
        onDelete={onDeleteStructure}
      />

      <EditPlantModal
        plant={editingPlant}
        isOpen={!!editingPlant}
        onClose={() => setEditingPlant(null)}
        onSave={onUpdatePlant}
        onDelete={onDeletePlant}
      />

    </div>
  );
};
