'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
}

let mermaidInitialized = false;

export default function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
        },
      });
      mermaidInitialized = true;
    }
  }, []);

  useEffect(() => {
    const fixMermaidSyntax = (code: string): string => {
      // Fix node labels with parentheses, slashes, colons, etc. that aren't quoted
      // Pattern: NodeId[Label with (special) chars] -> NodeId["Label with (special) chars"]
      return code.replace(
        /(\w+)\[([^\]"]+[\(\)\/\:][^\]"]*)\]/g,
        (match, nodeId, label) => {
          // If label is already quoted, leave it
          if (label.startsWith('"') || label.startsWith("'")) {
            return match;
          }
          // Otherwise, wrap in quotes
          return `${nodeId}["${label}"]`;
        }
      );
    };

    const renderDiagram = async () => {
      if (!chart) return;
      
      try {
        setError(null);
        // Generate a unique ID for each diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        
        // Try to fix common syntax issues
        const fixedChart = fixMermaidSyntax(chart);
        
        // Render the diagram
        const { svg: renderedSvg } = await mermaid.render(id, fixedChart);
        setSvg(renderedSvg);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      }
    };

    renderDiagram();
  }, [chart]);

  if (error) {
    return (
      <div
        style={{
          backgroundColor: 'rgba(139, 0, 0, 0.2)',
          border: '1px solid rgba(255, 0, 0, 0.5)',
          padding: '16px',
          borderRadius: '8px',
          margin: '16px 0',
          color: '#ff6b6b',
        }}
      >
        <strong>Mermaid Diagram Error:</strong>
        <pre style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>{error}</pre>
        <details style={{ marginTop: '8px' }}>
          <summary style={{ cursor: 'pointer' }}>Show diagram source</summary>
          <pre style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>{chart}</pre>
        </details>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        padding: '16px',
        borderRadius: '8px',
        margin: '16px 0',
        overflow: 'auto',
      }}
    />
  );
}
