window.Sections = {

  build() {
    this._buildChapter1();
    this._buildChapter2();
    this._buildChapter3();
    this._buildChapter4();
    this._buildChapter4b();
    this._buildChapter5();
    this._buildChapter6();
    this._buildChapterInstruments();
    this._buildChapter7();
    return document.querySelectorAll('#chapter-container .chapter').length;
  },

  // ─── Helper: append a chapter to the container ─────────────────────────────
  _append(section) {
    document.getElementById('chapter-container').appendChild(section);
  },

  // ─── CHAPTER 1: THE REVEAL ──────────────────────────────────────────────────
  _buildChapter1() {
    const s = document.createElement('section');
    s.className = 'chapter';
    s.id = 'chapter-1';
    s.dataset.chapter = '0';

    // Decorative background orb and ring
    const orb  = document.createElement('div'); orb.className  = 'hero-orb';
    const ring = document.createElement('div'); ring.className = 'hero-ring';
    s.appendChild(orb);
    s.appendChild(ring);

    const inner = document.createElement('div');
    inner.className = 'chapter-inner';

    const age = document.createElement('span');
    age.className = 'hero-age';
    age.textContent = String(CONFIG.recipient.age);

    const name = document.createElement('h1');
    name.className = 'hero-name';
    name.textContent = CONFIG.recipient.name;

    const sub = document.createElement('p');
    sub.className = 'hero-subtitle';
    sub.dataset.i18n = 'happy_birthday';
    sub.textContent = I18n.t('happy_birthday');

    const divider = document.createElement('hr');
    divider.className = 'hero-divider';

    inner.appendChild(age);
    inner.appendChild(name);
    inner.appendChild(sub);
    inner.appendChild(divider);
    s.appendChild(inner);
    this._append(s);
  },

  // ─── CHAPTER 2: THE MEDICAL STORY ──────────────────────────────────────────
  _buildChapter2() {
    const s = document.createElement('section');
    s.className = 'chapter';
    s.id = 'chapter-2';
    s.dataset.chapter = '1';

    const inner = document.createElement('div');
    inner.className = 'chapter-inner';

    // Medical cross symbol
    const cross = document.createElement('div');
    cross.className = 'medical-cross';

    // Story label
    const label = document.createElement('p');
    label.className = 'story-label';
    label.dataset.i18n = 'story_label';
    label.textContent = I18n.t('story_label') || 'Para la que eligió curar';

    // Story subtitle
    const subtitle = document.createElement('p');
    subtitle.className = 'story-subtitle';
    subtitle.dataset.i18n = 'story_subtitle';
    subtitle.textContent = I18n.t('story_subtitle') || 'Medicina · Vocación · Amor';

    // ECG wrapper with inline SVG
    const ecgWrapper = document.createElement('div');
    ecgWrapper.className = 'ecg-wrapper';
    // Build the SVG using createElementNS to avoid innerHTML
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'ecg-svg');
    svg.setAttribute('viewBox', '0 0 400 60');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');

    const ecgPath = document.createElementNS(ns, 'path');
    ecgPath.setAttribute('class', 'ecg-path');
    ecgPath.setAttribute('d',
      'M0,30 L40,30 L55,30 L65,12 L75,55 L82,3 L92,52 ' +
      'L102,30 L120,30 L140,30 L150,15 L160,48 L167,5 ' +
      'L177,50 L187,30 L220,30 L400,30'
    );

    const ecgDot = document.createElementNS(ns, 'circle');
    ecgDot.setAttribute('class', 'ecg-dot');
    ecgDot.setAttribute('r', '4');
    ecgDot.setAttribute('cx', '0');
    ecgDot.setAttribute('cy', '30');

    svg.appendChild(ecgPath);
    svg.appendChild(ecgDot);
    ecgWrapper.appendChild(svg);

    // Story text — filled via I18n
    const storyText = document.createElement('div');
    storyText.className = 'story-text';
    storyText.dataset.i18nStory = '';
    storyText.textContent = I18n.getStory ? I18n.getStory() : '';

    inner.appendChild(cross);
    inner.appendChild(label);
    inner.appendChild(subtitle);
    inner.appendChild(ecgWrapper);
    inner.appendChild(storyText);
    s.appendChild(inner);

    // Inject 8 floating particles into the medical chapter background
    const particleData = [
      { size: 3, left: '12%',  top: '75%', dur: '6s',  delay: '0s'   },
      { size: 2, left: '25%',  top: '80%', dur: '8s',  delay: '1.5s' },
      { size: 4, left: '50%',  top: '85%', dur: '7s',  delay: '0.8s' },
      { size: 2, left: '68%',  top: '78%', dur: '9s',  delay: '2.2s' },
      { size: 3, left: '82%',  top: '72%', dur: '6.5s',delay: '0.3s' },
      { size: 2, left: '38%',  top: '88%', dur: '7.5s',delay: '1.8s' },
      { size: 3, left: '75%',  top: '90%', dur: '8.5s',delay: '0.6s' },
      { size: 2, left: '15%',  top: '92%', dur: '7s',  delay: '2.8s' },
    ];

    particleData.forEach(p => {
      const dot = document.createElement('div');
      dot.className = 'med-particle';
      dot.style.cssText =
        'width:' + p.size + 'px; height:' + p.size + 'px; ' +
        'left:' + p.left + '; top:' + p.top + '; ' +
        'animation-duration:' + p.dur + '; ' +
        'animation-delay:' + p.delay + ';';
      s.appendChild(dot);
    });

    // Also inject the scanning loop line element
    const loopLine = document.createElement('div');
    loopLine.className = 'ecg-loop-line';
    // Position it at the ECG level — roughly 42% from top
    loopLine.style.cssText = 'position:absolute; top:42%; left:0; width:100%; height:2px;';
    s.appendChild(loopLine);

    this._append(s);
  },

  // ─── CHAPTER 3: THE GREETING ────────────────────────────────────────────────
  _buildChapter3() {
    const s = document.createElement('section');
    s.className = 'chapter';
    s.id = 'chapter-3';
    s.dataset.chapter = '2';

    const glowDiv = document.createElement('div');
    glowDiv.className = 'greeting-glow';
    s.appendChild(glowDiv);

    const inner = document.createElement('div');
    inner.className = 'chapter-inner';
    inner.style.position = 'relative';
    inner.style.zIndex   = '1';

    const greeting = document.createElement('h2');
    greeting.className = 'greeting-main';
    greeting.dataset.i18n = 'happy_birthday';
    greeting.textContent = I18n.t('happy_birthday');

    const ageLabel = document.createElement('p');
    ageLabel.className = 'greeting-age-label';
    ageLabel.dataset.i18nAgeLabel = '';
    ageLabel.textContent = CONFIG.recipient.age + ' ' + I18n.t('age_label');

    inner.appendChild(greeting);
    inner.appendChild(ageLabel);
    s.appendChild(inner);
    this._append(s);
  },

  // ─── CHAPTER 4: THE LETTER ──────────────────────────────────────────────────
  _buildChapter4() {
    const s = document.createElement('section');
    s.className = 'chapter';
    s.id = 'chapter-4';
    s.dataset.chapter = '3';

    const inner = document.createElement('div');
    inner.className = 'chapter-inner';
    inner.style.textAlign = 'left';

    const title = document.createElement('p');
    title.className = 'letter-title';
    title.dataset.i18n = 'letter_title';
    title.textContent = I18n.t('letter_title');

    const body = document.createElement('div');
    body.className = 'letter-body';
    body.dataset.i18nLetter = '';
    body.textContent = I18n.getLetter ? I18n.getLetter() : '';
    // Typewriter in animations.js fills this on chapter enter

    const sig = document.createElement('p');
    sig.className = 'letter-signature';
    sig.textContent = '\u2014 ' + CONFIG.author.name;

    const scrollHint = document.createElement('p');
    scrollHint.className = 'letter-scroll-hint';
    scrollHint.textContent = '\u2193';

    inner.appendChild(title);
    inner.appendChild(body);
    inner.appendChild(sig);
    s.appendChild(inner);
    s.appendChild(scrollHint);
    this._append(s);
  },

  _buildChapter4b() {
    // Only build if letter_p2 exists in config
    if (!CONFIG.letter_p2) return;

    const existingCount = document.querySelectorAll(
      '#chapter-container .chapter'
    ).length;

    const s = document.createElement('section');
    s.className = 'chapter';
    s.id = 'chapter-4b';
    s.dataset.chapter = String(existingCount);

    const inner = document.createElement('div');
    inner.className = 'chapter-inner';
    inner.style.textAlign = 'left';

    // Continuation label
    const cont = document.createElement('p');
    cont.className = 'letter-title';
    cont.style.cssText = 'opacity:0.4; font-size:0.6rem; letter-spacing:0.3em;';
    cont.textContent = '· · ·';

    // Letter body part 2 — typewriter will fill this
    const body2 = document.createElement('div');
    body2.className = 'letter-body';
    body2.dataset.i18nLetterP2 = '';
    // Starts empty — typewriter fills it on chapter enter

    // Signature — only on the second part
    const sig = document.createElement('p');
    sig.className = 'letter-signature';
    sig.textContent = '\u2014 Jose Avila';

    inner.appendChild(cont);
    inner.appendChild(body2);
    inner.appendChild(sig);
    s.appendChild(inner);
    this._append(s);
  },

  // ─── CHAPTER 5: MEMORIES ────────────────────────────────────────────────────
  _buildChapter5() {
    const s = document.createElement('section');
    s.className = 'chapter';
    s.id = 'chapter-5';
    s.dataset.chapter = '4';

    const inner = document.createElement('div');
    inner.className = 'chapter-inner';

    const sectionTitle = document.createElement('h3');
    sectionTitle.className = 'section-title';
    sectionTitle.dataset.i18n = 'memories_title';
    sectionTitle.textContent = I18n.t('memories_title');

    const timeline = document.createElement('div');
    timeline.className = 'memory-timeline';

    const memories = I18n.getMemories ? I18n.getMemories() : CONFIG.memories;
    memories.forEach((mem, i) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'memory-card-wrapper';

      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.memoryIndex = i;

      const emoji = document.createElement('span');
      emoji.className = 'memory-emoji';
      emoji.textContent = mem.emoji;

      const content = document.createElement('div');
      content.className = 'memory-content';

      const memTitle = document.createElement('p');
      memTitle.className = 'memory-title';
      memTitle.dataset.memoryTitle = '';
      memTitle.dataset.memoryIndex = i;
      memTitle.textContent = mem.title || mem.title;

      const memDesc = document.createElement('p');
      memDesc.className = 'memory-desc';
      memDesc.dataset.memoryDesc = '';
      memDesc.dataset.memoryIndex = i;
      memDesc.textContent = mem.description || mem.description;

      content.appendChild(memTitle);
      content.appendChild(memDesc);
      card.appendChild(emoji);
      card.appendChild(content);
      wrapper.appendChild(card);
      timeline.appendChild(wrapper);
    });

    inner.appendChild(sectionTitle);
    inner.appendChild(timeline);
    s.appendChild(inner);
    this._append(s);
  },

  // ─── CHAPTER 6: PHOTOS (conditional) ───────────────────────────────────────
  _buildChapter6() {
    // Skip entirely if all photo URLs are placeholders
    const hasRealPhotos = CONFIG.photos && CONFIG.photos.some(p =>
      p.url && !p.url.includes('PHOTO_URL') && p.url.trim() !== ''
    );
    if (!hasRealPhotos) return;

    const existingCount = document.querySelectorAll('#chapter-container .chapter').length;
    const s = document.createElement('section');
    s.className = 'chapter';
    s.id = 'chapter-6';
    s.dataset.chapter = String(existingCount);

    const inner = document.createElement('div');
    inner.className = 'chapter-inner';

    const sectionTitle = document.createElement('h3');
    sectionTitle.className = 'section-title';
    sectionTitle.dataset.i18n = 'photos_title';
    sectionTitle.textContent = I18n.t('photos_title');

    const grid = document.createElement('div');
    grid.className = 'photo-grid';

    const photos = I18n.getPhotos ? I18n.getPhotos() : CONFIG.photos;
    photos.forEach((photo, i) => {
      if (!photo.url || photo.url.includes('PHOTO_URL')) return;
      const fig = document.createElement('figure');
      fig.className = 'photo-item';
      const img = document.createElement('img');
      img.setAttribute('src', photo.url);
      img.setAttribute('alt', photo.caption || '');
      img.setAttribute('loading', 'lazy');
      img.onerror = function() { this.closest('.photo-item').style.display = 'none'; };
      const cap = document.createElement('figcaption');
      cap.className = 'photo-caption';
      cap.dataset.photoCaption = '';
      cap.dataset.photoIndex = i;
      cap.textContent = photo.caption || '';
      fig.appendChild(img);
      fig.appendChild(cap);
      grid.appendChild(fig);
    });

    inner.appendChild(sectionTitle);
    inner.appendChild(grid);
    s.appendChild(inner);
    this._append(s);
  },

  _buildChapterInstruments() {
    try {
      const existingCount = document.querySelectorAll(
        '#chapter-container .chapter'
      ).length;

      const s = document.createElement('section');
      s.className = 'chapter';
      s.id = 'chapter-instruments';
      s.dataset.chapter = String(existingCount);

      const inner = document.createElement('div');
      inner.className = 'chapter-inner';

      // Chapter title
      const title = document.createElement('p');
      title.className = 'instruments-title';
      title.textContent = 'Acordes & Teclas';

      // Subtitle
      const sub = document.createElement('p');
      sub.className = 'instruments-subtitle';
      sub.textContent = 'Los instrumentos que hablan sin palabras';

      // Instrument cards data
      const instruments = [
        {
          nameEs:   'Piano',
          nameEn:   'Piano',
          symbol:   '𝄞',      // Musical G-clef unicode symbol
          gradient: 'linear-gradient(135deg, #1a0a2e 0%, #3d1a5c 40%, #6b2fa0 100%)',
          accent:   '#c9a0dc'
        },
        {
          nameEs:   'Guitarra Acústica',
          nameEn:   'Acoustic Guitar',
          symbol:   '♪',
          gradient: 'linear-gradient(135deg, #2c1206 0%, #7a3b0a 40%, #c96a1a 100%)',
          accent:   '#f5c87a'
        },
        {
          nameEs:   'Guitarra Eléctrica',
          nameEn:   'Electric Guitar',
          symbol:   '♫',
          gradient: 'linear-gradient(135deg, #0a1a2e 0%, #0d3a5c 40%, #1a6b9a 100%)',
          accent:   '#7ec8e3'
        }
      ];

      const grid = document.createElement('div');
      grid.className = 'instruments-grid';

      instruments.forEach(inst => {
        const card = document.createElement('div');
        card.className = 'instrument-card';
        card.style.background = inst.gradient;

        // Large decorative symbol
        const sym = document.createElement('span');
        sym.className = 'instrument-symbol';
        sym.textContent = inst.symbol;
        sym.style.color = inst.accent;

        // Name overlay
        const label = document.createElement('div');
        label.className = 'instrument-label';

        const nameEs = document.createElement('span');
        nameEs.className = 'instrument-name';
        nameEs.textContent = inst.nameEs;
        nameEs.style.color = '#F5DEB3';

        const nameEn = document.createElement('span');
        nameEn.className = 'instrument-name-en';
        nameEn.textContent = inst.nameEn;
        nameEn.style.color = inst.accent;

        label.appendChild(nameEs);
        label.appendChild(nameEn);
        card.appendChild(sym);
        card.appendChild(label);
        grid.appendChild(card);
      });

      inner.appendChild(title);
      inner.appendChild(sub);
      inner.appendChild(grid);
      s.appendChild(inner);

      document.getElementById('chapter-container').appendChild(s);
    } catch(e) {
      // Silent fail — this chapter is optional
      console.warn('Instruments chapter build failed:', e);
    }
  },

  // ─── CHAPTER 7: THE CLOSING ─────────────────────────────────────────────────
  _buildChapter7() {
    const existingCount = document.querySelectorAll('#chapter-container .chapter').length;
    const s = document.createElement('section');
    s.className = 'chapter';
    s.id = 'chapter-7';
    s.dataset.chapter = String(existingCount);

    const inner = document.createElement('div');
    inner.className = 'chapter-inner';

    const closingText = document.createElement('p');
    closingText.className = 'closing-text';
    closingText.dataset.i18n = 'made_with_love';
    closingText.textContent = I18n.t('made_with_love');

    // Heart wrapper — explicit size so SVG cannot overflow
    const heartWrapper = document.createElement('div');
    heartWrapper.className = 'closing-heart-wrapper';
    heartWrapper.style.cssText =
      'width:72px; height:72px; margin:24px auto; position:relative; flex-shrink:0;';

    // SVG heart — MUST use createElementNS with explicit viewBox + dimensions
    const ns = 'http://www.w3.org/2000/svg';
    const heartSvg = document.createElementNS(ns, 'svg');
    heartSvg.setAttribute('viewBox', '0 0 24 24');
    heartSvg.setAttribute('width',  '72');
    heartSvg.setAttribute('height', '72');
    heartSvg.setAttribute('class', 'closing-heart');
    heartSvg.setAttribute('aria-hidden', 'true');
    heartSvg.style.cssText = 'width:72px; height:72px; display:block;';

    const heartPath = document.createElementNS(ns, 'path');
    heartPath.setAttribute('d',
      'M12 21.593c-5.63-5.539-11-10.297-11-14.402 ' +
      '0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 ' +
      '5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 ' +
      '2.54 0 5.274 1.621 5.274 5.181 ' +
      '0 4.069-5.136 8.625-11 14.402z'
    );
    heartPath.style.fill = 'var(--color-accent, #C9624F)';

    heartSvg.appendChild(heartPath);
    heartWrapper.appendChild(heartSvg);

    const closingFrom = document.createElement('p');
    closingFrom.className = 'closing-from';
    closingFrom.textContent = '\u2014 ' + CONFIG.author.name;

    inner.appendChild(closingText);
    inner.appendChild(heartWrapper);
    inner.appendChild(closingFrom);
    s.appendChild(inner);

    // Hidden signature comment
    s.appendChild(document.createComment(
      ' Hecho con amor \u2014 Made by ' + CONFIG.author.name + ' '
    ));

    this._append(s);
  }

};
