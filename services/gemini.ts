import { GoogleGenAI } from "@google/genai";
import { EbookFormData } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// Style mapping moved to top level for reuse in both Cover and Chapter illustrations
const STYLE_MAP: Record<string, string> = {
  'Minimalista': 'minimalist, clean lines, negative space, modern',
  'Fotorealista': 'photorealistic, cinematic lighting, high detailed photography',
  'Abstrato': 'abstract art, shapes, conceptual, artistic',
  'Geométrico': 'geometric patterns, bauhaus style, structured',
  'Ilustração Digital': 'digital illustration, vibrant colors, flat design',
  'Corporativo': 'corporate, professional, sleek, business-oriented',
  'Vintage': 'vintage style, retro aesthetics, 70s or 80s design, textured paper effect',
  'Aquarela': 'watercolor painting, soft artistic strokes, pastel colors, artistic',
  'Cyberpunk': 'cyberpunk, neon lights, futuristic, dark background with bright accents',
  '3D Render': '3D render, claymorphism, high quality 3d icons, soft lighting',
  'Fantasy Art': 'epic fantasy art, magical, ethereal, highly detailed, digital painting, rpg style',
  'Sci-Fi': 'sci-fi concept art, futuristic, technological, space age, neon, advanced',
  'Art Deco': 'art deco style, ornamental, geometric, vintage luxury, gold and black, 1920s aesthetic',
  'Pop Art': 'pop art style, roy lichtenstein, bold colors, comic dots, artistic',
  'Noir': 'film noir, black and white, dramatic shadows, cinematic, mysterious',
  'Isométrico': 'isometric 3d illustration, orthographic view, clean, detailed, structured'
};

/**
 * Helper function to generate an image from a text prompt using Gemini.
 */
const generateImageFromPrompt = async (prompt: string, aspectRatio: "1:1" | "3:4" | "4:3" | "16:9" | "9:16" = "1:1"): Promise<string | null> => {
  const ai = createClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio
        }
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Erro ao gerar imagem:", error);
    return null;
  }
};

export const generateEbookStructure = async (data: EbookFormData): Promise<string> => {
  const ai = createClient();
  
  // Get the descriptive style string to instruct the text model
  const selectedStyleDescription = STYLE_MAP[data.coverStyle] || data.coverStyle || 'minimalist, clean';

  const systemInstruction = `
    Você é o Book AI, um copywriter de nível especialista e autor best-seller.
    Sua missão é criar a estrutura e o conteúdo inicial de um Ebook altamente profissional.
    
    Você DEVE aplicar rigorosamente os princípios dos livros:
    1. "Contagious" (Jonah Berger): Use Moeda Social, Gatilhos, Emoção, Público, Valor Prático e Histórias.
    
    2. "Made to Stick" (Chip & Dan Heath) - Detalhamento obrigatório:
       - Simples (Simple): Encontre o núcleo absoluto da ideia. Priorize o essencial sem emburrecer o conteúdo. Uma ideia forte vale mais que dez fracas.
       - Inesperado (Unexpected): Quebre os padrões de pensamento do leitor. Use a surpresa para captar a atenção (violação de expectativas) e o mistério para mantê-la (lacunas de conhecimento).
       - Concreto (Concrete): Evite a "maldição do conhecimento" e abstrações corporativas. Use linguagem sensorial, imagens mentais claras e exemplos tangíveis que o leitor possa visualizar.
       - Credível (Credible): Use detalhes vívidos e estatísticas humanizadas. Aplique o "Teste Sinatra" (se você conseguir fazer isso lá, consegue em qualquer lugar) ou a "validade testável" (convide o leitor a verificar por si mesmo).
       - Emocional (Emotional): Faça o leitor sentir algo. Apele para o interesse próprio (WIIFM - What's in it for me) ou para a identidade (quem eles desejam ser). Foco nas pessoas, não nos números.
       - Histórias (Stories): A história age como um simulador de voo mental. Não apenas apresente dados; mostre a jornada de transformação, o desafio e a superação através de uma narrativa envolvente.
    
    Estruture a resposta em Markdown limpo.
    A resposta deve incluir rigorosamente esta ordem:
    1. Título (Magnético e focado na promessa)
    2. Introdução (Usando ganchos emocionais, o elemento inesperado e identificação profunda com a dor)
    3. Tabela de Conteúdos:
       - Liste os títulos de todos os capítulos.
       - Inclua um resumo muito breve (1 frase) do que trata cada capítulo.
    4. Outline Detalhado dos Capítulos:
       - Liste TODOS os capítulos planejados para o livro.
       - O usuário definiu uma META DE PÁGINAS (${data.depth}). Use essa meta para definir a quantidade de capítulos (ex: livros longos precisam de mais capítulos) e a densidade.
       - Para CADA capítulo no outline, siga estritamente este formato:
         * **Título do Capítulo** (com estimativa de palavras/páginas)
         * **Resumo do Capítulo:** Escreva um parágrafo conciso destacando o principal takeaway (lição principal).
         * **Tópicos Chave:** Liste 3-4 bullet points detalhando os conceitos.
         * [ILLUSTRATION_PROMPT: Escreva aqui uma descrição visual rica para uma imagem que ilustre este capítulo, baseada no resumo e tópicos. A descrição deve solicitar o estilo artístico: "${selectedStyleDescription}" e ser em INGLÊS.]
    5. O Capítulo 1 Completo:
       - INICIE o capítulo com o título formatado como H2 (## Título do Capítulo).
       - O conteúdo deve ser escrito com a voz e tom definidos, altamente concreto e guiado por narrativa.
       - DENSIDADE: Escreva o capítulo com profundidade suficiente para justificar a meta de páginas total.
  `;

  const userPrompt = `
    Por favor, crie o material do Ebook com base nos seguintes dados:
    
    - **Tópico e Título:** ${data.topic}
    - **Público-Alvo e Dores:** ${data.audience}
    - **Objetivo e CTA:** ${data.goal}
    - **Tom e Voz:** ${data.tone}
    - **META DE PÁGINAS APROXIMADA:** ${data.depth} páginas (IMPORTANTE: Ajuste a estrutura e a densidade do texto para atingir esta meta).
    - **Diferenciais e Histórias:** ${data.differentiators}
    - **Estilo Visual:** ${data.coverStyle}
    
    IMPORTANTE: O usuário definiu uma meta de ${data.depth} páginas. 
    Adapte a estrutura do "Outline Detalhado" (quantidade de capítulos) e a densidade do texto para que seja realista atingir esse tamanho no livro final.
    Não esqueça de incluir a tag [ILLUSTRATION_PROMPT: ...] para CADA capítulo no outline.
  `;

  try {
    // 1. Generate the Text Content
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: {
            thinkingBudget: 4096,
        },
        temperature: 0.7,
      },
    });

    let generatedText = response.text || "Não foi possível gerar o conteúdo. Tente novamente.";

    // 2. Find all Illustration Prompt tags globally
    // Looking for [ILLUSTRATION_PROMPT: ...]
    const regex = /\[ILLUSTRATION_PROMPT:\s*(.*?)\]/g;
    const matches = [...generatedText.matchAll(regex)];

    if (matches.length > 0) {
      console.log(`Found ${matches.length} illustration prompts. Generating images...`);
      
      // 3. Generate Images in Parallel
      // We map matches to promises that return { originalTag, imageUrl }
      const imagePromises = matches.map(async (match) => {
        const fullTag = match[0];
        const prompt = match[1];
        
        // Using 16:9 for chapter/section headers
        const imageUrl = await generateImageFromPrompt(prompt, "16:9");
        return { fullTag, imageUrl };
      });

      const generatedImages = await Promise.all(imagePromises);

      // 4. Replace tags in the text
      for (const item of generatedImages) {
        if (item.imageUrl) {
          // Replace the prompt tag with the markdown image
          generatedText = generatedText.replace(
            item.fullTag, 
            `\n\n![Ilustração do Capítulo](${item.imageUrl})\n\n`
          );
        } else {
          // If generation failed, just remove the tag
          generatedText = generatedText.replace(item.fullTag, '');
        }
      }
    }

    return generatedText;

  } catch (error) {
    console.error("Erro ao gerar ebook:", error);
    throw error;
  }
};

export const generateEbookCover = async (data: EbookFormData): Promise<string | null> => {
  const selectedStyle = STYLE_MAP[data.coverStyle] || data.coverStyle || 'minimalist, clean';

  const prompt = `
    Create a professional, modern, and eye-catching ebook cover image for a book about: ${data.topic}.
    Target Audience: ${data.audience}.
    Tone/Mood: ${data.tone}.
    Style: ${selectedStyle}.
    Format: Vertical book cover.
    Constraint: Do not include text on the image, or keep it extremely abstract. Focus on visual composition.
  `;

  // Reuse the helper function with 3:4 aspect ratio for covers
  return generateImageFromPrompt(prompt, "3:4");
};