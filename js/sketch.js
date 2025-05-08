import { loadMap } from "./map.loader.js";
import { Player } from "./player.js";
import WorldMap from "./world.map.js";

window['UltraSnake2D_debug_mode'] = 1; // 0 - normal(user view) | 1 - debugging type 1 | 2 - debugging type 2
window['UltraSnake2D_debug_modes_count'] = 3;

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const player = new Player();
const worldMap = new WorldMap(player);

console.log(worldMap);

let width, height;

let isPlaying = false;
let nextAnimationFrame = null;
let pauseOnBlur = false;

const controlFps = 60;
const frameDuration = 1000 / controlFps;
let accumulator = 0;
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
	const elapsed = now - prevTime;
	prevTime = now;
	accumulator += elapsed;

	while (accumulator >= frameDuration) {
		deltaTime = frameDuration;

		update(deltaTime);
		draw();

		accumulator -= frameDuration;
	}

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
		worldMap.screenObjectsFilterOffset = 100;
	} else {
		worldMap.screenObjectsFilterOffset = -200;
	}
}

window.addEventListener('resize', resize);

window.addEventListener('keydown', event => {
	if (event.code === 'KeyW') player.controls.forward = true;
	if (event.code === 'KeyS') player.controls.backward = true;
	if (event.code === 'KeyD') player.controls.turnRight = true;
	if (event.code === 'KeyA') player.controls.turnLeft = true;
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
	if (event.code === 'KeyD') player.controls.turnRight = false;
	if (event.code === 'KeyA') player.controls.turnLeft = false;
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

window.addEventListener('mousedown', event => {
	
});

window.addEventListener('mousemove', event => {
	
});

window.addEventListener('mouseup', () => {
	
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
