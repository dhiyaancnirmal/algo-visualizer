import { create } from 'zustand';
import { GraphState, AlgorithmType, Node, Edge, AlgorithmStep } from '../types/graph';
import { runBFS, runDFS, runDijkstra, runAStar } from '../algorithms';

export const useGraphStore = create<GraphState>((set, get) => ({
  graph: {
    nodes: [],
    edges: []
  },
  selectedAlgorithm: '',
  isDirected: false,
  isWeighted: false,
  isDarkMode: false,
  isRunning: false,
  settingStartNode: false,
  settingEndNode: false,
  algorithmSteps: [],
  currentStepIndex: -1,
  algorithmHistory: [],

  generateRandomNodes: (count: number) => set((state) => {
    const canvasWidth = 1000;
    const canvasHeight = 800;
    const nodeRadius = 20;
    const padding = nodeRadius * 4;
    
    const newNodes: Node[] = [];
    
    // Create nodes in a grid layout
    const gridSize = Math.ceil(Math.sqrt(count));
    const cellWidth = (canvasWidth - 2 * padding) / gridSize;
    const cellHeight = (canvasHeight - 2 * padding) / gridSize;
    
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      
      // Calculate base position in grid
      const baseX = padding + col * cellWidth + cellWidth / 2;
      const baseY = padding + row * cellHeight + cellHeight / 2;
      
      // Add some random offset within the cell, but ensure it stays within bounds
      const maxOffset = Math.min(cellWidth, cellHeight) * 0.3; // Reduced from 0.5 to 0.3
      const offsetX = (Math.random() - 0.5) * maxOffset;
      const offsetY = (Math.random() - 0.5) * maxOffset;
      
      newNodes.push({
        id: `node-${i}`,
        x: Math.min(canvasWidth - padding, Math.max(padding, baseX + offsetX)),
        y: Math.min(canvasHeight - padding, Math.max(padding, baseY + offsetY)),
        isStart: false,
        isEnd: false,
        isVisited: false,
        isFrontier: false,
        isPath: false
      });
    }
    
    return {
      graph: {
        nodes: newNodes,
        edges: []  // Clear edges when generating new nodes
      }
    };
  }),

  generateRandomEdges: (count: number) => set((state) => {
    const newEdges: Edge[] = [];
    const existingEdges = new Set(
      state.graph.edges.map(e => `${e.source}-${e.target}`)
    );
    
    let attempts = 0;
    const maxAttempts = count * 100;
    
    while (newEdges.length < count && attempts < maxAttempts) {
      const sourceIndex = Math.floor(Math.random() * state.graph.nodes.length);
      const targetIndex = Math.floor(Math.random() * state.graph.nodes.length);
      
      if (sourceIndex !== targetIndex) {
        const source = state.graph.nodes[sourceIndex].id;
        const target = state.graph.nodes[targetIndex].id;
        const edgeKey = `${source}-${target}`;
        const reverseEdgeKey = `${target}-${source}`;
        
        if (!existingEdges.has(edgeKey) && !existingEdges.has(reverseEdgeKey)) {
          newEdges.push({
            source,
            target,
            weight: state.isWeighted ? Math.floor(Math.random() * 9) + 1 : 1,
            isDirected: state.isDirected,
            isPath: false,
            isVisited: false
          });
          existingEdges.add(edgeKey);
        }
      }
      attempts++;
    }
    
    return {
      graph: {
        ...state.graph,
        edges: [...state.graph.edges, ...newEdges]
      }
    };
  }),

  addNode: (x: number, y: number) => set((state) => {
    const newNode: Node = {
      id: `node-${state.graph.nodes.length}`,
      x,
      y,
      isStart: false,
      isEnd: false
    };
    return {
      graph: {
        ...state.graph,
        nodes: [...state.graph.nodes, newNode]
      }
    };
  }),

  setStartNode: (id: string) => set((state) => ({
    graph: {
      ...state.graph,
      nodes: state.graph.nodes.map(node => ({
        ...node,
        isStart: node.id === id,
        isEnd: node.id === id ? false : node.isEnd
      }))
    }
  })),

  setEndNode: (id: string) => set((state) => ({
    graph: {
      ...state.graph,
      nodes: state.graph.nodes.map(node => ({
        ...node,
        isEnd: node.id === id,
        isStart: node.id === id ? false : node.isStart
      }))
    }
  })),

  addEdge: (source: string, target: string, weight = 1) => set((state) => {
    const newEdge: Edge = {
      source,
      target,
      weight,
      isDirected: state.isDirected
    };
    return {
      graph: {
        ...state.graph,
        edges: [...state.graph.edges, newEdge]
      }
    };
  }),

  clearGraph: () => set(() => ({
    graph: {
      nodes: [],
      edges: []
    }
  })),

  setAlgorithm: (algorithm: AlgorithmType) => set(() => ({
    selectedAlgorithm: algorithm
  })),

  toggleDirected: () => set((state) => ({
    isDirected: !state.isDirected
  })),

  toggleWeighted: () => set((state) => ({
    isWeighted: !state.isWeighted
  })),

  toggleDarkMode: () => set((state) => ({
    isDarkMode: !state.isDarkMode
  })),

  updateNodeState: (id: string, updates: Partial<Node>) => set((state) => ({
    graph: {
      ...state.graph,
      nodes: state.graph.nodes.map(node =>
        node.id === id ? { ...node, ...updates } : node
      )
    }
  })),

  updateEdgeState: (source: string, target: string, updates: Partial<Edge>) => set((state) => ({
    graph: {
      ...state.graph,
      edges: state.graph.edges.map(edge =>
        edge.source === source && edge.target === target ? { ...edge, ...updates } : edge
      )
    }
  })),

  startAlgorithm: async () => {
    const state = get();
    const startNode = state.graph.nodes.find(n => n.isStart);
    const endNode = state.graph.nodes.find(n => n.isEnd);

    if (!startNode || !endNode) {
      alert('Please select start and end nodes');
      return;
    }

    if (!state.selectedAlgorithm) {
      alert('Please select an algorithm');
      return;
    }

    set({ isRunning: true });

    // Reset previous visualization states
    state.graph.nodes.forEach(node => {
      state.updateNodeState(node.id, {
        isVisited: false,
        isPath: false,
        isFrontier: false
      });
    });

    state.graph.edges.forEach(edge => {
      state.updateEdgeState(edge.source, edge.target, { 
        isPath: false,
        isVisited: false 
      });
    });

    let algorithmSteps: AlgorithmStep[];
    switch (state.selectedAlgorithm) {
      case 'BFS':
        algorithmSteps = runBFS(state.graph, startNode.id, endNode.id);
        break;
      case 'DFS':
        algorithmSteps = runDFS(state.graph, startNode.id, endNode.id);
        break;
      case 'DIJKSTRA':
        algorithmSteps = runDijkstra(state.graph, startNode.id, endNode.id);
        break;
      case 'ASTAR':
        algorithmSteps = runAStar(state.graph, startNode.id, endNode.id);
        break;
      default:
        algorithmSteps = [];
    }

    set({ algorithmSteps });

    // Animate algorithm steps
    for (let i = 0; i < algorithmSteps.length; i++) {
      const step = algorithmSteps[i];
      set({ currentStepIndex: i });

      // Mark edges as visited when they're explored
      step.pathEdges.forEach(({ source, target }) => {
        state.updateEdgeState(source, target, { 
          isVisited: true,
          isPath: false
        });
      });

      // Mark nodes as visited or frontier
      step.visitedNodes.forEach(id => {
        if (!step.pathNodes.includes(id) && id !== startNode.id && id !== endNode.id) {
          state.updateNodeState(id, { 
            isVisited: true, 
            isFrontier: false,
            isPath: false
          });
        }
      });

      step.frontierNodes.forEach(id => {
        if (!step.pathNodes.includes(id) && id !== startNode.id && id !== endNode.id) {
          state.updateNodeState(id, { 
            isFrontier: true,
            isVisited: false,
            isPath: false
          });
        }
      });

      // If this is the final step with the path, highlight it
      if (step.pathNodes.length > 0) {
        // Keep visited nodes as visited, don't reset them
        // Only update the path nodes
        for (let j = 0; j < step.pathNodes.length - 1; j++) {
          const currentId = step.pathNodes[j];
          const nextId = step.pathNodes[j + 1];

          // Update node state
          if (currentId !== startNode.id && currentId !== endNode.id) {
            state.updateNodeState(currentId, { 
              isPath: true,
              isVisited: false,
              isFrontier: false
            });
          }

          // Update edge state
          state.graph.edges.forEach(edge => {
            if ((edge.source === currentId && edge.target === nextId) ||
                (edge.target === currentId && edge.source === nextId)) {
              state.updateEdgeState(edge.source, edge.target, { 
                isPath: true,
                isVisited: false
              });
            }
          });
        }

        // Update the last node in the path
        const lastId = step.pathNodes[step.pathNodes.length - 1];
        if (lastId !== startNode.id && lastId !== endNode.id) {
          state.updateNodeState(lastId, { 
            isPath: true,
            isVisited: false,
            isFrontier: false
          });
        }
      }

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    set({ isRunning: false });
  },

  resetAlgorithm: () => set((state) => {
    // Reset all node states
    const updatedNodes = state.graph.nodes.map(node => ({
      ...node,
      isVisited: false,
      isPath: false,
      isFrontier: false
    }));

    // Reset all edge states
    const updatedEdges = state.graph.edges.map(edge => ({
      ...edge,
      isPath: false
    }));

    return {
      graph: {
        nodes: updatedNodes,
        edges: updatedEdges
      },
      currentStepIndex: -1,
      algorithmSteps: []
    };
  }),

  updateNodePosition: (id: string, x: number, y: number) => set((state) => ({
    graph: {
      ...state.graph,
      nodes: state.graph.nodes.map(node =>
        node.id === id ? { ...node, x, y } : node
      )
    }
  })),

  setSettingStartNode: (value: boolean) => set(() => ({
    settingStartNode: value,
    settingEndNode: false
  })),

  setSettingEndNode: (value: boolean) => set(() => ({
    settingEndNode: value,
    settingStartNode: false
  })),
}));