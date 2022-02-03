/*
 * Events.Transaction
 */

const {
  DRV,
  DRV_TEXT,
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
      drvAmount,
      usdAmount
    }) => {
      let price;

      const apiPrice = await priceApi.getPrice();

      const usdValue = parseFloat(
        Math.max(
          0.0000000001,
          usdAmount / drvAmount
        )
      );

      if (currency === USD_TEXT) {
        price = usdValue;

        console.log(
          `<DRV> :: A proof of value was asserted: "${drvAmount.toFixed(2)} ${DRV} == ${usdAmount.toFixed(2)} ${USD}".`,
        );
      }

      if (currency === DRV_TEXT) {
        const priceDifference = parseFloat(
          Math.abs(apiPrice - usdValue)
        );

        if (priceDifference <= (apiPrice * .15)) {
          price = usdValue;

          console.log(
            `<DRV> :: A proof of value was asserted: "1.00 ${DRV} == ${price.toFixed(2)} ${USD}".`,
          );
        } else {
          console.log(
            `<DRV> :: Assertion Rejected: ${drvAmount.toFixed(2)} ${DRV} is not proven to be worth ${usdAmount.toFixed(2)} ${USD} within a standard deviation of 15%.`
          );

          console.log(
            '<DRV> :: Correcting a misvaluation...'
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
            `<DRV> :: A corrected proof of value was asserted: "1.00 ${DRV} == ${price.toFixed(2)} ${USD} (adjusted from ${usdValue.toFixed(2)} ${USD})".`,
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
      drvAmount,
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
        drvAmount,
        status,
        currentPrice,
        currentInventory: currentInventory
      };

      const success = await transactionApi.createTransaction(transaction);

      if (!success) return;

      const { price } = await onValueAssertion(transaction);
      const priceDifference = parseFloat(price - currentPrice);

      const reward = currency === USD_TEXT && priceDifference > 0 && (
        parseFloat(priceDifference * .1 * drvAmount)
      );

      if (reward) {
        await onTransaction({
          hash: generateId(),
          next: '',
          senderAddress: TREASURY_ADDRESS,
          recipientAddress,
          tokenAddress: recipientAddress,
          currency: DRV_TEXT,
          usdAmount: priceDifference * drvAmount,
          drvAmount: reward,
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
