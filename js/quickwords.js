class QuickWord {
    #quickWords = [];
    #sortedquickWords = [];

    constructor() {
        this.quickWordsContainer = document.getElementById('quick-words');
        this.loadFromStorage();
        this.setupImport();
        this.filterQuickWords('');
    }

    loadFromStorage() {
        const storedData = sessionStorage.getItem('languageData');
        if(storedData) {
            const data = JSON.parse(storedData);
            this.sentences = data.sentences || [];
            this.dictionary = data.dictionary || [];
        } else {
            this.sentences = [];
            this.dictionary = [];
        }
        this.sortWords();
    }

    saveToStorage() {
        const data = {
            sentences: this.sentences.map(s => s.toLowerCase()),
            dictionary: this.dictionary.map(w => w.toLowerCase())
        };
        sessionStorage.setItem('languageData', JSON.stringify(data));
    }

    addWord(word) {
        const normalized = word.trim().toLowerCase();
        if(!this.#quickWords.some(w => w.toLowerCase() === normalized)) {
            this.#quickWords.push(word.trim());
            this.#sortedquickWords = [...this.#quickWords];
            this.sortWords();
            this.saveToStorage();
            this.filterQuickWords('');
        }
    }

    removeWord(word) {
        const normalized = word.trim().toLowerCase();
        this.#quickWords = this.#quickWords.filter(w => w.toLowerCase() !== normalized);
        this.#sortedquickWords = [...this.#quickWords];
        this.sortWords();
        this.saveToStorage();
        this.filterQuickWords('');
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
                        const importedData = JSON.parse(event.target.result);
                        
                        // Converti tutto in minuscolo
                        this.sentences = [
                            ...new Set([
                                ...this.sentences,
                                ...(importedData.sentences || []).map(s => s.toLowerCase())
                            ])
                        ];
                        
                        this.dictionary = [
                            ...new Set([
                                ...this.dictionary,
                                ...(importedData.dictionary || []).map(w => w.toLowerCase())
                            ])
                        ];
                        
                        this.sortWords();
                        this.saveToStorage();
                        this.filterQuickWords('');
                    } catch(error) {
                        alert('Formato file non valido');
                    }
                };
                reader.readAsText(file);
            }
            alert('Importazione del dizionario completata!')
        });
    }

    handleManageDictionary(selectedWords) {
        const newWords = selectedWords
            .map(word => word.trim().toLowerCase())
            .filter(word => 
                word.length >= 2 && 
                !this.dictionary.includes(word)
            );
        
        this.dictionary = [...new Set([...this.dictionary, ...newWords])];
        this.sortWords();
        this.saveToStorage();
    }

    getWords() {
        return this.#quickWords;
    }

    filterQuickWords(value) {
        this.quickWordsContainer.innerHTML = '';
        const filterText = value.toLowerCase().trim();
        
        // Mostra tutte le frasi se non c'è filtro
        if (!filterText) {
            this.sentences.forEach(sentence => {
                this.addQuickWord(sentence, true);
            });
            return;
        }
        
        // Mostra suggerimenti dal dizionario
        this.dictionary
            .filter(word => word.toLowerCase().startsWith(filterText))
            .forEach(word => {
                this.addQuickWord(word);
            });
    }

    addQuickWord(content, isSentence = false) {
        const div = document.createElement('DIV');
        div.classList.add('quick-word', isSentence ? 'sentence' : 'word');
        div.textContent = content;
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
        return this.dictionary.includes(word.toLowerCase());
    }
}

function exportDictionary() {
    const data = {
        sentences: keyboard.quickWord.sentences,
        dictionary: keyboard.quickWord.dictionary
    };
    
    const dataStr = JSON.stringify(data);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `language-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}