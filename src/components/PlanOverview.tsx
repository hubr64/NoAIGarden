import React, { useState, useEffect } from 'react';
import { 
  GardenPlant, 
  GardenStructure, 
  PlantCategory, 
  StructureType 
} from '../types/garden';
import { 
  Home, 
  Grid, 
  Footprints, 
  Droplets, 
  Shield, 
  Flower, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Trees, 
  Layers,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from 'lucide-react';

interface PlanOverviewProps {
  structures: GardenStructure[];
  plants: GardenPlant[];
  selectedStructureId: string | null;
  selectedPlantId: string | null;
  onSelectStructure: (structureId: string) => void;
  onSelectPlant: (plant: GardenPlant) => void;
  onEditStructure: (structure: GardenStructure) => void;
  onEditPlant: (plant: GardenPlant) => void;
  onDeleteStructure: (structureId: string) => void;
  onDeletePlant: (plantId: string) => void;
  onToggleHideStructure?: (structureId: string) => void;
  onToggleHidePlant?: (plantId: string) => void;
  onToggleLockStructure?: (structureId: string) => void;
  onToggleLockPlant?: (plantId: string) => void;
  onHoverEntity?: (id: string | null) => void;
  onOpenAddStructure: () => void;
  onOpenAddPlant: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  width: number;
  onWidthChange: (newWidth: number) => void;
}

export const PlanOverview: React.FC<PlanOverviewProps> = ({
  structures,
  plants,
  selectedStructureId,
  selectedPlantId,
  onSelectStructure,
  onSelectPlant,
  onEditStructure,
  onEditPlant,
  onDeleteStructure,
  onDeletePlant,
  onToggleHideStructure,
  onToggleHidePlant,
  onToggleLockStructure,
  onToggleLockPlant,
  onHoverEntity,
  onOpenAddStructure,
  onOpenAddPlant,
  isOpen,
  onToggleOpen,
  width,
  onWidthChange,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isStructuresExpanded, setIsStructuresExpanded] = useState<boolean>(true);
  const [isPlantsExpanded, setIsPlantsExpanded] = useState<boolean>(true);

  // Auto-expand section and scroll selected item into view inside the Overview
  useEffect(() => {
    if (selectedStructureId) {
      setIsStructuresExpanded(true);
      setTimeout(() => {
        const el = document.getElementById(`overview-struct-${selectedStructureId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 60);
    }
  }, [selectedStructureId]);

  useEffect(() => {
    if (selectedPlantId) {
      setIsPlantsExpanded(true);
      setTimeout(() => {
        const el = document.getElementById(`overview-plant-${selectedPlantId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 60);
    }
  }, [selectedPlantId]);

  // Resize drag handling
  const [isDraggingResize, setIsDraggingResize] = useState<boolean>(false);

  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingResize(true);

    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(220, Math.min(480, startWidth + deltaX));
      onWidthChange(newWidth);
    };

    const handleMouseUp = () => {
      setIsDraggingResize(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Helper icons on the right
  const getStructureTypeIcon = (type: StructureType) => {
    switch (type) {
      case 'building':
        return <span title="Bâtiment"><Home className="w-3.5 h-3.5 text-amber-700" /></span>;
      case 'courtyard':
        return <span title="Cour"><Grid className="w-3.5 h-3.5 text-stone-600" /></span>;
      case 'path':
        return <span title="Chemin"><Footprints className="w-3.5 h-3.5 text-amber-800" /></span>;
      case 'pond':
        return <span title="Mare"><Droplets className="w-3.5 h-3.5 text-sky-600" /></span>;
      case 'wall':
        return <span title="Mur"><Shield className="w-3.5 h-3.5 text-stone-700" /></span>;
      case 'bed':
        return <span title="Parterre"><Flower className="w-3.5 h-3.5 text-emerald-700" /></span>;
      default:
        return <span title="Structure"><Layers className="w-3.5 h-3.5 text-stone-500" /></span>;
    }
  };

  const getPlantCategoryIcon = (category?: PlantCategory) => {
    switch (category) {
      case 'Arbre':
        return <span className="text-xs" title="Arbre">🌳</span>;
      case 'Arbuste':
        return <span className="text-xs" title="Arbuste">🪴</span>;
      case 'Fleur vivace':
        return <span className="text-xs" title="Fleur vivace">🌺</span>;
      case 'Bulbe':
        return <span className="text-xs" title="Bulbe">🧅</span>;
      case 'Plante grimpante':
        return <span className="text-xs" title="Plante grimpante">🧗</span>;
      case 'Graminée':
        return <span className="text-xs" title="Graminée">🌾</span>;
      default:
        return <span className="text-xs">🌿</span>;
    }
  };

  // Filter items by search
  const filteredStructures = (structures || []).filter(s =>
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPlants = (plants || []).filter(p => {
    const b = p.botanicalData || {};
    const commonMatch = (p.simpleName || p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const latinMatch = (b.botanicalName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return commonMatch || latinMatch;
  });

  if (!isOpen) {
    return (
      <div className="h-full bg-[#f3ede1] border-r border-[#ded5c5] flex flex-col items-center py-3 px-1">
        <button
          onClick={onToggleOpen}
          className="p-2 bg-white hover:bg-emerald-50 text-stone-700 rounded-xl shadow-xs border border-stone-300 transition-colors"
          title="Afficher l'Overview du plan"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <span
          className="mt-6 text-[10px] font-bold text-stone-500 uppercase tracking-widest cursor-pointer select-none"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          onClick={onToggleOpen}
        >
          Objets ({structures.length + plants.length})
        </span>
      </div>
    );
  }

  return (
    <div
      style={{ width: `${width}px` }}
      className="relative h-full bg-[#f8f5ee] border-r border-[#ded5c5] flex flex-col shrink-0 select-none shadow-xs z-10"
    >
      {/* Top Header */}
      <div className="p-3 bg-[#ede6d8] border-b border-[#ded5c5] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#2d5a3c]" />
          <h3 className="font-bold text-xs text-stone-900 uppercase tracking-wider">
            Objets ({structures.length + plants.length})
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleOpen}
            className="p-1 hover:bg-white/80 rounded-md text-stone-600 transition-colors"
            title="Masquer l'overview"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Add Actions */}
      <div className="p-2.5 bg-white/70 border-b border-[#ded5c5] grid grid-cols-2 gap-1.5">
        <button
          onClick={onOpenAddStructure}
          className="px-2.5 py-1.5 bg-[#f0eae0] hover:bg-[#2d5a3c] hover:text-white text-stone-800 text-[11px] font-semibold rounded-lg transition-all border border-[#ded5c5] flex items-center justify-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4 text-amber-700" />
          <span>Aménagement</span>
        </button>
        <button
          onClick={onOpenAddPlant}
          className="px-2.5 py-1.5 bg-[#eaf2eb] hover:bg-[#2d5a3c] hover:text-white text-[#244833] text-[11px] font-semibold rounded-lg transition-all border border-[#cbe0ce] flex items-center justify-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4 text-emerald-600" />
          <span>Plante</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="p-2.5 border-b border-[#ded5c5]">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrer les objets..."
            className="w-full pl-7 pr-3 py-1 bg-white border border-[#d6cec0] rounded-lg text-xs focus:ring-1 focus:ring-[#2d5a3c]"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2 top-2" />
        </div>
      </div>

      {/* Scrollable List Sections */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3 text-xs">
        
        {/* SECTION 1: AMÉNAGEMENTS */}
        <div className="bg-white/80 rounded-xl border border-[#e2d8c7] overflow-hidden">
          <button
            onClick={() => setIsStructuresExpanded(!isStructuresExpanded)}
            className="w-full p-2.5 bg-[#f1ebe0] hover:bg-[#ebe3d5] flex items-center justify-between text-left transition-colors"
          >
            <span className="font-bold text-[11px] text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-amber-800" />
              <span>Aménagements ({filteredStructures.length})</span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-stone-500 transition-transform ${
                isStructuresExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isStructuresExpanded && (
            <div className="divide-y divide-stone-100 p-1">
              {filteredStructures.length === 0 ? (
                <div className="p-3 text-center text-stone-400 text-[11px] italic">
                  Aucun aménagement
                </div>
              ) : (
                filteredStructures.map((struct) => {
                  const isSelected = selectedStructureId === struct.id;

                  return (
                    <div
                      key={struct.id}
                      id={`overview-struct-${struct.id}`}
                      onClick={() => onSelectStructure(struct.id)}
                      onMouseEnter={() => onHoverEntity?.(struct.id)}
                      onMouseLeave={() => onHoverEntity?.(null)}
                      className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors group ${
                        struct.hidden ? 'opacity-50 bg-stone-100/60' : ''
                      } ${
                        isSelected
                          ? 'bg-amber-100/70 border border-amber-300'
                          : 'hover:bg-purple-50/60'
                      }`}
                    >
                      {/* Left: Type Icon, Name & specs */}
                      <div className="flex-1 min-w-0 pr-2 flex items-center gap-2">
                        <div className="p-1.5 bg-stone-100 rounded-lg shrink-0">
                          {getStructureTypeIcon(struct.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-stone-900 truncate text-[11px]">
                              {struct.name}
                            </h4>
                            {struct.hidden && (
                              <span className="text-[9px] bg-stone-200 text-stone-600 px-1 py-0.2 rounded font-medium">Masqué</span>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-500">
                            {struct.shape === 'rect' ? 'Rectangle' : struct.shape === 'oval' ? 'Ovale' : 'Triangle'} • {struct.width}m × {struct.height}m
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleHideStructure?.(struct.id);
                          }}
                          className={`p-1 rounded transition-opacity ${
                            struct.hidden
                              ? 'text-amber-800 bg-amber-100 opacity-100'
                              : 'opacity-0 group-hover:opacity-100 hover:bg-stone-200 text-stone-600'
                          }`}
                          title={struct.hidden ? "Afficher sur le plan" : "Masquer du plan"}
                        >
                          {struct.hidden ? <EyeOff className="w-3.5 h-3.5 text-amber-800" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLockStructure?.(struct.id);
                          }}
                          className={`p-1 rounded transition-opacity ${
                            struct.locked
                              ? 'text-amber-700 bg-amber-100 opacity-100'
                              : 'opacity-0 group-hover:opacity-100 hover:bg-stone-200 text-stone-600'
                          }`}
                          title={struct.locked ? "Déverrouiller l'aménagement" : "Verrouiller l'aménagement"}
                        >
                          {struct.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditStructure(struct);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-stone-200 rounded text-stone-600 transition-opacity"
                          title="Éditer les propriétés"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteStructure(struct.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-600 transition-opacity"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: PLANTES */}
        <div className="bg-white/80 rounded-xl border border-[#e2d8c7] overflow-hidden">
          <button
            onClick={() => setIsPlantsExpanded(!isPlantsExpanded)}
            className="w-full p-2.5 bg-[#eaf2eb] hover:bg-[#e0ece2] flex items-center justify-between text-left transition-colors"
          >
            <span className="font-bold text-[11px] text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <Trees className="w-3.5 h-3.5 text-emerald-700" />
              <span>Plantes ({filteredPlants.length})</span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-stone-500 transition-transform ${
                isPlantsExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isPlantsExpanded && (
            <div className="divide-y divide-stone-100 p-1">
              {filteredPlants.length === 0 ? (
                <div className="p-3 text-center text-stone-400 text-[11px] italic">
                  Aucune plante
                </div>
              ) : (
                filteredPlants.map((plant) => {
                  const isSelected = selectedPlantId === plant.id;
                  const b = plant.botanicalData || {};

                  return (
                    <div
                      key={plant.id}
                      id={`overview-plant-${plant.id}`}
                      onClick={() => onSelectPlant(plant)}
                      onMouseEnter={() => onHoverEntity?.(plant.id)}
                      onMouseLeave={() => onHoverEntity?.(null)}
                      className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors group ${
                        plant.hidden ? 'opacity-50 bg-stone-100/60' : ''
                      } ${
                        isSelected
                          ? 'bg-emerald-100/80 border border-emerald-300'
                          : 'hover:bg-purple-50/60'
                      }`}
                    >
                      {/* Left: Simple name & botanical info */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-stone-300 shrink-0"
                            style={{ backgroundColor: plant.customColor || b.flowerColorHex || '#4a7c59' }}
                          />
                          <h4 className="font-bold text-stone-900 truncate text-[11px]">
                            {plant.simpleName || plant.name}
                          </h4>
                          {plant.hidden && (
                            <span className="text-[9px] bg-stone-200 text-stone-600 px-1 py-0.2 rounded font-medium">Masqué</span>
                          )}
                        </div>
                        <p className="text-[10px] font-serif italic text-stone-500 truncate pl-4">
                          {b.botanicalName || plant.name}
                        </p>
                      </div>

                      {/* Right: Actions & Category Icon */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleHidePlant?.(plant.id);
                          }}
                          className={`p-1 rounded transition-opacity ${
                            plant.hidden
                              ? 'text-amber-800 bg-amber-100 opacity-100'
                              : 'opacity-0 group-hover:opacity-100 hover:bg-stone-200 text-stone-600'
                          }`}
                          title={plant.hidden ? "Afficher sur le plan" : "Masquer du plan"}
                        >
                          {plant.hidden ? <EyeOff className="w-3.5 h-3.5 text-amber-800" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLockPlant?.(plant.id);
                          }}
                          className={`p-1 rounded transition-opacity ${
                            plant.locked
                              ? 'text-amber-700 bg-amber-100 opacity-100'
                              : 'opacity-0 group-hover:opacity-100 hover:bg-stone-200 text-stone-600'
                          }`}
                          title={plant.locked ? "Déverrouiller la plante" : "Verrouiller la plante"}
                        >
                          {plant.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditPlant(plant);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-stone-200 rounded text-stone-600 transition-opacity"
                          title="Éditer la plante"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePlant(plant.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-600 transition-opacity"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="p-1 bg-stone-100 rounded-md ml-0.5">
                          {getPlantCategoryIcon(b.category)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

      </div>

      {/* Resize Handle on Right Border */}
      <div
        onMouseDown={handleMouseDownResize}
        className="absolute top-0 right-0 w-1.5 h-full cursor-ew-resize hover:bg-[#2d5a3c] transition-colors z-20"
        title="Glisser pour redimensionner l'overview"
      />
    </div>
  );
};
