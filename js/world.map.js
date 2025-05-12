import DummyCreature from "./dummy.creature.js";
import { loadMapResources } from "./map.loader.js";
import { isPolygonsOverlapOrContain, isTwoRectangleIntersecting, Vector } from "./util.js";

export default class WorldMap {
	constructor (player) {
		this.player = player;
		this.map = null;
		this.canvasDimensions = new Vector();

		this.visibleObjects = [];
		this.visibleObjectsFilterOffset = 200;
		this.updateObjectsFilterOffset = 200;

		this.dynamicObjects = [];
		this.updatableDynamicObjects = [];
		this.visibleDynamicObjects = [];

		this.cameraRect = { x: 0, y: 0, w: 0, h: 0 };
		this.rotatedCameraRect = { x: 0, y: 0, w: 0, h: 0 };

		this.updatableCameraRect = { x: 0, y: 0, w: 0, h: 0 };
		this.rotatedUpdatableCameraRect = { x: 0, y: 0, w: 0, h: 0 };

		this.scaleFactor = 1;
	}

	async setMap (map) {
		this.resources = await loadMapResources(map);
		this.map = map;

		map.objects.forEach(object => {
			if (object.bounds !== undefined) object.boundingRect = WorldMap.getBoundingRect(object.bounds);
		});
	}

	getRotatedCameraRect (cameraRect, angle) {
		const corners = [
			{x: cameraRect.x, y: cameraRect.y},
			{x: cameraRect.x + cameraRect.w, y: cameraRect.y},
			{x: cameraRect.x, y: cameraRect.y + cameraRect.h},
			{x: cameraRect.x + cameraRect.w, y: cameraRect.y + cameraRect.h}
		];

		const cx = cameraRect.x + cameraRect.w / 2;
		const cy = cameraRect.y + cameraRect.h / 2;

		const cos = Math.cos(angle);
		const sin = Math.sin(angle);

		const rotatedCorners = corners.map(corner => {
			const dx = corner.x - cx;
			const dy = corner.y - cy;

			const newX = cx + dx * cos - dy * sin;
			const newY = cy + dx * sin + dy * cos;

			return {x: newX, y: newY};
		});

		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

		rotatedCorners.forEach(corner => {
			if (minX > corner.x) minX = corner.x;
			if (minY > corner.y) minY = corner.y;
			if (maxX < corner.x) maxX = corner.x;
			if (maxY < corner.y) maxY = corner.y;
		});

		return {x: minX, y: minY, w: maxX - minX, h: maxY - minY};
	}

	update (deltaTime) {
		// Update camera rect
		const scaledCanvasW = this.canvasDimensions.x / this.scaleFactor;
		const scaledCanvasH = this.canvasDimensions.y / this.scaleFactor;
		const scaledOffsetForVisible = this.visibleObjectsFilterOffset / this.scaleFactor;
		const scaledOffsetForUpdate = this.updateObjectsFilterOffset / this.scaleFactor;

		this.cameraRect.x = this.player.position.x - scaledCanvasW * 0.5 + scaledOffsetForVisible * 0.5;
		this.cameraRect.y = this.player.position.y - scaledCanvasH * 0.5 + scaledOffsetForVisible * 0.5;
		this.cameraRect.w = scaledCanvasW - scaledOffsetForVisible;
		this.cameraRect.h = scaledCanvasH - scaledOffsetForVisible;

		this.updatableCameraRect.x = this.player.position.x - scaledCanvasW * 0.5 + scaledOffsetForUpdate * 0.5;
		this.updatableCameraRect.y = this.player.position.y - scaledCanvasH * 0.5 + scaledOffsetForUpdate * 0.5;
		this.updatableCameraRect.w = scaledCanvasW - scaledOffsetForUpdate;
		this.updatableCameraRect.h = scaledCanvasH - scaledOffsetForUpdate;

		this.rotatedCameraRect = this.getRotatedCameraRect(this.cameraRect, -this.player.rotation);
		this.rotatedUpdatableCameraRect = this.getRotatedCameraRect(this.updatableCameraRect, -this.player.rotation);

		this.visibleObjects = this.map.objects.filter(object => object.boundingRect && isTwoRectangleIntersecting(object.boundingRect, this.rotatedCameraRect));

		this.updatableDynamicObjects = this.dynamicObjects.filter(object => {
			const boundingRect = WorldMap.getBoundingRect(object.bounds);
			return isTwoRectangleIntersecting(boundingRect, this.rotatedUpdatableCameraRect);
		});

		if (this.player.isTorchOn) {
			this.visibleDynamicObjects = this.updatableDynamicObjects.filter(object => isPolygonsOverlapOrContain(object.bounds, this.player.torch.polygon));
		} else {
			this.visibleDynamicObjects = [];
		}

		this.player.update(deltaTime, this.visibleObjects.map(object => object.bounds));
		this.updatableDynamicObjects.forEach(object => object.update(deltaTime));
	}

	drawDebug (ctx) {
		// draw bounding rects
		ctx.strokeStyle = '#f00';
		ctx.setLineDash([5, 10]);

		this.visibleDynamicObjects.forEach(object => {
			if (!object.boundingRect) return;

			ctx.strokeRect(object.boundingRect.x, object.boundingRect.y, object.boundingRect.w, object.boundingRect.h);
		});

		ctx.setLineDash([]);

		// draw camera
		const transform = ctx.getTransform();

		ctx.translate(this.player.position.x, this.player.position.y);
		ctx.rotate(this.player.rotation);
		ctx.strokeStyle = '#0f0';
		ctx.strokeRect((-this.canvasDimensions.x * 0.5 + this.visibleObjectsFilterOffset * 0.5 ) / this.scaleFactor, (-this.canvasDimensions.y * 0.5 + this.visibleObjectsFilterOffset * 0.5) / this.scaleFactor, this.cameraRect.w, this.cameraRect.h);
		ctx.setTransform(transform);

		ctx.strokeStyle = '#00f';
		ctx.strokeRect(this.rotatedCameraRect.x, this.rotatedCameraRect.y, this.rotatedCameraRect.w, this.rotatedCameraRect.h);

		this.dynamicObjects.forEach(object => object.drawDebug(ctx));
	}

	draw (ctx) {
		ctx.save();
		ctx.translate(this.canvasDimensions.x * 0.5, this.canvasDimensions.y * 0.5);
		ctx.rotate(-this.player.rotation);
		ctx.scale(this.scaleFactor, this.scaleFactor);
		ctx.translate(-this.player.position.x, -this.player.position.y);
		this.player.draw(ctx);

		ctx.strokeStyle = '#ffffff22';
		ctx.lineWidth = 2;

		this.visibleObjects.forEach(object => {
			const bound = object.bounds;

			ctx.beginPath();
			ctx.moveTo(bound[0], bound[1]);

			for (let a = 2; a < bound.length; a += 2)
				ctx.lineTo(bound[a], bound[a + 1]);

			ctx.stroke();
		});

		this.visibleDynamicObjects.forEach(object => object.draw(ctx));

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

	updateScaleFactor () {
		this.scaleFactor = this.canvasDimensions.y * 2 / this.player.visionRange;
	}
}
