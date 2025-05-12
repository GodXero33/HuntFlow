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

function isPointInsidePolygon (x, y, polygon) {
	let inside = false;

	for (let i = 0, j = polygon.length - 2; i < polygon.length; j = i, i += 2) {
		const xi = polygon[i], yi = polygon[i + 1];
		const xj = polygon[j], yj = polygon[j + 1];

		const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

		if (intersect) inside = !inside;
	}

	return inside;
}

function isPolygonsOverlapOrContain (polygon1, polygon2) {
	// Check for edge intersection
	for (let i = 0; i < polygon1.length - 2; i += 2) {
		const p1x1 = polygon1[i], p1y1 = polygon1[i + 1];
		const p1x2 = polygon1[i + 2], p1y2 = polygon1[i + 3];

		for (let j = 0; j < polygon2.length - 2; j += 2) {
			const p2x1 = polygon2[j],     p2y1 = polygon2[j + 1];
			const p2x2 = polygon2[j + 2], p2y2 = polygon2[j + 3];

			if (getIntersectionOfTwoLines(p1x1, p1y1, p1x2, p1y2, p2x1, p2y1, p2x2, p2y2)) return true;
		}
	}

	// Check if a point from polygon1 is inside polygon2
	if (isPointInsidePolygon(polygon1[0], polygon1[1], polygon2)) return true;

	// Check if a point from polygon2 is inside polygon1
	if (isPointInsidePolygon(polygon2[0], polygon2[1], polygon1)) return true;

	// No overlap or containment found
	return false;
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

class Vector {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	copy () {
		return new Vector(this.x, this.y);
	}

	add (v) {
		this.x += v.x;
		this.y += v.y;

		return this;
	}

	sub (v) {
		this.x -= v.x;
		this.y -= v.y;

		return this;
	}

	mult (scalar) {
		this.x *= scalar;
		this.y *= scalar;

		return this;
	}

	div (scalar) {
		if (scalar !== 0) {
			this.x /= scalar;
			this.y /= scalar;
		}

		return this;
	}

	dot (v) {
		return this.x * v.x + this.y * v.y;
	}

	mag () {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	magSq () {
		return this.x * this.x + this.y * this.y;
	}

	normalize () {
		const m = this.mag();

		if (m !== 0) this.div(m);

		return this;
	}

	static sub (v1, v2) {
		return new Vector(v1.x - v2.x, v1.y - v2.y);
	}

	static dist (v1, v2) {
		return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2);
	}

	setMag (mag) {
		this.normalize();
		this.mult(mag);

		return this;
	}

	heading () {
		return Math.atan2(this.y, this.x);
	}

	projectOntoLine (a, b) {
		const ap = Vector.sub(this, a);
		const ab = Vector.sub(b, a).normalize();
		const d = ap.dot(ab);

		return new Vector(a.x + ab.x * d, a.y + ab.y * d);
	}
}

export {
	getIntersectionOfTwoLines,
	isPolygonsOverlapOrContain,
	isPointInsidePolygon,
	lerp,
	inverseLerp,
	angleDifference,
	isTwoRectangleIntersecting,
	Vector
};
