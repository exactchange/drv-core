/*
 * Events.Transaction
 */

(() => {

  /*
  Exports
  */

  module.exports = ({ transactionApi, priceApi }) => {
    const onTransaction = async ({
      senderAddress,
      recipientAddress,
      currency,
      usdAmount,
      embrAmount
    }) => {
      const success = await transactionApi.createTransaction({
        sender: senderAddress,
        recipient: recipientAddress,
        currency,
        usdAmount,
        embrAmount,
        currentPrice: priceApi.price,
        currentInventory: priceApi.inventory
      });

      if (!success) return;

      let updatedPrice;

      const currentUsdValue = parseFloat(
        Math.max(
          0.001,
          usdAmount / embrAmount
        )
      );

      if (currency === 'usd') {
        updatedPrice = currentUsdValue;

        console.log(
          `<Embercoin> A proof of value was asserted: "${embrAmount.toFixed(2)} COIN == ${usdAmount.toFixed(2)} USD".`,
        );
      }

      if (currency === 'embr') {
        const priceDifference = parseFloat(
          Math.abs(priceApi.price - currentUsdValue)
        );

        if (priceDifference <= (priceApi.price * .15)) {
          updatedPrice = currentUsdValue;

          console.log(
            `<Embercoin> A proof of value was asserted: "1.00 COIN == ${updatedPrice.toFixed(2)} USD".`,
          );
        } else {
          console.log(
            `<Embercoin> Assertion Rejected: ${embrAmount.toFixed(2)} COIN is not proven to be worth ${usdAmount.toFixed(2)} USD within a standard deviation of 15%.`
          );

          console.log(
            '<Embercoin> Correcting a misvaluation...'
          );

          const modifier = (
            currentUsdValue < priceApi.price
              ? -0.15
              : 0.15
          );

          updatedPrice = parseFloat(
            parseFloat(priceApi.price * modifier) +
            parseFloat(priceApi.price)
          );

          console.log(
            `<Embercoin> A corrected proof of value was asserted: "1.00 COIN == ${updatedPrice.toFixed(2)} USD (adjusted from ${currentUsdValue.toFixed(2)} USD)".`,
          );
        }
      }

      const updatedPriceDifference = parseFloat(updatedPrice - priceApi.price);

      const reward = updatedPriceDifference > 0 && (
        parseFloat((updatedPriceDifference / priceApi.price) * embrAmount)
      );

      if (reward) {
        const rewardTransactionResult = await onTransaction({
          senderAddress: 'treasury-0000-0000-0000-000000000000',
          recipientAddress,
          currency: 'embr',
          usdAmount: updatedPriceDifference * embrAmount,
          embrAmount: reward
        });

        if (rewardTransactionResult?.success) {
          priceApi.updateInventory(reward);
        }
      }

      priceApi.updatePrice(updatedPrice);

      return {
        success,
        price: priceApi.price,
        marketCap: priceApi.marketCap,
        reward
      };
    };

    return {
      onTransaction
    };
  };
})();
