/* 추천 물건 캐러셀
   - 무한 루프 (앞뒤로 카드를 복제)
   - 이전/다음 버튼, 점(dot), 드래그·스와이프, 좌우 방향키
   - 자동 넘김: 3초 간격. 카드 위에 마우스를 올리면 멈춤
     (OS의 '동작 줄이기'가 켜져 있어도 넘어가며, 그때는 미끄러지는 효과만 생략)
   - 보이는 카드 수는 CSS가 화면 폭에 맞춰 정함 (최대 3장) */
(function () {
  'use strict';

  var AUTOPLAY_MS = 3000;        // 자동 넘김 간격 (1000 = 1초)
  var PAUSE_ON_HOVER = true;     // 카드 위에 마우스를 올리면 멈춤 (false면 항상 돎)

  var root = document.getElementById('recoCarousel');
  if (!root) return;

  var viewport = root.querySelector('.carousel-viewport');
  var track = root.querySelector('.carousel-track');
  var control = document.querySelector('.carousel-control');
  var dotsWrap = control.querySelector('.carousel-dots');
  var originals = Array.prototype.slice.call(track.children);
  var count = originals.length;
  if (!count) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- 무한 루프용 복제: [복제 세트][원본][복제 세트]
  function cloneSet(before) {
    var frag = document.createDocumentFragment();
    originals.forEach(function (li) {
      var c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      var a = c.querySelector('a');
      if (a) a.tabIndex = -1;
      frag.appendChild(c);
    });
    if (before) track.insertBefore(frag, track.firstChild);
    else track.appendChild(frag);
  }
  cloneSet(true);
  cloneSet(false);

  // --- 점(dot) 만들기
  var dots = originals.map(function (_, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'carousel-dot';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', (i + 1) + '번째 물건');
    b.addEventListener('click', function () { goTo(i); restart(); });
    dotsWrap.appendChild(b);
    return b;
  });

  var index = 0;          // 0 … count-1 (원본 기준)
  var pos = 0;            // 실제 위치 (복제 구간으로 잠시 넘어갈 수 있음)
  var animating = false;

  function step() {
    var first = track.children[0];
    var cs = getComputedStyle(track);
    var gap = parseFloat(cs.columnGap) || parseFloat(cs.gap) || 0;
    return first.getBoundingClientRect().width + gap;
  }
  function offsetFor(p) { return -(count + p) * step(); }
  function setX(x) { track.style.transform = 'translate3d(' + x + 'px,0,0)'; }

  function render(animate) {
    track.classList.toggle('is-animating', !!animate && !reduceMotion);
    setX(offsetFor(pos));
    dots.forEach(function (d, i) { d.setAttribute('aria-selected', i === index ? 'true' : 'false'); });
  }

  function normalize() {
    // 복제 구간으로 넘어갔으면 같은 카드의 원본 위치로 순간 이동
    if (pos >= count || pos < 0) {
      pos = ((pos % count) + count) % count;
      track.classList.remove('is-animating');
      setX(offsetFor(pos));
      void track.offsetWidth; // 전환 없이 바로 적용
    }
    animating = false;
  }

  function move(delta) {
    if (animating) normalize();
    pos += delta;
    index = ((pos % count) + count) % count;
    animating = true;
    render(true);
    if (reduceMotion) normalize();
  }
  function goTo(i) {
    // 가까운 방향으로 이동
    var d = i - index;
    if (d > count / 2) d -= count;
    if (d < -count / 2) d += count;
    if (d) move(d);
  }

  track.addEventListener('transitionend', function (e) {
    if (e.target === track && e.propertyName === 'transform') normalize();
  });

  // --- 버튼
  Array.prototype.forEach.call(control.querySelectorAll('.carousel-btn'), function (btn) {
    btn.addEventListener('click', function () {
      move(btn.getAttribute('data-dir') === 'prev' ? -1 : 1);
      restart();
    });
  });

  // --- 키보드
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { move(-1); restart(); e.preventDefault(); }
    if (e.key === 'ArrowRight') { move(1); restart(); e.preventDefault(); }
  });

  // --- 드래그 / 스와이프
  var drag = null;
  var suppressClick = false;

  viewport.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (animating) normalize();
    drag = { id: e.pointerId, startX: e.clientX, dx: 0, moved: false };
    stop();
  });
  viewport.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    drag.dx = e.clientX - drag.startX;
    if (!drag.moved && Math.abs(drag.dx) > 6) {
      drag.moved = true;
      try { viewport.setPointerCapture(drag.id); } catch (err) {}
      viewport.classList.add('is-dragging');
      track.classList.remove('is-animating');
    }
    if (drag.moved) setX(offsetFor(pos) + drag.dx);
  });
  function endDrag(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    var d = drag; drag = null;
    viewport.classList.remove('is-dragging');
    if (d.moved) {
      suppressClick = true;
      setTimeout(function () { suppressClick = false; }, 0);
      var n = Math.round(-d.dx / step());
      if (n === 0 && Math.abs(d.dx) > 60) n = d.dx < 0 ? 1 : -1;
      if (n > count) n = count;
      if (n < -count) n = -count;
      if (n) move(n); else render(true);
    }
    start();
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  // 드래그 직후에는 카드 링크가 눌리지 않게
  viewport.addEventListener('click', function (e) {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  // --- 자동 넘김
  var timer = null;
  var keyFocus = false;     // 키보드(Tab)로 캐러셀 안에 포커스가 있는 동안
  function paused() {
    if (!PAUSE_ON_HOVER) return false;
    if (keyFocus || drag) return true;
    try { return viewport.matches(':hover'); } catch (err) { return false; }  // 마우스가 카드 위에 있는 동안
  }
  function start() {
    stop();
    if (document.hidden || count < 2) return;
    timer = setInterval(function () { if (!paused()) move(1); }, AUTOPLAY_MS);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function restart() { start(); }

  // 키보드로 들어왔을 때만 멈춤. 마우스로 버튼을 누른 뒤 남는 포커스는 무시
  function isKeyFocus(el) { try { return el.matches(':focus-visible'); } catch (err) { return false; } }
  [root, control].forEach(function (el) {
    el.addEventListener('focusin', function (e) { keyFocus = isKeyFocus(e.target); });
    el.addEventListener('focusout', function () { keyFocus = false; });
  });
  document.addEventListener('visibilitychange', start);
  window.addEventListener('resize', function () { render(false); });

  render(false);
  start();
})();
