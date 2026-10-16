// -----------------------------------------------------------------------------
// Description: Application bootstrap and initialization logic.
// Author: Janis Bedeicis
// Github: https://github.com/loom-framework
// E-mail: loom.framework@gmail.com
// Created: 2008
// -----------------------------------------------------------------------------

(() => {

  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    console.warn('TTS not supported');
    return;
  }

  let stopRequested = false;
  let reading = false;   // a reading session is active (playing or paused)
  let paused = false;

  const BLOCK_SELECTOR = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption';

  function clearHighlight() {
    document.querySelectorAll('.tts-active')
      .forEach(el => el.classList.remove('tts-active'));
  }

  function getBlocks(root) {
    return [...root.querySelectorAll(BLOCK_SELECTOR)]
      .filter(el => el.textContent.trim() && !el.closest('[data-tts-ignore]'));
  }

  function speakBlock(text, lang) {
    return new Promise(resolve => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = resolve;
      utterance.onerror = resolve;
      window.__ttsUtterance = utterance; // keeps a reference so Chrome doesn't drop onend
      speechSynthesis.speak(utterance);
    });
  }

  async function startReading(checkbox) {
    const root = document.querySelector('[data-tts-root]');

    if (!root) {
      checkbox.checked = false;
      return;
    }

    stopRequested = false;
    reading = true;
    paused = false;

    const lang = root.getAttribute('lang') || 'lv';
    const blocks = getBlocks(root);

    for (const block of blocks) {
      if (stopRequested) break;

      clearHighlight();
      block.classList.add('tts-active');
      block.scrollIntoView({ behavior: 'smooth', block: 'center' });

      await speakBlock(block.textContent.trim(), lang);
    }

    // finished (or cancelled): reset everything
    speechSynthesis.cancel();
    clearHighlight();
    reading = false;
    paused = false;

    checkbox.checked = false; // CSS switches the icon back
  }

  function pauseReading() {
    paused = true;
    speechSynthesis.pause(); // keeps position and highlight
  }

  function resumeReading() {
    paused = false;
    speechSynthesis.resume();
  }

  function findTtsCheckbox() {
    let checkbox = document.getElementById('ttsToggle');
    if (checkbox) return checkbox;

    for (const host of document.querySelectorAll('*')) {
      if (!host.shadowRoot) continue;
      checkbox = host.shadowRoot.querySelector('#ttsToggle');
      if (checkbox) return checkbox;
    }
    return null;
  }

  function init(attempt = 0) {
    const checkbox = findTtsCheckbox();

    if (!checkbox) {
      if (attempt < 20) setTimeout(() => init(attempt + 1), 100); // component may render late
      else console.warn('ttsToggle not found');
      return;
    }

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        // checked = play: resume if paused, otherwise start from the beginning
        paused ? resumeReading() : startReading(checkbox);
      } else if (reading) {
        // unchecked while reading = pause only
        pauseReading();
      }
    });

    // don't leave a paused/ongoing utterance behind when leaving the page
    window.addEventListener('beforeunload', () => speechSynthesis.cancel());
  }

  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('DOMContentLoaded', () => init());
  }

})();
