import { GoogleGenAI } from "@google/genai";
import { EbookFormData } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateEbookStructure = async (data: EbookFormData): Promise<string> => {
  const ai = createClient();

  const systemInstruction = `
    Você é o Book AI, um copywriter de nível especialista e autor best-seller.
    Sua missão é criar a estrutura e o conteúdo inicial de um Ebook altamente profissional.
    
    Você DEVE aplicar rigorosamente os princípios dos livros:
    1. "Contagious" (Jonah Berger): Use Moeda Social, Gatilhos, Emoção, Público, Valor Prático e Histórias.
    2. "Made to Stick" (Chip & Dan Heath): O conteúdo deve ser Simples, Inesperado, Concreto, Credível, Emocional e conter Histórias.
    
    Estruture a resposta em Markdown limpo.
    A resposta deve incluir:
    - Um Título (Magnético e focado na promessa)
    - Uma Introdução (Usando ganchos emocionais e identificação com a dor)
    - Um Esboço/Outline completo dos Capítulos (Com breves descrições do que será abordado em cada um)
    - O Capítulo 1 completo (Escrito com a voz e tom definidos).
  `;

  const userPrompt = `
    Por favor, crie o material do Ebook com base nos seguintes dados:
    
    - **Tópico e Título:** ${data.topic}
    - **Público-Alvo e Dores:** ${data.audience}
    - **Objetivo e CTA:** ${data.goal}
    - **Tom e Voz:** ${data.tone}
    - **Diferenciais e Histórias:** ${data.differentiators}
    
    Garanta que o texto seja persuasivo, bem formatado e pronto para ser usado como base sólida.
  `;

  try {
    // Using gemini-3-pro-preview for complex writing tasks requiring reasoning.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: {
            thinkingBudget: 4096, // Budget for planning the structure and applying copywriting frameworks
        },
        temperature: 0.7,
      },
    });

    return response.text || "Não foi possível gerar o conteúdo. Tente novamente.";
  } catch (error) {
    console.error("Erro ao gerar ebook:", error);
    throw error;
  }
};