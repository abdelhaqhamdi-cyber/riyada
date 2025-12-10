import React, { useState, useEffect } from 'react';
import { Copy, Check, Eye, Code as CodeIcon, MonitorPlay, Download, GitGraph } from 'lucide-react';

interface SimpleMarkdownProps {
  content: string;
}

interface CodeBlockProps {
  code: string;
  language?: string;
}

const MermaidBlock: React.FC<{ code: string }> = ({ code }) => {
  const [encoded, setEncoded] = useState<string | null>(null);

  useEffect(() => {
    try {
      const state = {
        code: code,
        mermaid: { theme: 'neutral' },
      };
      const json = JSON.stringify(state);
      const b64 = btoa(unescape(encodeURIComponent(json)));
      setEncoded(b64);
    } catch (e) {
      console.error("Mermaid encoding failed", e);
    }
  }, [code]);

  if (!encoded) return <pre className="bg-slate-100 p-4 rounded text-xs">{code}</pre>;

  return (
    <div className="my-6 p-4 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col items-center">
      <div className="w-full flex items-center gap-2 mb-4 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100 pb-2">
        <GitGraph className="w-4 h-4" />
        مخطط بياني (Architecture Diagram)
      </div>
      <img 
        src={`https://mermaid.ink/img/${encoded}`} 
        alt="Mermaid Diagram" 
        className="max-w-full h-auto rounded"
        loading="lazy"
      />
    </div>
  );
};

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
  const [showPreview, setShowPreview] = useState(false);

  if (language.toLowerCase() === 'mermaid') {
    return <MermaidBlock code={code} />;
  }

  const isPreviewable = language.toLowerCase() === 'html' || language.toLowerCase() === 'xml';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getFullHtml = (rawCode: string) => {
    if (rawCode.includes('<!DOCTYPE html>') || rawCode.includes('<html')) {
      return rawCode;
    }
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Site</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>body { font-family: 'Tajawal', sans-serif; }</style>
</head>
<body class="bg-gray-50">
    ${rawCode}
</body>
</html>`;
  };

  const handleDownload = () => {
    const fullContent = language.toLowerCase() === 'html' ? getFullHtml(code) : code;
    const extension = language.toLowerCase() === 'html' ? 'html' : 'txt';
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project_export.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPreviewContent = () => {
    return getFullHtml(code);
  };

  return (
    <div className="my-8 rounded-xl overflow-hidden border border-slate-200 shadow-lg bg-white dir-ltr transition-all duration-300 hover:shadow-xl" dir="ltr">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 text-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider ml-2">{language}</span>
        </div>
        
        <div className="flex items-center gap-2">
           {isPreviewable && (
             <button 
               onClick={() => setShowPreview(!showPreview)}
               className={`
                 flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all
                 ${showPreview 
                   ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                   : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}
               `}
             >
               {showPreview ? (
                 <>
                   <CodeIcon className="w-3.5 h-3.5" />
                   <span>عرض الكود</span>
                 </>
               ) : (
                 <>
                   <Eye className="w-3.5 h-3.5" />
                   <span>معاينة حية</span>
                 </>
               )}
             </button>
           )}
           
           <button 
             onClick={handleDownload}
             className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
             title="Download File"
           >
             <Download className="w-3.5 h-3.5" />
           </button>

           <button 
            onClick={handleCopy}
            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {showPreview && isPreviewable ? (
        <div className="relative bg-slate-100 h-[500px] w-full border-t border-slate-200 animate-in fade-in duration-300">
          <iframe 
            srcDoc={getPreviewContent()}
            className="w-full h-full border-none bg-white"
            title="Live Preview"
            sandbox="allow-scripts"
          />
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 backdrop-blur text-white text-[10px] rounded flex items-center gap-1 pointer-events-none">
            <MonitorPlay className="w-3 h-3" />
            Live Preview Mode
          </div>
        </div>
      ) : (
        <pre className="p-5 overflow-x-auto text-sm font-mono leading-relaxed custom-scrollbar bg-[#1e1e1e] text-slate-300 h-auto max-h-[500px]">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
};

interface TableProps {
  rows: string[];
}

const Table: React.FC<TableProps> = ({ rows }) => {
  if (rows.length < 2) return null;

  const parseRow = (row: string) => {
    return row.split('|').filter((cell, i, arr) => {
      if (i === 0 && cell.trim() === '') return false;
      if (i === arr.length - 1 && cell.trim() === '') return false;
      return true;
    });
  };

  const headers = parseRow(rows[0]);
  const bodyRows = rows.slice(2).map(parseRow);

  return (
    <div className="overflow-x-auto my-8 border border-slate-200 rounded-xl shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {headers.map((header, i) => (
              <th key={i} className="px-6 py-4 text-start font-bold text-slate-700 tracking-wide whitespace-nowrap">
                {parseInline(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {bodyRows.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white hover:bg-slate-50 transition-colors' : 'bg-slate-50/50 hover:bg-slate-100 transition-colors'}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-6 py-4 text-slate-600 leading-relaxed">
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
  
  let keyCounter = 0;
  
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let currentLanguage = '';
  
  let inTable = false;
  let tableBuffer: string[] = [];

  let inList = false;
  let listBuffer: string[] = [];
  let listType: 'ul' | 'ol' = 'ul';

  const flushList = () => {
    if (listBuffer.length > 0) {
      if (listType === 'ul') {
        elements.push(
          <ul key={`list-${keyCounter++}`} className="list-disc list-outside mr-6 ml-4 mb-4 text-slate-600 space-y-1">
            {listBuffer.map((item, idx) => (
              <li key={idx} className="pl-1">{parseInline(item)}</li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`list-${keyCounter++}`} className="list-decimal list-outside mr-6 ml-4 mb-4 text-slate-600 space-y-1">
             {listBuffer.map((item, idx) => (
              <li key={idx} className="pl-1">{parseInline(item)}</li>
            ))}
          </ol>
        );
      }
      listBuffer = [];
    }
    inList = false;
  };

  const flushTable = () => {
    if (tableBuffer.length > 0) {
      elements.push(<Table key={`table-${keyCounter++}`} rows={tableBuffer} />);
      tableBuffer = [];
    }
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Check if we are entering or exiting a code block
    if (trimmedLine.startsWith('```')) {
      if (inList) flushList();
      if (inTable) flushTable();

      if (inCodeBlock) {
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
        inCodeBlock = true;
        currentLanguage = trimmedLine.replace('```', '') || 'code';
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Table Handling
    const looksLikeTable = trimmedLine.startsWith('|') && (trimmedLine.endsWith('|') || trimmedLine.split('|').length > 2);
    if (looksLikeTable) {
        if (inList) flushList();
        inTable = true;
        tableBuffer.push(line);
        if (i === lines.length - 1) flushTable();
        continue;
    } else if (inTable) {
        flushTable();
    }

    // List Handling
    const isUl = trimmedLine.startsWith('- ');
    const isOl = /^\d+\.\s/.test(trimmedLine);

    if (isUl || isOl) {
        const currentType = isUl ? 'ul' : 'ol';
        const content = isUl ? trimmedLine.substring(2) : trimmedLine.replace(/^\d+\.\s/, '');

        if (!inList) {
            inList = true;
            listType = currentType;
            listBuffer = [content];
        } else if (listType !== currentType) {
            // Switch list type
            flushList();
            inList = true;
            listType = currentType;
            listBuffer = [content];
        } else {
            listBuffer.push(content);
        }
        
        if (i === lines.length - 1) flushList();
        continue;
    } else if (inList) {
        flushList();
    }

    // Standard elements
    if (line.startsWith('### ')) {
      elements.push(<h3 key={keyCounter++} className="text-xl font-bold text-slate-800 mt-8 mb-4 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-primary before:rounded-full">{parseInline(line.replace('### ', ''))}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={keyCounter++} className="text-2xl font-bold text-slate-900 mt-10 mb-5 pb-2 border-b border-slate-200">{parseInline(line.replace('## ', ''))}</h2>);
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={keyCounter++} className="text-3xl font-extrabold text-slate-900 mt-8 mb-6 tracking-tight">{parseInline(line.replace('# ', ''))}</h1>);
    } else if (trimmedLine === '') {
      elements.push(<div key={keyCounter++} className="h-3"></div>);
    } else {
      elements.push(<p key={keyCounter++} className="text-slate-600 leading-8 mb-4 text-base">{parseInline(line)}</p>);
    }
  }

  return <div className="markdown-body font-sans dir-rtl max-w-none">{elements}</div>;
};