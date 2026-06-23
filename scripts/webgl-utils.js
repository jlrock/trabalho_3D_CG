/**
 * @param {HTMLCanvasElement} canvas
 * @returns {WebGLRenderingContext|null}
 */
function getGL(canvas) {
  var gl = canvas.getContext("webgl");
  if (gl) return gl;

  gl = canvas.getContext("experimental-webgl");
  if (gl) return gl;

  alert("WebGL não suportado! Atualize seu navegador.");
  return null;
}

/**
 * @param {WebGLRenderingContext} gl
 * @param {number} shaderType
 * @param {string} shaderSrc
 * @returns {WebGLShader|undefined}
 */
function createShader(gl, shaderType, shaderSrc) {
  var shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderSrc);
  gl.compileShader(shader);

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  }

  var errorLog = gl.getShaderInfoLog(shader);
  console.error("Erro de compilação no shader:\n" + errorLog);
  alert("Erro de compilação no shader. Veja o console (F12) para detalhes.");
  gl.deleteShader(shader);
}

/**
 * @param {WebGLRenderingContext} gl
 * @param {WebGLShader} vtxShader
 * @param {WebGLShader} fragShader
 * @returns {WebGLProgram|undefined}
 */
function createProgram(gl, vtxShader, fragShader) {
  var prog = gl.createProgram();
  gl.attachShader(prog, vtxShader);
  gl.attachShader(prog, fragShader);
  gl.linkProgram(prog);

  if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    return prog;
  }

  var errorLog = gl.getProgramInfoLog(prog);
  console.error("Erro de linkagem do programa:\n" + errorLog);
  alert("Erro de linkagem. Veja o console (F12) para detalhes.");
  gl.deleteProgram(prog);
}

/**
 * @param {number} fovy
 * @param {number} aspect
 * @param {number} near
 * @param {number} far
 * @returns {math.Matrix}
 */
function createPerspective(fovy, aspect, near, far) {
  fovy = (fovy * Math.PI) / 180.0;

  var fy = 1.0 / Math.tan(fovy / 2.0);
  var fx = fy / aspect;
  var A = -(far + near) / (far - near);
  var B = (-2.0 * far * near) / (far - near);

  return math.matrix([
    [fx, 0.0, 0.0, 0.0],
    [0.0, fy, 0.0, 0.0],
    [0.0, 0.0, A, B],
    [0.0, 0.0, -1.0, 0.0],
  ]);
}

/**
 * @param {number[]} pos
 * @param {number[]} target
 * @param {number[]} up
 * @returns {math.Matrix}
 */
function createCamera(pos, target, up) {
  var zc = math.subtract(pos, target);
  zc = math.divide(zc, math.norm(zc));

  var xc = math.cross(up, zc);
  xc = math.divide(xc, math.norm(xc));

  var yc = math.cross(zc, xc);
  yc = math.divide(yc, math.norm(yc));

  var rot = math.matrix([
    [xc[0], xc[1], xc[2], 0.0],
    [yc[0], yc[1], yc[2], 0.0],
    [zc[0], zc[1], zc[2], 0.0],
    [0.0, 0.0, 0.0, 1.0],
  ]);

  var mov = math.matrix([
    [1.0, 0.0, 0.0, -pos[0]],
    [0.0, 1.0, 0.0, -pos[1]],
    [0.0, 0.0, 1.0, -pos[2]],
    [0.0, 0.0, 0.0, 1.0],
  ]);

  return math.multiply(rot, mov);
}

function mat4Identity() {
  return math.matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]);
}

function mat4Translate(tx, ty, tz) {
  return math.matrix([
    [1, 0, 0, tx],
    [0, 1, 0, ty],
    [0, 0, 1, tz],
    [0, 0, 0, 1],
  ]);
}

function mat4Scale(sx, sy, sz) {
  return math.matrix([
    [sx, 0, 0, 0],
    [0, sy, 0, 0],
    [0, 0, sz, 0],
    [0, 0, 0, 1],
  ]);
}

function mat4RotY(angleRad) {
  var c = Math.cos(angleRad),
    s = Math.sin(angleRad);
  return math.matrix([
    [c, 0, s, 0],
    [0, 1, 0, 0],
    [-s, 0, c, 0],
    [0, 0, 0, 1],
  ]);
}

function mat4RotX(angleRad) {
  var c = Math.cos(angleRad),
    s = Math.sin(angleRad);
  return math.matrix([
    [1, 0, 0, 0],
    [0, c, -s, 0],
    [0, s, c, 0],
    [0, 0, 0, 1],
  ]);
}

function mat4RotZ(angleRad) {
  var c = Math.cos(angleRad),
    s = Math.sin(angleRad);
  return math.matrix([
    [c, -s, 0, 0],
    [s, c, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]);
}

/**
 * @param {math.Matrix} mat
 * @returns {number[]}
 */
function matToGL(mat) {
  return math.flatten(math.transpose(mat))._data;
}

/**
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} prog
 * @param {string} name
 * @param {number} size
 * @param {number} stride
 * @param {number} offset
 */
function connectAttrib(gl, prog, name, size, stride, offset) {
  var ptr = gl.getAttribLocation(prog, name);
  if (ptr === -1) {
    console.warn(
      "Atributo '" + name + "' não encontrado no shader. Verifique o nome.",
    );
    return;
  }
  gl.enableVertexAttribArray(ptr);
  gl.vertexAttribPointer(ptr, size, gl.FLOAT, false, stride, offset);
}

/**
 * @param {WebGLRenderingContext} gl
 * @param {string} src
 * @param {number} unit
 * @param {function} onLoad
 */
function loadTexture(gl, src, unit, onLoad) {
  var img = new Image();
  img.src = src;
  img.onload = function () {
    var tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    if (onLoad) onLoad(tex);
  };
  img.onerror = function () {
    console.error("Falha ao carregar textura: " + src);
  };
}
