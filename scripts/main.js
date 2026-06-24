"use strict";

var gl, prog;
var totalTime = 0;
var lastTime = 0;

let mapHitboxes = [];


async function init() {
  var canvas = document.getElementById("glcanvas1");
  gl = getGL(canvas);
  if (!gl) return;

  var vtxSrc = document.getElementById("vertex-shader").text;
  var fragSrc = document.getElementById("frag-shader").text;

  var vtxShader = createShader(gl, gl.VERTEX_SHADER, vtxSrc);
  var fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!vtxShader || !fragShader) return;

  prog = createProgram(gl, vtxShader, fragShader);
  if (!prog) return;

  gl.useProgram(prog);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.01, 0.01, 0.02, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.uniform3fv(gl.getUniformLocation(prog, "lightColor"), [1.0, 0.8, 0.5]);
  gl.uniform1i(gl.getUniformLocation(prog, "useSolidColor"), 0);

  createFallbackTexture(0);

  try {
    await setupScene();
  } catch (e) {
    console.error("Falha ao carregar cena OBJ:", e);
  }
    
  const textoOBJ = await fetch("./../assets/models/backrooms_hitbox.obj").then((r) => r.text());
  mapHitboxes = getHitboxFromOBJ(textoOBJ);

  initInput();
  requestAnimationFrame(gameLoop);
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

function createFallbackTexture(unit) {
  var tex = gl.createTexture();
  var data = new Uint8Array([180, 180, 180, 255]);
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    data,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return tex;
}

function drawObject(
  buf,
  count,
  modelMat,
  projMat,
  viewMat,
  texUnit,
  solidColor,
  rgb,
) {
  gl.uniform1i(
    gl.getUniformLocation(prog, "useSolidColor"),
    solidColor ? 1 : 0,
  );
  if (solidColor && rgb) {
    gl.uniform3fv(gl.getUniformLocation(prog, "solidColor"), rgb);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  connectAttrib(gl, prog, "position", 3, 32, 0);
  connectAttrib(gl, prog, "texCoord", 2, 32, 12);
  connectAttrib(gl, prog, "normal", 3, 32, 20);

  gl.uniformMatrix4fv(
    gl.getUniformLocation(prog, "transf"),
    false,
    matToGL(modelMat),
  );

  var mvp = math.multiply(math.multiply(projMat, viewMat), modelMat);
  gl.uniformMatrix4fv(
    gl.getUniformLocation(prog, "transfproj"),
    false,
    matToGL(mvp),
  );

  gl.uniform1i(gl.getUniformLocation(prog, "tex"), texUnit);
  gl.drawArrays(gl.TRIANGLES, 0, count);
}
