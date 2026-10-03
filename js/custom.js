// -----------------------------------------------------------------------------
// Description: Application bootstrap and initialization logic.
// Author: Janis Bedeicis
// Github: https://github.com/loom-framework
// E-mail: loom.framework@gmail.com
// Created: 2008
// -----------------------------------------------------------------------------

document.addEventListener("change", (e) => {
    if (e.target.id === "ttsToggle") {

        const root = document.querySelector('[data-tts-root][id="main"]');
        if (!root) return;

        const lang = root.getAttribute("lang") || "lv";
        const text = extractSemanticText(root);

        if (e.target.checked) {
            KineportSemanticTTS.speak(text, lang);
        } else {
            KineportSemanticTTS.stop();
        }
    }
});



