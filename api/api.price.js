/*
API.Price
 */

(() => {
  const {
    USD_TEXT,
    TREASURY_ADDRESS
  } = require('../currency');

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
        const prices = transactionsResult.map(({ currentPrice }) => currentPrice);

        const averagePrice = prices.length < 2
          ? prices[0]
          : prices.reduce((a, b) => parseFloat(a) + parseFloat(b)) / prices.length;

        return parseFloat(averagePrice).toFixed(2);
      }

      return '-1.00';
    };

    const getInventory = async () => {
      const transactionsResult = await db.collection('transactions').find().toArray();

      if (transactionsResult.length) {
        let inventory = 1;

        transactionsResult.forEach(({
          senderAddress,
          recipientAddress,
          drvAmount,
          currency
        }) => {
          if (currency === USD_TEXT) return;

          if (senderAddress === TREASURY_ADDRESS) {
            inventory += drvAmount;
          }

          if (recipientAddress === TREASURY_ADDRESS) {
            inventory -= drvAmount;
          }
        });

        return inventory;
      }
    };

    const getMarketCap = async () => {
      const inventory = await getInventory();
      const price = await getPrice();

      return (inventory * parseFloat(price)).toFixed(2);
    };

    return {
      getPrice,
      getInventory,
      getMarketCap
    }
  };
})();
