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
      hash,
      next,
      senderAddress,
      recipientAddress,
      tokenAddress,
      currency,
      usdAmount,
      embrAmount,
      denomination,
      status,
      currentPrice,
      currentInventory
    }) => {
      if (!transactions) return;

      const transaction = {
        timestamp: Date.now(),
        hash,
        next,
        senderAddress,
        recipientAddress,
        tokenAddress,
        currency,
        usdAmount,
        embrAmount,
        denomination,
        status,
        currentPrice,
        currentInventory
      };

      transactions.add(transaction);

      let prev, tail = transactions.head;

      while (tail.next) {
        prev = tail;
        tail = tail.next;

        prev.data.next = tail.data.hash;
      }

      await db.collection('transactions').insertOne(
        tail.data
      );

      console.log(
        `<Embercoin> :: A transaction was added (paid in ${currency.toUpperCase()}).`,
        tail.data
      );

      if (prev) {
        await db.collection('transactions').updateOne(
          { hash: prev.data.hash },
          { $set: { next: prev.data.next } }
        );

        console.log(
          `<Embercoin> :: The next hash of the previous transaction was updated.`,
          prev.data
        );
      }

      return true;
    }
  });
})();
