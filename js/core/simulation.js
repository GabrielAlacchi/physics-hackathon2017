

function Simulation(graph, numberOfCars, alpha, t0, lambda, capacityThreshold) {
    if (!(this instanceof Simulation)) {
        return new Simulation(graph, numberOfCars, alpha, t0);
    }

    this.numberOfCars = numberOfCars;
    this.graph = graph;
    this.t = 0;
    this.alpha = alpha;
    this.t0 = t0;
    this.lambda = lambda;
    this.capacityThreshold;

    this.cars = [];
    this.createCars();

}

Simulation.prototype.createCars() {
    // Create the cars
    for (var i = 0; i < numberOfCars; i++) {
        // Choose a random node to start at
        var random = Math.floor(Math.random() * graph.nodes.length);
        if (random == graph.nodes.length) {
            random -= 1;
        }

        var startingNode = this.graph.nodes[random];
        var car = Car(startingNode);
        this.cars.push(car);
    }
}

Simulation.prototype.tick() {

    for each (var car in this.cars) {
        if (car.getState() === "choosing") {
            if (car.locationEdge) {
                car.locationEdge.numberOfCars -= 1;
            }

            var edge = this.chooseEdge(car);
            edge.numberOfCars += 1;
            car.location = this.graph.otherNode(node, edge);
            car.locationEdge = edge;
            car.timesteps = edgeTimesteps(edge);
            car.state = "traveling";
        } else if (car.state === "traveling") {
            car.elapsed += 1;
            if (car.elapsed === car.timesteps) {
                car.state = "choosing";
            }
        }
    }

    // tick
    t += 1;
}

Simulation.prototype.edgeTimesteps = function(edge) {
    return this.t0 + Math.floor(this.alpha * edge.numberOfCars);
}

function sampleDistribution(distribution) {
    var random = Math.random();

    var cumulative = 0.0;
    for (var i = 0; i < distribution.length; i++) {
        if (random >= cumulative && random < cumulative + distribution[i]) {
            return i;
        }

        cumulative += distribution[i];
    }
}

Simulation.prototype.chooseEdge(car) {

    // Create the probability distribution over adjacent edges
    var node = car.location;
    var adjacentEdges = this.graph.adjacentEdges(node);
    var capacityThreshold = this.capacityThreshold;
    var lambda = this.lambda;

    function getBaseProbability(edge) {
        return edge.weight[edge.nodes.indexOf(node)];
    }

    var baseProbs = adjacentEdges.map(getBaseProbability);

    function getEdgeDecayFactor(edge, i) {
        var tc = capacityThreshold * baseProbs[i];

        if (edge.numberOfCars > capacityThreshold) {
            return Math.exp(-lambda * (edge.numberOfCars - tc))
        }

        return 1;
    }

    var edgeDecayFactors = adjacentEdges.map(getEdgeDecayFactor);
    var distribution = adjacentEdges.map(function(e, i) {
        return baseProbs[i] * edgeDecayFactors[i];
    })

    var norm = distribution.reduce(function(sum, e) { return sum + e; });
    distribution = distribution.map(function(e) { return e / norm; });
    var i = sampleDistribution(distribution);

    return adjacentEdges[i];
}
