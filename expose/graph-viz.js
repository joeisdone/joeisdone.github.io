class CharityGraphViz {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      width: options.width || 800,
      height: options.height || 600,
      nodeWidth: 300,
      nodeHeight: 180,
      ...options
    };

    this.svg = null;
    this.simulation = null;
    this.zoom = null;
    this.currentHighlight = null; // Track currently highlighted node
    
    this.init();
  }

  init() {
    // Create SVG
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('style', 'height: 100%; width: 100%')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('viewBox', '0 0 1000 1000');

    // Create a group for zoom/pan behavior
    const zoomGroup = this.svg.append('g')
      .attr('class', 'zoom-group');

    // Add background rect for pan/zoom
    zoomGroup.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'white');

    // Add container for graph content
    zoomGroup.append('g')
      .attr('class', 'graph-container');

    // Create zoom behavior first
    this.zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        zoomGroup
          .attr('transform', event.transform);
      });

    // Apply zoom to the SVG
    this.svg.call(this.zoom);
  }

  render(data) {
    const { nodes, links } = this._processData(data);
    
    // Clear existing content
    const container = this.svg.select('.zoom-group .graph-container');
    container.selectAll('*').remove();

    // Create separate groups for links and nodes to control layering
    const linkGroup = container.append('g').attr('class', 'links');
    const nodeGroup = container.append('g').attr('class', 'nodes');

    // Pre-compute positions using d3-force without animation
    const simulation = d3.forceSimulation(nodes)
      // Increase link distance for more spacing between connected nodes
      .force('link', d3.forceLink(links).id(d => d.id).distance(600))
      // Increase repulsion between nodes
      .force('charge', d3.forceManyBody().strength(-3000))
      .force('x', d3.forceX().x(d => {
        // Check if this is a source node (has outgoing but no incoming links)
        const isSource = links.some(l => l.source.id === d.id) && 
                        !links.some(l => l.target.id === d.id);
        // Increase horizontal spread
        return isSource ? -800 : 800;
      }).strength(0.3))
      .force('y', d3.forceY(0).strength(0.1))
      // Increase collision radius to prevent node overlap
      .force('collision', d3.forceCollide().radius(300).strength(1))
      .stop(); // Stop the simulation immediately

    // Run the simulation manually without animation
    for (let i = 0; i < 1000; ++i) simulation.tick();
    
    // Fix all node positions
    nodes.forEach(node => {
      node.fx = node.x;
      node.fy = node.y;
    });
    
    // Store the simulation for later use (e.g., dragging)
    this.simulation = simulation;

    // Create links
    const link = linkGroup
      .selectAll('g')
      .data(links)
      .join('g');

    // Add invisible wider path for easier hovering
    link.append('path')
      .attr('class', 'link-hover-area')
      .attr('stroke', 'transparent')
      .attr('stroke-width', 15)  // Much wider than visible path
      .attr('fill', 'none')
      .style('cursor', 'pointer')
      .attr('d', d => this._getLinkPath(d));

    link.append('path')
      .attr('class', 'link')
      .attr('stroke', '#94A3B8')
      .attr('stroke-width', 1.5)
      .attr('fill', 'none')
      .attr('stroke-linecap', 'round')
      .attr('marker-end', 'url(#arrowhead)')
      .style('pointer-events', 'none')  // Visible path doesn't handle events
      .attr('d', d => this._getLinkPath(d));

    // Move hover handlers to the hover area
    link.select('.link-hover-area')
      .on('mouseenter', (event, d) => {
        // Highlight the visible path
        d3.select(event.target.parentNode)
          .select('.link')
          .attr('stroke', '#2563EB')
          .attr('stroke-width', 2.5)
          .attr('marker-end', 'url(#arrowhead-highlighted)');
        
        // Highlight connected nodes
        nodeGroup.selectAll('.node')
          .filter(node => node.id === d.source.id || node.id === d.target.id)
          .select('rect')
          .style('filter', 'drop-shadow(0 0 6px rgba(37, 99, 235, 0.5))');
      })
      .on('mouseleave', (event, d) => {
        // Reset visible path
        d3.select(event.target.parentNode)
          .select('.link')
          .attr('stroke', '#94A3B8')
          .attr('stroke-width', 1.5)
          .attr('marker-end', 'url(#arrowhead)');
        
        // Reset nodes
        nodeGroup.selectAll('.node rect')
          .style('filter', null);
      });

    link.append('text')
      .attr('class', 'link-label')
      .attr('dy', -5)
      .append('textPath')
      .attr('href', (d, i) => `#link-path-${i}`)
      .attr('startOffset', '50%')
      .style('text-anchor', 'middle')
      .text(d => `$${d.amount.toLocaleString()}`);

    // Create nodes
    const node = nodeGroup
      .selectAll('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x - this.options.nodeWidth/2},${d.y - this.options.nodeHeight/2})`) // Set initial position
      .on('mouseenter', (event, d) => {
        // Highlight all connected links
        linkGroup.selectAll('.link')
          .filter(link => link.source.id === d.id || link.target.id === d.id)
          .attr('stroke', '#2563EB')
          .attr('stroke-width', 2.5)
          .attr('marker-end', 'url(#arrowhead-highlighted)');
        
        // Highlight the node itself
        d3.select(event.currentTarget)
          .select('rect')
          .style('filter', 'drop-shadow(0 0 6px rgba(37, 99, 235, 0.5))');
        
        // Highlight connected nodes
        nodeGroup.selectAll('.node')
          .filter(node => {
            return links.some(link => 
              (link.source.id === d.id && link.target.id === node.id) ||
              (link.target.id === d.id && link.source.id === node.id)
            );
          })
          .select('rect')
          .style('filter', 'drop-shadow(0 0 6px rgba(37, 99, 235, 0.5))');
      })
      .on('mouseleave', (event, d) => {
        // Reset all links
        linkGroup.selectAll('.link')
          .attr('stroke', '#94A3B8')
          .attr('stroke-width', 1.5)
          .attr('marker-end', 'url(#arrowhead)');
        
        // Reset all node highlights
        nodeGroup.selectAll('.node rect')
          .style('filter', null);
      })
      .call(this._setupDrag(this.simulation));

    // Node background
    node.append('rect')
      .attr('width', this.options.nodeWidth)
      .attr('height', this.options.nodeHeight)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', d => this._getNodeColor(d))
      .attr('stroke', d => this._getNodeBorderColor(d))
      .attr('stroke-width', d => d.isUserEin ? 3 : 1);

    // Node content
    this._renderNodeContent(node);

    // Only update positions on drag
    this.simulation.on('tick', () => {
      link.select('path')
        .attr('d', d => this._getLinkPath(d));
      node.attr('transform', d => `translate(${d.x - this.options.nodeWidth/2},${d.y - this.options.nodeHeight/2})`);
    });

    // Center the graph
    this._centerGraph();

    // Add arrow marker definition
    const defs = this.svg.append('defs');
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#94A3B8');

    // Add highlighted arrow marker definition
    defs.append('marker')
      .attr('id', 'arrowhead-highlighted')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#2563EB');
  }

  _processData({ nodeSet, edgeList, filteredCharities, activeEINs, customGraphEdges }) {
    const nodes = Array.from(nodeSet).map(ein => ({
      id: ein,
      ...filteredCharities[ein],
      isUserEin: !customGraphEdges && activeEINs.includes(ein)
    }));

    const links = edgeList.map(e => ({
      source: e.filer,
      target: e.grantee,
      amount: e.amt
    }));

    return { nodes, links };
  }

  _setupDrag(simulation) {
    return d3.drag()
      .subject(event => {
        // This ensures drag works on the node itself
        return event.subject;
      })
      .filter(event => {
        // Prevent zoom from interfering with drag
        event.stopPropagation();
        return !event.button;
      })
      .on('start', (event, d) => {
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
        simulation.alpha(1);
        simulation.tick();
      })
      .on('end', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      });
  }

  _getNodeColor(d) {
    if (d.govt_amt > 10000000) {
      return '#FEE2E2'; // Light red
    } else if (d.govt_amt > 1000000) {
      return '#FEF3C7'; // Light yellow
    }
    return '#F3F4F6'; // Default gray
  }

  _getNodeBorderColor(d) {
    if (d.govt_amt > 10000000) {
      return '#DC2626'; // Red
    } else if (d.govt_amt > 1000000) {
      return '#D97706'; // Yellow
    } else if (d.isUserEin) {
      return '#2563EB'; // Blue for user-specified
    }
    return '#94A3B8'; // Default gray
  }

  _getLinkPath(d) {
    // Calculate box dimensions
    const boxWidth = this.options.nodeWidth;
    const boxHeight = this.options.nodeHeight;
    
    // Determine exit and entry points based on relative positions
    const dx = d.target.x - d.source.x;
    const dy = d.target.y - d.source.y;
    
    // Calculate source exit point
    let sourcePoint;
    if (Math.abs(dy) > Math.abs(dx)) {
      // If more vertical distance, exit from top or bottom
      const yOffset = dy > 0 ? boxHeight/2 : -boxHeight/2;
      sourcePoint = {
        x: d.source.x,
        y: d.source.y + yOffset
      };
    } else {
      // If more horizontal distance, exit from right
      sourcePoint = {
        x: d.source.x + boxWidth/2,
        y: d.source.y
      };
    }
    
    // Calculate target entry point
    let targetPoint;
    if (Math.abs(dy) > Math.abs(dx)) {
      // If more vertical distance, enter from top or bottom
      const yOffset = dy > 0 ? -boxHeight/2 : boxHeight/2;
      targetPoint = {
        x: d.target.x,
        y: d.target.y + yOffset
      };
    } else {
      // If more horizontal distance, enter from left
      targetPoint = {
        x: d.target.x - boxWidth/2,
        y: d.target.y
      };
    }
    
    // Create path points
    const points = [];
    points.push([sourcePoint.x, sourcePoint.y]);
    
    // Add intermediate points for routing
    if (Math.abs(dy) > Math.abs(dx)) {
      // Vertical dominant path
      const midY = (sourcePoint.y + targetPoint.y) / 2;
      points.push([sourcePoint.x, midY]);
      points.push([targetPoint.x, midY]);
    } else {
      // Horizontal dominant path
      const midX = (sourcePoint.x + targetPoint.x) / 2;
      points.push([midX, sourcePoint.y]);
      points.push([midX, targetPoint.y]);
    }
    
    points.push([targetPoint.x, targetPoint.y]);
    
    // Create a line generator with curved corners
    const lineGenerator = d3.line()
      .x(d => d[0])
      .y(d => d[1])
      .curve(d3.curveBundle.beta(0.85));
    
    return lineGenerator(points);
  }

  _renderNodeContent(node) {
    // Add text content to nodes
    const textGroup = node.append('g')
      .attr('class', 'node-text')
      .attr('transform', 'translate(10,20)');

    // Constants for layout
    const leftPadding = 10;  // Already set by transform above
    const rightPadding = 20; // Increased from 10
    const rightEdge = this.options.nodeWidth - rightPadding;
    const labelX = 0;

    // Spacing after alert banner if present
    const alertBottomMargin = 10;

    // Add "High Taxpayer Funds Alert!" banner if applicable
    const hasHighTaxpayerFunds = d => d.govt_amt > 10000000;
    const alertGroup = textGroup.filter(hasHighTaxpayerFunds)
      .append('g')
      .attr('class', 'alert-group');
    
    // Add red background rectangle
    alertGroup.append('rect')
      .attr('x', -5)
      .attr('y', -12)
      .attr('width', this.options.nodeWidth - 10)
      .attr('height', 24)
      .attr('rx', 4)
      .attr('fill', '#FEE2E2')
      .attr('stroke', '#DC2626')
      .attr('stroke-width', 1);
    
    // Add alert text
    alertGroup
      .append('text')
      .attr('class', 'alert')
      .attr('dy', '0.35em')  // Vertically center text
      .attr('x', (this.options.nodeWidth - 10) / 2)  // Center text horizontally
      .style('text-anchor', 'middle')  // Center text
      .attr('fill', '#DC2626')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .text('🚨🚨🚨 High Taxpayer Funds Alert! 🚨🚨🚨');

    // Function to calculate total height of wrapped text
    const getTextHeight = (element) => {
      const tspans = element.selectAll('tspan');
      return tspans.size(); // Return number of lines
    };

    // Organization name
    const nameText = textGroup.append('text')
      .attr('class', 'name')
      .attr('dy', d => hasHighTaxpayerFunds(d) ? `${2 + (alertBottomMargin/16)}em` : '0.35em')
      .text(d => d.name)
      .style('font-weight', 'bold')
      .style('font-size', '14px')
      .call(this._wrapText, this.options.nodeWidth - 20);

    // Store number of wrapped lines for each node
    nameText.each(function(d) {
      d.nameLines = getTextHeight(d3.select(this));
      if (hasHighTaxpayerFunds(d)) {
        d.nameLines += 1;
      }
    });

    // EIN (without label, positioned on left)
    textGroup.append('text')
      .attr('dy', d => `${2.5 + (d.nameLines * 1.1)}em`)  // Increased spacing after title
      .attr('x', labelX)
      .style('fill', '#6B7280')  // Gray color for EIN
      .text(d => `${d.id.slice(0,2)}-${d.id.slice(2)}`);

    // Add separator line
    textGroup.append('line')
      .attr('x1', 0)
      .attr('x2', this.options.nodeWidth - 20)
      .attr('y1', d => (3 + (d.nameLines * 1.1)) + 'em')  // Position closer to EIN
      .attr('y2', d => (3 + (d.nameLines * 1.1)) + 'em')
      .attr('stroke', 'rgba(0, 0, 0, 0.1)')
      .attr('stroke-width', 1);

    // Financial info
    const formatMoney = num => `$${num.toLocaleString()}`;
    
    textGroup.append('text')
      .attr('dy', d => `${4 + (d.nameLines * 1.1)}em`)  // Reduced spacing after EIN
      .attr('x', labelX)
      .text('Gross receipts')
      .append('tspan')
      .attr('x', rightEdge)
      .attr('text-anchor', 'end')
      .text(d => formatMoney(d.receipt_amt));

    textGroup.append('text')
      .attr('dy', d => `${5.5 + (d.nameLines * 1.1)}em`)
      .attr('x', labelX)
      .text('Contributions')
      .append('tspan')
      .attr('x', rightEdge)
      .attr('text-anchor', 'end')
      .text(d => formatMoney(d.contrib_amt));

    textGroup.append('text')
      .attr('dy', d => `${7 + (d.nameLines * 1.1)}em`)
      .attr('x', labelX)
      .text('Grants given')
      .append('tspan')
      .attr('x', rightEdge)
      .attr('text-anchor', 'end')
      .text(d => formatMoney(d.grant_amt));

    // Taxpayer funds (highlighted if > 0)
    const taxpayerText = textGroup.append('text')
      .attr('dy', d => `${8.5 + (d.nameLines * 1.1)}em`)
      .style('font-weight', 'bold')
      .style('fill', d => d.govt_amt > 0 ? '#DC2626' : '#000')
      .attr('x', labelX)
      .text('Taxpayer funds')
      .append('tspan')
      .attr('x', rightEdge)
      .attr('text-anchor', 'end')
      .style('fill', d => d.govt_amt > 0 ? '#DC2626' : '#000')
      .text(d => formatMoney(d.govt_amt));

    // Adjust node height if needed
    node.select('rect')
      .attr('height', d => Math.max(
        this.options.nodeHeight,
        (8.5 + (d.nameLines * 1.1)) * 16 + 40 // Convert ems to pixels + padding
      ));
  }

  _wrapText(text, width) {
    text.each(function() {
      const text = d3.select(this);
      const words = text.text().split(/\s+/).reverse();
      // Use tighter line height for title text
      const lineHeight = text.classed('name') ? 1 : 1.1;
      const y = text.attr('y');
      const dy = parseFloat(text.attr('dy'));
      let word;
      let line = [];
      let lineNumber = 0;
      let tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
      
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text.append('tspan')
            .attr('x', 0)
            .attr('y', y)
            .attr('dy', ++lineNumber * lineHeight + dy + 'em')
            .text(word);
        }
      }
    });
  }

  _centerGraph() {
    const bounds = this.svg.select('.zoom-group .graph-container').node().getBBox();
    const parent = this.svg.node().parentElement;
    const fullWidth = parent.clientWidth;
    const fullHeight = parent.clientHeight;
    
    // More aggressive initial zoom on mobile
    const zoomFactor = window.innerWidth <= 767 ? 2 : 1.2;
    const scale = zoomFactor * Math.min(fullWidth / bounds.width, fullHeight / bounds.height);
    
    const translate = [
      fullWidth / 2 - (bounds.x + bounds.width / 2) * scale,
      fullHeight / 2 - (bounds.y + bounds.height / 2) * scale
    ];

    this.svg.call(this.zoom.transform, d3.zoomIdentity
      .translate(translate[0], translate[1])
      .scale(scale));
  }

  searchAndHighlight(searchTerm) {
    if (!searchTerm) {
      // Clear highlight if search is empty
      this._clearHighlight();
      return null;
    }
    
    // Convert to lowercase for case-insensitive search
    searchTerm = searchTerm.toLowerCase();
    
    // Find nodes that match the search term
    const matches = this.svg.selectAll('.node').filter(d => {
      return d.name.toLowerCase().includes(searchTerm) ||
             d.id.includes(searchTerm);
    });
    
    if (!matches.empty()) {
      // Clear previous highlight
      this._clearHighlight();
      
      // Highlight matching nodes
      matches
        .select('rect')
        .style('stroke', '#2563EB')
        .style('stroke-width', '3px')
        .style('filter', 'drop-shadow(0 0 6px rgba(37, 99, 235, 0.5))');
      
      // Store current highlight
      this.currentHighlight = matches;
      
      // Get the first match's position
      const match = matches.data()[0];
      
      // Zoom to the matching node
      this._zoomToNode(match);
      
      return matches.data();
    }
    
    return null;
  }

  _clearHighlight() {
    if (this.currentHighlight) {
      this.currentHighlight
        .select('rect')
        .style('stroke', d => this._getNodeBorderColor(d))
        .style('stroke-width', d => d.isUserEin ? 3 : 1)
        .style('filter', null);
      
      this.currentHighlight = null;
    }
  }

  _zoomToNode(node) {
    const scale = 1.5;
    const transform = d3.zoomIdentity
      .translate(
        this.options.width / 2 - node.x * scale,
        this.options.height / 2 - node.y * scale
      )
      .scale(scale);
    
    this.svg
      .transition()
      .duration(750)
      .call(this.zoom.transform, transform);
  }

  _zoom(factor) {
    const transform = d3.zoomTransform(this.svg.node());
    this.svg
      .transition()
      .duration(300)
      .call(
        this.zoom.transform,
        transform.scale(factor)
      );
  }

  // Add destroy method for cleanup
  destroy() {
    // Stop simulation if running
    if (this.simulation) {
      this.simulation.stop();
    }
    
    // Remove event listeners
    if (this.zoom) {
      this.svg.on('.zoom', null);
    }
    
    // Remove the SVG element
    if (this.svg) {
      this.svg.remove();
    }
    
    // Clear references
    this.svg = null;
    this.simulation = null;
    this.zoom = null;
    this.currentHighlight = null;
  }
} 