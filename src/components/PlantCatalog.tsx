import React, { useState } from 'react';
import { GardenPlant, GardenZone, PlantCategory } from '../types/garden';
import { 
  Sparkles, 
  Search, 
  MapPin, 
  Trash2, 
  Calendar, 
  Maximize2, 
  Sun, 
  Droplet, 
  Layers, 
  Plus, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { MONTH_SEASONS } from '../data/defaultGarden';

interface PlantCatalogProps {
  plants: GardenPlant[];
  zones: GardenZone[];
  onSelectPlant: (plant: GardenPlant) => void;
  onDeletePlant: (plantId: string) => void;
  onOpenAddModal: () => void;
  onAddZone: (zone: Omit<GardenZone, 'id'>) => void;
  onDeleteZone: (zoneId: string) => void;
}

export const PlantCatalog: React.FC<PlantCatalogProps> = ({
  plants,
  zones,
  onSelectPlant,
  onDeletePlant,
  onOpenAddModal,
  onAddZone,
  onDeleteZone,
}) => {
  const [viewMode, setViewMode] = useState<'species' | 'zones'>('species');
  const [selectedCategory, setSelectedCategory] = useState<PlantCategory | 'Tous'>('Tous');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Zone creation form
  const [isAddingZone, setIsAddingZone] = useState<boolean>(false);
  const [newZoneName, setNewZoneName] = useState<string>('');
  const [newZoneExposure, setNewZoneExposure] = useState<string>('Plein soleil');
  const [newZoneSoil, setNewZoneSoil] = useState<string>('Terre de jardin ordinaire');
  const [newZoneColor, setNewZoneColor] = useState<string>('#e65100');

  // Filtered plants
  const filteredPlants = plants.filter((plant) => {
    const b = plant.botanicalData;
    if (selectedCategory !== 'Tous' && b.category !== selectedCategory) return false;
    if (selectedZoneId !== 'all' && plant.zoneId !== selectedZoneId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCommon = plant.name.toLowerCase().includes(q);
      const matchLatin = b.botanicalName.toLowerCase().includes(q);
      const matchFamily = b.family?.toLowerCase().includes(q);
      if (!matchCommon && !matchLatin && !matchFamily) return false;
    }
    return true;
  });

  const categories: Array<{ id: PlantCategory | 'Tous'; label: string; icon: string }> = [
    { id: 'Tous', label: 'Toutes', icon: '🌿' },
    { id: 'Arbre', label: 'Arbres', icon: '🌳' },
    { id: 'Arbuste', label: 'Arbustes', icon: '🪴' },
    { id: 'Fleur vivace', label: 'Fleurs vivaces', icon: '🌺' },
    { id: 'Bulbe', label: 'Bulbes', icon: '🧅' },
    { id: 'Plante grimpante', label: 'Grimpantes', icon: '🧗' },
    { id: 'Graminée', label: 'Graminées', icon: '🌾' },
  ];

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;
    onAddZone({
      name: newZoneName.trim(),
      exposure: newZoneExposure as any,
      soilType: newZoneSoil,
      color: newZoneColor,
    });
    setNewZoneName('');
    setIsAddingZone(false);
  };

  // Helper calculate age
  const calculateAge = (dateStr: string) => {
    if (!dateStr) return null;
    const planted = new Date(dateStr);
    const now = new Date();
    const diffMonths = (now.getFullYear() - planted.getFullYear()) * 12 + (now.getMonth() - planted.getMonth());
    if (diffMonths < 1) return "Planté récemment";
    if (diffMonths < 12) return `${diffMonths} mois en terre`;
    const years = Math.floor(diffMonths / 12);
    const remMonths = diffMonths % 12;
    return `${years} an${years > 1 ? 's' : ''}${remMonths > 0 ? ` et ${remMonths} mois` : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#e5dfd3] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span>Inventaire Botanique &amp; Parterres</span>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              {plants.length} spécimen{plants.length > 1 ? 's' : ''}
            </span>
          </h2>
          <p className="text-xs text-stone-500">
            Nomenclature précise de vos arbres, arbustes, fleurs et bulbes classés par zones
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="bg-[#f2eee6] p-1 rounded-xl flex items-center gap-1 border border-[#e2dacb]">
            <button
              onClick={() => setViewMode('species')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'species'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Par Espèces
            </button>
            <button
              onClick={() => setViewMode('zones')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'zones'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Par Parterres &amp; Zones
            </button>
          </div>

          {/* Quick Add Plant Button */}
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-[#2d5a3c] text-white text-xs font-bold rounded-xl hover:bg-[#244833] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Ajouter une plante</span>
          </button>
        </div>
      </div>

      {viewMode === 'species' ? (
        <>
          {/* Category Pills & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    selectedCategory === cat.id
                      ? 'bg-[#244833] text-white border-[#244833] shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className="text-[10px] opacity-75">
                    ({cat.id === 'Tous' ? plants.length : plants.filter(p => p.botanicalData.category === cat.id).length})
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher nom, latin, famille..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#d6cec0] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2d5a3c]"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Plants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlants.map((plant) => {
              const b = plant.botanicalData;
              const zone = zones.find(z => z.id === plant.zoneId);
              const age = calculateAge(plant.plantedDate);

              return (
                <div
                  key={plant.id}
                  className="bg-white border border-[#e5dfd3] hover:border-emerald-600/50 rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-1">
                          {b.category}
                        </span>
                        <h3 className="font-bold text-base text-stone-900 group-hover:text-emerald-800 transition-colors">
                          {plant.name}
                        </h3>
                        <p className="text-xs font-serif italic text-stone-500">
                          {b.botanicalName}
                        </p>
                      </div>

                      <button
                        onClick={() => onDeletePlant(plant.id)}
                        className="text-stone-300 hover:text-red-600 p-1 rounded transition-colors"
                        title="Supprimer la plante"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Zone Badge & Age */}
                    <div className="flex items-center gap-2 flex-wrap text-[11px] mb-3">
                      {zone && (
                        <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#2d5a3c]" />
                          {zone.name}
                        </span>
                      )}
                      {age && (
                        <span className="text-stone-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {age}
                        </span>
                      )}
                    </div>

                    {/* Quick description */}
                    {b.description && (
                      <p className="text-xs text-stone-600 line-clamp-2 bg-[#fbf9f4] p-2.5 rounded-xl border border-stone-100 mb-3 leading-relaxed">
                        {b.description}
                      </p>
                    )}

                    {/* Precision Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-100/80 mb-3">
                      <div>
                        <span className="text-stone-400 block text-[10px]">Envergure adulte</span>
                        <span className="font-semibold text-stone-800">
                          Ø {b.spreadM}m • H: {b.heightM}m
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">Feuillage</span>
                        <span className="font-semibold text-stone-800">
                          {b.foliageType}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">Exposition</span>
                        <span className="font-semibold text-stone-800">
                          {b.exposure}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">Floraison</span>
                        <div className="flex items-center gap-1 font-semibold text-stone-800">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-stone-300 inline-block"
                            style={{ backgroundColor: b.flowerColorHex }}
                          />
                          <span>
                            {b.bloomMonths.map(m => MONTH_SEASONS[m-1]?.name.slice(0, 3)).join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400">
                      Position : X {plant.position.x}m / Y {plant.position.y}m
                    </span>
                    <button
                      onClick={() => onSelectPlant(plant)}
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                    >
                      <span>Fiche complète</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Zones & Parterres view */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900">
              Organisation de vos parterres &amp; massifs
            </h3>
            <button
              onClick={() => setIsAddingZone(true)}
              className="px-3 py-1.5 bg-[#2d5a3c] text-white text-xs font-semibold rounded-xl hover:bg-[#244833] flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Créer un nouveau parterre</span>
            </button>
          </div>

          {/* New Zone Form */}
          {isAddingZone && (
            <form onSubmit={handleCreateZone} className="bg-white p-5 rounded-3xl border border-[#ded5c5] shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Nouveau parterre de jardin
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-stone-600 mb-1">Nom du massif / zone</label>
                  <input
                    type="text"
                    required
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    placeholder="Ex : Rocaille Méditerranéenne, Bordure de Piscine..."
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Exposition</label>
                  <select
                    value={newZoneExposure}
                    onChange={(e) => setNewZoneExposure(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                  >
                    <option value="Plein soleil">Plein soleil</option>
                    <option value="Mi-ombre">Mi-ombre</option>
                    <option value="Ombre">Ombre</option>
                    <option value="Soleil à mi-ombre">Soleil à mi-ombre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Type de sol</label>
                  <input
                    type="text"
                    value={newZoneSoil}
                    onChange={(e) => setNewZoneSoil(e.target.value)}
                    placeholder="Ex : Frais, Drainé, Acide..."
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingZone(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2d5a3c] text-white text-xs font-bold rounded-lg hover:bg-[#244833]"
                >
                  Enregistrer la zone
                </button>
              </div>
            </form>
          )}

          {/* Zones list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zones.map((zone) => {
              const zonePlants = plants.filter(p => p.zoneId === zone.id);

              return (
                <div
                  key={zone.id}
                  className="bg-white p-5 rounded-3xl border border-[#e5dfd3] shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full shadow-2xs"
                          style={{ backgroundColor: zone.color }}
                        />
                        <h4 className="font-bold text-base text-stone-900">{zone.name}</h4>
                      </div>
                      <p className="text-xs text-stone-500">
                        {zone.exposure} • {zone.soilType}
                      </p>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      {zonePlants.length} plante{zonePlants.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {zone.description && (
                    <p className="text-xs text-stone-600 bg-[#fbf9f4] p-2.5 rounded-xl border border-stone-100">
                      {zone.description}
                    </p>
                  )}

                  {/* Plants inside this zone */}
                  <div className="pt-2">
                    <h5 className="text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Espèces implantées dans ce parterre :
                    </h5>
                    {zonePlants.length === 0 ? (
                      <p className="text-xs text-stone-400 italic">Aucune plante pour l'instant dans cette zone.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {zonePlants.map((plant) => (
                          <button
                            key={plant.id}
                            onClick={() => onSelectPlant(plant)}
                            className="text-xs bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 border border-stone-200 text-stone-700 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: plant.botanicalData.flowerColorHex }}
                            />
                            <span>{plant.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
