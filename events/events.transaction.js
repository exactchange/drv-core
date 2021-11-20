/*
 * Events.Transaction
 */

const { generateId } = require('../algorithms');

(() => {

  /*
  Exports
  */

  module.exports = ({ transactionApi, priceApi }) => {
    const onValueAssertion = ({
      currency,
      embrAmount,
      usdAmount
    }) => {
      let price;

      const usdValue = parseFloat(
        Math.max(
          0.001,
          usdAmount / embrAmount
        )
      );

      if (currency === 'usd') {
        price = usdValue;

        console.log(
          `<Embercoin> :: A proof of value was asserted: "${embrAmount.toFixed(2)} COIN == ${usdAmount.toFixed(2)} USD".`,
        );
      }

      if (currency === 'embr') {
        const priceDifference = parseFloat(
          Math.abs(priceApi.price - usdValue)
        );

        if (priceDifference <= (priceApi.price * .15)) {
          price = usdValue;

          console.log(
            `<Embercoin> :: A proof of value was asserted: "1.00 COIN == ${price.toFixed(2)} USD".`,
          );
        } else {
          console.log(
            `<Embercoin> :: Assertion Rejected: ${embrAmount.toFixed(2)} COIN is not proven to be worth ${usdAmount.toFixed(2)} USD within a standard deviation of 15%.`
          );

          console.log(
            '<Embercoin> :: Correcting a misvaluation...'
          );

          const modifier = (
            usdValue < priceApi.price
              ? -0.15
              : 0.15
          );

          price = parseFloat(
            parseFloat(priceApi.price * modifier) +
            parseFloat(priceApi.price)
          );

          console.log(
            `<Embercoin> :: A corrected proof of value was asserted: "1.00 COIN == ${price.toFixed(2)} USD (adjusted from ${usdValue.toFixed(2)} USD)".`,
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
      denomination,
      status
    }) => {
      const transaction = {
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
        currentPrice: priceApi.price,
        currentInventory: priceApi.inventory
      };

      const success = await transactionApi.createTransaction(transaction);

      if (!success) return;

      const { price } = onValueAssertion(transaction);
      const priceDifference = parseFloat(price - priceApi.price);

      const reward = priceDifference > 0 && (
        parseFloat(priceDifference * .1 * embrAmount)
      );

      if (reward) {
        const rewardTransactionResult = await onTransaction({
          hash: generateId(),
          next: '',
          senderAddress: 'treasury-0000-0000-0000-000000000000',
          recipientAddress,
          tokenAddress: recipientAddress,
          currency: 'embr',
          usdAmount: priceDifference * embrAmount,
          embrAmount: reward,
          denomination,
          status,
          currentPrice: priceApi.price,
          currentInventory: priceApi.inventory
        });

        if (rewardTransactionResult?.success) {
          priceApi.updateInventory(reward);
        }
      }

      await priceApi.updatePrice(price);

      return {
        success,
        price,
        marketCap: priceApi.marketCap,
        reward
      };
    };

    return {
      onValueAssertion,
      onTransaction
    };
  };
})();
