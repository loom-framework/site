// -----------------------------------------------------------------------------
// Description: Application bootstrap and initialization logic.
// Author: Janis Bedeicis
// Github: https://github.com/loom-framework
// E-mail: loom.framework@gmail.com
// Created: 2008
// -----------------------------------------------------------------------------

(() => {

    let stopRequested = false;

    const BLOCK_SELECTOR =
        'h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption';

    function clearHighlight() {

        document
            .querySelectorAll('.tts-active')
            .forEach(el =>
                el.classList.remove('tts-active')
            );

    }

    function getBlocks(root) {

        return [
            ...root.querySelectorAll(BLOCK_SELECTOR)
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
            utterance.pitch = 1;

            utterance.onend = resolve;
            utterance.onerror = resolve;

            speechSynthesis.speak(
                utterance
            );

        });

    }

    async function startReading() {

        const checkbox =
            document.getElementById('ttsToggle');

        const root =
            document.querySelector('[data-tts-root]');

        if (!root) return;

        stopRequested = false;

        const lang =
            root.getAttribute('lang') || 'lv';

        const blocks =
            getBlocks(root);

        for (const block of blocks) {

            if (stopRequested) {
                break;
            }

            clearHighlight();

            block.classList.add('tts-active');

            block.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            await speakBlock(
                block.innerText.trim(),
                lang
            );

        }

        speechSynthesis.cancel();

        clearHighlight();

        if (checkbox) {
            checkbox.checked = false;
        }

    }

    function stopReading() {

        stopRequested = true;

        speechSynthesis.cancel();

        clearHighlight();

    }

    document.addEventListener(
        'change',
        e => {

            if (e.target.id !== 'ttsToggle') {
                return;
            }

            if (e.target.checked) {

                startReading();

            } else {

                stopReading();

            }

        }
    );

})();


