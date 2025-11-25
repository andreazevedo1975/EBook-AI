import React from 'react';

interface MarkdownRendererProps {
  content: string;
  font?: 'sans' | 'serif';
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, font = 'serif' }) => {
  // Simple formatting logic to avoid heavy dependencies
  const paragraphs = content.split('\n');
  
  // Define font class for paragraphs: 'serif' uses Merriweather (defined in index.html styles), 'font-sans' uses Inter (Tailwind default)
  const paragraphClass = font === 'serif' ? 'serif' : 'font-sans';

  return (
    <div className="space-y-4 text-slate-700 leading-relaxed">
      {paragraphs.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-2" />;

        // Headers
        if (trimmed.startsWith('###')) {
            return <h3 key={index} className="text-xl font-bold text-slate-900 mt-6 mb-2">{trimmed.replace(/###\s*/, '')}</h3>;
        }
        if (trimmed.startsWith('##')) {
            return <h2 key={index} className="text-2xl font-bold text-indigo-900 mt-8 mb-4 border-b pb-2 border-indigo-100">{trimmed.replace(/##\s*/, '')}</h2>;
        }
        if (trimmed.startsWith('#')) {
            return <h1 key={index} className="text-3xl md:text-4xl font-extrabold text-indigo-950 mt-4 mb-6">{trimmed.replace(/#\s*/, '')}</h1>;
        }

        // List items
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={index} className="flex items-start ml-4">
              <span className="mr-2 text-indigo-500">•</span>
              <span className={paragraphClass}>{trimmed.replace(/^[-*]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>
            </div>
          );
        }
        
        // Numbered lists
        if (/^\d+\.\s/.test(trimmed)) {
             return (
            <div key={index} className="flex items-start ml-4">
              <span className="mr-2 text-indigo-500 font-semibold">{trimmed.split('.')[0]}.</span>
              <span className={paragraphClass}>{trimmed.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>
            </div>
          );
        }

        // Bold formatting replacement for paragraphs
        const parseBold = (text: string) => {
            const parts = text.split(/(\*\*.*?\*\*)/);
            return parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
                }
                return part;
            });
        };

        return <p key={index} className={`text-base md:text-lg ${paragraphClass}`}>{parseBold(trimmed)}</p>;
      })}
    </div>
  );
};