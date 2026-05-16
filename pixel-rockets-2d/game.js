// ============================================
// Game Class - Main Game Loop
// ============================================

class Game {
    constructor() {
        this.canvas = document.getElementById('rocketCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.rocket = new Rocket();
        this.physics = new PhysicsEngine();
        this.lastTime = Date.now();
        this.thrustDuration = 5000; // 5 seconds
        this.thrustStartTime = 0;
        this.animationId = null;
        this.isRunning = false;

        // Event listeners
        this.canvas.addEventListener('click', (e) => this.onCanvasClick(e));
        this.canvas.addEventListener('contextmenu', (e) => this.onCanvasRightClick(e));

        this.draw();
    }

    addPart(type) {
        if (this.rocket.state === 'building') {
            const part = createPart(type);
            if (part) {
                this.rocket.addPart(part);
                this.updateStats();
                this.draw();
            }
        }
    }

    removePart() {
        if (this.rocket.state === 'building') {
            this.rocket.removePart();
            this.updateStats();
            this.draw();
        }
    }

    clear() {
        if (this.rocket.state === 'building') {
            this.rocket.clear();
            this.updateStats();
            this.draw();
        }
    }

    launch() {
        if (this.rocket.state === 'building') {
            if (this.rocket.canLaunch()) {
                this.rocket.launch();
                this.thrustStartTime = Date.now();
                this.startGameLoop();
            } else {
                alert('Cannot launch! Check requirements:\n- Must have Capsule\n- Must have Engine\n- Thrust/Weight ratio must be > 1.0');
            }
        }
    }

    startGameLoop() {
        this.isRunning = true;
        this.lastTime = Date.now();
        this.gameLoop();
    }

    gameLoop = () => {
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        // Check if thrust should stop
        if (currentTime - this.thrustStartTime > this.thrustDuration) {
            this.rocket.isThrusting = false;
        }

        // Update physics
        this.physics.update(this.rocket, deltaTime);
        this.updateStats();
        this.draw();

        // Continue loop if rocket is still flying
        if (this.rocket.isFlying) {
            this.animationId = requestAnimationFrame(this.gameLoop);
        } else {
            this.isRunning = false;
            this.rocket.state = 'building';
        }
    }

    updateStats() {
        const totalMass = this.rocket.getTotalMass();
        const totalThrust = this.rocket.getTotalThrust();
        const twRatio = this.rocket.getThrustToWeightRatio();
        const partsCount = this.rocket.parts.length;

        document.getElementById('weight-stat').textContent = `${totalMass} kg`;
        document.getElementById('thrust-stat').textContent = `${totalThrust} N`;
        document.getElementById('tw-stat').textContent = `${twRatio}`;
        document.getElementById('parts-count').textContent = `${partsCount}/6`;
        document.getElementById('parts-added').textContent = partsCount;

        // Update launch button state
        const launchBtn = document.getElementById('launch-btn');
        if (this.rocket.canLaunch()) {
            launchBtn.style.opacity = '1';
            launchBtn.style.cursor = 'pointer';
        } else {
            launchBtn.style.opacity = '0.5';
            launchBtn.style.cursor = 'not-allowed';
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(10, 26, 58, 1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.rocket.isFlying) {
            this.drawFlight();
        } else {
            this.drawBuilder();
        }
    }

    drawBuilder() {
        const centerX = this.canvas.width / 2;
        const startY = this.canvas.height - 100;

        // Draw ground
        this.ctx.fillStyle = '#8B7355';
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);

        // Draw grass
        this.ctx.fillStyle = '#2D5016';
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 5);

        // Draw rocket
        let currentY = startY;
        for (let i = 0; i < this.rocket.parts.length; i++) {
            const part = this.rocket.parts[i];
            this.drawPart(centerX, currentY, part);
            currentY -= 30;
        }

        // Draw instructions
        this.ctx.fillStyle = '#00FF88';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Right-click to remove parts', this.canvas.width / 2, 30);
    }

    drawFlight() {
        // Draw sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#000033');
        gradient.addColorStop(1, '#003366');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw ground
        const groundY = this.physics.groundLevel;
        this.ctx.fillStyle = '#8B7355';
        this.ctx.fillRect(0, groundY, this.canvas.width, this.canvas.height - groundY);

        // Draw rocket at flight position
        const screenY = 500 - (this.rocket.position.y / 50);
        this.drawRocketFlying(this.canvas.width / 2, Math.max(20, Math.min(450, screenY)));

        // Draw telemetry
        this.drawTelemetry();

        // Draw parachute indicator
        if (this.rocket.hasParachute && this.rocket.parachuteDeployed) {
            this.drawParachuteDeployed();
        }
    }

    drawPart(x, y, part) {
        // Draw part box
        this.ctx.fillStyle = part.color;
        this.ctx.fillRect(x - 30, y - 15, 60, 30);

        // Draw part icon
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#000';
        this.ctx.fillText(part.icon, x, y);
    }

    drawRocketFlying(x, y) {
        const rocketHeight = 40;
        const rocketWidth = 20;

        // Draw rocket body
        this.ctx.fillStyle = '#FFE66D';
        this.ctx.fillRect(x - rocketWidth / 2, y - rocketHeight / 2, rocketWidth, rocketHeight);

        // Draw rocket tip
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - rocketHeight / 2 - 10);
        this.ctx.lineTo(x - rocketWidth / 2, y - rocketHeight / 2);
        this.ctx.lineTo(x + rocketWidth / 2, y - rocketHeight / 2);
        this.ctx.fill();

        // Draw flame if thrusting
        if (this.rocket.isThrusting && this.rocket.fuelRemaining > 0) {
            const flameLength = 15 + Math.random() * 10;
            this.ctx.fillStyle = '#FF4500';
            this.ctx.beginPath();
            this.ctx.moveTo(x - rocketWidth / 3, y + rocketHeight / 2);
            this.ctx.lineTo(x, y + rocketHeight / 2 + flameLength);
            this.ctx.lineTo(x + rocketWidth / 3, y + rocketHeight / 2);
            this.ctx.fill();

            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.moveTo(x - rocketWidth / 4, y + rocketHeight / 2);
            this.ctx.lineTo(x, y + rocketHeight / 2 + flameLength * 0.6);
            this.ctx.lineTo(x + rocketWidth / 4, y + rocketHeight / 2);
            this.ctx.fill();
        }

        // Draw parachute if deployed
        if (this.rocket.parachuteDeployed) {
            this.ctx.strokeStyle = '#95E1D3';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y - 40, 25, Math.PI, 0, false);
            this.ctx.stroke();
        }
    }

    drawTelemetry() {
        this.ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
        this.ctx.fillRect(10, 10, 200, 100);

        this.ctx.strokeStyle = '#00FF88';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(10, 10, 200, 100);

        this.ctx.fillStyle = '#00FF88';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Altitude: ${Math.round(this.rocket.altitude)} px`, 15, 30);
        this.ctx.fillText(`Velocity: ${this.rocket.velocity.magnitude().toFixed(1)} m/s`, 15, 50);
        this.ctx.fillText(`Max Altitude: ${Math.round(this.rocket.maxAltitude)} px`, 15, 70);
        this.ctx.fillText(`State: ${this.rocket.state.toUpperCase()}`, 15, 90);
        this.ctx.fillText(`Fuel: ${this.rocket.fuelRemaining.toFixed(0)}%`, 15, 105);
    }

    drawParachuteDeployed() {
        this.ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PARACHUTE DEPLOYED', this.canvas.width / 2, this.canvas.height - 30);
    }

    onCanvasClick(e) {
        if (this.rocket.state === 'building') {
            // Could add more functionality here
        }
    }

    onCanvasRightClick(e) {
        e.preventDefault();
        if (this.rocket.state === 'building') {
            this.removePart();
        }
    }
}

// Initialize game when page loads
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new Game();
});
