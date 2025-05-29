export default class RecordSale {
    constructor(element) {
        this.element = element;

        this.init();
    }

    init() {
        console.log('RecordSale component initialized');
        const recordSaleForm = document.getElementById('recordSaleForm');
        if (recordSaleForm) {
            recordSaleForm.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Récupérer tous les inputs avec l'attribut data-input-counter
        const inputs = document.querySelectorAll('input[data-input-counter]');
        const items = [];

        inputs.forEach(input => {
            const id = input.id.replace('-input', ''); // Extraire l'id du produit
            const quantity = Number(input.value);
            // On ne garde que les quantités > 0
            if (quantity > 0) {
                items.push({
                    productId: Number(id),
                    quantity: quantity
                });
            }
        });

        const result = await this.fetchResults({ items });
        this.renderResults(result);
    }

    async fetchResults(productData) {
        const res = await fetch('/api/record-sale', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        return res.json();
    }

    renderResults(result) {
        const recordSaleButton = document.getElementById('recordSaleButton');
        recordSaleButton.type = 'button';
        recordSaleButton.textContent = 'Faire une autre transaction';
        recordSaleButton.addEventListener('click', () => {
            window.location.reload();
        });
        if (!result) {
            document.getElementById('successMessage').textContent = '';
            document.getElementById('errorMessage').textContent = 'Erreur lors de la transaction';
            return;
        }
        document.getElementById('errorMessage').textContent = '';
        document.getElementById('successMessage').textContent = 'Transaction enregistrée avec succès pour ' + result.total + '$';
    }
}