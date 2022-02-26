/*
API.Transaction
 */

(() => {
  const mongo = require('../mongo');
  const { TREASURY_ADDRESS } = require('../strings');
  const { ROOT_VALUE } = require('../numbers');
  const { generateId } = require('../algorithms');

  const {
    BLOCKCHAIN_DB_NAME,
    BLOCKCHAIN_MONGO_URI,
    TOKEN_ADDRESS
  } = process.env;

  /*
  Dependencies
  */

  const { LinkedList } = require('crypto-linked-list');

  /*
  Database
  */

  let db, transactions = new LinkedList([
    {
      timestamp: Date.now(),
      hash: generateId(),
      next: '',
      senderAddress: TREASURY_ADDRESS,
      recipientAddress: TOKEN_ADDRESS,
      contract: 'record',
      usdValue: ROOT_VALUE,
      drvValue: 1.00,
      status: 'complete',
      price: ROOT_VALUE
    }
  ]);

  mongo(BLOCKCHAIN_MONGO_URI, async (error, client) => {
    if (error) {
      console.log('<DRV> :: Database Error:', error);

      return;
    }

    db = client.db(BLOCKCHAIN_DB_NAME);

    const dbTransactionResult = await db.collection('transactions').find().toArray();

    if (dbTransactionResult.length) {
      dbTransactionResult.forEach(transactions.add);
    }

    console.log('<DRV> :: Transactions loaded.');
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
        `<DRV> :: A transaction was added.`,
        tail.data
      );

      if (prev) {
        await db.collection('transactions').updateOne(
          { hash: prev.data.hash },
          { $set: { next: prev.data.next } }
        );

        console.log(
          `<DRV> :: The next hash of the previous transaction was updated.`,
          prev.data
        );
      }

      return true;
    }
  });
})();
