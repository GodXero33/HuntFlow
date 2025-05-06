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
		this.bounds = map.objects.filter(object => object.bounds !== undefined).map(object => {
			object.boundingRect = SnakeMap.getBoundingRect(object.bounds);
			return object.bounds;
		});
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

			for (let a = 2; a < bound.length; a += 2)
				ctx.lineTo(bound[a], bound[a + 1]);

			ctx.stroke();
		});

		if (window['UltraSnake2D_in_debug']) {
			this.map.objects.forEach(object => {
				if (!object.boundingRect) return;

				ctx.strokeStyle = '#f00';
				ctx.strokeRect(...object.boundingRect);
			});
		}

		ctx.restore();
	}

	static getBoundingRect (bounds) {
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;

		for (let a = 0; a < bounds.length; a += 2) {
			const x = bounds[a];
			const y = bounds[a + 1];

			if (minX > x) minX = x;
			if (minY > y) minY = y;

			if (maxX < x) maxX = x;
			if (maxY < y) maxY = y;
		}

		return [minX, minY, maxX - minX, maxY - minY];
	}
}
