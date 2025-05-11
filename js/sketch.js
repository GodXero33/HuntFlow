import { loadMap } from "./map.loader.js";
import { Player } from "./player.js";
import WorldMap from "./world.map.js";

window['UltraSnake2D_debug_mode'] = 1; // 0 - normal(user view) | 1 - debugging type 1 | 2 - debugging type 2
window['UltraSnake2D_debug_modes_count'] = 3;

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const player = new Player();
const worldMap = new WorldMap(player);

console.log(worldMap, navigator.userAgentData);

let width, height;

let isPlaying = false;
let isPointerLocked = false;
let nextAnimationFrame = null;
let pauseOnBlur = false;
let isGameOver = false;

let prevTime = 0;
let deltaTime = 0;
let fpsUpdateCounter = 0;
let fps = '0.00 FPS';

let localData;

function draw () {
	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, width, height);

	worldMap.draw(ctx);

	if (window['UltraSnake2D_debug_mode'] !== 0) {
		ctx.font = 'bold 20px Verdana';
		ctx.textBaseline = 'middle';

		const measure = ctx.measureText(fps);

		ctx.fillStyle = '#ff0000';
		ctx.fillRect(0, 0, measure.width + 20, 40);

		ctx.fillStyle = '#ffffff';
		ctx.fillText(fps, 10, 20);
	}
}

function update (deltaTime) {
	if (isGameOver) return;

	worldMap.update(deltaTime);
}

function updateFPS () {
	if (fpsUpdateCounter < 20) {
		fpsUpdateCounter++;
		return;
	}

	fpsUpdateCounter = 0;
	fps = `${(1000 / deltaTime).toFixed(2)} FPS`;
}

function animate () {
	const now = performance.now();
	deltaTime = now - prevTime;

	update(deltaTime);
	draw();

	prevTime = now;

	if (window['UltraSnake2D_debug_mode'] !== 0) updateFPS();

	nextAnimationFrame = requestAnimationFrame(animate);
}

function play () {
	if (pauseOnBlur) return;

	prevTime = performance.now();
	deltaTime = 0;
	isPlaying = true;

	animate();
}

function pause () {
	isPlaying = false;
	cancelAnimationFrame(nextAnimationFrame);
}

function resize () {
	width = canvas.parentElement.offsetWidth;
	height = canvas.parentElement.offsetHeight;

	canvas.width = width;
	canvas.height = height;

	player.canvasDimensions.x = width;
	player.canvasDimensions.y = height;

	worldMap.canvasDimensions.x = width;
	worldMap.canvasDimensions.y = height;

	worldMap.updateScaleFactor();

	draw();
}

function init () {
	player.setPlayerData({
		size: 40,
		bounds: [-18, -18, 18, -18, 18, 18, -18, 18, -18, -18]
	});

	resize();
	play();
}

function updateDebugModeVariables () {
	if (window['UltraSnake2D_debug_mode'] == 1) {
		worldMap.visibleObjectsFilterOffset = 100;
	} else {
		worldMap.visibleObjectsFilterOffset = -200;
	}
}

window.addEventListener('resize', resize);

window.addEventListener('keydown', event => {
	if (!isPointerLocked) return;

	if (event.code === 'KeyW') player.controls.forward = true;
	if (event.code === 'KeyS') player.controls.backward = true;
	if (event.code === 'KeyD') player.controls.right = true;
	if (event.code === 'KeyA') player.controls.left = true;
});

window.addEventListener('keyup', event => {
	if (event.code === 'Space') {
		isPlaying ? pause() : play();
		return;
	}

	if (event.code === 'KeyF') {
		window['UltraSnake2D_debug_mode'] = (window['UltraSnake2D_debug_mode'] + 1) % window['UltraSnake2D_debug_modes_count'];
		updateDebugModeVariables();
	}

	if (event.code === 'KeyW') player.controls.forward = false;
	if (event.code === 'KeyS') player.controls.backward = false;
	if (event.code === 'KeyD') player.controls.right = false;
	if (event.code === 'KeyA') player.controls.left = false;
});

window.addEventListener('blur', () => {
	pauseOnBlur = true;

	cancelAnimationFrame(nextAnimationFrame);
});

window.addEventListener('focus', () => {
	if (pauseOnBlur && isPlaying) {
		prevTime = performance.now();
		deltaTime = 0;

		animate();
	}

	pauseOnBlur = false;
});

window.addEventListener('mousemove', event => {
	if (isPointerLocked) player.rotateBy(event.movementX);
});

document.addEventListener("pointerlockchange", () => {
	if (document.pointerLockElement === canvas) {
		// play();
		isPointerLocked = true;
		console.log("The pointer lock status is now locked");
	} else {
		// pause();
		isPointerLocked = false;
		console.log("The pointer lock status is now unlocked");
	}
}, false);

document.addEventListener("pointerlockerror", () => {
	console.error("Pointer lock failed");
}, false);

canvas.addEventListener("click", async () => {
	if (isPointerLocked) {
		// in game click action
		return;
	}

	if (!document.pointerLockElement) {
		await canvas.requestPointerLock({
			unadjustedMovement: true
		});
	}
});

function loadLocalData () {
	const localDataString = localStorage.getItem('HuntFlow-data');

	if (localDataString == null) {
		localData = {
			mapIndex: 1
		};
	} else {
		localData = JSON.parse(localDataString);
	}

	localStorage.setItem('HuntFlow-data', JSON.stringify(localData));
}

window.addEventListener('DOMContentLoaded', async () => {
	try {
		loadLocalData();

		const mapData = await loadMap(localData.mapIndex);

		console.log(mapData);
		await worldMap.setMap(mapData);
		init();
	} catch (error) {
		console.error('Failed to start game: ', error);
	}
});
