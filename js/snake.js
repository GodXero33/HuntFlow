import Vector from "./vector.js";

class SnakeBodyPiece {
	constructor (x, y, size) {
		this.position = new Vector(x, y);
		this.size = size;
		this.color = '#ff0000';
	}
}

export default class Snake {
	constructor () {
		this.head = new SnakeBodyPiece(300, 300, 20);

		this.speed = 0.1;
		this.turnSpeed = 0.002;
		this.headingAngle = 0;

		this.turnLeft = false;
		this.turnRight = false;

		this.wobbleAngle = 0;
		this.wobbleAmplitude = Math.PI / 8;
		this.wobblePhase = 0;
	}

	updateMovement (dt) {
		if (!this.turnLeft && !this.turnRight) {
			this.wobbleAngle = Math.sin(this.wobblePhase) * this.wobbleAmplitude + this.wobbleAmplitude;
			this.wobblePhase = (this.wobblePhase + 0.1) % (Math.PI * 2);
		}

		if (this.turnLeft) this.headingAngle += this.turnSpeed * dt;
		if (this.turnRight) this.headingAngle -= this.turnSpeed * dt;

		this.headingAngle %= Math.PI * 2;

		this.head.position.x += Math.sin(this.headingAngle + this.wobbleAngle) * this.speed  * dt;
		this.head.position.y += Math.cos(this.headingAngle + this.wobbleAngle) * this.speed  * dt;
	}

	update (dt) {
		this.updateMovement(dt);
	}

	draw (ctx) {
		const head = this.head;
		ctx.fillStyle = head.color;

		ctx.save();
		ctx.translate(head.position.x, head.position.y);
		ctx.rotate(-(this.headingAngle + this.wobbleAngle));
		ctx.fillRect(-head.size * 0.5, -head.size * 0.5, head.size, head.size);
		ctx.restore();
	}
}
