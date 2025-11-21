import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FormStepProps {
  icon: LucideIcon;
  title: string;
  description: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
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
  isLast,
  onNext,
  onBack
}) => {
  return (
    <div className="animate-fadeIn max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl p-8 border border-indigo-50">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-indigo-100 p-3 rounded-xl">
          <Icon className="text-indigo-600" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      </div>
      
      <p className="text-slate-600 mb-6 leading-relaxed">{description}</p>
      
      <textarea
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[150px] p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-lg resize-none mb-8 text-slate-800 placeholder:text-slate-400"
      />
      
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