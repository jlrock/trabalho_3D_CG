var scene = {};

async function setupScene() {
  const mapParts = await loadOBJ("./../assets/models/backrooms.obj");
  const sahurParts = await loadOBJ("./../assets/models/sahur.obj");
  const keyParts = await loadOBJ("./../assets/models/key.obj");

  scene.parts = [];
  scene.monsterParts = [];
  scene.key = [];

  loadTexture(gl, "./../assets/textures/carpet.jpeg", 0);
  loadTexture(gl, "./../assets/textures/wallpaper.jpeg", 1);
  loadTexture(gl, "./../assets/textures/sahur.png", 2);
  loadTexture(gl, "./../assets/textures/key.png", 3);

  for (const part of mapParts) {
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, part.bufferData, gl.STATIC_DRAW);

    let unit = 0;
    if (part.materialName === "Carpet") unit = 0;
    else if (part.materialName === "Wall") unit = 1;

    scene.parts.push({
      buffer: buf,
      vertexCount: part.vertexCount,
      textureUnit: unit,
    });
  }

  for (const obj of sahurParts) {
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, obj.bufferData, gl.STATIC_DRAW);

    scene.monsterParts.push({
      buffer: buf,
      vertexCount: obj.vertexCount,
      textureUnit: 2,
    });
  }

  for (const key of keyParts) {
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, key.bufferData, gl.STATIC_DRAW);

    scene.key.push({
      buffer: buf,
      vertexCount: key.vertexCount,
      textureUnit: 3,
    });
  }

  door.build();
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

  const monsterTransform = monster.getTransform();
  for (const part of scene.monsterParts) {
    drawObject(
      part.buffer,
      part.vertexCount,
      monsterTransform,
      projMat,
      viewMat,
      part.textureUnit,
      false,
      null,
    );
  }
  
  if(!isKeyCaught) {
    const keyTransform = key.getTransform();
    for (const part of scene.key) {
      drawObject(
        part.buffer,
        part.vertexCount,
        keyTransform,
        projMat,
        viewMat,
        part.textureUnit,
        false,
        null,
      );
    }
  }
  

  door.draw(projMat, viewMat);
}
