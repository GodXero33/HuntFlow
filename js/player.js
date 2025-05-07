import Sensor from "./sensor.js";
import { angleDifference, getIntersectionOfTwoLines, Vector } from "./util.js";
import WorldMap from "./world.map.js";

export default class Player {
	constructor () {
		this.camera = new Vector();
		this.cameraUpdateDistance = 100;
		this.isCameraUpdating = false;
		this.cameraDampingFact = 0.01;

		this.position = new Vector();
		this.tracker = new Vector();

		this.speed = 1.5;
		this.turnSpeed = 0.08;
		this.rotation = -Math.PI / 2;

		this.mouse = new Vector();
		this.mousedown = false;

		this.canvasDimensions = new Vector();

		this.steeringFact = 0.1;
		this.sensorTurnTriggerThreshold = 0.5;
		this.sensorTriggerSteeringFact = 0.1;

		this.originalBounds = [];
		this.bounds = [];
		
		this.sensor = new Sensor(this, 20, 150, Math.PI);
		this.sensorEnabled = true;

		this.maximumTrackerDistance = 0;
		this.minimumTrackerDistance = 0;

		this.drawSize = 40;
		this.color = '#994476';
		this.isIntersectedWithBound = false;
	}

	updateMovement (deltaTime) {
		const targetAngle = Math.atan2(this.tracker.y - this.position.y, this.tracker.x - this.position.x);
		let deltaAngle = angleDifference(targetAngle, this.rotation);

		this.rotation += deltaAngle * this.steeringFact;

		const deltaX = Math.cos(this.rotation) * this.speed;
		const deltaY = Math.sin(this.rotation) * this.speed;

		this.position.x += deltaX;
		this.position.y += deltaY;

		const cos = Math.cos(this.rotation);
		const sin = Math.sin(this.rotation);

		for (let a = 0; a < this.bounds.length; a += 2) {
			const localX = this.originalBounds[a];
			const localY = this.originalBounds[a + 1];

			const rotatedX = localX * cos - localY * sin;
			const rotatedY = localX * sin + localY * cos;

			this.bounds[a] = this.position.x + rotatedX;
			this.bounds[a + 1] = this.position.y + rotatedY;
		}

		if (this.sensorEnabled) {
			if (Math.abs(this.sensor.turnLeftFact) > this.sensorTurnTriggerThreshold) this.rotation += this.sensor.turnLeftFact * this.sensorTriggerSteeringFact;
			if (Math.abs(this.sensor.turnRightFact) > this.sensorTurnTriggerThreshold) this.rotation -= this.sensor.turnRightFact * this.sensorTriggerSteeringFact;
		}
	}

	updateCamera (deltaTime) {
		this.camera.x += (this.position.x - this.camera.x) * this.speed * this.cameraDampingFact;
		this.camera.y += (this.position.y - this.camera.y) * this.speed * this.cameraDampingFact;
	}

	updateTracker () {
		this.tracker.x = this.mouse.x - this.canvasDimensions.x * 0.5 + this.camera.x;
		this.tracker.y = this.mouse.y - this.canvasDimensions.y * 0.5 + this.camera.y;
	}

	checkCollision (bounds) {
		const thisBounds = this.bounds;

		for (let a = 0; a < this.bounds.length - 2; a += 2) {
			const x1 = thisBounds[a];
			const y1 = thisBounds[a + 1];
			const x2 = thisBounds[a + 2];
			const y2 = thisBounds[a + 3];

			if (bounds.findIndex(bound => {
				for (let b = 0; b < bound.length - 2; b += 2)
					if (getIntersectionOfTwoLines(x1, y1, x2, y2, bound[b], bound[b + 1], bound[b + 2], bound[b + 3])) return true;

				return false;
			}) !== -1) return true;
		}

		return false;
	}

	update (deltaTime, bounds) {
		const distanceToTracker = Vector.dist(this.tracker, this.position);

		if (this.sensorEnabled) this.sensor.update(bounds);
		if (distanceToTracker > this.minimumTrackerDistance && distanceToTracker < this.maximumTrackerDistance) this.updateMovement(deltaTime);
		if (this.mousedown) this.updateTracker();

		this.updateCamera(deltaTime);

		this.isIntersectedWithBound = this.checkCollision(bounds);
	}

	draw(ctx) {
		const transform = ctx.getTransform();

		ctx.fillStyle = '#943';

		ctx.translate(this.position.x, this.position.y);
		ctx.rotate(this.rotation);
		ctx.fillRect(-this.drawSize * 0.5, -this.drawSize * 0.5, this.drawSize, this.drawSize);
		
		ctx.setTransform(transform);

		if (window['UltraSnake2D_debug_mode'] === 1) {
			ctx.strokeStyle = '#f00';
			ctx.setLineDash([5, 10]);

			ctx.beginPath();

			for (let a = 0; a < this.bounds.length; a += 2) {
				if (a == 0) {
					ctx.moveTo(this.bounds[a], this.bounds[a + 1]);
				} else {
					ctx.lineTo(this.bounds[a], this.bounds[a + 1]);
				}
			}

			ctx.stroke();
			ctx.setLineDash([]);

			ctx.fillStyle = '#ff0000';

			ctx.fillRect(this.tracker.x - 10, this.tracker.y - 10, 20, 20);
			if (this.sensorEnabled) this.sensor.draw(ctx);
		}
	}

	setPlayerData (data) {
		const bounds = data.bounds;

		this.originalBounds = bounds.slice();
		this.bounds = bounds;

		this.drawSize = data.size;
		this.minimumTrackerDistance = data.minimumTrackerDistance;
		this.maximumTrackerDistance = data.maximumTrackerDistance;
	}
}
