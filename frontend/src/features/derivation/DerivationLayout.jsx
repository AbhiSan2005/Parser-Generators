import StepTimeline from './StepTimeline';

const DerivationLayout = ({ activeTab }) => {
    const data = activeTab.machine_data || {};

    return (
        <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto', color: 'white' }}>
            <div style={{ borderBottom: '1px solid #333', paddingBottom: '20px', marginBottom: '30px' }}>
                <h2 style={{ margin: '0 0 10px 0' }}>Mathematical Output</h2>
                <p style={{ color: '#aaa', margin: 0 }}>Type: <strong style={{ color: '#4da6ff' }}>{activeTab.automatonType}</strong></p>
            </div>

            {/* If it's a REGEX output, show the final expression prominently */}
            {activeTab.automatonType === 'REGEX' && data.expression && (
                <div style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #4da6ff' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#888' }}>Final Regular Expression</h3>
                    <div style={{ fontSize: '24px', fontFamily: 'monospace', color: '#00cc66' }}>
                        {data.expression}
                    </div>
                </div>
            )}

            <div>
                <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Execution History</h3>
                <StepTimeline steps={data.derivation_steps} />
            </div>
        </div>
    );
};

export default DerivationLayout;