# Blockchain Technical Overview

## Coin or Token?

In forking this blockchain, you are starting a new *coin* as defined by the following characteristics:

1. It operates on its own blockchain technology that keeps track of all transactions in a native cryptocurrency.

    If you pay for something with Bitcoin, each transaction is encrypted, anonymized, and publicly viewable. Similarly, this blockchain implements a public API endpoint of publicly viewable, encrypted, anonymized transactions. Unlike Bitcoin, this blockchain also keeps track of all USD transactions associated with trading.

2. It can be used as money.

    The long-term vision of Bitcoin is to be used as a currency in the economy. Because trading with USD is built in to this blockchain - even allowing trades to happen automatically, behind-the-scenes in occurrence with product sales - it is designed specifically for this purpose.

3. It can be mined. So far there have been two primary mining methods used to increase the supply of coins in a network, they are:

    • [Proof of Work](https://en.wikipedia.org/wiki/Proof_of_work)

    • [Proof of Stake](https://en.wikipedia.org/wiki/Proof_of_stake)

    This blockchain technology proposes a third method called *Proof of Value*, in which new coins are mined only when its value has been proven to have increased as a result of a trade or transaction. The newly mined coin is given to the seller as a reward for transacting in a way that increased its value.

    The Reward Ceiling is adjusted by the overall dilutive effect of mining in order to minimize price volatility, with the goal being a coin whose value reflects its economic utility, leaving some room for trading (see *Deviation Rate* below), and a currency that prints itself only when necessary, becoming increasingly stable with each transaction.

## Features

### Proof of Value

**Proof of Value Assertions**

A *Proof of Value* is asserted whenever the coin is shown to have some value. The simplest example of this is when someone buys coin with USD. For example, if you spend 10.00 USD for 1 coin, a value of 10.00 USD is asserted in the blockchain and worked into its subsequent valuation.

Another way to assert value is to sell a product normally purchased in USD for coin. Let's say you've sold a number of lamps online for 10.00 USD each, and now you want to accept crypto payments. For every sale where you accept coin as payment, value will be asserted for the sale amount and worked into the valuation.

Proof of Value occurs in the [`onTransaction`](./events/events.transaction.js) lifecycle method, which is invoked after the transaction has been inserted into the blockchain. If the value increased as a result of the transaction, a reward is mined (see *Transaction Rewards* below), and `onTransaction` is recursively called with the reward amount.

**Assertion Misvaluations, Rejections, & Corrected Proofs of Value**

A Proof of Value Assertion will be rejected if the assertion exceeds the Deviation Rate (see *Deviation Rate* below). When a Proof of Value is asserted against USD, the USD amount goes through two layers of validation:

1. `usdAmount` must be higher than `0.001`, and is adjusted by the `coinAmount` it is asserted against:

    ```
    // ./events/events.transaction.js

    const usdValue = parseFloat(
      Math.max(
        0.001,
        usdAmount / coinAmount
      )
    );
    ```

2. The difference between the coin `price` and the adjusted `usdValue` must not exceed a Standard Deviation of the average price (see *Deviation Rate* below).

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

Rewards are always mined at the current value of the coin, and therefore cannot generate further rewards. Because the reward is a recursive call of `onTransaction` (invoked within `onTransaction`) the concept of rewards deriving from other rewards isn't technically feasable, as it would cause an infinite loop in `onTransaction` and crash the blockchain. This creates a natural Reward Ceiling that minimizes dilution and volatility associated with mining:

```
// ./events/events.transaction.js

const updatedPriceDifference = parseFloat(updatedPrice - priceApi.price);

const reward = updatedPriceDifference > 0 && (
  parseFloat((updatedPriceDifference / priceApi.price) * coinAmount)
);

if (reward) {
  const rewardTransactionResult = await onTransaction({
    senderAddress: 'treasury-0000-0000-0000-000000000000',
    recipientAddress,
    currency: 'coin',
    usdAmount: updatedPriceDifference * coinAmount,
    coinAmount: reward
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

As a miner or trader, you can assert any value you want, but if your assertion exceeds the Deviation Rate, the proof is rejected, corrected, and re-submitted at the Maximum Allowable Deviation. For example, if you sell a coin valued at 10.00 USD for only 0.01 USD, the transaction will succeed, but will result in a misvaluation, and the blockchain will re-attempt valuing the transaction at the minimum value allowed (in this case 8.50 USD). If it's valued too high, for example a coin valued at 10.00 USD is sold for 100.00 USD, it will attempt to value it at the highest possible amount (in this case 11.50), as shown:

```
// ./events/events.transaction.js

const modifier = (
  currentUsdValue < priceApi.price
    ? -0.15
    : 0.15
);

updatedPrice = parseFloat(
  parseFloat(priceApi.price * modifier) +
  parseFloat(priceApi.price)
);
```

## Use Cases

### Buying & selling crypto

**Purchasing coin with USD**

Purchasing a coin with USD is always an assertion of value, and a Proof of Value will always be submitted in these kinds of transactions. Therefore, the simplest way to increase coin value is to trade USD for it. With a Deviation Rate of 15%, trades are protected from price gouging, excessive valuations based on hype ("pump and dump" schemes), and because price is effectively stabilized by a proportional spending of USD, the potential for a scam or sudden market crash is greatly diminished (See "Long-term sustainability beyond USD" below).

**Listing coin for sale in USD**

Although this blockchain is intended to be more stable than, say, Bitcoin whose valuations are based primarily on supply and demand, and is therefore subject to hype and scams, there is still a very high trading potential with this coin, and trading is encouraged - particularly for traders who want to avoid highly-volatile coins anyway.

**Holding coin long-term (value investing)**

Beyond day-trading, value investing is also encouraged for those who see the longer-term value in a coin propped up by USD transactions. This design should not be confused with a "stablecoin", where the value is *dependent* upon the external reference (in this case USD), because in the case of a USD crash, this coin's value would not be wholly affected (as in the case of a stablecoin), as products and services are still able to be purchased, and Proofs of Value, while based around USD, are asserted independently of the economic utility of USD (see "Long-term sustainability beyond USD" below).

### Spending crypto as money

From day one, the goal of this coin is to function as an alternative currency to USD. Neither its value or supply can increase without it being spent in some way.

**Buying products & services with coin**

Buying things with this cryptocurrency is very similar to buying things with USD: Upon transacting, your account balance is adjusted accordingly, and the payment is transferred to the seller.

**Investing in companies with coin**

Investing with this cryptocurrency is closer to investing in a mortgage than investing in a startup, in that the investment itself can be refinanced against its current USD value. Let's say you invest 100.00 coin valued at 1000.00 USD in a company. If at a later date the coin is valued at 2000.00 USD, the investment can be refinanced, and as an investor you can make capital calls on that equity.

## Implications

**Accepting crypto as payment for products & services**

A merchant that backs up their transactions with this cryptocurrency plays an important role in the blockchain as a distributed appraiser and investor. Long-term value and stability cannot be ensured by trading alone, and there is a need for merchants who will accept USD alongside this cryptocurrency in order to ensure its value.

In contributing value to the blockchain, merchants are rewarded earning additional revenues in the form of cryptocurrency. In a scenario where the merchant sells coin to their customers for USD, and also accepts it as payment for their products and services, the merchant has a potential to earn additional money from their sales that could not be earned by transacting in USD alone.

**Long-term sustainability beyond USD**

This coin can be seen as "hyper stable" because in the case of a USD crash, this coin's value would not be wholly affected, as Proofs of Value continue to be asserted, and are calculated independently of the economic utility of USD.

In other words, consumers in the economy will typically choose to transact with whichever currency yields the best value for them in a transaction. In the case of a USD crash, transactions in the network would move to mostly crypto, leaving USD behind. In the case of a hyper-inflated coin, consumers will continue to transact primarily in USD.

## Vision

For coin creators choosing to fork this blockchain and start a new coin, the technical concepts outlined in this document should be extended in a white paper that describes the project's overall philosophy and long-term vision. The white paper is not a replacement for this technical overview, but can serve as a supplement to help your blockchain users understand the purpose of your cryptocurrency.
