import { getIntersectionOfTwoLines } from "./util.js";
import Vector from "./vector.js";

class SnakeBodyPiece {
	constructor (x, y, size) {
		this.position = new Vector(x, y);
		this.size = size;
		this.child = null;
		this.rotation = 0;
	}
}

export default class Snake {
	static maxBend = Math.PI / 6;

	constructor () {
		const size = 10;

		this.head = null;
		this.body = null;

		this.camera = null;
		this.cameraUpdateCounter = 0;
		this.cameraUpdateDistance = 100;
		this.isCameraUpdating = false;

		this.speed = 0.1;
		this.turnSpeed = 0.004;
		this.headingAngle = -Math.PI / 2;

		this.turnLeft = false;
		this.turnRight = false;

		this.wobbleAngle = 0;
		this.wobbleAmplitude = Math.PI / 8;
		this.wobblePhase = 0;

		this.color = '#ff0000';

		this.#generateSnakeBody(size);
	}

	#generateSnakeBody (size) {
		if (size <= 4) return;

		this.head = new SnakeBodyPiece(300, 300, 5);
		this.body = new Array(size);
		this.camera = new Vector(this.head.position.x, this.head.position.y);

		this.body[0] = this.head;

		for (let a = 1; a < size; a++) {
			this.body[a] = new SnakeBodyPiece(300, 300, 5);
			this.body[a - 1].child = this.body[a];
		}
	}

	updateMovement (dt) {
		this.wobbleAngle = Math.sin(this.wobblePhase) * this.wobbleAmplitude + this.wobbleAmplitude;
		this.wobblePhase = (this.wobblePhase + 0.2) % (Math.PI * 2);

		if (this.turnLeft) this.headingAngle += this.turnSpeed * dt;
		if (this.turnRight) this.headingAngle -= this.turnSpeed * dt;

		this.headingAngle %= Math.PI * 2;

		let prevPosition = this.head.position.copy();

		this.head.position.x += Math.sin(this.headingAngle + this.wobbleAngle) * this.speed  * dt;
		this.head.position.y += Math.cos(this.headingAngle + this.wobbleAngle) * this.speed  * dt;

		for (let i = 1; i < this.body.length; i++) {
			const child = this.body[i];
			const childPosition = child.position.copy();
			
			child.position.x = prevPosition.x;
			child.position.y = prevPosition.y;

			prevPosition = childPosition;

			// Calculate rotation of piece
			const parent = this.body[i - 1];
			const angleDiff = Vector.sub(parent.position, child.position).heading() - child.rotation;

			child.rotation += Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
		}

		this.head.rotation = -(this.headingAngle + this.wobbleAngle);
	}

	updateCamera (dt) {
		const distance = Vector.dist(this.camera, this.head.position);

		if (distance > this.cameraUpdateDistance && !this.isCameraUpdating) this.isCameraUpdating = true;
		if (distance < 1) this.isCameraUpdating = false;

		if (!this.isCameraUpdating) return;

		this.camera.x += (this.head.position.x - this.camera.x) * this.speed * dt * 0.01;
		this.camera.y += (this.head.position.y - this.camera.y) * this.speed * dt * 0.01;
	}

	update (dt, map) {
		this.updateMovement(dt);
		this.updateCamera(dt);
	}

	draw(ctx) {
		ctx.linejoin = 'round';

		const leftPoints = [];
		const rightPoints = [];

		for (const piece of this.body) {
			const angle = piece.rotation + Math.PI / 2;
			const dx = Math.cos(angle) * piece.size * 0.5;
			const dy = Math.sin(angle) * piece.size * 0.5;

			leftPoints.push({ x: piece.position.x + dx, y: piece.position.y + dy });
			rightPoints.push({ x: piece.position.x - dx, y: piece.position.y - dy });
		}

		ctx.fillStyle = this.color;

		ctx.beginPath();

		const head = this.body[0];
		const headAngle = head.rotation;
		const radius = head.size * 0.5;

		ctx.arc(head.position.x, head.position.y, radius, headAngle, headAngle + Math.PI, false);

		for (let i = 1; i < leftPoints.length; i++)
			ctx.lineTo(leftPoints[i].x, leftPoints[i].y);

		const tail = this.body.at(-1);
		const tailAngle = tail.rotation;

		ctx.arc(tail.position.x, tail.position.y, tail.size * 0.5, tailAngle + Math.PI / 2, tailAngle - Math.PI / 2, false);

		for (let i = rightPoints.length - 2; i > 0; i--)
			ctx.lineTo(rightPoints[i].x, rightPoints[i].y);

		ctx.closePath();
		ctx.fill();
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
