/* Your Favorite Plumbing — motion layer
   Vanilla JS, no dependencies. Everything is scroll-driven and every effect
   is skipped under prefers-reduced-motion, which leaves the page static but
   complete. The water run is filled here, segment by segment. */

(function () {
  'use strict';

  var doc = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clamp(n, min, max) {
    return n < min ? min : n > max ? max : n;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /* ------------------------------------------------------------------
     one loop for every scroll effect
     ------------------------------------------------------------------ */

  var tasks = [];
  var ticking = false;

  function run() {
    ticking = false;
    for (var i = 0; i < tasks.length; i++) tasks[i]();
  }

  function tick() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(run);
  }

  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', tick);

  /* ------------------------------------------------------------------
     reading progress
     ------------------------------------------------------------------ */

  (function progress() {
    if (reduce) return;
    var bar = doc.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    var fill = doc.createElement('span');
    bar.appendChild(fill);
    doc.body.appendChild(bar);

    tasks.push(function () {
      var max = doc.documentElement.scrollHeight - window.innerHeight;
      var value = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
      fill.style.transform = 'scaleX(' + value.toFixed(4) + ')';
    });
  })();

  /* ------------------------------------------------------------------
     reveals
     ------------------------------------------------------------------ */

  (function reveals() {
    var items = Array.prototype.slice.call(doc.querySelectorAll('.reveal'));
    if (!items.length) return;

    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    items.forEach(function (el) { observer.observe(el); });

    // Never leave content invisible if the observer never fires (hidden views,
    // restored scroll positions, very tall screenshots).
    window.setTimeout(function () {
      items.forEach(function (el) {
        var box = el.getBoundingClientRect();
        if (box.top < window.innerHeight) el.classList.add('is-in');
      });
    }, 2200);
  })();

  /* ------------------------------------------------------------------
     hero parallax
     ------------------------------------------------------------------ */

  (function heroParallax() {
    if (reduce) return;
    var hero = doc.querySelector('.hero');
    var layers = Array.prototype.slice.call(doc.querySelectorAll('.hero-layer'));
    if (!hero || !layers.length) return;

    tasks.push(function () {
      var y = window.scrollY;
      if (y > window.innerHeight * 1.6) return;
      layers.forEach(function (layer) {
        var depth = parseFloat(layer.getAttribute('data-depth')) || 0;
        if (depth < 0.2) return; // the back wall and the lamp stay put
        var offset = (y * depth * 0.18).toFixed(1);
        layer.style.transform = 'translate3d(0,' + offset + 'px,0)';
      });
    });
  })();

  /* ------------------------------------------------------------------
     cards that lean toward the pointer
     ------------------------------------------------------------------
     Any element with data-tilt lifts off the grid and tips a few degrees
     toward the cursor, with a sheen that follows it (--mx/--my feed the CSS
     radial gradient). Pointer only: touch and reduced motion get the plain
     4px lift from the stylesheet. */

  (function pointerTilt() {
    if (reduce) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var cards = Array.prototype.slice.call(doc.querySelectorAll('[data-tilt]'));
    if (!cards.length) return;

    var TILT = 5.5;

    cards.forEach(function (card) {
      var box = null;

      function paint(x, y) {
        if (!box || !box.width || !box.height) return;
        var px = clamp((x - box.left) / box.width, 0, 1);
        var py = clamp((y - box.top) / box.height, 0, 1);

        card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        card.style.transform =
          'perspective(900px)' +
          ' rotateX(' + ((0.5 - py) * TILT).toFixed(2) + 'deg)' +
          ' rotateY(' + ((px - 0.5) * TILT * 1.15).toFixed(2) + 'deg)' +
          ' translateY(-6px)';
      }

      card.addEventListener('pointerenter', function (event) {
        box = card.getBoundingClientRect();
        card.style.transition = 'transform .18s var(--ease), box-shadow .45s var(--ease), border-color .45s var(--ease)';
        card.classList.add('is-tilt');
        paint(event.clientX, event.clientY);
      });

      // Written straight to the element: a card must not freeze when the tab
      // throttles requestAnimationFrame.
      card.addEventListener('pointermove', function (event) {
        if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
        paint(event.clientX, event.clientY);
      });

      card.addEventListener('pointerleave', function () {
        card.classList.remove('is-tilt');
        card.style.transition = 'transform .42s var(--ease), box-shadow .45s var(--ease), border-color .45s var(--ease)';
        card.style.transform = '';
        box = null;
      });
    });
  })();

  /* ------------------------------------------------------------------
     the water run
     ═══════════════════════════════════════════════════════════════════
     Water is traced from the street main, into the house, out of the tank
     and down the drain. Each visible pipe is a <g class="seg" data-w="…">
     whose water core has pathLength="1"; filling it is a single
     stroke-dashoffset per segment, so there is nothing to measure. */

  (function waterRun() {
    var section = doc.querySelector('[data-build]');
    if (!section) return;

    var steps = Array.prototype.slice.call(section.querySelectorAll('.build-steps li'));
    var badge = section.querySelector('[data-badge]');
    var meter = section.querySelector('[data-meter]');

    var tank = section.querySelector('[data-tank]');
    var tankWater = section.querySelector('.w-tank__water');
    var tankGlow = section.querySelector('.w-tank__glow');

    var valveHandle = section.querySelector('.w-valve__handle');
    var needle = section.querySelector('.w-gauge__needle');

    // the order the water travels in, and the slice of the scroll it occupies
    var PLAN = [
      { name: 'main', from: 0.015, to: 0.22 },
      { name: 'house', from: 0.22, to: 0.46 },
      { name: 'hot', from: 0.46, to: 0.72 },
      { name: 'drain', from: 0.72, to: 0.97 }
    ];

    var groups = {};
    PLAN.forEach(function (plan) {
      var segs = Array.prototype.slice.call(section.querySelectorAll('.seg[data-w="' + plan.name + '"]'));
      plan.segs = segs.map(function (seg) { return seg.querySelector('.wet'); });
      groups[plan.name] = plan;
    });

    var flows = {};
    Array.prototype.slice.call(section.querySelectorAll('[data-flow]')).forEach(function (path) {
      flows[path.getAttribute('data-flow')] = path;
    });

    function fillGroup(plan, p) {
      var n = plan.segs.length;
      if (!n) return 1;
      var span = plan.to - plan.from;
      var last = 0;

      for (var i = 0; i < n; i++) {
        var start = plan.from + (i / n) * span;
        var step = (span / n) * 1.9;
        var f = easeOutCubic(clamp((p - start) / step, 0, 1));
        var core = plan.segs[i];
        if (core) core.style.strokeDashoffset = (1 - f).toFixed(4);
        last = f;
      }

      var flow = flows[plan.name];
      if (flow) flow.classList.toggle('is-live', last > 0.92);
      return last;
    }

    function paint(p) {
      PLAN.forEach(function (plan) { fillGroup(plan, p); });

      // the curb stop opens before anything moves
      if (valveHandle) {
        var opened = easeOutCubic(clamp(p / 0.06, 0, 1));
        valveHandle.setAttribute('transform', 'rotate(' + (-62 * opened).toFixed(1) + ' 111 398)');
      }

      // and the gauge climbs once water is inside the house
      if (needle) {
        var climb = easeOutCubic(clamp((p - 0.2) / 0.24, 0, 1));
        needle.setAttribute('transform', 'rotate(' + (-44 + 70 * climb).toFixed(1) + ' 170 272)');
      }

      // the tank fills, then warms
      if (tankWater) {
        var fill = clamp((p - 0.44) / 0.2, 0, 1);
        tankWater.style.transform = 'scaleY(' + fill.toFixed(4) + ')';
      }
      if (tank) {
        var hot = p > 0.62;
        tank.classList.toggle('is-hot', hot);
      }
      if (tankGlow) {
        tankGlow.style.opacity = (clamp((p - 0.62) / 0.12, 0, 1) * 0.28).toFixed(3);
      }

      var stage = p < 0.22 ? 0 : p < 0.46 ? 1 : p < 0.72 ? 2 : 3;
      if (badge) badge.textContent = '0' + (stage + 1);
      steps.forEach(function (li, index) {
        li.classList.toggle('is-on', index === stage);
      });
      if (meter) meter.style.transform = 'scaleX(' + clamp(p, 0.02, 1).toFixed(4) + ')';
    }

    function progressOf() {
      var box = section.getBoundingClientRect();
      var travel = box.height - window.innerHeight;
      if (travel <= 0) return 0;
      return clamp(-box.top / travel, 0, 1);
    }

    var mobile = window.matchMedia('(max-width: 980px)');
    var stageFromView = 0;

    // Phones get the scene driven by the step that is currently on screen,
    // because the section is not pinned there.
    if ('IntersectionObserver' in window) {
      var stepObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var index = steps.indexOf(entry.target);
          if (index >= 0) stageFromView = index;
        });
      }, { rootMargin: '-40% 0px -40% 0px' });

      steps.forEach(function (li) { stepObserver.observe(li); });
    }

    var last = -1;

    function update() {
      var p;
      if (mobile.matches) {
        p = [0.02, 0.33, 0.6, 0.92][stageFromView] || 0;
      } else {
        p = progressOf();
      }
      if (Math.abs(p - last) < 0.0015) return;
      last = p;
      paint(p);
    }

    if (reduce) {
      paint(1);
      return;
    }

    tasks.push(update);
    update();
  })();

  /* ------------------------------------------------------------------
     process rail — a hairline that fills as the steps go by
     ------------------------------------------------------------------ */

  (function processRail() {
    if (reduce) return;
    var section = doc.querySelector('#process');
    var rail = doc.querySelector('[data-rail]');
    if (!section || !rail) return;

    tasks.push(function () {
      var box = section.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      var span = box.height + window.innerHeight * 0.5;
      var p = clamp((window.innerHeight * 0.75 - box.top) / span, 0, 1);
      rail.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    });
  })();

  /* ------------------------------------------------------------------
     first frame
     ------------------------------------------------------------------ */

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
