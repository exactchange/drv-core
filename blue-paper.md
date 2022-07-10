# Decentralized Record of Value (DRV) Protocol Technical Overview

## Features

### Non-Fungible Records

**Content Types**

```
  class MagneticResourceText {
    constructor (value: string) {
      const text = value.replace(/\\|\-/g, '');

      if (!text?.match(/magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32}/i)) {
        console.warn('Type error: Invalid Magnet URI.');
      } else {
        this.text = value;
      }
    }

    text: string = '';

    toString() {
      return this.text;
    }
  }

  type MagnetURI = MagneticResourceText;

  type Text = {
    parent?: Text;
    value: string;
  }

  type Claim = Text & {
    timestamp: number;
    author: Text;
  }

  type Certificate = Claim & {
    entitled: Text[];
  }

  type Comment = Claim & {
    upvotes: number;
  }

  type Review = Comment & {
    rating: number;
    reply?: Claim;
  }

  type Article = Certificate & {
    title: Text;
  }

  type Media = Certificate & {
    type: "Image" | "Video" | "Audio";
  }

  type Sequence = Certificate & {
    frames: Media[];
    thumbnail: Media;
  }

  type Stream = Media & {
    connection: Text;
  }
```

### Fungible Records

**Proof of Value Assertions**

A *Proof of Value* is asserted whenever DRV is asserted to have some USD value. The simplest example of this is when someone trades USD for DRV. For example, if you spend 10.00 USD for 1 DRV, a value of 10.00 USD is asserted in the blockchain.

Another way to assert value is to sell a product normally purchased in USD in DRV. Let's say you've sold a number of products online for 10.00 USD each, and now you want to accept crypto payments. For every sale where you accept DRV as payment, value will be asserted for the sale amount.

Proof of Value occurs in the [`onTransaction`](./events/events.transaction.js) lifecycle method, which is invoked after the transaction has been inserted into the blockchain.

**Assertion Misvaluations, Rejections, & Corrected Proofs of Value**

A Proof of Value Assertion will be rejected if the assertion exceeds the Deviation Rate (see *Deviation Rate* below). When a Proof of Value is asserted against USD, the USD amount goes through two layers of validation:

1. `usdAmount` must be higher than `0.0000000001`, and is adjusted by the `drvAmount` it is asserted against:

    ```
    // ./events/events.transaction.js

    const usdValue = parseFloat(
      Math.max(
        0.0000000001,
        usdAmount / drvAmount
      )
    );
    ```

2. The difference between the DRV `price` and the adjusted `usdValue` must not exceed a Standard Deviation of the average price.

    ```
    // ./events/events.transaction.js

    const priceDifference = parseFloat(
      Math.abs(priceApi.price - usdValue)
    );

    if (priceDifference <= (priceApi.price * .15)) {
      // Assertion Rejection

      ...
    ```

Misvaluations and Rejections are *automatically corrected* in the blockchain and the valuation is re-submitted within the Deviation Rate.

**Long-term stability**

The weight of each Proof of Value Assertion depends on the number of total transactions: For example a blockchain with millions of records will have a much stabler valuation (trading price) than a blockchain with only a few.

**Deviation Rate**

A Deviation Rate of 15% is applied to all Proof of Value Assertions, and is equivalent to the Standard Deviation of the average trading price. Any Proof of Value Assertion that exceeds the Deviation Rate is automatically rejected.

```
const deviationRate = priceApi.price * .15;
```

**Crypto trading**

As a merchant or trader, you can assert any value you want, but if your assertion exceeds the Deviation Rate, the proof is rejected, corrected, and re-submitted at the Maximum Allowable Deviation. For example, if you sell 1 DRV valued at 10.00 USD for only 0.01 USD, the transaction will succeed, but will result in a misvaluation, and the blockchain will re-attempt valuing it at the minimum value allowed (in this case 8.50 USD). If it's valued too high, for example 1 DRV valued at 10.00 USD is sold for 100.00 USD, it will attempt to value it at the highest possible amount (in this case 11.50), as shown:

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

* * *
DRV is based on: [bennyschmidt/linked-list](https://github.com/bennyschmidt/linked-list)
* * *
