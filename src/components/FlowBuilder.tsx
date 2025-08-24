import React, { useCallback, useState, useMemo } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  NodeTypes,
  BackgroundVariant,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
} from '@xyflow/react';
import { MessageSquare, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

import { TextNode, TextNodeData } from './nodes/TextNode';
import { NodesPanel } from './panels/NodesPanel';
import { SettingsPanel } from './panels/SettingsPanel';

// Define node types for the flow
const nodeTypes: NodeTypes = {
  textNode: TextNode,
};

// Initial nodes for the flow
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'textNode',
    position: { x: 250, y: 200 },
    data: { 
      text: 'Welcome! Start building your chatbot flow.',
      label: 'Welcome Message'
    },
  },
];

const initialEdges: Edge[] = [];

export const FlowBuilder: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Handle new connections between nodes
  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      // Validate: only one edge can originate from a source handle
      const existingEdge = edges.find(
        (edge) => edge.source === params.source && edge.sourceHandle === params.sourceHandle
      );
      
      if (existingEdge) {
        toast({
          title: "Connection Error",
          description: "Each source handle can only have one outgoing connection.",
          variant: "destructive",
        });
        return;
      }

      setEdges((eds) => addEdge(params, eds));
    },
    [edges, setEdges]
  );

  // Handle node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Handle clicking on empty canvas
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Update selected node's data
  const updateNodeData = useCallback((nodeId: string, newData: Partial<TextNodeData>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
    
    // Update selected node if it's the one being edited
    if (selectedNode?.id === nodeId) {
      setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, ...newData } } : null);
    }
  }, [setNodes, selectedNode]);

  // Handle drop on canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // Check if the dropped element is a valid node type
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Calculate position relative to the react flow canvas
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      addNode(type, position);
    },
    [nodes.length]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Add new node to the flow
  const addNode = useCallback((type: string, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `${nodes.length + 1}-${Date.now()}`,
      type,
      position,
      data: {
        text: type === 'textNode' ? 'Click to edit this message...' : '',
        label: type === 'textNode' ? 'Message' : 'Node',
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
  }, [nodes.length, setNodes]);

  // Save flow validation
  const saveFlow = useCallback(() => {
    if (nodes.length <= 1) {
      toast({
        title: "Flow Saved",
        description: "Your chatbot flow has been saved successfully.",
      });
      return;
    }

    // Check for nodes with empty target handles (no incoming connections)
    const nodesWithoutTargets = nodes.filter((node) => {
      const hasIncomingEdge = edges.some((edge) => edge.target === node.id);
      return !hasIncomingEdge;
    });

    if (nodesWithoutTargets.length > 1) {
      toast({
        title: "Validation Error",
        description: "Cannot save flow: More than one node has empty target handles.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Flow Saved",
      description: "Your chatbot flow has been saved successfully.",
    });
  }, [nodes, edges]);

  // Calculate statistics for display
  const flowStats = useMemo(() => ({
    nodeCount: nodes.length,
    connectionCount: edges.length,
    isolatedNodes: nodes.filter(node => 
      !edges.some(edge => edge.source === node.id || edge.target === node.id)
    ).length,
  }), [nodes, edges]);

  return (
    <div className="flex h-screen bg-canvas">
      {/* Main Flow Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          className="bg-canvas"
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1} 
            className="bg-canvas-dots opacity-40"
          />
          <Controls className="bg-panel-bg border-panel-border shadow-sm" />
          <MiniMap 
            className="bg-panel-bg border-panel-border shadow-sm"
            nodeColor="var(--message-node)"
            maskColor="rgba(255, 255, 255, 0.8)"
            pannable
            zoomable
          />
        </ReactFlow>

        {/* Top Action Bar */}
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center gap-4 bg-panel-bg border border-panel-border rounded-lg px-4 py-2 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <MessageSquare className="w-4 h-4" />
              <span>{flowStats.nodeCount} nodes</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="text-sm text-text-secondary">
              {flowStats.connectionCount} connections
            </div>
            {flowStats.isolatedNodes > 0 && (
              <>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-1 text-sm text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{flowStats.isolatedNodes} isolated</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="absolute top-4 right-4 z-10">
          <Button onClick={saveFlow} className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Right Panel - Nodes or Settings */}
      <div className="w-80 bg-panel-bg border-l border-panel-border">
        {selectedNode ? (
          <SettingsPanel 
            node={selectedNode} 
            onUpdateNode={updateNodeData}
            onClose={() => setSelectedNode(null)}
          />
        ) : (
          <NodesPanel onAddNode={addNode} />
        )}
      </div>
    </div>
  );
};