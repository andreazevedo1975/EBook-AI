import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FormStepProps {
  icon: LucideIcon;
  title: string;
  description: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  options?: string[];
  inputType?: 'text' | 'options' | 'slider';
  min?: number;
  max?: number;
  step?: number;
  isLast?: boolean;
  onNext: () => void;
  onBack?: () => void;
}

export const FormStep: React.FC<FormStepProps> = ({
  icon: Icon,
  title,
  description,
  value,
  onChange,
  placeholder,
  options,
  inputType = 'text',
  min,
  max,
  step,
  isLast,
  onNext,
  onBack
}) => {
  
  const renderInput = () => {
    if (inputType === 'options' && options) {
      return (
        <div className="space-y-3 mb-8">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                value === option 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-semibold' 
                  : 'border-slate-200 hover:border-indigo-300 text-slate-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      );
    }

    if (inputType === 'slider') {
      const numericValue = value ? parseInt(value) : (min || 10);
      return (
        <div className="mb-10 px-2">
          <div className="flex justify-between items-end mb-4">
            <span className="text-4xl font-bold text-indigo-600">{numericValue}</span>
            <span className="text-slate-500 font-medium mb-1">páginas estimadas</span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={numericValue}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
            <span>{min} pág (Curto)</span>
            <span>{max ? Math.floor(max / 2) : 100} pág (Médio)</span>
            <span>{max} pág (Extenso)</span>
          </div>
          <p className="text-sm text-indigo-600/80 mt-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
            ℹ️ A IA estruturará o outline e a quantidade de capítulos para atingir esta meta de {numericValue} páginas no documento final.
          </p>
        </div>
      );
    }

    // Default Text Area
    return (
      <textarea
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[150px] p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-lg resize-none mb-8 text-slate-800 placeholder:text-slate-400"
      />
    );
  };

  return (
    <div className="animate-fadeIn max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl p-8 border border-indigo-50">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-indigo-100 p-3 rounded-xl">
          <Icon className="text-indigo-600" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      </div>
      
      <p className="text-slate-600 mb-6 leading-relaxed">{description}</p>
      
      {renderInput()}
      
      <div className="flex justify-between items-center">
        {onBack ? (
           <button 
            onClick={onBack}
            className="text-slate-500 hover:text-slate-800 font-medium px-6 py-3 transition-colors"
          >
            Voltar
          </button>
        ) : <div></div>}
       
        <button
          onClick={onNext}
          disabled={!value.trim()}
          className={`px-8 py-3 rounded-xl font-bold text-white transition-all transform ${
            value.trim() 
              ? 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/30' 
              : 'bg-slate-300 cursor-not-allowed'
          }`}
        >
          {isLast ? 'Gerar Ebook' : 'Próximo'}
        </button>
      </div>
    </div>
  );
};