import { angleDifference, getIntersectionOfTwoLines, Vector } from "./util.js";

class PlayerControls {
	constructor () {
		this.turnLeft = false;
		this.turnRight = false;
		this.forward = false;
		this.backward = false;
	}

	update (deltaTime) {}
}

class Player {
	constructor () {
		this.position = new Vector();
		this.rotation = -Math.PI / 2;

		this.speed = 1.5;
		this.steeringFact = 0.05;

		this.canvasDimensions = new Vector();
		this.originalBounds = [];
		this.bounds = [];

		this.drawSize = 0;
		this.color = '#994476';
		this.isIntersectedWithBound = false;

		this.controls = new PlayerControls(this);
	}

	updateMovement (deltaTime) {
		if (this.controls.turnLeft) this.rotation -= this.steeringFact;
		if (this.controls.turnRight) this.rotation += this.steeringFact;

		if (this.controls.forward) {
			this.position.x += Math.cos(this.rotation - Math.PI / 2) * this.speed;
			this.position.y += Math.sin(this.rotation - Math.PI / 2) * this.speed;
		}

		if (this.controls.backward) {
			this.position.x += Math.cos(this.rotation + Math.PI / 2) * this.speed;
			this.position.y += Math.sin(this.rotation + Math.PI / 2) * this.speed;
		}

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
		this.updateMovement(deltaTime);

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

export {
	Player,
	PlayerControls
};
