import { useEffect, useRef } from 'react';
import { instance } from '@viz-js/viz';

const GraphvizRenderer = ({ dotString }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current && dotString) {
            instance().then(viz => {
                const svgElement = viz.renderSVGElement(dotString);
                svgElement.style.width = '100%';
                svgElement.style.height = 'auto';
                svgElement.style.maxHeight = '400px';
                
                containerRef.current.innerHTML = ''; 
                containerRef.current.appendChild(svgElement);
            }).catch(err => console.error("Graphviz Error:", err));
        }
    }, [dotString]);

    return (
        <div ref={containerRef} style={{ width: '100%', display: 'flex', justifyContent: 'center', backgroundColor: '#ffffff', borderRadius: '8px', padding: '10px' }} />
    );
};

export default GraphvizRenderer;