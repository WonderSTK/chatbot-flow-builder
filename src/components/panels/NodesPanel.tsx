import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NodesPanelProps {
  onAddNode: (type: string, position: { x: number; y: number }) => void;
}

/**
 * NodesPanel Component
 * 
 * Displays available node types that can be added to the flow.
 * Designed to be extensible for future node types.
 * 
 * Current node types:
 * - Text Message Node: For sending text messages in the chatbot flow
 * 
 * Future extensibility:
 * - Image nodes
 * - Conditional nodes  
 * - API call nodes
 * - User input nodes
 */
export const NodesPanel: React.FC<NodesPanelProps> = ({ onAddNode }) => {
  
  // Define available node types - easily extensible
  const nodeTypes = [
    {
      id: 'textNode',
      label: 'Message',
      description: 'Send a text message to users',
      icon: MessageSquare,
      color: 'message-node',
      category: 'Messages'
    },
    // Future node types can be added here:
    // {
    //   id: 'imageNode', 
    //   label: 'Image',
    //   description: 'Send an image to users',
    //   icon: Image,
    //   color: 'image-node',
    //   category: 'Media'
    // },
    // {
    //   id: 'conditionNode',
    //   label: 'Condition', 
    //   description: 'Branch flow based on conditions',
    //   icon: GitBranch,
    //   color: 'condition-node',
    //   category: 'Logic'
    // }
  ];

  // Handle drag start - set the node type for drag and drop
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Handle adding a new node at a default position (fallback for click)
  const handleAddNode = (nodeType: string) => {
    // Add node at center of viewport with some randomization to avoid overlap
    const position = {
      x: 200 + Math.random() * 100,
      y: 200 + Math.random() * 100
    };
    onAddNode(nodeType, position);
  };

  // Group nodes by category for better organization
  const groupedNodes = nodeTypes.reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = [];
    }
    acc[node.category].push(node);
    return acc;
  }, {} as Record<string, typeof nodeTypes>);

  return (
    <div className="h-full flex flex-col">
      {/* Panel Header */}
      <div className="p-4 border-b border-panel-border">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nodes Panel
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Drag and drop nodes to build your chatbot flow
        </p>
      </div>

      {/* Available Nodes */}
      <div className="flex-1 p-4 overflow-y-auto">
        {Object.entries(groupedNodes).map(([category, nodes]) => (
          <div key={category} className="mb-6 last:mb-0">
            {/* Category Header */}
            <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide mb-3">
              {category}
            </h3>

            {/* Node Cards */}
            <div className="space-y-2">
              {nodes.map((nodeType) => {
                const IconComponent = nodeType.icon;
                return (
                  <div
                    key={nodeType.id}
                    className="group relative"
                    draggable
                    onDragStart={(event) => onDragStart(event, nodeType.id)}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start p-4 h-auto bg-node-bg hover:bg-secondary border-node-border hover:border-message-node-border transition-all duration-200 cursor-grab active:cursor-grabbing"
                      onClick={() => handleAddNode(nodeType.id)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        {/* Node Icon */}
                        <div className={`
                          p-2 rounded-lg bg-message-node-bg border border-message-node-border
                          group-hover:bg-message-node group-hover:border-message-node transition-all duration-200
                        `}>
                          <IconComponent className={`
                            w-4 h-4 text-message-node
                            group-hover:text-white transition-colors duration-200
                          `} />
                        </div>

                        {/* Node Info */}
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-text-primary group-hover:text-text-primary">
                            {nodeType.label}
                          </div>
                          <div className="text-xs text-text-secondary mt-1 group-hover:text-text-secondary">
                            {nodeType.description}
                          </div>
                        </div>

                        {/* Add indicator */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Plus className="w-4 h-4 text-text-secondary" />
                        </div>
                      </div>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Future Extensions Placeholder */}
        <div className="mt-8 p-4 border-2 border-dashed border-panel-border rounded-lg text-center">
          <div className="text-text-muted text-sm">
            More node types coming soon...
          </div>
          <div className="text-xs text-text-muted mt-1">
            This panel is designed to be easily extensible
          </div>
        </div>
      </div>

        {/* Panel Footer with Tips */}
        <div className="p-4 border-t border-panel-border bg-secondary/20">
          <div className="text-xs text-text-secondary">
            <div className="font-medium mb-1">💡 Tips:</div>
            <ul className="space-y-1">
              <li>• Drag nodes onto the canvas or click to add</li>
              <li>• Double-click message text to edit inline</li>
              <li>• Connect nodes to define message sequence</li>
              <li>• Each source can have only one connection</li>
            </ul>
          </div>
        </div>
    </div>
  );
};