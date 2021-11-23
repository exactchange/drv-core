/*
API.Price
 */

(() => {
  /*
  Database
  */

  const mongo = require('../mongo');

  const {
    BLOCKCHAIN_DB_NAME,
    BLOCKCHAIN_MONGO_URI
  } = process.env;

  let db;

  mongo(BLOCKCHAIN_MONGO_URI, async (error, client) => {
    if (error) {
      console.log('<Embercoin> :: Database Error:', error);

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
        let embr = 1;
        const tokens = {};

        transactionsResult.forEach(({
          senderAddress,
          recipientAddress,
          tokenAddress,
          embrAmount,
          currency,
          denomination
        }) => {
          if (currency === 'usd') return;

          const tokenAmount = (embrAmount * parseInt(denomination, 10));

          if (tokens[tokenAddress] === undefined) {
            tokens[tokenAddress] = 0;
          }

          if (senderAddress.match('treasury')) {
            embr += embrAmount;
          }

          if (recipientAddress.match('treasury')) {
            embr -= embrAmount;
          }

          if (senderAddress === recipientAddress) {
            tokens[tokenAddress] -= tokenAmount;
            tokens[senderAddress] += tokenAmount;
          }
        });

        return {
          embr,
          tokens
        };
      }
    };

    const getMarketCap = async () => {
      const inventory = await getInventory();
      const price = await getPrice();

      return parseFloat(inventory * price).toFixed(2);
    };

    return {
      getPrice,
      getInventory,
      getMarketCap
    }
  };
})();
