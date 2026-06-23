var scene = {};

async function setupScene() {
  var map = await loadOBJ("assets/models/backrooms.obj");

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, map.buffer, gl.STATIC_DRAW);

  scene.map = { vertexCount: map.vertexCount, buffer: buf };
}

function drawScene(projMat, viewMat) {
  drawObject(
    scene.map.buffer,
    scene.map.vertexCount,
    mat4Identity(),
    projMat,
    viewMat,
    0,
    false,
    null,
  );
}