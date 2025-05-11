import { getIntersectionOfTwoLines, Vector } from "./util.js";

export default class Torch {
	constructor (player) {
		this.player = player;
		this.range = this.player.visionRange * 0.25;
		this.spread = Math.PI * 0.33;
		this.dense = 100;
		this.rays = Array.from({ length: this.dense }, () => new Vector());
		this.polygon = [];
		this.lightenBounds = [];
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

		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 2;

		this.lightenBounds.forEach(bound => {
			ctx.globalAlpha = 1 - bound[4] ** 2;
			ctx.beginPath();
			ctx.moveTo(bound[0], bound[1]);
			ctx.lineTo(bound[2], bound[3]);
			ctx.stroke();
		});

		ctx.globalAlpha = 1;
	}

	update (bounds) {
		const playerX = this.player.position.x;
		const playerY = this.player.position.y;
		const deltaAngle = this.spread / (this.dense - 1);
		const startAngle = this.player.rotation - this.spread / 2 - Math.PI / 2;

		this.polygon.length = 0;
		this.lightenBounds.length = 0;

		this.polygon.push(playerX, playerY);

		let prevLightenBounds = null;

		for (let a = 0; a < this.dense; a++) {
			let x = Math.cos(startAngle + a * deltaAngle) * this.range + playerX;
			let y = Math.sin(startAngle + a * deltaAngle) * this.range + playerY;

			let shortestIntersection = null;
			let shortestIntersectionLine = null;

			bounds.forEach(bound => {
				for (let b = 0; b < bound.length - 2; b += 2) {
					const intersection = getIntersectionOfTwoLines(playerX, playerY, x, y, bound[b], bound[b + 1], bound[b + 2], bound[b + 3]);

					if (!intersection) continue;

					if (!shortestIntersection) {
						shortestIntersection = intersection;
						shortestIntersectionLine = [bound[b], bound[b + 1], bound[b + 2], bound[b + 3]];
						continue;
					}

					if (intersection[2] < shortestIntersection[2]) {
						shortestIntersection = intersection;
						shortestIntersectionLine = [bound[b], bound[b + 1], bound[b + 2], bound[b + 3]];
					}
				}
			});

			if (shortestIntersection) {
				x = shortestIntersection[0];
				y = shortestIntersection[1];

				if (!prevLightenBounds) {
					prevLightenBounds = [x, y, ...shortestIntersectionLine];
				} else if (
					prevLightenBounds[2] != shortestIntersectionLine[0] ||
					prevLightenBounds[3] != shortestIntersectionLine[1] ||
					prevLightenBounds[4] != shortestIntersectionLine[2] ||
					prevLightenBounds[5] != shortestIntersectionLine[3]
				) {
					prevLightenBounds = null;
				} else {
					this.lightenBounds.push([prevLightenBounds[0], prevLightenBounds[1], x, y, shortestIntersection[2]]);
					prevLightenBounds[0] = x;
					prevLightenBounds[1] = y;
				}
			} else {
				prevLightenBounds = null;
			}

			this.rays[a].x = x;
			this.rays[a].y = y;

			this.polygon.push(x, y);
		}

		this.polygon.push(playerX, playerY);
	}
}
