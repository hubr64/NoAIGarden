import React, { useState } from 'react';
import { GardenStructure, StructureShape, StructureTexture, StructureType } from '../types/garden';
import { Home, Grid, Footprints, Droplets, Shield, Flower, Sparkles, Check, ArrowRight } from 'lucide-react';

interface AddStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStructure: (structure: Omit<GardenStructure, 'id'>) => void;
  initialPosition?: { x: number; y: number };
}

interface StructureOption {
  type: StructureType;
  title: string;
  subtitle: string;
  defaultName: string;
  defaultShape: StructureShape;
  defaultTexture: StructureTexture;
  defaultWidth: number;
  defaultHeight: number;
  badge: string;
  icon: React.ReactNode;
  svgPreview: React.ReactNode;
}

export const AddStructureModal: React.FC<AddStructureModalProps> = ({
  isOpen,
  onClose,
  onAddStructure,
  initialPosition = { x: 10, y: 8 },
}) => {
  const [selectedType, setSelectedType] = useState<StructureType | null>(null);
  const [name, setName] = useState<string>('');
  const [width, setWidth] = useState<number>(5);
  const [height, setHeight] = useState<number>(4);
  const [shape, setShape] = useState<StructureShape>('rect');
  const [texture, setTexture] = useState<StructureTexture>('roof_slate');
  const [ridgePositionPercent, setRidgePositionPercent] = useState<number>(50);

  if (!isOpen) return null;

  const options: StructureOption[] = [
    {
      type: 'building',
      title: 'Bâtiment',
      subtitle: 'Maison, abri de jardin, serre, tonnelle couverte',
      defaultName: 'Nouveau Bâtiment',
      defaultShape: 'rect',
      defaultTexture: 'roof_slate',
      defaultWidth: 6,
      defaultHeight: 5,
      badge: 'Toiture ardoise',
      icon: <Home className="w-5 h-5 text-stone-700" />,
      svgPreview: (
        <svg viewBox="0 0 120 70" className="w-full h-20 rounded-xl overflow-hidden shadow-2xs border border-stone-300">
          <rect width="120" height="70" fill="#242a30" />
          {/* Shingles pattern */}
          <rect x="0" y="5" width="28" height="15" rx="1" fill="#38424b" stroke="#181d22" strokeWidth="1" />
          <rect x="30" y="5" width="28" height="15" rx="1" fill="#303840" stroke="#181d22" strokeWidth="1" />
          <rect x="60" y="5" width="28" height="15" rx="1" fill="#38424b" stroke="#181d22" strokeWidth="1" />
          <rect x="90" y="5" width="28" height="15" rx="1" fill="#303840" stroke="#181d22" strokeWidth="1" />
          <rect x="15" y="22" width="28" height="15" rx="1" fill="#2d353c" stroke="#181d22" strokeWidth="1" />
          <rect x="45" y="22" width="28" height="15" rx="1" fill="#363f47" stroke="#181d22" strokeWidth="1" />
          <rect x="75" y="22" width="28" height="15" rx="1" fill="#2d353c" stroke="#181d22" strokeWidth="1" />
          <rect x="0" y="39" width="28" height="15" rx="1" fill="#38424b" stroke="#181d22" strokeWidth="1" />
          <rect x="30" y="39" width="28" height="15" rx="1" fill="#303840" stroke="#181d22" strokeWidth="1" />
          <rect x="60" y="39" width="28" height="15" rx="1" fill="#38424b" stroke="#181d22" strokeWidth="1" />
          <rect x="90" y="39" width="28" height="15" rx="1" fill="#303840" stroke="#181d22" strokeWidth="1" />
          <text x="60" y="62" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="bold">Toiture ardoise carrelée</text>
        </svg>
      )
    },
    {
      type: 'courtyard',
      title: 'Cour',
      subtitle: 'Cour intérieure pavée, terrasse en dalles, patio',
      defaultName: 'Cour pavée',
      defaultShape: 'rect',
      defaultTexture: 'paving',
      defaultWidth: 7,
      defaultHeight: 6,
      badge: 'Zone pavée',
      icon: <Grid className="w-5 h-5 text-stone-700" />,
      svgPreview: (
        <svg viewBox="0 0 120 70" className="w-full h-20 rounded-xl overflow-hidden shadow-2xs border border-stone-200">
          <rect width="120" height="70" fill="#e7ded3" />
          <rect x="5" y="8" width="32" height="24" rx="2" fill="#dad0c3" stroke="#b8aa97" strokeWidth="1.5" />
          <rect x="44" y="8" width="32" height="24" rx="2" fill="#dfd6cb" stroke="#b8aa97" strokeWidth="1.5" />
          <rect x="83" y="8" width="32" height="24" rx="2" fill="#dad0c3" stroke="#b8aa97" strokeWidth="1.5" />
          <rect x="24" y="38" width="32" height="24" rx="2" fill="#d5cbbe" stroke="#b8aa97" strokeWidth="1.5" />
          <rect x="63" y="38" width="32" height="24" rx="2" fill="#dad0c3" stroke="#b8aa97" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      type: 'path',
      title: 'Chemin',
      subtitle: 'Allée centrale, sentier gravillonné, passage',
      defaultName: 'Allée en gravier',
      defaultShape: 'rect',
      defaultTexture: 'gravel',
      defaultWidth: 2,
      defaultHeight: 8,
      badge: 'Zone gravier',
      icon: <Footprints className="w-5 h-5 text-amber-800" />,
      svgPreview: (
        <svg viewBox="0 0 120 70" className="w-full h-20 rounded-xl overflow-hidden shadow-2xs border border-amber-200">
          <rect width="120" height="70" fill="#ebe4d8" />
          <circle cx="20" cy="25" r="4" fill="#b5a796" />
          <circle cx="45" cy="18" r="3.5" fill="#9e907e" />
          <circle cx="75" cy="35" r="5" fill="#c4b7a7" />
          <circle cx="95" cy="20" r="3" fill="#a39583" />
          <circle cx="35" cy="50" r="4.5" fill="#b0a290" />
          <circle cx="85" cy="52" r="4" fill="#948675" />
        </svg>
      )
    },
    {
      type: 'pond',
      title: 'Mare',
      subtitle: 'Bassin aquatique, nénuphars, étang naturel',
      defaultName: 'Mare aquatique',
      defaultShape: 'oval',
      defaultTexture: 'water',
      defaultWidth: 4.5,
      defaultHeight: 4.5,
      badge: 'Eau naturelle',
      icon: <Droplets className="w-5 h-5 text-sky-600" />,
      svgPreview: (
        <svg viewBox="0 0 120 70" className="w-full h-20 rounded-xl overflow-hidden shadow-2xs border border-sky-200">
          <rect width="120" height="70" fill="#f0f8ff" />
          <ellipse cx="60" cy="35" rx="50" ry="28" fill="#9dd6ef" stroke="#60b5de" strokeWidth="2" />
          <path d="M25 32 Q42 26 60 32 T95 32" fill="none" stroke="#60b5de" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M35 44 Q50 38 70 44 T100 44" fill="none" stroke="#60b5de" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          <ellipse cx="45" cy="26" rx="5" ry="3" fill="#81c784" />
          <circle cx="45" cy="25" r="1.5" fill="#f48fb1" />
        </svg>
      )
    },
    {
      type: 'wall',
      title: 'Mur',
      subtitle: 'Muret en pierres, muret de soutènement, clôture',
      defaultName: 'Muret en pierre',
      defaultShape: 'rect',
      defaultTexture: 'paving',
      defaultWidth: 8,
      defaultHeight: 0.8,
      badge: 'Pierre appareillée',
      icon: <Shield className="w-5 h-5 text-stone-700" />,
      svgPreview: (
        <svg viewBox="0 0 120 70" className="w-full h-20 rounded-xl overflow-hidden shadow-2xs border border-stone-200">
          <rect width="120" height="70" fill="#f5f0eb" />
          <rect x="10" y="24" width="100" height="22" rx="2" fill="#dad0c3" stroke="#8d7b68" strokeWidth="2" />
          <line x1="35" y1="24" x2="35" y2="46" stroke="#8d7b68" strokeWidth="1.5" />
          <line x1="60" y1="24" x2="60" y2="46" stroke="#8d7b68" strokeWidth="1.5" />
          <line x1="85" y1="24" x2="85" y2="46" stroke="#8d7b68" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      type: 'bed',
      title: 'Parterre',
      subtitle: 'Massif de fleurs, plate-bande, zone de terre',
      defaultName: 'Parterre de fleurs',
      defaultShape: 'rect',
      defaultTexture: 'soil',
      defaultWidth: 5,
      defaultHeight: 3,
      badge: 'Zone en terre',
      icon: <Flower className="w-5 h-5 text-amber-900" />,
      svgPreview: (
        <svg viewBox="0 0 120 70" className="w-full h-20 rounded-xl overflow-hidden shadow-2xs border border-amber-300">
          <rect width="120" height="70" fill="#a97c50" />
          <ellipse cx="30" cy="25" rx="12" ry="7" fill="#785028" opacity="0.6" />
          <ellipse cx="80" cy="45" rx="15" ry="8" fill="#6d4824" opacity="0.6" />
          <circle cx="50" cy="30" r="3" fill="#f48fb1" />
          <circle cx="85" cy="22" r="3" fill="#ce93d8" />
          <circle cx="35" cy="48" r="3" fill="#fff59d" />
        </svg>
      )
    }
  ];

  const handleSelectOption = (opt: StructureOption) => {
    setSelectedType(opt.type);
    setName(opt.defaultName);
    setWidth(opt.defaultWidth);
    setHeight(opt.defaultHeight);
    setShape(opt.defaultShape);
    setTexture(opt.defaultTexture);
    setRidgePositionPercent(50);
  };

  const handleConfirm = () => {
    if (!selectedType) return;

    onAddStructure({
      type: selectedType,
      name: name.trim() || 'Aménagement',
      shape,
      texture,
      ridgePositionPercent,
      width,
      height,
      rotation: 0,
      x: initialPosition.x,
      y: initialPosition.y,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#fbf9f4] border border-[#e5dfd3] rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#244833] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-700/50 rounded-xl">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-50">Ajouter un aménagement au jardin</h2>
              <p className="text-xs text-emerald-200/80">
                Choisissez le type d'aménagement à implanter sur votre plan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 1: Type Selection Grid */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
              1. Sélectionnez le type d'aménagement :
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {options.map((opt) => {
                const isSelected = selectedType === opt.type;

                return (
                  <div
                    key={opt.type}
                    onClick={() => handleSelectOption(opt)}
                    className={`cursor-pointer rounded-2xl p-3.5 border-2 transition-all flex flex-col justify-between group ${
                      isSelected
                        ? 'border-[#2d5a3c] bg-white shadow-md ring-2 ring-emerald-500/20'
                        : 'border-[#e5dfd3] bg-white/70 hover:bg-white hover:border-emerald-600/40'
                    }`}
                  >
                    <div>
                      {/* Visual Preview Banner */}
                      <div className="mb-3 overflow-hidden rounded-xl">
                        {opt.svgPreview}
                      </div>

                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {opt.icon}
                          <h3 className="font-bold text-sm text-stone-900 group-hover:text-emerald-800 transition-colors">
                            {opt.title}
                          </h3>
                        </div>
                        {isSelected && (
                          <span className="bg-[#2d5a3c] text-white rounded-full p-0.5">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-stone-500 leading-snug line-clamp-2">
                        {opt.subtitle}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px]">
                      <span className="text-stone-400 font-mono">
                        Défaut : {opt.defaultWidth}m × {opt.defaultHeight}m
                      </span>
                      <span className="bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded-md text-[10px]">
                        {opt.badge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Configuration panel if selected */}
          {selectedType && (
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-600/30 shadow-xs space-y-4 animate-in fade-in duration-200">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>2. Personnaliser les caractéristiques</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-stone-600 mb-1 font-medium">Nom de l'aménagement</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    placeholder="Nom"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1 font-medium">Forme géométrique</label>
                  <select
                    value={shape}
                    onChange={(e) => setShape(e.target.value as StructureShape)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                  >
                    <option value="rect">Rectangle</option>
                    <option value="oval">Ovale / Rond</option>
                    <option value="triangle">Triangle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 mb-1 font-medium">Texture du sol / toiture</label>
                  <select
                    value={texture}
                    onChange={(e) => setTexture(e.target.value as StructureTexture)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
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
                  <div className="col-span-1 sm:col-span-2 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200">
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <label className="font-semibold text-stone-700">Position du faîtage (ligne de toiture)</label>
                      <span className="font-mono text-[#2d5a3c] font-bold">{ridgePositionPercent}%</span>
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
                    <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-0.5">
                      <span>0% (Gauche)</span>
                      <span>50% (Centre)</span>
                      <span>100% (Droite)</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-stone-600 mb-1 font-medium">Largeur (mètres)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="30"
                    value={width}
                    onChange={(e) => setWidth(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1 font-medium">Longueur / Hauteur (mètres)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="20"
                    value={height}
                    onChange={(e) => setHeight(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f5efe4] px-6 py-3.5 border-t border-[#e2d8c7] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedType}
            className="px-5 py-2.5 bg-[#2d5a3c] text-white text-xs font-bold rounded-xl hover:bg-[#244833] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
            <span>Placer cet aménagement sur le plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
