# 🟡 Tung Tung Sahur Escape

> **3D Escape Room Game** developed with **Pure WebGL** as Assignment 2 for the Computer Graphics course — UECE.

---
## 👥 Team

| Name                                 |
|--------------------------------------|
| Artur de Maria Ribeiro               |
| João Lucas Simões Rocha da Silveira  |
| Pedro Lucas da Silva Rodrigues       |

---

## 🔗 Links

- 📊 **Presentation slides**: [Canva Link](https://canva.link/trabalhocgtungtungsuhur)
- 🎥 **Demo video**: [Drive Link](https://drive.google.com/file/d/1rwwVJhpaY___xujaQF17cdgd42po7buK/view?usp=sharing)
- 🌐 **GitHub Pages (online demo)**: [Game Link](https://jlrock.github.io/trabalho_3D_CG/)

---

## 📖 Description

**Tung Tung Sahur Escape** is a first-person 3D game inspired by the *Backrooms* universe — infinite liminal spaces with yellowish carpets and faded wallpaper. The player wakes up in this seemingly inescapable environment and must find a **key** hidden in the corridors before reaching the **exit door**. The catch: the **Tung Tung Sahur** is lurking, patrolling the corridors and ready to eliminate anyone who crosses its path.

### 🎯 Objective
1. Explore the Backrooms corridors and find the **golden key**.
2. With the key in hand, locate the **exit door** (green and pulsing).
3. Reach the door without being caught by the **Tung Tung Sahur**.

### ☠️ Defeat Condition
Being caught by the monster before escaping.

---

## 🎮 Controls

| Action                        | Key / Device                    |
|-------------------------------|---------------------------------|
| Move forward                  | `W` or `↑`                      |
| Move backward                 | `S` or `↓`                      |
| Move left                     | `A` or `←`                      |
| Move right                    | `D` or `→`                      |
| Look around                   | Mouse (after clicking on canvas) |
| Capture / Release mouse       | Click on canvas / `ESC`         |

---

## 🚀 How to Run

### Prerequisites
- A modern browser with **WebGL** support (Chrome, Firefox, Edge — recent versions).
- A local HTTP server (required to load OBJ files and textures via `fetch`).
- Git installed to clone this repository to your machine.

### Option 1 — VS Code (Live Server)
1. Install the **Live Server** extension in VS Code.
2. Open the project folder in VS Code.
3. Right-click on `index.html` → **"Open with Live Server"** or click the **"Go Live"** button in the bottom-right corner of VS Code.
4. The game will open automatically in the browser at `http://localhost:5500`.

### Option 2 — Python (HTTP Server)
```bash
# Python 3
python -m http.server 8080

# Open in browser:
# http://localhost:8080
```

### Option 3 — Node.js (http-server)
```bash
npm install -g http-server
http-server . -p 8080

# Open in browser:
# http://localhost:8080
```

> ⚠️ **Do not open `index.html` directly from the file system** (`file://`). OBJ models and textures are loaded via `fetch`, which requires an HTTP server.

---

## 📁 File Structure

```
/
├── index.html      # Main page: canvas, GLSL shaders and HTML structure
├── assets/
|   ├── audios/
|   |   ├── chasing.mp3     # Suspense music when the Sahur is nearby
|   |   └── idle.mp3        # Default horror music for the game
|   ├── imagens/
|   |   └── key_snapshot.png    # Display image of the key
│   ├── models/
│   │   ├── backrooms.obj           # 3D model of the map (walls, floor, ceiling)
│   │   ├── backrooms_hitbox.obj    # Simplified geometry for map collisions
│   │   ├── sahur.obj               # 3D model of the monster (Tung Tung Sahur)
│   │   ├── key.obj                 # 3D model of the key
│   │   └── key_hitbox.obj          # Simplified geometry for key collision
│   └── textures/
│       ├── carpet.jpeg             # Backrooms yellow carpet texture
│       ├── wallpaper.jpeg          # Backrooms wallpaper texture
│       ├── sahur.png               # Monster texture
│       └── key.png                 # Key texture
├── scripts/
│   ├── main.js             # Entry point: WebGL and game initialization
│   ├── webgl-utils.js      # WebGL utilities: shaders, matrices, textures
│   ├── camera.js           # First-person camera with collision
│   ├── game.js             # Main loop, game states and collision detection
│   ├── input.js            # Keyboard and mouse capture
│   ├── scene.js            # 3D scene loading and rendering
│   ├── obj-loader.js       # Custom OBJ file reader and hitbox generator
│   ├── monster.js          # Monster AI (idle / hunting / chasing)
│   ├── door.js             # Animated exit door
│   └── key.js              # Animated key object and collection logic
├── styles/
|   └── style.css           # Styling for Menu, Game Over and Victory screens
├── index.html              # Game entry file for the web
└── README.md
```

---

## 🧩 Detailed JavaScript File Descriptions

### `main.js` — Entry Point and Initialization

Responsible for initializing the entire WebGL environment and orchestrating the loading of game resources.

**Main functions:**

| Function / Variable           | Description                                                                                                   |
|-------------------------------|---------------------------------------------------------------------------------------------------------------|
| `init()` (async)              | Asynchronous entry point. Obtains the WebGL context, compiles GLSL shaders, configures the viewport, loads OBJ models and textures, initializes inputs and starts the game loop with `requestAnimationFrame`. |
| `createFallbackTexture(unit)` | Creates a 1×1 gray texture as a placeholder while real images are still loading (avoids rendering errors during asynchronous loading). |
| `drawObject(...)`             | Central rendering function. Configures shader uniforms (model matrix, MVP, solid color vs. texture) and executes `gl.drawArrays`. Used by all objects in the scene. |
| `showGameOver()`              | Displays the Game Over screen (HTML div) when the monster catches the player.                                 |
| `showVictory()`               | Displays the victory screen when the player reaches the door with the key.                                    |
| `handleKeyImage()`            | Updates the HUD: displays the key icon on the interface when it is collected.                                 |
| `resetGame()`                 | Resets the state of all objects (camera, monster, key) and restarts the game loop.                            |
| Global variables              | `gl` (WebGL context), `prog` (shader program), `totalTime` (accumulated time), `lastTime`, `mapHitboxes` (list of map colliders). |

**Relation to requirements:**
- Covers **Requirement VI**: scene rendering done exclusively with pure WebGL.
- Covers **Requirement VII**: creation of graphics context via HTML5 Canvas — `main.js` obtains the context with `canvas.getContext("webgl")` without using any high-level graphics function beyond initialization.

---

### `webgl-utils.js` — WebGL Utilities and Matrix Math

A library of low-level utility functions for WebGL and linear algebra, written from scratch by the team. It is the mathematical heart of the project.

**Main functions:**

| Function                                                | Description                                                                                                   |
|---------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| `getGL(canvas)`                                         | Obtains the WebGL context from the canvas, adjusting for the device pixel ratio (`devicePixelRatio`). Tries `"webgl"` and falls back to `"experimental-webgl"`. |
| `createShader(gl, type, src)`                           | Compiles a GLSL shader (vertex or fragment). In case of compilation errors, logs details to the console.      |
| `createProgram(gl, vtx, frag)`                          | Links the two compiled shaders into a WebGL program.                                                          |
| `createPerspective(fovy, aspect, near, far)`            | **Builds the 4×4 perspective projection matrix** from the vertical field of view (FOV=70°), canvas aspect ratio, and near/far planes. Manual implementation, without graphics libraries. |
| `createCamera(pos, target, up)`                         | **Builds the View Matrix / Look-At matrix** manually: calculates the XYZ axes of camera space via cross product and assembles the rotation + translation matrix. |
| `mat4Identity()`                                        | Returns the 4×4 identity matrix.                                                                              |
| `mat4Translate(tx, ty, tz)`                             | Creates a 4×4 translation matrix.                                                                             |
| `mat4Scale(sx, sy, sz)`                                 | Creates a 4×4 scale matrix.                                                                                   |
| `mat4RotY(angle)`, `mat4RotX(angle)`, `mat4RotZ(angle)` | Create rotation matrices around the Y, X and Z axes respectively.                                           |
| `matToGL(mat)`                                          | Converts a math.js matrix to a flat array in **column-major order** (format required by WebGL via `gl.uniformMatrix4fv`). |
| `connectAttrib(gl, prog, name, size, stride, offset)`   | Activates and configures a vertex attribute in the VAO.                                                       |
| `loadTexture(gl, url, unit)`                            | Loads an image asynchronously and uploads it to the GPU. While the image loads, uses a magenta pixel as a placeholder. Automatically generates mipmaps for textures with power-of-2 dimensions. |
| `makeQuad(v0,v1,v2,v3,n,tu,tv)`                         | Builds vertex data (position + UV + normal) for a quad (2 triangles) with specified normal and texture coordinates. Used to build the door geometry. |

**Relation to requirements:**
- Covers **Requirement I**: `createPerspective` implements the **perspective projection** and `createCamera` implements the camera (look-at).
- Covers **Requirement IV**: `loadTexture` loads **textures** to the GPU.
- Covers **Requirement VI**: all math is manual — no high-level graphics library is used. Only math.js (Linear Algebra), explicitly allowed by the assignment.

---

### `camera.js` — First-Person Camera

Implements full first-person camera control, including movement, rotation and collision detection with the environment.

**`camera` object structure:**

| Property / Method  | Description                                                                                                        |
|--------------------|--------------------------------------------------------------------------------------------------------------------|
| `pos`              | Current camera position in 3D world `[x, y, z]`. Initialized at `[0, 0.7, 0]` (player "eye" height).             |
| `yaw`              | Horizontal rotation angle (left/right), in radians.                                                                |
| `pitch`            | Vertical rotation angle (up/down), limited to ±81° to avoid gimbal lock.                                          |
| `speed`            | Movement speed (units/second).                                                                                     |
| `radius`           | Radius of the player's spherical collider, used in collision detection with walls.                                 |
| `getFront()`       | Calculates and returns the camera's "front" directional vector based on `yaw` and `pitch` (spherical coordinates). |
| `getRight()`       | Calculates the "right" vector as perpendicular to the front vector, projected onto the XZ plane.                  |
| `move(dt)`         | **Reads keyboard state** (`keys[]`) and moves the camera. Implements **collision detection on two separate axes** (independent X and Z) to allow smooth sliding along walls. |
| `look(dx, dy)`     | Applies camera rotation based on mouse movement (pointer lock). Limits `pitch` to avoid camera inversion.         |
| `getViewMatrix()`  | Calls `createCamera()` with the current position and direction to build the **View Matrix** for the current frame. |
| `reset()`          | Repositions the camera to the game's starting point.                                                              |

**Collision logic:**
```
For each movement in X or Z separately:
  1. Calculate future position
  2. Check if it collides with any map hitbox
  3. Only apply displacement on the axis that didn't collide
→ Allows "sliding" along the wall instead of fully stopping
```

**Relation to requirements:**
- Covers **General Requirement I**: perspective projection (via `getViewMatrix`).
- Covers **Game Requirement I**: **first-person camera**.
- Covers **Game Requirement II**: **keyboard control** (WASD and arrows) **and mouse** (pointer lock).

---

### `game.js` — Main Loop and Game States

Manages the game lifecycle: state updates, rendering of each frame and transitions between states (playing, game over, victory).

**Main functions:**

| Function                                    | Description                                                                                                      |
|---------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| `gameLoop(timestamp)`                       | `requestAnimationFrame` callback. Calculates delta-time (`dt`, max 50ms to avoid jumps in inactive tabs), increments `totalTime`, and dispatches to `update()` and `render()`. |
| `update(dt)`                                | Updates all dynamic objects every frame: moves the camera, updates monster AI, checks key collection and win condition. |
| `render()`                                  | Clears the framebuffer, recalculates projection and view matrices, updates lighting uniforms in the shader (light position, direction and color) and calls `drawScene`. |
| `triggerGameOver()`                         | Sets `isGameOver = true`. Protected against double calls with `if (isGameOver \|\| isWin)`. |
| `triggerWin()`                              | Sets `isWin = true` and calls `triggerGameOver()` — victory is a special case of game over.                     |
| `checkCollision(cx, cz, radius, wall)`      | Calculates **circle vs. AABB** (Axis-Aligned Bounding Box) collision: finds the closest point on the rectangle to the circle center and checks if the distance is less than the radius. Used by both the camera and the monster. |

**Lighting System (uniforms updated in `render()`):**
```
lightpos       → camera position  (flashlight on the player's head — light moves)
lightDirection → camera look direction (directional spotlight)
lightColor     → [1.0, 0.3, 0.2]  when monster is chasing (red/alarm)
               → [0.3, 0.4, 0.4]  when monster is patrolling (blue-green)
```

**Relation to requirements:**
- Covers **General Requirement II**: **Phong lighting with light source movement** — the light source is coupled to the camera and moves with the player every frame.
- Covers **Requirement VIII**: continuous interaction with keyboard state via `update()`.

---

### `input.js` — Input Management (Keyboard and Mouse)

Abstracts all browser input event capture, exposing a global key map and configuring pointer lock for the mouse.

**Implementation:**

| Mechanism                  | Description                                                                                                      |
|----------------------------|------------------------------------------------------------------------------------------------------------------|
| `keys` (global object)     | `{ key: boolean }` dictionary updated by `keydown`/`keyup` events. Keys are normalized to lowercase (`e.key.toLowerCase()`). |
| `initInput()`              | Registers all event listeners on `document` and the canvas.                                                     |
| Scroll prevention          | Calls `e.preventDefault()` for arrow keys and space, preventing the page from scrolling during the game.        |
| **Pointer Lock API**       | `canvas.requestPointerLock()` captures the cursor when clicking on the canvas, allowing unlimited camera rotation. The `pointerlockchange` event updates the hint text on screen. |
| `mousemove`                | Reads `e.movementX` and `e.movementY` (raw mouse deltas) and forwards to `camera.look()` only when pointer lock is active. |

**Relation to requirements:**
- Covers **General Requirement VIII**: **keyboard and mouse interaction**.
- Covers **Game Requirement II**: camera control via keyboard (WASD/arrows) and optionally mouse.

---

### `obj-loader.js` — Custom OBJ File Reader

Manual and complete implementation of a parser for the OBJ format, without using any third-party library, as required by the assignment.

**Main functions:**

#### `loadOBJ(path)` — async
Fetches the `.obj` file and parses it line by line.

| Step             | Description                                                                                                           |
|------------------|-----------------------------------------------------------------------------------------------------------------------|
| `v` parsing      | Reads vertex positions `[x, y, z]`.                                                                                   |
| `vt` parsing     | Reads UV texture coordinates `[u, v]`.                                                                                |
| `vn` parsing     | Reads normal vectors `[nx, ny, nz]`.                                                                                  |
| `usemtl` parsing | Detects material changes and groups faces by material, allowing different textures per group.                          |
| `f` parsing      | Interprets faces in `v/vt/vn` format. Supports **N-sided polygons** via *triangle fan* (automatic triangulation): `[0,1,2], [0,2,3], [0,3,4]...` |
| Output           | Array of `{ materialName, bufferData: Float32Array, vertexCount }` objects — ready for `gl.bufferData`.              |

**Output buffer format (stride = 8 floats per vertex):**
```
[ posX, posY, posZ, texU, texV, normX, normY, normZ, ... ]
```

#### `getHitboxFromOBJ(OBJ)` — synchronous
Specialized parser to generate **Axis-Aligned Bounding Boxes (AABBs)** from a hitbox OBJ, used in map collision detection.

| Step             | Description                                                                                                    |
|------------------|----------------------------------------------------------------------------------------------------------------|
| Height filtering | Only generates hitboxes for faces with height (`maxY - minY`) greater than 0.5 — ignores floor and ceiling, captures only walls. |
| Padding          | Expands each AABB by 0.2 units in all directions to compensate for the player collider thickness.              |
| Output           | Array of `{ minX, maxX, minZ, maxZ }` objects — used in `checkCollision()`.                                   |

**Relation to requirements:**
- Covers **Game Requirement III** and **Optional Virtual Tour Requirement V**: **custom OBJ file reader implementation**, required for 3D games.
- Enables the use of external models created in Blender, as per **Optional Requirement VII**.

---

### `scene.js` — 3D Scene Setup and Rendering

Centralizes the loading of all 3D models and textures, and defines how each object is drawn every frame.

**Main functions:**

#### `setupScene()` — async
Executed once during initialization:

1. **Loads OBJ models** via `loadOBJ()`: map (`backrooms.obj`), monster (`sahur.obj`) and key (`key.obj`).
2. **Loads textures** via `loadTexture()`:
   - Unit 0: `carpet.jpeg` → Backrooms carpet
   - Unit 1: `wallpaper.jpeg` → wallpaper
   - Unit 2: `sahur.png` → monster texture
   - Unit 3: `key.png` → key texture
3. **Uploads buffers to the GPU** via `gl.createBuffer()` + `gl.bufferData()`.
4. **Maps materials to textures**: map parts with material `"Carpet"` use unit 0; parts with material `"Wall"` use unit 1.
5. **Builds the door geometry** by calling `door.build()`.

#### `drawScene(projMat, viewMat)`
Called every frame by `render()`. Draws in the following order:

1. **Map** (`scene.parts`): each part with its corresponding texture and identity model matrix (the map doesn't move).
2. **Monster** (`scene.monsterParts`): with the dynamic transform from `monster.getTransform()`.
3. **Key** (`scene.key`): only if `!isKeyCaught` — disappears after being collected.
4. **Exit door** (`door.draw()`): object with solid color and animation.

**Relation to requirements:**
- Covers **General Requirement IV**: **textured objects** (map, monster and key are textured).
- Covers **General Requirement V**: **object with solid color** (the door uses `useSolidColor = true`).
- Covers **Game Requirement II**: 3D objects loaded from OBJ files.

---

### `monster.js` — Monster Artificial Intelligence

Implements the behavior of the **Tung Tung Sahur** using a three-state finite state machine.

**State Machine:**

```
[idle] ---(10s elapsed)---> [hunting] ---(player < detectRadius)---> [chasing]
                                  ^                                          |
                                  |---------(player > loseRadius)----------+
```

| State     | Behavior                                                                                                             |
|-----------|----------------------------------------------------------------------------------------------------------------------|
| `idle`    | Monster remains stationary for 10 seconds at the start of the game (giving the player time to explore before the threat begins). |
| `hunting` | Chases the player at normal speed (`normalSpeed = 1.8`). If the player gets within `detectRadius = 10u`, switches to `chasing`. |
| `chasing` | Chases the player at increased speed (`chaseSpeed = 2.8`). If the player flees beyond `loseRadius = 16u`, returns to `hunting`. If it reaches `killRadius = 0.7u`, calls `triggerGameOver()`. |

**Properties and methods:**

| Method                        | Description                                                                                                       |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------|
| `distToPlayer()`              | Calculates the 2D Euclidean distance (XZ) between the monster and the camera.                                    |
| `facePlayer()`                | Calculates `this.yaw` with `Math.atan2` so the monster always faces the player.                                  |
| `moveTowardPlayer(speed, dt)` | Moves the monster step by step toward the player, applying **collision detection** with the map using the same hitboxes used by the player. |
| `getTransform()`              | Returns the monster's model matrix: translation to `this.pos` + Y rotation (`this.yaw`) + uniform scale 0.75.    |
| `reset()`                     | Returns the monster to its initial position and state.                                                            |

**Relation to requirements:**
- Covers **General Requirement III**: **object animated by geometric transformations** — the monster moves in 3D space via dynamic translations calculated every frame.

---

### `door.js` — Animated Exit Door

Represents the escape room's exit door — the player's final objective.

**Properties and methods:**

| Property / Method        | Description                                                                                                       |
|--------------------------|-------------------------------------------------------------------------------------------------------------------|
| `pos`                    | Fixed door position in the world: `[0, 0, 4.05]`.                                                                |
| `baseColor`              | Base green color: `[0.05, 0.95, 0.45]`.                                                                          |
| `winRadius`              | Win detection radius: the player needs to get within 0.5 units of the door.                                      |
| `build()`                | Builds the door geometry as two quads (front and back) using `makeQuad()` and uploads the buffer to the GPU.     |
| `getTransform()`         | **Animation**: applies sinusoidal Y scale with `sin(totalTime * 2.0)`, making the door "pulse" vertically.       |
| `getCurrentColor()`      | **Animation**: modulates color brightness with `sin(totalTime * 2.0)`, making the green color vary from bright to dark. |
| `draw(projMat, viewMat)` | Calls `drawObject` with `solidColor = true` and the dynamically calculated color.                                |
| `checkWin()`             | Checks the camera-door distance every frame. If less than `winRadius` AND `isKeyCaught == true`, calls `triggerWin()`. |

**Relation to requirements:**
- Covers **General Requirement III**: **animated object** — pulsing scale and color via `Math.sin(totalTime * 2.0)`.
- Covers **General Requirement V**: **object with solid color** — drawn with `useSolidColor = 1` in the shader, without texture.

---

### `key.js` — Key Object and Collection Logic

Represents the key the player needs to find in order to escape.

**Properties and methods:**

| Property / Method    | Description                                                                                                       |
|----------------------|-------------------------------------------------------------------------------------------------------------------|
| `pos`                | Initial key position on the map: `[-6.3, 0.0, -3.2]`.                                                            |
| `radius`             | Collection radius: 0.5 units.                                                                                     |
| `getTransform()`     | **Animation**: applies pulsing Y scale with `sin(totalTime * 2.0)` — the key "floats" and pulses on the ground.  |
| `triggerCatchKey()`  | Sets `isKeyCaught = true`. Called when the player gets close to the key.                                         |
| `checkCatch()`       | Checks the camera-key distance every frame via `update()`. If less than `radius`, automatically collects the key. |
| `reset()`            | Repositions the key and clears `isKeyCaught`.                                                                    |

**Relation to requirements:**
- Covers **General Requirement III**: **object animated by geometric transformations** — pulsing scale via `Math.sin`.

---

## ✅ Requirements Mapping

### General Requirements (mandatory)

| Requirement | Description                                    | Implemented in                                                                                  | Status |
|-------------|------------------------------------------------|-------------------------------------------------------------------------------------------------|--------|
| I           | Camera with perspective projection             | `webgl-utils.js` (`createPerspective`, `createCamera`) + `camera.js`                           | ✅ |
| II          | Phong lighting + light source movement         | `game.js` (`render()` — `lightpos = camera.pos`) + GLSL shaders in `index.html`               | ✅ |
| III         | Object animated by geometric transformations   | `door.js` (sinusoidal scale), `key.js` (sinusoidal scale), `monster.js` (dynamic translation) | ✅ |
| IV          | Textured object                                | `scene.js` (map: `carpet.jpeg`, `wallpaper.jpeg`; monster: `sahur.png`; key: `key.png`)       | ✅ |
| V           | Object with solid color                        | `door.js` (green color via `solidColor` uniform)                                                | ✅ |
| VI          | Rendering exclusively with pure WebGL          | Entire graphics pipeline uses only WebGL 1.0 + math.js                                         | ✅ |
| VII         | HTML5 Canvas used only for graphics context    | `main.js` — `canvas.getContext("webgl")`                                                       | ✅ |
| VIII        | Keyboard and/or mouse interaction              | `input.js` (`keydown`/`keyup` + Pointer Lock API)                                              | ✅ |

### Specific 3D Game Requirements

| Requirement | Description                                    | Implemented in                                        | Status |
|-------------|------------------------------------------------|-------------------------------------------------------|--------|
| I           | First-person camera with movement              | `camera.js`                                           | ✅ |
| II          | 3D objects loaded from OBJ files               | `scene.js` (`backrooms.obj`, `sahur.obj`, `key.obj`) | ✅ |
| III         | Custom OBJ file reader                         | `obj-loader.js` (`loadOBJ`, `getHitboxFromOBJ`)       | ✅ |
| IV          | Free 3D models from the internet               | Models in `assets/models/`                            | ✅ |

---

## 🛠️ Technologies Used

| Technology           | Use                                        | Allowed by assignment        |
|----------------------|--------------------------------------------|------------------------------|
| **WebGL 1.0**        | Full graphics pipeline                     | ✅ (required)                 |
| **GLSL ES 1.0**      | Vertex and fragment shaders                | ✅                            |
| **math.js**          | Linear algebra (matrices and vectors)      | ✅ (explicitly allowed)       |
| **JavaScript**       | Game logic, I/O, OBJ loading              | ✅                            |
| **HTML5 Canvas**     | Graphics context                           | ✅                            |
| **Pointer Lock API** | Mouse capture                              | ✅ (event capture)            |

---

## 📝 License

This is an academic project developed for educational purposes. All 3D models used are free and available for non-commercial use.
