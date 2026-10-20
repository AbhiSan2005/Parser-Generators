import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import GoogleAuthButton from '../components/GoogleAuthButton';

const Home = () => {
    const { currentUser, isAuthenticated } = useSelector((state) => state.auth);

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-screen p-10 bg-mocha-base w-full">
            <h1 className="text-4xl font-bold text-mocha-mauve mb-4 tracking-tight text-center">
                Automata & Compiler IDE
            </h1>
            
            <p className="text-mocha-subtext0 text-lg mb-6 text-center max-w-2xl">
                {isAuthenticated 
                    ? `Welcome back, ${currentUser.username}! Build state machines or compile and test LL(1), LR(0), and SLR(1) parsers.`
                    : 'Design automata, execute conversions, and generate LL(1), LR(0), and SLR(1) parsers with visual item sets and parse tables.'}
            </p>

            {!isAuthenticated && (
                <div className="mb-8 w-full max-w-sm flex flex-col items-center">
                    <GoogleAuthButton compact={false} />
                </div>
            )}

            <div className="flex flex-wrap justify-center gap-6 mt-2">
                <Link 
                    to="/workspaces" 
                    className="p-6 border border-mocha-surface0 rounded-xl bg-mocha-mantle text-center hover:border-mocha-blue hover:scale-105 transition-all w-64 block group"
                >
                    <span className="text-3xl block mb-2">📁</span>
                    <h3 className="text-mocha-blue font-bold text-lg group-hover:underline">Workspaces</h3>
                    <p className="text-mocha-subtext0 text-sm mt-2">
                        State machine visualizer, conversions (NFA/DFA/Regex/CNF/CYK)
                    </p>
                </Link>

                <Link 
                    to="/playgrounds" 
                    className="p-6 border border-mocha-surface0 rounded-xl bg-mocha-mantle text-center hover:border-mocha-green hover:scale-105 transition-all w-64 block group"
                >
                    <span className="text-3xl block mb-2">🧪</span>
                    <h3 className="text-mocha-green font-bold text-lg group-hover:underline">Playgrounds</h3>
                    <p className="text-mocha-subtext0 text-sm mt-2">
                        LL(1), LR(0), and SLR(1) Grammar sandboxes & AST simulations
                    </p>
                </Link>
            </div>
        </div>
    );
};

export default Home;
