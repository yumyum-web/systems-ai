'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { IconButton, Dialog, DialogContent, DialogTitle } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';

interface MermaidProps {
  chart: string;
}

let mermaidInitialized = false;

export default function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        flowchart: {
          useMaxWidth: false,
          htmlLabels: true,
        },
        gantt: {
          useMaxWidth: false,
        },
        sequence: {
          useMaxWidth: false,
        },
      });
      mermaidInitialized = true;
    }
  }, []);

  useEffect(() => {
    const fixMermaidSyntax = (code: string): string => {
      let fixedCode = code;

      // Fix 1: Node labels with parentheses, slashes, colons, etc. that aren't quoted
      // Pattern: NodeId[Label with (special) chars] -> NodeId["Label with (special) chars"]
      fixedCode = fixedCode.replace(
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

      // Fix 2: Remove comments from erDiagram attributes
      // Pattern: type name KEY "comment" -> type name KEY
      if (fixedCode.includes('erDiagram')) {
        // Convert entity names from UPPER_CASE to UpperCase format
        fixedCode = fixedCode.replace(
          /^(\s*)([A-Z][A-Z_]+)\s*\{/gm,
          (match, indent, entityName) => {
            // Convert VOICE_MODEL -> VoiceModel
            const formatted = entityName
              .split('_')
              .map((word: string) => word.charAt(0) + word.slice(1).toLowerCase())
              .join('');
            return `${indent}${formatted} {`;
          }
        );

        // Also fix entity names in relationships
        fixedCode = fixedCode.replace(
          /^(\s*)([A-Z][A-Z_]+)\s+([\|\}o])/gm,
          (match, indent, entityName, symbol) => {
            const formatted = entityName
              .split('_')
              .map((word: string) => word.charAt(0) + word.slice(1).toLowerCase())
              .join('');
            return `${indent}${formatted} ${symbol}`;
          }
        );

        fixedCode = fixedCode.replace(
          /^(\s+)(\w+)\s+(\w+)\s+(PK|FK|UK|UNIQUE|NULL)?\s*"[^"]*"(.*)$/gm,
          (match, indent, type, name, key, rest) => {
            // Reconstruct without the comment
            const keyPart = key ? ` ${key}` : '';
            return `${indent}${type} ${name}${keyPart}${rest}`;
          }
        );
        
        // Also handle attributes without keys but with comments
        // Pattern: type name "comment" -> type name
        fixedCode = fixedCode.replace(
          /^(\s+)(\w+)\s+(\w+)\s+"[^"]*"$/gm,
          '$1$2 $3'
        );
      }

      // Fix 3: Fix Gantt chart task syntax
      if (fixedCode.includes('gantt')) {
        // Fix colon before date: TaskID: Task Name : date -> TaskID: Task Name, date
        fixedCode = fixedCode.replace(
          /^(\s+)([A-Za-z_]\w*):\s*([^:]+)\s*:\s*(.+)$/gm,
          '$1$2: $3, $4'
        );
        
        // Fix multiple "after" dependencies - only keep the first one
        // Pattern: after dep1, after dep2 -> after dep1
        fixedCode = fixedCode.replace(
          /(after\s+\w+),\s*after\s+\w+/g,
          '$1'
        );
        
        // Move tags (crit, milestone, done, active) to end after duration
        // Pattern: :id, date, duration, tag -> :id, date, duration
        // Then add tag support at the end
        fixedCode = fixedCode.replace(
          /^(\s+)([^:]+):\s*(\w+),\s*([^,]+),\s*(\d+d),\s*(crit|milestone|done|active)(.*)$/gm,
          (match, indent, name, id, start, duration, tag, rest) => {
            return `${indent}${name}:${tag}, ${id}, ${start}, ${duration}${rest}`;
          }
        );
        
        // Handle tags without explicit ID
        fixedCode = fixedCode.replace(
          /^(\s+)([^:]+):\s*([^,]+),\s*(\d+d),\s*(crit|milestone|done|active)(.*)$/gm,
          (match, indent, name, start, duration, tag, rest) => {
            return `${indent}${name}:${tag}, ${start}, ${duration}${rest}`;
          }
        );
      }

      return fixedCode;
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
    <>
      <div style={{ position: 'relative' }}>
        <IconButton
          onClick={() => setIsFullscreen(true)}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            zIndex: 1,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            },
          }}
          title="Expand diagram"
        >
          <FullscreenIcon />
        </IconButton>
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
      </div>

      <Dialog
        open={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            width: '95vw',
            height: '95vh',
            maxWidth: 'none',
            maxHeight: 'none',
            m: 0,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1,
          }}
        >
          Diagram
          <IconButton
            onClick={() => setIsFullscreen(false)}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'auto',
            p: 3,
            '& svg': {
              width: 'auto !important',
              height: 'auto !important',
              maxWidth: '100%',
              maxHeight: '100%',
            },
          }}
        >
          <div
            dangerouslySetInnerHTML={{ __html: svg }}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
