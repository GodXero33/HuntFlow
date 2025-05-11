import { getIntersectionOfTwoLines, Vector } from "./util.js";

export default class Torch {
	constructor (player) {
		this.player = player;
		this.range = this.player.visionRange * 0.25;
		this.spread = Math.PI * 0.33;
		this.dense = 100;
		this.rays = Array.from({ length: this.dense }, () => new Vector());
		this.polygon = [];
	}

	draw (ctx) {
		const gradient = ctx.createRadialGradient(this.player.position.x, this.player.position.y, 0, this.player.position.x, this.player.position.y, this.range);

		gradient.addColorStop(0, '#ffffff');
		gradient.addColorStop(1, 'transparent');
		ctx.fillStyle = gradient;

		ctx.beginPath();

		for (let a = 0; a < this.polygon.length; a += 2) {
			if (a == 0) {
				ctx.moveTo(this.polygon[a], this.polygon[a + 1]);
			} else {
				ctx.lineTo(this.polygon[a], this.polygon[a + 1]);
			}
		}

		ctx.fill();
	}

	update (bounds) {
		const playerX = this.player.position.x;
		const playerY = this.player.position.y;
		const deltaAngle = this.spread / (this.dense - 1);
		const startAngle = this.player.rotation - this.spread / 2 - Math.PI / 2;

		this.polygon.length = 0;

		this.polygon.push(playerX, playerY);

		for (let a = 0; a < this.dense; a++) {
			let x = Math.cos(startAngle + a * deltaAngle) * this.range + playerX;
			let y = Math.sin(startAngle + a * deltaAngle) * this.range + playerY;

			let shortestIntersection = null;

			bounds.forEach(bound => {
				for (let a = 0; a < bound.length - 2; a += 2) {
					const intersection = getIntersectionOfTwoLines(playerX, playerY, x, y, bound[a], bound[a + 1], bound[a + 2], bound[a + 3]);

					if (!intersection) continue;

					if (!shortestIntersection) {
						shortestIntersection = intersection;
						continue;
					}

					if (intersection[2] < shortestIntersection[2]) shortestIntersection = intersection;
				}
			});

			if (shortestIntersection) {
				x = shortestIntersection[0];
				y = shortestIntersection[1];
			}

			this.rays[a].x = x;
			this.rays[a].y = y;

			this.polygon.push(x, y);
		}

		this.polygon.push(playerX, playerY);
	}
}
