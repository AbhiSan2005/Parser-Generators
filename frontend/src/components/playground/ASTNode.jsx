// src/components/playground/ASTNode.jsx
import { Handle, Position } from '@xyflow/react';

const ASTNode = ({ data }) => {
    const isTerminal = data.isTerminal;

    return (
        <div className={`relative flex min-h-12 items-center justify-center rounded-full border font-mono font-bold shadow-lg ${
            isTerminal 
            ? 'bg-[#18302d] border-mocha-green/70 text-mocha-green shadow-[0_5px_18px_rgba(166,227,161,0.10)]'
            : 'bg-[#25243a] border-mocha-mauve/80 text-mocha-text shadow-[0_7px_22px_rgba(203,166,247,0.16)]'
        }`}>
            <Handle type="target" position={Position.Top} className="!h-1.5 !w-1.5 !border-0 !bg-mocha-subtext0/70" />
            
            <div className="max-w-[176px] truncate px-4 py-2 text-center text-xs" title={data.label}>
                {data.label}
            </div>
            
            <Handle type="source" position={Position.Bottom} className="!h-1.5 !w-1.5 !border-0 !bg-mocha-subtext0/70" />
        </div>
    );
};

export default ASTNode;