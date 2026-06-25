var isGameOver = false;

function triggerGameOver() {
  if (isGameOver) return;
  isGameOver = true;
}

function gameLoop(timestamp) {
  var dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;
  totalTime += dt;

  if (!isGameOver) update(dt);
  render();

  requestAnimationFrame(gameLoop);
}

function update(dt) {
  camera.move(dt);
  monster.update(dt);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var aspect = gl.canvas.width / gl.canvas.height;
  var mproj = createPerspective(70, aspect, 0.1, 100);
  var viewMat = camera.getViewMatrix();

  var front = camera.getFront();
  gl.uniform3fv(gl.getUniformLocation(prog, "lightpos"), camera.pos);
  gl.uniform3fv(gl.getUniformLocation(prog, "lightDirection"), front);
  gl.uniform3fv(gl.getUniformLocation(prog, "campos"), camera.pos);

  drawScene(mproj, viewMat);
}

function checkCollision(cx, cz, radius, wall) {
  var nearX = Math.max(wall.minX, Math.min(cx, wall.maxX));
  var nearZ = Math.max(wall.minZ, Math.min(cz, wall.maxZ));
  var dx = cx - nearX;
  var dz = cz - nearZ;
  return dx * dx + dz * dz < radius * radius;
}