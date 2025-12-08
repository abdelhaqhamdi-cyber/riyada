import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface SimpleMarkdownProps {
  content: string;
}

interface CodeBlockProps {
  code: string;
  language?: string;
}

// Helper to parse inline styles (**bold**, `code`)
const parseInline = (text: string): React.ReactNode[] => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={idx} className="bg-slate-100 text-pink-600 px-1 rounded font-mono text-sm border border-slate-200 mx-1" dir="ltr">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'code' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-slate-700 bg-[#1e1e1e] text-slate-200 shadow-md dir-ltr" dir="ltr">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-slate-700">
        <span className="text-xs font-mono text-slate-400 lowercase">{language}</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed custom-scrollbar">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const Table = ({ rows }: { rows: string[] }) => {
  if (rows.length < 2) return null;

  // Helper to split row by pipe | and trim whitespace, ignoring empty start/end
  const parseRow = (row: string) => {
    return row.split('|').filter((cell, i, arr) => {
      // Filter out first/last empty elements caused by | at start/end
      if (i === 0 && cell.trim() === '') return false;
      if (i === arr.length - 1 && cell.trim() === '') return false;
      return true;
    });
  };

  const headers = parseRow(rows[0]);
  // rows[1] is the separator |---|---|, we skip it
  const bodyRows = rows.slice(2).map(parseRow);

  return (
    <div className="overflow-x-auto my-6 border border-slate-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {headers.map((header, i) => (
              <th key={i} className="px-4 py-3 text-start font-bold text-slate-700 tracking-wide whitespace-nowrap">
                {parseInline(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {bodyRows.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-100'}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 text-slate-600 leading-relaxed">
                  {parseInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const SimpleMarkdown: React.FC<SimpleMarkdownProps> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let currentLanguage = '';
  
  let inTable = false;
  let tableBuffer: string[] = [];
  
  let keyCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // --- Code Block Handling ---
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        inCodeBlock = false;
        elements.push(
          <CodeBlock 
            key={`code-${keyCounter++}`} 
            code={codeBuffer.join('\n')} 
            language={currentLanguage}
          />
        );
        codeBuffer = [];
        currentLanguage = '';
      } else {
        // We ensure we are not in a table when starting a code block
        if (inTable) {
           inTable = false;
           elements.push(<Table key={`table-${keyCounter++}`} rows={tableBuffer} />);
           tableBuffer = [];
        }
        // Start of code block
        inCodeBlock = true;
        currentLanguage = line.trim().replace('```', '') || 'code';
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // --- Table Handling ---
    // Heuristic: Line starts with | AND looks like a table row (has internal structure or closing pipe)
    const trimmedLine = line.trim();
    const looksLikeTable = trimmedLine.startsWith('|') && (trimmedLine.endsWith('|') || trimmedLine.split('|').length > 2);
    
    if (looksLikeTable) {
      inTable = true;
      tableBuffer.push(line);
      
      // If it's the last line, flush the table
      if (i === lines.length - 1) {
        elements.push(<Table key={`table-${keyCounter++}`} rows={tableBuffer} />);
      }
      continue;
    } else if (inTable) {
      // If we were in a table but this line is not a table row, flush the table
      inTable = false;
      elements.push(<Table key={`table-${keyCounter++}`} rows={tableBuffer} />);
      tableBuffer = [];
      // Don't continue, process this line as normal text below
    }

    // --- Standard Markdown Handling ---
    
    // Headers
    if (line.startsWith('### ')) {
      elements.push(<h3 key={keyCounter++} className="text-xl font-bold text-slate-800 mt-6 mb-3">{parseInline(line.replace('### ', ''))}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={keyCounter++} className="text-2xl font-bold text-primary mt-8 mb-4 border-b pb-2 border-slate-200">{parseInline(line.replace('## ', ''))}</h2>);
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={keyCounter++} className="text-3xl font-extrabold text-slate-900 mt-8 mb-6">{parseInline(line.replace('# ', ''))}</h1>);
    } 
    // Lists
    else if (line.trim().startsWith('- ')) {
       elements.push(<li key={keyCounter++} className="ml-4 mr-6 list-disc text-slate-700 mb-1">{parseInline(line.replace('- ', ''))}</li>);
    }
    // Numbered Lists
    else if (/^\d+\.\s/.test(line.trim())) {
      elements.push(<div key={keyCounter++} className="ml-4 mr-6 text-slate-700 mb-1 font-medium">{parseInline(line)}</div>);
   }
    // Empty Lines
    else if (line.trim() === '') {
      elements.push(<div key={keyCounter++} className="h-2"></div>);
    }
    // Paragraphs
    else {
      elements.push(<p key={keyCounter++} className="text-slate-700 leading-relaxed mb-2">{parseInline(line)}</p>);
    }
  }

  return <div className="markdown-body font-sans dir-rtl">{elements}</div>;
};