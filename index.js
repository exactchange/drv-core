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

  /*
  Service (HTTP)
  */

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
        currency,
        usdAmount,
        embrAmount,
        isTest
      }) => {
        const isValid = Boolean(
          senderAddress.length === 36 &&
          recipientAddress.length === 36 &&
          (currency === 'usd' || currency === 'embr') &&
          embrAmount && usdAmount
        );

        if (isTest) {
          return {
            success: isValid
          };
        }

        if (!isValid) {
          return BAD_REQUEST;
        }

        const transactionResult = await transactionEvents.onTransaction({
          senderAddress,
          recipientAddress,
          currency,
          usdAmount: Math.max(1, usdAmount),
          embrAmount: Math.max(0.01, embrAmount)
        });

        let response = {
          success: !!transactionResult.success
        };

        if (response.success) {
          response.price = transactionResult.price;
          response.price24hAgo = getPrice24hAgo();
          response.marketCap = transactionResult.marketCap;
          response.reward = transactionResult.reward;
        }

        return response;
      }
    },
    PUT: {},
    DELETE: {}
  });
})();
