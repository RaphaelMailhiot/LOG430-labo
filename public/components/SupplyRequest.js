export default class SupplyRequest {
    constructor(element) {
        this.element = element;

        this.init();
    }

    init() {
        const supplyRequestForm = this.element.querySelector('.supplyRequestForm');
        if (supplyRequestForm) {
            supplyRequestForm.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const productIds = formData.getAll('productId');
        const quantities = formData.getAll('quantity');

        const results = [];
        for (let i = 0; i < productIds.length; i++) {
            const productId = Number(productIds[i]);
            const quantity = Number(quantities[i]);
            if (quantity > 0) {
                const result = await this.fetchResults({ productId, quantity });
                results.push(result);
            }
        }
        
        this.renderResults(results);
    }

    async fetchResults(requestProductData) {
        const res = await fetch('/api/v1/supply-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestProductData)
        });
        return res.json();
    }

    renderResults(result) {
        if (!result) {
            document.getElementById('successMessage').textContent = '';
            document.getElementById('errorMessage').textContent = 'Erreur lors de la demande';
            return;
        }
        document.getElementById('errorMessage').textContent = '';
        if(document.getElementById('successMessage').textContent != 'Demande de réapprovisionnement enregistrée avec succès') {
            document.getElementById('successMessage').textContent = 'Demande de réapprovisionnement enregistrée avec succès';
        } else {
            document.getElementById('successMessage').textContent = 'Nouvelle demande enregistrée avec succès';
        }
    }
}