/*
 * Events.Transaction
 */

const {
  STANDARD_DEVIATION,
  ZERO
} = require('../numbers');

const {
  DRV,
  USD,
  TREASURY_ADDRESS,
  RECORD
} = require('../strings');

const { generateId } = require('../algorithms');

(() => {

  /*
  Exports
  */

  module.exports = ({ transactionApi, priceApi }) => {
    const onValueAssertion = async ({
      contract,
      drvValue,
      usdValue
    }) => {
      let price;
      const isFungible = contract === RECORD;

      const apiPrice = await priceApi.getPrice();

      usdValue = parseFloat(
        Math.max(
          ZERO,
          usdValue / (
            isFungible
              ? drvValue
              : ZERO
          )
        )
      );

      const priceDifference = parseFloat(
        Math.abs(apiPrice - usdValue)
      );

      const isMisvaluation = priceDifference > (apiPrice * STANDARD_DEVIATION);

      if (isMisvaluation) {
        if (isFungible) {
          console.log(
            `<DRV> :: Assertion Rejected: ${drvValue.toFixed(2)} ${DRV} is not proven to be worth ${(usdValue / drvValue).toFixed(2)} ${USD} within a standard deviation of 15%.`
          );
        } else {
          console.log(
            '<DRV> :: Assertion Rejected: The content is not proven to be worth the USD value within a standard deviation of 15%.'
          );
        }

        console.log(
          '<DRV> :: Correcting a misvaluation...'
        );

        const modifier = (
          usdValue < apiPrice
            ? (STANDARD_DEVIATION * -1)
            : STANDARD_DEVIATION
        );

        price = parseFloat(
          parseFloat(apiPrice * modifier) +
          parseFloat(apiPrice)
        );

        console.log(
          `<DRV> :: A corrected proof of value was asserted: "1.00 ${DRV} == ${price.toFixed(2)} ${USD} (adjusted from ${usdValue.toFixed(2)} ${USD})".`,
        );
      } else {
        price = usdValue;

        console.log(
          `<DRV> :: A proof of value was asserted: "1.00 ${DRV} == ${price.toFixed(2)} ${USD}".`,
        );
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
      contract,
      usdValue,
      drvValue,
      status,
      isReward = false
    }) => {
      const currentPrice = await priceApi.getPrice();

      const transaction = {
        hash,
        next,
        senderAddress,
        recipientAddress,
        contract,
        usdValue,
        drvValue,
        price: currentPrice,
        status
      };

      const success = await transactionApi.createTransaction(transaction);

      if (!success) return;

      const { price } = await onValueAssertion(transaction);
      const priceDifference = parseFloat(price - currentPrice);

      const reward = priceDifference > 0 && (
        parseFloat(priceDifference * .1 * drvValue)
      );

      if (!isReward && reward) {
        await onTransaction({
          hash: generateId(),
          next: '',
          senderAddress: TREASURY_ADDRESS,
          recipientAddress,
          contract,
          usdValue: priceDifference * drvValue,
          drvValue: reward,
          status,
          isReward: true
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
