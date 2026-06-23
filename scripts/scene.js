async function setupScene() {
  const map = await loadOBJ("assets/models/backrooms.obj");

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, map.buffer, gl.STATIC_DRAW);

  connectAtrib("position", 3, 8 * 4, 0);
  connectAtrib("texCoord", 2, 8 * 4, 3 * 4);
  connectAtrib("normal", 3, 8 * 4, 5 * 4);

  scene.map = { vertexCount: map.vertexCount, buffer: buf };
}

function connectAtrib(name, size, stride, offset) {
  var ptr = gl.getAttribLocation(prog, name);
  gl.enableVertexAttribArray(ptr);
  gl.vertexAttribPointer(ptr, size, gl.FLOAT, false, stride, offset);
}
