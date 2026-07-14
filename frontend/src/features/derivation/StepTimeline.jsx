import GraphvizRenderer from '../canvas/GraphvizRenderer';

const StepTimeline = ({ steps }) => {
    if (!steps || steps.length === 0) return <div style={{ color: '#888' }}>No derivation steps recorded.</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
            {steps.map((step, index) => (
                <div key={index} style={{ backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #4da6ff' }}>
                    <div style={{ marginBottom: step.dot_string || step.partitions ? '15px' : '0' }}>
                        <span style={{ fontWeight: 'bold', color: '#4da6ff', marginRight: '10px' }}>Step {index}:</span>
                        <span style={{ color: '#eee' }}>{step.step_description}</span>
                    </div>

                    {step.dot_string && (
                        <GraphvizRenderer dotString={step.dot_string} />
                    )}

                    {step.partitions && (
                        <div style={{ padding: '10px', backgroundColor: '#121212', fontFamily: 'monospace', color: '#00cc66' }}>
                            {JSON.stringify(step.partitions)}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default StepTimeline;