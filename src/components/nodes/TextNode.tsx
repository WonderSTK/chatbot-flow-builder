import React, { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { MessageSquare, Edit3 } from 'lucide-react';

// Define the data structure for TextNode
export interface TextNodeData {
  text: string;
  label: string;
}

/**
 * TextNode Component
 * 
 * Represents a text message node in the chatbot flow.
 * Features:
 * - Single source handle (only one outgoing connection allowed)
 * - Multiple target handles (can receive multiple connections)
 * - Displays message text with truncation
 * - Visual feedback for selection and connection states
 */
export const TextNode: React.FC<NodeProps> = memo(({ id, data, selected }) => {
  const nodeData = data as unknown as TextNodeData;
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(nodeData.text || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle double click to start editing
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditText(nodeData.text || '');
  };

  // Handle saving the edit
  const handleSave = () => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, text: editText } }
          : node
      )
    );
    setIsEditing(false);
  };

  // Handle cancel editing
  const handleCancel = () => {
    setEditText(nodeData.text || '');
    setIsEditing(false);
  };

  // Handle key press in textarea
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Auto focus and select text when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);
  return (
    <div className={`
      relative bg-node-bg border-2 rounded-lg shadow-sm min-w-[200px] max-w-[280px]
      ${selected ? 'border-selected shadow-md' : 'border-node-border'}
      hover:shadow-md transition-all duration-200
    `}>
      {/* Target Handle - Can receive multiple connections */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-handle border-2 border-node-bg hover:bg-handle-hover hover:border-handle-connecting transition-colors"
        style={{ left: -6 }}
      />

      {/* Node Header */}
      <div className="flex items-center gap-2 p-3 pb-2 border-b border-message-node-border bg-message-node-bg rounded-t-lg">
        <MessageSquare className="w-4 h-4 text-message-node flex-shrink-0" />
        <span className="text-sm font-medium text-message-node-text truncate">
          {nodeData.label || 'Message'}
        </span>
      </div>

      {/* Node Content */}
      <div className="p-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleSave}
              className="w-full text-sm bg-node-bg border border-input-focus rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              rows={3}
              placeholder="Enter your message..."
            />
            <div className="flex gap-1 text-xs text-text-muted">
              <span>Ctrl+Enter to save • Esc to cancel</span>
            </div>
          </div>
        ) : (
          <div 
            className="text-sm text-text-primary leading-relaxed cursor-text hover:bg-message-node-bg/30 rounded px-1 py-1 transition-colors group relative"
            onDoubleClick={handleDoubleClick}
          >
            {nodeData.text ? (
              <span className="block">
                {nodeData.text.length > 100 ? `${nodeData.text.substring(0, 100)}...` : nodeData.text}
              </span>
            ) : (
              <span className="text-text-muted italic">Double-click to edit message...</span>
            )}
            
            {/* Edit Icon - shows on hover */}
            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit3 className="w-3 h-3 text-text-muted" />
            </div>
          </div>
        )}
      </div>

      {/* Source Handle - Only one outgoing connection allowed */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-handle border-2 border-node-bg hover:bg-handle-hover hover:border-handle-connecting transition-colors"
        style={{ right: -6 }}
      />

      {/* Selection indicator */}
      {selected && (
        <div className="absolute -inset-1 border-2 border-selected rounded-lg pointer-events-none opacity-50" />
      )}
    </div>
  );
});