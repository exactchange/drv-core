/*
API.Transaction
 */

(() => {
  const { TOKEN_ADDRESS } = process.env;
  const { TREASURY_ADDRESS } = require('../strings');
  const { ROOT_VALUE } = require('../numbers');
  const { generateId } = require('../algorithms');
  const db = require('../data');

  let transactions;


  /*
  Dependencies
  */

  const { LinkedList } = require('crypto-linked-list');

  (async () => {

    /*
    Database
    */

    transactions = new LinkedList([
      {
        timestamp: Date.now(),
        hash: generateId(),
        next: generateId(),
        senderAddress: TREASURY_ADDRESS,
        recipientAddress: TOKEN_ADDRESS,
        contract: 'record',
        usdValue: ROOT_VALUE,
        drvValue: 1.00,
        status: 'complete',
        price: ROOT_VALUE
      }
    ]);

    let dbTransactionResult = await db.read('transactions')
    dbTransactionResult = dbTransactionResult.data;

    if (dbTransactionResult.length) {
      dbTransactionResult.forEach(transactions.add);
    }

    console.log('<DRV> :: Transactions loaded.');
  })();

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
      hash,
      next,
      senderAddress,
      recipientAddress,
      contract,
      usdValue,
      drvValue,
      status,
      price
    }) => {
      if (!transactions) return;

      const transaction = {
        timestamp: Date.now(),
        hash,
        next,
        senderAddress,
        recipientAddress,
        contract,
        usdValue,
        drvValue,
        status,
        price
      };

      transactions.add(transaction);

      let tail = transactions.head;

      while (tail.next) {
        tail = tail.next;
      }

      await db.write('transactions', null, tail.data);

      console.log(
        `<DRV> :: A transaction was added.`,
        tail.data
      );

      return true;
    }
  });
})();
