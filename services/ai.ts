
import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const AIService = {
  async getOperationalInsight(prompt: string, context: { products: Product[], currentBalance: number }) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Você é o Kernel de Inteligência do NovaBev POS v3.1.
        Contexto Atual:
        - Produtos em estoque: ${JSON.stringify(context.products.map(p => ({ name: p.name, stock: p.stock, min: p.minStock })))}
        - Saldo em Caixa: R$ ${context.currentBalance}
        
        Responda de forma curta, técnica e futurista ao comando: ${prompt}`,
        config: {
          temperature: 0.7,
          topP: 0.9,
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      return response.text;
    } catch (error) {
      console.error("AI Kernel Error:", error);
      return "ERRO DE PROTOCOLO: Falha na comunicação com o Kernel de IA.";
    }
  },

  async searchProductByVibe(query: string, products: Product[]) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Dada a lista de produtos: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, cat: p.category })))}
        Quais produtos melhor se encaixam na busca subjetiva: "${query}"? 
        Retorne apenas os IDs dos produtos separados por vírgula.`,
        config: {
          temperature: 0.2
        }
      });
      return response.text?.split(',') || [];
    } catch (error) {
      return [];
    }
  }
};
