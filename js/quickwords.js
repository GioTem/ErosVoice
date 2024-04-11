class QuickWord {
    #quickWords = [
        "Si", "No", "Eros", "Io", "Ciao", "Per favore", "Posso andare",
        "Notizia", "Novità", "Oggi", "Domani", "Ai servizi?", "Mi puoi fare un favore?", "Mi passi", "Ho bisogno", "Ti manco?", "Ti sono mancato?", "Mi sei mancata!",
        "Ti chiedo scusa", "Primavera", "Estate", "Autunno", "Inverno",
        "Minuto", "Ora", "Giorno", "Settimana", "Nipote", "Salviettine",
        "Lunedí", "Martedí", "Mecoledí", "Giovedí", "Fazzoletti",
        "Venerdí", "Sabato", "Domenica", "Gennaio", "Febbraio",
        "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Soldi",
        "Settembre", "Ottobre", "Novembre", "Dicembre", "Mi manchi!",
        "Ho una notizia", "Sbagliato", "Borsone", "Bellaria", "Borsello",
        "Giusto", "ANFFAS", "Forse", "Scusa", "Pace", "Cuffia", "Costume", "Ciabatte",
        "Sciopero", "Scherzo", "Carrozzina", "Pullman", "Pulmino",
        "Mare", "Montagna", "Colazione", "Pranzo", "Cena", "Merenda",
        "Dove?", "Come?", "Quando?", "Perché?", "Grazie", "Prego",
        "Domanda", "Risposta", "Salutate", "Ti aspetto", "Ti presento",
        "Viene...", "Volontario", "Volontaria", "Indovina...", "Nebbia", "Pioggia",
        "Vento", "Sole", "Già", "Vigilia", "Edicola", "Fisioterapista", "Fisioterapia",
        "Quadrifogli", "OFTAL", "AIAS", "Weekend", "Piscina",
        "Giornale", "Toast", "Ferie", "Mi raccomando", "Kway",
        "Bello", "Brutto", "Caldo", "Freddo", "Triste", "Allegro",
        "Appuntamento", "Alto", "Basso", "Magro", "Grasso", "Aperto",
        "Chiuso", "Cattivo", "Buono", "Nuovo", "Vecchio", "Giovane",
        "Mario", "Dormendo", "Borraccia", "Gentile", "Odioso", "Dolce",
        "Difficile", "Facile", "Piccolo", "Grande", "Inizio", "Litigare",
        "Inizia", "Inizi", "Pulito", "Sporco", "Forte", "Debole",
        "Ricco", "Povero", "Continua", "Caffè", "Francesca", "Amicizia",
        "Simpatico", "Antipatico", "Stanco", "Ammalato", "Importante",
        "Finalmente", "Offro", "Arrabbiato", "Arrabbiata", "Segreti",
        "Asparagi", "Tè caldo", "Tè Freddo", "Telefono", "Carica batterie",
        "Cappuccino", "Shakerato", "Pavesini", "Chiara",
        "Colori", "Bianco", "Nero", "Arancione", "Azzurro", "Blu",
        "Grigio", "Marrone", "Rosso", "Rosa", "Verde", "Giallo",
        "Viola", "Turchese", "Bordeaux", "Minuti", "Secondi", "Zaino",
        "Rispetto", "Elisabetta", "Schiscetta", "Pedane", "Pelvica",
        "Potrei avere il menù per favore?", "Posso sedermi vicino a te?",
        "Che dolci avete?", "Mi piacciono tutti i dolci",
        "Portatemi il conto", "Pizza", "Antipasto", "Pasta al ragù",
        "Pasta al forno", "Risotto", "Kisotto ai funghi porcini", "Carne",
        "Pollo", "Pesce", "Fritto", "Arrosto", "Hamburger di tacchino con rosmarino",
        "Hamburger di bovino", "Hamburger al formaggio", "Sofficini formaggio e mazzarella",
        "Patatine fritte", "Insalata", "Formaggio", "Wurstel",
        "Salame piccante", "Funghi", "Focaccia", "Tonno",
        "Gorgonzola", "Rucola", "Melanzane", "Zucchine", "Peperoni",
        "Polenta", "Cetriolini", "Frutta", "Tiramisù",
        "Gelato", "Amaretti", "Insalata russa", "Maionese", "Formaggio piattone",
        "Sottilette", "Mozzarella", "Vino", "Tutore",
        "Naturale", "Gassata", "CocaCola", "LemonSoda",
        "Estathè al limone", "Estathè alla pesca", "Limonata",
        "Limoncello", "Vodka", "Spumante",
        "Spritz", "Sorbetto", "Forchetta", "Coltello", "Cucchiaio", "Cucchiaino", "Piatto",
        "Tovagliolo", "Pasta alla carbonara", "Vorrei bere",
        "Aperitivo", "The", "Birra", "Aranciata", "Acqua minerale",
        "Amaro", "Cosa posso offrirti?", "Telefonare",
        "Quanto spendo?", "Posso avere un altro cucchiaino?", "Posso avere un tovagliolino?",
        "Cocktail", "Alcolico", "Latte", "Cioccolata",
        "Whisky", "Analcolico", "Chinotto", "Sorella", "Sollevatore",
        "Grappa", "Bicchiere", "Cous Cous", "Menta", "Lattina",
        "Mela", "Pera", "Arancia", "Pesca", "Uva", "Ciliegia", "Anguria",
        "Fragola", "Mora", "Mirtilli", "Banana", "Albicocca", "Fico",
        "Prugna", "Kiwi", "Mandarancio", "Melone", "Ananas", "Mandarino",
        "Susina", "Noci", "Prugne", "La frutta secca", "Nocciole",
        "Arachidi", "Mandorle", "Pistacchi", "Fichi secchi", "Tagliare",
        "Sbucciare", "Macedonia di frutta", "Aprire", "Schiacciare",
        "Frullato di frutta", "Abitare", "Abitazione", "Io abito", "Io abitavo",
        "Casa", "Palazzo", "Villa", "Condominio", "Scale", "Ascensore",
        "Solaio", "Cantina", "Porta finestra", "Balcone", "Giardino",
        "Ingresso", "Porta-abiti", "Porta-ombrelli", "Soggiorno", "Poltrone",
        "Divano", "Cucina", "Tavolo", "Sedie", "Frigorifero", "Lavastoviglie",
        "Lavello", "Forno", "Sala da pranzo", "Tinello", "Camera da letto",
        "Armadio", "Cassettone", "Letto", "Studio", "Scrivania", "Libreria", "Lavare",
        "Ripostiglio", "Scaffali", "Servizi", "Bagno", "Doccia", "Bidet", "Profumo",
        "Saponetta", "Asciugamano", "Spazzolino da denti", "Dentifricio", "Dolore",
        "Pettine", "Asciugacapelli", "Risotto zafferano e porcini", "Cotechino con lenticchie",
        "Cappone ripieno", "Filetto platessa", "Vitello tonnato", "Minestra di orzo",
        "Minestri", "Minestra", "Mistrone", "Broccole", "Cavolfiore", "Le cozze",
        "Dispiaciuta", "Dispiaciuto", "Spigatto", "Alla facciazza", "Non resisto più",
        "Bugiarda", "Scherza", "Scherzavo", "Bugiardo", "Scherzi", "Scherzava",
        "Bugiardi", "Buon divertimento", "Ti diverti ?", "Ti sei divertita ?",
        "Mi sono divertito", "Ci vediamo", "Facciamo la pace", "Benvenuto",
        "Tranquillo", "Ubriaco", "Benvenuta", "Tranquilla", "Ubriaca", "Brioche",
        "Benvenuti", "Fidanzato", "Compagno", "Obiettori", "Obiettore",
        "Me li dai", "Te li do", "Il diritto", "Fidanzata", "Compagna",
        "Compagnia", "Capodanno", "Epifania", "Beata Vergine Maria di Lourdes",
        "San Valentino", "Carnevale", "Pasqua", "Festa della Liberazione",
        "Festa dei Lavoratori", "Festa della Repubblica", "Ferragosto", "Musica",
        "Assunzione della Beata Vergine", "Festa di Tutti i Santi", "Rotto",
        "Commemorazione dei Defunti", "Festa della Vittoria", "Immacolata Concezione",
        "Santo Natale", "Santo Stefano", "Auguri", "Buon Anno", "Onomastico",
        "Battesimo", "Matrimonio", "Tanti auguri", "Buona Pasqua", "Compleanno", "Barba",
        "Cresima", "Congratulazioni", "Buon Natale", "Anniversario", "Caduto", "Caduta",
        "Prima Comunione", "Vacanze", "Lourdes", "Pellegrinaggio", "Oropa", "Cannuccia", "Frullare",
        "Chiesa", "Quaresima", "Funerale", "Cimitero", "Condoglianze", "Collo", "Schiena", "Spalla", "Fianco", "Mano", "Piede", "Caviglia", "Polso",
        "Il", "Lo", "L'", "La", "I", "Gli", "Le", "Un", "Uno", "Una", "Dei", "Degli", "Delle", "Dello", "Dell'",
        "Essere", "Avere", "Fare", "Dire", "Andare", "Venire", "Potere", "Dovere", "Volere", "Vedere", "Sentire",
        "Parlare", "Prendere", "Mettere", "Sapere", "Credere", "Lavorare", "Studiare", "Giocare", "Continuare",
        "Uscire", "Entrare", "Ritornare", "Mangiare", "Bere", "Dormire", "Ascoltare", "Guardare", "Capire",
        "Rispondere", "Scrivere", "Leggere", "Correre", "Nuotare", "Viaggiare", "Aspettare", "Cercare", "Trovare", "Iniziare",
        "Finire", "Pagare", "Pensare", "Sperare", "Chiedere", "Conoscere", "Amare", "Odio", "Stai", "Così",
        "Che", "Non", "Ma", "Come", "Lui", "Lei", "Noi", "Voi", "Loro", "Quando", "Dove", "Qui", "Cosa", "Chi", "Quale", "Quanto", "Ancora",
        "Poi", "Dopo", "Ieri", "Sempre", "Mai", "Tutto", "Nulla", "Altro", "Molto", "Poco", "Bene", "Male", "Tu", "Anche",
        "Da", "Di", "In", "Con", "Su", "Per", "Tra", "Fra", "Chiamo", "Sono", "Ho", "Vai", "Felice", "Mi", "Giordano", "Estefania", "Stefania", "Abel",
        "Letizia", "Rudina", "Giulia", "Sara", "Tatiana", "Barbara", "Francesco", "Caterina", "Massimiliano", "Manolo", "Sergio", "Andrea", "Simone", "Marco", "Luca", "Nino", "Vittorio", "Mara",
        "Spillo", "Whatsapp", "Facebook", "YouTube", "YouTube Music", "Mediaset", "Infinity", "Rai 1", "Rai 2", "Rai 3", "Rete 4", "Canale 5", "Italia 1",
        "Cine 34", "Radio Birikina", "Internet", "Mille", "CDD", "Diurno", "RSD", "Residenziale", "Villa Gregotti", "ACM", "Casa Malva", "Shasa", "Pinato", "Alberto", "Flavio", "Educatore", "Oss", "Sara Cundari", "Infermiere", "Rebecca", "Lella", "Bocca", "Occhio", "Testa", "Lingua", "Ginocchio", "Dito", "Naso", "Pancia", "Unghia", "Stomaco", "Capelli", "Orecchie", "Polpaccio", "Estetista", "Parrucchiere", "Messa", "Dio", "Gesù", "Madonna", "Preghiera", "Rosario", "Croce", "Crocifisso", "Comunione", "Ostia", "Dama", "Barelliere", "Cibo", "Deodorante", "Pigiama", "Attività", "Messaggio", "Chiamata", "Maglietta", "Camicia", "Tuta", "Pantalone", "Giacca", "Felpa", "Mutande", "Calzini", "Canotta", "Smanicato", "Documenti", "Moneta", "Pellicina", "Orologio", "Quaderno", "Foglio", "Penna", "Matita", "Pittura", "Dipingere", "Bustina", "Medicina", "Mese", "Calendario", "Innamorato", "Amore"
    ];
    #sortedquickWords;

    constructor() {
        this.#sortedquickWords = [...this.#quickWords];
        this.quickWordsContainer = document.getElementById('quick-words');
        this.generateQuickWords();
    }

    generateQuickWords() {
        this.#quickWords.slice(0, 20).forEach(word => {
            this.addQuickWord(word);
        });
        this.quickWordsContainer.scrollLeft = 0;
    }

    filterQuickWords(value) {
        this.quickWordsContainer.innerHTML = '';
        const filterText = value.toLowerCase().trim();
        if (filterText === '') {
            // Show all quick words if no filter text
            this.generateQuickWords();
            return;
        }
        this.#sortedquickWords.sort((a, b) => a.length - b.length).forEach(word => {
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
        if (event.target.classList.value === 'quick-word') {
            const word = event.target.textContent;
            const filterText = keyboard.getFilterText();
            if (filterText.length > 0) {
                keyboard.setText(keyboard.getText().slice(0, -filterText.length));
            }
            keyboard.insterQuickWord(word);
        }
    }

}