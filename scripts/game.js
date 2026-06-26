const GAME_STATE = {
  MENU: 0,
  PLAYING: 1,
  PAUSED: 2,
};
var gameState = GAME_STATE.MENU;

var isGameOver = false;
var isWin = false;

function triggerGameOver() {
  if (isGameOver || isWin) return;
  isGameOver = true;
}

function triggerWin() {
  if (isGameOver || isWin) return;
  triggerGameOver();
  isWin = true;
}

function gameLoop(timestamp) {
  var dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;
  totalTime += dt;

  if (!isGameOver && !isWin) update(dt);
  render();

  requestAnimationFrame(gameLoop);
}

function update(dt) {
  if (gameState !== GAME_STATE.PLAYING) return;
  camera.move(dt);
  monster.update(dt);
  key.checkCatch();
  door.checkWin();
}

function startGame() {
  gameState = GAME_STATE.PLAYING;
  document.getElementById("menu").style.display = "none";
  document.getElementById("glcanvas1").requestPointerLock();
}

function returnMenu() {
  gameState = GAME_STATE.MENU;

  document.getElementById("pauseMenu").style.display = "none";
  document.getElementById("menu").style.display = "flex";

  document.exitPointerLock();
}

function openInstructions() {
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("instructionsPanel").classList.remove("hidden");
}

function closeInstructions() {
  document.getElementById("instructionsPanel").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
  document.getElementById("menu").classList.add("flex");
}

function leaveGame() {
  if (confirm("Deseja reiniciar o jogo?")) {
    location.reload();
  }
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

  if (monster.state === "chasing") {
    gl.uniform3fv(gl.getUniformLocation(prog, "lightColor"), [1, 0.3, 0.2]);
  } else if (monster.state === "idle" || monster.state === "hunting") {
    gl.uniform3fv(gl.getUniformLocation(prog, "lightColor"), [0.3, 0.4, 0.4]);
  }
  gl.uniform1i(gl.getUniformLocation(prog, "useSolidColor"), 0);
  drawScene(mproj, viewMat);

  handleKeyImage();

  if (isGameOver && isWin) {
    showVictory();
  }
  if (isGameOver && !isWin) {
    showGameOver();
  }

  if (monster.state !== "chasing") {
    idleAudio.play();
    chasingAudio.pause();
  } else if (monster.state === "chasing") {
    idleAudio.pause();
    chasingAudio.play();
  }
}

function checkCollision(cx, cz, radius, wall) {
  var nearX = Math.max(wall.minX, Math.min(cx, wall.maxX));
  var nearZ = Math.max(wall.minZ, Math.min(cz, wall.maxZ));
  var dx = cx - nearX;
  var dz = cz - nearZ;
  return dx * dx + dz * dz < radius * radius;
}

function setupMenuButtons() {
  const playBtn = document.getElementById("button-play");
  const instrBtn = document.getElementById("button-menu");
  const exitBtn = document.getElementById("button-exit");
  const restartBtn = document.getElementById("btnRestart");
  const nextBtn = document.getElementById("btnNext");
  const goToMenuBtn = document.getElementById("back-to-menu-button");

  if (playBtn) playBtn.addEventListener("click", startGame);
  if (instrBtn) instrBtn.addEventListener("click", openInstructions);
  if (exitBtn) exitBtn.addEventListener("click", leaveGame);
  if (goToMenuBtn) goToMenuBtn.addEventListener("click", closeInstructions);
  if (restartBtn) restartBtn.addEventListener("click", () => location.reload());
  if (nextBtn) nextBtn.addEventListener("click", () => location.reload());
}
