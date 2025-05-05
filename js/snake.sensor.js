import { getIntersectionOfTwoLines } from "./util.js";

export default class SnakeSensor {
	constructor (snake) {
		this.snake = snake;

		this.spread = Math.PI / 2;
		this.count = 5;
		this.range = 200;
		this.rays = Array.from({ length: this.count }, () => ({ x1: 0, y1: 0, x2: 0, y2: 0, u: 1 }));
	}

	draw (ctx) {
		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 2;

		this.rays.forEach(ray => {
			ctx.globalAlpha = (1 - ray.u) * 0.5 + 0.5;

			ctx.beginPath();
			ctx.moveTo(ray.x1, ray.y1);
			ctx.lineTo(ray.x2, ray.y2);
			ctx.stroke();
		});

		ctx.globalAlpha = 1;
	}

	checkIntersection (bounds, ray) {
		const x1 = ray.x1;
		const y1 = ray.y1;
		const x2 = ray.x2;
		const y2 = ray.y2;

		let minIntersection = null;

		bounds.forEach(bound => {
			for (let a = 0; a < bound.length - 2; a += 2) {
				const intersection = getIntersectionOfTwoLines(bound[a], bound[a + 1], bound[a + 2], bound[a + 3], x1, y1, x2, y2);

				if (!intersection) continue;

				if (!minIntersection) {
					minIntersection = intersection;
					continue;
				}

				if (minIntersection[3] > intersection[3]) minIntersection = intersection;
			}
		});

		if (minIntersection) {
			ray.x2 = minIntersection[0];
			ray.y2 = minIntersection[1];
			ray.u = minIntersection[3];
		}
	}

	update (bounds) {
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

			ray.x1 = snakeHeadPositionX;
			ray.y1 = snakeHeadPositionY;
			ray.x2 = x;
			ray.y2 = y;
			ray.u = 1;

			this.checkIntersection(bounds, ray);
		}

	}
}
