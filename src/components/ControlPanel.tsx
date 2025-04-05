import React from 'react';
import { useGraphStore } from '../store/graphStore';
import { Play, Pause, RotateCcw, Trash2, Moon, Sun, GitBranch, Weight } from 'lucide-react';

export const ControlPanel: React.FC = () => {
  const {
    selectedAlgorithm,
    isDirected,
    isWeighted,
    isDarkMode,
    isRunning,
    clearGraph,
    setAlgorithm,
    toggleDirected,
    toggleWeighted,
    toggleDarkMode,
    startAlgorithm,
    resetAlgorithm
  } = useGraphStore();

  return (
    <div className="p-4 bg-white dark:bg-gray-800 shadow-lg">
      <h2 className="text-xl font-bold mb-4 dark:text-white">Graph Algorithm Visualizer</h2>
      
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium dark:text-gray-200">Algorithm</label>
          <select
            value={selectedAlgorithm}
            onChange={(e) => setAlgorithm(e.target.value as any)}
            className="p-2 border rounded dark:bg-gray-700 dark:text-white"
            disabled={isRunning}
          >
            <option value="BFS">Breadth First Search</option>
            <option value="DFS">Depth First Search</option>
            <option value="DIJKSTRA">Dijkstra's Algorithm</option>
            <option value="ASTAR">A* Pathfinding</option>
          </select>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={toggleDirected}
            disabled={isRunning}
            className={`flex items-center px-3 py-2 rounded ${
              isDirected ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <GitBranch className="w-4 h-4 mr-2" />
            Directed
          </button>
          
          <button
            onClick={toggleWeighted}
            disabled={isRunning}
            className={`flex items-center px-3 py-2 rounded ${
              isWeighted ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Weight className="w-4 h-4 mr-2" />
            Weighted
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={startAlgorithm}
            disabled={isRunning}
            className={`flex items-center px-3 py-2 bg-green-500 text-white rounded ${
              isRunning ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isRunning ? (
              <Pause className="w-4 h-4 mr-2" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isRunning ? 'Running' : 'Start'}
          </button>

          <button
            onClick={resetAlgorithm}
            disabled={isRunning}
            className={`flex items-center px-3 py-2 bg-yellow-500 text-white rounded ${
              isRunning ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </button>

          <button
            onClick={clearGraph}
            disabled={isRunning}
            className={`flex items-center px-3 py-2 bg-red-500 text-white rounded ${
              isRunning ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </button>

          <button
            onClick={toggleDarkMode}
            className="flex items-center px-3 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2 dark:text-white">Instructions</h3>
        <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
          <li>• Click on the canvas to add nodes</li>
          <li>• Drag between nodes to create edges</li>
          <li>• Right-click a node to set start/end points</li>
          <li>• Use the controls above to customize the graph</li>
        </ul>
      </div>
    </div>
  );
};