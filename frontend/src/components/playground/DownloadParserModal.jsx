// src/components/playground/DownloadParserModal.jsx
import React, { useState } from 'react';

const DownloadParserModal = ({ isOpen, onClose, generatedCode, parserType, playgroundName }) => {
    const [selectedLang, setSelectedLang] = useState('javascript');
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const code = generatedCode?.[selectedLang] || `// Generated code for ${selectedLang} is not available yet.`;

    const getFileExtension = () => {
        if (selectedLang === 'javascript') return 'js';
        if (selectedLang === 'python') return 'py';
        if (selectedLang === 'cpp') return 'cpp';
        return 'txt';
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const sanitizedTitle = (playgroundName || 'parser').toLowerCase().replace(/[^a-z0-9]/g, '_');
        const fileName = `${sanitizedTitle}_${parserType.toLowerCase()}_parser.${getFileExtension()}`;
        
        const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mocha-crust/80 backdrop-blur-sm p-4">
            <div className="bg-mocha-base border border-mocha-surface0 rounded-xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
                
                {/* Modal Header */}
                <div className="p-6 border-b border-mocha-surface0 flex justify-between items-center bg-mocha-mantle shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-mocha-mauve flex items-center gap-2">
                            <span>📥</span> Export Standalone Parser
                        </h2>
                        <p className="text-xs text-mocha-subtext0 mt-1">Download ready-to-run parser source code for your custom grammar.</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-mocha-subtext0 hover:text-mocha-text text-xl font-bold p-1 transition-colors cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Language Tabs */}
                <div className="flex border-b border-mocha-surface0 bg-mocha-crust px-6 pt-3 gap-2 shrink-0">
                    {['javascript', 'python', 'cpp'].map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setSelectedLang(lang)}
                            className={`px-4 py-2 font-bold text-xs uppercase rounded-t-lg transition-colors border-t border-x ${
                                selectedLang === lang
                                ? 'bg-mocha-base text-mocha-green border-mocha-surface0 border-b-mocha-base'
                                : 'text-mocha-subtext0 border-transparent hover:text-mocha-text'
                            }`}
                        >
                            {lang === 'cpp' ? 'C++' : lang}
                        </button>
                    ))}
                </div>

                {/* Code Preview Box */}
                <div className="p-4 flex-grow overflow-y-auto custom-scrollbar bg-[#11111b]">
                    <pre className="font-mono text-xs text-mocha-text whitespace-pre-wrap leading-relaxed">
                        {code}
                    </pre>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-mocha-surface0 bg-mocha-mantle flex justify-between items-center shrink-0">
                    <button
                        onClick={handleCopy}
                        className="px-4 py-2 rounded-lg border border-mocha-surface0 bg-mocha-crust hover:bg-mocha-surface0 text-mocha-text font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <span>{copied ? '✅' : '📋'}</span> {copied ? 'Copied!' : 'Copy Code'}
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-mocha-subtext0 hover:bg-mocha-surface0 transition-colors font-bold text-xs cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDownload}
                            className="px-5 py-2 rounded-lg bg-mocha-green text-mocha-crust font-bold text-xs hover:bg-opacity-90 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                            <span>💾</span> Download .{getFileExtension()}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DownloadParserModal;