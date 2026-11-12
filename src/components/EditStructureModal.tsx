import React, { useState, useEffect } from 'react';
import { GardenStructure, StructureShape, StructureTexture, StructureType } from '../types/garden';
import { Trash2, RotateCw, Check, Home, Grid, Footprints, Droplets, Shield, Flower } from 'lucide-react';

interface EditStructureModalProps {
  structure: GardenStructure | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: GardenStructure) => void;
  onDelete: (structureId: string) => void;
}

export const EditStructureModal: React.FC<EditStructureModalProps> = ({
  structure,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<StructureType>('building');
  const [shape, setShape] = useState<StructureShape>('rect');
  const [texture, setTexture] = useState<StructureTexture>('roof_slate');
  const [ridgePositionPercent, setRidgePositionPercent] = useState<number>(50);
  const [width, setWidth] = useState<number>(5);
  const [height, setHeight] = useState<number>(4);
  const [rotation, setRotation] = useState<number>(0);

  useEffect(() => {
    if (structure) {
      setName(structure.name);
      setType(structure.type);
      setShape(structure.shape);
      setTexture(structure.texture);
      setRidgePositionPercent(structure.ridgePositionPercent ?? 50);
      setWidth(structure.width);
      setHeight(structure.height);
      setRotation(structure.rotation || 0);
    }
  }, [structure]);

  if (!isOpen || !structure) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...structure,
      name: name.trim() || structure.name,
      type,
      shape,
      texture,
      ridgePositionPercent,
      width: Math.max(0.5, width),
      height: Math.max(0.5, height),
      rotation: ((rotation % 360) + 360) % 360,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#fbf9f4] border border-[#e5dfd3] rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#244833] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-emerald-50">Éditer l'aménagement</h2>
            <p className="text-xs text-emerald-200/80">
              Modifiez la taille, la forme, la texture, l'angle et le type
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
          {/* Informational position note */}
          <div className="bg-amber-50/80 border border-amber-200 p-2.5 rounded-xl text-amber-900 text-[11px] flex items-center justify-between">
            <span>Position actuelle : <strong>X = {structure.x} m, Y = {structure.y} m</strong></span>
            <span className="text-[10px] text-amber-700 italic">Déplaçable par glisser-déposer sur le plan</span>
          </div>

          {/* Name */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">Nom de l'aménagement</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#d6cec0] rounded-xl text-xs focus:ring-1 focus:ring-[#2d5a3c]"
            />
          </div>

          {/* Type & Forme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Type d'aménagement</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as StructureType)}
                className="w-full px-3 py-2 bg-white border border-[#d6cec0] rounded-xl text-xs"
              >
                <option value="building">Bâtiment</option>
                <option value="courtyard">Cour</option>
                <option value="path">Chemin</option>
                <option value="pond">Mare</option>
                <option value="wall">Mur</option>
                <option value="bed">Parterre</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Forme géométrique</label>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value as StructureShape)}
                className="w-full px-3 py-2 bg-white border border-[#d6cec0] rounded-xl text-xs"
              >
                <option value="rect">Rectangle</option>
                <option value="oval">Ovale / Rond</option>
                <option value="triangle">Triangle</option>
              </select>
            </div>
          </div>

          {/* Texture */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">Texture</label>
            <select
              value={texture}
              onChange={(e) => setTexture(e.target.value as StructureTexture)}
              className="w-full px-3 py-2 bg-white border border-[#d6cec0] rounded-xl text-xs"
            >
              <option value="roof_slate">Toiture ardoise</option>
              <option value="roof_tile">Toiture tuile</option>
              <option value="roof_glass">Toiture en verre</option>
              <option value="grass">Herbe</option>
              <option value="paving">Zone pavée</option>
              <option value="soil">Zone en terre</option>
              <option value="gravel">Zone en gravier</option>
              <option value="water">Eau</option>
            </select>
          </div>

          {/* Ridge Position Slider (for roof textures) */}
          {(texture === 'roof_slate' || texture === 'roof_tile' || texture === 'roof_glass') && (
            <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80">
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <label className="font-semibold text-stone-700">Position du faîtage (ligne de toiture)</label>
                <span className="font-mono text-[#2d5a3c] font-bold bg-white px-2 py-0.5 rounded border border-amber-200">{ridgePositionPercent}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={ridgePositionPercent}
                onChange={(e) => setRidgePositionPercent(parseInt(e.target.value, 10))}
                className="w-full accent-[#2d5a3c] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-1">
                <span>0% (Pente unique droite)</span>
                <span>50% (Double pan équilibré)</span>
                <span>100% (Pente unique gauche)</span>
              </div>
            </div>
          )}

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Largeur (mètres)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="30"
                value={width}
                onChange={(e) => setWidth(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-white border border-[#d6cec0] rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Longueur / Hauteur (mètres)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="20"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-white border border-[#d6cec0] rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Rotation angle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-stone-700 font-semibold flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5 text-stone-500" />
                <span>Angle de rotation</span>
              </label>
              <span className="font-mono text-stone-800">{rotation}°</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                className="flex-1 accent-[#2d5a3c]"
              />
              <input
                type="number"
                min="0"
                max="360"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value, 10) || 0)}
                className="w-16 px-2 py-1 text-center bg-white border border-[#d6cec0] rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onDelete(structure.id);
                onClose();
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors font-medium"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer cet aménagement</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-600 hover:text-stone-900"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#2d5a3c] text-white font-bold rounded-xl hover:bg-[#244833] flex items-center gap-1.5 shadow-sm"
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
