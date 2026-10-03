// -----------------------------------------------------------------------------
// Description: Application bootstrap and initialization logic.
// Author: Janis Bedeicis
// Github: https://github.com/loom-framework
// E-mail: loom.framework@gmail.com
// Created: 2008
// -----------------------------------------------------------------------------

(() => {
 
let stopRequested = false;
 
const SELECTOR =
'h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption';
 
const checkbox = document.getElementById('ttsToggle');
 
function clearHighlight() {
 
document
.querySelectorAll('.tts-active')
.forEach(el =>
el.classList.remove('tts-active')
);
}
 
function getBlocks(root) {
 
return [
...root.querySelectorAll(SELECTOR)
].filter(el =>
el.textContent.trim() &&
!el.closest('[data-tts-ignore]')
);
}
 
function speakBlock(text, lang) {
 
return new Promise(resolve => {
 
const utterance =
new SpeechSynthesisUtterance(text);
 
utterance.lang = lang;
 
utterance.rate = 1;
 
utterance.onend = resolve;
utterance.onerror = resolve;
 
speechSynthesis.speak(utterance);
 
});
 
}
 
async function startReading() {
 
stopRequested = false;
 
const root =
document.querySelector('[data-tts-root]');
 
if (!root) return;
 
const lang =
root.getAttribute('lang') || 'lv';
 
const blocks =
getBlocks(root);
 
for (const block of blocks) {
 
if (stopRequested)
break;
 
clearHighlight();
 
block.classList.add('tts-active');
 
block.scrollIntoView({
behavior: 'smooth',
block: 'center'
});
 
await speakBlock(
block.textContent.trim(),
lang
);
}
 
speechSynthesis.cancel();
 
clearHighlight();
 
if (checkbox) {
checkbox.checked = false;
}
}
 
document.addEventListener('change', e => {
 
if (e.target.id !== 'ttsToggle')
return;
 
if (e.target.checked) {
 
startReading();
 
} else {
 
stopRequested = true;
 
speechSynthesis.cancel();
 
clearHighlight();
}
 
});
 
})();
