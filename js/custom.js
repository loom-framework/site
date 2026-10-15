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
        return;
    }

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

            speechSynthesis.speak(utterance);

        });

    }

    async function startReading(checkbox) {

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
                block.textContent.trim(),
                lang
            );

        }

        clearHighlight();

        speechSynthesis.cancel();

        if (checkbox) {
            checkbox.checked = false;
        }

    }

    function stopReading() {

        stopRequested = true;

        speechSynthesis.cancel();

        clearHighlight();

    }

    function findShadowCheckboxes(root = document) {

        const results = [];

        function scan(node) {

            if (!node) return;

            if (
                node.querySelectorAll
            ) {

                results.push(
                    ...node.querySelectorAll('#ttsToggle')
                );
            }

            node.querySelectorAll?.('*')
                .forEach(el => {

                    if (el.shadowRoot) {
                        scan(el.shadowRoot);
                    }

                });

        }

        scan(root);

        return results;
    }

    function wireCheckbox(checkbox) {

        if (checkbox.dataset.ttsBound) {
            return;
        }

        checkbox.dataset.ttsBound = 'true';

        checkbox.addEventListener('change', () => {

            if (checkbox.checked) {

                startReading(checkbox);

            } else {

                stopReading();

            }

        });

    }

    function init() {

        const checkboxes =
            findShadowCheckboxes();

        checkboxes.forEach(
            wireCheckbox
        );

    }

    window.addEventListener(
        'DOMContentLoaded',
        init
    );

})();
