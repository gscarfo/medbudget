
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

export const analyzeBudget = async (transactions: Transaction[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Agisci come un consulente finanziario esperto per studi medici. 
    Analizza i seguenti dati finanziari dell'ultimo periodo e fornisci 3 suggerimenti chiave (insights) per migliorare la redditività o ridurre le spese inutili.
    Formatta la risposta come un array JSON di oggetti con "title", "content" e "type" (success, warning o info).
    
    Dati:
    ${JSON.stringify(transactions)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      {
        title: "Analisi non disponibile",
        content: "Non è stato possibile generare suggerimenti al momento. Riprova più tardi.",
        type: "info"
      }
    ];
  }
};
