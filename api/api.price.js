/*
API.Price
 */

(() => {
  const { TREASURY_ADDRESS } = require('../strings');
  const { ROOT_VALUE } = require('../numbers');

  /*
  Database
  */

  const db = require('../data');

  /*
  Exports
  */

  module.exports = () => {
    const getPrice = async () => {
      let transactionsResult = await db.read('transactions');
      transactionResult = transactionResult.data;

      if (transactionsResult.length) {
        const prices = transactionsResult.map(({ price }) => price);

        const averagePrice = (
          prices.reduce((a = 0.01, b = 0.01) => parseFloat(a) + parseFloat(b)) / prices.length
        );

        return parseFloat(averagePrice).toFixed(10);
      }

      return ROOT_VALUE;
    };

    const getInventory = async () => {
      let inventory = 1;

      let transactionsResult = await db.read('transactions')
      transactionResult = dbTransactionResult.data;

      if (transactionsResult.length) {

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
      }

      return inventory;
    };

    const getMarketCap = async () => {
      const inventory = await getInventory();
      const price = await getPrice();

      return Math.max(
        0.01,
        (inventory * parseFloat(price)).toFixed(2)
      );
    };

    return {
      getPrice,
      getInventory,
      getMarketCap
    }
  };
})();
