class ProgressModal {
    constructor() {
        this.modal = document.createElement('div');
        this.modal.style = /*...*/;
        this.progressBar = document.createElement('div');
        this.timeElement = document.createElement('div');
        // ... struttura completa della modale
        document.body.appendChild(this.modal);
    }

    show(operation) {
        this.startTime = Date.now();
        this.operation = operation;
        this.modal.style.display = 'block';
    }

    update(processed, total) {
        const percent = Math.round((processed / total) * 100);
        const elapsed = Math.round((Date.now() - this.startTime) / 1000);
        this.progressBar.style.width = `${percent}%`;
        this.timeElement.textContent = 
            `Elapsed: ${elapsed}s | Processed: ${processed}/${total}`;
    }

    hide(success, message) {
        const totalTime = Math.round((Date.now() - this.startTime) / 1000);
        this.statusElement.textContent = 
            `${success ? '✅' : '❌'} ${message} (Total time: ${totalTime}s)`;
        setTimeout(() => this.modal.style.display = 'none', 5000);
    }
}