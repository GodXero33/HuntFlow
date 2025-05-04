export default class SnakeMap {
	constructor (snake) {
		this.snake = snake;
		this.map = [
			[200, 200, 200, 300]
		];
	}

	update (dt) {
		this.snake.update(dt, this.map);
	}

	draw (ctx, width, height) {
		ctx.save();
		ctx.translate(width * 0.5 - this.snake.camera.x, height * 0.5 - this.snake.camera.y);
		this.snake.draw(ctx);

		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 2;

		this.map.forEach(bound => {
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
