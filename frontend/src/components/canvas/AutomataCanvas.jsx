import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ReactFlow, Background, Controls, MiniMap, applyNodeChanges, applyEdgeChanges, addEdge, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { calculateGraphvizLayout } from '../../utils/graphvizLayout';
import StateNode from './StateNode';
import TransitionEdge from './TransitionEdge';

const AutomataCanvas = ({ machineData, isEditMode, locateGraphTrigger }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [rfInstance, setRfInstance] = useState(null);

    const nodeTypes = useMemo(() => ({ automataNode: StateNode }), []);
    const edgeTypes = useMemo(() => ({ automataEdge: TransitionEdge }), []);

    const machineDataString = JSON.stringify(machineData);

    // Triggers React Flow's fitView to re-center and frame the graph
    useEffect(() => {
        if (rfInstance && locateGraphTrigger > 0) {
            rfInstance.fitView({ padding: 0.2, duration: 500 });
        }
    }, [locateGraphTrigger, rfInstance]);

    useEffect(() => {
        const loadLayout = async () => {
            if (!machineData || !machineData.states || machineData.states.length === 0) {
                setNodes([]);
                setEdges([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            const { nodes: layoutNodes, edges: layoutEdges } = await calculateGraphvizLayout(machineData);
            
            const configuredNodes = layoutNodes.map(n => ({
                ...n,
                data: { ...n.data, isEditMode }
            }));

            setNodes(configuredNodes);
            setEdges(layoutEdges);
            setIsLoading(false);
        };

        loadLayout();
    }, [machineDataString, isEditMode]);

    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

    const onNodesDelete = useCallback((deleted) => {
        setNodes((nds) => nds.filter((n) => !deleted.find((d) => d.id === n.id)));
        setEdges((eds) => eds.filter((e) => !deleted.find((d) => d.id === e.source || d.id === e.target)));
    }, []);
    
    const onEdgesDelete = useCallback((deleted) => {
        setEdges((eds) => eds.filter((e) => !deleted.find((d) => d.id === e.id)));
    }, []);

    const onConnect = useCallback((params) => {
        const symbol = window.prompt("Enter transition symbol (leave blank for ε):", "");
        if (symbol === null) return;

        const newEdge = {
            ...params,
            id: `e-${params.source}-${params.target}-${Date.now()}`,
            label: symbol || 'ε',
            type: 'automataEdge',
            data: { isSelfLoop: params.source === params.target }
        };
        setEdges((eds) => addEdge(newEdge, eds));
    }, []);

    const handleAddNode = () => {
        const newNodeId = `q${nodes.length}`;
        const newNode = {
            id: newNodeId,
            position: { x: 150, y: 150 },
            data: { label: newNodeId, isAccept: false, isStart: nodes.length === 0, isEditMode: true },
            type: 'automataNode'
        };
        setNodes((nds) => [...nds, newNode]);
    };

    if (isLoading) {
        return (
            <div className="h-[60vh] min-h-[500px] w-full flex items-center justify-center bg-[#11111b] text-[#a6adc8] rounded-xl border border-[#313244]">
                <span className="animate-pulse font-bold tracking-widest uppercase">Building Graph Layout...</span>
            </div>
        );
    }

    return (
        <div className="h-[60vh] min-h-[500px] w-full bg-[#11111b] rounded-xl border border-[#313244] overflow-hidden shadow-sm relative">
            {isEditMode && (
                <div className="absolute top-4 left-4 z-10">
                    <button 
                        onClick={handleAddNode} 
                        className="bg-[#cba6f7] text-[#11111b] px-4 py-2 rounded-md font-bold shadow-md hover:opacity-90 transition-opacity"
                    >
                        + Add State
                    </button>
                </div>
            )}

            <ReactFlow
                onInit={setRfInstance}
                nodes={nodes}
                edges={edges}
                onNodesChange={isEditMode ? onNodesChange : undefined}
                onEdgesChange={isEditMode ? onEdgesChange : undefined}
                onConnect={isEditMode ? onConnect : undefined}
                onNodesDelete={isEditMode ? onNodesDelete : undefined}
                deleteKeyCode={["Backspace", "Delete"]}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                nodesDraggable={isEditMode}
                nodesConnectable={isEditMode}
                elementsSelectable={isEditMode}
                fitView
                colorMode="dark"
                proOptions={{ hideAttribution: true }}
            >
                <svg>
                    <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#cba6f7" />
                        </marker>
                    </defs>
                </svg>
                <Background gap={24} size={1} variant={BackgroundVariant.Dots}/>
                <Controls className="fill-[#cdd6f4] bg-[#1e1e2e] border border-[#313244] rounded-lg overflow-hidden shadow" />
            </ReactFlow>
        </div>
    );
};

export default AutomataCanvas;