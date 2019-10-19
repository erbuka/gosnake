class Vec2 {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    mulScalar(k) {
        this.x *= k;
        this.y *= k;
        return this;
    }

    copy(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
    }

    clone() {
        return new Vec2(this.x, this.y);
    }

    equals(v) {
        return this.x === v.x && this.y === v.y;
    }

}