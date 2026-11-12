import React, { useState, useEffect } from 'react';
import { GardenPlant, PlantSpreadShape } from '../types/garden';
import { Trash2, Check, Calendar, Palette } from 'lucide-react';

interface EditPlantModalProps {
  plant: GardenPlant | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: GardenPlant) => void;
  onDelete: (plantId: string) => void;
}

export const EditPlantModal: React.FC<EditPlantModalProps> = ({
  plant,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [simpleName, setSimpleName] = useState<string>('');
  const [customColor, setCustomColor] = useState<string>('#2d5a3c');
  const [spreadShape, setSpreadShape] = useState<PlantSpreadShape>('oval');
  const [currentSpreadWidth, setCurrentSpreadWidth] = useState<number>(1);
  const [plantedDate, setPlantedDate] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');

  useEffect(() => {
    if (plant) {
      setSimpleName(plant.simpleName || plant.name);
      setCustomColor(
        plant.customColor || plant.botanicalData.flowerColorHex || '#2d5a3c'
      );
      setSpreadShape(plant.spreadShape || 'oval');
      setCurrentSpreadWidth(plant.currentSpreadWidth || plant.botanicalData.spreadM);
      setPlantedDate(
        plant.plantedDate || new Date().toISOString().split('T')[0]
      );
      setCustomNotes(plant.customNotes || '');
    }
  }, [plant]);

  if (!isOpen || !plant) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const spreadVal = Math.max(0.2, currentSpreadWidth);
    onSave({
      ...plant,
      simpleName: simpleName.trim() || plant.name,
      customColor,
      spreadShape,
      currentSpreadWidth: spreadVal,
      currentSpreadHeight: spreadVal,
      plantedDate,
      customNotes: customNotes.trim(),
    });
    onClose();
  };

  const b = plant.botanicalData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#fbf9f4] border border-[#e5dfd3] rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#244833] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full inline-block mb-1">
              {b.category}
            </span>
            <h2 className="text-base font-bold text-emerald-50">Éditer la plante</h2>
            <p className="text-xs text-emerald-200/80">
              Modifiez le nom simple, la couleur, l'envergure et la date de plantation
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Position info */}
          <div className="bg-amber-50/80 border border-amber-200 p-2.5 rounded-xl text-amber-900 text-[11px] flex items-center justify-between">
            <span>Position sur le plan : <strong>X = {plant.position.x} m, Y = {plant.position.y} m</strong></span>
            <span className="text-[10px] text-amber-700 italic">Déplaçable sur le plan</span>
          </div>

          {/* 1. Editable: Simple Name on plan */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1 flex items-center justify-between">
              <span>Nom simple (affiché sur le plan)</span>
              <span className="text-[10px] text-stone-400 font-normal">Étiquette 2D</span>
            </label>
            <input
              type="text"
              required
              value={simpleName}
              onChange={(e) => setSimpleName(e.target.value)}
              placeholder="Ex: Mon Érable, Rosier Pierre de Ronsard..."
              className="w-full px-3 py-2 bg-white border border-[#d6cec0] rounded-xl text-xs focus:ring-1 focus:ring-[#2d5a3c]"
            />
          </div>

          {/* 2. Editable: Point Color */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#2d5a3c]" />
                <span>Couleur du point sur le plan</span>
              </span>
              <span className="text-[10px] text-stone-400 font-normal">Teinte représentative</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-10 h-9 p-0.5 rounded-lg border border-[#d6cec0] cursor-pointer bg-white shrink-0"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                placeholder="#2d5a3c"
                className="flex-1 px-3 py-2 bg-white border border-[#d6cec0] rounded-xl text-xs font-mono focus:ring-1 focus:ring-[#2d5a3c]"
              />
            </div>
          </div>

          {/* 3. Date de plantation with datepicker */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#2d5a3c]" />
              <span>Date de plantation</span>
            </label>
            <input
              type="date"
              value={plantedDate}
              onChange={(e) => setPlantedDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#d6cec0] rounded-xl text-xs focus:ring-1 focus:ring-[#2d5a3c]"
            />
          </div>

          {/* 4. Editable: Current Spread & Spread Shape (No height field) */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3">
            <h4 className="font-bold text-stone-800 text-xs flex items-center justify-between">
              <span>Envergure de la plante</span>
              <span className="text-[10px] text-stone-400 font-normal">
                Adulte théorique : Ø {b.spreadM} m
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-600 mb-1 font-medium">Forme de l'envergure</label>
                <select
                  value={spreadShape}
                  onChange={(e) => setSpreadShape(e.target.value as PlantSpreadShape)}
                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                >
                  <option value="oval">Ovale / Ronde</option>
                  <option value="rect">Rectangle / Haie</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Envergure (mètres)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.2"
                  max="20"
                  value={currentSpreadWidth}
                  onChange={(e) => setCurrentSpreadWidth(parseFloat(e.target.value) || 0.5)}
                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* 5. Editable: Free custom comment field */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Commentaire libre du jardinier
            </label>
            <textarea
              rows={3}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Ex : Bouture réalisée au printemps, terreau de feuilles apporté..."
              className="w-full px-3 py-2 bg-white border border-[#d6cec0] rounded-xl text-xs focus:ring-1 focus:ring-[#2d5a3c]"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onDelete(plant.id);
                onClose();
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors font-medium text-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer cette plante</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-600 hover:text-stone-900 text-xs"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#2d5a3c] text-white font-bold text-xs rounded-xl hover:bg-[#244833] flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
