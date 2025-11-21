import React from 'react';
import { BookOpen, Sparkles, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-indigo-500 p-4 rounded-full shadow-lg animate-pulse">
            <BookOpen size={48} className="text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold text-center mb-6 leading-tight">
          👋 Olá, eu sou o <span className="text-indigo-300">Book AI</span>
        </h1>
        
        <p className="text-lg md:text-xl text-center text-indigo-100 mb-8 leading-relaxed font-light">
          Sou seu copywriter especialista de IA. Vou te ajudar a construir seu Ebook de forma profissional, 
          utilizando princípios de <b>"Contagious"</b> e <b>"Made to Stick"</b> para garantir que seu material 
          seja contagiante e memorável.
        </p>

        <div className="space-y-4 bg-black/20 p-6 rounded-xl mb-8 border border-white/10">
          <div className="flex items-start gap-3">
            <Sparkles className="text-yellow-400 shrink-0 mt-1" size={20} />
            <p className="text-sm md:text-base text-gray-200">Estrutura viral baseada em psicologia comportamental.</p>
          </div>
          <div className="flex items-start gap-3">
            <Sparkles className="text-yellow-400 shrink-0 mt-1" size={20} />
            <p className="text-sm md:text-base text-gray-200">Copywriting persuasivo focado nas dores da persona.</p>
          </div>
        </div>

        <button 
          onClick={onStart}
          className="w-full group bg-white text-indigo-900 font-bold py-4 px-8 rounded-xl text-lg hover:bg-indigo-50 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-indigo-500/25 transform hover:-translate-y-1"
        >
          Vamos Começar
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};