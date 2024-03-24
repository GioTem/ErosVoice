class Keyboard {
    static mode = {
        SINGLE_TAP_KEY: 1,
        TAP_AND_HOLD_KEY: 2,
        DRAG_AND_RELEASE_KEY: 3,
    };
    constructor() {
        this.keyList = document.querySelectorAll('#keyboard > div > button:not([id*="clear-button"])');
        this.spacebarButton = document.getElementById('spacebar');
        this.clearButton = document.getElementById('clear-button');
        this.text = '';
        this.lastText = this.text;
        this.clearFilterText();
        this.quickWord = new QuickWord();
    }

    getText() { return this.text }
    setText(value) { this.text = value }

    getLastText() { return this.lastText }
    setLastText(value) { this.lastText = value }

    getFilterText() { return this.filterText }

    addLetter(value) {
        this.text += this.text.length > 0 ? value.toLowerCase() : value.charAt(0).toUpperCase() + value.slice(1);;
        this.filterText += value;
        updateText();
        this.quickWord.filterQuickWords(this.filterText);
    }

    addSpace() {
        if (this.text.length == 0 || this.text.charAt(this.text.length - 1) === ' ') return;
        this.text += ' ';
        this.clearFilterText();
        updateText();
        this.quickWord.filterQuickWords(this.filterText);
    }

    insterQuickWord(quickWord) {
        this.addLetter(quickWord);
        this.addSpace();
    }

    deleteLastCharacter() {
        if (this.text.charAt(this.text.length - 1) === ' ') {
            this.text = this.text.slice(0, -1);
        }
        else {
            this.text = this.text.slice(0, -1);
        }
        this.filterText = this.filterText.slice(0, -1);
        updateText();
        this.quickWord.filterQuickWords(this.filterText);
    }

    // Function to read the word aloud
    repeatLastText() {
        if (this.lastText === '') return;
        this.text = this.lastText;
        updateText();
        this.clearLastText();
    }

    clearText() {
        this.text = '';
    }

    clearLastText() {
        this.lastText = '';
    }

    clearFilterText() {
        this.filterText = '';
    }
}

class SingleTapKeyboard extends Keyboard {
    #eventList = ["touchstart", "touchend", "touchcancel"];
    #clearButtonTimer;
    constructor() {
        super();
        this.keyList.forEach(btn => {
            btn.addEventListener('touchstart', ev => this.handleKeyboardButtons(ev));
        });
        this.#eventList.forEach(el => this.clearButton.addEventListener(el, this.handleClearButton.bind(this)));
        this.quickWord.quickWordsContainer.addEventListener('click', this.quickWord.handleQuickWordClick); // TODO controllare se va bene click o bisogna usare il touchStart
    }

    // Funzione per gestire il click prolungato sul pulsante clear
    handleClearButton(ev) {
        if (ev.type == 'touchstart') {
            this.#clearButtonTimer = setTimeout(() => {
                this.clearFilterText();
                this.clearText();
                updateText();
                this.quickWord.filterQuickWords(this.filterText);
            }, 1000); // Tempo in millisecondi per considerare un click prolungato
        }
        else {
            ev.preventDefault();
            this.deleteLastCharacter();
            clearTimeout(this.#clearButtonTimer); // Interrompe il timer
        }
    }

    handleKeyboardButtons(ev) {
        const isSpacebarButtonPressed = ev.target.id == 'spacebar';
        if (isSpacebarButtonPressed) {
            this.addSpace();
        }
        else {
            this.addLetter(ev.target.textContent);
        }
    }
}

class TapAndHoldKeyboard extends Keyboard {
    #eventList = ["touchstart", "touchend", "touchcancel"];
    #clearButtonTimer;
    #clearButtonLongPressTimer;
    constructor(delay) {
        super();
        this.keyList.forEach(btn => {
            btn.addEventListener('touchstart', this.handleKeyboardButtons.bind(this));
            btn.addEventListener('touchend', this.handleKeyboardButtons.bind(this));
        });
        this.quickWord.quickWordsContainer.addEventListener('touchstart', this.handleKeyboardButtons.bind(this));
        this.quickWord.quickWordsContainer.addEventListener('touchend', this.handleKeyboardButtons.bind(this));
        this.#eventList.forEach(el => this.clearButton.addEventListener(el, this.handleClearButton.bind(this)));
        this.#eventList.forEach(el => this.clearButton.addEventListener(el, this.handleClearButtonLongPress.bind(this)));
        this.delay = delay; // Tempo in millisecondi per considerare un click prolungato
    }

    handleKeyboardButtons(ev) {
        const isSpacebarButtonPressed = ev.target.id == 'spacebar';
        const isQuickWordPressed = ev.target.classList.value == 'quick-word';
        if (ev.type == 'touchstart') {
            this.pressTimer = setTimeout(() => {
                if (isSpacebarButtonPressed) {
                    this.addSpace();
                }
                else if (isQuickWordPressed) {
                    this.insterQuickWord(ev.target.textContent)
                }
                else {
                    this.addLetter(ev.target.textContent);
                }
            }, this.delay);
        } else {
            clearTimeout(this.pressTimer);
        }
    }

    handleClearButton(ev) {
        if (ev.type == 'touchstart') {
            this.#clearButtonTimer = setTimeout(() => {
                ev.preventDefault();
                this.deleteLastCharacter();
            }, this.delay); // Tempo in millisecondi per considerare un click prolungato
        }
        else {
            clearTimeout(this.#clearButtonTimer); // Interrompe il timer
        }
    }

    handleClearButtonLongPress(ev) {
        if (ev.type == 'touchstart') {
            this.#clearButtonLongPressTimer = setTimeout(() => {
                this.clearFilterText();
                this.clearText();
                updateText();
                this.quickWord.filterQuickWords(this.filterText);
            }, this.delay*4); // Tempo in millisecondi per considerare un click prolungato
        }
        else {
            clearTimeout(this.#clearButtonLongPressTimer); // Interrompe il timer
        }
    }

}

class DragAndReleaseKeyboard extends Keyboard {
    constructor() {
        super();
    }
}