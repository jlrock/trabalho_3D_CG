const key = {
  pos: [-6.3, 0.0, -3.2],
  yaw: 0.0,

  getTransform() {
    const pulse = Math.sin(totalTime * 2.0);
    const scaleY = 1.0 + 0.06 * pulse;
    return math.multiply(
      mat4Translate(this.pos[0], this.pos[1], this.pos[2]),
      math.multiply(mat4RotY(this.yaw), mat4Scale(1.0, scaleY, 1.0)),
    );
  },
};
