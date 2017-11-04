
function Edge(node1, node2, weight) {
    if (!(this instanceof Edge)) {
        return new Edge(node1, node2);
    }

    this.nodes = [node1, node2];
    this.numberOfCars = 0;
    this.weight = weight;
}

function Node(id) {
    this.id = id;
}

function Graph() {
    if (!(this instanceof Graph)) {
        return new Graph();
    }

    this.nodes = [];
    this.edges = [];
    this.adjacencyList = {};
}

Graph.prototype.otherNode = function(node, edge) {
    if (edge.nodes[0] === node) {
        return edge.nodes[1];
    } else {
        return edge.nodes[0];
    }
};

Graph.prototype.addNode = function(node) {
    if (!(node instanceof Node)) {
        node = Node(node);
    }
    this.nodes.push(node);
    this.adjacencyList[node] = [];
    return node;
};

Graph.prototype.getNode = function(id) {
    for each (var node in this.nodes) {
        if (node.id === id) {
            return node;
        }
    }

    return null;
};

Graph.prototype.findEquivalentEdge = function(node1, node2) {
    for each (var edge in this.edges) {
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

    return this.adjacencyList[node];
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

    this.adjacencyList[node1].push(edge);
    this.adjacencyList[node2].push(edge);

    return edge;
};
