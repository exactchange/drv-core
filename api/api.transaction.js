/*
API.Transaction
 */

(() => {
  const mongo = require('../mongo');

  const {
    BLOCKCHAIN_DB_NAME,
    BLOCKCHAIN_MONGO_URI
  } = process.env;

  /*
  Dependencies
  */

  const { LinkedList } = require('crypto-linked-list');

  /*
  Database
  */

  let db, transactions;

  mongo(BLOCKCHAIN_MONGO_URI, async (error, client) => {
    if (error) {
      console.log('<Embercoin> :: Database Error:', error);

      return;
    }

    db = client.db(BLOCKCHAIN_DB_NAME);

    const dbTransactionResult = await db.collection('transactions').find().toArray();

    transactions = new LinkedList(
      dbTransactionResult.length
        ? dbTransactionResult
        : []
    );

    console.log('<Embercoin> :: Transactions loaded.');
  });

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
      embrAmount,
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
        embrAmount,
        currentPrice,
        currentInventory
      };

      const dbResult = await db.collection('transactions').insertOne(
        transaction
      );

      if (!dbResult.result.ok) return;

      transactions.add(transaction);

      let tail = transactions.head;

      while (tail.next) {
        tail = tail.next;
      }

      console.log(
        `<Embercoin> A transaction was added (paid in ${currency.toUpperCase()}).`,
        tail.data
      );

      return true;
    }
  });
})();
