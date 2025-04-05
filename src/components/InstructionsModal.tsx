import React from 'react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-3/4 max-w-2xl overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-white">Welcome to Graph Algorithm Visualizer!</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            ❌
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          <section>
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Graph Creation</h3>
            <ul className="list-disc pl-5 space-y-2 dark:text-gray-300">
              <li>Double-click anywhere to add a node</li>
              <li>Drag from one node to another to create an edge</li>
              <li>Click and drag nodes to move them</li>
              <li>Use the "Generate Random Graph" button to create a random graph</li>
              <li>Adjust node count and edge density using the sliders</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Setting Up</h3>
            <ul className="list-disc pl-5 space-y-2 dark:text-gray-300">
              <li>Click "Set Start" and select a node to set the starting point</li>
              <li>Click "Set End" and select a node to set the destination</li>
              <li>Toggle "Directed" for one-way edges</li>
              <li>Toggle "Weighted" for weighted edges (required for Dijkstra and A*)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Algorithms</h3>
            <ul className="list-disc pl-5 space-y-2 dark:text-gray-300">
              <li><strong>BFS (Breadth-First Search):</strong> Explores nodes level by level</li>
              <li><strong>DFS (Depth-First Search):</strong> Explores as far as possible along each branch</li>
              <li><strong>Dijkstra's Algorithm:</strong> Finds the shortest path in weighted graphs</li>
              <li><strong>A* Search:</strong> Uses heuristics to find the shortest path more efficiently</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Visualization</h3>
            <ul className="list-disc pl-5 space-y-2 dark:text-gray-300">
              <li>🟢 Green node: Start point</li>
              <li>🔴 Red node: End point</li>
              <li>🔵 Blue nodes: Frontier (next to be explored)</li>
              <li>🟣 Purple nodes: Already visited</li>
              <li>🟡 Orange nodes/edges: Final path</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}; 