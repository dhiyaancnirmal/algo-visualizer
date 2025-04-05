import React from 'react';
import { GraphCanvas } from './components/GraphCanvas';
import { ControlPanel } from './components/ControlPanel';
import { useGraphStore } from './store/graphStore';

function App() {
  const { isDarkMode } = useGraphStore();

  return (
    <div className={`h-screen flex ${isDarkMode ? 'dark' : ''}`}>
      <div className="w-80 min-w-80 border-r dark:border-gray-800">
        <ControlPanel />
      </div>
      <div className="flex-1">
        <GraphCanvas />
      </div>
    </div>
  );
}

export default App;