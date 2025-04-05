import React from 'react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">Instructions</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 dark:text-white">Graph Creation</h3>
            <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
              <li>• Double-click on the canvas to add nodes</li>
              <li>• Click and drag nodes to move them</li>
              <li>• Click and drag from one node to another to create edges</li>
              <li>• Use the Set Start/End buttons to mark nodes</li>
              <li>• Generate a random graph or build your own</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2 dark:text-white">Algorithms</h3>
            <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
              <li>• BFS - Finds shortest path in unweighted graphs</li>
              <li>• DFS - Explores paths to their deepest level first</li>
              <li>• Dijkstra - Finds shortest path in weighted graphs</li>
              <li>• A* - Similar to Dijkstra but uses heuristics</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2 dark:text-white">Visualization</h3>
            <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
              <li>• Green node - Start point</li>
              <li>• Red node - End point</li>
              <li>• Blue nodes - Frontier (next to visit)</li>
              <li>• Purple nodes - Visited nodes</li>
              <li>• Orange path - Shortest path found</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}; 