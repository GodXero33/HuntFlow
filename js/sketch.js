import { loadMap } from "./map.loader.js";
import Snake from "./snake.js";
import SnakeMap from "./snake.map.js";

window['UltraSnake2D_debug_mode'] = 1; // 0 - normal(user view) | 1 - debugging type 1 | 2 - debugging type 2
window['UltraSnake2D_debug_modes_count'] = 3;

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const snake = new Snake();
const snakeMap = new SnakeMap(snake);

console.log(snakeMap);

let width, height;

let isPlaying = false;
let nextAnimationFrame = null;
let pauseOnBlur = false;

let prevTime = 0;
let deltaTime = 0;
let fpsUpdateCounter = 0;
let fps = '0.00 FPS';

let localData;

function draw () {
	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, width, height);

	snakeMap.draw(ctx);

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

function update () {
	snakeMap.update();
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
	prevTime = now;

	if (window['UltraSnake2D_debug_mode'] !== 0) updateFPS();

	update();
	draw();

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

	snake.canvasDimensions.x = width;
	snake.canvasDimensions.y = height;

	snakeMap.canvasDimensions.x = width;
	snakeMap.canvasDimensions.y = height;

	draw();
}

function init () {
	resize();
	play();
}

function updateDebugModeVariables () {
	if (window['UltraSnake2D_debug_mode'] == 1) {
		snakeMap.screenObjectsFilterOffset = 100;
	} else {
		snakeMap.screenObjectsFilterOffset = -200;
	}
}

window.addEventListener('resize', resize);

window.addEventListener('keyup', event => {
	if (event.code === 'Space') {
		isPlaying ? pause() : play();
		return;
	}

	if (event.code === 'KeyD') {
		window['UltraSnake2D_debug_mode'] = (window['UltraSnake2D_debug_mode'] + 1) % window['UltraSnake2D_debug_modes_count'];
		updateDebugModeVariables();
	}
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
	snake.mouse.x = event.x;
	snake.mouse.y = event.y;

	snake.mousedown = true;
});

window.addEventListener('mousemove', event => {
	if (snake.mousedown) {
		snake.mouse.x = event.x;
		snake.mouse.y = event.y;
	}
});

window.addEventListener('mouseup', () => {
	snake.mousedown = false;
});

function loadLocalData () {
	const localDataString = localStorage.getItem('ultra-snake-2d');

	if (localDataString == null) {
		localData = {
			mapIndex: 1
		};
	} else {
		localData = JSON.parse(localDataString);
	}

	localStorage.setItem('ultra-snake-2d', JSON.stringify(localData));
}

window.addEventListener('DOMContentLoaded', async () => {
	try {
		loadLocalData();

		const mapData = await loadMap(localData.mapIndex);

		console.log(mapData);
		await snakeMap.setMap(mapData);
		init();
	} catch (error) {
		console.error('Failed to start game: ', error);
	}
});
