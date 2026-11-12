import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Comprehensive plant lookup endpoint with multiple suggestions and photoUrl
app.post('/api/plant-lookup', async (req: Request, res: Response) => {
  try {
    const { plantName } = req.body;

    if (!plantName || typeof plantName !== 'string' || plantName.trim().length === 0) {
      return res.status(400).json({ error: 'Le nom de la plante est requis.' });
    }

    const query = plantName.trim();

    const prompt = `Tu es un éminent botaniste et paysagiste spécialisé exclusivement dans les jardins d'ornement (arbres, arbustes, fleurs vivaces, bulbes, plantes grimpantes, graminées ornementales).
Recherche et fournis une liste de 3 à 5 suggestions ou variétés exactes (cultivars) pertinentes pour la plante ou le groupe recherché : "${query}".

Pour chaque suggestion, fournis :
- botanicalName: Nom botanique latin complet valide avec le genre, l'espèce et le cultivar ou la variété exacte.
- commonName: Nom commun en français.
- cultivar: Nom de cultivar ou variété.
- family: Famille botanique latine.
- category: "Arbre", "Arbuste", "Fleur vivace", "Bulbe", "Plante grimpante" ou "Graminée".
- heightM: Hauteur adulte en mètres (nombre).
- spreadM: Envergure adulte en mètres (nombre).
- growthRate: "Lente", "Moyenne" ou "Rapide".
- foliageType: "Caduc", "Persistant", "Semi-persistant" ou "Marcescent".
- foliageDescription: Description des feuilles et teintes.
- autumnColorHex: Code hexadécimal couleur automnale, ex #d9532f.
- bloomMonths: Tableau des numéros de mois de floraison (1 à 12).
- flowerColorName: Nom poétique de la couleur de floraison.
- flowerColorHex: Code hexadécimal de la fleur, ex #f48fb1.
- flowerSecondaryColorHex: Code hex secondaire (optionnel).
- fragrance: "Inexistant", "Léger", "Moyen", "Intense et envoûtant".
- exposure: "Plein soleil", "Mi-ombre", "Ombre" ou "Soleil à mi-ombre".
- soilType: Type de sol idéal.
- soilMoisture: "Faible", "Modéré" ou "Abondant".
- hardinessZone: Rusticité, ex: Zone 6 (-20°C).
- description: Présentation paysagère et esthétique.
- photoUrl: URL d'une photo représentative de haute qualité (utilise une photo Unsplash d'illustration horticole, ex: https://images.unsplash.com/photo-585320806297-9794b3e4eeae ou similaire).
- tasks: Liste des soins et gestes d'entretien répartis sur l'année (month, type, title, instruction, urgency).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  botanicalName: { type: Type.STRING },
                  commonName: { type: Type.STRING },
                  cultivar: { type: Type.STRING },
                  family: { type: Type.STRING },
                  category: { type: Type.STRING },
                  heightM: { type: Type.NUMBER },
                  spreadM: { type: Type.NUMBER },
                  growthRate: { type: Type.STRING },
                  foliageType: { type: Type.STRING },
                  foliageDescription: { type: Type.STRING },
                  autumnColorHex: { type: Type.STRING },
                  bloomMonths: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                  flowerColorName: { type: Type.STRING },
                  flowerColorHex: { type: Type.STRING },
                  flowerSecondaryColorHex: { type: Type.STRING },
                  fragrance: { type: Type.STRING },
                  exposure: { type: Type.STRING },
                  soilType: { type: Type.STRING },
                  soilMoisture: { type: Type.STRING },
                  hardinessZone: { type: Type.STRING },
                  description: { type: Type.STRING },
                  photoUrl: { type: Type.STRING },
                  tasks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        month: { type: Type.INTEGER },
                        type: { type: Type.STRING },
                        title: { type: Type.STRING },
                        instruction: { type: Type.STRING },
                        urgency: { type: Type.STRING }
                      },
                      required: ["month", "type", "title", "instruction", "urgency"]
                    }
                  }
                },
                required: [
                  "botanicalName", "commonName", "category", "heightM", "spreadM",
                  "foliageType", "bloomMonths", "flowerColorName", "flowerColorHex",
                  "exposure", "soilType", "hardinessZone", "description", "tasks"
                ]
              }
            }
          },
          required: ["suggestions"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Réponse vide du service de données botaniques');
    }

    const data = JSON.parse(text);
    return res.json({ success: true, suggestions: data.suggestions || [] });

  } catch (error: any) {
    console.error('Error during botanical lookup:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la récupération des données botaniques',
      details: error?.message || 'Erreur inconnue'
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: "Mon Jardin d'Ornement API" });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 Mon Jardin d'Ornement running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
