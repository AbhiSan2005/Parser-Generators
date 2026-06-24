import React from 'react';
import { BaseEdge, EdgeLabelRenderer } from '@xyflow/react';

export default function TransitionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
  label,
}) {
  // 1. Calculate the distance and direction between the two nodes
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Fallback if nodes are exactly on top of each other to prevent division by zero
  if (distance === 0) return null;

  // 2. Normalize the direction vector
  const nx = dx / distance;
  const ny = dy / distance;

  // 3. Find the exact midpoint between the two nodes
  const midX = sourceX + dx / 2;
  const midY = sourceY + dy / 2;

  // 4. Define how far the curve should "bow" outward (in pixels)
  const curveAmount = 40;

  // 5. Calculate the Quadratic Bezier control point (perpendicular to the line)
  // The vector (-ny, nx) is exactly 90 degrees perpendicular to the edge
  const cpX = midX - ny * curveAmount;
  const cpY = midY + nx * curveAmount;

  // 6. Generate the SVG Quadratic Bezier curve (Q) path
  const edgePath = `M ${sourceX},${sourceY} Q ${cpX},${cpY} ${targetX},${targetY}`;

  // 7. Calculate where the label should sit. 
  // In a Quadratic Bezier, the peak of the curve sits at t=0.5. 
  // B(0.5) = 0.25*start + 0.5*control + 0.25*target
  const labelX = 0.25 * sourceX + 0.5 * cpX + 0.25 * targetX;
  const labelY = 0.25 * sourceY + 0.5 * cpY + 0.25 * targetY;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} id={id} />
      
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