// src/components/playground/PlaygroundHeader.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DownloadParserModal from './DownloadParserModal';

const PlaygroundHeader = ({ playground }) => {
    const navigate = useNavigate();
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

    const compiledData = playground?.compiled_data;
    const hasCompiled = Boolean(compiledData?.last_compiled_at);
    const hasConflicts = compiledData?.has_conflicts;

    return (
        <>
            <header className="bg-mocha-mantle border-b border-mocha-surface0 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 shadow-sm">
                
                {/* Left Section: Back button & Title */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/playgrounds')}
                        className="p-2 bg-mocha-crust hover:bg-mocha-surface0 text-mocha-subtext0 hover:text-mocha-text rounded-lg border border-mocha-surface0 transition-colors cursor-pointer"
                        title="Back to Playgrounds"
                    >
                        ← Back
                    </button>
                    
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-mocha-text">
                                {playground?.name || 'Untitled Parser Playground'}
                            </h1>
                            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-mocha-surface0 text-mocha-mauve border border-mocha-surface1">
                                {playground?.parser_type || 'SLR1'}
                            </span>
                        </div>
                        <p className="text-xs text-mocha-subtext0 mt-0.5 max-w-xl truncate">
                            {playground?.description || 'A playground sandbox for custom compiler generation.'}
                        </p>
                    </div>
                </div>

                {/* Right Section: Compile Status & Actions */}
                <div className="flex items-center gap-3">
                    
                    {/* Status Badge */}
                    {hasCompiled ? (
                        hasConflicts ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-mocha-red/10 border border-mocha-red/30 text-mocha-red text-xs font-bold">
                                <span>⚠️</span> Conflicts Detected ({compiledData?.conflicts?.length || 0})
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-mocha-green/10 border border-mocha-green/30 text-mocha-green text-xs font-bold">
                                <span>✅</span> Valid Parser
                            </div>
                        )
                    ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-mocha-surface0 border border-mocha-surface1 text-mocha-surface2 text-xs font-bold">
                            <span>⏳</span> Uncompiled
                        </div>
                    )}

                    {/* Download Button */}
                    <button 
                        onClick={() => setIsDownloadModalOpen(true)}
                        disabled={!hasCompiled}
                        className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
                            hasCompiled 
                            ? 'bg-mocha-mauve text-mocha-crust hover:bg-opacity-90 shadow-md cursor-pointer' 
                            : 'bg-mocha-surface0 text-mocha-surface2 border border-mocha-surface1 cursor-not-allowed opacity-60'
                        }`}
                    >
                        <span>📥</span> Download Parser
                    </button>
                </div>
            </header>

            {/* Modal */}
            <DownloadParserModal 
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
                generatedCode={compiledData?.generated_code}
                parserType={playground?.parser_type}
                playgroundName={playground?.name}
            />
        </>
    );
};

export default PlaygroundHeader;