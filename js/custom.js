// -----------------------------------------------------------------------------
// Description: Application bootstrap and initialization logic.
// Author: Janis Bedeicis
// Github: https://github.com/loom-framework
// E-mail: loom.framework@gmail.com
// Created: 2008
// -----------------------------------------------------------------------------

// ===============================
//  Kineport Semantic TTS
//  Checkbox/Label version
// ===============================

const KineportSemanticTTS = (() => {

    let utterance = null;
    let isSpeaking = false;

    const TAG_MAP = {
        "H1": "\n\n",
        "H2": "\n\n",
        "H3": "\n",
        "H4": "\n",
        "H5": "\n",
        "H6": "\n",
        "P": "\n",
        "LI": "• ",
        "FIGCAPTION": "\n",
        "BLOCKQUOTE": "\nCitāts: ",
        "SECTION": "\n",
        "ARTICLE": "\n",
        "NAV": "\n",
        "ASIDE": "\n"
    };

    function extractSemanticText(root) {
        let output = "";

        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
            null,
            false
        );

        while (walker.nextNode()) {
            const node = walker.currentNode;

            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent.trim();
                if (text.length > 0) output += text + " ";
            }

            if (node.nodeType === Node.ELEMENT_NODE) {
                const tag = node.tagName;
                if (TAG_MAP[tag]) output += TAG_MAP[tag];
            }
        }

        return output.trim();
    }

    function speak(text, lang = "lv") {
        stop();

        utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 1;
        utterance.pitch = 1;

        utterance.onend = () => { isSpeaking = false; };
        utterance.onerror = () => { isSpeaking = false; };

        isSpeaking = true;
        speechSynthesis.speak(utterance);
    }

    function stop() {
        if (isSpeaking) {
            speechSynthesis.cancel();
            isSpeaking = false;
        }
    }

    function init() {

        // Klausāmies checkbox pārslēgšanos
        document.addEventListener("change", (e) => {
            if (e.target.id === "ttsToggle") {

                const root = document.querySelector('[data-tts-root][id="main"]');
                if (!root) return;

                const lang = root.getAttribute("lang") || "lv";
                const text = extractSemanticText(root);

                if (e.target.checked) {
                    speak(text, lang);
                } else {
                    stop();
                }
            }
        });
    }

    return { init, speak, stop };

})();

KineportSemanticTTS.init();


