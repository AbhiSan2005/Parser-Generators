import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { saveGrammar, compileParser, evaluateTestString } from '../../api/playgroundClient';
import { generateCfgAI } from '../../api/engineClient';
import { setActivePlayground } from '../../store/playgroundSlice';
import { PLAYGROUND_PRESETS, formatGrammar } from '../../utils/presets';

/**
 * Converts multiline CFG input string into the JSON structure expected by the backend engine.
 * Uses robust tokenization and maps epsilon/e to ε.
 */
const parseGrammarTextToJSON = (cfgString, specifiedStartVar = null) => {
    const productions = {};
    const lines = cfgString.split('\n');
    let firstVar = null;

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        const parts = line.split(/(?:->|=>|=)/);
        if (parts.length < 2) continue;

        const head = parts[0].trim();
        if (!firstVar) firstVar = head;

        if (!productions[head]) productions[head] = [];

        const rhsString = parts.slice(1).join("->");
        const alternatives = rhsString.split('|');

        for (let alt of alternatives) {
            alt = alt.trim();
            if (!alt) continue;

            const tokens = alt.split(/\s+/).map(token => {
                if (token.toLowerCase() === 'epsilon' || token === 'e') return 'ε';
                return token;
            });

            productions[head].push(tokens);
        }
    }

    const variables = Object.keys(productions);
    const start_variable = specifiedStartVar || (variables.includes('S') ? 'S' : firstVar);

    const terminals = new Set();
    for (const head of variables) {
        for (const rule of productions[head]) {
            for (const symbol of rule) {
                if (!variables.includes(symbol) && symbol !== 'ε') {
                    terminals.add(symbol);
                }
            }
        }
    }

    return {
        variables,
        terminals: [...terminals].sort(),
        start_variable,
        productions
    };
};

const ParserInputMenu = ({ playground }) => {
    const dispatch = useDispatch();
    
    // Default grammar starter text if none exists in backend
    const defaultGrammar = "E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id";

    const [grammarText, setGrammarText] = useState(defaultGrammar);
    const [parserType, setParserType] = useState(playground?.parser_type || 'SLR1');
    const [testInput, setTestInput] = useState(playground?.evaluation_sandbox?.test_input || '');
    const [isCompiling, setIsCompiling] = useState(false);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [compileError, setCompileError] = useState(null);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Sync state if playground changes
    useEffect(() => {
        if (playground?.grammar_source?.productions) {
            const rules = Object.entries(playground.grammar_source.productions).map(([lhs, rhs]) => {
                // Join token arrays back to strings for display
                const rhsDisplays = rhs.map(altArray => Array.isArray(altArray) ? altArray.join(' ') : altArray);
                return `${lhs} -> ${rhsDisplays.join(' | ')}`;
            }).join('\n');
            if (rules.trim()) setGrammarText(rules);
        }
        if (playground?.parser_type) {
            setParserType(playground.parser_type);
        }
    }, [playground?.playground_id, playground?.grammar_source?.productions, playground?.parser_type]);

    const handleCompile = async () => {
        setIsCompiling(true);
        setCompileError(null);

        try {
            // 1. Convert user CFG text into JSON structure
            const parsedGrammar = parseGrammarTextToJSON(grammarText);

            if (!parsedGrammar.start_variable || Object.keys(parsedGrammar.productions).length === 0) {
                throw new Error("Invalid Grammar Format. Ensure rules use '->' (e.g. E -> E + T | T)");
            }

            // 2. Persist Grammar and Parser Type to Backend
            await saveGrammar(playground.playground_id, { 
                grammar_source: parsedGrammar, 
                parser_type: parserType 
            });
            
            // 3. Trigger Parser Table Compilation
            const compileRes = await compileParser(playground.playground_id);
            
            // 4. Update Redux state with compiled response
            dispatch(setActivePlayground(compileRes.data || compileRes));
        } catch (error) {
            console.error("Compilation error:", error);
            const backendMsg = error.response?.data?.message || error.response?.data?.error || error.message;
            setCompileError(backendMsg);
        } finally {
            setIsCompiling(false);
        }
    };

    const handleGenerateWithAI = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        setCompileError(null);
        try {
            const result = await generateCfgAI(aiPrompt.trim());
            if (!result?.success) throw new Error(result?.Error || 'Generation failed.');
            const generatedGrammar = formatGrammar(result.data);
            if (!generatedGrammar) throw new Error('The response did not contain a usable grammar.');
            setGrammarText(generatedGrammar);
            setAiPrompt('');
        } catch (error) {
            setCompileError(error.response?.data?.Error || error.message || 'AI generation failed.');
        } finally {
            setIsGenerating(false);
        }
    };

    const applyGrammarPreset = (presetId) => {
        const preset = PLAYGROUND_PRESETS.find(example => example.id === presetId);
        if (!preset) return;
        setGrammarText(preset.value);
        setParserType(preset.parserType);
        setTestInput(preset.testString);
    };

    const handleEvaluate = async () => {
        if (!testInput) return;
        setIsEvaluating(true);
        try {
            console.log(testInput);
            const evalRes = await evaluateTestString(playground.playground_id, testInput);
            console.log(evalRes);
            dispatch(setActivePlayground({
                ...playground,
                evaluation_sandbox: evalRes.sandbox || evalRes.data?.sandbox || evalRes
            }));
        } catch (error) {
            console.error("Evaluation error:", error);
        } finally {
            setIsEvaluating(false);
        }
    };

    return (
        <div className="bg-mocha-mantle border border-mocha-surface0 rounded-xl p-6 shadow-md flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Column: CFG Rule Input & Compiler */}
                <div className="flex flex-col gap-3 lg:border-r border-mocha-surface0 lg:pr-6">
                    <div className="flex flex-wrap justify-between items-end gap-2">
                        <label className="text-xs font-bold text-mocha-mauve uppercase tracking-wider">
                            Context-Free Grammar
                        </label>
                        <select defaultValue="" onChange={(event) => applyGrammarPreset(event.target.value)} className="bg-mocha-crust border border-mocha-surface1 text-mocha-subtext0 rounded-md p-1.5 text-xs">
                            <option value="">Load example...</option>
                            {PLAYGROUND_PRESETS.map(preset => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
                        </select>
                        <select 
                            value={parserType}
                            onChange={(e) => setParserType(e.target.value)}
                            className="bg-mocha-crust border border-mocha-surface1 text-mocha-text rounded-md p-1.5 outline-none focus:border-mocha-mauve cursor-pointer text-xs font-bold"
                        >
                            <option value="LL1">LL(1) Top-Down</option>
                            <option value="LR0">LR(0) Bottom-Up</option>
                            <option value="SLR1">SLR(1) Bottom-Up</option>
                        </select>
                    </div>

                    <textarea 
                        value={grammarText}
                        onChange={(e) => setGrammarText(e.target.value)}
                        placeholder="E -> E + T | T&#10;T -> T * F | F&#10;F -> ( E ) | id"
                        className="w-full bg-mocha-crust border border-mocha-surface1 text-mocha-text rounded-lg p-3 outline-none focus:border-mocha-mauve font-mono text-sm min-h-[140px] shadow-inner custom-scrollbar"
                    />

                    <div className="flex gap-2">
                        <input value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} placeholder="Describe the language for a CFG" className="min-w-0 flex-1 bg-mocha-crust border border-mocha-surface1 text-mocha-text rounded-md px-3 py-2 text-sm outline-none focus:border-mocha-mauve" />
                        <button type="button" onClick={handleGenerateWithAI} disabled={!aiPrompt.trim() || isGenerating} className="shrink-0 rounded-md bg-mocha-mauve px-3 py-2 text-xs font-bold text-mocha-crust disabled:opacity-50">{isGenerating ? 'Generating...' : 'Ask AI'}</button>
                    </div>

                    {compileError && (
                        <div className="p-3 bg-mocha-red/10 border border-mocha-red/30 rounded-lg text-mocha-red text-xs font-mono">
                            ⚠️ {compileError}
                        </div>
                    )}

                    <button 
                        onClick={handleCompile}
                        disabled={isCompiling}
                        className="w-full py-2.5 rounded-lg font-bold bg-mocha-mauve text-mocha-crust hover:bg-opacity-90 transition shadow-sm disabled:opacity-50 cursor-pointer text-sm"
                    >
                        {isCompiling ? 'Compiling Table...' : 'Compile Parser'}
                    </button>
                </div>

                {/* Right Column: String Test Execution */}
                <div className="flex flex-col gap-3 justify-between">
                    <div>
                        <label className="text-xs font-bold text-mocha-blue uppercase tracking-wider block mb-2">
                            String Validation Test
                        </label>
                        <input 
                            type="text" 
                            value={testInput}
                            onChange={(e) => setTestInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleEvaluate()}
                            placeholder="e.g. id + id * id"
                            className="w-full bg-mocha-crust border border-mocha-surface1 text-mocha-text rounded-lg p-3 outline-none focus:border-mocha-blue font-mono text-sm shadow-inner tracking-wide"
                        />
                    </div>

                    {/* Simulation Status Card */}
                    <div className="flex-grow flex items-center justify-center p-4 rounded-lg bg-mocha-crust border border-mocha-surface0 min-h-[80px]">
                        {playground?.evaluation_sandbox?.status === 'ACCEPTED' && (
                            <span className="text-mocha-green font-bold text-sm">✅ String Accepted</span>
                        )}
                        {playground?.evaluation_sandbox?.status === 'REJECTED' && (
                            <div className="text-center">
                                <span className="text-mocha-red font-bold text-sm">❌ Syntax Error</span>
                                <p className="text-mocha-subtext0 text-xs mt-1 font-mono">
                                    {playground.evaluation_sandbox.error_message || 'Token string rejected by parser table'}
                                </p>
                            </div>
                        )}
                        {(!playground?.evaluation_sandbox?.status || playground?.evaluation_sandbox?.status === 'IDLE') && (
                            <span className="text-mocha-surface2 text-xs">Awaiting Input String Evaluation...</span>
                        )}
                    </div>

                    <button 
                        onClick={handleEvaluate}
                        disabled={isEvaluating || !testInput}
                        className="w-full py-2.5 rounded-lg font-bold bg-mocha-blue text-mocha-crust hover:bg-opacity-90 transition shadow-sm disabled:opacity-50 cursor-pointer text-sm"
                    >
                        {isEvaluating ? 'Parsing Input...' : 'Evaluate String'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ParserInputMenu;