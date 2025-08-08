const { faker } = require("@faker-js/faker");

module.exports = {
  pickRandomStore: (userContext, events, done) => {
    const stores = userContext.vars.storeIds;
    userContext.vars.storeId = stores[Math.floor(Math.random()*stores.length)];
    return done();
  },
  
  pickRandomProduct: (userContext, events, done) => {
    const prods = userContext.vars.productIds;
    userContext.vars.productId = prods[Math.floor(Math.random()*prods.length)];
    return done();
  },
  
  pickRandomCustomer: (userContext, events, done) => {
    const customers = userContext.vars.customerIds;
    userContext.vars.customerId = customers[Math.floor(Math.random()*customers.length)];
    return done();
  },
  
  generateSagaId: (userContext, events, done) => {
    // Générer un ID de saga pour les tests d'exécution
    userContext.vars.sagaId = faker.string.uuid();
    return done();
  },
  
  extractSagaId: (userContext, events, done) => {
    // Extraire l'ID de saga de la réponse pour l'utiliser dans l'exécution
    const response = events.response;
    if (response && response.body && response.body.saga && response.body.saga.id) {
      userContext.vars.sagaId = response.body.saga.id;
    }
    return done();
  },
  
  generatePurchaseData: (userContext, events, done) => {
    // Générer des données d'achat réalistes
    userContext.vars.purchaseData = {
      store_id: userContext.vars.storeIds[Math.floor(Math.random()*userContext.vars.storeIds.length)],
      customer_id: userContext.vars.customerIds[Math.floor(Math.random()*userContext.vars.customerIds.length)],
      items: [{
        product_id: userContext.vars.productIds[Math.floor(Math.random()*userContext.vars.productIds.length)],
        quantity: faker.number.int({ min: 1, max: 5 }),
        price: parseFloat(faker.commerce.price())
      }],
      payment_method: "credit_card",
      amount: parseFloat(faker.commerce.price({ min: 10, max: 500 }))
    };
    return done();
  },
  
  generateReturnData: (userContext, events, done) => {
    // Générer des données de retour réalistes
    userContext.vars.returnData = {
      sale_id: faker.number.int({ min: 1000, max: 9999 }),
      customer_id: userContext.vars.customerIds[Math.floor(Math.random()*userContext.vars.customerIds.length)],
      items: [{
        product_id: userContext.vars.productIds[Math.floor(Math.random()*userContext.vars.productIds.length)],
        quantity: faker.number.int({ min: 1, max: 3 }),
        reason: "defective"
      }],
      refund_amount: parseFloat(faker.commerce.price({ min: 10, max: 200 }))
    };
    return done();
  },
  
  validateSagaResponse: (userContext, events, done) => {
    // Valider que la réponse de saga contient les données attendues
    const response = events.response;
    if (response && response.body) {
      if (!response.body.saga || !response.body.saga.id) {
        console.error('Réponse de saga invalide:', response.body);
      }
    }
    return done();
  }
};