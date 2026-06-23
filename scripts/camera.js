const camera = {
  pos: [0.0, 1.7, 0.0],
  yaw: Math.PI,
  pitch: 0.0,
  speed: 5,

  getFront() {
    return [
      Math.cos(this.pitch) * Math.sin(this.yaw),
      Math.sin(this.pitch),
      Math.cos(this.pitch) * Math.cos(this.yaw),
    ];
  },

  getRight() {
    const front = this.getFront();
    const up = [0, 1, 0];
    const right = math.cross(front, up);
    return math.divide(right, math.norm(right));
  },

  move(keys) {
    const front = this.getFront();
    const right = this.getRight();
    const frontXZ = math.divide(
      [front[0], 0, front[2]],
      math.norm([front[0], 0, front[2]]),
    );
    if (keys["w"])
      this.pos = math.add(this.pos, math.multiply(frontXZ, this.speed));
    if (keys["s"])
      this.pos = math.subtract(this.pos, math.multiply(frontXZ, this.speed));
    if (keys["a"])
      this.pos = math.subtract(this.pos, math.multiply(right, this.speed));
    if (keys["d"])
      this.pos = math.add(this.pos, math.multiply(right, this.speed));
  },

  look(dx, dy) {
    this.yaw -= dx * 0.002;
    this.pitch -= dy * 0.002;
    this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));
  },

  look(dx, dy) {
    this.yaw -= dx * 0.002;
    this.pitch -= dy * 0.002;
    this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));
  },

  getViewMatrix() {
    const front = this.getFront();
    const target = math.add(this.pos, front);
    const up = [0, 1, 0];
    return createCamera(this.pos, target, up);
  },
};
