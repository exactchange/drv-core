/*
API.Price
 */

(() => {
  const mongo = require('../mongo');

  const {
    BLOCKCHAIN_DB_NAME,
    BLOCKCHAIN_MONGO_URI
  } = process.env;

  /*
  Database
  */

  let db, inventory = 1, price = 0.01, prices = [];

  mongo(BLOCKCHAIN_MONGO_URI, async (error, client) => {
    if (error) {
      console.log('<Embercoin> :: Database Error:', error);

      return;
    }

    db = client.db(BLOCKCHAIN_DB_NAME);

    const pricesResult = await db.collection('transactions').find().toArray();

    /*
     * TODO: Derive `currentPrice` and `currentInventory` functionally
     */

    if (pricesResult.length) {
      inventory = pricesResult[pricesResult.length - 1].currentInventory;
      price = pricesResult[pricesResult.length - 1].currentPrice;
      prices.push(...pricesResult.map(({ currentPrice }) => currentPrice));
    }

    console.log(`<Embercoin> :: Price and inventory loaded (Price: ${parseFloat(price).toFixed(2)} USD, Inventory: ${parseFloat(inventory).toFixed(2)}).`);

    /*
     */
  });

  /*
  Exports
  */

  module.exports = () => {
    const getPrice = () => {
      const averagePrice = prices.length < 2
        ? price
        : (
          prices.reduce((a, b) => parseFloat(a) + parseFloat(b)) / prices.length
        );

      return parseFloat(averagePrice).toFixed(2);
    };

    return {
      get price() {
        return getPrice();
      },

      get marketCap() {
        const price = getPrice();

        return (inventory * parseFloat(price)).toFixed(2);
      },

      get inventory() {
        return inventory;
      },

      updatePrice: price => {
        prices.push(Math.max(parseFloat(0.001), parseFloat(price)));

        console.log(
          `<Embercoin> :: A new proof of value was asserted in a transaction, possibly changing the average coin price.`
        );
      },

      updateInventory: embrAmount => {
        inventory += embrAmount;

        console.log(
          `<Embercoin> :: The total number of coins is now ${inventory}`
        );
      }
    }
  };
})();
