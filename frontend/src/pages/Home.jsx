import React from 'react';

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-screen p-10 bg-mocha-base w-full">
            <h1 className="text-4xl font-bold text-mocha-mauve mb-4 tracking-tight">
                Automata & Compiler IDE
            </h1>
            <p className="text-mocha-subtext0 text-lg mb-8 text-center max-w-2xl">
                Select a workspace from the sidebar to build state machines, or open a playground to generate and compile your parsers.
            </p>
            
            <div className="flex gap-6 mt-4">
                <div className="p-6 border border-mocha-surface0 rounded-lg bg-mocha-mantle text-center">
                    <span className="text-3xl block mb-2">📁</span>
                    <h3 className="text-mocha-blue font-bold">Workspaces</h3>
                    <p className="text-mocha-subtext0 text-sm mt-2">Manage your Graph Editor</p>
                </div>
                <div className="p-6 border border-mocha-surface0 rounded-lg bg-mocha-mantle text-center">
                    <span className="text-3xl block mb-2">🧪</span>
                    <h3 className="text-mocha-green font-bold">Playgrounds</h3>
                    <p className="text-mocha-subtext0 text-sm mt-2">Test your LL(1)/SLR(1) Grammars</p>
                </div>
            </div>
        </div>
    );
};

export default Home;