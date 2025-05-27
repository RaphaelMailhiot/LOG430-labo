import inquirer from 'inquirer';
import { findProducts, getProductById, addProduct } from '../services/productService';
import { recordSale, cancelSale } from '../services/saleService';

async function mainMenu() {
  const { action } = await inquirer.prompt({
    type: 'list',
    name: 'action',
    message: 'Choisissez une action:',
    choices: [
      'Rechercher un produit',
      'Ajouter un produit',
      'Enregistrer une vente',
      'Gérer un retour',
      'Consulter le stock',
      'Quitter'
    ]
  });

  switch (action) {
    case 'Rechercher un produit':
      await handleSearch();
      break;
    case 'Ajouter un produit':
      await handleAddProduct();
      break;
    case 'Enregistrer une vente':
      await handleSale();
      break;
    case 'Gérer un retour':
      await handleReturn();
      break;
    case 'Consulter le stock':
      await handleStock();
      break;
    case 'Quitter':
      process.exit(0);
  }
  await mainMenu();
}

async function handleSearch() {
  const { term } = await inquirer.prompt<{ term: string }>([
    {
      type: 'input',
      name: 'term',
      message: 'Identifiant, nom ou catégorie ?'
    }
  ]);
  const produits = await findProducts(term);
  console.table(produits);
}

async function handleAddProduct() {
  const { name, category, price, stock } = await inquirer.prompt([
    { type: 'input', name: 'name', message: 'Nom du produit ?' },
    { type: 'input', name: 'category', message: 'Catégorie ?' },
    { 
      type: 'input', name: 'price', message: 'Prix ?', 
      validate: (input) => !isNaN(parseFloat(input)) && parseFloat(input) > 0 ? true : 'Entrez un prix valide'
    },     
    { type: 'number', name: 'stock', message: 'Stock initial ?' }
  ]);
  const produit = await addProduct({ name, category, price, stock }); 
  console.log(`Produit ajouté :`, produit);
}

async function handleSale() {
  const items: { productId: number; quantity: number }[] = [];
  let ajouter = true;

  while (ajouter) {
    const { id, qty } = await inquirer.prompt<{ id: number; qty: number }>([
      {
        type: 'number',
        name: 'id',
        message: 'ID produit ?'
      },
      {
        type: 'number',
        name: 'qty',
        message: 'Quantité ?'
      }
    ]);

    items.push({ productId: id, quantity: qty });

    const { more } = await inquirer.prompt<{ more: boolean }>([
      {
        type: 'confirm',
        name: 'more',
        message: 'Ajouter un autre produit ?'
      }
    ]);
    ajouter = more;
  }

  // On récupère les prix pour calculer le total
  const saleItems = [];
  for (const it of items) {
    const p = await getProductById(it.productId);
    if (!p) throw new Error(`Produit ${it.productId} introuvable`);
    saleItems.push({ productId: it.productId, quantity: it.quantity, price: p.price });
  }

  const total = saleItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
  console.log(`Total de la vente : $${total.toFixed(2)}`);

  const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Confirmer la vente ?'
    }
  ]);
  if (confirm) {
    const saleId = await recordSale(saleItems);
    console.log(`Vente #${saleId} enregistrée.`);
  } else {
    console.log('Vente annulée.');
  }
}

async function handleReturn() {
  const { saleId } = await inquirer.prompt({
    name: 'saleId',
    message: 'Numéro de vente à annuler ?',
    type: 'number'
  });
  await cancelSale(saleId);
  console.log(`Vente #${saleId} annulée et stock remis à jour.`);
}

async function handleStock() {
  const produits = await findProducts(''); // récupère tout
  console.table(produits.map(p => ({ ID: p.id, Nom: p.name, Stock: p.stock })));
}

export default mainMenu;
