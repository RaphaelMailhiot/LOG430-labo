export default class SearchProduct {
  constructor(element) {
    this.element = element;

    this.init();
  }

init() {
  console.log('SearchProduct component initialized');
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', this.handleSubmit.bind(this));
  }
}

async handleSubmit(e) {
  e.preventDefault();
  const productNameInput = document.getElementById('productNameInput').value;
  const results = await this.fetchResults(productNameInput);
  this.renderResults(results);
}

async fetchResults(productNameInput) {
  const res = await fetch('/api/search-product', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productNameInput })
  });
  return res.json();
}

  renderResults(results) {
    if (!results || results.length === 0) {
      document.getElementById('errorMessage').textContent = 'Aucun produit trouvé';
      return;
    }
    document.getElementById('errorMessage').textContent = '';
    const productName = document.getElementById('productName');
    const productCategory = document.getElementById('productCategory');
    const productId = document.getElementById('productId');
    const productPrice = document.getElementById('productPrice');
    const productStock = document.getElementById('productStock');

    results.map(product => {
      productName.textContent = product.name;
      productCategory.textContent = product.category;
      productId.textContent = product.id;
      productPrice.textContent = product.price;
      productStock.textContent = product.stock;
    });
  }
}

