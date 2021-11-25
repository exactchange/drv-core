/*
 * Events.Transaction
 */

const {
  EMBR,
  EMBR_TEXT,
  USD,
  USD_TEXT,
  TREASURY_ADDRESS
} = require('../currency');

const { generateId } = require('../algorithms');

(() => {

  /*
  Exports
  */

  module.exports = ({ transactionApi, priceApi }) => {
    const onValueAssertion = async ({
      currency,
      embrAmount,
      usdAmount
    }) => {
      let price;

      const apiPrice = await priceApi.getPrice();

      const usdValue = parseFloat(
        Math.max(
          0.0000000001,
          usdAmount / embrAmount
        )
      );

      if (currency === USD_TEXT) {
        price = usdValue;

        console.log(
          `<Embercoin> :: A proof of value was asserted: "${embrAmount.toFixed(2)} ${EMBR} == ${usdAmount.toFixed(2)} ${USD}".`,
        );
      }

      if (currency === EMBR_TEXT) {
        const priceDifference = parseFloat(
          Math.abs(apiPrice - usdValue)
        );

        if (priceDifference <= (apiPrice * .15)) {
          price = usdValue;

          console.log(
            `<Embercoin> :: A proof of value was asserted: "1.00 ${EMBR} == ${price.toFixed(2)} ${USD}".`,
          );
        } else {
          console.log(
            `<Embercoin> :: Assertion Rejected: ${embrAmount.toFixed(2)} ${EMBR} is not proven to be worth ${usdAmount.toFixed(2)} ${USD} within a standard deviation of 15%.`
          );

          console.log(
            '<Embercoin> :: Correcting a misvaluation...'
          );

          const modifier = (
            usdValue < apiPrice
              ? -0.15
              : 0.15
          );

          price = parseFloat(
            parseFloat(apiPrice * modifier) +
            parseFloat(apiPrice)
          );

          console.log(
            `<Embercoin> :: A corrected proof of value was asserted: "1.00 ${EMBR} == ${price.toFixed(2)} ${USD} (adjusted from ${usdValue.toFixed(2)} ${USD})".`,
          );
        }
      }

      return {
        price,
        usdValue
      };
    };

    const onTransaction = async ({
      hash,
      next,
      senderAddress,
      recipientAddress,
      tokenAddress,
      currency,
      usdAmount,
      embrAmount,
      status
    }) => {
      const currentPrice = await priceApi.getPrice();
      const currentInventory = await priceApi.getInventory();

      const transaction = {
        hash,
        next,
        senderAddress,
        recipientAddress,
        tokenAddress,
        currency,
        usdAmount,
        embrAmount,
        status,
        currentPrice,
        currentInventory: currentInventory
      };

      const success = await transactionApi.createTransaction(transaction);

      if (!success) return;

      const { price } = await onValueAssertion(transaction);
      const priceDifference = parseFloat(price - currentPrice);

      const reward = currency === USD_TEXT && priceDifference > 0 && (
        parseFloat(priceDifference * .1 * embrAmount)
      );

      if (reward) {
        await onTransaction({
          hash: generateId(),
          next: '',
          senderAddress: TREASURY_ADDRESS,
          recipientAddress,
          tokenAddress: recipientAddress,
          currency: EMBR_TEXT,
          usdAmount: priceDifference * embrAmount,
          embrAmount: reward,
          status,
          currentPrice,
          currentInventory
        });
      }

      const marketCap = await priceApi.getMarketCap();

      return {
        success,
        price,
        marketCap,
        reward
      };
    };

    return {
      onValueAssertion,
      onTransaction
    };
  };
})();
