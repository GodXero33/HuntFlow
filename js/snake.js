import Vector from "./vector.js";

class SnakeBodyPiece {
	constructor (x, y, size) {
		this.position = new Vector(x, y);
		this.size = size;
		this.color = '#ff0000';
		this.child = null;
		this.rotation = 0;
	}
}

export default class Snake {
	constructor () {
		this.head = new SnakeBodyPiece(300, 300, 20);
		this.body = new Array(5);

		this.speed = 0.1;
		this.turnSpeed = 0.002;
		this.headingAngle = 0;

		this.turnLeft = false;
		this.turnRight = false;

		this.wobbleAngle = 0;
		this.wobbleAmplitude = Math.PI / 8;
		this.wobblePhase = 0;

		this.#generateSnakeBody();
	}

	#generateSnakeBody () {
		this.body[0] = this.head;

		for (let a = 1; a < 5; a++) {
			this.body[a] = new SnakeBodyPiece(300 + a * 20, 300, 20);
			this.body[a - 1].child = this.body[a];
		}
	}

	updateMovement (dt) {
		if (this.turnLeft == this.turnRight) {
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
		this.head.rotation = -(this.headingAngle + this.wobbleAngle);
	}

	draw (ctx) {
		this.body.forEach(piece => {
			ctx.fillStyle = piece.color;

			ctx.save();
			ctx.translate(piece.position.x, piece.position.y);
			ctx.rotate(piece.rotation);
			ctx.fillRect(-piece.size * 0.5, -piece.size * 0.5, piece.size, piece.size);
			ctx.restore();
		});
	}
}
