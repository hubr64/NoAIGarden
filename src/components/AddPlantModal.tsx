import React, { useState } from 'react';
import { BotanicalPlantData, GardenPlant, GardenZone, PlantCategory, PlantSpreadShape } from '../types/garden';
import { BOTANICAL_PRESETS } from '../data/defaultGarden';
import { Sparkles, Search, Loader2, CheckCircle2, AlertCircle, MapPin, Palette, Calendar } from 'lucide-react';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlant: (plant: Omit<GardenPlant, 'id'>) => void;
  initialPosition?: { x: number; y: number };
  zones: GardenZone[];
}

export const AddPlantModal: React.FC<AddPlantModalProps> = ({
  isOpen,
  onClose,
  onAddPlant,
  initialPosition = { x: 15, y: 10 },
  zones,
}) => {
  const [plantQuery, setPlantQuery] = useState<string>('');
  const [searchAttempted, setSearchAttempted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lookedUpData, setLookedUpData] = useState<BotanicalPlantData | null>(null);
  const [suggestions, setSuggestions] = useState<BotanicalPlantData[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable fields after lookup
  const [simpleName, setSimpleName] = useState<string>('');
  const [customColor, setCustomColor] = useState<string>('#2d5a3c');
  const [plantedDate, setPlantedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [posX, setPosX] = useState<number>(initialPosition.x);
  const [posY, setPosY] = useState<number>(initialPosition.y);
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || '');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [spreadShape, setSpreadShape] = useState<PlantSpreadShape>('oval');
  const [spreadWidth, setSpreadWidth] = useState<number>(1.5);

  if (!isOpen) return null;

  const applyBotanicalData = (data: BotanicalPlantData) => {
    setLookedUpData(data);
    setSuggestions([]);
    setErrorMsg(null);
    setSimpleName(data.commonName);
    setCustomColor(data.flowerColorHex || data.autumnColorHex || '#2d5a3c');
    setSpreadWidth(data.spreadM);
  };

  const handleLookup = async (nameToSearch?: string) => {
    const targetName = (nameToSearch || plantQuery).trim();
    if (!targetName) return;

    setSearchAttempted(true);
    setIsLoading(true);
    setErrorMsg(null);
    setLookedUpData(null);
    setSuggestions([]);

    const queryLower = targetName.toLowerCase();

    // 1. Instant local preset matching (can match multiple)
    const matchingPresets = BOTANICAL_PRESETS.filter(
      p => p.commonName.toLowerCase().includes(queryLower) ||
           p.botanicalName.toLowerCase().includes(queryLower) ||
           queryLower.includes(p.commonName.toLowerCase()) ||
           queryLower.includes(p.botanicalName.split(' ')[0].toLowerCase())
    );

    if (matchingPresets.length > 0) {
      if (matchingPresets.length === 1) {
        applyBotanicalData(matchingPresets[0]);
      } else {
        setSuggestions(matchingPresets);
      }
      setIsLoading(false);
      return;
    }

    // 2. Try API lookup for multiple suggestions
    try {
      const response = await fetch('/api/plant-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantName: targetName }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.suggestions && data.suggestions.length > 0) {
        if (data.suggestions.length === 1) {
          applyBotanicalData(data.suggestions[0]);
        } else {
          setSuggestions(data.suggestions);
        }
      } else {
        setErrorMsg("Aucune plante trouvée pour cette recherche. Veuillez réessayer avec un autre nom ou vérifier l'orthographe.");
      }
    } catch {
      setErrorMsg("Erreur lors de la recherche de la plante. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: BotanicalPlantData) => {
    applyBotanicalData(suggestion);
  };

  const handleConfirmAdd = () => {
    if (!lookedUpData) return;

    onAddPlant({
      name: lookedUpData.commonName,
      simpleName: simpleName.trim() || lookedUpData.commonName,
      customColor,
      botanicalData: lookedUpData,
      plantedDate,
      position: { x: posX, y: posY },
      spreadShape,
      currentSpreadWidth: Math.max(0.2, spreadWidth),
      currentSpreadHeight: Math.max(0.2, spreadWidth),
      rotation: 0,
      zoneId: selectedZoneId,
      quantity: 1,
      customNotes,
      photoUrl: lookedUpData.photoUrl,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#fbf9f4] border border-[#e5dfd3] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#244833] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-700/50 rounded-xl">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-50">Ajouter une plante d'ornement</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">

          {/* Search Input & Identifier Button */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Espèce ou variété recherchée *
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={plantQuery}
                  onChange={(e) => setPlantQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleLookup();
                  }}
                  placeholder="Ex : Hortensia, Bambou, Lierre, Cognassier du Japon..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#d6cec0] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2d5a3c]"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
              <button
                type="button"
                onClick={() => handleLookup()}
                disabled={isLoading || !plantQuery.trim()}
                className="px-5 py-2.5 bg-[#2d5a3c] text-white text-xs font-bold rounded-xl hover:bg-[#244833] transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Identification...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span>Identifier</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Inspiration Pills */}
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-stone-500">Exemples :</span>
              {BOTANICAL_PRESETS.slice(0, 4).map((preset) => (
                <button
                  key={preset.botanicalName}
                  type="button"
                  onClick={() => {
                    setPlantQuery(preset.commonName);
                    handleLookup(preset.commonName);
                  }}
                  className="text-[10px] bg-white border border-[#e2d8c7] hover:border-[#2d5a3c] text-stone-700 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: preset.flowerColorHex }} />
                  {preset.commonName}
                </button>
              ))}
            </div>
          </div>

          {/* Results & Steps */}
          {searchAttempted && (
            <>
              {/* Loading State */}
              {isLoading && (
                <div className="p-6 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#2d5a3c] mx-auto" />
                  <p className="font-semibold text-stone-700 text-xs">Recherche des variétés et données botaniques...</p>
                </div>
              )}

              {/* Error State */}
              {errorMsg && !isLoading && (
                <div className="p-4 bg-red-50 text-red-800 rounded-2xl text-xs flex items-start gap-3 border border-red-200 shadow-xs">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-900 mb-0.5">Plante non trouvée</h4>
                    <p>{errorMsg}</p>
                  </div>
                </div>
              )}

              {/* Multiple Suggestions List */}
              {suggestions.length > 1 && !lookedUpData && !isLoading && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <h4 className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Plusieurs variétés ou plantes correspondent ({suggestions.length}). Choisissez celle qui vous convient :</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="bg-white p-3 rounded-2xl border-2 border-stone-200 hover:border-emerald-600 cursor-pointer transition-all shadow-xs flex flex-col justify-between group"
                      >
                        <div>
                          {suggestion.photoUrl && (
                            <div className="h-28 w-full rounded-xl overflow-hidden mb-2.5 bg-stone-100">
                              <img src={suggestion.photoUrl} alt={suggestion.commonName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                          )}
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 inline-block mb-1">
                            {suggestion.category}
                          </span>
                          <h5 className="font-bold text-xs text-stone-900 group-hover:text-[#2d5a3c] transition-colors">
                            {suggestion.commonName}
                          </h5>
                          <p className="font-serif italic text-[11px] text-stone-500 mt-0.5">
                            {suggestion.botanicalName}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                          <span className="text-stone-500">Envergure : Ø {suggestion.spreadM}m</span>
                          <span className="font-bold text-[#2d5a3c] group-hover:underline flex items-center gap-1">
                            <span>Choisir</span>
                            <span>→</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Found State: Display selected botanical sheet + complementary editable fields */}
              {lookedUpData && !isLoading && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  
                  {/* Verified Botanical Preview Card */}
                  <div className="bg-white p-4 rounded-2xl border-2 border-emerald-600/40 shadow-xs space-y-2.5">
                    {lookedUpData.photoUrl && (
                      <div className="relative h-44 rounded-xl overflow-hidden mb-2 border border-stone-200">
                        <img src={lookedUpData.photoUrl} alt={lookedUpData.commonName} className="w-full h-full object-cover" />
                        {suggestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setLookedUpData(null)}
                            className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white text-[10px] px-2.5 py-1 rounded-lg font-semibold shadow-md"
                          >
                            Changer de variété
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 inline-block mb-0.5">
                          {lookedUpData.category}
                        </span>
                        <h4 className="font-bold text-sm text-stone-900">{lookedUpData.commonName}</h4>
                        <p className="font-serif italic text-[11px] text-emerald-800">{lookedUpData.botanicalName}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Variété sélectionnée</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="bg-stone-50 p-2 rounded-lg">
                        <span className="text-stone-400 block text-[10px]">Feuillage</span>
                        <span className="font-medium text-stone-800">{lookedUpData.foliageType}</span>
                      </div>
                      <div className="bg-stone-50 p-2 rounded-lg">
                        <span className="text-stone-400 block text-[10px]">Floraison</span>
                        <span className="font-medium text-stone-800">{lookedUpData.flowerColorName}</span>
                      </div>
                      <div className="bg-stone-50 p-2 rounded-lg">
                        <span className="text-stone-400 block text-[10px]">Exposition</span>
                        <span className="font-medium text-stone-800">{lookedUpData.exposure}</span>
                      </div>
                      <div className="bg-stone-50 p-2 rounded-lg">
                        <span className="text-stone-400 block text-[10px]">Rusticité</span>
                        <span className="font-medium text-stone-800">{lookedUpData.hardinessZone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Complementary Editable Fields */}
                  <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3">
                    <h4 className="font-bold text-stone-800 text-xs">Informations personnalisées sur le plan</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Simple Name */}
                      <div>
                        <label className="block text-stone-700 font-semibold mb-1">
                          Nom simple sur le plan *
                        </label>
                        <input
                          type="text"
                          required
                          value={simpleName}
                          onChange={(e) => setSimpleName(e.target.value)}
                          placeholder="Ex : Mon Cerisier, Rosier de terrasse..."
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-[#2d5a3c]"
                        />
                      </div>

                      {/* Point Color */}
                      <div>
                        <label className="block text-stone-700 font-semibold mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Palette className="w-3.5 h-3.5 text-[#2d5a3c]" />
                            <span>Couleur du point</span>
                          </span>
                          <span className="text-[10px] text-stone-400">Extraite de la plante</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customColor}
                            onChange={(e) => setCustomColor(e.target.value)}
                            className="w-9 h-8 p-0.5 rounded-lg border border-stone-300 cursor-pointer bg-white shrink-0"
                          />
                          <input
                            type="text"
                            value={customColor}
                            onChange={(e) => setCustomColor(e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shape & Spread */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
                        <label className="block text-stone-600 mb-1 font-medium">
                          Envergure (mètres)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.2"
                          max="20"
                          value={spreadWidth}
                          onChange={(e) => setSpreadWidth(parseFloat(e.target.value) || 0.5)}
                          className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Implantation & Planting Date */}
                  <div className="bg-[#f3ede1] p-3.5 rounded-2xl border border-[#e2d8c7] space-y-3">
                    <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#2d5a3c]" />
                      <span>Implantation &amp; Date de plantation</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-stone-600 mb-1 font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#2d5a3c]" />
                          <span>Date de plantation</span>
                        </label>
                        <input
                          type="date"
                          value={plantedDate}
                          onChange={(e) => setPlantedDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#d6cec0] rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-600 mb-1 font-medium">Position X / Y (m)</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="0.5"
                            value={posX}
                            onChange={(e) => setPosX(parseFloat(e.target.value) || 0)}
                            className="w-1/2 px-2 py-1.5 bg-white border border-[#d6cec0] rounded-lg text-xs"
                            placeholder="X"
                          />
                          <input
                            type="number"
                            step="0.5"
                            value={posY}
                            onChange={(e) => setPosY(parseFloat(e.target.value) || 0)}
                            className="w-1/2 px-2 py-1.5 bg-white border border-[#d6cec0] rounded-lg text-xs"
                            placeholder="Y"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-stone-600 mb-1 font-medium">Zone / Parterre</label>
                        <select
                          value={selectedZoneId}
                          onChange={(e) => setSelectedZoneId(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#d6cec0] rounded-lg text-xs"
                        >
                          {zones.map((zone) => (
                            <option key={zone.id} value={zone.id}>
                              {zone.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-600 mb-1 font-medium">Commentaire libre (optionnel)</label>
                      <input
                        type="text"
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        placeholder="Ex : Bouture, cadeau, sujet remarquable..."
                        className="w-full px-3 py-1.5 bg-white border border-[#d6cec0] rounded-lg text-xs"
                      />
                    </div>
                  </div>

                </div>
              )}
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-[#f5efe4] px-6 py-3.5 border-t border-[#e2d8c7] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
          >
            Annuler
          </button>
          {lookedUpData && (
            <button
              type="button"
              onClick={handleConfirmAdd}
              disabled={!simpleName.trim()}
              className="px-5 py-2.5 bg-[#2d5a3c] text-white text-xs font-bold rounded-xl hover:bg-[#244833] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Planter dans mon jardin</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
