import Sensor from "./sensor.js";
import { angleDifference, getIntersectionOfTwoLines, Vector } from "./util.js";

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

		this.distanceToTracker = 0;
		this.steeringFact = 0.05;
		this.sensorTurnTriggerThreshold = 0.5;
		this.sensorTriggerSteeringFact = 0.5;

		this.sensor = new Sensor(this, 10, Math.floor(this.speed * 50));
		this.sensorEnabled = false;
		this.sensorEnableDistance = 200;

		this.color = '#994476';
		this.isIntersectedWithBound = false;
	}

	updateMovement (deltaTime) {
		const targetAngle = Math.atan2(this.tracker.y - this.position.y, this.tracker.x - this.position.x);
		let deltaAngle = angleDifference(targetAngle, this.rotation);

		this.rotation += deltaAngle * this.steeringFact;

		this.position.x += Math.cos(this.rotation) * this.speed;
		this.position.y += Math.sin(this.rotation) * this.speed;

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
		// const x1 = this.body[0].position.x;
		// const y1 = this.body[0].position.y;
		// const x2 = this.body[1].position.x;
		// const y2 = this.body[1].position.y;

		// this.isIntersectedWithBound = bounds.findIndex(bound => {
		// 	for (let a = 0; a < bound.length - 2; a += 2)
		// 		if (getIntersectionOfTwoLines(x1, y1, x2, y2, bound[a], bound[a + 1], bound[a + 2], bound[a + 3])) return true;

		// 	return false;
		// }) !== -1;

		return true;
	}

	update (deltaTime, bounds) {
		this.distanceToTracker = Vector.dist(this.tracker, this.position);
		this.sensorEnabled = this.distanceToTracker > this.sensorEnableDistance;

		if (this.sensorEnabled) this.sensor.update(bounds);

		this.updateMovement(deltaTime);
		this.updateCamera(deltaTime);

		if (this.mousedown) this.updateTracker();

		this.checkCollision(bounds);
	}

	draw(ctx) {
		ctx.fillStyle = '#943';
		ctx.fillRect(this.position.x - 20, this.position.y - 20, 40, 40);

		if (window['UltraSnake2D_debug_mode'] === 1) {
			ctx.fillStyle = '#ff0000';

			ctx.fillRect(this.tracker.x - 10, this.tracker.y - 10, 20, 20);
			if (this.sensorEnabled) this.sensor.draw(ctx);
		}
	}
}
