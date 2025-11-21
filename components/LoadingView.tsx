import React, { useEffect, useState } from 'react';
import { Loader2, BrainCircuit } from 'lucide-react';

export const LoadingView: React.FC = () => {
  const [tipIndex, setTipIndex] = useState(0);
  
  const tips = [
    "Aplicando o princípio de 'Moeda Social' para fazer seu conteúdo valer a pena compartilhar...",
    "Estruturando 'Gatilhos' mentais para manter seu público engajado...",
    "Refinando a 'Emoção' do texto para criar conexão profunda...",
    "Simplificando conceitos complexos para torná-los 'Concretos'...",
    "Criando histórias envolventes seguindo a estrutura do 'Made to Stick'...",
    "O modelo Gemini 2.5 está analisando milhões de padrões de escrita de sucesso...",
    "Escrevendo o primeiro capítulo com foco em conversão..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [tips.length]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
        <BrainCircuit size={64} className="text-indigo-600 relative z-10 animate-bounce" />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-900 mb-2">O Book AI está pensando</h2>
      <div className="flex items-center gap-2 text-indigo-600 mb-8">
        <Loader2 className="animate-spin" size={20} />
        <span className="font-medium">Processando dados</span>
      </div>

      <div className="max-w-md w-full bg-white p-6 rounded-xl shadow-lg border border-indigo-100 transition-all duration-500">
        <p className="text-slate-600 italic text-lg font-serif">
          "{tips[tipIndex]}"
        </p>
      </div>
    </div>
  );
};