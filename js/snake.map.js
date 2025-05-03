export default class SnakeMap {
	constructor (snake) {
		this.snake = snake;
	}

	update (dt) {
		this.snake.update(dt);
	}

	draw (ctx) {
		this.snake.draw(ctx);
	}
}
