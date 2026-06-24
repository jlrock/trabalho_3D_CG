function gameLoop(timestamp) {
  var dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;
  totalTime += dt;

  update(dt);
  render();

  requestAnimationFrame(gameLoop);
}

function update(dt) {
  camera.move(dt);
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

function checkCollision(camX, camZ, radius, wall) {
  let pontoMaisProximoX = Math.max(wall.minX, Math.min(camX, wall.maxX));
  let pontoMaisProximoZ = Math.max(wall.minZ, Math.min(camZ, wall.maxZ));
  let distanciaX = camX - pontoMaisProximoX;
  let distanciaZ = camZ - pontoMaisProximoZ;
  let distanciaAoQuadrado = distanciaX * distanciaX + distanciaZ * distanciaZ;
  return distanciaAoQuadrado < radius * radius;
}