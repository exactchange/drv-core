# Embercoin Technical Overview

## Coin or Token?

In forking Embercoin, you are starting a new *coin* as defined by the following characteristics:

1. It operates on its own [blockchain technology](https://github.com/exactchange/blockchain) that keeps track of all transactions in a cryptocurrency.

    If you pay for something with Bitcoin, each transaction is encrypted, anonymized, and publicly viewable. Similarly, this blockchain implements a public API endpoint of publicly viewable, encrypted, anonymized transactions. Unlike Bitcoin, this blockchain also keeps track of all USD transactions associated with trading.

2. It can be used as money.

    The long-term vision of Bitcoin is to be used as a currency in the economy. Because trading with USD is built into Embercoin - even allowing trades to happen automatically, behind-the-scenes in occurrence with product sales - it is designed specifically for this purpose.

3. It can be mined. So far there have been two primary mining methods used to increase the supply of coins in a network, they are:

    • [Proof of Work](https://en.wikipedia.org/wiki/Proof_of_work)

    • [Proof of Stake](https://en.wikipedia.org/wiki/Proof_of_stake)

    Embercoin proposes a third method called *Proof of Value*, in which new coins are mined only when its value has been proven to have increased as a result of a trade or transaction. The newly mined coin is given to the seller as a reward for transacting in a way that increased its value.

    The Reward Ceiling is adjusted by the overall dilutive effect of mining in order to minimize price volatility, with the goal being a coin whose value reflects its economic utility, leaving some room for trading (see *Deviation Rate* below), and a currency that prints itself only when necessary, becoming increasingly stable with each transaction.

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

## Use Cases

### Buying & selling crypto

**Purchasing EMBR with USD**

Purchasing EMBR with USD is always an assertion of value, and a Proof of Value will always be submitted in these transactions. Therefore, the simplest way to increase EMBR value is to trade more USD for it than it's currently worth. With a Deviation Rate of 15%, trades are protected from price gouging, excessive valuations based on hype ("pump and dump" schemes), and because price is effectively stabilized by a proportional spending of USD, the potential for a scam or sudden market crash is greatly diminished (See "Long-term sustainability beyond USD" below).

**Listing EMBR for sale in USD**

Although this blockchain is intended to be more stable than, say, Bitcoin whose valuations are based primarily on supply and demand, and is therefore subject to hype and scams, there is still a very high trading potential with EMBR, and trading is encouraged - particularly for traders who want to avoid highly-volatile coins anyway.

**Holding EMBR long-term (value investing)**

Beyond day-trading, value investing is also encouraged for those who see the longer-term value in a coin propped up by USD transactions. This design should not be confused with a "stablecoin", where the value is *dependent* upon the external reference (in this case USD), because in the case of a USD crash, EMBR's value would not be wholly affected (as in the case of a stablecoin), as products and services are still able to be purchased, and Proofs of Value, while based around USD, are asserted independently of the economic utility of USD (see "Long-term sustainability beyond USD" below).

### Spending EMBR as money

From day one, the goal of EMBR is to function as an alternative currency to USD. It may be tokenized in order to supply niche economies with EMBR in varying denominations, but the EMBR value of a token is locked upon distribution: For example, if 1 EMBR is purchased for 10.00 USD and then divided into 10 tokens, each token is locked at a value of 0.1 EMBR or 1.00 USD which is the value it asserts when it is eventually spent.

**Buying products & services with EMBR**

Buying things with EMBR is very similar to buying things with USD: Upon transacting, your account balance is adjusted accordingly, and the payment is transferred to the seller.

**Investing in companies with EMBR**

Investing with EMBR is closer to investing in a mortgage than investing in a startup, in that the investment itself can be refinanced against its current USD value. Let's say you invest 100.00 EMBR valued at 1000.00 USD in a company. If at a later date the EMBR is valued at 2000.00 USD, the investment can be refinanced, and as an investor you can make capital calls on that equity.

## Implications & Vision

**Accepting EMBR as payment for products & services**

A merchant that backs up their transactions with this cryptocurrency plays an important role in the blockchain as a distributed appraiser and investor. Long-term value and stability cannot be ensured by trading alone, and there is a need for merchants who will accept USD alongside this cryptocurrency in order to ensure its value.

In contributing value to the blockchain, merchants are rewarded earning additional revenues in the form of cryptocurrency. In a scenario where the merchant sells tokenized EMBR to their customers for USD, and also accepts it as payment for their products and services, the merchant has a potential to earn additional money from their sales that could not be earned by transacting in USD alone.

**Long-term sustainability beyond USD**

EMBR can be seen as "hyper stable" because in the case of a USD crash, EMBR's value would not be wholly affected, as Proofs of Value continue to be asserted, and are calculated independently of the economic utility of USD.

In other words, consumers in the economy will typically choose to transact with whichever currency yields the best value for them in a transaction. In the case of a USD crash, transactions in the network would move to mostly crypto, leaving USD behind. In the case of a hyper-inflated EMBR, consumers will continue to transact primarily in USD.

**Vision**

For coin creators choosing to fork this blockchain and start a new coin, the technical concepts outlined in this document should be extended in a white paper that describes the project's overall philosophy and long-term vision. The white paper is not a replacement for this technical overview, but can serve as a supplement to help your blockchain users understand the purpose of your cryptocurrency.

## Key Files

• Price API: [api/api.price.js](https://github.com/exactchange/embercoin/blob/master/api/api.price.js)

• Transaction API: [api/api.transaction.js](https://github.com/exactchange/embercoin/blob/master/api/api.transaction.js)

• Transaction Lifecycle Events: [events/events.transaction.js](https://github.com/exactchange/embercoin/blob/master/events/events.transaction.js)

* * *
• Embercoin is forked from: [exactchange/blockchain](https://github.com/exactchange/blockchain)
* * *
