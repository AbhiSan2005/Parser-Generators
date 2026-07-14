const TabItem = ({ tab, isActive, onClick }) => {
    return (
        <div 
            onClick={onClick}
            style={{
                padding: '10px 20px',
                cursor: 'pointer',
                color: isActive ? '#fff' : '#888',
                backgroundColor: isActive ? '#2d2d2d' : 'transparent',
                borderRight: '1px solid #333',
                borderBottom: isActive ? '2px solid #4da6ff' : '2px solid transparent',
                whiteSpace: 'nowrap',
                fontSize: '14px',
                transition: 'all 0.2s'
            }}
        >
            {tab.tabName} <span style={{ fontSize: '10px', marginLeft: '8px', color: '#666' }}>({tab.automatonType})</span>
        </div>
    );
};

export default TabItem;