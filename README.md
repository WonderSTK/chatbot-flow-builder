# Chatbot Flow Builder



A chatbot flow is built by connecting multiple messages together to decide the order of execution.





## Features

1. Text Node
   - The flow builder currently supports a single node type: Text Message (Text Node).
   - Multiple Text Nodes can exist in a single flow.
   - Nodes are added by dragging them from the Nodes Panel into the canvas.

2. Nodes Panel
   - Houses all node types supported by the Flow Builder.
   - Designed to be extensible: new node types can be added easily by creating a node component and registering it in the panel and nodeTypes map.

3. Edge
   - Connects two nodes to define the execution order.

4. Source Handle
   - The origin handle for an outgoing connection.
   - Business rule: a source handle can have only one outbound edge.

5. Target Handle
   - The destination handle for an incoming connection.
   - Can accept multiple inbound edges.

6. Settings Panel

   - Replaces the Nodes Panel when a node is selected.
   - Contains an editable text field for the selected Text Node's message content.

7. Save Button
   - Saves the current flow state.
   - Validation rule: if there are more than one nodes in the flow and more than one node has empty target handles (i.e. no outgoing connection), the save action will fail with an error. This prevents saving a flow where multiple nodes are left without defined next steps.


## Project Structure (high level)

- src/
  - components/
    - FlowBuilder.tsx — main flow canvas using React Flow and glue logic
    - nodes/
      - TextNode.tsx — the Text Node component (handle rendering and node-specific logic)
    - panels/
      - NodesPanel.tsx — draggable node palette
      - SettingsPanel.tsx — node inspector for editing node properties
    - ui/ — UI primitives and shared components
  - hooks/
    - use-mobile.tsx — mobile helpers
    - use-toast.ts — toast helpers
  - lib/
    - utils.ts — small helper utilities
  - pages/
    - Index.tsx — application entry route


## Getting started

Requirements
- Node.js (v16+ recommended)
- npm or pnpm

Install

In the project root:

```powershell
npm install
```

Run development server

```powershell
npm run dev
```

Build & Preview

```powershell
npm run build; npm run preview
```

Tests & Lint

```powershell
npm run lint
```

Open the app at the URL printed by Vite (usually http://localhost:5173).


## How it works (implementation notes)

- FlowBuilder.tsx sets up React Flow with a nodeTypes mapping that maps node type ids (e.g. `textNode`) to React components (e.g. `TextNode`).
- NodesPanel registers draggable items using React Flow's drag-and-drop helper. When dropped on the canvas, a new node object is created and added to the elements state.
- TextNode renders the message text and exposes a target handle and a source handle. The component internally ensures the UI for the handles is consistent with the one-outgoing-edge rule for source handles.
- SettingsPanel subscribes to the selected node. When a node is selected it renders a form (text input) allowing you to edit the selected node's text. Changes update the node data in React Flow's state.
- Save button serializes the flow (nodes + edges) and runs the validation rule described in Features -> Save Button. If validation fails, a toast shows the error; otherwise the flow JSON is output to console (or sent to your server in a real app).


## Extending the app — adding a new node type

1. Add a new node component in `src/components/nodes/`, for example `MyCustomNode.tsx`.
   - Export a React component that accepts the standard React Flow node props.
   - Render content and call `getConnectableHandles` or expose source/target handles as needed.
   - Add JSDoc comments explaining the purpose and public props.

2. Register the node in FlowBuilder's `nodeTypes` map:

```ts
// ...existing code...
const nodeTypes = {
  textNode: TextNode,
  myCustomNode: MyCustomNode, // new registration
};
// ...existing code...
```

3. Add an entry to the Nodes Panel to make the new node draggable into the canvas.

4. (Optional) Add editing UI for the new node to the SettingsPanel — extend the form to show fields that are relevant for your new node type.


## Save validation logic (implementation detail)

- On save, the app collects all nodes and edges.
- If nodes.length > 1, compute for each node whether it has an outgoing edge (edge.source === node.id).
- If more than one node has no outgoing edge, abort save and show an error message informing the user that multiple terminal nodes are present and must be connected.

This prevents accidental flows that branch into multiple undefined terminals.


## Design & UX notes

- The UI primitives in `src/components/ui` wrap Radix UI components styled with TailwindCSS. This keeps the look consistent and makes it easy to replace or enhance UI elements.
- The Nodes Panel / Settings Panel share the same area and swap based on selection state — this keeps the canvas area large while still giving access to node controls.


