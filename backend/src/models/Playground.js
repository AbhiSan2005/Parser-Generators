import mongoose from 'mongoose';
import { v4 as uuidv4 } from "uuid";

const PlaygroundSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        index: true 
    },
    playground_id: {
        type: String,
        default: () => uuidv4().substring(0, 8),
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        default: 'Untitled Parser Playground'
    },
    description: {
        type: String,
        trim: true,
        default: 'A playground sandbox for custom compiler generation.'
    },
    parser_type: {
        type: String,
        required: true,
        enum: ['LL1', 'LR0', 'SLR1'], // Added LR0 here!
        default: 'SLR1'
    },
    grammar_source: {
        variables: {
            type: [String],
            default: []
        },
        terminals: {
            type: [String],
            default: []
        },
        start_variable: {
            type: String,
            default: '' // Removed required constraint to enable true empty initial state
        },
        productions: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    compiled_data: {
        has_conflicts: {
            type: Boolean,
            required: true,
            default: false
        },
        conflicts: {
            type: [String],
            default: []
        },
        item_sets: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        parse_table: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        generated_code: {
            javascript: { type: String, default: '' },
            python: { type: String, default: '' },
            cpp: { type: String, default: '' }
        },
        last_compiled_at: {
            type: Date,
            default: null
        }
    },
    evaluation_sandbox: {
        test_input: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            enum: ['IDLE', 'ACCEPTED', 'REJECTED'],
            default: 'IDLE'
        },
        error_message: {
            type: String,
            default: null
        },
        abstract_syntax_tree: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        }
    }
}, {
    timestamps: true
});

const Playground = mongoose.model('Playground', PlaygroundSchema, 'playgrounds');
export default Playground;