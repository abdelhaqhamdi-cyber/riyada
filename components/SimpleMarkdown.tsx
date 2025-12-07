import React from 'react';

interface SimpleMarkdownProps {
  content: string;
}

// A lightweight custom renderer to avoid heavy dependencies in this environment
// Handles basic headers, bold, and code blocks
export const SimpleMarkdown: React.FC<SimpleMarkdownProps> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let keyCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle Code Blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        inCodeBlock = false;
        elements.push(
          <div key={`code-${keyCounter++}`} className="my-4 rounded-lg overflow-hidden border border-slate-700 bg-[#1e1e1e] text-slate-200 shadow-md">
            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-slate-700">
               <span className="text-xs font-mono text-slate-400">Code</span>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed" dir="ltr">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
      } else {
        // Start of code block
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Handle Headers
    if (line.startsWith('### ')) {
      elements.push(<h3 key={keyCounter++} className="text-xl font-bold text-slate-800 mt-6 mb-3">{line.replace('### ', '')}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={keyCounter++} className="text-2xl font-bold text-primary mt-8 mb-4 border-b pb-2 border-slate-200">{line.replace('## ', '')}</h2>);
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={keyCounter++} className="text-3xl font-extrabold text-slate-900 mt-8 mb-6">{line.replace('# ', '')}</h1>);
    } 
    // Handle Lists
    else if (line.trim().startsWith('- ')) {
       elements.push(<li key={keyCounter++} className="ml-4 mr-6 list-disc text-slate-700 mb-1">{line.replace('- ', '')}</li>);
    }
    // Handle Empty Lines
    else if (line.trim() === '') {
      elements.push(<div key={keyCounter++} className="h-2"></div>);
    }
    // Standard Paragraph
    else {
      // Basic Bold parsing (**text**)
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const parsedLine = parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      
      elements.push(<p key={keyCounter++} className="text-slate-700 leading-relaxed mb-2">{parsedLine}</p>);
    }
  }

  return <div className="markdown-body font-sans">{elements}</div>;
};
