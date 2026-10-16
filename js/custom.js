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

  const BLOCK_SELECTOR = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,section,article,nav,aside';

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

    const lang = root.getAttribute('lang') || 'lv';
    const blocks = getBlocks(root);

    for (const block of blocks) {
      if (stopRequested) break;

      clearHighlight();
      block.classList.add('tts-active');
      block.scrollIntoView({ behavior: 'smooth', block: 'center' });

      await speakBlock(block.textContent.trim(), lang);
    }

    speechSynthesis.cancel();
    clearHighlight();

    checkbox.checked = false; // CSS switches the icon back
  }

  function stopReading() {
    stopRequested = true;
    speechSynthesis.cancel();
    clearHighlight();
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
      checkbox.checked ? startReading(checkbox) : stopReading();
    });
  }

  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('DOMContentLoaded', () => init());
  }

})();
