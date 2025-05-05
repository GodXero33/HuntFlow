export default class SnakeSensor {
	constructor (snake) {
		this.snake = snake;

		this.spread = Math.PI / 2;
		this.count = 5;
		this.range = 200;
		this.rays = Array.from({ length: this.count }, () => new Array(4).fill(0));
	}

	draw (ctx) {
		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 2;

		ctx.beginPath();

		this.rays.forEach(ray => {
			ctx.moveTo(ray[0], ray[1]);
			ctx.lineTo(ray[2], ray[3]);
		});

		ctx.stroke();
	}

	update () {
		const deltaAngle = this.spread / (this.count - 1);
		const startAngle = -this.spread / 2;
		const snakeHead = this.snake.head;
		const snakeHeadPositionX = snakeHead.position.x;
		const snakeHeadPositionY = snakeHead.position.y;
		const snakeHeadRotation = snakeHead.rotation;

		for (let a = 0; a < this.count; a++) {
			const angle = startAngle + deltaAngle * a - snakeHeadRotation;
			const x = Math.cos(angle) * this.range + snakeHeadPositionX;
			const y = Math.sin(angle) * this.range + snakeHeadPositionY;

			const ray = this.rays[a];

			ray[0] = snakeHeadPositionX;
			ray[1] = snakeHeadPositionY;
			ray[2] = x;
			ray[3] = y;
		}
	}
}
