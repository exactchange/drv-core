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
  const { generateId } = require('./algorithms');

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

    return transaction && transaction.currentPrice;
  };

  /*
  Service (HTTP)
  */

  module.exports = http({
    GET: {
      price: async () => {
        const price = await priceApi.getPrice();
        const marketCap = await priceApi.getMarketCap();
        const inventory = await priceApi.getInventory();
        const price24hAgo = await getPrice24hAgo();

        return {
          price,
          price24hAgo: price24hAgo || price,
          marketCap,
          inventory
        }
      },
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
        contract = 'standard',
        isTest
      }) => {
        const usd = Math.max(1, usdAmount);
        const embr = Math.max(0.0000000001, embrAmount);

        const transaction = {
          hash: generateId(),
          next: '',
          senderAddress,
          recipientAddress,
          tokenAddress,
          currency,
          usdAmount: usd,
          embrAmount: embr
        };

        const isValid = validations[contract](transaction);

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

        const price = await priceApi.getPrice();
        const price24hAgo = await getPrice24hAgo() || price;

        return {
          ...result,

          price24hAgo
        };
      }
    },
    PUT: {},
    DELETE: {}
  });
})();
