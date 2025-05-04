export default class Vector {
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
