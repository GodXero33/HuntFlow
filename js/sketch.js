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

function draw () {
	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, width, height);

	snakeMap.draw(ctx, width, height);
}

function update () {
	snakeMap.update(deltaTime);
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

	draw();
}

resize();
play();

window.addEventListener('resize', resize);

window.addEventListener('keyup', event => {
	const code = event.code;

	if (event.code === 'Space') {
		isPlaying ? pause() : play();
		return;
	}

	if (code === 'KeyA') {
		snake.turnLeft = false;
		return;
	}

	if (code === 'KeyD') snake.turnRight = false;
});

window.addEventListener('keydown', event => {
	const code = event.code;

	if (code === 'KeyA') {
		snake.turnLeft = true;
		return;
	}

	if (code === 'KeyD') snake.turnRight = true;
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
