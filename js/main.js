const wordDisplay = document.getElementById('word');
const wordContainer = document.getElementById('word-container')
const readButton = document.getElementById('read-button');
const repeatButton = document.getElementById('repeat-button');
let keyboard;

const settings = {
    version: "1.0.2",
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
    wordDisplay.innerText = keyboard.getText();
    wordContainer.scrollLeft = wordContainer.scrollWidth - wordContainer.clientWidth;
}

// Function to read the word aloud
function readText() {
    let tmp = keyboard.getText().trim().toLocaleLowerCase();
    if (tmp !== '') {
        switch (tmp) {
            case 'info':
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
    keyboard.quickWord.filterQuickWords(''); // TODO IMPORVE
    updateText();
}

init();
