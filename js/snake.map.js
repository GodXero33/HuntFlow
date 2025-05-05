import Vector from "./vector.js";

export default class SnakeMap {
	constructor (snake) {
		this.snake = snake;
		this.map = null;
		this.bounds = null;
		this.canvasDimensions = new Vector();
		this.isGameOver = false;
	}

	setMap (map) {
		this.map = map;
		this.bounds = map.objects.map(object => object.bounds);
	}

	update () {
		if (!this.isGameOver) this.snake.update(this.bounds);
		if (this.snake.isIntersectedWithBound) this.isGameOver = true;
	}

	draw (ctx) {
		ctx.save();
		ctx.translate(this.canvasDimensions.x * 0.5 - this.snake.camera.x, this.canvasDimensions.y * 0.5 - this.snake.camera.y);
		this.snake.draw(ctx);

		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 2;

		this.bounds.forEach(bound => {
			ctx.beginPath();
			ctx.moveTo(bound[0], bound[1]);

			for (let a = 2; a < bound.length; a += 2) {
				ctx.lineTo(bound[a], bound[a + 1]);
			}

			ctx.stroke();
		});

		ctx.restore();
	}
}
