/*
API.Price
 */

(() => {
  const { TREASURY_ADDRESS } = require('../strings');

  /*
  Database
  */

  const {
    BLOCKCHAIN_DB_NAME,
    BLOCKCHAIN_MONGO_URI
  } = process.env;

  const mongo = require('../mongo');

  let db;

  mongo(BLOCKCHAIN_MONGO_URI, async (error, client) => {
    if (error) {
      console.log('<DRV> :: Database Error:', error);

      return;
    }

    db = client.db(BLOCKCHAIN_DB_NAME);
  });

  /*
  Exports
  */

  module.exports = () => {
    const getPrice = async () => {
      const transactionsResult = await db.collection('transactions').find().toArray();

      if (transactionsResult.length) {
        const prices = transactionsResult.map(({ price }) => price);

        const averagePrice = prices.length < 2
          ? 0.01
          : prices.reduce((a, b) => parseFloat(a) + parseFloat(b)) / prices.length;

        return parseFloat(averagePrice).toFixed(10);
      }

      return 0.01;
    };

    const getInventory = async () => {
      const transactionsResult = await db.collection('transactions').find().toArray();

      if (transactionsResult.length) {
        let inventory = 1;

        transactionsResult.forEach(({
          senderAddress,
          recipientAddress,
          contract,
          drvValue
        }) => {
          if (contract === 'nonFungibleRecord') return;

          if (senderAddress === TREASURY_ADDRESS) {
            inventory += drvValue;
          }

          if (recipientAddress === TREASURY_ADDRESS) {
            inventory -= drvValue;
          }
        });

        return inventory || 0;
      }
    };

    const getMarketCap = async () => {
      const inventory = await getInventory();
      const price = await getPrice();

      return Math.max(
        0.01,
        (inventory * parseFloat(price)).toFixed(2)
      ) || 0.01;
    };

    return {
      getPrice,
      getInventory,
      getMarketCap
    }
  };
})();
