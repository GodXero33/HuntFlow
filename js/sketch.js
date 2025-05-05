import Snake from "./snake.js";
import SnakeMap from "./snake.map.js";

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

let localData;

function draw () {
	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, width, height);

	snakeMap.draw(ctx);
}

function update () {
	snakeMap.update();
}

function animate () {
	const now = performance.now();
	deltaTime = now - prevTime;
	prevTime = now;

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

window.addEventListener('resize', resize);

window.addEventListener('keyup', event => {
	if (event.code === 'Space') {
		isPlaying ? pause() : play();
		return;
	}

	if (event.code === 'KeyD') {
		window['UltraSnake2D_in_debug'] = !window['UltraSnake2D_in_debug'];
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

async function loadMap (mapIndex) {
	return new Promise((resolve, reject) => {
		fetch(`maps/${mapIndex.toString().padStart(5, '0')}.json`).then(response => {
			if (!response) throw new Error('Failed to fetch map data');

			return response.json();
		}).then(mapData => resolve(mapData)).catch(error => reject(error));
	});
}

window.addEventListener('DOMContentLoaded', async () => {
	try {
		loadLocalData();

		const mapData = await loadMap(localData.mapIndex);

		console.log(mapData);
		snakeMap.setMap(mapData);
		init();
	} catch (error) {
		console.error('Failed to start game: ', error);
	}
});

window['UltraSnake2D_in_debug'] = true;
