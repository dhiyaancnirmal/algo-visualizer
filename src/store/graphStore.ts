import { create } from 'zustand';
import { GraphState, AlgorithmType, Node, Edge, AlgorithmStep } from '../types/graph';
import { runBFS, runDFS, runDijkstra, runAStar } from '../algorithms';

export const useGraphStore = create<GraphState>((set, get) => ({
  graph: {
    nodes: [],
    edges: []
  },
  selectedAlgorithm: 'BFS',
  isDirected: false,
  isWeighted: false,
  isDarkMode: false,
  isRunning: false,

  addNode: (x: number, y: number) => set((state) => {
    const newNode: Node = {
      id: `node-${state.graph.nodes.length}`,
      x,
      y
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

    set({ isRunning: true });

    // Reset previous visualization states
    state.graph.nodes.forEach(node => {
      if (!node.isStart && !node.isEnd) {
        state.updateNodeState(node.id, {
          isVisited: false,
          isPath: false,
          isFrontier: false
        });
      }
    });

    state.graph.edges.forEach(edge => {
      state.updateEdgeState(edge.source, edge.target, { isPath: false });
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

    // Animate algorithm steps
    for (const step of algorithmSteps) {
      await new Promise(resolve => setTimeout(resolve, 500));

      step.visitedNodes.forEach(id => {
        state.updateNodeState(id, { isVisited: true, isFrontier: false });
      });

      step.frontierNodes.forEach(id => {
        state.updateNodeState(id, { isFrontier: true });
      });

      step.pathNodes.forEach(id => {
        state.updateNodeState(id, { isPath: true });
      });

      step.pathEdges.forEach(({ source, target }) => {
        state.updateEdgeState(source, target, { isPath: true });
      });
    }

    set({ isRunning: false });
  },

  resetAlgorithm: () => set((state) => {
    const updatedNodes = state.graph.nodes.map(node => ({
      ...node,
      isVisited: false,
      isPath: false,
      isFrontier: false
    }));

    const updatedEdges = state.graph.edges.map(edge => ({
      ...edge,
      isPath: false
    }));

    return {
      graph: {
        nodes: updatedNodes,
        edges: updatedEdges
      }
    };
  })
}));