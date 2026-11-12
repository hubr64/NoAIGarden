import React, { useState, useEffect } from 'react';
import { 
  GardenPlant, 
  GardenStructure, 
  GardenZone, 
  GardenTaskInstance 
} from './types/garden';
import { 
  INITIAL_PLANTS, 
  INITIAL_STRUCTURES, 
  INITIAL_ZONES, 
  MONTH_SEASONS 
} from './data/defaultGarden';
import { GardenCanvas } from './components/GardenCanvas';
import { SeasonalCalendar } from './components/SeasonalCalendar';
import { PlantCatalog } from './components/PlantCatalog';
import { MaintenanceTracker } from './components/MaintenanceTracker';
import { AddPlantModal } from './components/AddPlantModal';
import { EditPlantModal } from './components/EditPlantModal';
import { PlantDetailModal } from './components/PlantDetailModal';
import { 
  Map, 
  Calendar, 
  Sparkles, 
  CheckSquare, 
  BookOpen, 
  RotateCcw
} from 'lucide-react';

type ActiveTab = 'canvas' | 'calendar' | 'catalog' | 'maintenance';

export default function App() {
  // Current month (defaults to current real month e.g. November = 11)
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    return new Date().getMonth() + 1;
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('canvas');

  // Core Garden State with LocalStorage persistence & safety checks
  const [plants, setPlants] = useState<GardenPlant[]>(() => {
    try {
      const saved = localStorage.getItem('jardin_plants');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((p) => p && p.botanicalData && p.position)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage jardin_plants corrupt or invalid, resetting to defaults.', e);
    }
    return INITIAL_PLANTS;
  });

  const [structures, setStructures] = useState<GardenStructure[]>(() => {
    try {
      const saved = localStorage.getItem('jardin_structures');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((s) => s && s.type && typeof s.x === 'number')) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage jardin_structures corrupt, resetting to defaults.', e);
    }
    return INITIAL_STRUCTURES;
  });

  const [zones, setZones] = useState<GardenZone[]>(() => {
    try {
      const saved = localStorage.getItem('jardin_zones');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage jardin_zones corrupt, resetting to defaults.', e);
    }
    return INITIAL_ZONES;
  });

  // Automated maintenance tasks generated from plant botanical data
  const [tasks, setTasks] = useState<GardenTaskInstance[]>(() => {
    try {
      const saved = localStorage.getItem('jardin_tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('LocalStorage jardin_tasks corrupt, regenerating from plants.', e);
    }

    const generated: GardenTaskInstance[] = [];
    INITIAL_PLANTS.forEach((p) => {
      if (p.botanicalData && p.botanicalData.tasks) {
        p.botanicalData.tasks.forEach((t, i) => {
          generated.push({
            id: `task-${p.id}-${i}`,
            plantId: p.id,
            plantName: p.name,
            category: p.botanicalData.category,
            month: t.month,
            type: t.type,
            title: t.title,
            instruction: t.instruction,
            urgency: t.urgency,
            completed: false,
          });
        });
      }
    });
    return generated;
  });

  // Modals & Selection
  const [isAddPlantOpen, setIsAddPlantOpen] = useState<boolean>(false);
  const [addPlantPosition, setAddPlantPosition] = useState<{ x: number; y: number }>({ x: 15, y: 10 });
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [detailModalPlant, setDetailModalPlant] = useState<GardenPlant | null>(null);
  const [editingPlant, setEditingPlant] = useState<GardenPlant | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('jardin_plants', JSON.stringify(plants));
    } catch (e) {
      console.error('Failed to save plants to localStorage', e);
    }
  }, [plants]);

  useEffect(() => {
    try {
      localStorage.setItem('jardin_structures', JSON.stringify(structures));
    } catch (e) {
      console.error('Failed to save structures to localStorage', e);
    }
  }, [structures]);

  useEffect(() => {
    try {
      localStorage.setItem('jardin_zones', JSON.stringify(zones));
    } catch (e) {
      console.error('Failed to save zones to localStorage', e);
    }
  }, [zones]);

  useEffect(() => {
    try {
      localStorage.setItem('jardin_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage', e);
    }
  }, [tasks]);

  // Handle Plant Creation
  const handleAddPlant = (newPlantData: Omit<GardenPlant, 'id'>) => {
    const newId = `plant-${Date.now()}`;
    const newPlant: GardenPlant = {
      ...newPlantData,
      id: newId,
    };

    setPlants((prev) => [...prev, newPlant]);

    if (newPlant.botanicalData && newPlant.botanicalData.tasks && newPlant.botanicalData.tasks.length > 0) {
      const newTasks: GardenTaskInstance[] = newPlant.botanicalData.tasks.map((t, idx) => ({
        id: `task-${newId}-${idx}`,
        plantId: newId,
        plantName: newPlant.name,
        category: newPlant.botanicalData.category,
        month: t.month,
        type: t.type,
        title: t.title,
        instruction: t.instruction,
        urgency: t.urgency,
        completed: false,
      }));

      setTasks((prev) => [...prev, ...newTasks]);
    }

    setSelectedPlantId(newId);
  };

  // Handle Plant Position Change
  const handleUpdatePlantPosition = (plantId: string, position: { x: number; y: number }) => {
    setPlants((prev) =>
      prev.map((p) => (p.id === plantId ? { ...p, position } : p))
    );
  };

  // Handle Plant Properties Update
  const handleUpdatePlant = (updatedPlant: GardenPlant) => {
    setPlants((prev) =>
      prev.map((p) => (p.id === updatedPlant.id ? updatedPlant : p))
    );
    if (detailModalPlant?.id === updatedPlant.id) {
      setDetailModalPlant(updatedPlant);
    }
  };

  // Handle Plant Deletion
  const handleDeletePlant = (plantId: string) => {
    setPlants((prev) => prev.filter((p) => p.id !== plantId));
    setTasks((prev) => prev.filter((t) => t.plantId !== plantId));
    if (selectedPlantId === plantId) setSelectedPlantId(null);
    if (detailModalPlant?.id === plantId) setDetailModalPlant(null);
  };

  // Handle Structure Actions
  const handleAddStructure = (newStructureData: Omit<GardenStructure, 'id'>) => {
    const newId = `struct-${Date.now()}`;
    const newStructure: GardenStructure = {
      ...newStructureData,
      id: newId,
    };
    setStructures((prev) => [...prev, newStructure]);
  };

  const handleUpdateStructure = (updatedStructure: GardenStructure) => {
    setStructures((prev) =>
      prev.map((s) => (s.id === updatedStructure.id ? updatedStructure : s))
    );
  };

  const handleDeleteStructure = (structureId: string) => {
    setStructures((prev) => prev.filter((s) => s.id !== structureId));
  };

  // Handle Zone Actions
  const handleAddZone = (newZoneData: Omit<GardenZone, 'id'>) => {
    const newId = `zone-${Date.now()}`;
    setZones((prev) => [...prev, { ...newZoneData, id: newId }]);
  };

  const handleDeleteZone = (zoneId: string) => {
    setZones((prev) => prev.filter((z) => z.id !== zoneId));
  };

  // Handle Task Completion Toggle
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nowCompleted = !t.completed;
          return {
            ...t,
            completed: nowCompleted,
            completedAt: nowCompleted
              ? new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
              : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleAddCustomTask = (newTask: Omit<GardenTaskInstance, 'id' | 'completed'>) => {
    const newInstance: GardenTaskInstance = {
      ...newTask,
      id: `task-custom-${Date.now()}`,
      completed: false,
    };
    setTasks((prev) => [newInstance, ...prev]);
  };

  const handleToggleHideStructure = (id: string) => {
    setStructures((prev) => prev.map((s) => (s.id === id ? { ...s, hidden: !s.hidden } : s)));
  };

  const handleToggleHidePlant = (id: string) => {
    setPlants((prev) => prev.map((p) => (p.id === id ? { ...p, hidden: !p.hidden } : p)));
  };

  const handleToggleLockStructure = (id: string) => {
    setStructures((prev) => prev.map((s) => (s.id === id ? { ...s, locked: !s.locked } : s)));
  };

  const handleToggleLockPlant = (id: string) => {
    setPlants((prev) => prev.map((p) => (p.id === id ? { ...p, locked: !p.locked } : p)));
  };

  // Reset to default sample garden
  const handleResetGarden = () => {
    if (window.confirm("Voulez-vous réinitialiser le jardin avec le plan et les plantations d'exemple ?")) {
      try {
        localStorage.removeItem('jardin_plants');
        localStorage.removeItem('jardin_structures');
        localStorage.removeItem('jardin_zones');
        localStorage.removeItem('jardin_tasks');
      } catch {}

      setPlants(INITIAL_PLANTS);
      setStructures(INITIAL_STRUCTURES);
      setZones(INITIAL_ZONES);

      const generated: GardenTaskInstance[] = [];
      INITIAL_PLANTS.forEach((p) => {
        if (p.botanicalData && p.botanicalData.tasks) {
          p.botanicalData.tasks.forEach((t, i) => {
            generated.push({
              id: `task-${p.id}-${i}`,
              plantId: p.id,
              plantName: p.name,
              category: p.botanicalData.category,
              month: t.month,
              type: t.type,
              title: t.title,
              instruction: t.instruction,
              urgency: t.urgency,
              completed: false,
            });
          });
        }
      });
      setTasks(generated);
    }
  };

  const currentSeasonInfo = MONTH_SEASONS[selectedMonth - 1] || MONTH_SEASONS[0];
  const pendingTasksThisMonth = tasks.filter((t) => t.month === selectedMonth && !t.completed).length;
  const bloomingCountThisMonth = plants.filter((p) => p.botanicalData && Array.isArray(p.botanicalData.bloomMonths) && p.botanicalData.bloomMonths.includes(selectedMonth)).length;

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-stone-800 flex flex-col font-sans">
      {/* Top Application Header */}
      <header className="bg-[#84A98C] text-[#122919] border-b border-[#6b9173] shadow-xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-4">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#6b9173] border border-[#5a8062]/40 flex items-center justify-center shadow-xs shrink-0 p-1.5">
              <img
                src="/assets/aistudio/holding-hand_f513917d.png"
                alt="Mon Jardin sans IA"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-fraunces font-black tracking-tight text-white drop-shadow-xs whitespace-nowrap">
              Mon Jardin sans IA
            </h1>
          </div>

          {/* Quick Stats & Add Plant CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-2 bg-[#6f9778]/50 border border-[#5b8364] px-2.5 py-1 rounded-lg text-xs text-[#0f2416]">
              <span>{currentSeasonInfo.icon}</span>
              <span className="font-bold">{currentSeasonInfo.name}</span>
              <span className="text-[#1a3d24] font-medium text-[11px]">
                ({bloomingCountThisMonth} en fleur)
              </span>
            </div>

            <button
              onClick={() => {
                setAddPlantPosition({ x: 15, y: 10 });
                setIsAddPlantOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#284c35] hover:bg-[#1d3c28] text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>Planter</span>
            </button>

            <button
              onClick={handleResetGarden}
              title="Réinitialiser l'exemple de jardin"
              className="p-1.5 text-[#1b3b24] hover:text-[#0b1b10] hover:bg-[#6f9778]/50 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto border-t border-[#6b9173] bg-[#749b7d]/50">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-3.5 py-1.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'canvas'
                ? 'border-[#0f2416] text-[#0f2416] bg-[#84A98C] font-extrabold shadow-2xs'
                : 'border-transparent text-[#1d3d27] hover:text-[#0b1c10] hover:bg-[#84A98C]/60'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3.5 py-1.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'border-[#0f2416] text-[#0f2416] bg-[#84A98C] font-extrabold shadow-2xs'
                : 'border-transparent text-[#1d3d27] hover:text-[#0b1c10] hover:bg-[#84A98C]/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendrier</span>
            {bloomingCountThisMonth > 0 && (
              <span className="bg-pink-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {bloomingCountThisMonth}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-1.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'border-[#0f2416] text-[#0f2416] bg-[#84A98C] font-extrabold shadow-2xs'
                : 'border-transparent text-[#1d3d27] hover:text-[#0b1c10] hover:bg-[#84A98C]/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Inventaire</span>
            <span className="bg-[#284c35] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {plants.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-3.5 py-1.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'maintenance'
                ? 'border-[#0f2416] text-[#0f2416] bg-[#84A98C] font-extrabold shadow-2xs'
                : 'border-transparent text-[#1d3d27] hover:text-[#0b1c10] hover:bg-[#84A98C]/60'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Entretien</span>
            {pendingTasksThisMonth > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                {pendingTasksThisMonth}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4">
        {activeTab === 'canvas' && (
          <div className="h-[calc(100vh-100px)] min-h-[580px]">
            <GardenCanvas
              plants={plants}
              structures={structures}
              zones={zones}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
              selectedPlantId={selectedPlantId}
              onSelectPlant={(plant) => {
                setSelectedPlantId(plant?.id || null);
                if (plant) setDetailModalPlant(plant);
              }}
              onUpdatePlantPosition={handleUpdatePlantPosition}
              onUpdatePlant={handleUpdatePlant}
              onDeletePlant={handleDeletePlant}
              onOpenAddPlant={() => setIsAddPlantOpen(true)}
              onAddPlantAtPosition={(pos) => {
                setAddPlantPosition(pos);
                setIsAddPlantOpen(true);
              }}
              onAddStructure={handleAddStructure}
              onUpdateStructure={handleUpdateStructure}
              onDeleteStructure={handleDeleteStructure}
              onToggleHideStructure={handleToggleHideStructure}
              onToggleHidePlant={handleToggleHidePlant}
              onToggleLockStructure={handleToggleLockStructure}
              onToggleLockPlant={handleToggleLockPlant}
              onEditPlantRequest={(plant) => setEditingPlant(plant)}
            />
          </div>
        )}

        {activeTab === 'calendar' && (
          <SeasonalCalendar
            plants={plants}
            zones={zones}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            onSelectPlant={(plant) => {
              setDetailModalPlant(plant);
            }}
          />
        )}

        {activeTab === 'catalog' && (
          <PlantCatalog
            plants={plants}
            zones={zones}
            onSelectPlant={(plant) => {
              setDetailModalPlant(plant);
            }}
            onDeletePlant={handleDeletePlant}
            onOpenAddModal={() => {
              setAddPlantPosition({ x: 15, y: 10 });
              setIsAddPlantOpen(true);
            }}
            onAddZone={handleAddZone}
            onDeleteZone={handleDeleteZone}
          />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceTracker
            plants={plants}
            tasks={tasks}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddCustomTask}
            onSelectPlant={(plant) => {
              setDetailModalPlant(plant);
            }}
          />
        )}
      </main>

      {/* Add Plant Modal with Gemini / Web Lookup */}
      <AddPlantModal
        isOpen={isAddPlantOpen}
        onClose={() => setIsAddPlantOpen(false)}
        onAddPlant={handleAddPlant}
        initialPosition={addPlantPosition}
        zones={zones}
      />

      {/* Edit Plant Modal */}
      <EditPlantModal
        plant={editingPlant}
        isOpen={!!editingPlant}
        onClose={() => setEditingPlant(null)}
        onSave={handleUpdatePlant}
        onDelete={handleDeletePlant}
      />

      {/* Plant Botanical Inspection Card Modal */}
      <PlantDetailModal
        plant={detailModalPlant}
        zone={zones.find((z) => z.id === detailModalPlant?.zoneId)}
        onClose={() => setDetailModalPlant(null)}
        onDeletePlant={handleDeletePlant}
        onEditPlant={(plant) => {
          setEditingPlant(plant);
        }}
      />
    </div>
  );
}
