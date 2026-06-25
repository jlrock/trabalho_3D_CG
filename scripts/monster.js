const monster = {
  pos: [1.0, 0.0, -1.0],
  yaw: 0.0,
  state: "idle",
  idleTimer: 0.0,
  normalSpeed: 1.8,
  chaseSpeed: 4.0,
  radius: 0.3,
  detectRadius: 10.0,
  loseRadius: 16.0,
  killRadius: 0.7,

  distToPlayer() {
    const dx = this.pos[0] - camera.pos[0];
    const dz = this.pos[2] - camera.pos[2];
    return Math.sqrt(dx * dx + dz * dz);
  },

  facePlayer() {
    const dx = camera.pos[0] - this.pos[0];
    const dz = camera.pos[2] - this.pos[2];
    this.yaw = Math.atan2(dx, dz);
  },

  moveTowardPlayer(speed, dt) {
    const dx = camera.pos[0] - this.pos[0];
    const dz = camera.pos[2] - this.pos[2];
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.001) return;

    const stepX = (dx / len) * speed * dt;
    const stepZ = (dz / len) * speed * dt;

    this.facePlayer();

    let nextX = this.pos[0] + stepX;
    let blockedX = false;
    for (let i = 0; i < mapHitboxes.length; i++) {
      if (checkCollision(nextX, this.pos[2], this.radius, mapHitboxes[i])) {
        blockedX = true;
        break;
      }
    }
    if (!blockedX) this.pos[0] = nextX;

    let nextZ = this.pos[2] + stepZ;
    let blockedZ = false;
    for (let i = 0; i < mapHitboxes.length; i++) {
      if (checkCollision(this.pos[0], nextZ, this.radius, mapHitboxes[i])) {
        blockedZ = true;
        break;
      }
    }
    if (!blockedZ) this.pos[2] = nextZ;
  },

  update(dt) {
    if (this.state === "idle") {
      this.idleTimer += dt;
      if (this.idleTimer >= 5.0) this.state = "hunting";
      return;
    }

    const dist = this.distToPlayer();

    if (dist < this.killRadius) {
      triggerGameOver();
      return;
    }

    if (this.state === "hunting") {
      if (dist < this.detectRadius) this.state = "chasing";
      this.moveTowardPlayer(this.normalSpeed, dt);
    } else if (this.state === "chasing") {
      if (dist > this.loseRadius) this.state = "hunting";
      this.moveTowardPlayer(this.chaseSpeed, dt);
    }
  },

  getTransform() {
    return math.multiply(
      mat4Translate(this.pos[0], this.pos[1], this.pos[2]),
      math.multiply(mat4RotY(this.yaw), mat4Scale(0.75, 0.75, 0.75)),
    );
  },
};
