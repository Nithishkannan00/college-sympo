/**
 * STRUCTURA'26 — Clean Civil Engineering Structural Frame (Warren Truss / Space Frame)
 * Lightweight, high-performance canvas that responds smoothly to mouse and scroll.
 */

(function () {
  const container = document.getElementById('hero-canvas-bg');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width, height;
  let targetRotY = -0.25, targetRotX = 0.15;
  let rotY = -0.25, rotX = 0.15;

  function resize() {
    const rect = container.getBoundingClientRect();
    width = canvas.width = rect.width * (window.devicePixelRatio || 1);
    height = canvas.height = rect.height * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    const normX = (e.clientX / window.innerWidth) - 0.5;
    const normY = (e.clientY / window.innerHeight) - 0.5;
    targetRotY = normX * 0.4 - 0.25;
    targetRotX = normY * 0.3 + 0.15;
  });

  // Construct pure Civil Engineering Space Truss Geometry
  const nodes = [];
  const edges = [];
  const cols = 6;
  const rows = 3;
  const depthLayers = 2;
  const dx = 130, dy = 80, dz = 100;

  for (let z = 0; z < depthLayers; z++) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = (x - cols / 2 + 0.5) * dx;
        const py = (y - rows / 2 + 0.5) * dy;
        const pz = (z - depthLayers / 2 + 0.5) * dz;
        nodes.push({ x: px, y: py, z: pz, ox: px, oy: py, oz: pz });
      }
    }
  }

  const idx = (x, y, z) => z * (rows * cols) + y * cols + x;

  for (let z = 0; z < depthLayers; z++) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const c = idx(x, y, z);
        if (x < cols - 1) edges.push([c, idx(x + 1, y, z)]);
        if (y < rows - 1) edges.push([c, idx(x, y + 1, z)]);
        if (x < cols - 1 && y < rows - 1) {
          edges.push([c, idx(x + 1, y + 1, z)]);
          edges.push([idx(x + 1, y, z), idx(x, y + 1, z)]);
        }
        if (z < depthLayers - 1) {
          edges.push([c, idx(x, y, z + 1)]);
        }
      }
    }
  }

  let scrollOffset = 0;
  window.addEventListener('scroll', () => {
    scrollOffset = window.pageYOffset * 0.0008;
  }, { passive: true });

  function render() {
    rotX += (targetRotX - rotX) * 0.05;
    rotY += (targetRotY - rotY) * 0.05;

    const w = width / (window.devicePixelRatio || 1);
    const h = height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);

    const currentRotY = rotY + scrollOffset;
    const cosY = Math.cos(currentRotY);
    const sinY = Math.sin(currentRotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    const fov = 400;
    const centerX = w * 0.62;
    const centerY = h * 0.5;

    const projected = nodes.map(n => {
      const x1 = n.ox * cosY - n.oz * sinY;
      const z1 = n.ox * sinY + n.oz * cosY;
      const y1 = n.oy * cosX - z1 * sinX;
      const z2 = n.oy * sinX + z1 * cosX + 600;

      const scale = fov / z2;
      return {
        px: centerX + x1 * scale,
        py: centerY + y1 * scale
      };
    });

    // Draw structural steel truss lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(11, 14, 20, 0.18)';
    edges.forEach(([i, j]) => {
      const p1 = projected[i];
      const p2 = projected[j];
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.stroke();
    });

    // Draw node connection joints
    projected.forEach(p => {
      ctx.fillStyle = '#FF4500';
      ctx.fillRect(p.px - 2, p.py - 2, 4, 4);
    });

    requestAnimationFrame(render);
  }

  render();
})();
