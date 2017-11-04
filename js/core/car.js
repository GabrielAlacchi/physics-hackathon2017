

function Car(startingNode) {
    if (!(this instanceof Car)) {
        return new Car(startingNode);
    }

    this.location = startingNode;
    this.locationEdge = null;
    this.state = "choosing";
    this.timesteps = 0;
    this.elapsed = 0;
}

Car.prototype.getState() {
    return this.state;
}

Car.prototype.setState(state) {
    this.state = state;
}
