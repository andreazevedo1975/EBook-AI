import React, { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { FormStep } from './components/FormStep';
import { LoadingView } from './components/LoadingView';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { generateEbookStructure } from './services/gemini';
import { AppState, EbookFormData } from './types';
import { 
  BookType, 
  Users, 
  Target, 
  MessageCircle, 
  Lightbulb,
  Download,
  RefreshCw,
  Copy,
  CheckCheck
} from 'lucide-react';

const INITIAL_FORM: EbookFormData = {
  topic: '',
  audience: '',
  goal: '',
  tone: '',
  differentiators: ''
};

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.INTRO);
  const [formData, setFormData] = useState<EbookFormData>(INITIAL_FORM);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleStart = () => {
    setAppState(AppState.FORM);
  };

  const updateForm = (key: keyof EbookFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const steps = [
    {
      key: 'topic' as keyof EbookFormData,
      title: "Tópico e Título",
      description: "Qual é o tema central do Ebook? Você já tem um título provisório ou ideia de gancho?",
      placeholder: "Ex: Produtividade para criativos. Título: 'A Arte de Fazer Menos'.",
      icon: BookType
    },
    {
      key: 'audience' as keyof EbookFormData,
      title: "Público-Alvo e Dores",
      description: "Quem exatamente queremos atingir? Quais são os problemas específicos que eles enfrentam?",
      placeholder: "Ex: Designers freelancers que sofrem com burnout e prazos apertados.",
      icon: Users
    },
    {
      key: 'goal' as keyof EbookFormData,
      title: "Objetivo e CTA",
      description: "O objetivo é gerar leads, educar ou vender? Qual deve ser a Call to Action final?",
      placeholder: "Ex: Gerar leads qualificados. CTA: Convidar para uma consultoria gratuita.",
      icon: Target
    },
    {
      key: 'tone' as keyof EbookFormData,
      title: "Tom e Voz",
      description: "Como a sua marca se comunica? Autoritária, amiga, técnica, inspiradora?",
      placeholder: "Ex: Empático, mas direto. Como um mentor experiente conversando num café.",
      icon: MessageCircle
    },
    {
      key: 'differentiators' as keyof EbookFormData,
      title: "Diferenciais e Histórias",
      description: "Existem dados, estudos ou histórias específicas para aumentar a credibilidade?",
      placeholder: "Ex: Quero citar o Princípio de Pareto e contar a história de como dobrei minha renda trabalhando metade do tempo.",
      icon: Lightbulb
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      submitForm();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitForm = async () => {
    setAppState(AppState.GENERATING);
    setError(null);
    try {
      const content = await generateEbookStructure(formData);
      setGeneratedContent(content);
      setAppState(AppState.RESULT);
    } catch (e) {
      setError("Ocorreu um erro ao gerar o ebook. Por favor, verifique sua conexão e tente novamente.");
      setAppState(AppState.ERROR);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ebook-gerado.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setAppState(AppState.INTRO);
    setFormData(INITIAL_FORM);
    setCurrentStep(0);
    setGeneratedContent("");
  };

  // Render Logic
  if (appState === AppState.INTRO) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  if (appState === AppState.GENERATING) {
    return <LoadingView />;
  }

  if (appState === AppState.ERROR) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md text-center border border-red-100">
          <div className="text-red-500 mb-4 flex justify-center">
            <Lightbulb size={48} className="rotate-180" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Ops, algo deu errado</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={submitForm}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (appState === AppState.RESULT) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <BookType className="text-indigo-600" size={24} />
                <span className="font-bold text-slate-900 text-lg">Book AI Result</span>
             </div>
             <div className="flex gap-2">
               <button 
                 onClick={handleDownload}
                 className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
               >
                 <Download size={16} />
                 Baixar
               </button>
               <button 
                 onClick={handleCopy}
                 className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
               >
                 {copied ? <CheckCheck size={16} className="text-green-600"/> : <Copy size={16} />}
                 {copied ? "Copiado" : "Copiar"}
               </button>
               <button 
                 onClick={handleReset}
                 className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
               >
                 <RefreshCw size={16} />
                 Novo Ebook
               </button>
             </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-16 min-h-[60vh] border border-slate-100">
            <MarkdownRenderer content={generatedContent} />
          </div>
        </main>
      </div>
    );
  }

  // AppState.FORM
  const currentStepData = steps[currentStep];
  
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center pt-12 md:pt-20 px-4">
        <div className="w-full max-w-2xl mb-8 flex justify-between items-center text-sm font-medium text-slate-500">
            <span>Passo {currentStep + 1} de {steps.length}</span>
            <div className="flex gap-1">
                {steps.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-2 rounded-full transition-all duration-300 ${idx <= currentStep ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-300'}`}
                    />
                ))}
            </div>
        </div>

      <FormStep 
        key={currentStepData.key} // Force re-render animation
        icon={currentStepData.icon}
        title={currentStepData.title}
        description={currentStepData.description}
        placeholder={currentStepData.placeholder}
        value={formData[currentStepData.key]}
        onChange={(val) => updateForm(currentStepData.key, val)}
        isLast={currentStep === steps.length - 1}
        onNext={handleNext}
        onBack={currentStep > 0 ? handleBack : undefined}
      />
    </div>
  );
}