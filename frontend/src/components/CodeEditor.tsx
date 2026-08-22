import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  language: 'cpp' | 'python' | 'java';
  value: string;
  onChange: (value: string | undefined) => void;
  onLanguageChange: (lang: 'cpp' | 'python' | 'java') => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  value,
  onChange,
  onLanguageChange
}) => {
  const monacoLangMap: Record<string, string> = {
    cpp: 'cpp',
    python: 'python',
    java: 'java'
  };

  return (
    <div className="flex flex-col h-[480px] w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Editor Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">LANGUAGE:</span>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as 'cpp' | 'python' | 'java')}
            className="bg-slate-800 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="cpp">C++ (GCC 12 / C++17)</option>
            <option value="python">Python 3 (3.10)</option>
            <option value="java">Java (OpenJDK 17)</option>
          </select>
        </div>
        <span className="text-xs text-slate-500 font-mono">Monaco Editor v0.46</span>
      </div>

      {/* Editor Main Canvas with explicit height and flex grow */}
      <div className="flex-1 w-full relative bg-[#1e1e1e] min-h-[420px]">
        <Editor
          height="100%"
          width="100%"
          language={monacoLangMap[language]}
          value={value}
          onChange={onChange}
          theme="vs-dark"
          loading={
            <div className="flex items-center justify-center h-full text-slate-500 text-xs">
              Loading Monaco Editor...
            </div>
          }
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            lineNumbers: 'on',
            folding: true,
            renderLineHighlight: 'all',
            fontFamily: "'Fira Code', 'Courier New', monospace"
          }}
        />
      </div>
    </div>
  );
};
