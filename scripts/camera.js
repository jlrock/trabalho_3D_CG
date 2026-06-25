const camera = {
  pos: [0.0, 0.7, 0.0],
  yaw: Math.PI,
  pitch: 0.0,
  speed: 2.5,

  reset() {
    this.pos = [0.0, 0.7, 0.0];
    this.yaw = Math.PI;
    this.pitch = 0.0;
  },

  getFront() {
    return [
      Math.cos(this.pitch) * Math.sin(this.yaw),
      Math.sin(this.pitch),
      Math.cos(this.pitch) * Math.cos(this.yaw),
    ];
  },

  getRight() {
    var f = this.getFront();
    var len = Math.sqrt(f[0] * f[0] + f[2] * f[2]);
    if (len < 0.0001) return [1, 0, 0];
    return [-f[2] / len, 0, f[0] / len];
  },

  move(dt) {
    var f = this.getFront();
    var r = this.getRight();
    var dist = this.speed * dt;

    var fLen = Math.sqrt(f[0] * f[0] + f[2] * f[2]);
    var fx = fLen > 0.0001 ? f[0] / fLen : 0;
    var fz = fLen > 0.0001 ? f[2] / fLen : 0;

    if (keys["w"] || keys["arrowup"]) {
      this.pos[0] += fx * dist;
      this.pos[2] += fz * dist;
    }
    if (keys["s"] || keys["arrowdown"]) {
      this.pos[0] -= fx * dist;
      this.pos[2] -= fz * dist;
    }
    if (keys["a"] || keys["arrowleft"]) {
      this.pos[0] -= r[0] * dist;
      this.pos[2] -= r[2] * dist;
    }
    if (keys["d"] || keys["arrowright"]) {
      this.pos[0] += r[0] * dist;
      this.pos[2] += r[2] * dist;
    }
  },

  look(dx, dy) {
    this.yaw -= dx * 0.002;
    this.pitch -= dy * 0.002;
    this.pitch = Math.max(
      -Math.PI * 0.45,
      Math.min(Math.PI * 0.45, this.pitch),
    );
  },

  getViewMatrix() {
    var f = this.getFront();
    return createCamera(
      this.pos,
      [this.pos[0] + f[0], this.pos[1] + f[1], this.pos[2] + f[2]],
      [0, 1, 0],
    );
  },
};
