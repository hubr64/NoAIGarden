import React, { useState } from 'react';
import { GardenPlant, GardenZone, PlantCategory } from '../types/garden';
import { MONTH_NAMES_FR, MONTH_SEASONS } from '../data/defaultGarden';
import { Sparkles, Calendar, Filter, Droplet, Sun, Eye, ChevronRight } from 'lucide-react';

interface SeasonalCalendarProps {
  plants: GardenPlant[];
  zones: GardenZone[];
  selectedMonth: number;
  onSelectMonth: (month: number) => void;
  onSelectPlant: (plant: GardenPlant) => void;
}

export const SeasonalCalendar: React.FC<SeasonalCalendarProps> = ({
  plants,
  zones,
  selectedMonth,
  onSelectMonth,
  onSelectPlant,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PlantCategory | 'Tous'>('Tous');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter plants
  const filteredPlants = plants.filter((plant) => {
    const b = plant.botanicalData;
    if (selectedCategory !== 'Tous' && b.category !== selectedCategory) return false;
    if (selectedZoneFilter !== 'all' && plant.zoneId !== selectedZoneFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = plant.name.toLowerCase().includes(q);
      const matchLatin = b.botanicalName.toLowerCase().includes(q);
      if (!matchName && !matchLatin) return false;
    }
    return true;
  });

  // Plants blooming in the currently selected month
  const bloomingThisMonth = plants.filter((plant) =>
    plant.botanicalData.bloomMonths.includes(selectedMonth)
  );

  // Plants with autumn colors this month (Oct-Nov)
  const autumnFoliageThisMonth = [9, 10, 11].includes(selectedMonth)
    ? plants.filter((plant) => plant.botanicalData.foliageType === 'Caduc' && plant.botanicalData.autumnColorHex)
    : [];

  const currentMonthInfo = MONTH_SEASONS[selectedMonth - 1];

  // Distinct floral colors blooming this month
  const monthlyColorPalette = Array.from(
    new Set(bloomingThisMonth.map((p) => p.botanicalData.flowerColorHex).filter(Boolean))
  );

  return (
    <div className="space-y-6">
      {/* Month Selector Bar & Seasonal Highlight */}
      <div className="bg-gradient-to-r from-[#244833] via-[#2d5a3c] to-[#1e3c28] text-white p-5 rounded-3xl shadow-md border border-emerald-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{currentMonthInfo.icon}</span>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-200">
                Saison : {currentMonthInfo.season}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{currentMonthInfo.name} au jardin</span>
              <span className="text-sm font-normal text-emerald-200/90 bg-emerald-800/60 px-3 py-0.5 rounded-full border border-emerald-700/50">
                {bloomingThisMonth.length} espèce{bloomingThisMonth.length > 1 ? 's' : ''} en fleur
              </span>
            </h2>
          </div>

          {/* Color palette preview for the month */}
          {monthlyColorPalette.length > 0 && (
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-white/10">
              <span className="text-xs text-emerald-200 font-medium">Nuancier floral du mois :</span>
              <div className="flex -space-x-1.5 items-center">
                {monthlyColorPalette.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-5 h-5 rounded-full border-2 border-white shadow-xs"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 12-Month Interactive Ribbon */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 bg-black/25 p-2 rounded-2xl border border-white/10">
          {MONTH_SEASONS.map((m) => {
            const isSelected = selectedMonth === m.month;
            const count = plants.filter((p) => p.botanicalData.bloomMonths.includes(m.month)).length;

            return (
              <button
                key={m.month}
                onClick={() => onSelectMonth(m.month)}
                className={`py-2 px-1 text-center rounded-xl transition-all flex flex-col items-center gap-0.5 ${
                  isSelected
                    ? 'bg-white text-[#244833] font-bold shadow-lg scale-105'
                    : 'text-emerald-100 hover:bg-white/10'
                }`}
              >
                <span className="text-xs">{m.icon}</span>
                <span className="text-[11px] uppercase tracking-wider">{m.name.slice(0, 3)}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected
                      ? 'bg-emerald-100 text-[#244833]'
                      : count > 0
                      ? 'bg-emerald-800/80 text-emerald-200'
                      : 'text-emerald-400/50'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* "En ce moment au jardin" Spotlight Cards */}
      {bloomingThisMonth.length > 0 && (
        <div className="bg-[#fcfaf7] border border-[#e5dfd3] p-5 rounded-3xl shadow-xs">
          <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span>En pleine floraison ce mois-ci ({currentMonthInfo.name})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bloomingThisMonth.map((plant) => {
              const b = plant.botanicalData;
              return (
                <div
                  key={plant.id}
                  onClick={() => onSelectPlant(plant)}
                  className="bg-white p-3.5 rounded-2xl border border-[#e8e0d2] hover:border-emerald-600/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-pink-100 text-pink-800">
                        {b.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-2xs"
                          style={{ backgroundColor: b.flowerColorHex }}
                        />
                        <span className="text-[11px] text-stone-500">{b.flowerColorName}</span>
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-stone-900 group-hover:text-emerald-800 transition-colors">
                      {plant.name}
                    </h4>
                    <p className="text-[11px] font-serif italic text-stone-500 mb-2">
                      {b.botanicalName}
                    </p>

                    <p className="text-xs text-stone-600 line-clamp-2 bg-[#fdfbf8] p-2 rounded-lg border border-stone-100">
                      {b.description}
                    </p>
                  </div>

                  <div className="pt-2.5 mt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span>Ø {b.spreadM}m • H: {b.heightM}m</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-0.5">
                      Voir sur le plan <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Autumn foliage highlight if relevant */}
      {autumnFoliageThisMonth.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍁</span>
            <div>
              <h4 className="font-bold text-amber-950 text-xs">Spectacle des feuillages d'automne</h4>
              <p className="text-xs text-amber-800">
                {autumnFoliageThisMonth.map((p) => p.name).join(', ')} offrent des teintes de feuillage exceptionnelles ce mois-ci.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Timeline Grid */}
      <div className="bg-white border border-[#e5dfd3] rounded-3xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2d5a3c]" />
              <span>Calendrier annuel des floraisons</span>
            </h3>
            <p className="text-xs text-stone-500">
              Frise chronologique mois par mois des fleurs, feuillages et repos végétatif
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="text-xs bg-[#f8f6f0] border border-[#dcd4c6] rounded-xl px-3 py-1.5 font-medium text-stone-700"
            >
              <option value="Tous">Toutes catégories</option>
              <option value="Arbre">Arbres</option>
              <option value="Arbuste">Arbustes</option>
              <option value="Fleur vivace">Fleurs vivaces</option>
              <option value="Bulbe">Bulbes</option>
              <option value="Plante grimpante">Plantes grimpantes</option>
              <option value="Graminée">Graminées</option>
            </select>

            <select
              value={selectedZoneFilter}
              onChange={(e) => setSelectedZoneFilter(e.target.value)}
              className="text-xs bg-[#f8f6f0] border border-[#dcd4c6] rounded-xl px-3 py-1.5 font-medium text-stone-700"
            >
              <option value="all">Tous les parterres</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* The Gantt Timeline Matrix */}
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Header row with months */}
            <div className="grid grid-cols-12 gap-1 pb-2 border-b border-stone-200 text-center font-bold text-xs text-stone-600">
              <div className="col-span-4 text-left pl-2">Plante &amp; Espèce botanique</div>
              <div className="col-span-8 grid grid-cols-12 gap-0.5">
                {MONTH_NAMES_FR.map((name, i) => (
                  <div
                    key={name}
                    className={`py-1 text-[11px] rounded ${
                      selectedMonth === i + 1 ? 'bg-[#2d5a3c] text-white font-bold' : ''
                    }`}
                  >
                    {name.slice(0, 3)}
                  </div>
                ))}
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-stone-100">
              {filteredPlants.map((plant) => {
                const b = plant.botanicalData;

                return (
                  <div
                    key={plant.id}
                    onClick={() => onSelectPlant(plant)}
                    className="grid grid-cols-12 gap-1 py-2.5 items-center hover:bg-emerald-50/40 rounded-xl px-1 transition-colors cursor-pointer group"
                  >
                    {/* Plant title & botanical info */}
                    <div className="col-span-4 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-stone-700 uppercase">
                          {b.category}
                        </span>
                        <h4 className="font-bold text-xs text-stone-800 group-hover:text-emerald-800 truncate">
                          {plant.name}
                        </h4>
                      </div>
                      <p className="text-[10px] font-serif italic text-stone-500 truncate">
                        {b.botanicalName}
                      </p>
                    </div>

                    {/* 12 months bar */}
                    <div className="col-span-8 grid grid-cols-12 gap-0.5 h-6 items-center">
                      {Array.from({ length: 12 }).map((_, idx) => {
                        const monthNum = idx + 1;
                        const isBlooming = b.bloomMonths.includes(monthNum);
                        const isCurrent = selectedMonth === monthNum;

                        return (
                          <div
                            key={monthNum}
                            className={`h-5 rounded-md flex items-center justify-center transition-all ${
                              isCurrent ? 'ring-1 ring-emerald-600' : ''
                            }`}
                            style={{
                              backgroundColor: isBlooming
                                ? b.flowerColorHex
                                : '#f5f2eb',
                              opacity: isBlooming ? 1 : 0.45,
                            }}
                            title={`${plant.name} - ${MONTH_NAMES_FR[idx]} : ${
                              isBlooming ? `Floraison (${b.flowerColorName})` : 'Repos'
                            }`}
                          >
                            {isBlooming && (
                              <span className="text-[10px] drop-shadow-xs">🌸</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
