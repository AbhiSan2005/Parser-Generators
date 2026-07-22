import { Graphviz } from "@hpcc-js/wasm/graphviz";
import { normalizeTransitions, generateDotString } from "./machineToDot";

export const calculateGraphvizLayout = async (machineData) => {
    if (!machineData || !machineData.states || machineData.states.length === 0) {
        return { nodes: [], edges: [] };
    }

    const dotString = generateDotString(machineData);

    try {
        const graphviz = await Graphviz.load();
        const jsonResult = JSON.parse(graphviz.layout(dotString, "json", "dot"));

        const nodes = [];
        const edges = [];
        
        const startStates = machineData.initial_states || (machineData.start_state ? [machineData.start_state] : []);
        const finalStates = machineData.final_states || machineData.accept_states || [];
        const nodePosMap = new Map();

        // 1. MAP NODES
        if (jsonResult.objects) {
            jsonResult.objects.forEach(obj => {
                if (obj.name === "__start") return;
                const [x, y] = obj.pos.split(',').map(Number);
                
                // Scale coordinates so nodes have generous breathing room
                const scaledX = x * 2.2;
                const scaledY = -y * 2.2;

                nodePosMap.set(obj.name, { x: scaledX, y: scaledY });

                nodes.push({
                    id: obj.name,
                    position: { x: scaledX, y: scaledY },
                    data: { 
                        label: obj.name,
                        isAccept: finalStates.includes(obj.name),
                        isStart: startStates.includes(obj.name)
                    },
                    type: 'automataNode'
                });
            });
        }

        // 2. MAP EDGES
        const flatEdges = normalizeTransitions(machineData.transitions);
        const grouped = {};
        flatEdges.forEach(e => {
            const key = `${e.from}->${e.to}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(e.input === '' || e.input === 'ε' ? 'ε' : e.input);
        });

        const edgeKeys = new Set(Object.keys(grouped));

        Object.entries(grouped).forEach(([key, labels], index) => {
            const [source, target] = key.split('->');
            const sPos = nodePosMap.get(source);
            const tPos = nodePosMap.get(target);

            let sourceHandle = 's-right';
            let targetHandle = 't-left';

            const isSelfLoop = (source === target);
            const isBidirectional = !isSelfLoop && edgeKeys.has(`${target}->${source}`);

            if (isSelfLoop) {
                sourceHandle = 's-top';
                targetHandle = 't-top';
            } else if (sPos && tPos) {
                if (isBidirectional) {
                    if (sPos.x < tPos.x) {
                        // Forward edge bows on top/center
                        sourceHandle = 's-right';
                        targetHandle = 't-left';
                    } else {
                        // Reverse edge bows underneath via bottom handles
                        sourceHandle = 's-bottom';
                        targetHandle = 't-bottom';
                    }
                } else {
                    if (sPos.x < tPos.x) {
                        sourceHandle = 's-right';
                        targetHandle = 't-left';
                    } else if (sPos.x > tPos.x) {
                        sourceHandle = 's-left';
                        targetHandle = 't-right';
                    } else {
                        sourceHandle = sPos.y < tPos.y ? 's-bottom' : 's-top';
                        targetHandle = sPos.y < tPos.y ? 't-top' : 't-bottom';
                    }
                }
            }

            edges.push({
                id: `e-${source}-${target}-${index}`,
                source,
                target,
                sourceHandle,
                targetHandle,
                label: [...new Set(labels)].join(', '),
                type: 'automataEdge',
                data: { 
                    isSelfLoop,
                    isBidirectional,
                    isReverse: sPos && tPos ? (sPos.x > tPos.x) : false
                }
            });
        });

        return { nodes, edges };
    } catch (err) {
        console.error("Layout math failed:", err);
        return { nodes: [], edges: [] };
    }
};