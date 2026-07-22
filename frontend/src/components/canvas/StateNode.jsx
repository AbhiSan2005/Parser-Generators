import React from 'react';
import { Handle, Position } from '@xyflow/react';

const StateNode = ({ data }) => {
    const { label, isAccept, isStart, isEditMode } = data;

    return (
        <div className="relative flex items-center justify-center w-16 h-16">
            {/* Clean start arrow matching React Flow marker style */}
            {isStart && (
                <div className="absolute -left-9 top-1/2 -translate-y-1/2 flex items-center pointer-events-none select-none">
                    <svg width="42" height="18" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 6H16" stroke="#cba6f7" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M12 2L20 6L12 10Z" fill="#cba6f7"/>
                    </svg>
                </div>
            )}
            
            <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-[#1e1e2e] shadow-lg transition-all ${
                isAccept ? 'border-[4.5px] border-double border-[#a6e3a1]' : 'border-2 border-[#89b4fa]'
            }`}>
                <span className="text-[#cdd6f4] font-serif text-[17px] tracking-wide pointer-events-none select-none">
                    {label}
                </span>
            </div>

            <Handle type="target" position={Position.Top} id="t-top" className="!w-2 !h-2 !bg-transparent !border-none" />
            <Handle type="source" position={Position.Top} id="s-top" className="!w-2 !h-2 !bg-[#cba6f7] !border-none" style={{ opacity: isEditMode ? 1 : 0 }} />

            <Handle type="target" position={Position.Bottom} id="t-bottom" className="!w-2 !h-2 !bg-transparent !border-none" />
            <Handle type="source" position={Position.Bottom} id="s-bottom" className="!w-2 !h-2 !bg-[#cba6f7] !border-none" style={{ opacity: isEditMode ? 1 : 0 }} />

            <Handle type="target" position={Position.Left} id="t-left" className="!w-2 !h-2 !bg-transparent !border-none" />
            <Handle type="source" position={Position.Left} id="s-left" className="!w-2 !h-2 !bg-[#cba6f7] !border-none" style={{ opacity: isEditMode ? 1 : 0 }} />

            <Handle type="target" position={Position.Right} id="t-right" className="!w-2 !h-2 !bg-transparent !border-none" />
            <Handle type="source" position={Position.Right} id="s-right" className="!w-2 !h-2 !bg-[#cba6f7] !border-none" style={{ opacity: isEditMode ? 1 : 0 }} />
        </div>
    );
};

export default StateNode;