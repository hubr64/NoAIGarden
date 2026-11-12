import React from 'react';
import { GardenPlant, GardenZone } from '../types/garden';
import { MONTH_NAMES_FR, MONTH_SEASONS } from '../data/defaultGarden';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Scissors, 
  Trash2,
  Edit3
} from 'lucide-react';

interface PlantDetailModalProps {
  plant: GardenPlant | null;
  zone?: GardenZone;
  onClose: () => void;
  onDeletePlant: (plantId: string) => void;
  onEditPlant?: (plant: GardenPlant) => void;
}

export const PlantDetailModal: React.FC<PlantDetailModalProps> = ({
  plant,
  zone,
  onClose,
  onDeletePlant,
  onEditPlant,
}) => {
  if (!plant) return null;

  const b = plant.botanicalData;

  // 7.2 Map category to 1 of 4 icons: Arbre (🌳), Arbuste (🪴), Bulbe (🧅), Plante (🌿)
  const getCategoryDetails = (cat: string) => {
    const lower = (cat || '').toLowerCase();
    if (lower.includes('arbre')) {
      return { icon: '🌳', label: cat };
    }
    if (lower.includes('arbuste')) {
      return { icon: '🪴', label: cat };
    }
    if (lower.includes('bulbe')) {
      return { icon: '🧅', label: cat };
    }
    return { icon: '🌿', label: cat };
  };

  const catDetails = getCategoryDetails(b.category);

  const calculateAge = (dateStr: string) => {
    if (!dateStr) return null;
    const planted = new Date(dateStr);
    if (isNaN(planted.getTime())) return null;
    const now = new Date();
    const diffMonths = (now.getFullYear() - planted.getFullYear()) * 12 + (now.getMonth() - planted.getMonth());
    if (diffMonths < 1) return "Planté récemment";
    if (diffMonths < 12) return `${diffMonths} mois en terre`;
    const years = Math.floor(diffMonths / 12);
    const remMonths = diffMonths % 12;
    return `${years} an${years > 1 ? 's' : ''}${remMonths > 0 ? ` et ${remMonths} mois` : ''}`;
  };

  const age = calculateAge(plant.plantedDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#fbf9f4] border border-[#e5dfd3] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#244833] text-white px-6 py-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 flex items-center gap-1.5 shadow-xs">
                <span>{catDetails.icon}</span>
                <span>{catDetails.label}</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-emerald-50">
              {plant.name}
            </h2>
            <p className="text-xs font-serif italic text-emerald-200">
              {b.botanicalName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Plant Photo */}
          {(b.photoUrl || plant.photoUrl) && (
            <div className="relative h-52 rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
              <img
                src={b.photoUrl || plant.photoUrl}
                alt={plant.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-3">
                <span className="text-white text-xs font-semibold px-2.5 py-1 bg-black/40 backdrop-blur-xs rounded-lg">
                  Photo de la variété identifiée
                </span>
              </div>
            </div>
          )}

          {/* Garden Planting Information */}
          <div className="bg-[#f3ede1] p-4 rounded-2xl border border-[#ded5c5] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2d5a3c]" />
              <div>
                <span className="text-stone-500 block text-[10px]">Emplacement au jardin</span>
                <span className="font-semibold text-stone-800">
                  {zone ? zone.name : "Parterre non assigné"} (X: {plant.position.x}m, Y: {plant.position.y}m)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2d5a3c]" />
              <div>
                <span className="text-stone-500 block text-[10px]">Plantation &amp; Âge</span>
                <span className="font-semibold text-stone-800">
                  {plant.plantedDate || "Date non précisée"} {age ? `(${age})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* 7.1 Dedicated Section for Botanical Family */}
          {b.family && (
            <div className="bg-[#eaf1ec] p-3.5 rounded-2xl border border-[#cbe0d2] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#244833] text-emerald-200 flex items-center justify-center font-serif font-bold text-base shrink-0">
                F
              </div>
              <div>
                <span className="text-stone-500 block text-[10px] font-semibold uppercase tracking-wider">
                  Famille botanique
                </span>
                <span className="font-bold text-[#1b3827] text-sm font-serif italic">
                  {b.family}
                </span>
              </div>
            </div>
          )}

          {/* Description */}
          {b.description && (
            <div className="bg-white p-4 rounded-2xl border border-[#e8e0d2]">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Description &amp; Intérêt paysager
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {b.description}
              </p>
            </div>
          )}

          {/* Botanical Traits Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3 rounded-2xl border border-stone-200">
              <span className="text-stone-400 block text-[10px] mb-0.5">Envergure adulte</span>
              <span className="font-bold text-stone-800 text-sm">
                Ø {b.spreadM} m
              </span>
              <span className="text-stone-500 block text-[10px]">Hauteur : {b.heightM} m</span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-stone-200">
              <span className="text-stone-400 block text-[10px] mb-0.5">Type de feuillage</span>
              <span className="font-bold text-stone-800 text-sm">
                {b.foliageType}
              </span>
              {b.autumnColorHex && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.autumnColorHex }} />
                  <span className="text-[10px] text-stone-500">Automne flamboyant</span>
                </div>
              )}
            </div>

            <div className="bg-white p-3 rounded-2xl border border-stone-200">
              <span className="text-stone-400 block text-[10px] mb-0.5">Exposition idéale</span>
              <span className="font-bold text-stone-800 text-sm">
                {b.exposure}
              </span>
              <span className="text-stone-500 block text-[10px]">Besoin eau : {b.soilMoisture || 'Modéré'}</span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-stone-200">
              <span className="text-stone-400 block text-[10px] mb-0.5">Type de sol</span>
              <span className="font-bold text-stone-800 text-xs line-clamp-2">
                {b.soilType}
              </span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-stone-200">
              <span className="text-stone-400 block text-[10px] mb-0.5">Rusticité au gel</span>
              <span className="font-bold text-stone-800 text-sm">
                {b.hardinessZone}
              </span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-stone-200">
              <span className="text-stone-400 block text-[10px] mb-0.5">Parfum</span>
              <span className="font-bold text-stone-800 text-sm">
                {b.fragrance || 'Non spécifié'}
              </span>
            </div>
          </div>

          {/* Flowering Timeline Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>Cycle de floraison annuel</span>
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-stone-600">
                <span
                  className="w-3 h-3 rounded-full border border-stone-300"
                  style={{ backgroundColor: b.flowerColorHex }}
                />
                <span className="font-medium">{b.flowerColorName}</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-1 pt-1">
              {MONTH_NAMES_FR.map((name, i) => {
                const monthNum = i + 1;
                const isBloom = b.bloomMonths.includes(monthNum);

                return (
                  <div
                    key={name}
                    className={`text-center py-2 rounded-lg text-[10px] font-semibold transition-all ${
                      isBloom
                        ? 'text-white shadow-xs'
                        : 'bg-stone-50 text-stone-300'
                    }`}
                    style={{
                      backgroundColor: isBloom ? b.flowerColorHex : undefined,
                    }}
                  >
                    <span className="block">{name.slice(0, 3)}</span>
                    {isBloom && <span className="text-[9px]">🌸</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Care Tasks Schedule */}
          {b.tasks && b.tasks.length > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2.5">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-amber-600" />
                <span>Calendrier d'entretien spécifique</span>
              </h4>

              <div className="space-y-2">
                {b.tasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#fbf9f4] rounded-xl border border-stone-200/80 flex items-start gap-3"
                  >
                    <span className="bg-[#244833] text-white px-2 py-0.5 rounded text-[11px] font-bold">
                      {MONTH_SEASONS[task.month - 1]?.name}
                    </span>
                    <div className="flex-1">
                      <h5 className="font-bold text-xs text-stone-900">{task.title}</h5>
                      <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                        {task.instruction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personal Notes */}
          {plant.customNotes && (
            <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/60 text-xs">
              <span className="font-bold text-amber-900 block mb-0.5">Notes du jardinier :</span>
              <p className="text-amber-800">{plant.customNotes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f5efe4] px-6 py-3.5 border-t border-[#e2d8c7] flex items-center justify-between">
          <button
            onClick={() => {
              onDeletePlant(plant.id);
              onClose();
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Supprimer du jardin</span>
          </button>

          <div className="flex items-center gap-2">
            {onEditPlant && (
              <button
                onClick={() => {
                  onEditPlant(plant);
                  onClose();
                }}
                className="px-4 py-2 bg-[#2d5a3c] text-white text-xs font-semibold rounded-xl hover:bg-[#244833] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Modifier</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
