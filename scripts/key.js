var isKeyCaught = false;

const key = {
  pos: [-6.3, 0.0, -3.2],
  yaw: 0.0,
  radius: 0.5,

  reset() {
    this.pos = [-6.3, 0.0, -3.2];
    isKeyCaught = false;
  },

  getTransform() {
    const pulse = Math.sin(totalTime * 2.0);
    const scaleY = 1.0 + 0.06 * pulse;
    return math.multiply(
      mat4Translate(this.pos[0], this.pos[1], this.pos[2]),
      math.multiply(mat4RotY(this.yaw), mat4Scale(1.0, scaleY, 1.0)),
    );
  },

  triggerCatchKey() {
    if (isKeyCaught) return;
    isKeyCaught = true;
  },

  checkCatch() {
    if (isKeyCaught) return;
    const dx = this.pos[0] - camera.pos[0];
    const dz = this.pos[2] - camera.pos[2];
    if (Math.sqrt(dx * dx + dz * dz) < this.radius) {
      this.triggerCatchKey();
    }
  },
};
