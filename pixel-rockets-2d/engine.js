// ============================================
// Vector2 - 2D Vector Math
// ============================================
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    subtract(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return new Vector2(0, 0);
        return new Vector2(this.x / mag, this.y / mag);
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }
}

// ============================================
// Physics Engine
// ============================================
class PhysicsEngine {
    constructor() {
        this.gravity = new Vector2(0, 9.81); // m/s²
        this.airDensity = 1.225; // kg/m³ at sea level
        this.groundLevel = 500; // pixels
    }

    update(rocket, deltaTime) {
        if (!rocket.isFlying) return;

        // Calculate mass
        const mass = rocket.getTotalMass();
        if (mass <= 0) return;

        // Apply gravity
        const gravityForce = new Vector2(0, mass * this.gravity.y);

        // Calculate thrust (if engine is active)
        let thrustForce = new Vector2(0, 0);
        if (rocket.isThrusting && rocket.fuelRemaining > 0) {
            const thrustMagnitude = rocket.getTotalThrust();
            const thrustDirection = new Vector2(0, -1); // Upward
            thrustForce = thrustDirection.multiply(thrustMagnitude);
            rocket.fuelRemaining = Math.max(0, rocket.fuelRemaining - deltaTime * 50);
        }

        // Calculate drag
        const dragForce = this.calculateDrag(rocket);

        // Total force
        const totalForce = gravityForce.add(thrustForce).add(dragForce);

        // Calculate acceleration (F = ma)
        const acceleration = new Vector2(totalForce.x / mass, totalForce.y / mass);

        // Update velocity
        rocket.velocity = rocket.velocity.add(acceleration.multiply(deltaTime));

        // Update position (pixels, convert from meters)
        const positionDelta = rocket.velocity.multiply(deltaTime).multiply(50);
        rocket.position = rocket.position.add(positionDelta);

        // Update altitude
        rocket.altitude = Math.max(0, this.groundLevel - rocket.position.y);
        if (rocket.altitude > rocket.maxAltitude) {
            rocket.maxAltitude = rocket.altitude;
        }

        // Check if landed
        if (rocket.position.y >= this.groundLevel) {
            rocket.isFlying = false;
            rocket.position.y = this.groundLevel;
            rocket.state = 'landed';
        }

        // Auto-deploy parachute
        if (rocket.hasParachute && !rocket.parachuteDeployed && rocket.altitude < 100) {
            rocket.parachuteDeployed = true;
        }
    }

    calculateDrag(rocket) {
        const dragCoefficient = rocket.parachuteDeployed ? 1.5 : 0.04;
        const crossSectionalArea = rocket.parachuteDeployed ? 5 : 0.5;
        const velocity = rocket.velocity.magnitude();
        const dragMagnitude = 0.5 * this.airDensity * velocity * velocity * dragCoefficient * crossSectionalArea;
        
        if (velocity === 0) return new Vector2(0, 0);
        
        const dragDirection = rocket.velocity.normalize().multiply(-1);
        return dragDirection.multiply(dragMagnitude);
    }
}

// ============================================
// Rocket Class
// ============================================
class Rocket {
    constructor() {
        this.parts = [];
        this.position = new Vector2(200, 100);
        this.velocity = new Vector2(0, 0);
        this.altitude = 0;
        this.maxAltitude = 0;
        this.isFlying = false;
        this.isThrusting = false;
        this.fuelRemaining = 100;
        this.hasParachute = false;
        this.parachuteDeployed = false;
        this.state = 'building'; // building, flying, landed
    }

    addPart(part) {
        if (this.parts.length < 6) {
            this.parts.push(part);
        }
    }

    removePart() {
        if (this.parts.length > 0) {
            this.parts.pop();
        }
    }

    clear() {
        this.parts = [];
    }

    getTotalMass() {
        return this.parts.reduce((sum, part) => sum + part.mass, 0);
    }

    getTotalThrust() {
        return this.parts.reduce((sum, part) => sum + part.thrust, 0);
    }

    getThrustToWeightRatio() {
        const mass = this.getTotalMass();
        if (mass === 0) return 0;
        const thrust = this.getTotalThrust();
        return (thrust / (mass * 9.81)).toFixed(2);
    }

    canLaunch() {
        const hasCapsule = this.parts.some(p => p.type === 'capsule');
        const hasEngine = this.parts.some(p => p.type === 'engine');
        const twRatio = parseFloat(this.getThrustToWeightRatio());
        return hasCapsule && hasEngine && twRatio > 1.0;
    }

    launch() {
        if (!this.canLaunch()) return false;

        this.isFlying = true;
        this.isThrusting = true;
        this.state = 'flying';
        this.velocity = new Vector2(0, 0);
        this.fuelRemaining = 100;
        this.parachuteDeployed = false;
        this.position = new Vector2(200, 450);
        this.hasParachute = this.parts.some(p => p.type === 'parachute');
        return true;
    }
}
