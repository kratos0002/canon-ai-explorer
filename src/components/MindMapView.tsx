
import React, { useEffect, useRef, useState } from 'react';
import { Concept } from './ChatInterface';

interface MindMapViewProps {
  concepts: Concept[];
  onConnectConcepts: (sourceId: string, targetId: string) => void;
}

interface ConceptNode {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  description: string;
}

interface ConceptConnection {
  source: string;
  target: string;
}

const MindMapView: React.FC<MindMapViewProps> = ({ concepts, onConnectConcepts }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<ConceptNode[]>([]);
  const [connections, setConnections] = useState<ConceptConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<ConceptNode | null>(null);
  const [connectingMode, setConnectingMode] = useState(false);
  const [connectingSource, setConnectingSource] = useState<string | null>(null);
  
  // Convert concepts to nodes with positions
  useEffect(() => {
    if (concepts.length === 0) return;
    
    // Create nodes from concepts
    const centerX = 400;
    const centerY = 200;
    const radius = 150;
    const colors = [
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Amber
      '#EF4444', // Red
    ];
    
    const newNodes = concepts.map((concept, index) => {
      // Position in a circle around center
      const angle = (index / concepts.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      return {
        id: concept.id,
        label: concept.label,
        description: concept.description,
        x,
        y,
        radius: 40,
        color: colors[index % colors.length],
      };
    });
    
    setNodes(newNodes);
    
    // Create connections between nodes
    const newConnections: ConceptConnection[] = [];
    concepts.forEach(concept => {
      concept.connections.forEach(targetId => {
        newConnections.push({
          source: concept.id,
          target: targetId
        });
      });
    });
    
    setConnections(newConnections);
  }, [concepts]);
  
  // Draw the mind map
  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const containerWidth = containerRef.current?.clientWidth || 800;
    const containerHeight = containerRef.current?.clientHeight || 500;
    
    // Set canvas size to match container
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections first (so they're behind nodes)
    context.lineWidth = 2;
    context.strokeStyle = 'rgba(139, 92, 246, 0.5)'; // Light purple
    
    connections.forEach(connection => {
      const sourceNode = nodes.find(node => node.id === connection.source);
      const targetNode = nodes.find(node => node.id === connection.target);
      
      if (sourceNode && targetNode) {
        context.beginPath();
        context.moveTo(sourceNode.x, sourceNode.y);
        context.lineTo(targetNode.x, targetNode.y);
        context.stroke();
      }
    });
    
    // Draw nodes
    nodes.forEach(node => {
      // Draw circle
      context.beginPath();
      context.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      context.fillStyle = node.color;
      context.fill();
      
      // Draw border (thicker if selected)
      if (selectedNode && selectedNode.id === node.id) {
        context.lineWidth = 3;
        context.strokeStyle = '#ffffff';
      } else {
        context.lineWidth = 2;
        context.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      }
      context.stroke();
      
      // Draw label
      context.font = 'bold 14px sans-serif';
      context.fillStyle = '#ffffff';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(node.label, node.x, node.y);
    });
    
    // Draw connecting line if in connecting mode
    if (connectingMode && connectingSource && selectedNode) {
      const sourceNode = nodes.find(node => node.id === connectingSource);
      if (sourceNode) {
        context.beginPath();
        context.moveTo(sourceNode.x, sourceNode.y);
        context.lineTo(selectedNode.x, selectedNode.y);
        context.setLineDash([5, 3]);
        context.strokeStyle = 'rgba(139, 92, 246, 0.8)';
        context.stroke();
        context.setLineDash([]);
      }
    }
    
  }, [nodes, connections, selectedNode, connectingMode, connectingSource]);
  
  // Handle mouse interactions
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicked on a node
    const clickedNode = nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx*dx + dy*dy) <= node.radius;
    });
    
    if (clickedNode) {
      if (connectingMode && connectingSource) {
        // Finish connecting two nodes
        if (connectingSource !== clickedNode.id) {
          onConnectConcepts(connectingSource, clickedNode.id);
          setConnections([...connections, {
            source: connectingSource,
            target: clickedNode.id
          }]);
        }
        setConnectingMode(false);
        setConnectingSource(null);
      } else {
        // Select node
        setSelectedNode(clickedNode);
      }
    } else {
      // Clicked on empty space
      setSelectedNode(null);
    }
  };
  
  const startConnecting = () => {
    if (selectedNode) {
      setConnectingMode(true);
      setConnectingSource(selectedNode.id);
    }
  };
  
  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      <div className="flex justify-between items-center mb-4">
        <div>
          {selectedNode && (
            <div className="text-sm">
              <span className="font-medium">{selectedNode.label}: </span>
              <span className="text-muted-foreground">{selectedNode.description}</span>
            </div>
          )}
        </div>
        <div>
          {selectedNode && (
            <button 
              onClick={startConnecting}
              disabled={connectingMode}
              className="text-xs px-2 py-1 bg-canon-purple/10 text-canon-purple rounded hover:bg-canon-purple/20 disabled:opacity-50"
            >
              {connectingMode ? 'Click on target node' : 'Connect to another concept'}
            </button>
          )}
        </div>
      </div>
      
      <div className="relative flex-1 border rounded-lg overflow-hidden bg-white/50">
        <canvas 
          ref={canvasRef} 
          onClick={handleCanvasClick}
          className="w-full h-full min-h-[300px]"
        />
        
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            Add concepts to visualize relationships between key ideas
          </div>
        )}
      </div>
    </div>
  );
};

export default MindMapView;
