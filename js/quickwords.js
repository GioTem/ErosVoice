class QuickWord {
    #isDataLoaded = false;
    #maxResults = 20;
    loadingElement = null;
    operationStartTime = null;
    progressInterval = null;

    constructor() {
        this.quickWordsContainer = document.getElementById('quick-words');
        this.db = null;
        this.sentences = [];
        this.dictionary = [];
        this.setupModal();
        this.showLoading();

        this.initDB().then(async () => {
            await this.loadFromStorage();
            this.setupImport();
            this.#isDataLoaded = true;
            this.filterQuickWords('');
            this.hideLoading();
        }).catch(error => {
            this.hideLoading();
            console.error('Errore inizializzazione:', error);
        });
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ErosLanguages', 1);

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

    async getDBInfo() {
        if (!this.db) {
            throw new Error('Database non inizializzato');
        }
    
        const transaction = this.db.transaction('words', 'readonly');
        const store = transaction.objectStore('words');
        
        // Recupera la versione del database
        const version = this.db.version;
        
        // Conta le frasi
        const sentencesRequest = store.get('sentences');
        const countRequest = store.count();
        
        const [sentencesEntry, totalEntries] = await Promise.all([
            new Promise((resolve, reject) => {
                sentencesRequest.onsuccess = () => resolve(sentencesRequest.result);
                sentencesRequest.onerror = reject;
            }),
            new Promise((resolve, reject) => {
                countRequest.onsuccess = () => resolve(countRequest.result);
                countRequest.onerror = reject;
            })
        ]);
    
        const sentencesCount = sentencesEntry?.value?.length || 0;
        const wordsCount = totalEntries - (sentencesEntry ? 1 : 0);
    
        return {
            version: version,
            sentencesCount: sentencesCount,
            wordsCount: wordsCount,
            totalEntries: totalEntries
        };
    }
    
    async loadFromStorage() {
        const transaction = this.db.transaction('words', 'readonly');
        const store = transaction.objectStore('words');

        return new Promise((resolve, reject) => {
            const wordsRequest = store.index('prefix1_length').openCursor();
            const sentencesRequest = store.get('sentences');

            this.dictionary = [];
            let tempSentences = [];

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
                const result = e.target.result;
                tempSentences = result?.value || [];
            };

            transaction.oncomplete = () => {
                this.dictionary.sort((a, b) => a.length - b.length || a.localeCompare(b));
                this.sentences = tempSentences;
                resolve();
                console.log("COMPLETE");                
            };

            transaction.onerror = (e) => reject(e.target.error);
        });
    }

    async filterQuickWords(value) {
        if (!this.#isDataLoaded) {
            this.showLoading();
            return;
        }

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
            } else if(results.length > 0) {
                this.displaySortedResults(results);
            }
        };
    }

    showLoading() {
        if (this.loadingElement) return;
        // Crea elemento di caricamento
        this.loadingElement = document.createElement('DIV');
        this.loadingElement.className = 'qw-loading-container';
        this.loadingElement.innerHTML = `
            <span>Caricamento</span>
            <div class="qw-loading-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
            </div>
        `;
        this.quickWordsContainer.appendChild(this.loadingElement);
    }

    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.remove();
            this.loadingElement = null;
        }
    }

    setupModal() {
        const modalHTML = `
            <div id="progress-modal" class="qw-modal">
                <div class="qw-modal-content">
                    <h3 id="modal-title">Operazione in corso</h3>
                    <div class="progress-container">
                        <div class="progress-bar" id="progress-bar"></div>
                        <div class="progress-info">
                            <span id="progress-percent">0%</span>
                            <span id="progress-time">00:00</span>
                        </div>
                    </div>
                    <div id="progress-status">Inizializzazione...</div>
                    <div id="results-summary" class="results-summary"></div>
                    <button id="modal-close-btn" onclick="keyboard.quickWord.hideModal()" class="modal-close" disabled>Chiudi</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    showModal(title) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('progress-modal').style.display = 'flex';
        this.operationStartTime = Date.now();
        this.progressInterval = setInterval(() => this.updateTimer(), 1000);
    }

    hideModal() {
        document.getElementById('progress-modal').style.display = 'none';
        clearInterval(this.progressInterval);
        this.resetProgress();
    }

    resetProgress() {
        document.getElementById('progress-bar').style.width = '0%';
        document.getElementById('progress-percent').textContent = '0%';
        document.getElementById('progress-time').textContent = '00:00';
        document.getElementById('results-summary').innerHTML = '';
    }

    updateProgress(percent, status) {
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.width = `${percent}%`;
        document.getElementById('progress-percent').textContent = `${Math.round(percent)}%`;
        document.getElementById('progress-status').textContent = status;
    }

    updateTimer() {
        const elapsed = Math.floor((Date.now() - this.operationStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        document.getElementById('progress-time').textContent = `${minutes}:${seconds}`;
    }

    showResults(summary) {
        const resultsDiv = document.getElementById('results-summary');
        resultsDiv.innerHTML = `
            <h4>Riepilogo:</h4>
            ${Object.entries(summary).map(([key, value]) => `
                <div class="result-row">
                    <span class="result-label">${key}:</span>
                    <span class="result-value">${value}</span>
                </div>
            `).join('')}
        `;
    }

    async handleManageDictionary(selectedWords) {
        const newWords = selectedWords
            .map(word => word.trim().toLowerCase())
            .filter(word =>
                word.length >= 2 &&
                !this.dictionary?.includes(word)
            );

        if (newWords.length > 0) {
            const transaction = this.db.transaction('words', 'readwrite');
            const store = transaction.objectStore('words');

            for (const word of newWords) {
                try {
                    await store.put({
                        word: word,
                        prefix1: word.substring(0, 1),
                        prefix2: word.substring(0, 2),
                        prefix3: word.substring(0, 3),
                        length: word.length
                    });
                } catch (error) {
                    console.error('Errore aggiunta parola:', word, error);
                }
            }
            await this.loadFromStorage();
        }
    }

    async removeWord(word) {
        const normalized = word.trim().toLowerCase();
        const transaction = this.db.transaction('words', 'readwrite');
        const store = transaction.objectStore('words');

        await store.delete(normalized);
        await this.loadFromStorage();
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

    async setupImport() {
        document.getElementById('importInput').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            this.showModal('Importazione in corso');
            const reader = new FileReader();

            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    const transaction = this.db.transaction('words', 'readwrite');
                    const store = transaction.objectStore('words');

                    const words = [...new Set(data.dictionary.map(w => w.toLowerCase().trim()))];
                    const totalWords = words.length;
                    let processed = 0;
                    let newWordsCount = 0;
                    let errorCount = 0;

                    const startTime = Date.now();

                    for (const word of words) {
                        try {
                            const exists = await new Promise(resolve => {
                                const req = store.get(word);
                                req.onsuccess = () => resolve(!!req.result);
                                req.onerror = () => resolve(false);
                            });

                            if (!exists) {
                                await store.put({
                                    word: word,
                                    prefix1: word.substring(0, 1),
                                    prefix2: word.substring(0, 2),
                                    prefix3: word.substring(0, 3),
                                    length: word.length
                                });
                                newWordsCount++;
                            }

                            processed++;
                            this.updateProgress((processed / totalWords) * 100, `Processate ${processed}/${totalWords} parole`);
                        } catch (error) {
                            errorCount++;
                            console.error('Errore importazione parola:', word, error);
                        }
                    }

                    if (data.sentences?.length > 0) {
                        await store.put({
                            word: 'sentences',
                            value: [...new Set(data.sentences.map(s => s.trim()))]
                        });
                    }

                    clearInterval(this.progressInterval);

                    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
                    this.showResults({
                        'Parole totali': totalWords,
                        'Nuove parole': newWordsCount,
                        'Errori': errorCount,
                        'Tempo impiegato': `${totalTime}s`
                    });

                    await this.loadFromStorage();
                    this.updateProgress(100, 'Importazione completata!');
                    this.filterQuickWords('');

                    document.getElementById("modal-close-btn").disabled = false;
                } catch (error) {
                    document.getElementById('progress-status').textContent = 'Errore durante l\'importazione: ' + error.message;
                    console.error(error);
                } finally {
                    e.target.value = '';
                }
            };
            reader.readAsText(file);
        });
    }

    async clearDatabase() {
        if (this.db) this.db.close();

        return new Promise((resolve, reject) => {
            const req = indexedDB.deleteDatabase('ErosLanguages');

            req.onsuccess = () => {
                this.sentences = [];
                this.dictionary = [];
                this.#isDataLoaded = false;
                this.initDB().then(() => {
                    this.filterQuickWords('');
                    resolve();
                });
            };

            req.onerror = (event) => {
                console.error('Errore cancellazione database:', event.target.error);
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
}

async function exportDictionary() {
    keyboard.quickWord.showModal('Esportazione in corso');
    const startTime = Date.now();

    try {
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
        a.download = `dictionary-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);

        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        keyboard.quickWord.showResults({
            'Parole esportate': data.dictionary.length,
            'Frasi esportate': data.sentences.length,
            'Tempo impiegato': `${totalTime}s`
        });
        keyboard.quickWord.updateProgress(100, 'Esportazione completata!');

    } catch (error) {
        document.getElementById('progress-status').textContent = 'Errore durante l\'esportazione: ' + error.message;
        console.error(error);
    } finally {
        setTimeout(() => keyboard.quickWord.hideModal(), 3000);
    }
}