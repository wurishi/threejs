import * as webglUtils from '../webgl-utils';

function getTime() {
  return new Date().getTime() * 0.001;
}

function makeColorString(color: any) {
  return (
    color[0].toFixed(2) + ',' + color[1].toFixed(2) + ',' + color[2].toFixed(2)
  );
}

const darkColors = {
  base: '#DDD',
  background: '#444',
  cone: '#663',
  angleLines: '',
  angleNumbersInLight: '#AAA',
  angleNumbers: '#222',
  surfaceNormalOutline: '#444',
};
const lightColors = {
  base: '#000',
  background: '#FFF',
  cone: '#FFC',
  angleNumbersInLight: '#888',
  angleNumbers: '#EEE',
  surfaceNormalOutline: '#FFF',
};
const darkMatcher = window.matchMedia('(prefers-color-scheme: dark)');

function main() {
  const canvas = webglUtils.createCanvas();
  const ctx = canvas.getContext('2d');
  ctx.lineWidth = 1;
  const pixelSize = 6;
  const lineHeight = 14;

  const triangle = [
    { pos: [25, 0], color: [0.5, 0.75, 0.5], textOffset: [-2, -0.5] },
    { pos: [50, 35], color: [0.875, 0.085, 0.5], textOffset: [-10.5, 3] },
    { pos: [0, 30], color: [0.0625, 0.17, 0.5], textOffset: [-2, 5] },
  ];

  let numPixelsToDraw = 0;
  let triangleInfo: any = {
    numPixels: 0,
  };
  const frameRate = 1 / 60;
  let then = getTime();
  let delay = 0;
  let dirty = false;
  const resetTimer = 0;
  let isDarkMode = false;

  function render() {
    const colors = isDarkMode ? darkColors : lightColors;
    const now = getTime();
    const elapsedTime = now - then;
    then = now;

    delay -= elapsedTime;
    if (delay <= 0) {
      delay = frameRate;
      dirty = true;
    }

    if (dirty) {
      dirty = false;
      webglUtils.resizeCanvasToDisplaySize(canvas);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      {
        const { width, height } = canvas;
        const sw = width / 400;
        const sh = height / 300;
        const scale = Math.min(sw, sh);
        const w = width - 400 * scale;
        const h = height - 300 * scale;
        ctx.translate(w / 2, h / 2);
        ctx.scale(scale, scale);
      }

      ctx.font = '8pt monospace';

      ctx.save();
      ctx.translate(15.5, 55.5);
      triangleInfo = drawTriangle(triangle, numPixelsToDraw);
      ++numPixelsToDraw;

      ctx.fillStyle = colors.base;
      for (let ii = 0; ii < triangle.length; ++ii) {
        const tri = triangle[ii];
        ctx.fillText(
          'v' + ii + ': ' + makeColorString(tri.color),
          (tri.pos[0] + tri.textOffset[0]) * pixelSize,
          (tri.pos[1] + tri.textOffset[1]) * pixelSize
        );
      }

      if (numPixelsToDraw === triangleInfo.numPixels) {
        delay = 3.0;
        numPixelsToDraw = 0;
      } else {
        drawArrow(
          20,
          -20,
          triangleInfo.x + pixelSize * 0.5,
          triangleInfo.y + pixelSize * 0.5,
          5,
          2,
          4
        );
      }

      ctx.restore();

      ctx.fillStyle = colors.base;
      ctx.fillText(
        'v_color = ' + makeColorString(triangleInfo.color),
        10,
        lineHeight * 1
      );
      ctx.fillText('gl_FragColor = v_color', 10, lineHeight * 2);
    }

    requestAnimationFrame(render);
  }

  function drawArrow(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width: number,
    stem: number,
    tip: number
  ) {
    const dy = y1 - y2;
    const dx = x1 - x2;
    const len = Math.sqrt(dx * dx + dy * dy);
    ctx.save();
    ctx.fillStyle = '#ff40ff';
    // ctx.lineStyle = 'black';
    ctx.translate(x1, y1);
    ctx.rotate(Math.atan2(dy, dx) + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const h = width * 0.5;
    const b = len - width * tip;
    ctx.lineTo(h, 0);
    ctx.lineTo(h, b);
    const o = width * stem;
    ctx.lineTo(o, b);
    ctx.lineTo(0, len);
    ctx.lineTo(-o, b);
    ctx.lineTo(-h, b);
    ctx.lineTo(-h, 0);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawTriangle(triangle: any, numPixelsToDraw: number) {
    const results: any = {};
    let numPixelsDrawn = 0;
    ctx.strokeStyle = 'black';

    // find the highest and lowest points.
    let highNdx = 0;
    let lowNdx = 0;
    for (let ii = 1; ii < 3; ++ii) {
      if (triangle[ii].pos[1] < triangle[highNdx].pos[1]) {
        highNdx = ii;
      }
      if (triangle[ii].pos[1] > triangle[lowNdx].pos[1]) {
        lowNdx = ii;
      }
    }

    // deduce the mid point.
    const midNdx = 3 - (highNdx + lowNdx);

    function computeDelta(val0: number[], val1: number[]) {
      const delta = [];
      for (let ii = 0; ii < val0.length; ++ii) {
        delta.push(val0[ii] - val1[ii]);
      }
      return delta;
    }

    function computeStep(val: number[], steps: number) {
      const step = [];
      for (let ii = 0; ii < val.length; ++ii) {
        step.push(steps ? val[ii] / steps : 0);
      }
      return step;
    }

    function add(val: number[], add: number[]) {
      for (let ii = 0; ii < val.length; ++ii) {
        val[ii] += add[ii];
      }
    }

    const delta0 = computeDelta(triangle[lowNdx].pos, triangle[highNdx].pos);
    const delta1 = computeDelta(triangle[midNdx].pos, triangle[highNdx].pos);
    const delta2 = computeDelta(triangle[lowNdx].pos, triangle[midNdx].pos);

    let x0 = triangle[highNdx].pos[0];
    let x1 = triangle[highNdx].pos[0];
    let y = triangle[highNdx].pos[1];

    const varyingA = triangle[highNdx].color.slice(0);
    const varyingB = triangle[highNdx].color.slice(0);
    const vdelta0 = computeDelta(
      triangle[lowNdx].color,
      triangle[highNdx].color
    );
    const vdelta1 = computeDelta(
      triangle[midNdx].color,
      triangle[highNdx].color
    );
    const vdelta2 = computeDelta(
      triangle[lowNdx].color,
      triangle[midNdx].color
    );

    const midY = triangle[midNdx].pos[1];
    const lowY = triangle[lowNdx].pos[1];

    const slope0 = delta0[0] / delta0[1];
    let slope1 = delta1[0] / delta1[1];
    const slope2 = delta2[0] / delta2[1];

    const vstepA = computeStep(vdelta0, lowY - y);
    let vstepB = computeStep(vdelta1, midY - y);
    const vstepC = computeStep(vdelta2, lowY - midY);

    let endY = midY;
    for (let ii = 0; ii < 2; ++ii) {
      do {
        drawSpan(x0, x1, y, varyingA, varyingB);
        x0 += slope0;
        x1 += slope1;
        ++y;
        add(varyingA, vstepA);
        add(varyingB, vstepB);
      } while (y < endY);
      endY = lowY;
      slope1 = slope2;
      vstepB = vstepC;
    }

    results.numPixels = numPixelsDrawn;
    return results;

    function drawSpan(
      x0: number,
      x1: number,
      y: number,
      colorA: any,
      colorB: any
    ) {
      x0 = Math.floor(x0);
      x1 = Math.floor(x1);
      if (x0 > x1) {
        let t = x0;
        x0 = x1;
        x1 = t;
        t = colorA;
        colorA = colorB;
        colorB = t;
      }

      const delta = computeDelta(colorB, colorA);
      const step = computeStep(delta, x1 - x0);
      const color = colorA.slice(0);
      for (let x = x0; x <= x1; ++x) {
        drawPixel(x, y, color);
        add(color, step);
      }
    }

    function drawPixel(x: number, y: number, color: any) {
      if (numPixelsDrawn > numPixelsToDraw) {
        color = isDarkMode ? [0.3, 0.3, 0.3] : [1, 1, 1];
      }
      x *= pixelSize;
      y *= pixelSize;
      if (numPixelsDrawn === numPixelsToDraw) {
        results.x = x;
        results.y = y;
        results.color = color.slice(0);
      }
      ctx.fillStyle =
        'rgb(' +
        Math.floor(color[0] * 255) +
        ',' +
        Math.floor(color[1] * 255) +
        ',' +
        Math.floor(color[2] * 255) +
        ')';
      ctx.fillRect(x, y, pixelSize, pixelSize);
      ctx.strokeRect(x, y, pixelSize, pixelSize);
      ++numPixelsDrawn;
    }
  }

  render();
}

main();
