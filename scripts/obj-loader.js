async function loadOBJ(path) {
  const text = await fetch(path).then((r) => r.text());
  const lines = text.split("\n");

  const positions = [];
  const texcoords = [];
  const normals = [];

  const parts = {};
  let currentMaterial = "default";
  parts[currentMaterial] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const tokens = line.split(/\s+/);

    if (tokens[0] === "v") {
      positions.push([
        parseFloat(tokens[1]),
        parseFloat(tokens[2]),
        parseFloat(tokens[3]),
      ]);
    }
    if (tokens[0] === "vt") {
      texcoords.push([parseFloat(tokens[1]), parseFloat(tokens[2])]);
    }
    if (tokens[0] === "vn") {
      normals.push([
        parseFloat(tokens[1]),
        parseFloat(tokens[2]),
        parseFloat(tokens[3]),
      ]);
    }

    if (tokens[0] === "usemtl") {
      currentMaterial = tokens[1];
      if (!parts[currentMaterial]) {
        parts[currentMaterial] = [];
      }
    }

    if (tokens[0] === "f") {
      const faceVerts = tokens.slice(1).map((token) => {
        return token.split("/").map(Number);
      });

      for (let i = 1; i < faceVerts.length - 1; i++) {
        const tri = [faceVerts[0], faceVerts[i], faceVerts[i + 1]];
        for (const [vi, vti, vni] of tri) {
          const pos = positions[vi - 1] || [0, 0, 0];
          const uv = texcoords[vti - 1] || [0, 0];
          const nor = normals[vni - 1] || [0, 1, 0];
          parts[currentMaterial].push(...pos, ...uv, ...nor);
        }
      }
    }
  }

  const result = [];
  for (const matName in parts) {
    if (parts[matName].length > 0) {
      result.push({
        materialName: matName,
        bufferData: new Float32Array(parts[matName]),
        vertexCount: parts[matName].length / 8,
      });
    }
  }

  return result;
}

function loadTexture(gl, url, unit) {
  var texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([255, 0, 255, 255]),
  );

  var image = new Image();
  image.onload = function () {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    if (
      (image.width & (image.width - 1)) === 0 &&
      (image.height & (image.height - 1)) === 0
    ) {
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}
