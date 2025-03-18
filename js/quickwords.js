class QuickWord {
    #quickWords = [];
    #sortedquickWords = [];

    constructor() {
        this.quickWordsContainer = document.getElementById('quick-words');
        this.loadFromStorage();
        this.setupImport();
        this.generateQuickWords();
    }

    loadFromStorage() {
        const storedWords = localStorage.getItem('dictionary');
        if(storedWords) {
            this.#quickWords = JSON.parse(storedWords);
        } 
        this.#sortedquickWords = [...this.#quickWords];
    }

    saveToStorage() {
        localStorage.setItem('dictionary', JSON.stringify(this.#quickWords));
    }

    addWord(word) {
        const normalized = word.trim().toLowerCase();
        if(!this.#quickWords.some(w => w.toLowerCase() === normalized)) {
            this.#quickWords.push(word.trim());
            this.#sortedquickWords = [...this.#quickWords]; 
            this.sortWords(); 
            this.saveToStorage();
            this.filterQuickWords('');
            this.generateQuickWords();
        }
    }

    removeWord(word) {
        const normalized = word.trim().toLowerCase();
        this.#quickWords = this.#quickWords.filter(w => w.toLowerCase() !== normalized);
        this.#sortedquickWords = [...this.#quickWords]; 
        this.sortWords(); 
        this.saveToStorage();
        this.filterQuickWords('');
        this.generateQuickWords();
    }

    sortWords() {
        this.#sortedquickWords.sort((a, b) => {
            if(a.length === b.length) {
                return a.localeCompare(b);
            }
            return a.length - b.length;
        });
    }

    setupImport() {
        document.getElementById('importInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if(file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const importedWords = JSON.parse(event.target.result);
                        const merged = [...new Set([...this.#quickWords, ...importedWords])];
                        this.#quickWords = merged;
                        this.saveToStorage();
                        this.filterQuickWords('');
                    } catch(error) {
                        alert('Errore durante l\'importazione: Formato file non valido');
                    }
                };
                reader.readAsText(file);
            }
        });
    }

    getWords() {
        return this.#quickWords;
    }

    generateQuickWords() {
        this.quickWordsContainer.innerHTML = '';
        this.#quickWords.slice(0, 20).forEach(word => {
            this.addQuickWord(word);
        });
        this.quickWordsContainer.scrollLeft = 0;
    }

    filterQuickWords(value) {
        this.quickWordsContainer.innerHTML = '';
        const filterText = value.toLowerCase().trim();
        
        if (filterText === '') {
            this.generateQuickWords();
            return;
        }
        
        this.#sortedquickWords.forEach(word => {
            if (word.toLowerCase().startsWith(filterText)) {
                this.addQuickWord(word)
            }
        });
        this.quickWordsContainer.scrollLeft = 0;
    }

    addQuickWord(word) {
        const div = document.createElement('DIV');
        div.classList.add('quick-word')
        div.textContent = word;
        this.quickWordsContainer.appendChild(div);
    }

    handleQuickWordClick(event) {
        if (event.target.classList.contains('quick-word')) {
            const word = event.target.textContent;
            const filterText = keyboard.getFilterText();
            if (filterText.length > 0) {
                keyboard.setText(keyboard.getText().slice(0, -filterText.length));
            }
            keyboard.insterQuickWord(word);
        }
    }

    wordExists(word) {
        const lowerWord = word.toLowerCase();
        return this.#quickWords.some(w => w.toLowerCase() === lowerWord);
    }
}

function handleAddWord() {
    const input = document.getElementById('dictInput');
    keyboard.quickWord.addWord(input.value);
    input.value = '';
}

function handleRemoveWord() {
    const input = document.getElementById('dictInput');
    keyboard.quickWord.removeWord(input.value);
    input.value = '';
}

function exportDictionary() {
    const dataStr = JSON.stringify(keyboard.quickWord.getWords());
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dictionary-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}