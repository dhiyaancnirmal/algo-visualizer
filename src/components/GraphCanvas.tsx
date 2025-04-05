import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useGraphStore } from '../store/graphStore';
import { Node } from '../types/graph';

export const GraphCanvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const {
    graph,
    isDirected,
    isWeighted,
    addNode,
    addEdge,
    setStartNode,
    setEndNode
  } = useGraphStore();

  const [dragStart, setDragStart] = useState<Node | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Draw edges
    const edges = svg
      .selectAll('line')
      .data(graph.edges)
      .enter()
      .append('line')
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
      .attr('stroke', d => d.isPath ? '#4CAF50' : '#666')
      .attr('stroke-width', 2);

    if (isDirected) {
      svg
        .append('defs')
        .append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .append('path')
        .attr('d', 'M 0,-5 L 10,0 L 0,5')
        .attr('fill', '#666');

      edges.attr('marker-end', 'url(#arrowhead)');
    }

    if (isWeighted) {
      svg
        .selectAll('text.weight')
        .data(graph.edges)
        .enter()
        .append('text')
        .attr('class', 'weight')
        .attr('x', d => {
          const source = graph.nodes.find(n => n.id === d.source);
          const target = graph.nodes.find(n => n.id === d.target);
          return ((source?.x || 0) + (target?.x || 0)) / 2;
        })
        .attr('y', d => {
          const source = graph.nodes.find(n => n.id === d.source);
          const target = graph.nodes.find(n => n.id === d.target);
          return ((source?.y || 0) + (target?.y || 0)) / 2;
        })
        .attr('text-anchor', 'middle')
        .attr('dy', -5)
        .text(d => d.weight);
    }

    // Draw nodes
    const nodeGroups = svg
      .selectAll('g.node')
      .data(graph.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    nodeGroups
      .append('circle')
      .attr('r', 20)
      .attr('fill', d => {
        if (d.isStart) return '#4CAF50';
        if (d.isEnd) return '#f44336';
        if (d.isPath) return '#8BC34A';
        if (d.isVisited) return '#2196F3';
        if (d.isFrontier) return '#FF9800';
        return '#fff';
      })
      .attr('stroke', '#000')
      .attr('stroke-width', 2)
      .on('mousedown', (event, d) => {
        setDragStart(d);
        event.stopPropagation();
      })
      .on('contextmenu', (event, d) => {
        event.preventDefault();
        const isStart = graph.nodes.some(n => n.isStart && n.id === d.id);
        if (isStart) {
          setEndNode(d.id);
        } else {
          setStartNode(d.id);
        }
      });

    nodeGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .text(d => d.id.split('-')[1])
      .attr('fill', '#000');

    svg
      .on('mousemove', (event) => {
        if (dragStart) {
          const [x, y] = d3.pointer(event);
          const targetNode = graph.nodes.find(n => {
            const dx = n.x - x;
            const dy = n.y - y;
            return Math.sqrt(dx * dx + dy * dy) < 20;
          });

          if (targetNode && targetNode.id !== dragStart.id) {
            const weight = isWeighted ? Math.floor(Math.random() * 10) + 1 : 1;
            addEdge(dragStart.id, targetNode.id, weight);
            setDragStart(null);
          }
        }
      })
      .on('mouseup', () => {
        setDragStart(null);
      })
      .on('click', (event) => {
        if (!dragStart) {
          const [x, y] = d3.pointer(event);
          addNode(x, y);
        }
      });

  }, [graph, isDirected, isWeighted, addNode, addEdge, setStartNode, setEndNode, dragStart]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full bg-white dark:bg-gray-900"
      style={{ cursor: dragStart ? 'crosshair' : 'default' }}
    />
  );
};