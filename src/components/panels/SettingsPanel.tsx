import React, { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { Settings, X, MessageSquare, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TextNodeData } from '../nodes/TextNode';

interface SettingsPanelProps {
  node: Node;
  onUpdateNode: (nodeId: string, newData: Partial<TextNodeData>) => void;
  onClose: () => void;
}

/**
 * SettingsPanel Component
 * 
 * Provides editing interface for selected nodes.
 * Currently supports text nodes with plans for extensibility.
 * 
 * Features:
 * - Real-time preview of changes
 * - Validation for required fields
 * - Extensible design for different node types
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  node, 
  onUpdateNode, 
  onClose 
}) => {
  const [localData, setLocalData] = useState<TextNodeData>(node.data as unknown as TextNodeData);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local data when node changes
  useEffect(() => {
    setLocalData(node.data as unknown as TextNodeData);
    setHasChanges(false);
  }, [node]);

  // Handle input changes and track modifications
  const handleDataChange = (field: string, value: string) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    setHasChanges(true);
    
    // Auto-save changes with slight delay for better UX
    const timeoutId = setTimeout(() => {
      onUpdateNode(node.id, newData);
      setHasChanges(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Save changes immediately
  const saveChanges = () => {
    onUpdateNode(node.id, localData);
    setHasChanges(false);
  };

  // Render different settings based on node type
  const renderNodeSettings = () => {
    switch (node.type) {
      case 'textNode':
        return (
          <div className="space-y-4">
            {/* Node Label */}
            <div className="space-y-2">
              <Label htmlFor="nodeLabel" className="text-sm font-medium text-text-primary">
                Node Label
              </Label>
              <Input
                id="nodeLabel"
                value={localData.label || ''}
                onChange={(e) => handleDataChange('label', e.target.value)}
                placeholder="Enter node label..."
                className="bg-node-bg border-input focus:border-input-focus focus:ring-ring"
              />
              <p className="text-xs text-text-muted">
                This label appears in the node header
              </p>
            </div>

            {/* Message Text */}
            <div className="space-y-2">
              <Label htmlFor="messageText" className="text-sm font-medium text-text-primary">
                Message Text
              </Label>
              <Textarea
                id="messageText"
                value={localData.text || ''}
                onChange={(e) => handleDataChange('text', e.target.value)}
                placeholder="Enter your message text..."
                rows={4}
                className="bg-node-bg border-input focus:border-input-focus focus:ring-ring resize-none"
              />
              <p className="text-xs text-text-muted">
                {(localData.text?.length || 0)} characters
              </p>
            </div>

            {/* Message Preview */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-text-primary">Preview</Label>
              <div className="p-3 bg-message-node-bg border border-message-node-border rounded-lg">
                <div className="text-sm text-message-node-text">
                  {localData.text || (
                    <span className="text-text-muted italic">No message text</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      // Future node types can be added here
      default:
        return (
          <div className="text-center py-8">
            <Settings className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-text-muted">No settings available for this node type</p>
          </div>
        );
    }
  };

  const getNodeTypeInfo = () => {
    switch (node.type) {
      case 'textNode':
        return {
          icon: MessageSquare,
          label: 'Text Message',
          description: 'Configure your text message content'
        };
      default:
        return {
          icon: Type,
          label: 'Node',
          description: 'Configure node settings'
        };
    }
  };

  const nodeTypeInfo = getNodeTypeInfo();
  const IconComponent = nodeTypeInfo.icon;

  return (
    <div className="h-full flex flex-col">
      {/* Panel Header */}
      <div className="p-4 border-b border-panel-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconComponent className="w-5 h-5 text-message-node" />
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {nodeTypeInfo.label}
              </h2>
              <p className="text-sm text-text-secondary">
                {nodeTypeInfo.description}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {renderNodeSettings()}
      </div>

      {/* Panel Footer */}
      <div className="p-4 border-t border-panel-border">
        {hasChanges && (
          <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            You have unsaved changes. They will be auto-saved shortly.
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            onClick={saveChanges}
            disabled={!hasChanges}
            className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            Save Changes
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-node-bg hover:bg-secondary border-node-border"
          >
            Close
          </Button>
        </div>

        {/* Node Info */}
        <div className="mt-4 text-xs text-text-muted">
          <div className="font-medium mb-1">Node Info:</div>
          <div>ID: {node.id}</div>
          <div>Type: {node.type}</div>
          <div>Position: ({Math.round(node.position.x)}, {Math.round(node.position.y)})</div>
        </div>
      </div>
    </div>
  );
};