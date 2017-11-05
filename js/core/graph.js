
function Edge(node1, node2, weight) {
    if (!(this instanceof Edge)) {
        return new Edge(node1, node2, weight);
    }

    this.nodes = [node1, node2];
    this.numberOfCars = 0;
    this.weight = weight;
}

function Node(id) {
    if (!(this instanceof Node)) {
        return new Node(id);
    }

    this.id = id;
}

function Graph(graphdata) {
    if (!(this instanceof Graph)) {
        return new Graph(graphdata);
    }

    this.nodes = [];
    this.edges = [];
    this.adjacencyList = {};

    for (var i = 0; i < graphdata.nodes.length; i++) {
        this.addNode(i);
    }

    for (var i = 0; i < graphdata.links.length; i++) {
        var link = graphdata.links[i];
        this.addEdge(link.source, link.target, link.weight);
    }
}

Graph.prototype.edgeWeight = function(edge, node) {
    var index = edge.nodes.indexOf(node);
    if (index !== -1) {
        return edge.weight[index];
    }
}

Graph.prototype.otherNode = function(node, edge) {
    return edge.nodes[1 - edge.nodes.indexOf(node)];
};

Graph.prototype.addNode = function(node) {
    if (!(node instanceof Node)) {
        node = Node(node);
    }
    this.nodes.push(node);
    this.adjacencyList[node.id] = [];
    return node;
};

Graph.prototype.getNode = function(id) {
    for (var key in this.nodes) {
        var node = this.nodes[key];

        if (node.id === id) {
            return node;
        }
    }

    return null;
};

Graph.prototype.findEquivalentEdge = function(node1, node2) {
    for (var key in this.edges) {
        var edge = this.edges[key];

        if (edge.nodes[0] === node1 && edge.nodes[1] === node2) {
            return edge;
        } else if (edge.nodes[1] === node1 && edge.nodes[0] === node2) {
            return edge;
        }
    }
};

Graph.prototype.adjacentEdges = function(node) {
    if (!(node instanceof Node)) {
        node = this.getNode(node);
    }

    return this.adjacencyList[node.id];
};

Graph.prototype.addEdge = function(node1, node2, weight) {
    if (!(node1 instanceof Node)) {
        node1 = this.getNode(node1);
        if (!node1) {
            node1 = this.addNode(node1);
        }
    }

    if (!(node2 instanceof Node)) {
        node2 = this.getNode(node2);
        if (!node2) {
            node2 = this.addNode(node2);
        }
    }

    var equivalentEdge = this.findEquivalentEdge(node1, node2);
    if (equivalentEdge) {
        return equivalentEdge;
    }

    var edge = Edge(node1, node2, weight);
    this.edges.push(edge);

    this.adjacencyList[node1.id].push(edge);
    this.adjacencyList[node2.id].push(edge);

    return edge;
};
