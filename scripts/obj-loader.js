async function loadOBJ(path) {
  const text = await fetch(path).then((r) => r.text());
  const lines = text.split("\n");

  const positions = [];
  const texcoords = [];
  const normals = [];
  const vertexData = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const parts = line.split(/\s+/);

    if (parts[0] === "v") {
      positions.push([
        parseFloat(parts[1]),
        parseFloat(parts[2]),
        parseFloat(parts[3]),
      ]);
    }
    if (parts[0] === "vt") {
      texcoords.push([parseFloat(parts[1]), parseFloat(parts[2])]);
    }
    if (parts[0] === "vn") {
      normals.push([
        parseFloat(parts[1]),
        parseFloat(parts[2]),
        parseFloat(parts[3]),
      ]);
    }
    if (parts[0] === "f") {
      const faceVerts = parts.slice(1).map((token) => {
        const idx = token.split("/").map(Number);
        return idx;
      });

      for (let i = 1; i < faceVerts.length - 1; i++) {
        const tri = [faceVerts[0], faceVerts[i], faceVerts[i + 1]];
        for (const [vi, vti, vni] of tri) {
          const pos = positions[vi - 1] || [0, 0, 0];
          const uv = texcoords[vti - 1] || [0, 0];
          const nor = normals[vni - 1] || [0, 1, 0];
          vertexData.push(...pos, ...uv, ...nor);
        }
      }
    }
  }

  return {
    buffer: new Float32Array(vertexData),
    vertexCount: vertexData.length / 8,
  };
}
