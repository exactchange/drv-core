# Decentralized Record of Value (DRV)

## Abstract

With the advent of Bitcoin's blockchain, a purely peer-to-peer version of electronic cash was introduced to the world that allows online payments to be sent directly from one party to another without going through a financial institution. A solution to the double-spending problem was proposed through a hash-based concept called Proof of Work, forming a record that cannot be changed without redoing the work. The so-called "proof" refers to CPU-intensive work performed by an ever-increasing pool of CPU power, so that as long as a majority of CPU power is controlled by nodes that are not cooperating to attack the network, they'll always be able to outpace potential lone wolf attackers by generating a longer chain of transactions, thus invalidating the attacks.

There can be periods of vulnerability in a Proof of Work system, for example during technology upgrades, and transactions themselves can take several minutes, hours, or days to process. Further, because Proof of Work incentivizes miners to consume more power than everyone else, there is also a growing concern about the long-term environmental implications of competing to consume more power.

Another concept called Proof of Stake aims to solve this problem, as well as provide faster transaction times than Proof of Work by ignoring power output, and instead calculating the weight of a node as being proportional to its currency holdings - in other words, the wealthier a blockchain participant is the more voting power they have. It is asserted in Ethereum's white paper that *"both approaches can be used to serve as the backbone of a cryptocurrency"*, where both Work and Stake are seen as something to lose, nonetheless these means of consensus are artificial and arbitrary, and it could also be said that a participant with the most at stake simultaneously has the most to gain. Therefore neither Proof of Work or Proof of Stake are worthy replacements of trust - putting in the most work, or owning the most resources does not make a blockchain participant absolutely trustworthy.

Dereva proposes a different concept called Proof of Value where trust is replaced by truth, and conflated with value. The weight of an assertion of value, called the Proof of Value Assertion, is directly proportional to its redundancy in the network. Effectively, a value assertion only begins to reflect actual value when most of the network participants agree that it does. Proof of Value sees monetary value as perceived, and validated by the order of redundancy of such perceptions. Because DRV record entries are not limited by intensive computing or complex consensus algorithms, actual transaction times can be as instant as USD transactions.

Refer to the [DRV Blue Paper](./blue-paper.md) for technical specifics on "Proof of Value".

## DRV Protocol

## Privacy

DRV records may be announced publicly in the form of a publicly-viewable blockchain that can be read from a number of random peers. Only records with a high confidence level that are corroborated in multiple instances of Dereva should be included, although transactions that were recently added may be shown in an unverified state until their validation process is complete. The public can see the amount and kind of currency transferred in every transaction, but the identities of the parties involved are obfuscated behind their respective address hashes in order to maintain a level of individual privacy.

## Dereva

[Dereva](https://github.com/exactchange/dereva) is a deployable digital currency that operates on `drv-core` which implements the DRV protocol. Any user with a minimum account balance of 0.0000000001 Dereva may define and alias (name) their own token to sell or freely distribute to their customers in any amount and denomination they choose, limited to their account balance. Dereva are bound to, and can only be spent in whichever economy they were disbursed.

## Decentralization

Anyone can create their own token by forking the [Dereva](https://github.com/exactchange/dereva) repository and serving it to the web with their new token name and configuration. The codebase installs a local copy of `drv-core`, so that every instance of Dereva runs its own instance of the DRV blockchain.

Whenever a merchant sells a token, the transaction is broadcasted to other token merchants in the peer network, who run their own validation logic to determine if the transaction should be entered into their blockchain instance. Because everyone installs the same blockchain, the validation logic should be identical if a token merchant does not tamper with the code. If they do tamper with it, they may yield different validation results than other nodes.

Any user can thus determine the validity of a transaction by checking at any time how many instances validated it against how many instances are running: For example if 100 instances are live in a network, and 99 do not validate an incoming transaction based on what was submitted by the merchant, but 1 instance does validate it, the transaction enters only that 1 blockchain instance and is rejected by the other 99. When any user wants to verify that a transaction is valid in that network, they only need to check with a number of peers of those nodes at random to build confidence in the validity. As more peers corroborate the transaction, confidence is built, and upon a certain threshold determined by the user a transaction can be deemed valid.

When performing a basic balance inquiry or when transferring DRV to another user, like any other request the values are determined functionally - that is, they are calculated at the time it's needed to be across a number of peer instances until the provided confidence threshold is met.

## Contracts

Contracts are agreements between participants in a transaction that are specified in the request by their string name (e.g. `{ contract: "nonFungibleRecord" }`). Currently there are 2 kinds of contracts:

**Record**

**Non-Fungible Record**

Contracts can encompass just one, or many transactions, and even establish long-term payment schedules involving various layers of validation and user interaction.

## Validations

Validations are lifecycle hooks that run before a transaction is completed, and their `Boolean` return value determines whether or not the transaction will continue. Currently there are 2 kinds of validations:

## Enforcements

Enforcements are lifecycle hooks that run after a transaction has completed. The [Broadcast](https://github.com/exactchange/drv-core/blob/master/enforcements/enforcements.broadcast.js) enforcement included in this distribution ensures that a transaction is broadcasted to a list of peers for consensus.

## Redundancy

## Trading

Special kinds of tokens may emerge for trading purposes where the token is not accepted at any store or for any product or service, and it only exists to be purchased by other traders.

## Anonymous Tokens

An anonymous token is any DRV amount accounted for by a blockchain participant where the participant does not host their own instance of `drv-core`, and is not broadcasting anything from an `/info` NET endpoint about their token name, logo, or denomination.
