export type PlantCategory = 
  | 'Arbre' 
  | 'Arbuste' 
  | 'Fleur vivace' 
  | 'Bulbe' 
  | 'Plante grimpante' 
  | 'Graminée';

export type FoliageType = 'Caduc' | 'Persistant' | 'Semi-persistant' | 'Marcescent';

export type Exposure = 'Plein soleil' | 'Mi-ombre' | 'Ombre' | 'Soleil à mi-ombre';

export type TaskType = 
  | 'taille' 
  | 'arrosage' 
  | 'paillage' 
  | 'fertilisation' 
  | 'nettoyage' 
  | 'plantation' 
  | 'hivernage';

export interface PlantTask {
  month: number; // 1 to 12
  type: TaskType;
  title: string;
  instruction: string;
  urgency: 'conseillé' | 'important' | 'vital';
}

export interface BotanicalPlantData {
  botanicalName: string;
  commonName: string;
  cultivar?: string;
  family?: string;
  category: PlantCategory;
  heightM: number;
  spreadM: number;
  growthRate?: string;
  foliageType: FoliageType;
  foliageDescription?: string;
  autumnColorHex?: string;
  bloomMonths: number[]; // e.g. [5, 6, 7]
  flowerColorName: string;
  flowerColorHex: string;
  flowerSecondaryColorHex?: string;
  fragrance?: string;
  exposure: Exposure | string;
  soilType: string;
  soilMoisture?: string;
  hardinessZone: string;
  description: string;
  photoUrl?: string;
  tasks: PlantTask[];
}

export type PlantSpreadShape = 'oval' | 'rect';

export interface GardenPlant {
  id: string;
  name: string; // Nom usuel complet
  simpleName: string; // Nom simple défini manuellement ou par défaut, affiché sur le plan et l'overview
  botanicalData: BotanicalPlantData;
  plantedDate: string; // e.g. "2023-11-01"
  position: { x: number; y: number }; // in canvas meters (0 to widthMeters, 0 to heightMeters)
  spreadShape: PlantSpreadShape; // 'oval' | 'rect'
  currentSpreadWidth: number; // envergure actuelle en mètres (largeur)
  currentSpreadHeight: number; // envergure actuelle en mètres (hauteur / profondeur)
  rotation?: number; // rotation en degrés
  zoneId: string;
  quantity: number;
  customNotes?: string; // commentaire libre du jardinier
  photoUrl?: string;
  hidden?: boolean; // si masqué, n'apparaît plus sur le plan et ne peut plus y être sélectionné
  locked?: boolean; // si verrouillé, ne peut plus être déplacé ni sélectionné sur le plan
  customColor?: string; // couleur personnalisée du point sur le plan
}

export interface GardenZone {
  id: string;
  name: string;
  color: string;
  exposure: Exposure;
  soilType: string;
  description?: string;
}

export type StructureType = 
  | 'building'   // Bâtiment (rectangle + toiture à 2 pans par défaut)
  | 'courtyard'  // Cour (rectangle + zone pavée par défaut)
  | 'path'       // Chemin (rectangle + gravier par défaut)
  | 'pond'       // Mare (rond/ovale + eau par défaut)
  | 'wall'       // Mur (rectangle + zone pavée par défaut)
  | 'bed';       // Parterre (rectangle + terre par défaut)

export type StructureShape = 'rect' | 'oval' | 'triangle';

export type StructureTexture = 
  | 'roof_slate'  // Toiture ardoise
  | 'roof_tile'   // Toiture tuile
  | 'roof_glass'  // Toiture en verre
  | 'grass'       // Herbe
  | 'paving'      // Zone pavée
  | 'soil'        // Zone en terre
  | 'gravel'      // Zone en gravier
  | 'water';      // Eau

export interface GardenStructure {
  id: string;
  type: StructureType;
  name: string;
  shape: StructureShape;
  x: number; // meters
  y: number; // meters
  width: number; // meters
  height: number; // meters
  rotation: number; // degrees (0 to 360)
  texture: StructureTexture;
  ridgePositionPercent?: number; // position du faîtage de 0 à 100% (défaut 50%)
  color?: string;
  strokeColor?: string;
  zoneId?: string;
  hidden?: boolean; // si masqué, n'apparaît plus sur le plan et ne peut plus y être sélectionné
  locked?: boolean; // si verrouillé, ne peut plus être déplacé ni sélectionné sur le plan
}

export interface GardenTaskInstance {
  id: string;
  plantId: string;
  plantName: string;
  category: PlantCategory;
  month: number;
  type: TaskType;
  title: string;
  instruction: string;
  urgency: 'conseillé' | 'important' | 'vital';
  completed: boolean;
  completedAt?: string;
}

export interface GardenSettings {
  gardenName: string;
  widthMeters: number;
  heightMeters: number;
  locationName?: string;
  scalePixelsPerMeter: number;
}
