import React from 'react';
import { X } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-2xl w-full m-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Welcome to Graph Algorithm Visualizer
        </h2>

        <div className="space-y-6 text-gray-600 dark:text-gray-300">
          <section>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Getting Started</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Double-click anywhere on the canvas to create nodes</li>
              <li>Click and drag between nodes to create edges</li>
              <li>Click and drag nodes to move them around</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Setting Up Your Graph</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Click "Set Start" button, then click a node to set it as the starting point</li>
              <li>Click "Set End" button, then click a node to set it as the end point</li>
              <li>Toggle "Directed" to make edges one-directional (shown with arrows)</li>
              <li>Toggle "Weighted" to add weights to edges</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Quick Generation</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use the sliders to set the number of nodes and edges</li>
              <li>Click "Generate Random Graph" to create a random graph</li>
              <li>The graph will be generated with nodes spread out for better visibility</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Running Algorithms</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Select an algorithm from the dropdown menu</li>
              <li>Click "Start" to visualize the algorithm's execution</li>
              <li>Watch as nodes change color to show:
                <ul className="list-disc pl-5 mt-1">
                  <li><span className="text-blue-500">Blue</span> - Visited nodes</li>
                  <li><span className="text-orange-500">Orange</span> - Frontier nodes</li>
                  <li><span className="text-green-500">Green</span> - Path nodes</li>
                </ul>
              </li>
            </ul>
          </section>
        </div>

        <button
          onClick={onClose}
          className="mt-8 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}; 