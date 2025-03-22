const wordDisplay = document.getElementById('word');
const wordContainerScrollWrapper = document.querySelector("#word-container > .scroll-wrapper");
const readButton = document.getElementById('read-button');
const repeatButton = document.getElementById('repeat-button');
const manageDictionaryButton = document.getElementById('manage-dictionary');
let keyboard;

const settings = {
    version: "1.1.0'",
    input_mode: Keyboard.mode.SINGLE_TAP_KEY,
    input_delay: 500 //ms
};

function init() {
    switch (settings.input_mode) {
        case Keyboard.mode.SINGLE_TAP_KEY:
            keyboard = new SingleTapKeyboard();
            break;
        case Keyboard.mode.TAP_AND_HOLD_KEY:
            keyboard = new TapAndHoldKeyboard(settings.input_delay);
            break;
        case Keyboard.mode.DRAG_AND_RELEASE_KEY:
            keyboard = new DragAndReleaseKeyboard();
            break;
        default:
            alert("Modalità di scrittura non supportata");
            return;
    }
    const eventList = ["touchstart", "touchend", "touchcancel"];
    // READ BUTTON
    eventList.forEach(el => readButton.addEventListener(el, ev => setTimeout(() => {
        if (ev.type == 'touchstart') {
            timer = setTimeout(() => {
                readText();
            }, settings.input_mode != Keyboard.mode.TAP_AND_HOLD_KEY ? 0 : settings.input_delay);
        }
        else {
            clearTimeout(timer);
        }
    }, settings.input_delay)));

    //REPEAT BUTTON
    eventList.forEach(el => repeatButton.addEventListener(el, ev => setTimeout(() => {
        if (ev.type == 'touchstart') {
            timer = setTimeout(() => {
                keyboard.repeatLastText();
            }, settings.input_mode != Keyboard.mode.TAP_AND_HOLD_KEY ? 0 : settings.input_delay);
        }
        else {
            clearTimeout(timer);
        }
    }, settings.input_delay)));
}

function updateText() {
    const currentText = keyboard.getText();
    wordDisplay.innerText = currentText;
    wordContainerScrollWrapper.scrollLeft = wordContainerScrollWrapper.scrollWidth - wordContainerScrollWrapper.clientWidth;
    manageDictionaryButton.style.display = currentText.trim().length > 0 ? 'block' : 'none';
}

// Function to read the word aloud
function readText() {
    let tmp = keyboard.getText().trim().toLocaleLowerCase();
    if (tmp !== '') {
        switch (tmp) {
            case 'eros info':
                alert("Software version: V" + settings.version);
                keyboard.clearText()
                break;
            case 'tanti auguri eros':
                let count = 0;
                new JSConfetti().addConfetti()
                let interval = setInterval(() => {
                    if (count >= 4) {
                        clearInterval(interval);
                        keyboard.clearText();
                    }
                    else {
                        new JSConfetti().addConfetti();
                        count++;
                    }
                }, 3000);
                var audio = new Audio("audio/tanti_auguri_a_te.mp3");
                audio.play();
                break;
            case 'eros db import':
                document.getElementById('importInput').click();
                keyboard.clearText();
                updateText();
                break;
            case 'eros db export':
                exportDictionary();
                keyboard.clearText();
                updateText();
                break;
            case 'eros db clear':
                localStorage.clear();
                break
            default:
                // Create a SpeechSynthesisUtterance object to read the word
                const message = new SpeechSynthesisUtterance(keyboard.getText());
                // Use the default browser's speech synthesis
                window.speechSynthesis.speak(message);
                keyboard.setLastText(keyboard.getText())
                keyboard.clearText();
                updateText();
                break;
        }
    }
    else {
        keyboard.clearText();
    }
    keyboard.clearFilterText()
    keyboard.quickWord.filterQuickWords('');
    updateText();
}

function openDictionaryModal() {
    const modal = document.getElementById('dictionary-modal');
    const wordList = document.getElementById('word-list');
    const text = keyboard.getText();

    const seen = new Set();
    const currentText = text.split(' ')
        .filter(w => w !== '')
        .filter(word => {
            const lower = word.toLowerCase();
            const isNew = !seen.has(lower);
            seen.add(lower);
            return isNew;
        });

    wordList.innerHTML = currentText
    .filter(word => {
        const trimmedWord = word.trim();
        return trimmedWord.length >= 2 && !keyboard.quickWord.wordExists(trimmedWord);
    })
    .map(word => `
        <label class="word-item">
            <input type="checkbox" checked>
            ${word}
        </label>
    `).join('');

    modal.style.display = 'block';

    document.getElementById('modal-ok').onclick = () => {
        const checkboxes = wordList.querySelectorAll('input:checked:not(:disabled)');
        checkboxes.forEach(checkbox => {
            const word = checkbox.parentElement.textContent.trim();
            if (!keyboard.quickWord.wordExists(word)) {
                keyboard.quickWord.addWord(word);
            }
        });
        modal.style.display = 'none';
    };

    document.getElementById('modal-cancel').onclick = () => {
        modal.style.display = 'none';
    };
}

document.getElementById('manage-dictionary').addEventListener('click', openDictionaryModal);

init();

