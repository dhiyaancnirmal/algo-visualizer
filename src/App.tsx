import React, { useState, useEffect } from 'react';
import { GraphCanvas } from './components/GraphCanvas';
import { ControlPanel } from './components/ControlPanel';
import { WelcomeModal } from './components/WelcomeModal';
import { useGraphStore } from './store/graphStore';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const isDarkMode = useGraphStore(state => state.isDarkMode);

  // Check if it's the first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedGraphVisualizer');
    if (hasVisited) {
      setShowWelcome(false);
    }
  }, []);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasVisitedGraphVisualizer', 'true');
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-white dark:bg-gray-900">
        <div className="w-80 min-w-80 border-r border-gray-200 dark:border-gray-700">
          <ControlPanel />
        </div>
        <div className="flex-1 relative">
          <GraphCanvas />
        </div>
      </div>
      {showWelcome && <WelcomeModal isOpen={showWelcome} onClose={handleCloseWelcome} />}
    </div>
  );
}

export default App;