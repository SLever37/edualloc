import { GoogleGenAI } from "@google/genai";
import { Funcionario, Escola, Funcao } from "../types.ts";

export const obterInsightsRH = async (funcionarios: Funcionario[], escolas: Escola[], funcoes: Funcao[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const dadosRH = funcionarios.map(f => ({
    nome: f.nome,
    funcao: funcoes.find(r => r.id === f.funcaoId)?.nome,
    status: f.status,
    escola: escolas.find(e => e.id === f.escolaId)?.nome,
    possuiDobra: f.possuiDobra
  }));

  const prompt = `
    Analise os seguintes dados de lotação escolar de RH e forneça uma análise executiva:
    ${JSON.stringify(dadosRH, null, 2)}
    
    Identifique de forma objetiva:
    1. Concentração de licenças por escola (Alertas críticos).
    2. Equilíbrio entre funcionários ativos e afastados na rede.
    3. Riscos de sub-lotação em unidades específicas.
    4. Sugestões de redistribuição se houver excesso em alguma unidade.

    Responda em português brasileiro de forma profissional e concisa.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text;
  } catch (error) {
    console.error("Erro AI Insight:", error);
    return "Insights temporariamente indisponíveis para análise de lotação.";
  }
};