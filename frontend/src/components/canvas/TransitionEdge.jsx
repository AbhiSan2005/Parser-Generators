import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';

const TransitionEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    label,
    data,
    selected
}) => {
    let path = '';
    let labelX = 0;
    let labelY = 0;

    if (data?.isSelfLoop) {
        const loopWidth = 35;
        const loopHeight = 55;
        const startX = sourceX - 8;
        const endX = targetX + 8;
        
        const cp1X = sourceX - loopWidth;
        const cp1Y = sourceY - loopHeight;
        const cp2X = targetX + loopWidth;
        const cp2Y = targetY - loopHeight;

        path = `M ${startX} ${sourceY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${targetY}`;
        labelX = sourceX;
        labelY = sourceY - loopHeight - 5;
    } else if (data?.isBidirectional && data?.isReverse) {
        const midX = (sourceX + targetX) / 2;
        const controlY = Math.max(sourceY, targetY) + 32;

        path = `M ${sourceX} ${sourceY} Q ${midX} ${controlY} ${targetX} ${targetY}`;
        labelX = midX;
        labelY = controlY - 14; 
    } else if (data?.isBidirectional) {
        const midX = (sourceX + targetX) / 2;
        const midY = (sourceY + targetY) / 2;

        path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
        labelX = midX;
        labelY = midY - 12;
    } else {
        const [computedPath, cX, cY] = getBezierPath({
            sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
        });
        path = computedPath;
        labelX = cX;
        labelY = cY - 14;
    }

    return (
        <>
            <BaseEdge 
                id={id} 
                path={path} 
                markerEnd="url(#arrow)" 
                style={{ stroke: selected ? '#89b4fa' : '#cba6f7', strokeWidth: selected ? 2.5 : 2 }} 
            />
            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                            pointerEvents: 'all',
                        }}
                        className="bg-[#1e1e2e] border border-[#313244] px-2 py-0.5 rounded text-[15px] text-[#cdd6f4] font-serif tracking-wide shadow select-none"
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};

export default TransitionEdge;