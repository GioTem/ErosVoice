class QuickWord {
    #isDataLoaded = false;
    #maxResults = 20;
    #quickWords = [];

    constructor() {
        this.quickWordsContainer = document.getElementById('quick-words');
        this.db = null;
        this.sentences = [];
        this.dictionary = [];
        this.initDB().then(() => {
            this.loadFromStorage();
            this.setupImport();
            this.filterQuickWords('');
            this.#isDataLoaded = true;
        });
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('NewLanguageDB', 5);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const store = db.createObjectStore('words', { keyPath: 'word' });
                
                store.createIndex('prefix1_length', ['prefix1', 'length']);
                store.createIndex('prefix2_length', ['prefix2', 'length']);
                store.createIndex('prefix3_length', ['prefix3', 'length']);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };

            request.onerror = (event) => reject(event.target.error);
        });
    }

    async loadFromStorage() {
        const transaction = this.db.transaction('words', 'readonly');
        const store = transaction.objectStore('words');
        
        return new Promise((resolve, reject) => {
            const wordsRequest = store.index('prefix1_length').openCursor();
            const sentencesRequest = store.get('sentences');

            this.dictionary = [];
            wordsRequest.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    if (cursor.value.word !== 'sentences') {
                        this.dictionary.push(cursor.value.word);
                    }
                    cursor.continue();
                }
            };

            sentencesRequest.onsuccess = (e) => {
                this.sentences = e.target.result?.value || [];
            };

            transaction.oncomplete = () => {
                this.filterQuickWords('');
                resolve();
            };

            transaction.onerror = (e) => reject(e.target.error);
        });
    }

    async filterQuickWords(value) {
        if (!this.#isDataLoaded) return;
        
        this.quickWordsContainer.innerHTML = '';
        const filterText = value.toLowerCase().trim();
        
        if (!filterText) {
            this.displayResults(this.sentences, true);
            return;
        }

        const prefixLength = Math.min(filterText.length, 3);
        const indexName = `prefix${prefixLength}_length`;
        const prefix = filterText.substring(0, prefixLength);

        const transaction = this.db.transaction('words', 'readonly');
        const store = transaction.objectStore('words');
        const index = store.index(indexName);
        
        const results = [];
        const range = IDBKeyRange.bound([prefix, 0], [prefix, Infinity]);
        const request = index.openCursor(range);
        
        request.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor && results.length < this.#maxResults) {
                const word = cursor.value.word;
                if (word.startsWith(filterText)) {
                    results.push({ word: word, length: cursor.value.length });
                }
                if (results.length < this.#maxResults) {
                    cursor.continue();
                } else {
                    this.displaySortedResults(results);
                }
            } else {
                this.displaySortedResults(results);
            }
        };
    }

    displayResults(results, isSentence = false) {
        this.quickWordsContainer.innerHTML = '';
        results.slice(0, this.#maxResults).forEach(content => {
            const div = document.createElement('DIV');
            div.className = `quick-word ${isSentence ? 'sentence' : 'word'}`;
            div.textContent = content;
            this.quickWordsContainer.appendChild(div);
        });
    }

    displaySortedResults(results) {
        const sorted = results
            .sort((a, b) => a.length - b.length || a.word.localeCompare(b.word))
            .map(item => item.word);
        this.displayResults(sorted);
    }

    addSeparator(text) {
        const separator = document.createElement('DIV');
        separator.className = 'separator';
        separator.textContent = text;
        this.quickWordsContainer.appendChild(separator);
    }

    async handleManageDictionary(selectedWords) {
        const newWords = selectedWords
            .map(word => word.trim().toLowerCase())
            .filter(word => 
                word.length >= 2 && 
                !this.dictionary.includes(word) &&
                !this.#quickWords.includes(word)
            );

        if (newWords.length > 0) {
            const transaction = this.db.transaction('words', 'readwrite');
            const store = transaction.objectStore('words');
            
            for (const word of newWords) {
                await store.put({
                    word: word,
                    prefix1: word.substring(0, 1),
                    prefix2: word.substring(0, 2),
                    prefix3: word.substring(0, 3),
                    length: word.length
                });
            }
            
            this.dictionary = [...new Set([...this.dictionary, ...newWords])];
            this.#quickWords = [...new Set([...this.#quickWords, ...newWords])];
            await this.loadFromStorage();
            this.filterQuickWords('');
        }
    }

    async addWord(word) {
        const normalized = word.trim().toLowerCase();
        if (!normalized || this.dictionary.includes(normalized)) return;

        const transaction = this.db.transaction('words', 'readwrite');
        const store = transaction.objectStore('words');
        
        await store.put({
            word: normalized,
            prefix1: normalized.substring(0, 1),
            prefix2: normalized.substring(0, 2),
            prefix3: normalized.substring(0, 3),
            length: normalized.length
        });

        this.dictionary.push(normalized);
    }

    async removeWord(word) {
        const normalized = word.trim().toLowerCase();
        const transaction = this.db.transaction('words', 'readwrite');
        const store = transaction.objectStore('words');
        
        await store.delete(normalized);
        this.dictionary = this.dictionary.filter(w => w !== normalized);
    }

    setupImport() {
        document.getElementById('importInput').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    const transaction = this.db.transaction('words', 'readwrite');
                    const store = transaction.objectStore('words');

                    // Importa parole
                    const words = [...new Set(data.dictionary.map(w => w.toLowerCase().trim()))];
                    for (const word of words) {
                        await store.put({
                            word: word,
                            prefix1: word.substring(0, 1),
                            prefix2: word.substring(0, 2),
                            prefix3: word.substring(0, 3),
                            length: word.length
                        });
                    }

                    // Importa frasi
                    if (data.sentences?.length > 0) {
                        await store.put({ 
                            word: 'sentences',
                            value: [...new Set(data.sentences.map(s => s.trim()))]
                        });
                    }

                    await this.loadFromStorage();
                    this.filterQuickWords('');
                    alert(`Importati ${words.length} parole con successo!`);

                } catch (error) {
                    alert('Errore durante l\'importazione: ' + error.message);
                }
            };
            reader.readAsText(file);
        });
    }

    async clearDatabase() {
        if (this.db) this.db.close();
        
        return new Promise((resolve, reject) => {
            const req = indexedDB.deleteDatabase('NewLanguageDB');
            
            req.onsuccess = () => {
                this.sentences = [];
                this.dictionary = [];
                this.#isDataLoaded = false;
                this.initDB().then(() => {
                    this.filterQuickWords('');
                    alert('Database pulito con successo!');
                    resolve();
                });
            };

            req.onerror = (event) => {
                alert('Errore cancellazione database: ' + event.target.error);
                reject(event.target.error);
            };
        });
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

    getWords() {
        return this.dictionary;
    }
}

async function exportDictionary() {
    const transaction = keyboard.quickWord.db.transaction('words', 'readonly');
    const store = transaction.objectStore('words');
    
    const allData = await new Promise(resolve => {
        const request = store.getAll();
        request.onsuccess = (e) => resolve(e.target.result);
    });

    const data = {
        sentences: allData.find(item => item.word === 'sentences')?.value || [],
        dictionary: allData
            .filter(item => item.word !== 'sentences')
            .map(item => item.word)
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dictionary-export-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}