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
	static maxBend = Math.PI / 3;

	constructor () {
		const size = 20;

		this.head = new SnakeBodyPiece(300, 300, 20);
		this.body = new Array(size);

		this.speed = 0.2;
		this.turnSpeed = 0.004;
		this.headingAngle = -Math.PI / 2;

		this.turnLeft = false;
		this.turnRight = false;

		this.wobbleAngle = 0;
		this.wobbleAmplitude = Math.PI / 8;
		this.wobblePhase = 0;

		this.#generateSnakeBody(size);
	}

	#generateSnakeBody (size) {
		this.body[0] = this.head;

		for (let a = 1; a < size; a++) {
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

		for (let i = 1; i < this.body.length; i++) {
			const parent = this.body[i - 1];
			const child = this.body[i];

			const dir = Vector.sub(parent.position, child.position);
			const distance = dir.mag();
			const targetDist = parent.size;

			if (distance > targetDist) {
				dir.normalize();
				dir.mult(distance - targetDist);
				child.position.add(dir);
			}

			// Calculate rotation of piece
			const angleDiff = Vector.sub(parent.position, child.position).heading() - child.rotation;

			child.rotation += Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
		}

		// Angle constraint between two pieces
		for (let i = 1; i < this.body.length - 1; i++) {
			const parent = this.body[i - 1];
			const current = this.body[i];
			const child = this.body[i + 1];

			const vecA = Vector.sub(current.position, parent.position);
			const vecB = Vector.sub(child.position, current.position);

			const angleA = Math.atan2(vecA.y, vecA.x);
			const angleB = Math.atan2(vecB.y, vecB.x);

			let delta = angleB - angleA;

			while (delta > Math.PI) delta -= Math.PI * 2;
			while (delta < -Math.PI) delta += Math.PI * 2;

			if (Math.abs(delta) > Snake.maxBend) {
				const sign = Math.sign(delta);
				const clampedAngle = angleA + sign * Snake.maxBend;

				const distance = Vector.sub(child.position, current.position).mag();
				child.position.x = current.position.x + Math.cos(clampedAngle) * distance;
				child.position.y = current.position.y + Math.sin(clampedAngle) * distance;
			}
		}
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

	addPiece () {
		const last = this.body[this.body.length - 1];
		const secondLast = this.body[this.body.length - 2] || last;

		const direction = Vector.sub(last.position, secondLast.position).normalize();

		const offset = direction.copy().mult(last.size);
		const newPos = Vector.sub(last.position, offset);

		const newPiece = new SnakeBodyPiece(newPos.x, newPos.y, last.size);
		last.child = newPiece;
		this.body.push(newPiece);
	}
}
