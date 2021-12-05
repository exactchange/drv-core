/*
Enforcements.Standard
 */

const fetch = require('node-fetch-commonjs');

const { COMPLETE, PENDING } = require('../statuses');

module.exports = async (transaction, peers = []) => {
  let confidence = 0, didConnectAndSend = false;

  await Promise.all(
    peers.map(async url => {
      if (!url) return;

      const transactionResult = await fetch(
        `${url}/transaction`,
        {
          method: 'POST',
          body: transaction
        }
      );

      didConnectAndSend = (
        transactionResult && transactionResult.status === 200
      );

      if (didConnectAndSend) confidence++;
    })
  );

  if (!didConnectAndSend) {
    console.log('<Embercoin> :: There are no peers online to echo the transaction. It will remain in a pending state until the next enforcement attempt.');
  }

  console.log(`<Embercoin> Transaction was corroborated by ${confidence} peers (Confidence: ${Math.min(99, Math.min(4, confidence) / 4 * 100)}%).`);

  return didConnectAndSend ? COMPLETE : PENDING;
};
