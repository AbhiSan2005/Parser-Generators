const ViewToggle = ({ activeView, setActiveView }) => {
    const buttonStyle = {
        padding: '6px 16px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 'bold',
        transition: 'all 0.2s',
    };

    return (
        <div style={{ display: 'flex', backgroundColor: '#2d2d2d', borderRadius: '6px', overflow: 'hidden' }}>
            <button 
                onClick={() => setActiveView('canvas')}
                style={{
                    ...buttonStyle,
                    backgroundColor: activeView === 'canvas' ? '#4da6ff' : 'transparent',
                    color: activeView === 'canvas' ? '#000' : '#aaa',
                }}
            >
                Canvas
            </button>
            <button 
                onClick={() => setActiveView('derivation')}
                style={{
                    ...buttonStyle,
                    backgroundColor: activeView === 'derivation' ? '#4da6ff' : 'transparent',
                    color: activeView === 'derivation' ? '#000' : '#aaa',
                }}
            >
                Derivation
            </button>
        </div>
    );
};

export default ViewToggle;