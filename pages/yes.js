// VARS
const DPR = window.devicePixelRatio;
const colors = [
  ["#EC008C", "#f957b6"],
  ["#EF4136", "#ff7972"],
  ["yellow", "#fff"],
  ["lime", "#7aff7a"],
  ["#27AAE1", "#5ec8f2"],
  ["#662D91", "#a158d8"],
];
const tau = Math.PI * 2;
const start = Math.PI; // Start position
const finish = 0.5; // Finish (in % of circle "tau" basically ending at Math.PI * 2)
const inc = 0.003;
const rainbowHeight = 0.5; // of view height
const arcStagger = 0.05; // in %
const sparklesInPerStripe = 3;

let sparkles = [];
let radius;
let ctx;

// UTILS
const clamp = (min, max, val) => Math.min(Math.max(min, val), max);
const boolRandom = () => (Math.round(Math.random()) ? false : true);

// CANVAS
function sizeCanvas() {
  radius = clamp(15, 50, window.innerWidth / 60 / DPR);
  const canvas = document.getElementById("rainbow");
  canvas.width = window.innerWidth * DPR;
  canvas.height = window.innerHeight * DPR;
  ctx = canvas.getContext("2d");
}

// SPARKLE PROPS
function addRandom(lineWidth) {
  return (boolRandom() ? -1 : 1) * Math.random() * lineWidth;
}

function makeSparkle({ cx, cy, radiusX, radiusY, endAngle, lineWidth, color }) {
  return {
    x: cx + radiusX * Math.cos(endAngle) + addRandom(lineWidth),
    y: cy + radiusY * Math.sin(endAngle) + addRandom(lineWidth),
    opacity: 1,
    color,
    rad: Math.max(radius * Math.random() * DPR, 15),
  };
}

// ANIMATE
function animate(percent = 0) {
  const doneAnimatingIn = percent >= finish + arcStagger * colors.length;

  const width = window.innerWidth * DPR;
  const height = window.innerHeight * DPR;

  const lineWidth = (height * 0.5) / colors.length;
  const cx = width / 2;
  const startCy =
    height +
    lineWidth * rainbowHeight +
    (height - colors.length * lineWidth) / 3;
  const startRadiusX = width / 2 + colors.length * lineWidth * 2;
  const startRadiusY = height;

  ctx.clearRect(0, 0, width, height);
  ctx.globalAlpha = 1;
  ctx.lineWidth = lineWidth;

  for (let i = colors.length - 1; i > -1; i--) {
    const [colorLine, colorSparkle] = colors[i];
    const cy = startCy + i * (lineWidth / 2 - 1);
    const radiusX = startRadiusX - (i * lineWidth) / 2;
    const radiusY = startRadiusY - (i * lineWidth) / 2;
    const endAngle = tau * (percent - i * arcStagger) + start;
    const angle = clamp(start, tau * finish + start, endAngle);

    // Draw the rainbow arc
    ctx.beginPath();
    ctx.strokeStyle = colorLine;
    ctx.ellipse(cx, cy, radiusX, radiusY, 0, start, angle, false);
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.closePath();

    // Add sparkles
    if (!doneAnimatingIn) {
      for (let j = 0; j < sparklesInPerStripe; j++) {
        sparkles.push(
          makeSparkle({
            cx,
            cy,
            radiusX,
            radiusY,
            endAngle: angle,
            lineWidth,
            color: colorLine,
          })
        );
      }
    } else {
      sparkles.push(
        makeSparkle({
          cx,
          cy,
          radiusX,
          radiusY,
          endAngle: Math.random() * Math.PI + Math.PI,
          lineWidth,
          color: boolRandom() ? "#fff" : colorSparkle,
        })
      );
    }
  }

  // Draw sparkles
  const nextSparkles = [];
  for (let i = 0, len = sparkles.length; i < len; i++) {
    const { x, y, opacity, color, rad } = sparkles[i];
    ctx.beginPath();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.arc(x - rad, y - rad, rad, 0, Math.PI / 2);
    ctx.arc(x - rad, y + rad, rad, (3 * Math.PI) / 2, 2 * Math.PI);
    ctx.arc(x + rad, y + rad, rad, Math.PI, (3 * Math.PI) / 2);
    ctx.arc(x + rad, y - rad, rad, Math.PI / 2, Math.PI);
    ctx.fill();

    if (opacity > 0.2 && rad > 0.2) {
      nextSparkles.push({
        x,
        y,
        opacity: opacity - 0.03,
        rad: rad - 0.2,
        color,
      });
    }
  }
  sparkles = nextSparkles;

  if (!doneAnimatingIn) {
    requestAnimationFrame(() => animate(percent + inc));
  } else {
    // Mostrar el GIF después de la animación del arcoiris
    setTimeout(() => {
      document.querySelector(".gif-container").classList.add("visible");
    }, 500); // Retraso de 500 ms después de que termine la animación del arcoiris
    requestAnimationFrame(() => animate(finish + colors.length * arcStagger));
  }
}

// Initialize and start animation
sizeCanvas();
window.addEventListener("resize", sizeCanvas);
requestAnimationFrame(() => animate());
