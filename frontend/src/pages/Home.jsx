const Home = () => {
    return (
        <div style={{ padding: '40px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <h1>Welcome to Automata Visualizer</h1>
            <p style={{ color: '#aaa', marginTop: '10px' }}>Select a workspace from the sidebar or create a new one to begin modeling.</p>
        </div>
    );
};

export default Home;