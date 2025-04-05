import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useGraphStore } from '../store/graphStore';
import { Node, Edge } from '../types/graph';

type NodeSelection = d3.Selection<SVGGElement, Node, SVGElement, unknown>;
type EdgeSelection = d3.Selection<SVGLineElement, Edge, SVGElement, unknown>;
type SvgSelection = d3.Selection<SVGSVGElement, unknown, null, undefined>;

const NODE_RADIUS = 20;

export const GraphCanvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragStartNode, setDragStartNode] = useState<Node | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCreatingEdge, setIsCreatingEdge] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const {
    graph,
    isDirected,
    isWeighted,
    addNode,
    addEdge,
    setStartNode,
    setEndNode,
    updateNodePosition,
    settingStartNode,
    settingEndNode,
    setSettingStartNode,
    setSettingEndNode,
    isRunning,
    isDarkMode
  } = useGraphStore();

  const handleNodeClick = useCallback((event: MouseEvent, node: Node) => {
    event.stopPropagation();
    if (settingStartNode) {
      setStartNode(node.id);
      setSettingStartNode(false);
    } else if (settingEndNode) {
      setEndNode(node.id);
      setSettingEndNode(false);
    }
  }, [settingStartNode, settingEndNode, setStartNode, setEndNode, setSettingStartNode, setSettingEndNode]);

  const getNodeColor = (node: Node) => {
    if (node.isStart) return '#22c55e';  // Bright green for start
    if (node.isEnd) return '#ef4444';    // Red for end
    if (node.isPath) return '#f59e0b';   // Orange for path
    if (node.isFrontier) return '#60a5fa'; // Blue for frontier
    if (node.isVisited) return '#8b5cf6'; // Purple for visited
    return isDarkMode ? '#e5e7eb' : '#1e293b';  // Light in dark mode, dark in light mode
  };

  const getEdgeColor = (edge: Edge) => {
    if (edge.isPath) return '#f97316'; // Orange for path
    if (edge.isVisited) return '#8b5cf6'; // Purple for visited
    return isDarkMode ? '#4b5563' : '#9ca3af'; // Default gray
  };

  const getEdgeTextColor = (edge: Edge) => {
    if (edge.isPath) return '#f97316'; // Orange for path
    if (edge.isVisited) return '#8b5cf6'; // Purple for visited
    return isDarkMode ? '#9ca3af' : '#4b5563'; // Default gray
  };

  const getNodeSize = (node: Node) => {
    return NODE_RADIUS;
  };

  const drawNode = (node: Node) => {
    const ctx = svgRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = getNodeColor(node);
    ctx.fill();
    ctx.strokeStyle = isDarkMode ? '#1f2937' : '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw node label
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = isDarkMode ? '#1f2937' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.id.toString(), node.x, node.y);
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Add arrow marker for directed edges
    if (isDirected) {
      svg.append('defs')
        .append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 28)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .append('path')
        .attr('d', 'M 0,-5 L 10,0 L 0,5')
        .attr('fill', '#666');
    }

    // Create edge line for dragging
    const dragLine = svg
      .append('line')
      .attr('class', 'drag-line')
      .style('stroke', getEdgeColor({ source: '', target: '', weight: 1, isDirected: false }))
      .style('stroke-width', 2)
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // Draw edges
    const edges = svg
      .selectAll<SVGLineElement, Edge>('line.edge')
      .data(graph.edges)
      .enter()
      .append('line')
      .attr('class', 'edge')
      .attr('x1', d => {
        const source = graph.nodes.find(n => n.id === d.source);
        return source?.x || 0;
      })
      .attr('y1', d => {
        const source = graph.nodes.find(n => n.id === d.source);
        return source?.y || 0;
      })
      .attr('x2', d => {
        const target = graph.nodes.find(n => n.id === d.target);
        return target?.x || 0;
      })
      .attr('y2', d => {
        const target = graph.nodes.find(n => n.id === d.target);
        return target?.y || 0;
      })
      .attr('stroke', d => getEdgeColor(d))
      .attr('stroke-width', d => d.isPath ? 3 : 2)
      .style('transition', 'all 0.3s ease-in-out');

    if (isDirected) {
      edges.attr('marker-end', 'url(#arrowhead)');
    }

    if (isWeighted) {
      // Create a group for each edge weight to handle background and text
      const weightGroups = svg
        .selectAll('g.weight-group')
        .data(graph.edges)
        .enter()
        .append('g')
        .attr('class', 'weight-group')
        .attr('transform', d => {
          const source = graph.nodes.find(n => n.id === d.source);
          const target = graph.nodes.find(n => n.id === d.target);
          const x = ((source?.x || 0) + (target?.x || 0)) / 2;
          const y = ((source?.y || 0) + (target?.y || 0)) / 2;
          return `translate(${x},${y})`;
        });

      // Add white background for better readability
      weightGroups
        .append('circle')
        .attr('r', 10)
        .attr('fill', 'white')
        .attr('stroke', d => d.isVisited ? '#8b5cf6' : '#4b5563')
        .attr('stroke-width', 1);

      // Add the weight text
      weightGroups
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '.3em')
        .attr('fill', d => d.isVisited ? '#8b5cf6' : '#4b5563')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .text(d => d.weight);
    }

    // Draw nodes
    const nodeGroups = svg
      .selectAll<SVGGElement, Node>('g.node')
      .data(graph.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    // Node dragging behavior
    const drag = d3.drag<SVGGElement, Node>()
      .on('start', (event: d3.D3DragEvent<SVGGElement, Node, unknown>, d: Node) => {
        if (!isRunning && event.sourceEvent.button === 0) { // Left click and not running
          setIsDragging(true);
          setDragStartNode(d);
        }
      })
      .on('drag', (event: d3.D3DragEvent<SVGGElement, Node, unknown>, d: Node) => {
        if (isDragging && !isRunning) {
          const newX = event.x;
          const newY = event.y;

          // Check for overlap with other nodes
          const overlap = graph.nodes.some(node => {
            if (node.id === d.id) return false;
            const dx = node.x - newX;
            const dy = node.y - newY;
            return Math.sqrt(dx * dx + dy * dy) < getNodeSize(d) * 3;
          });

          if (!overlap) {
            updateNodePosition(d.id, newX, newY);
            d3.select(event.sourceEvent.target.parentNode)
              .attr('transform', `translate(${newX},${newY})`);
          }
        } else if (isCreatingEdge && !isRunning) {
          setMousePosition({ x: event.x, y: event.y });
          dragLine
            .attr('x2', event.x)
            .attr('y2', event.y);
        }
      })
      .on('end', (event: d3.D3DragEvent<SVGGElement, Node, unknown>, d: Node) => {
        if (isDragging) {
          setIsDragging(false);
        } else if (isCreatingEdge) {
          const targetNode = graph.nodes.find(n => {
            const dx = n.x - event.x;
            const dy = n.y - event.y;
            return Math.sqrt(dx * dx + dy * dy) < getNodeSize(d) && n.id !== dragStartNode?.id;
          });

          if (targetNode && dragStartNode && !isRunning) {
            addEdge(dragStartNode.id, targetNode.id, isWeighted ? Math.floor(Math.random() * 9) + 1 : 1);
          }

          setIsCreatingEdge(false);
          dragLine.style('opacity', 0);
        }
        setDragStartNode(null);
      });

    // Add circles for nodes
    const circles = nodeGroups
      .append('circle')
      .attr('r', d => getNodeSize(d))
      .attr('class', 'node-circle')
      .style('cursor', isRunning ? 'default' : 'pointer')
      .attr('fill', d => getNodeColor(d))
      .style('transition', 'all 0.3s ease-in-out')
      .on('mouseover', function(this: SVGCircleElement, event: MouseEvent, d: Node) {
        if (!isRunning) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', getNodeSize(d) * 1.2)
            .style('filter', 'drop-shadow(0 0 3px rgba(0,0,0,0.3))');
        }
      })
      .on('mouseout', function(this: SVGCircleElement, event: MouseEvent, d: Node) {
        if (!isRunning) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', getNodeSize(d))
            .style('filter', 'none');
        }
      })
      .on('mousedown', (event: MouseEvent, d: Node) => {
        if (isRunning) return;
        
        if (event.button === 2) { // Right click
          event.preventDefault();
          handleNodeClick(event, d);
        } else if (event.button === 0) { // Left click
          setIsCreatingEdge(true);
          dragLine
            .style('opacity', 1)
            .attr('x1', d.x)
            .attr('y1', d.y)
            .attr('x2', d.x)
            .attr('y2', d.y);
        }
      });

    // Apply drag behavior to node groups
    nodeGroups.call(drag);

    // Add node labels
    nodeGroups
      .append('text')
      .attr('dy', '.3em')
      .attr('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .style('fill', '#fff')
      .text(d => d.id.replace('node-', ''));

    // Double click handler for creating new nodes
    svg.on('dblclick', (event: MouseEvent) => {
      if (isRunning) return;
      
      const [x, y] = d3.pointer(event);
      const overlap = graph.nodes.some(node => {
        const dx = node.x - x;
        const dy = node.y - y;
        return Math.sqrt(dx * dx + dy * dy) < getNodeSize(node) * 3;
      });
      
      if (!overlap) {
        addNode(x, y);
      }
    });

    // Prevent context menu on right click
    svg.on('contextmenu', (event: MouseEvent) => {
      event.preventDefault();
    });

    return () => {
      svg.on('dblclick', null);
      svg.on('contextmenu', null);
    };
  }, [graph, isDirected, isWeighted, addNode, addEdge, handleNodeClick, isDragging, isCreatingEdge, dragStartNode, updateNodePosition, isRunning]);

  return (
    <div className="relative w-full h-full bg-white dark:bg-gray-900 overflow-hidden">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ cursor: isRunning ? 'default' : 'crosshair' }}
      />
    </div>
  );
};