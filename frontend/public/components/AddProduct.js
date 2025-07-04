export default class AddProduct {
  constructor(element) {
    this.element = element;

    this.init();
  }

  init() {
    const addForm = document.getElementById('addProductForm');
    if (addForm) {
      addForm.addEventListener('submit', this.handleSubmit.bind(this));
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    const productNameInput = document.getElementById('name').value;
    const productCategoryInput = document.getElementById('category').value;
    const productPriceInput = document.getElementById('price').value;
    const productStockInput = document.getElementById('stock').value;

    const success = await this.fetchResults({
      name: productNameInput,
      category: productCategoryInput,
      price: productPriceInput,
      stock: productStockInput
    });
    this.renderResults(success);
  }

  async fetchResults(productData) {
    const res = await fetch('/api/v1/add-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return res.json();
  }

  renderResults(success) {
    if (!success) {
      document.getElementById('successMessage').textContent = '';
      document.getElementById('errorMessage').textContent = 'Erreur lors de l\'ajout du produit';
      return;
    }
    document.getElementById('errorMessage').textContent = '';
    document.getElementById('successMessage').textContent = 'Produit ajouté avec succès';
  }
}