const camera = {
  pos: [0.0, 0.7, 0.0],
  yaw: Math.PI,
  pitch: 0.0,
  speed: 2.5,
  radius: 0.1,

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

    let dx = 0;
    let dz = 0;

    if (keys["w"] || keys["arrowup"]) {
      dx += fx * dist;
      dz += fz * dist;
    }
    if (keys["s"] || keys["arrowdown"]) {
      dx -= fx * dist;
      dz -= fz * dist;
    }
    if (keys["a"] || keys["arrowleft"]) {
      dx -= r[0] * dist;
      dz -= r[2] * dist;
    }
    if (keys["d"] || keys["arrowright"]) {
      dx += r[0] * dist;
      dz += r[2] * dist;
    }

    let futuraPosicaoX = this.pos[0] + dx;
    let colidiuNoX = false;

    for (let i = 0; i < mapHitboxes.length; i++) {
      if (
        checkCollision(futuraPosicaoX, this.pos[2], this.radius, mapHitboxes[i])
      ) {
        colidiuNoX = true;
        break;
      }
    }
    if (!colidiuNoX) {
      this.pos[0] = futuraPosicaoX;
    }

    let futuraPosicaoZ = this.pos[2] + dz;
    let colidiuNoZ = false;

    for (let i = 0; i < mapHitboxes.length; i++) {
      if (
        checkCollision(this.pos[0], futuraPosicaoZ, this.radius, mapHitboxes[i])
      ) {
        colidiuNoZ = true;
        break;
      }
    }
    if (!colidiuNoZ) {
      this.pos[2] = futuraPosicaoZ;
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
