import React from 'react';
import { GraphCanvas } from './components/GraphCanvas';
import { ControlPanel } from './components/ControlPanel';
import { useGraphStore } from './store/graphStore';

function App() {
  const isDarkMode = useGraphStore(state => state.isDarkMode);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-white dark:bg-gray-900">
        <div className="w-80 border-r border-gray-200 dark:border-gray-700">
          <ControlPanel />
        </div>
        <div className="flex-1">
          <GraphCanvas />
        </div>
      </div>
    </div>
  );
}

export default App;