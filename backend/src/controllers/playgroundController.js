import Playground from '../models/Playground.js';
import { generateBottomUpParser } from '../services/bottomUpService.js';
import { tokenize } from '../utils/tokenizer.js';
import { simulateShiftReduceParsing } from '../utils/bottomup/shiftReduceEngine.js';

export const createPlayground = async (req, res) => {
    try {
        const { title, name, user_id } = req.body;

        const newPlayground = new Playground({
            name: name || title || 'Untitled Parser Playground',
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
                return res.status(501).json({ error: 'LL(1) top-down compilation engine not linked yet.' });
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

        // 1. Fetch the playground using the custom 8-character ID
        const playground = await Playground.findOne({ playground_id: req.params.id });
        if (!playground) return res.status(404).json({ error: 'Playground not found' });

        // 2. Ensure the parser has actually been compiled
        const parseTable = playground.compiled_data?.parse_table;
        const grammarSource = playground.grammar_source;

        if (!parseTable || !parseTable.action || Object.keys(parseTable.action).length === 0) {
            return res.status(400).json({ error: 'Parser has not been compiled yet. Please compile first.' });
        }

        let sandboxState = {
            test_input: test_input || '',
            status: 'IDLE',
            error_message: null,
            abstract_syntax_tree: null
        };

        // 3. Run the Evaluation Engine
        if (test_input && test_input.trim() !== '') {
            try {
                const tokens = tokenize(test_input, grammarSource.terminals);
                const result = simulateShiftReduceParsing(
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
            } catch (err) {
                // Catches lexical errors (e.g., unrecognized tokens)
                sandboxState = {
                    test_input,
                    status: 'REJECTED',
                    error_message: err.message,
                    abstract_syntax_tree: null
                };
            }
        }

        // 4. Save the results back to the database
        playground.evaluation_sandbox = sandboxState;
        const savedPlayground = await playground.save();

        // 5. Send the AST and status back to the frontend
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