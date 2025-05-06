const DELTA_THRESHOLD = 1e-6;

function lerp (factor, min, max) {
	return min + (max - min) * factor;
}

function inverseLerp (value, min, max) {
	if (min == max) {
		return 0;
	}

	return (value - min) / (max - min);
}

function getIntersectionOfTwoLines (x1, y1, x2, y2, x3, y3, x4, y4, returnAnyway = false) {
	//  x1,  y1,  x2,  y2,  x3,  y3,  x4,  y4
	// a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y
	// Calculate the top parts of t and u in the parametric equations
	const tTop = (y1 - y3) * (x4 - x3) - (y4 - y3) * (x1 - x3);
	const uTop = (y3 - y1) * (x1 - x2) - (x3 - x1) * (y1 - y2);

	// Calculate the denominator of the parametric equations
	const denominator = (x2 - x1) * (y4 - y3) - (x4 - x3) * (y2 - y1);

	let t, u;

	// Check if the lines are not parallel
	if (Math.abs(denominator) > DELTA_THRESHOLD) {
		t = tTop / denominator;
		u = uTop / denominator;

		// Check if the intersection point lies within both line segments
		if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
			// Calculate and return the intersection point along with t and u values
			return [lerp(t, x1, x2), lerp(t, y1, y2), t, u];
		}
	}

	// Calculate and return the intersection point along with t and u values even lines are parallel
	if (returnAnyway) {
		return [lerp(t, x1, x2), lerp(t, y1, y2), t, u];
	}

	return null;
}

function angleDifference (a, b) {
	let diff = a - b;

	while (diff > Math.PI) diff -= Math.PI * 2;
	while (diff < -Math.PI) diff += Math.PI * 2;

	return diff;
}

function isTwoRectangleIntersecting (rect1, rect2) {
	return rect1.x < rect2.x + rect2.w &&
		rect1.x + rect1.w > rect2.x &&
		rect1.y < rect2.y + rect2.h &&
		rect1.y + rect1.h > rect2.y;
}

export {
	getIntersectionOfTwoLines,
	lerp,
	inverseLerp,
	angleDifference,
	isTwoRectangleIntersecting
};
