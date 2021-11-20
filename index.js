/*
 * (default)
 */

require('dotenv').config();

(() => {

  /*
  Dependencies
  */

  const { http } = require('node-service-client');
  const { BAD_REQUEST } = require('./errors');

  /*
  Backend
  */

  const transactionApi = require('./api/api.transaction')();
  const priceApi = require('./api/api.price')();
  const transactionEvents = require('./events/events.transaction')({ transactionApi, priceApi });
  const validations = require('./validations');
  const enforcements = require('./enforcements');

  /*
  Algorithms
  */

  const g4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0)
     .toString(16)
     .substring(1);
  };

  const generateId = () => (
    `${g4()}${g4()}-${g4()}-${g4()}-${g4()}-${g4()}${g4()}${g4()}`
  );

  const getPrice24hAgo = () => {
    const transaction = transactionApi
      .getTransactions()
      .filter(({ timestamp }) => (
        new Date().setHours(0, 0, 0, 0) ===
        new Date(timestamp).setHours(0, 0, 0, 0)
      ))
      .sort((a, b) => (
        a.timestamp < b.timestamp
          ? 1
          : a.timestamp > b.timestamp
            ? -1
            : 0
      ))
      .pop();

    return (
      transaction
        ? transaction.currentPrice
        : priceApi.price
    );
  };

  /*
  Service (HTTP)
  */

  module.exports = http({
    GET: {
      price: () => ({
        price: priceApi.price,
        marketCap: priceApi.marketCap,
        price24hAgo: getPrice24hAgo(),
      }),
      transactions: () => transactionApi.getTransactions()
    },
    POST: {
      transaction: async ({
        senderAddress,
        recipientAddress,
        tokenAddress,
        currency,
        usdAmount,
        embrAmount,
        denomination = 1,
        isTest
      }) => {
        const usd = Math.max(1, usdAmount);
        const embr = Math.max(0.01, embrAmount);

        const transaction = {
          hash: generateId(),
          next: '',
          senderAddress,
          recipientAddress,
          tokenAddress,
          currency,
          usdAmount: usd,
          embrAmount: embr,
          denomination
        };

        const isValid = validations.standard(transaction);

        if (isTest) {
          return {
            success: isValid
          };
        }

        if (!isValid) {
          return BAD_REQUEST;
        }

        transaction.status = await enforcements.standard(transaction);

        const result = await transactionEvents.onTransaction(transaction);

        if (!result?.success) {
          return { success: false };
        }

        return {
          ...result,

          price24hAgo: getPrice24hAgo()
        };
      }
    },
    PUT: {},
    DELETE: {}
  });
})();
