(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  // Mark JS ready — only hide fade-in elements when we know JS will reveal them.
  document.body.classList.add("js-ready");

  // Belt-and-suspenders: if for any reason reveal logic fails, force everything visible after 4s.
  setTimeout(() => {
    document.querySelectorAll(".fade-in:not(.is-visible)").forEach((el) => {
      const r = el.getBoundingClientRect();
      // Reveal anything that's been on-screen but never triggered, or anything within 2 viewports below.
      if (r.top < window.innerHeight * 2) el.classList.add("is-visible");
    });
  }, 4000);

  // ---------- Mobile nav toggle ----------
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      toggle.setAttribute("aria-expanded", String(!open));
    });
    nav.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        nav.setAttribute("data-open", "false");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---------- Current year ----------
  document.querySelectorAll("[data-current-year]").forEach(el => {
    el.textContent = String(new Date().getFullYear());
  });

  // ---------- Hero title split-text reveal ----------
  const splitTitle = (el) => {
    el.querySelectorAll(".hero-title-line, .hero-title-en").forEach((line) => {
      const text = line.textContent;
      line.textContent = "";
      Array.from(text).forEach((ch, i) => {
        const span = document.createElement("span");
        span.className = "char";
        span.style.transitionDelay = (i * 0.035) + "s";
        span.textContent = ch === " " ? " " : ch;
        line.appendChild(span);
      });
    });
  };
  const heroTitle = document.querySelector(".hero-title[data-split='hero']");
  if (heroTitle && !prefersReducedMotion) {
    splitTitle(heroTitle);
    // Stagger lines slightly by adding offset to en line
    const enLineChars = heroTitle.querySelectorAll(".hero-title-en .char");
    enLineChars.forEach((c, i) => { c.style.transitionDelay = (1.2 + i * 0.04) + "s"; });
    // Reveal after loader is dismissed (or after a delay if no loader)
    setTimeout(() => heroTitle.classList.add("is-revealed"),
      document.getElementById("loader") ? 2600 : 300);
  } else if (heroTitle) {
    heroTitle.classList.add("is-revealed");
  }

  // ---------- Hero video: hide poster when video plays ----------
  const heroVideo = document.getElementById("heroVideo");
  const heroPoster = document.getElementById("heroPoster");
  if (heroVideo && heroPoster) {
    const onReady = () => heroPoster.classList.add("is-loaded");
    if (heroVideo.readyState >= 3) onReady();
    else heroVideo.addEventListener("loadeddata", onReady, { once: true });
    heroVideo.addEventListener("playing", onReady, { once: true });
  }

  // ---------- Loader ----------
  const loader = document.getElementById("loader");
  const dismissLoader = () => {
    if (!loader || loader.dataset.done === "1") return;
    loader.dataset.done = "1";
    loader.classList.add("is-done");
    setTimeout(() => { loader.remove(); document.body.classList.add("is-loaded"); }, 900);
  };
  if (loader) {
    const minTime = prefersReducedMotion ? 300 : 2400;
    const start = performance.now();
    window.addEventListener("load", () => {
      const remain = Math.max(0, minTime - (performance.now() - start));
      setTimeout(dismissLoader, remain);
    });
    // Safety: dismiss after 6s even if "load" never fires
    setTimeout(dismissLoader, 6000);
  }

  // ---------- Custom cursor ----------
  if (!isCoarse && !prefersReducedMotion) {
    const cursor = document.querySelector(".cursor");
    if (cursor) {
      const dot = cursor.querySelector(".cursor-dot");
      const ring = cursor.querySelector(".cursor-ring");
      let mx = window.innerWidth / 2, my = window.innerHeight / 2;
      let rx = mx, ry = my;
      window.addEventListener("mousemove", (e) => {
        mx = e.clientX; my = e.clientY;
        if (dot) dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      });
      let rafId = null;
      let tickRunning = false;
      const tick = () => {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        if (ring) ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
        rafId = requestAnimationFrame(tick);
      };
      const startTick = () => { if (!tickRunning) { tickRunning = true; tick(); } };
      const stopTick = () => { if (rafId) { cancelAnimationFrame(rafId); rafId = null; tickRunning = false; } };
      startTick();
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopTick(); else startTick();
      });
      window.addEventListener("pagehide", stopTick);
      const setHover = (state) => cursor.classList.toggle("is-hover", state);
      document.querySelectorAll("a, button, [role='button'], input, textarea, select, label").forEach(el => {
        el.addEventListener("mouseenter", () => setHover(true));
        el.addEventListener("mouseleave", () => setHover(false));
      });
      window.addEventListener("mouseleave", () => cursor.style.opacity = "0");
      window.addEventListener("mouseenter", () => cursor.style.opacity = "1");
    }

    // ---------- Magnetic hover ----------
    document.querySelectorAll(".magnetic").forEach(el => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  // ---------- Fade-in via IntersectionObserver (runs immediately, no library dependency) ----------
  if ("IntersectionObserver" in window) {
    const fadeIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          fadeIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".fade-in").forEach((el) => fadeIO.observe(el));
  } else {
    document.querySelectorAll(".fade-in").forEach((el) => el.classList.add("is-visible"));
  }

  // ---------- GSAP + Lenis (wait for CDN libs) ----------
  const setupAdvanced = () => {
    const hasGSAP = typeof window.gsap !== "undefined";
    const hasST = typeof window.ScrollTrigger !== "undefined";
    const hasLenis = typeof window.Lenis !== "undefined";

    // Lenis smooth scroll (raf is driven by GSAP ticker — no separate loop)
    let lenis = null;
    if (hasLenis && !prefersReducedMotion) {
      lenis = new window.Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false
      });
    }

    if (hasGSAP && hasST) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      if (lenis) {
        lenis.on("scroll", window.ScrollTrigger.update);
        window.gsap.ticker.add((time) => { lenis.raf(time * 1000); });
        window.gsap.ticker.lagSmoothing(0);
      }

      // Fade-in handled by IntersectionObserver below (more reliable than GSAP ScrollTrigger for simple reveal)

      // Hero parallax (text)
      const heroContent = document.querySelector(".hero-content");
      if (heroContent) {
        window.gsap.to(heroContent, {
          y: 80,
          opacity: 0.5,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
        });
      }
      // Hero video parallax (slower)
      const heroVideoEl = document.querySelector(".hero-video");
      if (heroVideoEl) {
        window.gsap.to(heroVideoEl, {
          y: 120,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
        });
      }

      // (Photo parallax removed — images stay fixed within photo-block to prevent background reveal)

      // Stats counter (replace existing IO-based counter for GSAP smoothness)
      document.querySelectorAll("[data-count]").forEach((el) => {
        const target = parseInt(el.dataset.count, 10);
        const proxy = { v: 0 };
        window.gsap.to(proxy, {
          v: target,
          duration: 2.4,
          ease: "expo.out",
          onUpdate: () => { el.textContent = Math.round(proxy.v).toLocaleString(); },
          scrollTrigger: { trigger: el, start: "top 82%", toggleActions: "play none none none" }
        });
      });

      // (Fallback) Safety tower: scrub animation (rebuild on top of any prior style)
      const safetySection = document.querySelector(".safety-section");
      if (safetySection) {
        const paths = safetySection.querySelectorAll(".tower-path");
        paths.forEach((p) => {
          let len;
          if (p.tagName.toLowerCase() === "circle") {
            const r = parseFloat(p.getAttribute("r")) || 3;
            len = 2 * Math.PI * r;
          } else if (typeof p.getTotalLength === "function") {
            try { len = p.getTotalLength(); } catch (e) { len = 1000; }
          } else {
            len = 1000;
          }
          p.style.strokeDasharray = String(len);
          p.style.strokeDashoffset = String(len);
          p.style.transition = "none";
        });
        safetySection.dataset.anim = "running";
        window.gsap.to(paths, {
          strokeDashoffset: 0,
          stagger: { each: 0.06, from: "end" },
          duration: 2.6,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: safetySection,
            start: "top 40%",
            toggleActions: "play none none none",
            once: true
          }
        });
      }

      // Horizontal scroll (Services showcase)
      const hSection = document.querySelector(".horizontal-section");
      const hTrack = hSection?.querySelector(".horizontal-track");
      if (hSection && hTrack && window.innerWidth >= 769) {
        const panels = hTrack.querySelectorAll(".horizontal-panel, .horizontal-panel-intro");
        const progressBar = document.getElementById("horizontalProgressBar");
        const counter = document.getElementById("horizontalCounter");
        const totalPanels = panels.length - 1; // exclude intro from counter
        const getScrollAmount = () => hTrack.scrollWidth - window.innerWidth;

        window.gsap.to(hTrack, {
          x: () => -getScrollAmount(),
          ease: "none",
          scrollTrigger: {
            trigger: hSection,
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => "+=" + getScrollAmount(),
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (progressBar) progressBar.style.transform = "scaleX(" + self.progress + ")";
              if (counter) {
                const current = Math.max(1, Math.min(totalPanels, Math.ceil(self.progress * totalPanels) || 1));
                counter.textContent = String(current).padStart(2, "0") + " / " + String(totalPanels).padStart(2, "0");
              }
            }
          }
        });
      }

      // Cursor blob: track + secondary trail
      // (the existing .cursor-dot/.cursor-ring already gives goo blob via SVG filter — nothing more needed here)

      // After all triggers registered, refresh once everything (incl. images / video) settled
      window.requestAnimationFrame(() => {
        window.ScrollTrigger.refresh();
        window.addEventListener("load", () => window.ScrollTrigger.refresh(), { once: true });
        setTimeout(() => window.ScrollTrigger.refresh(), 1500);
      });
    } else {
      // Fallback: legacy IntersectionObserver if GSAP didn't load
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12, rootMargin: "0px 0px -80px 0px" });
        document.querySelectorAll(".fade-in").forEach((el) => io.observe(el));
      }
      // Fallback counter
      const counters = document.querySelectorAll("[data-count]");
      if (counters.length && "IntersectionObserver" in window) {
        const cIO = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            const duration = 1400;
            const startT = performance.now();
            const step = (now) => {
              const p = Math.min((now - startT) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              el.textContent = Math.round(target * eased).toLocaleString();
              if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
            cIO.unobserve(el);
          });
        }, { threshold: 0.4 });
        counters.forEach((el) => cIO.observe(el));
      }
      // Fallback safety tower
      const safetySection = document.querySelector(".safety-section");
      if (safetySection && "IntersectionObserver" in window) {
        const paths = safetySection.querySelectorAll(".tower-path");
        paths.forEach((p, i) => {
          const len = Math.ceil(p.getTotalLength?.() || 1000);
          p.style.strokeDasharray = String(len);
          p.style.strokeDashoffset = String(len);
          p.style.transition = `stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.08}s`;
        });
        safetySection.dataset.anim = "ready";
        const sIO = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            safetySection.dataset.anim = "running";
            paths.forEach((p) => { p.style.strokeDashoffset = "0"; });
            sIO.unobserve(entry.target);
          });
        }, { threshold: 0.18 });
        sIO.observe(safetySection);
      }
    }
  };

  // Wait briefly for CDN scripts to load (they're deferred)
  if (document.readyState === "complete") {
    setupAdvanced();
  } else {
    window.addEventListener("load", () => {
      setTimeout(setupAdvanced, 0);
    });
  }
})();
