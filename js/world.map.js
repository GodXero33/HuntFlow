import { loadMapResources } from "./map.loader.js";
import { isTwoRectangleIntersecting, Vector } from "./util.js";

export default class WorldMap {
	constructor (player) {
		this.player = player;
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
			if (object.bounds !== undefined) object.boundingRect = WorldMap.getBoundingRect(object.bounds);
		});
	}

	update (deltaTime) {
		// Update camera rect
		this.cameraRect.x = this.player.camera.x - this.canvasDimensions.x * 0.5 + this.screenObjectsFilterOffset * 0.5;
		this.cameraRect.y = this.player.camera.y - this.canvasDimensions.y * 0.5 + this.screenObjectsFilterOffset * 0.5;
		this.cameraRect.w = this.canvasDimensions.x - this.screenObjectsFilterOffset;
		this.cameraRect.h = this.canvasDimensions.y - this.screenObjectsFilterOffset;

		this.screenObjects = this.map.objects.filter(object => object.boundingRect && isTwoRectangleIntersecting(object.boundingRect, this.cameraRect));

		if (!this.isGameOver) this.player.update(deltaTime, this.screenObjects.map(object => object.bounds));
		if (this.player.isIntersectedWithBound) this.isGameOver = true;
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
		ctx.strokeStyle = '#0f0';
		ctx.strokeRect(this.cameraRect.x, this.cameraRect.y, this.cameraRect.w, this.cameraRect.h);
	}

	draw (ctx) {
		ctx.save();
		ctx.translate(this.canvasDimensions.x * 0.5 - this.player.camera.x, this.canvasDimensions.y * 0.5 - this.player.camera.y);
		this.player.draw(ctx);

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

		if (window['UltraSnake2D_debug_mode'] === 1) this.drawDebug(ctx);

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
