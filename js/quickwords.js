class QuickWord {
    #isDataLoaded = false;
    #maxResults = 20;
    #memoryCache = {
        dictionary: [],
        sentences: [],
        timestamp: null
    };
    #quickWords = [];
    loadingElement = null;
    operationStartTime = null;
    progressInterval = null;

    constructor() {
        this.quickWordsContainer = document.getElementById('quick-words');
        this.db = null;
        this.sentences = [];
        this.dictionary = [];
        this.setupModal();
        this.#loadCacheFromStorage();
        this.showLoading();
        
        if(this.#memoryCache.dictionary.length > 0) {
            this.dictionary = [...this.#memoryCache.dictionary];
            this.sentences = [...this.#memoryCache.sentences];
            this.filterQuickWords('');
        }

        this.initDB().then(async () => {
            if(this.#needsDataRefresh()) {
                await this.loadFromStorage();
            }
            
            this.setupImport();
            this.#isDataLoaded = true;
            this.filterQuickWords('');
            this.hideLoading();
            
            setInterval(() => this.#backgroundRefresh(), 3600000);
        }).catch(error => {
            this.hideLoading();
            console.error('Errore inizializzazione:', error);
        });
    }

    // *** METODI DI INIZIALIZZAZIONE ***
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

    // *** GESTIONE CACHE ***
    #loadCacheFromStorage() {
        try {
            const cachedData = localStorage.getItem('languageCache_v2');
            if(cachedData) {
                const parsedData = JSON.parse(cachedData);
                if(parsedData.timestamp > Date.now() - 86400000) {
                    this.#memoryCache = {
                        dictionary: parsedData.dictionary,
                        sentences: parsedData.sentences,
                        timestamp: parsedData.timestamp
                    };
                }
            }
        } catch(e) {
            console.warn('Lettura cache locale fallita:', e);
        }
    }

    #saveCacheToStorage() {
        try {
            localStorage.setItem('languageCache_v2', JSON.stringify({
                dictionary: this.#memoryCache.dictionary,
                sentences: this.#memoryCache.sentences,
                timestamp: Date.now()
            }));
        } catch(e) {
            console.warn('Salvataggio cache locale fallito:', e);
        }
    }

    #needsDataRefresh() {
        return !this.#memoryCache.timestamp || 
               Date.now() - this.#memoryCache.timestamp > 7200000 ||
               this.#memoryCache.dictionary.length === 0;
    }

    async #backgroundRefresh() {
        if(this.#needsDataRefresh()) {
            try {
                await this.loadFromStorage();
                this.filterQuickWords('');
                this.showNotification('Dati aggiornati!');
            } catch(e) {
                console.warn('Aggiornamento background fallito:', e);
            }
        }
    }

    // *** CARICAMENTO DATI ***
    async loadFromStorage() {
        const transaction = this.db.transaction('words', 'readonly');
        const store = transaction.objectStore('words');
        
        return new Promise((resolve, reject) => {
            const wordsRequest = store.index('prefix1_length').openCursor();
            const sentencesRequest = store.get('sentences');

            const tempDictionary = [];
            let tempSentences = [];

            wordsRequest.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    if (cursor.value.word !== 'sentences') {
                        tempDictionary.push(cursor.value.word);
                    }
                    cursor.continue();
                }
            };

            sentencesRequest.onsuccess = (e) => {
                const result = e.target.result;
                tempSentences = result?.value || [];
            };

            transaction.oncomplete = () => {
                this.#memoryCache = {
                    dictionary: tempDictionary.sort((a, b) => a.length - b.length || a.localeCompare(b)),
                    sentences: tempSentences,
                    timestamp: Date.now()
                };

                this.#saveCacheToStorage();
                this.dictionary = [...this.#memoryCache.dictionary];
                this.sentences = [...this.#memoryCache.sentences];
                resolve();
            };

            transaction.onerror = (e) => reject(e.target.error);
        });
    }

    // *** INTERFACCIA UTENTE ***
    async filterQuickWords(value) {
        if (!this.#isDataLoaded) {
            this.showLoading();
            return;
        }
        
        this.quickWordsContainer.innerHTML = '';
        const filterText = value.toLowerCase().trim();
        
        if (!filterText) {
            this.displayResults(this.sentences, true);
            if(this.#quickWords.length > 0) {
                this.addSeparator('Parole Preferite');
                this.displayResults(this.#quickWords);
            }
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

    showLoading() {
        if (this.loadingElement) return;
        
        this.loadingElement = document.createElement('DIV');
        this.loadingElement.className = 'loading-container';
        this.loadingElement.innerHTML = `
            <div class="loading-text">Caricamento</div>
            <div class="loading-dots">
                <span>.</span><span>.</span><span>.</span>
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

    // *** GESTIONE MODAL ***
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
                    <button onclick="keyboard.quickWord.hideModal()" class="modal-close">Chiudi</button>
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

    showNotification(message) {
        const notification = document.createElement('DIV');
        notification.className = 'cache-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // *** METODI DI GESTIONE DATI ***
    async handleManageDictionary(selectedWords) {
        const newWords = selectedWords
            .map(word => word.trim().toLowerCase())
            .filter(word => 
                word.length >= 2 && 
                !this.dictionary.includes(word) &&
                !this.#quickWords.includes(word)
            );

        if (newWords.length > 0) {
            this.showModal('Aggiunta parole');
            let processed = 0;
            const total = newWords.length;
            
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
                    processed++;
                    this.updateProgress((processed / total) * 100, `Aggiunta ${processed}/${total} parole`);
                } catch (error) {
                    console.error('Errore aggiunta parola:', word, error);
                }
            }
            
            await this.refreshCache();
            this.#quickWords = [...new Set([...this.#quickWords, ...newWords])];
            this.showResults({
                'Parole aggiunte': newWords.length,
                'Parole totali': this.dictionary.length
            });
            this.hideModal();
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

        await this.refreshCache();
    }

    async removeWord(word) {
        const normalized = word.trim().toLowerCase();
        const transaction = this.db.transaction('words', 'readwrite');
        const store = transaction.objectStore('words');
        
        await store.delete(normalized);
        await this.refreshCache();
    }

    async refreshCache() {
        this.#memoryCache.timestamp = null;
        await this.loadFromStorage();
    }

    // *** VISUALIZZAZIONE RISULTATI ***
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

    // *** IMPORT/EXPORT ***
    async setupImport() {
        document.getElementById('importInput').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // 1. Mostra subito la modale
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

                    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
                    this.showResults({
                        'Parole totali': totalWords,
                        'Nuove parole': newWordsCount,
                        'Errori': errorCount,
                        'Tempo impiegato': `${totalTime}s`
                    });

                    await this.refreshCache();
                    this.updateProgress(100, 'Importazione completata!');

                } catch (error) {
                    document.getElementById('progress-status').textContent = 'Errore durante l\'importazione: ' + error.message;
                    console.error(error);
                } finally {
                    // 2. Resetta l'input per permettere nuove selezioni
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
                this.#memoryCache = { dictionary: [], sentences: [], timestamp: null };
                this.#saveCacheToStorage();
                this.#isDataLoaded = false;
                this.initDB().then(() => {
                    this.filterQuickWords('');
                    this.showNotification('Database resettato!');
                    resolve();
                });
            };

            req.onerror = (event) => {
                this.showNotification('Errore cancellazione: ' + event.target.error);
                reject(event.target.error);
            };
        });
    }

    // *** UTILITIES ***
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

// *** EXPORT ***
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
        a.download = `dictionary-export-${new Date().toISOString().slice(0,10)}.json`;
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