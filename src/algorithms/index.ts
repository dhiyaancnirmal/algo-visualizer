import { Graph, AlgorithmStep } from '../types/graph';

function buildPathStep(graph: Graph, parent: Map<string, string>, startId: string, endId: string): AlgorithmStep {
  const pathNodes: string[] = [];
  const pathEdges: Array<{ source: string; target: string }> = [];
  let current = endId;

  while (current !== startId && parent.has(current)) {
    pathNodes.unshift(current);
    const source = parent.get(current)!;
    pathEdges.unshift({ source, target: current });
    current = source;
  }
  pathNodes.unshift(startId);

  return {
    visitedNodes: [],
    frontierNodes: [],
    pathNodes,
    pathEdges
  };
}

export function runBFS(graph: Graph, startId: string, endId: string): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const visited = new Set<string>();
  const queue: string[] = [startId];
  const parent = new Map<string, string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (!visited.has(current)) {
      visited.add(current);

      if (current === endId) {
        steps.push(buildPathStep(graph, parent, startId, endId));
        break;
      }

      const neighbors = graph.edges
        .filter(e => (e.source === current && !visited.has(e.target)) || 
                    (!e.isDirected && e.target === current && !visited.has(e.source)))
        .map(e => e.source === current ? e.target : e.source)
        .filter(n => !queue.includes(n));

      for (const neighbor of neighbors) {
        queue.push(neighbor);
        if (!parent.has(neighbor)) {
          parent.set(neighbor, current);
        }
      }

      steps.push({
        visitedNodes: Array.from(visited),
        frontierNodes: queue,
        pathNodes: [],
        pathEdges: Array.from(parent.entries()).map(([target, source]) => ({ source, target }))
      });
    }
  }

  return steps;
}

export function runDFS(graph: Graph, startId: string, endId: string): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const visited = new Set<string>();
  const stack: string[] = [startId];
  const parent = new Map<string, string>();

  while (stack.length > 0) {
    const current = stack.pop()!;
    
    if (!visited.has(current)) {
      visited.add(current);

      if (current === endId) {
        steps.push(buildPathStep(graph, parent, startId, endId));
        break;
      }

      const neighbors = graph.edges
        .filter(e => (e.source === current && !visited.has(e.target)) || 
                    (!e.isDirected && e.target === current && !visited.has(e.source)))
        .map(e => e.source === current ? e.target : e.source)
        .reverse();

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
          if (!parent.has(neighbor)) {
            parent.set(neighbor, current);
          }
        }
      }

      steps.push({
        visitedNodes: Array.from(visited),
        frontierNodes: stack,
        pathNodes: [],
        pathEdges: Array.from(parent.entries()).map(([target, source]) => ({ source, target }))
      });
    }
  }

  return steps;
}

export function runDijkstra(graph: Graph, startId: string, endId: string): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const distances = new Map<string, number>();
  const parent = new Map<string, string>();
  const visited = new Set<string>();

  // Initialize distances
  graph.nodes.forEach(node => {
    distances.set(node.id, Infinity);
  });
  distances.set(startId, 0);

  while (true) {
    // Find node with minimum distance
    let minDistance = Infinity;
    let current: string | null = null;

    distances.forEach((dist, nodeId) => {
      if (!visited.has(nodeId) && dist < minDistance) {
        minDistance = dist;
        current = nodeId;
      }
    });

    if (current === null || current === endId) {
      if (current === endId) {
        steps.push(buildPathStep(graph, parent, startId, endId));
      }
      break;
    }

    visited.add(current);

    // Update distances to neighbors
    const edges = graph.edges.filter(e => 
      (e.source === current && !visited.has(e.target)) || 
      (!e.isDirected && e.target === current && !visited.has(e.source))
    );

    for (const edge of edges) {
      const neighbor = edge.source === current ? edge.target : edge.source;
      const newDist = distances.get(current)! + edge.weight;
      
      if (newDist < (distances.get(neighbor) || Infinity)) {
        distances.set(neighbor, newDist);
        parent.set(neighbor, current);
      }
    }

    steps.push({
      visitedNodes: Array.from(visited),
      frontierNodes: Array.from(distances.entries())
        .filter(([id, dist]) => !visited.has(id) && dist < Infinity)
        .map(([id]) => id),
      pathNodes: [],
      pathEdges: Array.from(parent.entries()).map(([target, source]) => ({ source, target }))
    });
  }

  return steps;
}

export function runAStar(graph: Graph, startId: string, endId: string): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const openSet = new Set<string>([startId]);
  const closedSet = new Set<string>();
  const parent = new Map<string, string>();
  
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  
  // Initialize scores
  graph.nodes.forEach(node => {
    gScore.set(node.id, Infinity);
    fScore.set(node.id, Infinity);
  });
  
  gScore.set(startId, 0);
  fScore.set(startId, heuristic(graph, startId, endId));

  while (openSet.size > 0) {
    let current = getCheapestNode(openSet, fScore);
    
    if (current === endId) {
      steps.push(buildPathStep(graph, parent, startId, endId));
      break;
    }

    openSet.delete(current);
    closedSet.add(current);

    const neighbors = graph.edges
      .filter(e => (e.source === current && !closedSet.has(e.target)) || 
                  (!e.isDirected && e.target === current && !closedSet.has(e.source)))
      .map(e => e.source === current ? e.target : e.source);

    for (const neighbor of neighbors) {
      const tentativeGScore = gScore.get(current)! + 1;

      if (tentativeGScore < (gScore.get(neighbor) || Infinity)) {
        parent.set(neighbor, current);
        gScore.set(neighbor, tentativeGScore);
        fScore.set(neighbor, gScore.get(neighbor)! + heuristic(graph, neighbor, endId));
        
        if (!openSet.has(neighbor)) {
          openSet.add(neighbor);
        }
      }
    }

    steps.push({
      visitedNodes: Array.from(closedSet),
      frontierNodes: Array.from(openSet),
      pathNodes: [],
      pathEdges: Array.from(parent.entries()).map(([target, source]) => ({ source, target }))
    });
  }

  return steps;
}

function heuristic(graph: Graph, nodeId: string, endId: string): number {
  const node = graph.nodes.find(n => n.id === nodeId);
  const end = graph.nodes.find(n => n.id === endId);
  
  if (!node || !end) return Infinity;
  
  return Math.sqrt(Math.pow(end.x - node.x, 2) + Math.pow(end.y - node.y, 2));
}

function getCheapestNode(nodes: Set<string>, fScore: Map<string, number>): string {
  let minScore = Infinity;
  let cheapestNode = Array.from(nodes)[0];
  
  nodes.forEach(nodeId => {
    const score = fScore.get(nodeId) || Infinity;
    if (score < minScore) {
      minScore = score;
      cheapestNode = nodeId;
    }
  });
  
  return cheapestNode;
}