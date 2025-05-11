import Torch from "./torch.js";
import {  getIntersectionOfTwoLines, Vector } from "./util.js";

class PlayerControls {
	constructor () {
		this.turnLeft = false;
		this.turnRight = false;
		this.forward = false;
		this.backward = false;
		this.left = false;
		this.right = false;
	}
}

class Player {
	static SQRT_2 = Math.sqrt(2);

	constructor () {
		this.position = new Vector();
		this.rotation = 0;

		this.speed = 0.15;
		this.steeringFact = 0.002;
		this.visionRange = 2000;

		this.canvasDimensions = new Vector();
		this.originalBounds = [];
		this.bounds = [];

		this.drawSize = 0;
		this.color = '#994476';

		this.controls = new PlayerControls(this);
		this.torch = new Torch(this);
	}

	updateMovement (deltaTime, bounds) {
		let movementSpeed = this.speed * deltaTime;

		if ((this.controls.right || this.controls.left) && (this.controls.forward || this.controls.backward)) movementSpeed /= Player.SQRT_2;

		let nextPositionX = this.position.x;
		let nextPositionY = this.position.y;

		if (this.controls.right) {
			nextPositionX += Math.cos(this.rotation) * movementSpeed;
			nextPositionY += Math.sin(this.rotation) * movementSpeed;
		}

		if (this.controls.left) {
			nextPositionX += Math.cos(this.rotation + Math.PI) * movementSpeed;
			nextPositionY += Math.sin(this.rotation + Math.PI) * movementSpeed;
		}

		if (this.controls.forward) {
			nextPositionX += Math.cos(this.rotation - Math.PI / 2) * movementSpeed;
			nextPositionY += Math.sin(this.rotation - Math.PI / 2) * movementSpeed;
		}

		if (this.controls.backward) {
			nextPositionX += Math.cos(this.rotation + Math.PI / 2) * movementSpeed;
			nextPositionY += Math.sin(this.rotation + Math.PI / 2) * movementSpeed;
		}

		const cos = Math.cos(this.rotation);
		const sin = Math.sin(this.rotation);

		for (let a = 0; a < this.bounds.length; a += 2) {
			const localX = this.originalBounds[a];
			const localY = this.originalBounds[a + 1];

			const rotatedX = localX * cos - localY * sin;
			const rotatedY = localX * sin + localY * cos;

			this.bounds[a] = nextPositionX + rotatedX;
			this.bounds[a + 1] = nextPositionY + rotatedY;
		}

		const steps = 4;
		const stepX = (nextPositionX - this.position.x) / steps;
		const stepY = (nextPositionY - this.position.y) / steps;

		let tempX = this.position.x;
		let tempY = this.position.y;

		for (let i = 0; i < steps; i++) {
			// Move a small step
			tempX += stepX;
			tempY += stepY;

			// Update bounds for this temp position
			for (let a = 0; a < this.bounds.length; a += 2) {
				const localX = this.originalBounds[a];
				const localY = this.originalBounds[a + 1];

				const rotatedX = localX * cos - localY * sin;
				const rotatedY = localX * sin + localY * cos;

				this.bounds[a] = tempX + rotatedX;
				this.bounds[a + 1] = tempY + rotatedY;
			}

			const intersections = this.checkAllCollisions(bounds);

			if (intersections.length) {
				// Respond just like before (push away)
				for (const [ix, iy, x3, y3, x4, y4] of intersections) {
					const dx = x4 - x3;
					const dy = y4 - y3;
					const len = Math.hypot(dx, dy);
					const nx = -dy / len;
					const ny = dx / len;

					const vx = tempX - ix;
					const vy = tempY - iy;
					const dot = vx * nx + vy * ny;
					const direction = Math.sign(dot);

					tempX += nx * 0.5 * direction;
					tempY += ny * 0.5 * direction;
				}
			}
		}

		this.position.x = tempX;
		this.position.y = tempY;
	}

	checkAllCollisions (bounds) {
		const thisBounds = this.bounds;
		const intersections = [];

		for (let a = 0; a < this.bounds.length - 2; a += 2) {
			const x1 = thisBounds[a];
			const y1 = thisBounds[a + 1];
			const x2 = thisBounds[a + 2];
			const y2 = thisBounds[a + 3];

			for (const bound of bounds) {
				for (let b = 0; b < bound.length - 2; b += 2) {
					const intersection = getIntersectionOfTwoLines(x1, y1, x2, y2, bound[b], bound[b + 1], bound[b + 2], bound[b + 3]);

					if (intersection) intersections.push([intersection[0], intersection[1], bound[b], bound[b + 1], bound[b + 2], bound[b + 3]]);
				}
			}
		}

		return intersections;
	}

	update (deltaTime, bounds) {
		this.updateMovement(deltaTime, bounds);
		this.torch.update(bounds);
	}

	draw(ctx) {
		this.torch.draw(ctx);

		const transform = ctx.getTransform();

		ctx.fillStyle = '#347';

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

	rotateBy (dx) {
		this.rotation += dx * this.steeringFact;
	}
}

export {
	Player,
	PlayerControls
};
