"use strict";

var gl, prog;
var lastTime = 0;
var totalTime = 0;
var corridorBuffer = null;
var corridorCount = 0;
var lampBuffer = null;
var lampCount = 0;
var lampSwing = 0.0;

function main() {
  if (!initGL()) return;
  initInput();
  buildCorridor();
  buildLampCube();

  // Quando scene.js + obj-loader.js estiverem prontos:
  // Substituir as duas linhas de build acima por:
  //   await initScene(gl, prog);
  // e mudar "function main()" para "async function main()"

  requestAnimationFrame(gameLoop);
}

function initGL() {
  var canvas = document.getElementById("glcanvas1");
  gl = getGL(canvas);
  if (!gl) return false;

  var vtxSrc = document.getElementById("vertex-shader").text;
  var fragSrc = document.getElementById("frag-shader").text;

  var vtxShader = createShader(gl, gl.VERTEX_SHADER, vtxSrc);
  var fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!vtxShader || !fragShader) return false;

  prog = createProgram(gl, vtxShader, fragShader);
  if (!prog) return false;

  gl.useProgram(prog);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.01, 0.01, 0.02, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.uniform3fv(gl.getUniformLocation(prog, "lightColor"), [1.0, 0.85, 0.65]);
  gl.uniform1i(gl.getUniformLocation(prog, "useSolidColor"), 0);

  createFallbackTexture(0);
  return true;
}

// Testes
function makeQuad(v0, v1, v2, v3, n, tu, tv) {
  return [
    // Triângulo 1: v0, v1, v2
    v0[0],
    v0[1],
    v0[2],
    0,
    0,
    n[0],
    n[1],
    n[2],
    v1[0],
    v1[1],
    v1[2],
    0,
    tv,
    n[0],
    n[1],
    n[2],
    v2[0],
    v2[1],
    v2[2],
    tu,
    tv,
    n[0],
    n[1],
    n[2],
    // Triângulo 2: v0, v2, v3
    v0[0],
    v0[1],
    v0[2],
    0,
    0,
    n[0],
    n[1],
    n[2],
    v2[0],
    v2[1],
    v2[2],
    tu,
    tv,
    n[0],
    n[1],
    n[2],
    v3[0],
    v3[1],
    v3[2],
    tu,
    0,
    n[0],
    n[1],
    n[2],
  ];
}

function buildCorridor() {
  var v = [];
  v = v.concat(
    makeQuad(
      [-2.5, 0, 5.0],
      [-2.5, 0, -12.0],
      [2.5, 0, -12.0],
      [2.5, 0, 5.0],
      [0, 1, 0],
      2,
      8,
    ),
  );
  v = v.concat(
    makeQuad(
      [2.5, 3.5, 5.0],
      [2.5, 3.5, -12.0],
      [-2.5, 3.5, -12.0],
      [-2.5, 3.5, 5.0],
      [0, -1, 0],
      2,
      8,
    ),
  );
  v = v.concat(
    makeQuad(
      [-2.5, 3.5, 5.0],
      [-2.5, 0, 5.0],
      [-2.5, 0, -12.0],
      [-2.5, 3.5, -12.0],
      [1, 0, 0],
      8,
      2,
    ),
  );
  v = v.concat(
    makeQuad(
      [2.5, 3.5, -12.0],
      [2.5, 0, -12.0],
      [2.5, 0, 5.0],
      [2.5, 3.5, 5.0],
      [-1, 0, 0],
      8,
      2,
    ),
  );
  v = v.concat(
    makeQuad(
      [-2.5, 3.5, -12.0],
      [-2.5, 0, -12.0],
      [2.5, 0, -12.0],
      [2.5, 3.5, -12.0],
      [0, 0, 1],
      2,
      2,
    ),
  );

  var data = new Float32Array(v);
  corridorCount = data.length / 8;
  corridorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, corridorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
}

function buildLampCube() {
  var faces = [
    {
      v0: [-0.5, 0.5, 0.5],
      v1: [-0.5, -0.5, 0.5],
      v2: [0.5, -0.5, 0.5],
      v3: [0.5, 0.5, 0.5],
      n: [0, 0, 1],
    }, // frente
    {
      v0: [0.5, 0.5, -0.5],
      v1: [0.5, -0.5, -0.5],
      v2: [-0.5, -0.5, -0.5],
      v3: [-0.5, 0.5, -0.5],
      n: [0, 0, -1],
    }, // trás
    {
      v0: [-0.5, 0.5, -0.5],
      v1: [-0.5, -0.5, -0.5],
      v2: [-0.5, -0.5, 0.5],
      v3: [-0.5, 0.5, 0.5],
      n: [-1, 0, 0],
    }, // esq
    {
      v0: [0.5, 0.5, 0.5],
      v1: [0.5, -0.5, 0.5],
      v2: [0.5, -0.5, -0.5],
      v3: [0.5, 0.5, -0.5],
      n: [1, 0, 0],
    }, // dir
    {
      v0: [-0.5, 0.5, -0.5],
      v1: [-0.5, 0.5, 0.5],
      v2: [0.5, 0.5, 0.5],
      v3: [0.5, 0.5, -0.5],
      n: [0, 1, 0],
    }, // topo
    {
      v0: [-0.5, -0.5, 0.5],
      v1: [-0.5, -0.5, -0.5],
      v2: [0.5, -0.5, -0.5],
      v3: [0.5, -0.5, 0.5],
      n: [0, -1, 0],
    }, // base
  ];
  var v = [];
  faces.forEach(function (f) {
    v = v.concat(makeQuad(f.v0, f.v1, f.v2, f.v3, f.n, 1, 1));
  });
  var data = new Float32Array(v);
  lampCount = data.length / 8;
  lampBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, lampBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
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

function gameLoop(timestamp) {
  var dt = Math.min((timestamp - lastTime) / 1000.0, 0.05);
  lastTime = timestamp;
  totalTime += dt;
  update(dt);
  render();
  requestAnimationFrame(gameLoop);
}

function update(dt) {
  camera.move(dt);
  lampSwing = Math.sin(totalTime * 0.7) * 20.0;

  // quando game.js estiver pronto:
  // updateGame(); // lógica, vitória, derrota
  // updateScene(); // anima outros objetos
  // updateMonster(); // movimenta a entidade inimiga
}

// RENDER
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var aspect = gl.canvas.width / gl.canvas.height;
  var mproj = createPerspective(70.0, aspect, 0.1, 100.0);
  var view = camera.getViewMatrix();

  var front = camera.getFront();
  gl.uniform3fv(gl.getUniformLocation(prog, "lightpos"), camera.pos);
  gl.uniform3fv(gl.getUniformLocation(prog, "lightDirection"), front);
  gl.uniform3fv(gl.getUniformLocation(prog, "campos"), camera.pos);

  drawCorridor(mproj, view);
  drawLamp(mproj, view);

  // quando scene.js estiver pronto:
  // drawScene();
}

/**
 * @param {WebGLBuffer}  buf
 * @param {number}       count
 * @param {math.Matrix}  modelMat
 * @param {math.Matrix}  projMat
 * @param {math.Matrix}  viewMat
 * @param {number}       texUnit
 * @param {boolean}      solidColor
 * @param {number[]|null} rgb
 */
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

function drawCorridor(projMat, viewMat) {
  drawObject(
    corridorBuffer,
    corridorCount,
    mat4Identity(),
    projMat,
    viewMat,
    0,
    false,
    null,
  );
}

function drawLamp(projMat, viewMat) {
  var scale = mat4Scale(0.2, 0.4, 0.2);
  var hang = mat4Translate(0.0, -0.35, 0.0);
  var swing = mat4RotZ((lampSwing * Math.PI) / 180.0);
  var pivot = mat4Translate(0.0, 3.5, -4.0);

  var model = math.multiply(
    pivot,
    math.multiply(swing, math.multiply(hang, scale)),
  );

  drawObject(
    lampBuffer,
    lampCount,
    model,
    projMat,
    viewMat,
    0,
    true,
    [0.9, 0.75, 0.1],
  );
}
