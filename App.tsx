import React, { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { FormStep } from './components/FormStep';
import { LoadingView } from './components/LoadingView';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { generateEbookStructure, generateEbookCover } from './services/gemini';
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
  CheckCheck,
  Maximize2,
  Share2,
  FileText,
  Type,
  Palette,
  X
} from 'lucide-react';

const INITIAL_FORM: EbookFormData = {
  topic: '',
  audience: '',
  goal: '',
  tone: '',
  differentiators: '',
  depth: '50', // Default value for slider
  coverStyle: 'Minimalista'
};

const COVER_STYLE_TOOLTIPS: Record<string, string> = {
  'Minimalista': 'Design limpo, muito espaço em branco, foco na tipografia. Passa sofisticação e clareza.',
  'Fotorealista': 'Uso de imagens que parecem fotografias reais de alta qualidade. Traz credibilidade e realismo.',
  'Abstrato': 'Formas, cores e padrões não representacionais. Estimula a imaginação e curiosidade.',
  'Geométrico': 'Uso forte de linhas, formas geométricas e estruturas. Passa organização e modernidade.',
  'Ilustração Digital': 'Arte desenhada digitalmente, cores vibrantes. Ótimo para guias práticos e criativos.',
  'Corporativo': 'Visual sério, cores sóbrias (azul, cinza), foco em negócios e profissionalismo.',
  'Vintage': 'Estética retrô, texturas de papel envelhecido, fontes clássicas. Nostalgia e tradição.',
  'Aquarela': 'Pintura suave, cores pastel, artístico e delicado. Bom para temas de bem-estar ou arte.',
  'Cyberpunk': 'Futurista, neon, contrastes fortes, tecnologia avançada. Para temas de inovação ou ficção.',
  '3D Render': 'Elementos tridimensionais suaves, estilo "clay" (massinha) ou realista. Muito moderno e tech.',
  'Fantasy Art': 'Épico, mágico, detalhado. Ideal para ficção, RPG ou narrativas de aventura.',
  'Sci-Fi': 'Espacial, tecnológico, futurista. Para ficção científica ou tecnologia avançada.',
  'Art Deco': 'Luxuoso, ornamentado, geométrico, anos 20. Elegância clássica e dourada.',
  'Pop Art': 'Estilo vibrante com cores fortes e estética de quadrinhos retrô.',
  'Noir': 'Elegância dramática em preto e branco com jogos de luz e sombra.',
  'Isométrico': 'Representação 3D em perspectiva fixa, ideal para explicar sistemas e estruturas.'
};

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.INTRO);
  const [formData, setFormData] = useState<EbookFormData>(INITIAL_FORM);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [font, setFont] = useState<'sans' | 'serif'>('serif');
  const [isCoverFullscreen, setIsCoverFullscreen] = useState(false);

  const handleStart = () => {
    setAppState(AppState.FORM);
  };

  const updateForm = (key: keyof EbookFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const steps: {
    key: keyof EbookFormData;
    title: string;
    description: string;
    placeholder: string;
    icon: any;
    inputType: 'text' | 'options' | 'slider';
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
    optionTooltips?: Record<string, string>;
  }[] = [
    {
      key: 'topic',
      title: "Tópico e Título",
      description: "Qual é o tema central do Ebook? Você já tem um título provisório ou ideia de gancho?",
      placeholder: "Ex: Produtividade para criativos. Título: 'A Arte de Fazer Menos'.",
      icon: BookType,
      inputType: 'text'
    },
    {
      key: 'audience',
      title: "Público-Alvo e Dores",
      description: "Quem exatamente queremos atingir? Quais são os problemas específicos que eles enfrentam?",
      placeholder: "Ex: Designers freelancers que sofrem com burnout e prazos apertados.",
      icon: Users,
      inputType: 'text'
    },
    {
      key: 'goal',
      title: "Objetivo e CTA",
      description: "O objetivo é gerar leads, educar ou vender? Qual deve ser a Call to Action final?",
      placeholder: "Ex: Gerar leads qualificados. CTA: Convidar para uma consultoria gratuita.",
      icon: Target,
      inputType: 'text'
    },
    {
      key: 'tone',
      title: "Tom e Voz",
      description: "Como a sua marca se comunica? Autoritária, amiga, técnica, inspiradora?",
      placeholder: "Ex: Empático, mas direto. Como um mentor experiente conversando num café.",
      icon: MessageCircle,
      inputType: 'text'
    },
    {
      key: 'depth',
      title: "Extensão Aproximada",
      description: "Defina a meta de páginas para o material final. Isso influenciará a quantidade de capítulos planejados e a profundidade do conteúdo.",
      icon: Maximize2,
      inputType: 'slider',
      min: 10,
      max: 200,
      step: 10,
      placeholder: ""
    },
    {
      key: 'coverStyle',
      title: "Estilo Visual da Capa",
      description: "Qual estética visual melhor representa a identidade do seu material?",
      icon: Palette,
      inputType: 'options',
      options: [
        'Minimalista', 
        'Fotorealista', 
        'Abstrato', 
        'Geométrico', 
        'Ilustração Digital', 
        'Corporativo',
        'Vintage',
        'Aquarela',
        'Cyberpunk',
        '3D Render',
        'Fantasy Art',
        'Sci-Fi',
        'Art Deco',
        'Pop Art',
        'Noir',
        'Isométrico'
      ],
      placeholder: "",
      optionTooltips: COVER_STYLE_TOOLTIPS
    },
    {
      key: 'differentiators',
      title: "Diferenciais e Histórias (O segredo do sucesso)",
      description: "Para tornar seu Ebook memorável (Sticky), precisamos de credibilidade e emoção. Você tem algum estudo de caso real, uma estatística surpreendente do setor ou uma história pessoal de fracasso/superação para ilustrar o ponto?",
      placeholder: "Ex: 'Vou contar como fui de R$0 a R$10k em 30 dias usando o método X', 'O erro que custou meu primeiro negócio', 'Dados exclusivos da pesquisa 2024' ou 'O segredo que a indústria não conta'. Histórias vulneráveis conectam mais!",
      icon: Lightbulb,
      inputType: 'text'
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
    setCoverImage(null);
    
    try {
      // Initiate both requests. We catch the image generation error individually 
      // so it doesn't block the text generation if it fails.
      const contentPromise = generateEbookStructure(formData);
      const coverPromise = generateEbookCover(formData).catch(err => {
        console.error("Failed to generate cover:", err);
        return null;
      });

      const [content, cover] = await Promise.all([contentPromise, coverPromise]);

      setGeneratedContent(content);
      setCoverImage(cover);
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

  const handleDownloadPDF = () => {
    // Native print is cleaner, higher fidelity (vectors), and more performant than html2canvas
    const originalTitle = document.title;
    // Set a clean filename for the PDF save dialog
    document.title = formData.topic 
      ? `${formData.topic.substring(0, 30).replace(/[^a-z0-9]/gi, '_')}_Ebook` 
      : 'Book_AI_Ebook';
      
    window.print();
    
    document.title = originalTitle;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Ebook gerado pelo Book AI',
          text: generatedContent,
        });
      } catch (err) {
        console.error('Erro ao compartilhar ou cancelado pelo usuário', err);
      }
    } else {
      // Fallback simples caso a API não seja suportada
      alert("O compartilhamento direto não é suportado neste navegador. Utilize o botão Copiar ou Baixar.");
    }
  };

  const handleReset = () => {
    setAppState(AppState.INTRO);
    setFormData(INITIAL_FORM);
    setCurrentStep(0);
    setGeneratedContent("");
    setCoverImage(null);
    setIsCoverFullscreen(false);
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
      <div className="min-h-screen bg-slate-50 flex flex-col relative print:bg-white print:block">
        {/* Fullscreen Cover Modal */}
        {isCoverFullscreen && coverImage && (
          <div 
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn print:hidden"
            onClick={() => setIsCoverFullscreen(false)}
          >
            <button 
                className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); setIsCoverFullscreen(false); }}
            >
                <X size={32} />
            </button>
            <img 
                src={coverImage} 
                alt="Capa do Ebook Fullscreen" 
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl cursor-default" 
                onClick={(e) => e.stopPropagation()} 
            />
          </div>
        )}

        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm print:hidden">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <BookType className="text-indigo-600" size={24} />
                <span className="font-bold text-slate-900 text-lg">Book AI Result</span>
             </div>
             <div className="flex gap-2">
               
               {/* Share Button with Tooltip */}
               <div className="relative group">
                 <button 
                   onClick={handleShare}
                   className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                   aria-label="Compartilhar"
                 >
                   <Share2 size={16} />
                   <span className="hidden sm:inline">Compartilhar</span>
                 </button>
                 <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium text-white bg-slate-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                   Compartilhar via apps
                 </div>
               </div>

                {/* Font Toggle */}
               <div className="relative group">
                 <button 
                   onClick={() => setFont(prev => prev === 'serif' ? 'sans' : 'serif')}
                   className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                   aria-label="Alternar fonte"
                 >
                   <Type size={16} />
                   <span className="hidden sm:inline">{font === 'serif' ? 'Serif' : 'Sans'}</span>
                 </button>
                 <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium text-white bg-slate-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                   Alternar fonte (Inter/Merriweather)
                 </div>
               </div>

               {/* Download Markdown Button with Tooltip */}
               <div className="relative group">
                 <button 
                   onClick={handleDownload}
                   className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                   aria-label="Baixar arquivo Markdown"
                 >
                   <Download size={16} />
                   <span className="hidden sm:inline">MD</span>
                 </button>
                 <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium text-white bg-slate-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                   Baixar arquivo .md
                 </div>
               </div>

               {/* Download PDF Button with Tooltip */}
               <div className="relative group">
                 <button 
                   onClick={handleDownloadPDF}
                   className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                   aria-label="Baixar arquivo PDF"
                 >
                   <FileText size={16} />
                   <span className="hidden sm:inline">PDF</span>
                 </button>
                 <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium text-white bg-slate-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                   Baixar arquivo .pdf
                 </div>
               </div>

               {/* Copy Button with Tooltip */}
               <div className="relative group">
                 <button 
                   onClick={handleCopy}
                   className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                   aria-label="Copiar conteúdo"
                 >
                   {copied ? <CheckCheck size={16} className="text-green-600"/> : <Copy size={16} />}
                   <span className="hidden sm:inline">{copied ? "Copiado" : "Copiar"}</span>
                 </button>
                 <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium text-white bg-slate-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                   Copiar para área de transferência
                 </div>
               </div>

               {/* Reset Button with Tooltip */}
               <div className="relative group">
                 <button 
                   onClick={handleReset}
                   className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                   aria-label="Criar novo Ebook"
                 >
                   <RefreshCw size={16} />
                   <span className="hidden sm:inline">Novo</span>
                 </button>
                 <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium text-white bg-slate-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                   Reiniciar e criar novo Ebook
                 </div>
               </div>

             </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12 print:p-0 print:max-w-none">
          <div id="ebook-content" className="bg-white rounded-2xl shadow-xl p-8 md:p-16 min-h-[60vh] border border-slate-100 print:shadow-none print:border-none print:m-0">
            {coverImage && (
              <div className="flex justify-center mb-12">
                <div 
                    className="relative group cursor-zoom-in inline-block"
                    onClick={() => setIsCoverFullscreen(true)}
                >
                    <div className="p-2 bg-white rounded shadow-sm border border-slate-100 transition-transform group-hover:scale-[1.02] duration-300 print:shadow-none print:border-none">
                      <img 
                        src={coverImage} 
                        alt="Capa do Ebook Gerada por IA" 
                        className="w-full max-w-[280px] md:max-w-[320px] rounded shadow-xl object-cover aspect-[3/4] print:shadow-none"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none print:hidden">
                        <div className="bg-black/50 text-white p-3 rounded-full backdrop-blur-md shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                            <Maximize2 size={24} />
                        </div>
                    </div>
                </div>
              </div>
            )}
            <MarkdownRenderer content={generatedContent} font={font} />
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
        options={currentStepData.options} 
        inputType={currentStepData.inputType}
        min={currentStepData.min}
        max={currentStepData.max}
        step={currentStepData.step}
        isLast={currentStep === steps.length - 1}
        onNext={handleNext}
        onBack={currentStep > 0 ? handleBack : undefined}
        optionTooltips={currentStepData.optionTooltips}
      />
    </div>
  );
}