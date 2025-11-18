'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
    });
  }, []);

  useEffect(() => {
    if (ref.current) {
      try {
        ref.current.innerHTML = chart;
        mermaid.contentLoaded();
      } catch (error) {
        console.error('Mermaid rendering error:', error);
      }
    }
  }, [chart]);

  return (
    <div
      ref={ref}
      className="mermaid"
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
