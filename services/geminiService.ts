
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Funcionario, Escola, Funcao } from "../types";

export const obterInsightsRH = async (funcionarios: Funcionario[], escolas: Escola[], funcoes: Funcao[]) => {
  // Use process.env.API_KEY as per Google GenAI SDK guidelines.
  // Assumes the variable is pre-configured and accessible.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const dadosRH = funcionarios.map(f => ({
    nome: f.nome,
    funcao: funcoes.find(r => r.id === f.funcaoId)?.nome,
    status: f.status,
    escola: escolas.find(e => e.id === f.escolaId)?.nome,
    possuiDobra: f.possuiDobra
  }));

  const prompt = `
    Analise os seguintes dados de lotação escolar de RH:
    ${JSON.stringify(dadosRH, null, 2)}
    
    Identifique de forma concisa:
    1. Problemas críticos (ex: muitas licenças em uma única escola).
    2. Sugestões de otimização.
    3. Resumo de ativos vs licenças.
    4. Alerta sobre funcionários com múltiplas cadeiras (mesmo nome mas matrículas diferentes).

    Responda em português brasileiro, de forma executiva e profissional.
  `;

  try {
    // Fix: Updated model to 'gemini-3-flash-preview' as it is the standard for basic text tasks like summarization and insights.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro AI Insight:", error);
    return "Não foi possível gerar insights no momento.";
  }
};
