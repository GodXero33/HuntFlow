import { getIntersectionOfTwoLines } from "./util.js";

export default class SnakeSensor {
	constructor (snake, count, range) {
		count = count % 2 == 0 ? count : count + 1;

		this.snake = snake;

		this.spread = Math.PI / 2;
		this.count = count;
		this.range = range;

		const deltaAngle = this.spread / (this.count - 1);
		const startAngle = -this.spread / 2;
		const halfCount = Math.floor(this.count / 2);

		this.rays = Array.from({ length: this.count }, (_, i) => ({
			x1: 0,
			y1: 0,
			x2: 0,
			y2: 0,
			u: 1,
			angle: startAngle + deltaAngle * i,
			lf: i <= halfCount ? 1 : 0,
			rf: i > halfCount ? 1 : 0
		}));

		this.turnLeftFact = 0;
		this.turnRightFact = 0;
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

	checkRayIntersection (bounds, ray) {
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
		const snakeHead = this.snake.head;
		const snakeHeadPositionX = snakeHead.position.x;
		const snakeHeadPositionY = snakeHead.position.y;
		const snakeHeadRotation = snakeHead.rotation;

		let turnLeftFact = 0;
		let turnRightFact = 0;
		const halfCount = Math.floor(this.count / 2);

		this.rays.forEach(ray => {
			const angle = ray.angle - snakeHeadRotation;
			const x = Math.cos(angle) * this.range + snakeHeadPositionX;
			const y = Math.sin(angle) * this.range + snakeHeadPositionY;

			ray.x1 = snakeHeadPositionX;
			ray.y1 = snakeHeadPositionY;
			ray.x2 = x;
			ray.y2 = y;
			ray.u = 1;

			this.checkRayIntersection(bounds, ray);

			turnLeftFact += ray.u * ray.lf;
			turnRightFact += ray.u * ray.rf;
		});

		turnLeftFact = 1 - (turnLeftFact / halfCount) ** 2;
		turnRightFact = 1 - (turnRightFact / halfCount) ** 2;

		this.turnLeftFact = turnLeftFact;
		this.turnRightFact = turnRightFact;
	}
}
