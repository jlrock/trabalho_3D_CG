var scene = {};

async function setupScene() {
  const mapParts = await loadOBJ("assets/models/backrooms.obj");

  scene.parts = [];

  const carpetTex = loadTexture(gl, "assets/textures/carpet.jpeg", 0);
  const wallTex = loadTexture(gl, "assets/textures/wallpaper.jpeg", 1);

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
    });
  }
}

function drawScene(projMat, viewMat) {
  for (const part of scene.parts) {
    drawObject(
      part.buffer,
      part.vertexCount,
      mat4Identity(),
      projMat,
      viewMat,
      part.textureUnit,
      false,
      null,
    );
  }
}
