/**
 * Obtém o contexto WebGL do canvas.
 * Tenta "webgl" e cai para "experimental-webgl" em browsers antigos.
 *
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

// ─────────────────────────────────────────────────────────────────────────────
// SHADERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compila um shader GLSL.
 *
 * @param {WebGLRenderingContext} gl
 * @param {number} shaderType  gl.VERTEX_SHADER ou gl.FRAGMENT_SHADER
 * @param {string} shaderSrc   código GLSL como string
 * @returns {WebGLShader|undefined}
 */
function createShader(gl, shaderType, shaderSrc) {
  var shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderSrc);
  gl.compileShader(shader);

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  }

  // Erro de compilação — imprime o log completo no console para facilitar debug
  var errorLog = gl.getShaderInfoLog(shader);
  console.error("Erro de compilação no shader:\n" + errorLog);
  alert("Erro de compilação no shader. Veja o console (F12) para detalhes.");
  gl.deleteShader(shader);
}

/**
 * Cria e linka um programa WebGL a partir de vertex + fragment shaders.
 *
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

// ─────────────────────────────────────────────────────────────────────────────
// MATRIZES DE CÂMERA E PROJEÇÃO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cria a matriz de projeção perspectiva.
 *
 * @param {number} fovy    Campo de visão vertical em GRAUS (ex: 70 para FPS)
 * @param {number} aspect  Razão largura/altura do canvas
 * @param {number} near    Plano de corte próximo (ex: 0.1)
 * @param {number} far     Plano de corte distante (ex: 100)
 * @returns {math.Matrix}  Matriz 4×4
 */
function createPerspective(fovy, aspect, near, far) {
  fovy = (fovy * Math.PI) / 180.0; // ← Math (maiúsculo) — API nativa do JS
  //   O código original usava math.tan (minúsculo)
  //   do math.js, o que causava erro silencioso.

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
 * Cria a matriz View (câmera look-at).
 * Transforma coordenadas do mundo para coordenadas de câmera.
 *
 * @param {number[]} pos     Posição da câmera [x, y, z]
 * @param {number[]} target  Ponto para onde a câmera está olhando [x, y, z]
 * @param {number[]} up      Vetor "cima" do mundo — normalmente [0, 1, 0]
 * @returns {math.Matrix}    Matriz 4×4
 */
function createCamera(pos, target, up) {
  // eixo Z da câmera aponta para TRÁS (de target até pos — convenção OpenGL)
  var zc = math.subtract(pos, target);
  zc = math.divide(zc, math.norm(zc));

  // eixo X: perpendicular ao plano formado por up e zc
  var xc = math.cross(up, zc);
  xc = math.divide(xc, math.norm(xc));

  // eixo Y: perpendicular a xc e zc (re-ortogonalizado)
  var yc = math.cross(zc, xc);
  yc = math.divide(yc, math.norm(yc));

  // Monta a matriz de rotação da câmera (linhas = eixos do espaço de câmera)
  var rot = math.matrix([
    [xc[0], xc[1], xc[2], 0.0],
    [yc[0], yc[1], yc[2], 0.0],
    [zc[0], zc[1], zc[2], 0.0],
    [0.0, 0.0, 0.0, 1.0],
  ]);

  // Translação inversa (move o mundo para a origem da câmera)
  var mov = math.matrix([
    [1.0, 0.0, 0.0, -pos[0]],
    [0.0, 1.0, 0.0, -pos[1]],
    [0.0, 0.0, 1.0, -pos[2]],
    [0.0, 0.0, 0.0, 1.0],
  ]);

  // View = Rotação × Translação
  return math.multiply(rot, mov);
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS PARA MATRIZES DE TRANSFORMAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

/** Matriz identidade 4×4 */
function mat4Identity() {
  return math.matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]);
}

/** Translação */
function mat4Translate(tx, ty, tz) {
  return math.matrix([
    [1, 0, 0, tx],
    [0, 1, 0, ty],
    [0, 0, 1, tz],
    [0, 0, 0, 1],
  ]);
}

/** Escala */
function mat4Scale(sx, sy, sz) {
  return math.matrix([
    [sx, 0, 0, 0],
    [0, sy, 0, 0],
    [0, 0, sz, 0],
    [0, 0, 0, 1],
  ]);
}

/** Rotação em torno do eixo Y (yaw — mais usada em câmera FPS) */
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

/** Rotação em torno do eixo X (pitch) */
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

/** Rotação em torno do eixo Z (roll) */
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

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS PARA ENVIO DE DADOS AO SHADER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converte uma math.Matrix 4×4 para um Float32Array column-major,
 * formato exigido por gl.uniformMatrix4fv.
 *
 * math.js armazena row-major, WebGL espera column-major → transpose antes de flatten.
 *
 * @param {math.Matrix} mat
 * @returns {number[]}
 */
function matToGL(mat) {
  return math.flatten(math.transpose(mat))._data;
}

/**
 * Conecta um atributo do vertex shader ao buffer ARRAY_BUFFER atualmente ativo.
 *
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} prog
 * @param {string} name     Nome do atributo no GLSL (ex: "position")
 * @param {number} size     Quantidade de floats por vértice (2, 3 ou 4)
 * @param {number} stride   Bytes por vértice completo (ex: 8*4 = 32)
 * @param {number} offset   Byte de início deste atributo dentro do vértice
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
 * Carrega uma imagem e cria uma textura WebGL.
 *
 * @param {WebGLRenderingContext} gl
 * @param {string} src      Caminho da imagem (ex: "/assets/textures/wall.jpg")
 * @param {number} unit     Unidade de textura (0 para TEXTURE0, 1 para TEXTURE1…)
 * @param {function} onLoad Callback chamado com a textura quando estiver pronta
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