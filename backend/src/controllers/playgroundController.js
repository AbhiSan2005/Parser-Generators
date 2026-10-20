import Playground from '../models/Playground.js';
import { generateBottomUpParser } from '../services/bottomUpService.js';
// 1. Import your Top-Down Pipeline and Engine
import { runLL1Pipeline } from '../services/topDownService.js';
import { simulateLL1 } from '../utils/topDown/ll1Engine.js';
import { tokenize } from '../utils/tokenizer.js';
import { simulateShiftReduceParsing } from '../utils/bottomUp/shiftReduceEngine.js';

export const createPlayground = async (req, res) => {
    try {
        // Removed 'title' and added 'description' to map perfectly to the schema
        const { name, description, user_id } = req.body;

        const newPlayground = new Playground({
            name: name || 'Untitled Parser Playground',
            description: description || 'A playground sandbox for custom compiler generation.',
            user_id,
            grammar_source: {
                variables: [],
                terminals: [],
                start_variable: '',
                productions: {}
            },
            parser_type: 'SLR1'
        });

        const savedPlayground = await newPlayground.save();
        res.status(201).json(savedPlayground);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create playground', details: error.message });
    }
};

export const getPlayground = async (req, res) => {
    try {
        const playground = await Playground.findOne({ playground_id: req.params.id });
        if (!playground) return res.status(404).json({ error: 'Playground not found' });

        res.status(200).json(playground);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch playground', details: error.message });
    }
};

export const getUserPlaygrounds = async (req, res) => {
    try {
        const playgrounds = await Playground.find({ user_id: req.params.userId }).sort({ updatedAt: -1 });
        res.status(200).json(playgrounds);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user playgrounds', details: error.message });
    }
};

export const updatePlayground = async (req, res) => {
    try {
        const { name, description } = req.body;

        const updatedPlayground = await Playground.findOneAndUpdate(
            { playground_id: req.params.id },
            { $set: { name, description } },
            { new: true }
        );

        if (!updatedPlayground) return res.status(404).json({ error: 'Playground not found' });

        res.status(200).json(updatedPlayground);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update playground', details: error.message });
    }
};

export const saveGrammar = async (req, res) => {
    try {
        const { grammar, grammar_source, parser_type } = req.body;

        const updatedPlayground = await Playground.findOneAndUpdate(
            { playground_id: req.params.id },
            {
                grammar_source: grammar_source || grammar,
                parser_type
            },
            { new: true }
        );

        if (!updatedPlayground) return res.status(404).json({ error: 'Playground not found' });

        res.status(200).json({ message: 'Grammar saved successfully', playground: updatedPlayground });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save grammar', details: error.message });
    }
};

export const compileParser = async (req, res) => {
    try {
        const playground = await Playground.findOne({ playground_id: req.params.id });
        if (!playground) return res.status(404).json({ error: 'Playground not found' });

        const grammarSource = playground.grammar_source;
        const parserType = playground.parser_type;

        if (!grammarSource.start_variable || Object.keys(grammarSource.productions || {}).length === 0) {
            return res.status(400).json({ error: 'Cannot compile: Grammar source parameters are incomplete.' });
        }

        let compilerOutput;

        try {
            if (parserType === 'LR0' || parserType === 'SLR1') {
                compilerOutput = generateBottomUpParser(grammarSource, parserType);
            } else if (parserType === 'LL1') {
                // 2. Link your LL(1) compilation service here
                const topDownResult = runLL1Pipeline(grammarSource);
                
                // Map your output to the unified format expected by the database schema
                compilerOutput = {
                    has_conflicts: !topDownResult.parser_data.is_ll1_compliant,
                    conflicts: topDownResult.parser_data.conflicts,
                    item_sets: {}, // LL(1) does not use item sets
                    parse_table: topDownResult.parser_data.parsing_table,
                    generated_code: {
                        javascript: topDownResult.parser_data.generated_code || '',
                        python: '',
                        cpp: ''
                    }
                };
            } else {
                return res.status(400).json({ error: `Unsupported parser type choice: ${parserType}` });
            }
        } catch (mathError) {
            return res.status(422).json({ error: 'Compilation Math Failed', details: mathError.message });
        }

        playground.compiled_data = {
            has_conflicts: compilerOutput.has_conflicts,
            conflicts: compilerOutput.conflicts,
            item_sets: compilerOutput.item_sets,
            parse_table: compilerOutput.parse_table,
            generated_code: compilerOutput.generated_code,
            last_compiled_at: Date.now()
        };

        const savedPlayground = await playground.save();

        res.status(200).json({
            message: 'Compilation successful!',
            has_conflicts: savedPlayground.compiled_data.has_conflicts,
            conflicts: savedPlayground.compiled_data.conflicts,
            data: savedPlayground
        });

    } catch (error) {
        res.status(500).json({ error: 'Server error during compilation execution', details: error.message });
    }
};

export const evaluateTestString = async (req, res) => {
    try {
        const { test_input } = req.body;

        const playground = await Playground.findOne({ playground_id: req.params.id });
        if (!playground) return res.status(404).json({ error: 'Playground not found' });

        const parseTable = playground.compiled_data?.parse_table;
        const grammarSource = playground.grammar_source;
        const parserType = playground.parser_type;

        // Check for table existence based on parser type
        const isTableValid = parserType === 'LL1' 
            ? Object.keys(parseTable || {}).length > 0 
            : (parseTable && parseTable.action && Object.keys(parseTable.action).length > 0);

        if (!isTableValid) {
            return res.status(400).json({ error: 'Parser has not been compiled yet. Please compile first.' });
        }

        let sandboxState = {
            test_input: test_input || '',
            status: 'IDLE',
            error_message: null,
            abstract_syntax_tree: null
        };

        if (test_input && test_input.trim() !== '') {
            try {
                const tokens = tokenize(test_input, grammarSource.terminals);
                let result;

                // 3. Route the evaluation to the correct simulator engine
                if (parserType === 'LL1') {
                    result = simulateLL1(parseTable, grammarSource.start_variable, tokens);
                    sandboxState = {
                        test_input,
                        status: result.isAccepted ? 'ACCEPTED' : 'REJECTED',
                        error_message: result.isAccepted ? null : 'Syntax error encountered during LL(1) parsing.',
                        abstract_syntax_tree: result.steps // For LL1, we store the step-by-step frames here
                    };
                } else {
                    result = simulateShiftReduceParsing(
                        tokens,
                        parseTable.action,
                        parseTable.goto,
                        parseTable.indexed_rules
                    );
                    sandboxState = {
                        test_input,
                        status: result.status,
                        error_message: result.error_message,
                        abstract_syntax_tree: result.abstract_syntax_tree
                    };
                }

            } catch (err) {
                sandboxState = {
                    test_input,
                    status: 'REJECTED',
                    error_message: err.message,
                    abstract_syntax_tree: null
                };
            }
        }

        playground.evaluation_sandbox = sandboxState;
        const savedPlayground = await playground.save();

        res.status(200).json({
            message: 'Evaluation complete',
            sandbox: savedPlayground.evaluation_sandbox
        });

    } catch (error) {
        res.status(500).json({ error: 'Server error during evaluation', details: error.message });
    }
};

export const deletePlayground = async (req, res) => {
    try {
        const deleted = await Playground.findOneAndDelete({ playground_id: req.params.id });
        if (!deleted) return res.status(404).json({ error: 'Playground not found' });

        res.status(200).json({ message: 'Playground deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete playground', details: error.message });
    }
};