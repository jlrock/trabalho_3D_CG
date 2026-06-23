const keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});
document.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

const canvas = document.getElementById("glcanvas1");

canvas.addEventListener("click", () => {
  canvas.requestPointerLock();
});

document.addEventListener("mousemove", (e) => {
  if (document.pointerLockElement === canvas) {
    camera.look(e.movementX, e.movementY);
  }
});

document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement === canvas) {
    console.log("Mouse capturado — ESC para soltar");
  }
});

function initInput() {
  document.addEventListener("keydown", function (e) {
    keys[e.key.toLowerCase()] = true;
    if (
      ["arrowup", "arrowdown", "arrowleft", "arrowright", " "].indexOf(
        e.key.toLowerCase(),
      ) !== -1
    ) {
      e.preventDefault();
    }
  });
  document.addEventListener("keyup", function (e) {
    keys[e.key.toLowerCase()] = false;
  });

  var canvas = document.getElementById("glcanvas1");
  canvas.addEventListener("click", function () {
    canvas.requestPointerLock();
  });

  document.addEventListener("mousemove", function (e) {
    if (document.pointerLockElement === canvas) {
      camera.look(e.movementX, e.movementY);
    }
  });

  document.addEventListener("pointerlockchange", function () {
    var hint = document.getElementById("click-hint");
    if (!hint) return;
    hint.textContent =
      document.pointerLockElement === canvas
        ? "Mouse capturado — pressione ESC para soltar"
        : "Clique no canvas para capturar o mouse. ESC para soltar.";
  });
}