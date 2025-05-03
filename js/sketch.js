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

let prevTime = 0;
let deltaTime = 0;

function draw () {
	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, width, height);

	ctx.save();
	snakeMap.draw(ctx);
	ctx.restore();
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
