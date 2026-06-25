const door = {
  pos: [0.0, 0.0, -8.0],
  yaw: 0.0,
  baseColor: [0.05, 0.95, 0.45],
  winRadius: 1.5,
  buffer: null,
  vertexCount: 0,

  build() {
    const hw = 0.6;
    const h = 2.2;
    const v = [];

    v.push(
      ...makeQuad(
        [-hw, h, 0.0],
        [-hw, 0.0, 0.0],
        [hw, 0.0, 0.0],
        [hw, h, 0.0],
        [0, 0, 1],
        1,
        1,
      ),
    );

    v.push(
      ...makeQuad(
        [hw, h, 0.0],
        [hw, 0.0, 0.0],
        [-hw, 0.0, 0.0],
        [-hw, h, 0.0],
        [0, 0, -1],
        1,
        1,
      ),
    );

    const data = new Float32Array(v);
    this.vertexCount = data.length / 8;
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  },

  getTransform() {
    const pulse = Math.sin(totalTime * 2.0);
    const scaleY = 1.0 + 0.06 * pulse;
    return math.multiply(
      mat4Translate(this.pos[0], this.pos[1], this.pos[2]),
      math.multiply(mat4RotY(this.yaw), mat4Scale(1.0, scaleY, 1.0)),
    );
  },

  getCurrentColor() {
    const brightness = 0.7 + 0.3 * Math.sin(totalTime * 2.0);
    return [
      this.baseColor[0] * brightness,
      this.baseColor[1] * brightness,
      this.baseColor[2] * brightness,
    ];
  },

  draw(projMat, viewMat) {
    drawObject(
      this.buffer,
      this.vertexCount,
      this.getTransform(),
      projMat,
      viewMat,
      0,
      true,
      this.getCurrentColor(),
    );
  },

  checkWin() {
    if (isWin) return;
    const dx = this.pos[0] - camera.pos[0];
    const dz = this.pos[2] - camera.pos[2];
    if (Math.sqrt(dx * dx + dz * dz) < this.winRadius) {
      triggerWin();
    }
  },
};
