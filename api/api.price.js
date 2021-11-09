/*
API.Price
 */

(() => {
  /*
  Memory
  */

  let inventory = 10000, price = 1;

  const prices = [];

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
          `<Blockchain> A new valuation was asserted in a transaction, possibly changing the average coin price.`
        );
      },

      updateInventory: coinAmount => {
        inventory += coinAmount;

        console.log(
          `<Blockchain> The total number of coins is now ${inventory}`
        );
      }
    }
  };
})();
