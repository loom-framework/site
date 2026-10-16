// -----------------------------------------------------------------------------
// Description: Application bootstrap and initialization logic.
// Author: Janis Bedeicis
// Github: https://github.com/loom-framework
// E-mail: loom.framework@gmail.com
// Created: 2008
// -----------------------------------------------------------------------------

(() => {
  if (!("speechSynthesis" in window)) return;

  const BLOCKS = "h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption";
  let runId = 0; // lets stop/restart cancel an old loop

  const clearHighlight = () =>
    document.querySelectorAll(".tts-active")
      .forEach(el => el.classList.remove("tts-active"));

  const speak = (text, lang) =>
    new Promise(resolve => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.onend = u.onerror = resolve;
      speechSynthesis.speak(u);
    });

  async function start(toggle) {
    const root = document.querySelector("[data-tts-root]");
    if (!root) { toggle.checked = false; return; }

    const myRun = ++runId;
    const lang = root.getAttribute("lang") || "lv";
    const blocks = [...root.querySelectorAll(BLOCKS)]
      .filter(el => el.textContent.trim() && !el.closest("[data-tts-ignore]"));

    for (const block of blocks) {
      if (myRun !== runId) return;               // stopped or restarted
      clearHighlight();
      block.classList.add("tts-active");
      block.scrollIntoView({ behavior: "smooth", block: "center" });
      await speak(block.textContent.trim(), lang);
    }

    if (myRun === runId) {                       // finished naturally
      clearHighlight();
      toggle.checked = false;                    // CSS switches the icon back
    }
  }

  function stop() {
    runId++;
    speechSynthesis.cancel();
    clearHighlight();
  }

  function findToggle() {
    const el = document.getElementById("ttsToggle");
    if (el) return el;
    for (const host of document.querySelectorAll("*")) {
      const found = host.shadowRoot?.getElementById("ttsToggle");
      if (found) return found;
    }
    return null;
  }

  function init() {
    const toggle = findToggle();
    if (!toggle) return;
    toggle.addEventListener("change", () =>
      toggle.checked ? start(toggle) : stop()
    );
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
