/*
API.Transaction
 */

(() => {
  /*
  Dependencies
  */

  const { LinkedList } = require('crypto-linked-list');

  /*
  Memory
  */

  const transactions = new LinkedList;

  /*
  Exports
  */

  const getTransactions = () => {
    if (!transactions) return [];

    let tail = transactions.head;

    if (!tail) return [];

    if (!tail.next) return [tail.data];

    let transactionsArray = [];

    while (tail.next) {
      transactionsArray.push(tail.data);

      tail = tail.next;
    }

    transactionsArray.push(tail.data);

    return transactionsArray;
  };

  module.exports = () => ({
    getTransactions,

    getTransaction: index => (
      transactions && transactions.itemAt(index).data
    ),

    createTransaction: async ({
      sender,
      recipient,
      currency,
      usdAmount,
      coinAmount,
      currentPrice,
      currentInventory
    }) => {
      if (!transactions) return;

      const transaction = {
        timestamp: Date.now(),
        sender,
        recipient,
        currency,
        usdAmount,
        coinAmount,
        currentPrice,
        currentInventory
      };

      /*
       * Persistence
       * Your device's database work goes here
       */

      const dbResult = await (async () => ({
        result: {
          ok: true
        }
      }))();

      /*
       */

      if (!dbResult.result.ok) return;

      transactions.add(transaction);

      let tail = transactions.head;

      while (tail.next) {
        tail = tail.next;
      }

      console.log(
        `<Blockchain> A transaction was added (paid in ${currency.toUpperCase()}).`,
        tail.data
      );

      return true;
    }
  });
})();
