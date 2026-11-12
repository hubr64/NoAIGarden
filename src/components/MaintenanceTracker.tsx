import React, { useState } from 'react';
import { GardenPlant, GardenTaskInstance, TaskType } from '../types/garden';
import { MONTH_NAMES_FR, MONTH_SEASONS } from '../data/defaultGarden';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  AlertTriangle, 
  Scissors, 
  Droplet, 
  ShieldAlert, 
  Sparkles, 
  Plus, 
  Filter, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface MaintenanceTrackerProps {
  plants: GardenPlant[];
  tasks: GardenTaskInstance[];
  selectedMonth: number;
  onSelectMonth: (month: number) => void;
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<GardenTaskInstance, 'id' | 'completed'>) => void;
  onSelectPlant: (plant: GardenPlant) => void;
}

export const MaintenanceTracker: React.FC<MaintenanceTrackerProps> = ({
  plants,
  tasks,
  selectedMonth,
  onSelectMonth,
  onToggleTask,
  onAddTask,
  onSelectPlant,
}) => {
  const [filterMode, setFilterMode] = useState<'current_month' | 'all_pending' | 'completed'>('current_month');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<TaskType | 'all'>('all');
  const [isAddingCustom, setIsAddingCustom] = useState<boolean>(false);

  // New task form
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customInstruction, setCustomInstruction] = useState<string>('');
  const [customType, setCustomType] = useState<TaskType>('taille');
  const [customMonth, setCustomMonth] = useState<number>(selectedMonth);
  const [customPlantId, setCustomPlantId] = useState<string>(plants[0]?.id || '');
  const [customUrgency, setCustomUrgency] = useState<'conseillé' | 'important' | 'vital'>('important');

  // Helper icons per task type
  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case 'taille':
        return <Scissors className="w-4 h-4 text-amber-600" />;
      case 'arrosage':
        return <Droplet className="w-4 h-4 text-blue-500" />;
      case 'paillage':
        return <span className="text-sm">🍂</span>;
      case 'fertilisation':
        return <span className="text-sm">🌱</span>;
      case 'nettoyage':
        return <Sparkles className="w-4 h-4 text-pink-500" />;
      case 'plantation':
        return <span className="text-sm">🧅</span>;
      case 'hivernage':
        return <ShieldAlert className="w-4 h-4 text-indigo-500" />;
      default:
        return <Calendar className="w-4 h-4 text-stone-500" />;
    }
  };

  const getTaskTypeBadge = (type: TaskType) => {
    const labels: Record<TaskType, { label: string; bg: string; text: string }> = {
      taille: { label: 'Taille & Élagage', bg: 'bg-amber-100', text: 'text-amber-800' },
      arrosage: { label: 'Arrosage', bg: 'bg-blue-100', text: 'text-blue-800' },
      paillage: { label: 'Paillage & Protection', bg: 'bg-orange-100', text: 'text-orange-800' },
      fertilisation: { label: 'Fertilisation', bg: 'bg-emerald-100', text: 'text-emerald-800' },
      nettoyage: { label: 'Nettoyage & Fleurs', bg: 'bg-rose-100', text: 'text-rose-800' },
      plantation: { label: 'Plantation & Bulbes', bg: 'bg-purple-100', text: 'text-purple-800' },
      hivernage: { label: 'Hivernage', bg: 'bg-indigo-100', text: 'text-indigo-800' },
    };
    const t = labels[type] || { label: type, bg: 'bg-stone-100', text: 'text-stone-700' };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${t.bg} ${t.text}`}>
        {t.label}
      </span>
    );
  };

  const getUrgencyBadge = (urgency: 'conseillé' | 'important' | 'vital') => {
    switch (urgency) {
      case 'vital':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            Geste vital
          </span>
        );
      case 'important':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            Important
          </span>
        );
      case 'conseillé':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600">
            Conseillé
          </span>
        );
    }
  };

  // Filter tasks based on controls
  const filteredTasks = tasks.filter((task) => {
    if (filterMode === 'current_month' && task.month !== selectedMonth) return false;
    if (filterMode === 'all_pending' && task.completed) return false;
    if (filterMode === 'completed' && !task.completed) return false;
    if (selectedTypeFilter !== 'all' && task.type !== selectedTypeFilter) return false;
    return true;
  });

  const handleCreateCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const plant = plants.find(p => p.id === customPlantId);

    onAddTask({
      plantId: customPlantId,
      plantName: plant ? plant.name : 'Jardin général',
      category: plant ? plant.botanicalData.category : 'Fleur vivace',
      month: customMonth,
      type: customType,
      title: customTitle.trim(),
      instruction: customInstruction.trim(),
      urgency: customUrgency,
    });

    setCustomTitle('');
    setCustomInstruction('');
    setIsAddingCustom(false);
  };

  const tasksThisMonth = tasks.filter(t => t.month === selectedMonth);
  const pendingThisMonth = tasksThisMonth.filter(t => !t.completed).length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Current Month Status */}
      <div className="bg-[#244833] text-white p-6 rounded-3xl shadow-sm border border-emerald-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-300">
              Rappels botaniques automatiques
            </span>
          </div>
          <h2 className="text-2xl font-bold">
            Soins &amp; Entretien du mois de {MONTH_NAMES_FR[selectedMonth - 1]}
          </h2>
          <p className="text-xs text-emerald-100/80 mt-1">
            Générés automatiquement d'après les espèces végétales plantées dans votre jardin
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/10 text-center">
            <span className="text-2xl font-extrabold text-white block">
              {pendingThisMonth}
            </span>
            <span className="text-[11px] text-emerald-200">
              Geste{pendingThisMonth > 1 ? 's' : ''} à faire ce mois
            </span>
          </div>

          <button
            onClick={() => setIsAddingCustom(true)}
            className="px-4 py-3 bg-white text-[#244833] hover:bg-emerald-50 text-xs font-bold rounded-2xl transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#2d5a3c]" />
            <span>Nouveau rappel</span>
          </button>
        </div>
      </div>

      {/* Month selector tabs */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5 bg-white p-2 rounded-2xl border border-[#e5dfd3] shadow-xs">
        {MONTH_SEASONS.map((m) => {
          const isSelected = selectedMonth === m.month;
          const monthTasks = tasks.filter(t => t.month === m.month);
          const uncompleted = monthTasks.filter(t => !t.completed).length;

          return (
            <button
              key={m.month}
              onClick={() => onSelectMonth(m.month)}
              className={`py-2 px-1 text-center rounded-xl transition-all flex flex-col items-center gap-0.5 ${
                isSelected
                  ? 'bg-[#2d5a3c] text-white font-bold shadow-md'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <span className="text-xs">{m.icon}</span>
              <span className="text-[11px] uppercase tracking-wider">{m.name.slice(0, 3)}</span>
              {uncompleted > 0 ? (
                <span
                  className={`text-[10px] px-1.5 rounded-full font-bold ${
                    isSelected ? 'bg-emerald-100 text-[#244833]' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {uncompleted}
                </span>
              ) : (
                <span className="text-[10px] text-stone-300">-</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter and View toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#e5dfd3]">
        <div className="flex items-center gap-1 bg-[#f2eee6] p-1 rounded-xl">
          <button
            onClick={() => setFilterMode('current_month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterMode === 'current_month'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Mois sélectionné ({tasksThisMonth.length})
          </button>
          <button
            onClick={() => setFilterMode('all_pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterMode === 'all_pending'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Toutes les tâches à faire ({tasks.filter(t => !t.completed).length})
          </button>
          <button
            onClick={() => setFilterMode('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterMode === 'completed'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Historique réalisé ({tasks.filter(t => t.completed).length})
          </button>
        </div>

        {/* Task type filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-medium">Type de soin :</span>
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value as any)}
            className="text-xs bg-[#f8f6f0] border border-[#dcd4c6] rounded-xl px-3 py-1.5 font-medium text-stone-700"
          >
            <option value="all">Tous les gestes</option>
            <option value="taille">Taille &amp; Élagage</option>
            <option value="arrosage">Arrosage</option>
            <option value="paillage">Paillage</option>
            <option value="fertilisation">Fertilisation</option>
            <option value="nettoyage">Nettoyage fleurs fanées</option>
            <option value="plantation">Plantation &amp; bulbes</option>
            <option value="hivernage">Hivernage / Gel</option>
          </select>
        </div>
      </div>

      {/* Custom Task Form Modal */}
      {isAddingCustom && (
        <form onSubmit={handleCreateCustomTask} className="bg-white p-5 rounded-3xl border-2 border-emerald-600/30 shadow-md space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h4 className="font-bold text-sm text-stone-900">
              Créer un rappel d'entretien personnalisé
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="text-stone-400 hover:text-stone-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-700 mb-1">Titre de l'action</label>
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Ex : Tailler les rosiers à 3 yeux, Diviser les touffes..."
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Mois prévu</label>
              <select
                value={customMonth}
                onChange={(e) => setCustomMonth(parseInt(e.target.value, 10))}
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
              >
                {MONTH_NAMES_FR.map((name, i) => (
                  <option key={name} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Type de geste</label>
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
              >
                <option value="taille">Taille &amp; Élagage</option>
                <option value="arrosage">Arrosage</option>
                <option value="paillage">Paillage</option>
                <option value="fertilisation">Fertilisation</option>
                <option value="nettoyage">Nettoyage</option>
                <option value="plantation">Plantation</option>
                <option value="hivernage">Hivernage</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Plante concernée</label>
              <select
                value={customPlantId}
                onChange={(e) => setCustomPlantId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
              >
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Niveau d'importance</label>
              <select
                value={customUrgency}
                onChange={(e) => setCustomUrgency(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
              >
                <option value="conseillé">Conseillé</option>
                <option value="important">Important</option>
                <option value="vital">Geste vital</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Consignes et techniques précises</label>
            <textarea
              rows={2}
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="Conseils de coupe, désinfection des outils, hauteur..."
              className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#2d5a3c] text-white text-xs font-bold rounded-lg hover:bg-[#244833]"
            >
              Enregistrer le rappel
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-[#e5dfd3] text-center text-stone-500">
            <span className="text-4xl block mb-2">🌿</span>
            <h4 className="font-bold text-stone-800 text-sm">
              Aucun soin en attente pour cette sélection
            </h4>
            <p className="text-xs text-stone-400 mt-1">
              Votre jardin est parfaitement à jour ! Profitez de la beauté de vos floraisons.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const plant = plants.find(p => p.id === task.plantId);

            return (
              <div
                key={task.id}
                className={`bg-white border rounded-2xl p-4 transition-all flex items-start gap-3.5 shadow-2xs ${
                  task.completed
                    ? 'border-emerald-200 bg-emerald-50/20 opacity-70'
                    : 'border-[#e5dfd3] hover:border-emerald-600/40'
                }`}
              >
                {/* Complete checkbox button */}
                <button
                  onClick={() => onToggleTask(task.id)}
                  className="mt-0.5 text-emerald-700 hover:scale-110 transition-transform"
                  title={task.completed ? "Marquer comme à faire" : "Marquer comme réalisé"}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-400 hover:text-emerald-600" />
                  )}
                </button>

                {/* Task Details */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      {getTaskTypeBadge(task.type)}
                      {getUrgencyBadge(task.urgency)}
                      <span className="text-xs font-medium text-stone-500">
                        {MONTH_NAMES_FR[task.month - 1]}
                      </span>
                    </div>

                    {plant && (
                      <button
                        onClick={() => onSelectPlant(plant)}
                        className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                      >
                        <span>{plant.name}</span>
                      </button>
                    )}
                  </div>

                  <h4 className={`text-sm font-bold text-stone-900 ${task.completed ? 'line-through text-stone-400' : ''}`}>
                    {task.title}
                  </h4>

                  {task.instruction && (
                    <p className="text-xs text-stone-600 mt-1.5 leading-relaxed bg-[#fbf9f4] p-2.5 rounded-xl border border-stone-100">
                      {task.instruction}
                    </p>
                  )}

                  {task.completed && task.completedAt && (
                    <p className="text-[10px] text-emerald-700 font-medium mt-1">
                      ✓ Réalisé le {task.completedAt}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
