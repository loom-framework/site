// -----------------------------------------------------------------------------
// Description: Application bootstrap and initialization logic.
// Author: Janis Bedeicis
// Github: https://github.com/loom-framework
// E-mail: loom.framework@gmail.com
// Created: 2008
// -----------------------------------------------------------------------------

(() => {

    if (
        !('speechSynthesis' in window) ||
        !('SpeechSynthesisUtterance' in window)
    ) {
        console.warn('TTS nav pieejams');
        return;
    }

    let speaking = false;

    const SELECTOR =
        'h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption';

    function clearHighlight() {
        document
            .querySelectorAll('.tts-active')
            .forEach(el => el.classList.remove('tts-active'));
    }

    function getBlocks() {

        const root =
            document.querySelector('[data-tts-root]');

        if (!root) return [];

        return [...root.querySelectorAll(SELECTOR)]
            .filter(el => el.textContent.trim());
    }

    function speakBlock(text, lang) {

        return new Promise(resolve => {

            const utterance =
                new SpeechSynthesisUtterance(text);

            utterance.lang = lang;

            utterance.rate = 1;
            utterance.pitch = 1;

            utterance.onend = resolve;
            utterance.onerror = resolve;

            speechSynthesis.speak(utterance);

        });

    }

    async function speakPage() {

        const root =
            document.querySelector('[data-tts-root]');

        if (!root) return;

        const blocks = getBlocks();

        if (!blocks.length) return;

        speaking = true;

        const lang =
            root.getAttribute('lang') || 'lv';

        for (const block of blocks) {

            if (!speaking) break;

            clearHighlight();

            block.classList.add('tts-active');

            await speakBlock(
                block.innerText.trim(),
                lang
            );

        }

        clearHighlight();

        speaking = false;
    }

    function stopPage() {

        speaking = false;

        speechSynthesis.cancel();

        clearHighlight();
    }

    document.addEventListener('click', e => {

        const btn = e.target.closest('#tts-btn');

        if (!btn) return;

        if (speaking) {
            stopPage();
        } else {
            speakPage();
        }

    });

})();


