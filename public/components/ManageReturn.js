export default class ManageReturn {
    constructor(element) {
        this.element = element;

        this.init();
    }

    init() {
        console.log('ManageReturn component initialized');
        const cancelSaleButtons = document.querySelectorAll('[id$="-cancelSaleButton"]');
        cancelSaleButtons.forEach(button => {
            button.addEventListener('click', this.handleCancelSale.bind(this));
        });
    }

    async handleCancelSale(e) {
        e.preventDefault();

        const saleId = e.target.id.split('-')[0];
        const confirmed = confirm(`Êtes-vous sûr de vouloir annuler la vente ${saleId} ?`);
        if (!confirmed) return;

        const res = await fetch('/api/manage-return', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ saleId })
        });

        if (res.ok) {
            alert(`Vente ${saleId} annulée avec succès`);
            window.location.reload();
        } else {
            alert(`Erreur lors de l'annulation de la vente ${saleId}`);
        }
    }
}