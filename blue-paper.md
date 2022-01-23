# Embercoin Technical Overview

## Features

### Proof of Value

**Proof of Value Assertions**

A *Proof of Value* is asserted whenever EMBR is shown to have some value. The simplest example of this is when someone trades USD for EMBR. For example, if you spend 10.00 USD for 1 EMBR, a value of 10.00 USD is asserted in the blockchain and worked into its subsequent valuation.

Another way to assert value is to sell a product normally purchased in USD in EMBR. Let's say you've sold a number of products online for 10.00 USD each, and now you want to accept crypto payments. For every sale where you accept EMBR as payment, value will be asserted for the sale amount and worked into the valuation.

Proof of Value occurs in the [`onTransaction`](./events/events.transaction.js) lifecycle method, which is invoked after the transaction has been inserted into the blockchain. If the value increased as a result of the transaction, a reward is mined (see *Transaction Rewards* below), and `onTransaction` is recursively called with the reward amount.

**Assertion Misvaluations, Rejections, & Corrected Proofs of Value**

A Proof of Value Assertion will be rejected if the assertion exceeds the Deviation Rate (see *Deviation Rate* below). When a Proof of Value is asserted against USD, the USD amount goes through two layers of validation:

1. `usdAmount` must be higher than `0.0000000001`, and is adjusted by the `embrAmount` it is asserted against:

    ```
    // ./events/events.transaction.js

    const usdValue = parseFloat(
      Math.max(
        0.0000000001,
        usdAmount / embrAmount
      )
    );
    ```

2. The difference between the EMBR `price` and the adjusted `usdValue` must not exceed a Standard Deviation of the average price (see *Deviation Rate* below).

    ```
    // ./events/events.transaction.js

    const priceDifference = parseFloat(
      Math.abs(priceApi.price - usdValue)
    );

    if (priceDifference <= (priceApi.price * .15)) {
      // Assertion Rejection

      ...
    ```

Misvaluations and Rejections are *automatically corrected* in the blockchain and the valuation is re-submitted within the Deviation Rate (see *Deviation Rate* below).

**Transaction Rewards & dilution**

A Proof of Value Assertion that results in a price increase self-mitigates potential volatility through automatic dilution - by increasing the supply of crypto and rewarding it to the seller. This creates a situation where miners (sellers) are rewarded for their contributions only when they add value, creating incentive to do so and minimizing overall dilutive effect.

**Reward Ceiling**

Rewards are always mined at the current value of EMBR, and therefore cannot generate further rewards. Because the reward is a recursive call of `onTransaction` (invoked within `onTransaction`) the concept of rewards deriving from other rewards isn't technically feasable, as it would cause an infinite loop in `onTransaction` and crash the blockchain. This creates a natural Reward Ceiling that minimizes dilution and volatility associated with mining:

```
// ./events/events.transaction.js

const priceDifference = parseFloat(price - priceApi.price);

const reward = currency === 'usd' && priceDifference > 0 && (
  parseFloat(priceDifference * .1 * embrAmount)
);

if (reward) {
  const rewardTransactionResult = await onTransaction({
    senderAddress: 'treasury-0000-0000-0000-000000000000',
    recipientAddress,
    currency: 'embr',
    usdAmount: priceDifference * embrAmount,
    embrAmount: reward
  });

  ...
```

**Long-term stability**

The weight of each Proof of Value Assertion depends on the number of total transactions: For example a blockchain with millions of recorded transactions will have a much stabler valuation (trading price) than a blockchain with only a few.

### Deviation Rate

A Deviation Rate of 15% is applied to all Proof of Value Assertions, and is equivalent to the Standard Deviation of the average trading price. Any Proof of Value Assertion that exceeds the Deviation Rate is automatically rejected.

```
const deviationRate = priceApi.price * .15;
```

**Crypto trading**

As a merchant or trader, you can assert any value you want, but if your assertion exceeds the Deviation Rate, the proof is rejected, corrected, and re-submitted at the Maximum Allowable Deviation. For example, if you sell 1 EMBR valued at 10.00 USD for only 0.01 USD, the transaction will succeed, but will result in a misvaluation, and the blockchain will re-attempt valuing the transaction at the minimum value allowed (in this case 8.50 USD). If it's valued too high, for example 1 EMBR valued at 10.00 USD is sold for 100.00 USD, it will attempt to value it at the highest possible amount (in this case 11.50), as shown:

```
// ./events/events.transaction.js

const modifier = (
  usdValue < priceApi.price
    ? -0.15
    : 0.15
);

price = parseFloat(
  parseFloat(priceApi.price * modifier) +
  parseFloat(priceApi.price)
);
```

## Key Files

• Price API: [api/api.price.js](https://github.com/exactchange/embercoin/blob/master/api/api.price.js)

• Transaction API: [api/api.transaction.js](https://github.com/exactchange/embercoin/blob/master/api/api.transaction.js)

• Transaction Lifecycle Events: [events/events.transaction.js](https://github.com/exactchange/embercoin/blob/master/events/events.transaction.js)

* * *
• Embercoin is forked from: [exactchange/blockchain](https://github.com/exactchange/blockchain)
* * *
