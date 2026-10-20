// src/components/playground/ASTCanvas.jsx
import { useEffect } from 'react';
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, BackgroundVariant } from '@xyflow/react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';
import ASTNode from './ASTNode';

const nodeTypes = { astNode: ASTNode };

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction, ranksep: 82, nodesep: 52, marginx: 32, marginy: 32 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: node.data.width, height: node.data.height });
    });

    edges.forEach((edge) => {
        if (dagreGraph.hasNode(edge.source) && dagreGraph.hasNode(edge.target)) {
            dagreGraph.setEdge(edge.source, edge.target);
        }
    });

    dagre.layout(dagreGraph);

    const newNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: (nodeWithPosition?.x ?? 0) - node.data.width / 2,
                y: (nodeWithPosition?.y ?? 0) - node.data.height / 2,
            },
        };
    });

    return { nodes: newNodes, edges };
};

const ASTCanvas = ({ sandboxData }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Extract state flags from payload
    const hasConflicts = sandboxData?.compiled_data?.has_conflicts || false;
    const conflicts = sandboxData?.compiled_data?.conflicts || [];
    
    // Check both nested evaluation_sandbox or root-level sandbox objects
    const sandbox = sandboxData?.evaluation_sandbox || sandboxData?.sandbox || {};
    const errorMessage = sandbox?.error_message || sandboxData?.error_message;
    const rawAST = sandbox?.abstract_syntax_tree || sandboxData?.abstract_syntax_tree;

    useEffect(() => {
        if (!hasConflicts && rawAST) {
            const rawNodes = [];
            const rawEdges = [];
            let nodeIdCounter = 0;

            const traverseAST = (node, parentId = null) => {
                if (!node || typeof node !== 'object') return;

                const currentId = `ast_node_${nodeIdCounter++}`;
                const nodeLabel = node.name || node.label || 'Node';
                const isTerminal = !node.children || node.children.length === 0;
                const nodeWidth = Math.min(176, Math.max(58, String(nodeLabel).length * 9 + 28));

                rawNodes.push({
                    id: currentId,
                    type: 'astNode',
                    data: {
                        label: String(nodeLabel),
                        isTerminal,
                        width: nodeWidth,
                        height: 48
                    },
                    style: { width: nodeWidth, height: 48 },
                    position: { x: 0, y: 0 }
                });

                if (parentId) {
                    rawEdges.push({
                        id: `edge_${parentId}_${currentId}`,
                        source: parentId,
                        target: currentId,
                        type: 'smoothstep',
                        style: { stroke: '#7f849c', strokeWidth: 1.6 }
                    });
                }

                if (Array.isArray(node.children)) {
                    node.children.forEach(child => traverseAST(child, currentId));
                }
            };

            const astRoot = Array.isArray(rawAST) ? rawAST[0] : rawAST;
            traverseAST(astRoot);

            if (rawNodes.length > 0) {
                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rawNodes, rawEdges);
                setNodes(layoutedNodes);
                setEdges(layoutedEdges);
            } else {
                setNodes([]);
                setEdges([]);
            }
        } else {
            setNodes([]);
            setEdges([]);
        }
    }, [sandboxData, hasConflicts, rawAST]);

    // RENDER: Helper overlay for errors and warnings
    const renderOverlayMessage = () => {
        // 1. Conflict State
        if (hasConflicts) {
            return (
                <div className="flex flex-col items-center justify-center p-6 text-center text-red-400">
                    <div className="bg-red-950/40 border border-red-500/30 rounded-lg p-4 max-w-md">
                        <h4 className="font-bold text-red-300 text-base mb-1">Grammar Has Parsing Conflicts</h4>
                        <p className="text-xs text-red-400/80 mb-2">
                            This grammar cannot be solved by SLR(1). AST generation is disabled.
                        </p>
                        {conflicts.length > 0 && (
                            <div className="bg-black/30 text-left p-2 rounded text-[11px] font-mono max-h-32 overflow-y-auto">
                                {conflicts.map((c, i) => (
                                    <div key={i}>• {typeof c === 'string' ? c : JSON.stringify(c)}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // 2. Rejected Input / Syntax Error State
        if (errorMessage) {
            return (
                <div className="flex flex-col items-center justify-center p-6 text-center text-amber-400">
                    <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-4 max-w-md">
                        <h4 className="font-bold text-amber-300 text-base mb-1">String Rejected</h4>
                        <p className="text-xs font-mono text-amber-400/90">{errorMessage}</p>
                    </div>
                </div>
            );
        }

        // 3. Idle / Empty AST State
        if (!rawAST) {
            return (
                <div className="text-[#585b70] text-sm font-medium">
                    Enter a string and run evaluation to generate the AST.
                </div>
            );
        }

        return null;
    };

    return (
        <div 
            className="flex-grow bg-[#11111b] rounded-xl border border-[#313244] overflow-hidden shadow-sm relative w-full h-full min-h-[500px]"
            style={{ width: '100%', height: '100%', minHeight: '500px' }}
        >
            <div className="absolute top-3 left-4 z-10 font-bold text-[#cba6f7] bg-[#11111b]/80 px-3 py-1 rounded backdrop-blur-sm border border-[#313244]">
                Parse Tree (AST)
            </div>
            
                    {nodes.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center">
                    {renderOverlayMessage()}
                </div>
            ) : (
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.18, minZoom: 0.35, maxZoom: 1.25 }}
                    colorMode="dark"
                    proOptions={{ hideAttribution: true }}
                >
                    <Background gap={24} size={1} variant={BackgroundVariant.Dots}/>
                    <Controls className="fill-[#cdd6f4] bg-[#1e1e2e] border border-[#313244] rounded-lg shadow" />
                </ReactFlow>
            )}
        </div>
    );
};

export default ASTCanvas;