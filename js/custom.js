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
        console.warn('TTS not supported');
        return;
    }

    let stopRequested = false;

    const BLOCK_SELECTOR =
        'h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption';

    function getButton() {
        return document.querySelector('.tts-btn');
    }

    function getLabel() {
        return document.getElementById('ttsLabel');
    }

    function getIcon() {
        return document.getElementById('ttsIconPath');
    }

    function setPlayMode() {

        const btn = getButton();
        const label = getLabel();
        const icon = getIcon();

        btn?.classList.remove('active');

        if (label) {
            label.textContent = 'Read Aloud';
        }

        if (icon) {
            icon.setAttribute(
                'd',
                'M8 5v14l11-7z'
            );
        }
    }

    function setPauseMode() {

        const btn = getButton();
        const label = getLabel();
        const icon = getIcon();

        btn?.classList.add('active');

        if (label) {
            label.textContent = 'Stop Reading';
        }

        if (icon) {
            icon.setAttribute(
                'd',
                'M6 5h4v14H6zm8 0h4v14h-4z'
            );
        }
    }

    function clearHighlight() {

        document
            .querySelectorAll('.tts-active')
            .forEach(el =>
                el.classList.remove('tts-active')
            );

    }

    function getBlocks(root) {

        return [
            ...root.querySelectorAll(
                BLOCK_SELECTOR
            )
        ]
        .filter(el =>
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

    async function startReading(checkbox) {

        const root =
            document.querySelector('[data-tts-root]');

        if (!root) return;

        stopRequested = false;

        setPauseMode();

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
                behavior:'smooth',
                block:'center'
            });

            await speakBlock(
                block.textContent.trim(),
                lang
            );
        }

        speechSynthesis.cancel();

        clearHighlight();

        setPlayMode();

        if (checkbox) {
            checkbox.checked = false;
        }
    }

    function stopReading() {

        stopRequested = true;

        speechSynthesis.cancel();

        clearHighlight();

        setPlayMode();
    }

    function findTtsCheckbox() {

        let checkbox =
            document.getElementById('ttsToggle');

        if (checkbox)
            return checkbox;

        const hosts =
            document.querySelectorAll('*');

        for (const host of hosts) {

            if (!host.shadowRoot)
                continue;

            checkbox =
                host.shadowRoot.querySelector(
                    '#ttsToggle'
                );

            if (checkbox)
                return checkbox;
        }

        return null;
    }

    function init() {

        const checkbox =
            findTtsCheckbox();

        if (!checkbox) {
            console.warn(
                'ttsToggle not found'
            );
            return;
        }

        checkbox.addEventListener(
            'change',
            () => {

                if (
                    checkbox.checked
                ) {

                    startReading(
                        checkbox
                    );

                } else {

                    stopReading();
                }
            }
        );
    }

    window.addEventListener(
        'DOMContentLoaded',
        init
    );

})();
