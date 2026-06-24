import React from 'react';
import { BaseEdge, EdgeLabelRenderer } from '@xyflow/react';

export default function SelfLoopEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourceHandleId,
  style,
  markerEnd,
  label,
}) {
  // Determine if this is a top loop or bottom loop based on the handle ID
  const isTop = sourceHandleId?.includes('t-');
  
  // Math for the loop height and width
  const loopHeight = isTop ? -60 : 60; // Push up if top, push down if bottom
  const loopWidth = 35; // How far the loop spreads outward

  // Control points for the Cubic Bezier curve
  const cp1X = sourceX - loopWidth;
  const cp1Y = sourceY + loopHeight;
  const cp2X = targetX + loopWidth;
  const cp2Y = targetY + loopHeight;

  // The perfect SVG path string
  const edgePath = `M ${sourceX},${sourceY} C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${targetX},${targetY}`;

  // Calculate the center point to place the label (0, 1 text)
  const labelX = (sourceX + targetX) / 2;
  const labelY = sourceY + loopHeight - (isTop ? 10 : -10);

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} id={id} />
      
      {/* Renders the transition label floating exactly at the peak of the loop */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: '#1E1E2E',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#CBA6F7',
              border: '1px solid #313244',
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}