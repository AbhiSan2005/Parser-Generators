// src/components/playground/ASTNode.jsx
import React from 'react';
import { Handle, Position } from '@xyflow/react';

const ASTNode = ({ data }) => {
    const isTerminal = data.isTerminal;

    return (
        <div className={`px-4 py-2 rounded shadow-md border-2 font-mono font-bold ${
            isTerminal 
            ? 'bg-mocha-crust border-mocha-green text-mocha-green' // Terminals (leaves)
            : 'bg-mocha-mantle border-mocha-blue text-mocha-text'  // Non-terminals
        }`}>
            <Handle type="target" position={Position.Top} className="!bg-transparent !border-none" />
            
            <div className="flex items-center justify-center">
                {data.label}
            </div>
            
            <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none" />
        </div>
    );
};

export default ASTNode;