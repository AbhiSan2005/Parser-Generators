import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setActivePlayground, setPlaygroundLoading } from '../store/playgroundSlice';
import { getPlayground } from '../api/playgroundClient';
import PlaygroundHeader from '../components/playground/PlaygroundHeader';
import ParserInputMenu from '../components/playground/ParserInputMenu';
import ASTCanvas from '../components/playground/ASTCanvas';
import ParserAnalysisPanel from '../components/playground/ParserAnalysisPanel';

const PlaygroundView = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { activePlayground, loading } = useSelector((state) => state.playground);
    const [activeView, setActiveView] = useState('AST'); // 'AST' | 'ANALYSIS'

    useEffect(() => {
        const fetchPlaygroundData = async () => {
            dispatch(setPlaygroundLoading(true));
            try {
                const data = await getPlayground(id);
                dispatch(setActivePlayground(data));
            } catch (error) {
                console.error("Failed to load playground:", error);
                navigate('/playgrounds');
            } finally {
                dispatch(setPlaygroundLoading(false));
            }
        };
        fetchPlaygroundData();
    }, [id, dispatch, navigate]);

    if (loading || !activePlayground) {
        return (
            <div className="flex-grow flex items-center justify-center bg-mocha-base h-full text-mocha-subtext0">
                <span className="animate-pulse text-xl font-mono">Loading Sandbox Engine...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full bg-mocha-base overflow-y-auto custom-scrollbar">
            {/* Top Fixed Header */}
            <PlaygroundHeader playground={activePlayground} />
            
            {/* Scrollable Body Content */}
            <main className="p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full flex-grow">
                
                {/* 1. CENTRAL DISPLAY WINDOW (AST Canvas vs Parser Analysis Switcher) */}
                <div className="bg-mocha-mantle border border-mocha-surface0 rounded-xl overflow-hidden shadow-lg flex flex-col h-[520px] shrink-0">
                    
                    {/* View Switcher Header Bar */}
                    <div className="bg-mocha-crust border-b border-mocha-surface0 px-4 py-3 flex justify-between items-center shrink-0">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveView('AST')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                    activeView === 'AST'
                                    ? 'bg-mocha-mauve text-mocha-crust shadow-sm'
                                    : 'bg-mocha-surface0 text-mocha-subtext0 hover:text-mocha-text hover:bg-mocha-surface1'
                                }`}
                            >
                                <span>🌳</span> Parse Tree (AST)
                            </button>
                            
                            <button
                                onClick={() => setActiveView('ANALYSIS')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                    activeView === 'ANALYSIS'
                                    ? 'bg-mocha-mauve text-mocha-crust shadow-sm'
                                    : 'bg-mocha-surface0 text-mocha-subtext0 hover:text-mocha-text hover:bg-mocha-surface1'
                                }`}
                            >
                                <span>📊</span> Parser Analysis & Tables
                            </button>
                        </div>

                        <span className="text-xs text-mocha-surface2 font-mono hidden sm:block">
                            {activeView === 'AST' ? 'Visualizing Tree Nodes' : 'FIRST/FOLLOW & Parsing Tables'}
                        </span>
                    </div>

                    {/* Viewport Display Area */}
                    <div className="flex-grow relative overflow-hidden bg-[#11111b]">
                        {activeView === 'AST' ? (
                            <ASTCanvas sandboxData={activePlayground.evaluation_sandbox} />
                        ) : (
                            <ParserAnalysisPanel 
                                compiledData={activePlayground.compiled_data} 
                                type={activePlayground.parser_type} 
                            />
                        )}
                    </div>
                </div>

                {/* 2. INPUT & EVALUATION MENU (Positioned Below Canvas) */}
                <div className="w-full">
                    <ParserInputMenu playground={activePlayground} />
                </div>
                
            </main>
        </div>
    );
};

export default PlaygroundView;