import { Vector } from "./util.js";

export default class DummyCreature {
	constructor (x, y) {
		this.position = new Vector(x, y);
		this.velocity = new Vector(x, y);
		this.originalBounds = [-18, -18, 18, -18, 18, 18, -18, 18, -18, -18];
		this.bounds = Array.from(this.originalBounds);
		this.rotation = 0;
		this.t = -Math.PI * 0.5 + 0.5;
	}

	drawDebug (ctx) {
		ctx.strokeStyle = '#f00';
		ctx.setLineDash([5, 10]);
		ctx.strokeRect(this.position.x - 20, this.position.y - 20, 40, 40);
		ctx.setLineDash([]);
	}

	draw (ctx) {
		ctx.fillStyle = '#f0f';
		ctx.fillRect(this.position.x - 20, this.position.y - 20, 40, 40);
	}

	update (deltaTime) {
		let nextPositionX = this.position.x;
		let nextPositionY = this.position.y;

		nextPositionX = Math.cos(this.t) * 200;
		nextPositionY = Math.sin(this.t) * 200;
		// this.t += 0.001 * deltaTime;

		const cos = Math.cos(this.rotation);
		const sin = Math.sin(this.rotation);

		for (let a = 0; a < this.originalBounds.length; a += 2) {
			const localX = this.originalBounds[a];
			const localY = this.originalBounds[a + 1];

			const rotatedX = localX * cos - localY * sin;
			const rotatedY = localX * sin + localY * cos;

			this.bounds[a] = nextPositionX + rotatedX;
			this.bounds[a + 1] = nextPositionY + rotatedY;
		}

		this.position.x = nextPositionX;
		this.position.y = nextPositionY;
	}
}
