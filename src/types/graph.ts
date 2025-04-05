export interface Node {
  id: string;
  x: number;
  y: number;
  isStart?: boolean;
  isEnd?: boolean;
  isVisited?: boolean;
  isPath?: boolean;
  isFrontier?: boolean;
}

export interface Edge {
  source: string;
  target: string;
  weight: number;
  isDirected: boolean;
  isPath?: boolean;
  isVisited?: boolean;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}

export type AlgorithmType = 'BFS' | 'DFS' | 'DIJKSTRA' | 'ASTAR' | '';

export interface AlgorithmStep {
  visitedNodes: string[];
  frontierNodes: string[];
  pathNodes: string[];
  pathEdges: { source: string; target: string }[];
  distances?: { [nodeId: string]: number };
}

export interface GraphState {
  graph: Graph;
  selectedAlgorithm: AlgorithmType;
  isDirected: boolean;
  isWeighted: boolean;
  isDarkMode: boolean;
  isRunning: boolean;
  settingStartNode: boolean;
  settingEndNode: boolean;
  algorithmSteps: AlgorithmStep[];
  currentStepIndex: number;
  algorithmHistory: AlgorithmStep[];
  addNode: (x: number, y: number) => void;
  setStartNode: (id: string) => void;
  setEndNode: (id: string) => void;
  addEdge: (source: string, target: string, weight?: number) => void;
  clearGraph: () => void;
  setAlgorithm: (algorithm: AlgorithmType) => void;
  toggleDirected: () => void;
  toggleWeighted: () => void;
  toggleDarkMode: () => void;
  startAlgorithm: () => Promise<void>;
  resetAlgorithm: () => void;
  updateNodeState: (id: string, updates: Partial<Node>) => void;
  updateEdgeState: (source: string, target: string, updates: Partial<Edge>) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  setSettingStartNode: (value: boolean) => void;
  setSettingEndNode: (value: boolean) => void;
  generateRandomNodes: (count: number) => void;
  generateRandomEdges: (count: number) => void;
}