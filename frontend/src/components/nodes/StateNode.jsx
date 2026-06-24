import React from 'react';
import { Handle, Position } from '@xyflow/react';

// Perfect circular math using Trigonometry (Sine/Cosine) for a 12-point clock face
const handleConfig = [
  // Top group
  { id: 't-l', pos: Position.Top, style: { left: '25%', top: '6.7%' } },
  { id: 't-c', pos: Position.Top, style: { left: '50%', top: '0%' } },
  { id: 't-r', pos: Position.Top, style: { left: '75%', top: '6.7%' } },
  
  // Right group
  { id: 'r-t', pos: Position.Right, style: { left: '93.3%', top: '25%' } },
  { id: 'r-c', pos: Position.Right, style: { left: '100%', top: '50%' } },
  { id: 'r-b', pos: Position.Right, style: { left: '93.3%', top: '75%' } },
  
  // Bottom group
  { id: 'b-r', pos: Position.Bottom, style: { left: '75%', top: '93.3%' } },
  { id: 'b-c', pos: Position.Bottom, style: { left: '50%', top: '100%' } },
  { id: 'b-l', pos: Position.Bottom, style: { left: '25%', top: '93.3%' } },
  
  // Left group
  { id: 'l-b', pos: Position.Left, style: { left: '6.7%', top: '75%' } },
  { id: 'l-c', pos: Position.Left, style: { left: '0%', top: '50%' } },
  { id: 'l-t', pos: Position.Left, style: { left: '6.7%', top: '25%' } },
];

const StateNode = ({ data }) => {
  const borderColor = data.isFinal ? 'border-[#A6E3A1]' : 'border-[#89B4FA]';
  const shadowColor = data.isFinal ? 'shadow-[0_0_15px_rgba(166,227,161,0.2)]' : 'shadow-[0_0_10px_rgba(137,180,250,0.2)]';

  return (
    <div className={`relative flex h-16 w-16 items-center justify-center rounded-full border-2 bg-[#1E1E2E] text-white ${borderColor} ${shadowColor}`}>
      
      {/* FIXED START ARROW: Anchored to the complete outside of the left edge */}
      {data.isInitial && (
        <div className="absolute right-full top-1/2 flex -translate-y-1/2 items-center pr-2">
          <span className="mr-1 text-xs font-bold text-[#CBA6F7]">start</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CBA6F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="0" y1="12" x2="18" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      )}

      {/* Double Circle for Final State */}
      {data.isFinal ? (
        <div className={`flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-2 ${borderColor}`}>
          <span className="font-semibold">{data.label}</span>
        </div>
      ) : (
        <span className="font-semibold">{data.label}</span>
      )}

      {/* The 12 handles aligned perfectly to the circle (Stacked Target & Source) */}
      {handleConfig.map((h) => (
        <React.Fragment key={h.id}>
          {/* TARGET HANDLE (For incoming edges) */}
          <Handle
            type="target"
            position={h.pos}
            id={`${h.id}-target`} // e.g., "l-c-target"
            style={{ 
              ...h.style, 
              transform: 'translate(-50%, -50%)', 
              opacity: 0, 
              width: '10px', 
              height: '10px',
              border: 'none', 
              background: 'cyan',
              zIndex: 10
            }} 
            isConnectable={true}
          />
          
          {/* SOURCE HANDLE (For outgoing edges) */}
          <Handle
            type="source"
            position={h.pos}
            id={`${h.id}-source`} // e.g., "r-c-source"
            style={{ 
              ...h.style, 
              transform: 'translate(-50%, -50%)', 
              opacity: 0, 
              width: '10px', 
              height: '10px',
              border: 'none', 
              background: 'cyan',
              zIndex: 10
            }} 
            isConnectable={true}
          />
        </React.Fragment>
      ))}
    </div>
  );
};

export default StateNode;