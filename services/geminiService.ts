
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types.ts";

export const analyzeBudget = async (transactions: Transaction[], profile?: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const studioInfo = profile ? `Lo studio si chiama "${profile.studioName}" ed è specializzato in ${profile.specialization}.` : "";

  const prompt = `
    Sei un consulente finanziario senior specializzato nella gestione di studi medici e poliambulatori.
    Analizza i dati transazionali sottostanti e il profilo dello studio. 
    ${studioInfo}

    Fornisci un'analisi strategica composta da 4-5 "insights" che aiutino il medico a:
    1. Ottimizzare i flussi di cassa.
    2. Identificare categorie di spesa eccessive.
    3. Suggerire aree di investimento (es. nuove tecnologie, marketing).
    4. Valutare la marginalità basata sulle categorie di entrata.

    Formatta la risposta ESCLUSIVAMENTE come un array JSON di oggetti con questa struttura:
    {
      "title": "Titolo breve dell'insight",
      "content": "Spiegazione dettagliata e consiglio pratico",
      "type": "success" | "warning" | "info"
    }

    Dati transazionali (ultimi movimenti):
    ${JSON.stringify(transactions.slice(0, 20))}
  `;

  try {
    const response = await ai.models.generateContent({
      // Use gemini-3-pro-preview for complex reasoning tasks
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['success', 'warning', 'info'] }
            },
            required: ['title', 'content', 'type']
          }
        }
      }
    });

    // Access .text property directly (not as a method)
    const jsonStr = response.text || '[]';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      {
        title: "Analisi momentaneamente non disponibile",
        content: "L'intelligenza artificiale non è riuscita a processare i dati. Verifica la tua chiave API o riprova tra pochi istanti.",
        type: "info"
      }
    ];
  }
};
