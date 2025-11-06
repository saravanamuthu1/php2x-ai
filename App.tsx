
import React, { useState, useCallback } from 'react';
import { TARGET_LANGUAGES } from './constants';
import { convertCode } from './services/geminiService';
import { LanguageOption } from './types';
import { CopyIcon, ConvertIcon } from './components/icons';
import { Spinner } from './components/Spinner';

const App: React.FC = () => {
  const [phpCode, setPhpCode] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<LanguageOption>(TARGET_LANGUAGES[0]);
  const [convertedCode, setConvertedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');

  const handleConvert = useCallback(async () => {
    if (!phpCode.trim()) {
      setError('Please enter some PHP code to convert.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setConvertedCode('');
    setCopySuccess('');

    try {
      const result = await convertCode(phpCode, targetLanguage.label);
      const codeBlockRegex = /```(?:\w+)?\n([\s\S]+?)\n```/;
      const match = result.match(codeBlockRegex);
      setConvertedCode(match ? match[1].trim() : result.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setConvertedCode('');
    } finally {
      setIsLoading(false);
    }
  }, [phpCode, targetLanguage]);

  const handleCopy = useCallback(() => {
    if (!convertedCode) return;
    navigator.clipboard.writeText(convertedCode).then(() => {
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
      setCopySuccess('Failed to copy');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  }, [convertedCode]);

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <div className="container mx-auto px-4 py-8">
        
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
            PHP Code Modernizer
          </h1>
          <p className="text-lg text-text-secondary mt-2">
            Convert legacy PHP to modern languages with the power of AI.
          </p>
        </header>

        <main>
          <div className="bg-card shadow-lg rounded-lg p-4 md:p-6 border border-border">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
              <div className="w-full sm:w-auto">
                <label htmlFor="language-select" className="sr-only">Target Language</label>
                <select
                  id="language-select"
                  value={targetLanguage.value}
                  onChange={(e) => {
                    const selected = TARGET_LANGUAGES.find(lang => lang.value === e.target.value);
                    if (selected) setTargetLanguage(selected);
                  }}
                  className="w-full sm:w-48 bg-secondary border border-border rounded-md px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {TARGET_LANGUAGES.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleConvert}
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white font-semibold rounded-md shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    Converting...
                  </>
                ) : (
                  <>
                    <ConvertIcon />
                    Convert
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6" role="alert">
                <p><span className="font-bold">Error:</span> {error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PHP Code Input */}
              <div>
                <label htmlFor="php-input" className="block text-sm font-medium text-text-secondary mb-2">PHP Code</label>
                <textarea
                  id="php-input"
                  value={phpCode}
                  onChange={(e) => setPhpCode(e.target.value)}
                  placeholder="Paste your PHP code here..."
                  className="w-full h-96 p-4 font-mono text-sm bg-secondary border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Converted Code Output */}
              <div className="relative">
                 <label htmlFor="converted-output" className="block text-sm font-medium text-text-secondary mb-2">Converted to {targetLanguage.label}</label>
                 <div id="converted-output" className="w-full h-96 bg-secondary border border-border rounded-md overflow-auto relative">
                    <button 
                        onClick={handleCopy}
                        disabled={!convertedCode || isLoading}
                        className="absolute top-2 right-2 p-2 rounded-md bg-gray-700/50 hover:bg-gray-600/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-text-secondary"
                        aria-label="Copy code"
                    >
                        <CopyIcon />
                    </button>
                    {copySuccess && <span className="absolute top-3 right-12 text-sm text-green-400 bg-gray-900/70 px-2 py-1 rounded-md">{copySuccess}</span>}
                    
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <Spinner />
                                <p className="mt-2 text-text-secondary">AI is working its magic...</p>
                            </div>
                        </div>
                    ) : (
                        <pre className="p-4 h-full"><code className={`language-${targetLanguage.value} font-mono text-sm whitespace-pre-wrap`}>
                            {convertedCode || <span className="text-gray-500">Converted code will appear here...</span>}
                        </code></pre>
                    )}
                 </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
