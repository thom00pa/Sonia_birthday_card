'use strict';

(function () {
  window.I18n = {
    currentLang: 'es',

    t: function (key) {
      if (!window.CONFIG || !window.CONFIG.ui) {
        return key;
      }

      var strings = window.CONFIG.ui[this.currentLang];
      if (!strings || strings[key] === undefined) {
        return key;
      }

      return strings[key];
    },

    getLang: function () {
      return this.currentLang;
    },

    toggle: function () {
      this.currentLang = this.currentLang === 'es' ? 'en' : 'es';
      this.render();
    },

    getLetter: function () {
      if (!window.CONFIG) {
        return '';
      }

      return window.CONFIG.letter_p1
        ? window.CONFIG.letter_p1[this.currentLang]
        : (window.CONFIG.letter ? window.CONFIG.letter[this.currentLang] : '');
    },

    getLetter2: function () {
      if (!window.CONFIG || !window.CONFIG.letter_p2) return '';
      return window.CONFIG.letter_p2[this.currentLang] || '';
    },

    getStory: function () {
      if (!window.CONFIG || !window.CONFIG.story) {
        return '';
      }

      return window.CONFIG.story[this.currentLang] || '';
    },

    getMemories: function () {
      if (!window.CONFIG || !Array.isArray(window.CONFIG.memories)) {
        return [];
      }

      var lang = this.currentLang;
      return window.CONFIG.memories.map(function (memory) {
        return {
          id: memory.id,
          emoji: memory.emoji,
          title: memory.title && memory.title[lang] !== undefined ? memory.title[lang] : '',
          description: memory.description && memory.description[lang] !== undefined
            ? memory.description[lang]
            : ''
        };
      });
    },

    getPhotos: function () {
      if (!window.CONFIG || !Array.isArray(window.CONFIG.photos)) {
        return [];
      }

      var lang = this.currentLang;
      return window.CONFIG.photos.map(function (photo) {
        return {
          url: photo.url,
          caption: photo.caption && photo.caption[lang] !== undefined ? photo.caption[lang] : ''
        };
      });
    },

    render: function () {
      var card = document.getElementById('birthday-card') || document.getElementById('chapter-container');
      if (card) {
        card.classList.add('lang-transition');
        setTimeout(function () {
          card.classList.remove('lang-transition');
        }, 350);
      }

      var i18nElements = document.querySelectorAll('[data-i18n]');
      for (var i = 0; i < i18nElements.length; i++) {
        var element = i18nElements[i];
        element.textContent = this.t(element.dataset.i18n);
      }

      var letterElement = document.querySelector('[data-i18n-letter]');
      if (letterElement) {
        letterElement.textContent = this.getLetter();
      }

      // Update letter part 2 if it exists
      var letterBody2 = document.querySelector('[data-i18n-letter-p2]');
      if (letterBody2) {
        letterBody2.textContent = this.getLetter2();
      }

      var storyElements = document.querySelectorAll('[data-i18n-story]');
      for (var s = 0; s < storyElements.length; s++) {
        storyElements[s].textContent = this.getStory();
      }

      var memories = this.getMemories();
      var titleElements = document.querySelectorAll('[data-memory-title]');
      for (var t = 0; t < titleElements.length; t++) {
        var titleEl = titleElements[t];
        var titleIndex = parseInt(titleEl.dataset.memoryIndex, 10);
        if (!isNaN(titleIndex) && memories[titleIndex]) {
          titleEl.textContent = memories[titleIndex].title;
        }
      }

      var descElements = document.querySelectorAll('[data-memory-desc]');
      for (var d = 0; d < descElements.length; d++) {
        var descEl = descElements[d];
        var descIndex = parseInt(descEl.dataset.memoryIndex, 10);
        if (!isNaN(descIndex) && memories[descIndex]) {
          descEl.textContent = memories[descIndex].description;
        }
      }

      var photos = this.getPhotos();
      var captionElements = document.querySelectorAll('[data-photo-caption]');
      for (var p = 0; p < captionElements.length; p++) {
        var captionEl = captionElements[p];
        var photoIndex = parseInt(captionEl.dataset.photoIndex, 10);
        if (!isNaN(photoIndex) && photos[photoIndex]) {
          captionEl.textContent = photos[photoIndex].caption;
        }
      }

      var langBtn = document.getElementById('btn-lang');
      if (langBtn) {
        langBtn.textContent = this.t('translate_button');
      }
    }
  };
})();
