

function Simulation(graph, numberOfCars, alpha, t0, lambda, capacityThreshold, beta) {
    if (!(this instanceof Simulation)) {
        return new Simulation(graph, numberOfCars, alpha, t0, lambda, capacityThreshold, beta);
    }

    this.numberOfCars = numberOfCars;
    this.graph = graph;
    this.t = 0;
    this.alpha = alpha;
    this.t0 = t0;
    this.lambda = lambda;
    this.beta = beta;
    this.capacityThreshold = capacityThreshold;

    this.spawnDistribution = [];
    this.createSpawnDistribution();

    this.cars = [];
    this.createCars();

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

Simulation.prototype.createSpawnDistribution = function() {
    var graph = this.graph;

    function spawnWeight(vertex) {
        var edges = graph.adjacentEdges(vertex);
        var degree = edges.length;
        var maxProb = edges.reduce(function(max, edge) { 
            return Math.max(max, graph.edgeWeight(edge, vertex)); 
        }, 0);

        if (degree > 3) {
            return maxProb * 1 / Math.pow(degree, 3);
        } else {
            return maxProb * 1 / degree;
        }
    }

    for (var i = 0; i < graph.nodes.length; i++) {
        this.spawnDistribution.push(spawnWeight(graph.nodes[i]));
    }

    var norm = this.spawnDistribution.reduce(function(sum, e) { return sum + e; }, 0);
    this.spawnDistribution = this.spawnDistribution.map(function(e) { return e / norm; });
}

Simulation.prototype.createCars = function() {
    // Create the cars
    for (var i = 0; i < numberOfCars; i++) {
        // Choose a random node to start at
        var random = sampleDistribution(this.spawnDistribution);

        var startingNode = this.graph.nodes[random];
        var car = Car(startingNode);
        this.cars.push(car);
    }
};

Simulation.prototype.tick = function() {

    for (var key in this.cars) {
        var car = this.cars[key];

        if (car.getState() === "choosing") {
            if (car.locationEdge) {
                car.locationEdge.numberOfCars -= 1;
            } else {
                car.distanceSteps += 1;
            }

            var edge = this.chooseEdge(car);
            edge.numberOfCars += 1;
            car.locationEdge = edge;
            car.elapsed = 0;
            car.timesteps = this.edgeTimesteps(edge);
            car.state = "traveling";
        } else if (car.state === "traveling") {
            car.elapsed += 1;
            if (car.elapsed >= car.timesteps) {
                car.location = this.graph.otherNode(car.location, car.locationEdge);
                car.state = "choosing";
            }

            var distance = car.distanceSteps + car.elapsed / car.timesteps;
            var probability = 1 - Math.exp(-this.beta * distance);

            if (Math.random() < probability) {
                car.state = "exit";
            }

        } else if (car.state === "exit") {
            car.elapsed = 0;
            car.timesteps = 0;
            car.distanceSteps = 0;
            car.state = "choosing";
            car.locationEdge.numberOfCars -= 1;
            car.locationEdge = null;

            var node = sampleDistribution(this.spawnDistribution);

            var despawnId = car.location.id;
            car.location = this.graph.nodes[node];
        }
    }

    // tick
    this.t += 1;
};

Simulation.prototype.edgeTimesteps = function(edge) {
    return this.t0 + Math.floor(this.alpha * edge.numberOfCars);
}

Simulation.prototype.chooseEdge = function(car) {

    // Create the probability distribution over adjacent edges
    var node = car.location;
    var adjacentEdges = this.graph.adjacentEdges(node);
    var capacityThreshold = this.capacityThreshold;
    var lambda = this.lambda;
    var comingFrom = car.locationEdge;

    function getBaseProbability(edge) {
        return edge.weight[edge.nodes.indexOf(node)];
    }

    var baseProbs = adjacentEdges.map(getBaseProbability);

    function getEdgeDecayFactor(edge, i) {
        var tc = capacityThreshold * baseProbs[i];

        if (edge.numberOfCars > capacityThreshold) {
            factor = Math.exp(-lambda * (edge.numberOfCars - tc))
        } else {
            factor = 1;
        }

        if (comingFrom === edge) {
            factor *= 0.05;
        }

        return factor;
    }

    var edgeDecayFactors = adjacentEdges.map(getEdgeDecayFactor);
    var distribution = adjacentEdges.map(function(e, i) {
        return baseProbs[i] * edgeDecayFactors[i];
    })

    var norm = distribution.reduce(function(sum, e) { return sum + e; }, 0);
    distribution = distribution.map(function(e) { return e / norm; });
    var i = sampleDistribution(distribution);

    return adjacentEdges[i];
};
