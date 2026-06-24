import React, { useCallback } from 'react';
import { ReactFlow, Background, Controls, MarkerType, useNodesState, useEdgesState, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import StateNode from './components/nodes/StateNode';
import SelfLoopEdge from './components/edges/SelfLoopEdge';
import TransitionEdge from './components/edges/TransitionEdge';

// 1. Define Node and Edge Types
const nodeTypes = {
  stateNode: StateNode,
};

const edgeTypes = {
  selfLoop: SelfLoopEdge,
  transition: TransitionEdge,
};

// Common styling for our edges to match the dark theme
const edgeStyle = {
  markerEnd: { type: MarkerType.ArrowClosed, color: '#CBA6F7' },
  style: { stroke: '#CBA6F7', strokeWidth: 2 },
  labelStyle: { fill: '#CBA6F7', fontWeight: 700, fontSize: 14 },
  labelBgStyle: { fill: '#1E1E2E', stroke: '#313244', strokeWidth: 1 },
  labelBgPadding: [4, 4],
  labelBgBorderRadius: 4,
};

// 2. Map the Initial DFA JSON
const initialNodes = [
  { id: 'd0', type: 'stateNode', position: { x: 150, y: 250 }, data: { label: 'd0', isInitial: true, isFinal: false } },
  { id: 'd1', type: 'stateNode', position: { x: 450, y: 100 }, data: { label: 'd1', isInitial: false, isFinal: true } },
  { id: 'd2', type: 'stateNode', position: { x: 450, y: 400 }, data: { label: 'd2', isInitial: false, isFinal: false } }
];

const initialEdges = [
  { id: 'e-d0-d1', type: 'transition', source: 'd0', target: 'd1', sourceHandle: 'r-c-source', targetHandle: 'l-c-target', label: '0', ...edgeStyle },
  { id: 'e-d0-d2', source: 'd0', target: 'd2', sourceHandle: 'r-b-source', targetHandle: 'l-t-target', label: '1', ...edgeStyle },
  { id: 'e-d1-d1', type: 'selfLoop', source: 'd1', target: 'd1', sourceHandle: 't-l-source', targetHandle: 't-r-target', label: '0, 1', ...edgeStyle },
  { id: 'e-d2-d2', type: 'selfLoop', source: 'd2', target: 'd2', sourceHandle: 'b-l-source', targetHandle: 'b-r-target', label: '0, 1', ...edgeStyle }
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // --- NEW: Handle Manual Connections ---
  const onConnect = useCallback((connection) => {
    const isSelfLoop = connection.source === connection.target;

    const newEdge = {
      ...connection,
      // CHANGE HERE: use 'transition' for standard edges
      type: isSelfLoop ? 'selfLoop' : 'transition',
      label: 'ε',
      ...edgeStyle,
    };

    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges]);

  // --- NEW: Add Node Logic ---
  const handleAddNode = () => {
    // Create a new ID based on how many nodes exist (e.g., d3, d4)
    const newNodeId = `d${nodes.length}`;

    const newNode = {
      id: newNodeId,
      type: 'stateNode',
      // Spawn it in the center-ish, with a slight random offset so they don't stack perfectly invisibly
      position: {
        x: 250 + Math.random() * 50,
        y: 250 + Math.random() * 50
      },
      data: { label: newNodeId, isInitial: false, isFinal: false }
    };

    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#1E1E2E] text-white">
      <div className="h-[80%] w-[90%] rounded-xl border border-[#313244] bg-[#1E1E2E] shadow-2xl overflow-hidden relative">

        {/* --- NEW: Floating Control Toolbar --- */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-4 rounded-lg bg-[#313244] p-2 shadow-lg">
          <button
            onClick={handleAddNode}
            className="rounded bg-[#CBA6F7] px-4 py-1 font-semibold text-[#1E1E2E] transition hover:bg-[#b48eed] active:scale-95"
          >
            + Add State
          </button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}         // <--- Enables edge drawing!
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          colorMode="dark"
          fitView
        >
          <Background gap={20} color="#45475A" />
          <Controls className="fill-white" />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;