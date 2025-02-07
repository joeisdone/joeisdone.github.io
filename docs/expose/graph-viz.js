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

    // Pre-compute positions using d3-force without animation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(400))
      .force('charge', d3.forceManyBody().strength(-2000))
      .force('x', d3.forceX().strength(0.1))
      .force('y', d3.forceY().strength(0.1))
      .force('collision', d3.forceCollide().radius(200).strength(1))
      .stop(); // Stop the simulation immediately

    // Run the simulation manually without animation
    for (let i = 0; i < 500; ++i) simulation.tick();
    
    // Fix all node positions
    nodes.forEach(node => {
      node.fx = node.x;
      node.fy = node.y;
    });
    
    // Store the simulation for later use (e.g., dragging)
    this.simulation = simulation;

    // Create links
    const link = container.append('g')
      .selectAll('g')
      .data(links)
      .join('g');

    link.append('path')
      .attr('class', 'link')
      .attr('stroke', '#94A3B8')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('d', d => this._getLinkPath(d)); // Set initial position

    link.append('text')
      .attr('class', 'link-label')
      .attr('dy', -5)
      .append('textPath')
      .attr('href', (d, i) => `#link-path-${i}`)
      .attr('startOffset', '50%')
      .style('text-anchor', 'middle')
      .text(d => `$${d.amount.toLocaleString()}`);

    // Create nodes
    const node = container.append('g')
      .selectAll('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x - this.options.nodeWidth/2},${d.y - this.options.nodeHeight/2})`) // Set initial position
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
    const dx = d.target.x - d.source.x;
    const dy = d.target.y - d.source.y;
    const dr = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate points for the path to avoid overlapping with nodes
    const sourceX = d.source.x + (dx * this.options.nodeWidth/2) / dr;
    const sourceY = d.source.y + (dy * this.options.nodeHeight/2) / dr;
    const targetX = d.target.x - (dx * this.options.nodeWidth/2) / dr;
    const targetY = d.target.y - (dy * this.options.nodeHeight/2) / dr;
    
    return `M${sourceX},${sourceY}L${targetX},${targetY}`;
  }

  _renderNodeContent(node) {
    // Add text content to nodes
    const textGroup = node.append('g')
      .attr('class', 'node-text')
      .attr('transform', 'translate(10,20)');

    // Organization name
    textGroup.append('text')
      .attr('class', 'name')
      .attr('dy', '0.35em')
      .text(d => d.name)
      .style('font-weight', 'bold')
      .call(this._wrapText, this.options.nodeWidth - 20);

    // EIN
    textGroup.append('text')
      .attr('dy', '2.5em')
      .text(d => `EIN: ${d.id.slice(0,2)}-${d.id.slice(2)}`);

    // Financial info
    const formatMoney = num => `$${num.toLocaleString()}`;
    
    textGroup.append('text')
      .attr('dy', '4em')
      .text(d => `Gross receipts: ${formatMoney(d.receipt_amt)}`);

    textGroup.append('text')
      .attr('dy', '5.5em')
      .text(d => `Contributions: ${formatMoney(d.contrib_amt)}`);

    textGroup.append('text')
      .attr('dy', '7em')
      .text(d => `Grants given: ${formatMoney(d.grant_amt)}`);

    // Taxpayer funds (highlighted if > 0)
    const taxpayerText = textGroup.append('text')
      .attr('dy', '8.5em')
      .style('font-weight', 'bold')
      .style('fill', d => d.govt_amt > 0 ? '#DC2626' : '#000');

    taxpayerText.text(d => `Taxpayer funds: ${formatMoney(d.govt_amt)}`);
  }

  _wrapText(text, width) {
    text.each(function() {
      const text = d3.select(this);
      const words = text.text().split(/\s+/).reverse();
      const lineHeight = 1.1;
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
          tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
        }
      }
    });
  }

  _centerGraph() {
    const bounds = this.svg.select('.zoom-group .graph-container').node().getBBox();
    const parent = this.svg.node().parentElement;
    const fullWidth = parent.clientWidth;
    const fullHeight = parent.clientHeight;
    
    // Calculate scale to fit all content with padding
    const scale = 1.2 * Math.min(fullWidth / bounds.width, fullHeight / bounds.height);
    
    const translate = [
      fullWidth / 2 - (bounds.x + bounds.width / 2) * scale,
      fullHeight / 2 - (bounds.y + bounds.height / 2) * scale
    ];

    this.svg.call(this.zoom.transform, d3.zoomIdentity
      .translate(translate[0], translate[1])
      .scale(scale));
  }
} 