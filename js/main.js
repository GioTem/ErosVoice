let text = '';
let lastText = text;
let filteredText = '';
const wordDisplay = document.getElementById('word');
const quickWordsContainer = document.getElementById('quick-words');

function init() {
    document.getElementById('clear-button').addEventListener('touchstart', startDeleteTimer);
    document.getElementById('clear-button').addEventListener('touchend', stopDeleteTimer);
    document.getElementById('clear-button').addEventListener('touchcancel', stopDeleteTimer);

    //showDuplicates(quickWords);
    generateQuickWords();
    //requestFullscreen();
}

function generateQuickWords() {
    quickWords.slice(0, 20).forEach(word => {
        addQuickWord(word)
    });
}

function filterQuickWords() {
    quickWordsContainer.innerHTML = ''; // Clear quick words container
    filteredText = filteredText.toLowerCase().trim();
    if (filteredText === '') {
        // Show all quick words if no filter text
        generateQuickWords();
        return;
    }
    const sortedArray = [...quickWords];
    sortedArray.sort((a, b) => a.length - b.length).forEach(word => {
        if (word.toLowerCase().startsWith(filteredText)) {
            addQuickWord(word)
        }
    });
}

function addQuickWord(word) {
    const div = document.createElement('div');
    div.textContent = word;
    div.onclick = function () {
        if (filteredText.length > 0) {
            text = text.slice(0, -1 * filteredText.length);
        }
        addLetter(word);
        addSpace();
    };
    quickWordsContainer.appendChild(div);
}

function addLetter(letter) {
    text += text.length > 0 ? letter.toLowerCase() : letter.charAt(0).toUpperCase() + letter.slice(1);;
    filteredText += letter;
    wordDisplay.value = text;
    filterQuickWords();
}

function addSpace() {
    text += ' ';
    filteredText = '';
    wordDisplay.value = text;
    filterQuickWords();
}

function deleteLastCharacter() {
    if (text.charAt(text.length - 1) === ' ') {
        text = text.slice(0, -1);
        deleteLastCharacter();
    }
    else {
        text = text.slice(0, -1);
    }
    filteredText = filteredText.slice(0, -1);
    wordDisplay.value = text;
    filterQuickWords();
}

// Function to read the word aloud
function readText() {
    lastText = text;
    text = text.trim();
    if (text !== '') {
        if (text.toLocaleLowerCase() !== 'tanti auguri eros') {
            // Create a SpeechSynthesisUtterance object to read the word
            const message = new SpeechSynthesisUtterance(text);
            // Use the default browser's speech synthesis
            window.speechSynthesis.speak(message);
            // Clear the read word
            text = '';
            wordDisplay.value = text; // Update the word display on the page
        }
        else {
            let count = 0;
            new JSConfetti().addConfetti()
            let interval = setInterval(() => {
                if (count >= 4) {
                    clearInterval(interval);
                    // Clear the read word
                    text = '';
                    wordDisplay.value = text; // Update the word display on the page
                }
                else {
                    new JSConfetti().addConfetti();
                    count++;
                }
            }, 3000);
            var audio = new Audio("audio/tanti_auguri_a_te.mp3");
            audio.play();
        }
        filteredText = '';
        filterQuickWords();
    }
}
// Function to read the word aloud
function repeatLastText() {
    if (lastText === '') return;
    text = lastText;
    wordDisplay.value = text; // Update the word display on the page
    lastText = '';
}

// Funzione per gestire il click prolungato sul pulsante clear
function startDeleteTimer() {
    pressTimer = setTimeout(function () {
        text = ''; // Svuota il campo di testo
        filteredText = ''; // Svuota il campo di filtro
        wordDisplay.value = text; // Aggiorna la visualizzazione della parola
        filterQuickWords(); // Filtra le parole rapide
    }, 1000); // Tempo in millisecondi per considerare un click prolungato
}

// Funzione per interrompere il timer del click prolungato
function stopDeleteTimer() {
    event.preventDefault();
    deleteLastCharacter();
    clearTimeout(pressTimer); // Interrompe il timer
}

init();
