import { loadMapResources } from "./map.loader.js";
import { isTwoRectangleIntersecting, Vector } from "./util.js";

export default class SnakeMap {
	constructor (snake) {
		this.snake = snake;
		this.map = null;

		this.canvasDimensions = new Vector();
		this.isGameOver = false;

		this.screenObjects = [];
		this.screenObjectsFilterOffset = 200;

		this.cameraRect = { x: 0, y: 0, w: 0, h: 0 };
	}

	async setMap (map) {
		this.resources = await loadMapResources(map);
		this.map = map;

		map.objects.forEach(object => {
			if (object.bounds !== undefined) object.boundingRect = SnakeMap.getBoundingRect(object.bounds);
		});
	}

	update () {
		// Update camera rect
		this.cameraRect.x = this.snake.camera.x - this.canvasDimensions.x * 0.5 + this.screenObjectsFilterOffset * 0.5;
		this.cameraRect.y = this.snake.camera.y - this.canvasDimensions.y * 0.5 + this.screenObjectsFilterOffset * 0.5;
		this.cameraRect.w = this.canvasDimensions.x - this.screenObjectsFilterOffset;
		this.cameraRect.h = this.canvasDimensions.y - this.screenObjectsFilterOffset;

		this.screenObjects = this.map.objects.filter(object => object.boundingRect && isTwoRectangleIntersecting(object.boundingRect, this.cameraRect));

		if (!this.isGameOver) this.snake.update(this.screenObjects.map(object => object.bounds));
		if (this.snake.isIntersectedWithBound) this.isGameOver = true;
	}

	drawDebug (ctx) {
		// draw bounding rects
		ctx.strokeStyle = '#f00';
		ctx.setLineDash([5, 10]);

		this.screenObjects.forEach(object => {
			if (!object.boundingRect) return;

			ctx.strokeRect(object.boundingRect.x, object.boundingRect.y, object.boundingRect.w, object.boundingRect.h);
		});

		ctx.setLineDash([]);

		// draw camera
		const offset = this.screenObjectsFilterOffset / 2;

		ctx.strokeStyle = '#0f0';
		ctx.strokeRect(this.cameraRect.x, this.cameraRect.y, this.cameraRect.w, this.cameraRect.h);
	}

	draw (ctx) {
		ctx.save();
		ctx.translate(this.canvasDimensions.x * 0.5 - this.snake.camera.x, this.canvasDimensions.y * 0.5 - this.snake.camera.y);
		this.snake.draw(ctx);

		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 2;

		this.screenObjects.forEach(object => {
			const bound = object.bounds;

			ctx.beginPath();
			ctx.moveTo(bound[0], bound[1]);

			for (let a = 2; a < bound.length; a += 2)
				ctx.lineTo(bound[a], bound[a + 1]);

			ctx.stroke();
		});

		if (window['UltraSnake2D_in_debug']) this.drawDebug(ctx);

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

		return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
	}
}
