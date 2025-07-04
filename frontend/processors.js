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
};