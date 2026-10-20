import { Background, BackgroundVariant, BaseEdge, EdgeLabelRenderer, Handle, MarkerType, Position, ReactFlow } from '@xyflow/react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import '@xyflow/react/dist/style.css';

const StateNode = ({ data }) => (
    <div className={`home-state-node ${data.accepting ? 'home-state-accepting' : ''}`}>
            <Handle type="target" position={Position.Left} id="in" />
            <Handle type="source" position={Position.Right} id="out" />
            <Handle type="source" position={Position.Top} id="loop-out" style={{ left: '64%' }} />
            <Handle type="target" position={Position.Top} id="loop-in" style={{ left: '36%' }} />
        {data.initial && <span className="home-state-arrow">START</span>}
        <span className="home-state-name">{data.label}</span>
        <span className="home-state-kind">{data.accepting ? 'ACCEPT' : 'STATE'}</span>
            <Handle type="source" position={Position.Left} id="back-out" />
            <Handle type="target" position={Position.Right} id="back-in" />
    </div>
);

const stateTypes = { homeState: StateNode };
    const LoopEdge = ({ id, sourceX, sourceY, targetX, targetY, markerEnd, style, className, data }) => {
        const curveHeight = 56;
        const path = `M ${sourceX} ${sourceY} C ${sourceX} ${sourceY - curveHeight}, ${targetX} ${targetY - curveHeight}, ${targetX} ${targetY}`;
        return (
            <>
                <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} className={className} />
                <EdgeLabelRenderer>
                    <span className="home-loop-label" style={{ left: (sourceX + targetX) / 2, top: sourceY - curveHeight - 18 }}>{data.label}</span>
                </EdgeLabelRenderer>
            </>
        );
    };
    const ReverseEdge = ({ id, sourceX, sourceY, targetX, targetY, markerEnd, style, className, data }) => {
        const arcDepth = 58;
        const path = `M ${sourceX} ${sourceY} C ${sourceX} ${sourceY + arcDepth}, ${targetX} ${targetY + arcDepth}, ${targetX} ${targetY}`;
        return (
            <>
                <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} className={className} />
                <EdgeLabelRenderer>
                    <span className="home-loop-label" style={{ left: (sourceX + targetX) / 2, top: (sourceY + targetY) / 2 + arcDepth * 0.7 }}>{data.label}</span>
                </EdgeLabelRenderer>
            </>
        );
    };
    const edgeTypes = { loop: LoopEdge, reverse: ReverseEdge };
const states = [
        { id: 'q0', type: 'homeState', position: { x: 58, y: 104 }, data: { label: 'q₀', initial: true } },
        { id: 'q1', type: 'homeState', position: { x: 248, y: 104 }, data: { label: 'q₁', accepting: true } }
];
const transitions = [
    { id: 'q0-a-q1', source: 'q0', target: 'q1', sourceHandle: 'out', targetHandle: 'in', label: 'a', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed }, className: 'home-edge-a' },
        { id: 'q1-b-q0', source: 'q1', target: 'q0', sourceHandle: 'back-out', targetHandle: 'back-in', data: { label: 'b' }, type: 'reverse', markerEnd: { type: MarkerType.ArrowClosed }, className: 'home-edge-b' },
    { id: 'q0-b-q0', source: 'q0', target: 'q0', sourceHandle: 'loop-out', targetHandle: 'loop-in', data: { label: 'b' }, type: 'loop', markerEnd: { type: MarkerType.ArrowClosed }, className: 'home-edge-b' },
    { id: 'q1-a-q1', source: 'q1', target: 'q1', sourceHandle: 'loop-out', targetHandle: 'loop-in', data: { label: 'a' }, type: 'loop', markerEnd: { type: MarkerType.ArrowClosed }, className: 'home-edge-a' }
];

const Home = () => {
    const { currentUser, isAuthenticated } = useSelector((state) => state.auth);

    return (
        <main className="home-shell relative isolate min-h-screen w-full overflow-hidden">
            <div className="home-grid-atmosphere" aria-hidden="true" />
            <div className="home-scanline" aria-hidden="true" />

            <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col px-6 pb-12 pt-10 md:px-10 lg:px-14">
                <div className="flex items-center justify-between gap-4 border-b border-mocha-surface0/70 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="home-brand-mark" aria-hidden="true"><span /><span /><span /></div>
                        <div>
                            <p className="text-xs font-bold uppercase text-mocha-subtext0">Formal systems workbench</p>
                            <p className="text-sm font-bold text-mocha-text">DFA / CFG / Parser Lab</p>
                        </div>
                    </div>
                    <div className="hidden items-center gap-2 text-xs font-mono text-mocha-subtext0 sm:flex">
                        <span className="home-live-dot" />
                        VISUAL ENGINE READY
                    </div>
                </div>

                <section className="grid flex-1 items-center gap-8 py-8 md:grid-cols-[0.9fr_1.1fr] md:gap-8 md:py-10">
                    <div className="home-copy-reveal max-w-2xl">
                        <div className="mb-6 inline-flex items-center gap-2 border-l-2 border-mocha-teal pl-3 font-mono text-xs uppercase text-mocha-teal">
                            <span>Automata & Compiler IDE</span>
                            <span className="text-mocha-surface2">/</span>
                            <span>Build · Transform · Inspect</span>
                        </div>
                        <h1 className="max-w-[680px] text-5xl font-bold leading-[1.04] text-mocha-text">
                            Make formal languages <span className="text-mocha-mauve">visible.</span>
                        </h1>
                        <p className="mt-6 max-w-xl text-base leading-7 text-mocha-subtext0">
                            {isAuthenticated
                                ? `Welcome back, ${currentUser.username}. Pick up a machine or grammar and follow every transformation.`
                                : 'Design finite-state machines, transform grammars, and watch parsers work through a string step by step.'}
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Link to="/workspaces" className="home-primary-action">
                                <span aria-hidden="true">↗</span> Open workspaces
                            </Link>
                            <Link to="/playgrounds" className="home-secondary-action">
                                <span aria-hidden="true">⌘</span> Parser playgrounds
                            </Link>
                        </div>

                        <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-mocha-surface0/70 pt-5 text-xs font-mono uppercase text-mocha-subtext0">
                            <span><b className="mr-2 text-mocha-green">01</b>Automata</span>
                            <span><b className="mr-2 text-mocha-blue">02</b>Grammar analysis</span>
                            <span><b className="mr-2 text-mocha-peach">03</b>Parser traces</span>
                        </div>
                    </div>

                    <div className="home-graph-reveal relative min-w-0">
                        <div className="home-graph-heading flex items-center justify-between gap-3">
                            <div>
                                <p className="font-mono text-[10px] uppercase text-mocha-subtext0">Deterministic finite automaton</p>
                                <p className="mt-1 text-sm font-bold text-mocha-text">Strings ending in <span className="text-mocha-green">a</span></p>
                            </div>
                            <span className="rounded-sm border border-mocha-green/40 px-2 py-1 font-mono text-[10px] text-mocha-green">Σ = &#123;a, b&#125;</span>
                        </div>
                        <div className="home-graph-stage" aria-label="Animated DFA for strings ending in a">
                            <ReactFlow
                                nodes={states}
                                edges={transitions}
                                nodeTypes={stateTypes}
                                                                edgeTypes={edgeTypes}
                                fitView
                                fitViewOptions={{ padding: 0.18, minZoom: 0.65, maxZoom: 1 }}
                                nodesDraggable={false}
                                nodesConnectable={false}
                                elementsSelectable={false}
                                panOnDrag={false}
                                zoomOnScroll={false}
                                zoomOnDoubleClick={false}
                                proOptions={{ hideAttribution: true }}
                            >
                                <Background color="#45475a" gap={24} size={1} variant={BackgroundVariant.Dots} />
                            </ReactFlow>
                            <div className="home-graph-footer">
                                <span>INPUT</span>
                                <div className="home-input-tape"><b>b</b><b>a</b><b>b</b><i>▸</i></div>
                                <span className="text-mocha-green">REJECT</span>
                            </div>
                        </div>
                        <div className="home-graph-caption mt-4 flex items-center justify-between gap-4 font-mono text-[10px] uppercase text-mocha-surface2">
                            <span>δ(q, a) → q₁</span>
                            <span>δ(q, b) → q₀</span>
                            <span>Minimal states: 2</span>
                        </div>
                    </div>
                </section>

                <section className="home-workflow-rail grid gap-0 border-y border-mocha-surface0/70 md:grid-cols-3" aria-label="Available workflows">
                    <Link to="/workspaces" className="home-workflow-step group">
                        <span className="home-step-index">01 / MACHINES</span>
                        <span className="home-step-title">Build an automaton</span>
                        <span className="home-step-detail">Regex → ε-NFA → DFA → minimal DFA</span>
                        <span className="home-step-arrow">↗</span>
                    </Link>
                    <Link to="/workspaces" className="home-workflow-step group">
                        <span className="home-step-index">02 / GRAMMARS</span>
                        <span className="home-step-title">Transform a grammar</span>
                        <span className="home-step-detail">Simplify · CNF · CYK membership</span>
                        <span className="home-step-arrow">↗</span>
                    </Link>
                    <Link to="/playgrounds" className="home-workflow-step group">
                        <span className="home-step-index">03 / PARSERS</span>
                        <span className="home-step-title">Inspect a parser</span>
                        <span className="home-step-detail">LL(1) · LR(0) · SLR(1) · AST</span>
                        <span className="home-step-arrow">↗</span>
                    </Link>
                </section>

                <footer className="flex flex-wrap items-center justify-between gap-3 pt-5 font-mono text-[10px] uppercase text-mocha-surface2">
                    <span>Finite-state systems / context-free grammars / parsing</span>
                    <span>Formal methods, made inspectable</span>
                </footer>
            </div>
        </main>
    );
};

export default Home;
