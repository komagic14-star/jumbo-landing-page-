(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- Transfer demo ----- */
  const TOTAL_GB = 48.2,
    DURATION = 6000;
  const els = {
    fill: $("#fill"),
    bar: $("#bar"),
    sent: $("#sent"),
    speed: $("#speed"),
    eta: $("#eta"),
    state: $("#state"),
    done: $("#done"),
  };
  const ease = (t) => 1 - Math.pow(1 - t, 2.2);

  const render = (t) => {
    const p = ease(t);
    els.fill.style.width = `${p * 100}%`;
    els.bar.setAttribute("aria-valuenow", Math.round(p * 100));
    els.sent.textContent = (p * TOTAL_GB).toFixed(1);
    els.speed.textContent =
      t < 1 ? (6 + Math.sin(t * 24) * 1.5 + (1 - t) * 3).toFixed(1) : "0";
    els.eta.textContent = `${Math.max(0, Math.ceil(((1 - t) * DURATION) / 1000))}s`;
  };

  const run = () => {
    els.done.hidden = true;
    els.state.textContent = "Sending";
    if (reduce) return finish();
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / DURATION, 1);
      render(t);
      t < 1 ? requestAnimationFrame(tick) : finish();
    };
    requestAnimationFrame(tick);
  };

  const finish = () => {
    render(1);
    els.state.textContent = "Delivered";
    els.done.hidden = false;
  };

  $("#replay").addEventListener("click", run);
  run();

  /* ----- Number tween (instant for reduced motion) ----- */
  const animateNumber = (
    el,
    to,
    { duration = 500, decimals = 0, suffix = "" } = {},
  ) => {
    const from = parseFloat(el.textContent) || 0;
    if (reduce) {
      el.textContent = to.toFixed(decimals) + suffix;
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const value = from + (to - from) * (1 - Math.pow(1 - t, 3));
      el.textContent = value.toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ----- Pricing toggle ----- */
  const toggles = $$(".switch button");
  toggles.forEach((btn) =>
    btn.addEventListener("click", () => {
      const period = btn.dataset.period;
      toggles.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      $$("[data-month]").forEach((el) =>
        animateNumber(el, Number(el.dataset[period])),
      );
    }),
  );

  /* ----- Motion layer (skipped for reduced-motion users) ----- */
  if (reduce) return;

  // Scroll progress bar
  const progress = $("#progress");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Headline: words rise into place
  const h1 = $(".hero h1");
  h1.innerHTML = h1.textContent
    .trim()
    .split(/\s+/)
    .map(
      (word, i) =>
        `<span class="word" style="--d:${0.1 + i * 0.12}s"><span>${word}</span></span>`,
    )
    .join(" ");
  requestAnimationFrame(() =>
    requestAnimationFrame(() =>
      $$(".word", h1).forEach((w) => w.classList.add("in")),
    ),
  );

  // Reveal on scroll, staggered by position among siblings
  $$(
    ".features h2,.feature,.pricing .head,.plan,.faq h2,details,.cta h2,.cta .btn",
  ).forEach((el) => {
    el.dataset.reveal = "";
    el.style.setProperty(
      "--d",
      `${[...el.parentElement.children].indexOf(el) * 0.12}s`,
    );
  });
  const revealer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        revealer.unobserve(e.target);
      });
    },
    { threshold: 0.15 },
  );
  $$("[data-reveal]").forEach((el) => revealer.observe(el));

  // Stats count up once the band is visible
  const counters = $$("[data-count]");
  counters.forEach((el) => {
    el.textContent = `0${el.dataset.suffix || ""}`;
  });
  const countObs = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return;
      counters.forEach((el) =>
        animateNumber(el, Number(el.dataset.count), {
          duration: 1600,
          decimals: Number(el.dataset.decimals || 0),
          suffix: el.dataset.suffix || "",
        }),
      );
      countObs.disconnect();
    },
    { threshold: 0.4 },
  );
  countObs.observe($(".band"));

  // Transfer card tilts toward the pointer
  const card = $(".transfer");
  if (
    matchMedia("(hover: hover) and (pointer: fine)").matches &&
    innerWidth > 900
  ) {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) rotate(1.5deg)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  }

  // Drifting orange dots that scatter away from the pointer
  const cv = $("#dots"),
    ctx = cv.getContext("2d");
  const mouse = { x: -999, y: -999 };
  let w = 0,
    h = 0,
    dots = [];
  const resize = () => {
    const r = cv.parentElement.getBoundingClientRect(),
      dpr = devicePixelRatio || 1;
    w = r.width;
    h = r.height;
    cv.width = w * dpr;
    cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots = Array.from({ length: Math.round(w / 22) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1 + Math.random() * 2.2,
      vy: 0.15 + Math.random() * 0.4,
    }));
  };
  resize();
  addEventListener("resize", resize);
  cv.parentElement.addEventListener("pointermove", (e) => {
    const r = cv.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      d.y -= d.vy;
      if (d.y < -5) {
        d.y = h + 5;
        d.x = Math.random() * w;
      }
      const dx = d.x - mouse.x,
        dy = d.y - mouse.y,
        dist = Math.hypot(dx, dy);
      const near = dist > 0 && dist < 120;
      if (near) {
        d.x += (dx / dist) * 1.5;
        d.y += (dy / dist) * 1.5;
      }
      ctx.fillStyle = near ? "#ff6a00" : "rgba(255,106,0,.35)";
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  };
  draw();
})();
