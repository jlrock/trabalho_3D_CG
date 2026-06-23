async function loadOBJ(path) {
  const text = await fetch(path).then((r) => r.text());
  const lines = text.split("\n");

  const positions = []; // lista de [x, y, z]
  const texcoords = []; // lista de [u, v]
  const normals = []; // lista de [nx, ny, nz]
  const vertexData = []; // buffer final interleaved: xyz uv nxnynz

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const parts = line.split(/\s+/);

    if (parts[0] === "v") {
      // vértice
      positions.push([
        parseFloat(parts[1]),
        parseFloat(parts[2]),
        parseFloat(parts[3]),
      ]);
    }
    if (parts[0] === "vt") {
      // textura
      texcoords.push([parseFloat(parts[1]), parseFloat(parts[2])]);
    }
    if (parts[0] === "vn") {
      // normal
      normals.push([
        parseFloat(parts[1]),
        parseFloat(parts[2]),
        parseFloat(parts[3]),
      ]);
    }
    if (parts[0] === "f") {
      // face (pode ser triângulo ou quad)
      // Pega os vértices da face (partes[1] em diante)
      const faceVerts = parts.slice(1).map((token) => {
        const idx = token.split("/").map(Number); // [vi, vti, vni]
        return idx;
      });

      // Triangula a face (fan triangulation: funciona para convexos)
      for (let i = 1; i < faceVerts.length - 1; i++) {
        const tri = [faceVerts[0], faceVerts[i], faceVerts[i + 1]];
        for (const [vi, vti, vni] of tri) {
          const pos = positions[vi - 1] || [0, 0, 0];
          const uv = texcoords[vti - 1] || [0, 0];
          const nor = normals[vni - 1] || [0, 1, 0];
          vertexData.push(...pos, ...uv, ...nor);
          // Resultado: 8 floats por vértice (xyz uv nxnynz)
        }
      }
    }
  }

  return {
    buffer: new Float32Array(vertexData),
    vertexCount: vertexData.length / 8, // 8 floats por vértice
  };
}
