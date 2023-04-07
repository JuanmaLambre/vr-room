import * as THREE from 'three';

export namespace CanvasLogger {
  export let width = 0;
  export let height = 0;

  const PX_PER_UNIT = 300;
  const FONT_SIZE = 26;
  const TOP_MARGIN = 8;
  const BG_COLOR = '#ddddee';

  const lines: string[] = [];
  let context: CanvasRenderingContext2D;
  let texture: THREE.CanvasTexture;

  export function buildMaterial(geometry: THREE.BufferGeometry): THREE.MeshBasicMaterial {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.style.visibility = 'hidden';

    if (!geometry.boundingBox) geometry.computeBoundingBox();
    width = (geometry.boundingBox.max.x - geometry.boundingBox.min.x) * PX_PER_UNIT;
    height = (geometry.boundingBox.max.y - geometry.boundingBox.min.y) * PX_PER_UNIT;

    canvas.width = width;
    canvas.height = height;

    context = canvas.getContext('2d');
    context.font = `${FONT_SIZE}px Monospace`;

    texture = new THREE.CanvasTexture(canvas);
    let t = texture as THREE.Texture;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;

    draw();

    const material = new THREE.MeshBasicMaterial({ map: texture });
    return material;
  }

  export function log(...msgs: any[]) {
    const message = msgs.map(String).join(' ');
    lines.push(...message.split('\n'));

    const maxLines = Math.floor((height - TOP_MARGIN) / FONT_SIZE);
    if (lines.length > maxLines) lines.splice(0, lines.length - maxLines);

    if (context) draw();
  }

  function draw() {
    // Clear
    const borderSize = 5;
    context.fillStyle = 'black'; // Border color
    context.fillRect(0, 0, width, height);
    context.fillStyle = BG_COLOR; // Background color
    context.fillRect(borderSize, borderSize, width - borderSize * 2, height - borderSize * 2);

    // Write lines
    context.fillStyle = 'black'; // Text color
    lines.forEach((line, idx) => {
      context.fillText(line, 10, FONT_SIZE * (idx + 1) + TOP_MARGIN);
    });

    texture.needsUpdate = true;
  }
}

export const canvaslog = CanvasLogger.log;

export function error(...msgs: string[]) {
  console.error(...msgs);
}

export function warn(...msgs: string[]) {
  console.warn(...msgs);
}

export function info(...msgs: any[]) {
  console.log(...msgs);
}
