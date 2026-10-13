/* Quick Power — GSAP motion layer (vanilla JS, no framework) */
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = matchMedia("(hover: none)").matches;

  /* ---------- map markers (positions from the Figma frame, relative to the map image) ---------- */
  const DOTS = [
    [582, 4924], [600, 4996], [504, 4819], [737, 4991], [541, 4955], [559, 5027], [463, 4850],
    [696, 5022], [560, 4873], [578, 4945], [482, 4768], [715, 4940], [633, 4932], [651, 5004],
    [555, 4827], [788, 4999], [574, 4984], [592, 5056], [496, 4879], [729, 5051], [471, 4898],
    [489, 4970], [393, 4793], [626, 4965], [560, 5060], [637, 4785], [482, 4955], [677, 5082],
  ];
  const MAP_X = -40, MAP_Y = 4466, MAP_W = 1575, MAP_H = 993;
  const dotsEl = document.querySelector(".dots");
  DOTS.forEach(([x, y]) => {
    const d = document.createElement("span");
    d.className = "dot";
    d.style.left = ((x - MAP_X) / MAP_W) * 100 + "%";
    d.style.top = ((y - MAP_Y) / MAP_H) * 100 + "%";
    d.innerHTML = "<b></b>";
    dotsEl.appendChild(d);
  });

  if (reduce) return; // static, fully readable page

  const smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.1,
    smoothTouch: 0.1,
    effects: false,
  });

  // anchor links → smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      smoother.scrollTo(target, true, "top top");
    });
  });

  document.fonts.ready.then(init);

  function init() {
    hero();
    about();
    services();
    stats();
    why();
    map();
    footer();
    hovers();
    ScrollTrigger.refresh();
  }

  /* helpers */
  const charsReveal = (el, trigger = el, extra = {}) => {
    const split = SplitText.create(el, { type: "chars", mask: "chars" });
    return gsap.from(split.chars, {
      yPercent: 110,
      duration: 1.1,
      ease: "power4.out",
      stagger: 0.035,
      scrollTrigger: { trigger, start: "top 85%" },
      ...extra,
    });
  };
  const linesReveal = (el) => {
    const split = SplitText.create(el, { type: "lines", mask: "lines", autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 105, duration: 1.1, ease: "power4.out", stagger: 0.1,
        scrollTrigger: { trigger: el, start: "top 85%" },
      }),
    });
    return split;
  };

  /* ================= HERO ================= */
  function hero() {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(".hero-bg img", { scale: 1.25, autoAlpha: 0, duration: 2.4, ease: "power2.out" })
      .from(".beam", { scaleY: 0, transformOrigin: "top center", duration: 1.6, ease: "expo.out" }, 0.25)
      .from(".hero-title .line > span", { yPercent: 110, duration: 1.3, stagger: 0.12 }, 0.5)
      .from(".pump", { y: 160, autoAlpha: 0, duration: 1.8, ease: "expo.out" }, 0.55)
      .from(".ghost-1", { xPercent: -25, autoAlpha: 0, duration: 1.8 }, 0.8)
      .from(".ghost-2", { xPercent: 25, autoAlpha: 0, duration: 1.8 }, 0.9)
      .from(".hero-nav .link", { y: -24, autoAlpha: 0, stagger: 0.1, duration: 1 }, 1.0)
      .from(".hero-side", { clipPath: "inset(0 0 100% 0)", autoAlpha: 0, duration: 1.4, ease: "power3.inOut" }, 1.1)
      .from(".btn-hero", { y: 40, autoAlpha: 0, duration: 1.1 }, 1.2);

    // beam breathing + pump gentle hover
    gsap.to(".beam", { opacity: 0.55, duration: 2.2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2 });
    gsap.to(".pump-layers", { y: -10, duration: 3.2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2 });

    // scroll parallax
    const st = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
    gsap.to(".hero-bg img", { yPercent: 14, scale: 1.08, ease: "none", scrollTrigger: st });
    // walking beam tilts on its bearing as you scroll, so the horsehead lifts the rod out of the well
    const ARM_MAX = 9;                       // degrees of beam tilt at full lift
    const HEAD_R = 630, IMG_H = 1290;        // pivot → bridle distance and image height, in source px
    const arm = document.querySelector(".pl-arm");
    const rods = document.querySelector(".pl-rod");
    const lift = { p: 0 };
    const liftEase = gsap.parseEase("sine.inOut");
    gsap.to(lift, {
      p: 1,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 30%", scrub: 0.8 },
      onUpdate: () => {
        const deg = ARM_MAX * liftEase(lift.p);
        gsap.set(arm, { rotate: -deg });
        gsap.set(rods, { yPercent: (-HEAD_R * Math.sin(deg * Math.PI / 180) / IMG_H) * 100 });
      },
    });
    gsap.to(".ghost-1", { x: () => -220 * unit(), ease: "none", scrollTrigger: st });
    gsap.to(".ghost-2", { x: () => 220 * unit(), ease: "none", scrollTrigger: st });
    gsap.to(".hero-title", { y: () => -120 * unit(), autoAlpha: 0.2, ease: "none", scrollTrigger: st });
    gsap.to(".hero-side", { y: () => -80 * unit(), ease: "none", scrollTrigger: st });

    // mouse parallax on desktop
    if (!isTouch) {
      const px = gsap.quickTo(".pump", "x", { duration: 1.2, ease: "power3" });
      const pr = gsap.quickTo(".pump", "rotate", { duration: 1.2, ease: "power3" });
      document.querySelector(".hero").addEventListener("mousemove", (e) => {
        const nx = e.clientX / innerWidth - 0.5;
        const ny = e.clientY / innerHeight - 0.5;
        px(nx * 24); pr(nx * 1.5 + ny * 0.5);
      });
    }
  }

  /* ================= ABOUT ================= */
  function about() {
    gsap.from(".eyebrow", { x: -30, autoAlpha: 0, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: ".about", start: "top 80%" } });
    gsap.from(".eyebrow i", { rotate: 180, scale: 0, duration: 1.2, ease: "back.out(2)",
      scrollTrigger: { trigger: ".about", start: "top 80%" } });
    charsReveal(document.querySelector(".about .h-xl"));
    gsap.from(".rule", { scaleX: 0, duration: 1.6, ease: "expo.inOut",
      scrollTrigger: { trigger: ".rule", start: "top 85%" } });

    // shape: endless slow spin + scroll-linked rotation on the wrapper
    gsap.to(".about-shape-spin", { rotate: 360, duration: 60, repeat: -1, ease: "none" });
    gsap.fromTo(".about-shape", { rotate: -40, scale: 0.85 }, {
      rotate: 40, scale: 1.05, ease: "none",
      scrollTrigger: { trigger: ".about-shape", start: "top bottom", end: "bottom top", scrub: 1 },
    });

    // word-by-word light-up
    document.querySelectorAll(".scrub-words").forEach((p) => {
      const split = SplitText.create(p, { type: "words" });
      gsap.fromTo(split.words, { opacity: 0.15 }, {
        opacity: 1, stagger: 0.1, ease: "none",
        scrollTrigger: { trigger: p, start: "top 82%", end: "bottom 55%", scrub: true },
      });
    });

    gsap.from(".logo-cell", { y: 60, autoAlpha: 0, duration: 1, stagger: 0.12, ease: "power3.out",
      scrollTrigger: { trigger: ".logos", start: "top 88%" } });
  }

  /* ================= SERVICES ================= */
  function services() {
    charsReveal(document.getElementById("services"));
    linesReveal(document.querySelector(".services-heading"));
    gsap.utils.toArray(".fade-up").forEach((el) =>
      gsap.from(el, { y: 50, autoAlpha: 0, duration: 1.2, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" } }));

    const cards = gsap.utils.toArray(".card");
    gsap.from(cards, { y: 120, autoAlpha: 0, rotateX: -18, transformPerspective: 900,
      duration: 1.3, stagger: 0.15, ease: "power4.out",
      scrollTrigger: { trigger: ".cards", start: "top 85%" } });
    gsap.from(".card-icon", { scale: 0, rotate: -90, duration: 1.1, stagger: 0.15, ease: "back.out(1.7)", delay: 0.35,
      scrollTrigger: { trigger: ".cards", start: "top 85%" } });
  }

  /* ================= STATS ================= */
  function stats() {
    gsap.fromTo(".stats-bg img", { yPercent: -8 }, { yPercent: 8, ease: "none",
      scrollTrigger: { trigger: ".stats-bg", start: "top bottom", end: "bottom top", scrub: true } });

    const tl = gsap.timeline({ scrollTrigger: { trigger: ".stats-card", start: "top 80%" },
      defaults: { ease: "power4.out" } });
    tl.from(".stats-card", { y: 120, scale: 0.94, autoAlpha: 0, duration: 1.4 })
      .from(".stat-label", { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 0.4)
      .from(".stat-bar", { scaleY: 0, stagger: 0.15, duration: 1.4, ease: "expo.out" }, 0.5)
      .from(".stat-num", { y: 30, autoAlpha: 0, stagger: 0.12, duration: 0.9 }, 0.7)
      .from(".stat-caption", { y: 20, autoAlpha: 0, duration: 1 }, 1);

    document.querySelectorAll(".stat-num").forEach((el, i) => {
      const end = parseFloat(el.dataset.count);
      const dec = +(el.dataset.decimals || 0);
      const suf = el.dataset.suffix || "";
      const o = { v: 0 };
      tl.to(o, { v: end, duration: 2, ease: "power2.out",
        onUpdate: () => (el.textContent = o.v.toFixed(dec) + suf) }, 0.7 + i * 0.12);
    });
  }

  /* ================= WHY ================= */
  function why() {
    charsReveal(document.querySelector(".stats .h-xl"));
    linesReveal(document.querySelector(".stats .p-md"));
    gsap.fromTo(".pattern-top img", { yPercent: -6 }, { yPercent: 6, ease: "none",
      scrollTrigger: { trigger: ".pattern-top", start: "top bottom", end: "bottom top", scrub: true } });
  }

  /* ================= MAP ================= */
  function map() {
    gsap.fromTo(".map-clip",
      { clipPath: "inset(12% 8% 12% 8% round 24px)" },
      { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none",
        scrollTrigger: { trigger: ".map", start: "top 90%", end: "top 20%", scrub: true } });
    gsap.fromTo(".map-inner", { scale: 1.18 }, { scale: 1, ease: "none",
      scrollTrigger: { trigger: ".map", start: "top bottom", end: "center center", scrub: true } });

    const dots = gsap.utils.toArray(".dot");
    gsap.from(dots, { scale: 0, autoAlpha: 0, duration: 0.6, ease: "back.out(3)",
      stagger: { each: 0.05, from: "random" },
      scrollTrigger: { trigger: ".map", start: "top 45%" },
      onComplete: () => {
        gsap.fromTo(".dot b", { scale: 1, opacity: 0.9 }, {
          scale: 3.6, opacity: 0, duration: 2, ease: "power2.out",
          repeat: -1, stagger: { each: 0.18, from: "random", repeat: -1 },
        });
      },
    });
  }

  /* ================= FOOTER ================= */
  function footer() {
    charsReveal(document.querySelector(".h-xxl"), ".footer", { stagger: 0.045 });
    gsap.from(".btn-footer", { y: 30, autoAlpha: 0, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: ".btn-footer", start: "top 92%" } });
    gsap.from(".foot-nav .link", { y: 40, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "power3.out",
      scrollTrigger: { trigger: ".foot-nav", start: "top 85%" } });
    gsap.from(".foot-bottom .p-sm", { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.1,
      scrollTrigger: { trigger: ".foot-bottom", start: "top 95%" } });
    gsap.fromTo(".wordmark img", { yPercent: 70 }, { yPercent: 0, ease: "none",
      scrollTrigger: { trigger: ".footer", start: "top 60%", end: "bottom bottom", scrub: true } });
    gsap.fromTo(".pattern-bottom img", { yPercent: -5 }, { yPercent: 5, ease: "none",
      scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: true } });
  }

  /* ================= HOVER MICRO-INTERACTIONS ================= */
  function hovers() {
    // underline links
    document.querySelectorAll(".link").forEach((a) => {
      const ul = a.querySelector(".ul");
      a.addEventListener("mouseenter", () =>
        gsap.fromTo(ul, { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, duration: 0.45, ease: "power3.out", overwrite: true }));
      a.addEventListener("mouseleave", () =>
        gsap.to(ul, { scaleX: 0, transformOrigin: "right", duration: 0.45, ease: "power3.out", overwrite: true }));
    });

    // buttons: magnetic pull + radial fill
    document.querySelectorAll(".btn").forEach((b) => {
      const fill = b.querySelector(".btn-fill");
      const label = b.querySelector("span");
      const bx = gsap.quickTo(b, "x", { duration: 0.6, ease: "power3" });
      const by = gsap.quickTo(b, "y", { duration: 0.6, ease: "power3" });
      const lx = gsap.quickTo(label, "x", { duration: 0.6, ease: "power3" });
      b.addEventListener("mouseenter", (e) => {
        const r = b.getBoundingClientRect();
        gsap.set(fill, { transformOrigin: `${e.clientX - r.left}px ${e.clientY - r.top}px`, borderRadius: "50%" });
        gsap.to(fill, { scale: 2.6, duration: 0.6, ease: "power3.out", overwrite: true });
      });
      b.addEventListener("mousemove", (e) => {
        if (isTouch) return;
        const r = b.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        bx(dx * 0.25); by(dy * 0.35); lx(dx * 0.12);
      });
      b.addEventListener("mouseleave", () => {
        gsap.to(fill, { scale: 0, duration: 0.5, ease: "power3.inOut", overwrite: true });
        bx(0); by(0); lx(0);
      });
    });

    // logo cells sheen
    document.querySelectorAll(".logo-cell").forEach((c) => {
      c.addEventListener("mouseenter", () =>
        gsap.fromTo(c, { "--sheen": "-110%" }, { "--sheen": "110%", duration: 0.9, ease: "power2.inOut" }));
    });

    // 3D tilt service cards
    if (isTouch) return;
    document.querySelectorAll(".card").forEach((c) => {
      const rx = gsap.quickTo(c, "rotateX", { duration: 0.6, ease: "power3" });
      const ry = gsap.quickTo(c, "rotateY", { duration: 0.6, ease: "power3" });
      const icon = c.querySelector(".card-icon");
      gsap.set(c, { transformPerspective: 900 });
      c.addEventListener("mouseenter", () => {
        gsap.to(c, { y: -10, backgroundColor: "rgba(145,207,224,0.3)", duration: 0.5, ease: "power3.out" });
        gsap.to(icon, { rotate: 90, duration: 0.8, ease: "power3.out" });
      });
      c.addEventListener("mousemove", (e) => {
        const r = c.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 12);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
      });
      c.addEventListener("mouseleave", () => {
        rx(0); ry(0);
        gsap.to(c, { y: 0, backgroundColor: "rgba(145,207,224,0.2)", duration: 0.6, ease: "power3.out" });
        gsap.to(icon, { rotate: 0, duration: 0.8, ease: "power3.out" });
      });
    });
  }

  function unit() {
    return Math.min(innerWidth, 1440) / 1440;
  }
})();
