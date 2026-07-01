const canvas = document.getElementById("bg-canvas");
if (!canvas) return;

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  canvas.remove();
} else {
  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let particles = [];
  let raf = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const count = Math.min(120, Math.floor((width * height) / 12000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      a: Math.random() * 0.5 + 0.15,
      hue: Math.random() > 0.7 ? 190 : Math.random() > 0.5 ? 16 : 270,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${p.a})`;
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 100) {
          ctx.strokeStyle = `rgba(255, 106, 61, ${0.06 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    raf = requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      draw();
    }
  });
}
