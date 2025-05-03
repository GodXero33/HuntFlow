const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

let width, height;

let isPlaying = false;
let nextAnimationFrame = null;

let prevTime = 0;
let deltaTime = 0;

function draw () {
	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, width, height);
}

function update () {}

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
	if (event.code === 'Space') isPlaying ? pause() : play();
});
