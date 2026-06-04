'use strict';

(function () {
  var PARTICLE_COLORS = [
    { r: 212, g: 132, b: 90 },
    { r: 232, g: 184, b: 125 },
    { r: 201, g: 98, b: 79 },
    { r: 242, g: 201, b: 138 },
    { r: 250, g: 240, b: 230 }
  ];

  var CONFETTI_COLORS = PARTICLE_COLORS.concat([{ r: 255, g: 255, b: 255 }]);

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var args = arguments;
      var context = this;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  window.Animations = {
    canvas: null,
    ctx: null,
    particleArray: [],
    animFrameId: null,
    confettiPieces: [],
    confettiFrameId: null,
    isReducedMotion: false,
    particlesActive: false,
    isPaused: false,
    typewriterRanForLang: null,
    typewriterIntervalId: null,
    chapter0ConfettiTimeout: null,

    init: function () {
      this.canvas = document.getElementById('particle-canvas');
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.particleArray = [];
      this.animFrameId = null;
      this.confettiPieces = [];

      this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      var self = this;
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          self._pauseLoops();
        } else {
          self._resumeLoops();
        }
      });
    },

    playOpeningSequence: function (onComplete) {
      setTimeout(function () {
        var loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
          loadingScreen.classList.add('hidden');
        }
      }, 500);

      setTimeout(function () {
        if (window.App && typeof window.App.goToChapter === 'function') {
          window.App.goToChapter(0);
        }
      }, 1300);

      setTimeout(function () {
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }, 1400);
    },

    startParticles: function () {
      if (this.isReducedMotion || !this.canvas || !this.ctx) {
        return;
      }

      this._sizeCanvas();
      this._createParticles(55);
      this.particlesActive = true;
      this.isPaused = false;

      var self = this;
      if (!this._resizeHandler) {
        this._resizeHandler = debounce(function () {
          self._sizeCanvas();
          self._redistributeParticles();
        }, 200);
        window.addEventListener('resize', this._resizeHandler);
      }

      this._startParticleLoop();
    },

    triggerConfetti() {
      if (this.isReducedMotion) return;

      // Re-size canvas fresh before confetti so mobile dimensions are correct
      const c = document.getElementById('particle-canvas');
      if (!c) return;

      // Use devicePixelRatio for crisp rendering on high-DPI mobile screens
      const dpr    = window.devicePixelRatio || 1;
      const W      = window.innerWidth;
      const H      = window.innerHeight;
      c.width      = W * dpr;
      c.height     = H * dpr;
      c.style.width  = W + 'px';
      c.style.height = H + 'px';
      const ctx = c.getContext('2d');
      ctx.scale(dpr, dpr);

      const colors = [
        '#D4845A','#E8B87D','#C9624F','#F2C98A','#FFFFFF','#FFD700'
      ];

      // Create confetti pieces — use logical pixels (W/H, not canvas pixels)
      const pieces = Array.from({ length: 90 }, () => ({
        x:      Math.random() * W,
        y:      Math.random() * -120 - 10,
        w:      5 + Math.random() * 11,
        h:      3  + Math.random() * 5,
        rot:    Math.random() * 360,
        rotSp:  (Math.random() - 0.5) * 10,
        vx:     (Math.random() - 0.5) * 4,
        vy:     2.5 + Math.random() * 5,
        color:  colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
      }));

      const start   = performance.now();
      const duration = 3500;
      let   rafId;

      const draw = (now) => {
        const elapsed = now - start;

        // Draw particles underneath — redraw full frame
        ctx.clearRect(0, 0, W, H);

        // Redraw regular particles on top of confetti canvas
        // (We reuse the same canvas, so draw confetti only)
        pieces.forEach(p => {
          p.x   += p.vx;
          p.y   += p.vy;
          p.rot += p.rotSp;

          // Fade out in the last 800ms
          if (elapsed > duration - 800) {
            p.opacity = Math.max(0, (duration - elapsed) / 800);
          }

          ctx.save();
          ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
          ctx.rotate((p.rot * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle   = p.color;
          // 3D effect: vary width by cosine of rotation
          const dispW = Math.abs(Math.cos((p.rot * Math.PI) / 180)) * p.w;
          ctx.fillRect(-dispW / 2, -p.h / 2, dispW, p.h);
          ctx.restore();
        });

        if (elapsed < duration) {
          rafId = requestAnimationFrame(draw);
        } else {
          // Clean up — restart the regular particle background
          ctx.clearRect(0, 0, W, H);
          // Re-initialize canvas dimensions for particles
          c.width      = W * dpr;
          c.height     = H * dpr;
          c.style.width  = W + 'px';
          c.style.height = H + 'px';
          ctx.scale(dpr, dpr);
        }
      };

      rafId = requestAnimationFrame(draw);
    },

    animateChapterEnter: function (chapterIndex) {
      const activeEl = document.querySelector('.chapter.is-active');
      const isReducedMotion = this.isReducedMotion;
      const I18n = window.I18n;

      if (chapterIndex === 0) {
        var self = this;
        if (this.chapter0ConfettiTimeout !== null) {
          clearTimeout(this.chapter0ConfettiTimeout);
        }
        this.chapter0ConfettiTimeout = setTimeout(function () {
          self.triggerConfetti();
          self.chapter0ConfettiTimeout = null;
        }, 1800);
        return;
      }

      if (activeEl && activeEl.id === 'chapter-4') {
        const body = activeEl.querySelector('[data-i18n-letter]');
        if (body) {
          const text = (typeof I18n !== 'undefined' && I18n.getLetter)
            ? I18n.getLetter() : '';
          body.textContent = '';
          body.style.opacity = '1';
          this.revealByParagraph(body, text);
        }
      }

      if (activeEl && activeEl.id === 'chapter-4b') {
        const body2 = activeEl.querySelector('[data-i18n-letter-p2]');
        if (body2) {
          const text2 = (typeof I18n !== 'undefined' && I18n.getLetter2)
            ? I18n.getLetter2() : '';
          body2.textContent = '';
          body2.style.opacity = '1';
          this.revealByParagraph(body2, text2);
        }
      }

      if (activeEl && activeEl.id === 'chapter-5') {
        this._animateMemoryCards();
      }
    },

    resetTypewriter: function () {
      var b1 = document.querySelector('[data-i18n-letter]');
      var b2 = document.querySelector('[data-i18n-letter-p2]');
      if (b1) b1.innerHTML = '';
      if (b2) b2.innerHTML = '';
      this._letterTyped   = false;
      this._letter2Typed  = false;
    },

    _sizeCanvas: function () {
      if (!this.canvas) {
        return;
      }
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    _createParticles: function (count) {
      this.particleArray = [];
      var width = this.canvas.width;
      var height = this.canvas.height;

      for (var i = 0; i < count; i++) {
        this.particleArray.push({
          x: randomBetween(0, width),
          y: randomBetween(0, height),
          radius: randomBetween(1.5, 4),
          colorRGB: pickRandom(PARTICLE_COLORS),
          opacity: randomBetween(0.15, 0.5),
          speedY: randomBetween(-0.7, -0.25),
          speedX: randomBetween(-0.12, 0.12),
          wobble: randomBetween(0, Math.PI * 2)
        });
      }
    },

    _redistributeParticles: function () {
      var width = this.canvas.width;
      var height = this.canvas.height;

      for (var i = 0; i < this.particleArray.length; i++) {
        this.particleArray[i].x = randomBetween(0, width);
        this.particleArray[i].y = randomBetween(0, height);
      }
    },

    _startParticleLoop: function () {
      if (this.animFrameId !== null) {
        cancelAnimationFrame(this.animFrameId);
      }
      var self = this;
      this._particleLoop = function () {
        if (!self.particlesActive || self.isPaused) {
          return;
        }
        self._drawParticles();
        self.animFrameId = requestAnimationFrame(self._particleLoop);
      };
      this._particleLoop();
    },

    _drawParticles: function () {
      var ctx = this.ctx;
      var width = this.canvas.width;
      var height = this.canvas.height;

      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < this.particleArray.length; i++) {
        var p = this.particleArray[i];
        p.wobble += 0.012;
        p.x += p.speedX + Math.sin(p.wobble) * 0.25;
        p.y += p.speedY;

        if (p.x < 0) {
          p.x = width;
        } else if (p.x > width) {
          p.x = 0;
        }
        if (p.y < 0) {
          p.y = height;
        } else if (p.y > height) {
          p.y = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.colorRGB.r + ',' + p.colorRGB.g + ',' + p.colorRGB.b + ',' + p.opacity + ')';
        ctx.fill();
      }

      if (this.confettiPieces.length > 0) {
        this._drawConfetti();
      }

      ctx.globalAlpha = 1;
    },

    _startConfettiLoop: function () {
      var self = this;
      this._confettiLoop = function () {
        if (self.isPaused) {
          self.confettiFrameId = requestAnimationFrame(self._confettiLoop);
          return;
        }

        self._updateConfetti();

        if (self.confettiPieces.length > 0) {
          self.confettiFrameId = requestAnimationFrame(self._confettiLoop);
        } else {
          self.confettiFrameId = null;
        }
      };
      this._confettiLoop();
    },

    _updateConfetti: function () {
      var height = this.canvas.height;
      var remaining = [];

      for (var i = 0; i < this.confettiPieces.length; i++) {
        var piece = this.confettiPieces[i];
        piece.x += piece.speedX;
        piece.y += piece.speedY;
        piece.rotation += piece.rotSp;

        if (piece.y <= height + 20) {
          remaining.push(piece);
        }
      }

      this.confettiPieces = remaining;
    },

    _drawConfetti: function () {
      var ctx = this.ctx;

      for (var i = 0; i < this.confettiPieces.length; i++) {
        var piece = this.confettiPieces[i];

        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate((piece.rotation * Math.PI) / 180);
        ctx.globalAlpha = piece.opacity;
        ctx.fillStyle = 'rgb(' + piece.color.r + ',' + piece.color.g + ',' + piece.color.b + ')';
        ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
        ctx.restore();
      }

      ctx.globalAlpha = 1;
    },

    _runTypewriter: function () {
      var letterBody = document.querySelector('.letter-body');
      if (!letterBody || !window.I18n || typeof window.I18n.getLetter !== 'function') {
        return;
      }

      var currentLang = typeof window.I18n.getLang === 'function'
        ? window.I18n.getLang()
        : null;

      if (this.typewriterRanForLang === currentLang) {
        return;
      }

      var text = window.I18n.getLetter();

      if (this.typewriterIntervalId !== null) {
        clearInterval(this.typewriterIntervalId);
        this.typewriterIntervalId = null;
      }

      letterBody.textContent = '';

      if (this.isReducedMotion) {
        letterBody.textContent = text;
        this.typewriterRanForLang = currentLang;
        return;
      }

      letterBody.classList.add('is-typing');
      var index = 0;
      var self = this;

      this.typewriterIntervalId = setInterval(function () {
        if (index < text.length) {
          letterBody.textContent += text.charAt(index);
          index += 1;
        } else {
          clearInterval(self.typewriterIntervalId);
          self.typewriterIntervalId = null;
          letterBody.classList.remove('is-typing');
          self.typewriterRanForLang = currentLang;
        }
      }, 26);
    },

    _animateMemoryCards: function () {
      var cards = document.querySelectorAll('.memory-card');

      for (var i = 0; i < cards.length; i++) {
        cards[i].classList.remove('is-visible');
      }

      for (var j = 0; j < cards.length; j++) {
        (function (card, delay) {
          setTimeout(function () {
            card.classList.add('is-visible');
          }, delay);
        })(cards[j], (j + 1) * 150);
      }
    },

    animateECG() {
      // Wait until the ECG path is visible in the DOM before animating
      const tryAnimate = (attempts) => {
        const ecgPath = document.querySelector('.ecg-path');
        const ecgDot  = document.querySelector('.ecg-dot');
        if (!ecgPath || !ecgDot) {
          if (attempts > 0) setTimeout(() => tryAnimate(attempts - 1), 100);
          return;
        }

        const totalLength = ecgPath.getTotalLength();
        if (totalLength === 0) {
          if (attempts > 0) setTimeout(() => tryAnimate(attempts - 1), 100);
          return;
        }

        // Set up the draw-in animation
        ecgPath.style.strokeDasharray  = totalLength;
        ecgPath.style.strokeDashoffset = totalLength;
        ecgPath.style.transition =
          'stroke-dashoffset 2.4s cubic-bezier(0.4, 0, 0.2, 1)';

        // Draw the ECG line
        requestAnimationFrame(() => {
          ecgPath.style.strokeDashoffset = '0';
        });

        // Animate the travelling dot along the path
        const dotDuration = 2400;
        const startTime = performance.now();

        const moveDot = (now) => {
          const elapsed  = now - startTime;
          const progress = Math.min(elapsed / dotDuration, 1);
          const point    = ecgPath.getPointAtLength(progress * totalLength);

          ecgDot.setAttribute('cx', point.x);
          ecgDot.setAttribute('cy', point.y);
          ecgDot.style.opacity = '1';

          if (progress < 1) {
            requestAnimationFrame(moveDot);
          } else {
            // Pulse the dot at the end of the line
            ecgDot.style.transition = 'r 0.8s ease-in-out';
            const pulse = setInterval(() => {
              const r = ecgDot.getAttribute('r');
              ecgDot.setAttribute('r', r === '4' ? '6' : '4');
            }, 800);
            // Store interval ID to clear it later if needed
            ecgDot._pulseInterval = pulse;
          }
        };

        setTimeout(() => requestAnimationFrame(moveDot), 200);
      };

      tryAnimate(10); // Try up to 10 times, 100ms apart
    },

    init3DTilt: function () {
      document.addEventListener('mousemove', (e) => {
        // Only apply tilt if chapter 5 (memories) is currently active
        const activeChapter = document.querySelector('.chapter.is-active');
        if (!activeChapter || activeChapter.id !== 'chapter-5') return;

        const cards = activeChapter.querySelectorAll('.memory-card');
        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const centerX = rect.left + rect.width  / 2;
          const centerY = rect.top  + rect.height / 2;
          const distX = e.clientX - centerX;
          const distY = e.clientY - centerY;
          const dist  = Math.sqrt(distX * distX + distY * distY);

          if (dist < 250) {
            const normX =  (distX / (rect.width  / 2));
            const normY = -(distY / (rect.height / 2));
            const rotY =  normX * 7;
            const rotX =  normY * 7;
            card.style.webkitTransform =
              `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
            card.style.transform =
              `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
            card.style.boxShadow = '0 20px 60px rgba(61,35,20,0.25)';
          } else {
            card.style.webkitTransform = '';
            card.style.transform = '';
            card.style.boxShadow = '';
          }
        });
      });
    },

    _pauseLoops: function () {
      this.isPaused = true;
      if (this.animFrameId !== null) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      if (this.confettiFrameId !== null) {
        cancelAnimationFrame(this.confettiFrameId);
        this.confettiFrameId = null;
      }
    },

    _resumeLoops: function () {
      if (!this.particlesActive) {
        return;
      }
      this.isPaused = false;
      if (this.animFrameId === null) {
        this._startParticleLoop();
      }
      if (this.confettiPieces.length > 0 && this.confettiFrameId === null) {
        this._startConfettiLoop();
      }
    },

    revealByParagraph: function(container, fullText) {
      // Split on double newline — each block is one paragraph
      const blocks = fullText.split(/\n\n+/).filter(function(b) {
        return b.trim().length > 0;
      });

      container.innerHTML = '';

      blocks.forEach(function(block, i) {
        var p = document.createElement('p');
        p.style.cssText = [
          'margin-bottom: 1.2em',
          'opacity: 0',
          '-webkit-transform: translateY(10px)',
          'transform: translateY(10px)',
          '-webkit-transition: opacity 0.6s ease, -webkit-transform 0.6s ease',
          'transition: opacity 0.6s ease, transform 0.6s ease',
          'white-space: pre-wrap'
        ].join(';');
        p.textContent = block.trim();
        container.appendChild(p);

        // Stagger each paragraph by 650ms
        setTimeout(function() {
          p.style.opacity = '1';
          p.style.webkitTransform = 'translateY(0)';
          p.style.transform = 'translateY(0)';
        }, 200 + i * 650);
      });
    }
  };
})();
