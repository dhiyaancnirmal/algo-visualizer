import React, { useState, useEffect, useRef } from 'react';
import { useGraphStore } from '../store/graphStore';
import { Play, Pause, RotateCcw, Trash2, Moon, Sun, GitBranch, Weight, Target, Flag } from 'lucide-react';
import { InstructionsModal } from './InstructionsModal';
import { AlgorithmType } from '../types/graph';

export const ControlPanel: React.FC = () => {
  const [numNodes, setNumNodes] = useState<number>(10);
  const [edgeDensity, setEdgeDensity] = useState<number>(50);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showStepsModal, setShowStepsModal] = useState(false);
  const stepsContainerRef = useRef<HTMLDivElement>(null);

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
    resetAlgorithm,
    generateRandomNodes,
    generateRandomEdges,
    setSettingStartNode,
    setSettingEndNode,
    algorithmSteps,
    currentStepIndex,
    graph,
    settingStartNode,
    settingEndNode
  } = useGraphStore();

  useEffect(() => {
    if (stepsContainerRef.current && currentStepIndex >= 0) {
      const stepElements = stepsContainerRef.current.getElementsByClassName('step-item');
      if (stepElements[currentStepIndex]) {
        stepElements[currentStepIndex].scrollIntoView({ 
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [currentStepIndex]);

  const handleGenerateGraph = () => {
    clearGraph();
    const maxEdges = (numNodes * (numNodes - 1)) / 2;
    const targetEdges = Math.floor(maxEdges * (edgeDensity / 100));
    generateRandomNodes(numNodes);
    generateRandomEdges(targetEdges);
  };

  const isBFS = selectedAlgorithm === 'BFS';
  const isPathfindingDisabled = (isDirected || isWeighted) && isBFS;

  const AlgorithmStepsContent = () => (
    <div className="space-y-2">
      {algorithmSteps.length > 0 && (
        <div className="p-2 rounded bg-blue-200 dark:bg-blue-800 mb-4">
          <p className="text-sm dark:text-gray-200">
            Algorithm: {selectedAlgorithm}<br />
            Nodes: {graph.nodes.length}<br />
            Edge Density: {edgeDensity}%
          </p>
        </div>
      )}
      {algorithmSteps.map((step, index) => (
        <div
          key={index}
          className={`step-item p-2 rounded ${
            index === 0
              ? 'bg-blue-200 dark:bg-blue-800'
              : index === currentStepIndex
              ? 'bg-blue-100 dark:bg-blue-900'
              : 'bg-white dark:bg-gray-800'
          }`}
        >
          <p className="text-sm dark:text-gray-300">
            Step {index + 1}:
            {step.visitedNodes.length > 0 && (
              <span className="ml-2">
                Visited: {step.visitedNodes.map(id => id.replace('node-', '')).join(', ')}
                {(selectedAlgorithm === 'DIJKSTRA' || selectedAlgorithm === 'ASTAR') && step.distances && (
                  <span className="ml-1">
                    (weights: {step.visitedNodes.map(id => 
                      `${id.replace('node-', '')}=${step.distances[id]?.toFixed(1) || '∞'}`
                    ).join(', ')})
                  </span>
                )}
              </span>
            )}
            {step.frontierNodes.length > 0 && (
              <span className="ml-2">
                Frontier: {step.frontierNodes.map(id => id.replace('node-', '')).join(', ')}
              </span>
            )}
            {step.pathNodes.length > 0 && (
              <span className="ml-2">
                Path: {step.pathNodes.map((id, i) => {
                  if (i === step.pathNodes.length - 1) {
                    return id.replace('node-', '');
                  }
                  const nextId = step.pathNodes[i + 1];
                  const edge = graph.edges.find(e => 
                    (e.source === id && e.target === nextId) || 
                    (e.target === id && e.source === nextId)
                  );
                  return `${id.replace('node-', '')} (${edge?.weight || 0}) →`;
                }).join(' ')}
                {(selectedAlgorithm === 'DIJKSTRA' || selectedAlgorithm === 'ASTAR') && step.distances && (
                  <span className="ml-2 font-semibold">
                    Total Weight: {step.distances[step.pathNodes[step.pathNodes.length - 1]]?.toFixed(1) || 0}
                  </span>
                )}
              </span>
            )}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-white dark:bg-gray-800 shadow-lg overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold dark:text-white">Graph Algorithm Visualizer</h1>
          <button
            onClick={() => setShowInstructions(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full ml-4"
            title="Instructions"
          >
            📄
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Graph Generation Controls */}
          <div className="flex flex-col space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium dark:text-gray-200">Number of Nodes</label>
              <input
                type="range"
                min="2"
                max="50"
                value={numNodes}
                onChange={(e) => setNumNodes(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-500 dark:text-gray-400">{numNodes} nodes</div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium dark:text-gray-200">Edge Density</label>
              <input
                type="range"
                min="0"
                max="100"
                value={edgeDensity}
                onChange={(e) => setEdgeDensity(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-500 dark:text-gray-400">{edgeDensity}% density</div>
            </div>

            <button
              onClick={handleGenerateGraph}
              disabled={isRunning}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-1.5 px-3 rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Generate Random Graph
            </button>
          </div>

          {/* Graph Type Controls */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="directed"
                checked={isDirected}
                onChange={toggleDirected}
                disabled={isRunning || isBFS}
                className="h-4 w-4 text-blue-500 disabled:opacity-50"
              />
              <label 
                htmlFor="directed" 
                className={`text-sm font-medium dark:text-gray-200 ${isBFS ? 'opacity-50' : ''}`}
              >
                Directed Graph
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="weighted"
                checked={isWeighted}
                onChange={toggleWeighted}
                disabled={isRunning || isBFS}
                className="h-4 w-4 text-blue-500 disabled:opacity-50"
              />
              <label 
                htmlFor="weighted" 
                className={`text-sm font-medium dark:text-gray-200 ${isBFS ? 'opacity-50' : ''}`}
              >
                Weighted Graph
              </label>
            </div>
          </div>

          {/* Algorithm Selection */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium dark:text-gray-200">Algorithm</label>
            <select
              value={selectedAlgorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              disabled={isRunning}
              className="w-full p-1.5 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
            >
              <option value="">--- Select Algorithm ---</option>
              <option value="BFS" disabled={isDirected || isWeighted}>Breadth First Search</option>
              <option value="DFS">Depth First Search</option>
              <option value="DIJKSTRA" disabled={!isWeighted}>Dijkstra's Algorithm</option>
              <option value="ASTAR" disabled={!isWeighted}>A* Search</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSettingStartNode(true)}
              disabled={isRunning}
              className="flex items-center justify-center px-2 py-1.5 text-sm rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
              style={{ cursor: settingStartNode ? 'pointer' : 'default' }}
            >
              <Flag className="w-4 h-4 mr-1" />
              Set Start
            </button>
            
            <button
              onClick={() => setSettingEndNode(true)}
              disabled={isRunning}
              className="flex items-center justify-center px-2 py-1.5 text-sm rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              style={{ cursor: settingEndNode ? 'pointer' : 'default' }}
            >
              <Target className="w-4 h-4 mr-1" />
              Set End
            </button>

            <button
              onClick={resetAlgorithm}
              disabled={isRunning}
              className="flex items-center justify-center px-2 py-1.5 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </button>

            <button
              onClick={clearGraph}
              disabled={isRunning}
              className="flex items-center justify-center px-2 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </button>
          </div>

          {/* Run Algorithm Button */}
          <button
            onClick={startAlgorithm}
            disabled={isRunning || isPathfindingDisabled || !selectedAlgorithm}
            className={`w-full py-1.5 px-3 text-white font-medium rounded text-sm mt-2 flex items-center justify-center ${
              !selectedAlgorithm ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
            } disabled:opacity-50`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Run Algorithm
              </>
            )}
          </button>
        </div>
      </div>

      {/* Algorithm Steps Panel */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-[200px]">
        <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 p-4 border-b dark:border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-semibold dark:text-white">Algorithm Steps</h3>
          <button
            onClick={() => setShowStepsModal(true)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Expand Steps"
          >
            🔍
          </button>
        </div>
        <div className="overflow-y-auto p-4 h-[calc(200px-4rem)]" ref={stepsContainerRef}>
          <AlgorithmStepsContent />
        </div>
      </div>

      {/* Steps Modal */}
      {showStepsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowStepsModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-3/4 h-3/4 max-w-4xl overflow-hidden">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold dark:text-white">Algorithm Steps</h3>
              <button
                onClick={() => setShowStepsModal(false)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                ❌
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
              <AlgorithmStepsContent />
            </div>
          </div>
        </div>
      )}

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
      </button>

      <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} />
    </div>
  );
};