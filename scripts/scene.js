var scene = {};

async function setupScene() {
  const mapParts = await loadOBJ("./../assets/models/backrooms.obj");
  const sahur = await loadOBJ("./../assets/models/sahur.obj");
  
  scene.parts = [];
  const carpetTex = loadTexture(gl, "assets/textures/carpet.jpeg", 0);
  const wallTex = loadTexture(gl, "assets/textures/wallpaper.jpeg", 1);
  const sahurTex = loadTexture(gl, "./../assets/textures/sahur.png", 2)

  for (const part of mapParts) {
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, part.bufferData, gl.STATIC_DRAW);

    let unit = 0;
    if (part.materialName === "Carpet") {
      unit = 0;
    } else if (part.materialName === "Wall") {
      unit = 1;
    }

    scene.parts.push({
      buffer: buf,
      vertexCount: part.vertexCount,
      textureUnit: unit,
      transform: mat4Identity(),
    });
  }

  const sahurMatrix = math.multiply(
    mat4Translate(1, 0, -1),
    math.multiply(mat4Scale(0.75, 0.75, 0.75), mat4Identity()),
  );

  for (const obj of sahur) {
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, obj.bufferData, gl.STATIC_DRAW);
    scene.parts.push({
      buffer: buf,
      vertexCount: obj.vertexCount,
      textureUnit: 2,
      transform: sahurMatrix,
    });
  }
}

function drawScene(projMat, viewMat) {
  for (const part of scene.parts) {
    drawObject(
      part.buffer,
      part.vertexCount,
      part.transform,
      projMat,
      viewMat,
      part.textureUnit,
      false,
      null,
    );
  }
}
