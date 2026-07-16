import Playground from '../models/Playground.js';
import { generateBottomUpParser } from '../services/bottomUpService.js';
// import { generateTopDownParser } from '../services/topDownService.js'; // Abhiraj's service

export const createPlayground = async (req, res) => {
    try {
        const { title, user_id } = req.body;
        
        const newPlayground = new Playground({
            title: title || 'Untitled Parser',
            user_id,
            grammar: {
                variables: [],
                terminals: [],
                start_variable: '',
                productions: {}
            },
            parser_type: 'SLR1' // Default type
        });

        const savedPlayground = await newPlayground.save();
        res.status(201).json(savedPlayground);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create playground', details: error.message });
    }
};

export const getPlayground = async (req, res) => {
    try {
        const playground = await Playground.findById(req.params.id);
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
        const { grammar, parser_type } = req.body;
        
        const updatedPlayground = await Playground.findByIdAndUpdate(
            req.params.id,
            { grammar, parser_type },
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
        const playground = await Playground.findById(req.params.id);
        if (!playground) return res.status(404).json({ error: 'Playground not found' });

        const grammar = playground.grammar;
        const parserType = playground.parser_type;

        // Basic validation before sending to the math engine
        if (!grammar.start_variable || Object.keys(grammar.productions).length === 0) {
            return res.status(400).json({ error: 'Cannot compile: Grammar is empty or missing a start variable.' });
        }

        let compilerOutput;

        try {
            // Route to the appropriate mathematical service
            if (parserType === 'LR0' || parserType === 'SLR1') {
                compilerOutput = generateBottomUpParser(grammar, parserType);
            } else if (parserType === 'LL1') {
                // Abhiraj remove the return and uncomment this after you have completed you code
                // compilerOutput = generateTopDownParser(grammar);
                return res.status(501).json({ error: 'LL(1) compilation service not yet linked.' });
            } else {
                return res.status(400).json({ error: `Unsupported parser type: ${parserType}` });
            }
        } catch (mathError) {
            // Catch mathematical or syntax errors from the utilities (e.g., infinite loops aborted)
            return res.status(422).json({ error: 'Compilation Failed', details: mathError.message });
        }

        playground.has_conflicts = compilerOutput.has_conflicts;
        playground.conflicts = compilerOutput.conflicts;
        playground.item_sets = compilerOutput.item_sets;
        playground.parse_table = compilerOutput.parse_table;
        playground.generated_code = compilerOutput.generated_code;
        playground.last_compiled_at = Date.now();

        const savedPlayground = await playground.save();

        res.status(200).json({
            message: 'Compilation successful!',
            has_conflicts: savedPlayground.has_conflicts,
            conflicts: savedPlayground.conflicts,
            data: savedPlayground
        });

    } catch (error) {
        res.status(500).json({ error: 'Server error during compilation', details: error.message });
    }
};

export const deletePlayground = async (req, res) => {
    try {
        const deleted = await Playground.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Playground not found' });
        
        res.status(200).json({ message: 'Playground deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete playground', details: error.message });
    }
};