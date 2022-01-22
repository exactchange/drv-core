# Electronic Monetary Block Rewards (EMBR)

## Abstract

With the advent of Bitcoin's blockchain, a purely peer-to-peer version of electronic cash was introduced to the world that allows online payments to be sent directly from one party to another without going through a financial institution. A solution to the double-spending problem was proposed through a hash-based concept called Proof of Work, forming a record that cannot be changed without redoing the work. The so-called "proof" refers to CPU-intensive work performed by an ever-increasing pool of CPU power, so that as long as a majority of CPU power is controlled by nodes that are not cooperating to attack the network, they'll always be able to outpace potential lone wolf attackers by generating a longer chain of transactions, thus invalidating the attacks.

There can be periods of vulnerability in a Proof of Work system, for example during technology upgrades, and transactions themselves can take several minutes, hours, or days to process. Further, because Proof of Work incentivizes miners to consume more power than everyone else, there is also a growing concern about the long-term environmental implications of competing to consume more power.

Another concept called Proof of Stake aims to solve this problem, as well as provide faster transaction times than Proof of Work by ignoring power output, and instead calculating the weight of a node as being proportional to its currency holdings - in other words, the wealthier a blockchain participant is the more voting power they have. It is asserted in Ethereum's white paper that *"both approaches can be used to serve as the backbone of a cryptocurrency"*, where both Work and Stake are seen as something to lose, nonetheless these means of consensus are artificial and arbitrary, and it could also be said that a participant with the most at stake simultaneously has the most to gain. Therefore neither Proof of Work or Proof of Stake are worthy replacements of trust - putting in the most work, or owning the most resources does not make a blockchain participant absolutely trustworthy.

EMBR proposes a different concept called Proof of Value where trust is replaced by truth, and conflated with value; and the supply of Embercoin is only ever increased when it is proven to have increased in value - with the miner reaping the reward being the merchant who created that value. The weight of an assertion of value, called the Proof of Value Assertion, is directly proportional to its redundancy in the network. Simply, a value assertion only begins to reflect actual value when most of the network participants agree that it does. Proof of Value sees value as perceived, and determined by the order of redundancy of such perceptions. Because EMBR transactions are not always limited by intensive computing or complex consensus algorithms, actual transaction times can be as instant as USD transactions.

Refer to the [Embercoin Blue Paper](./blue-paper.md) for technical specifics on "Proof of Value".

## EMBR Protocol

*Electronic Monetary Block Rewards (EMBR)* describes a system of validating, accepting, and rejecting blockchain transactions, as well as increasing supply of cryptocurrency in the network through a unique reward system.

## Privacy

Embercoin transactions may be announced publicly in the form of a publicly-viewable blockchain that can be read from a number of random peers. Only transactions with a high confidence level that are corroborated in multiple instances of Embercoin should be included, although transactions that were recently added may be shown in an unverified state until their validation process is complete. The public can see the amount and kind of currency transferred in every transaction, but the identities of the parties involved are obfuscated behind their respective address hashes in order to maintain a level of individual privacy.

## Native Ember Token (NET)

[Native Ember Token](https://github.com/exactchange/native-ember-token) is a deployable digital currency that operates on Embercoin via the EMBR protocol. Any user with a minimum account balance of 0.0000000001 EMBR may define and alias (name) their new token to sell or freely distribute to their users in any amount and denomination they choose, limited to their account balance. Token denomination itself is untracked and unregulated in order to extend price flexibility to the token merchant. A blockchain transaction occurs only when tokens are transferred between users.

Native Ember Tokens are bound to, and can only be spent in whichever economy they were disbursed. In addition to spending NETs, assuming a minimum account value of 0.0000000001 EMBR, they can be liquidated, or converted back into EMBR in order to be traded or disbursed in a new, private economy to which their native status will be migrated. Therefore, decentralized exchange is a built-in feature the token system, and runs a special validation case in the blockchain where tokens are shuffled through an arbitrary third party in order to yield the desired exchange.

## Decentralization

Anyone can create their own token by forking the [Native Ember Token](https://github.com/exactchange/native-ember-token) repository and serving it to the web with their new token name and configuration. The codebase installs a local copy of Embercoin, so that every instance of Native Ember Token runs its own instance of the Embercoin blockchain.

Whenever a merchant sells a token, the transaction is broadcasted to other token merchants in the peer network, who run their own Embercoin transaction validation logic to determine if the transaction should be entered into their blockchain instance. Because everyone installs the same Embercoin blockchain, the validation logic should be identical if a token merchant does not tamper with the code. If they do tamper with it, they may yield different validation results than other nodes.

Any user can thus determine the validity of a transaction by checking at any time how many instances of Embercoin validated it against how many instances are running: For example if 100 instances of Embercoin are live in a network, and 99 of those instances do not validate an incoming transaction based on what was submitted by the merchant, but 1 instance does validate it, the transaction enters only that 1 blockchain instance and is rejected by the other 99. When any user wants to verify that a transaction is valid in that network, they only need to check with a number of peers of those nodes at random to build confidence in the validity. As more peers corroborate the transaction, confidence is built, and upon a certain threshold determined by the user a transaction can be deemed valid.

When performing a basic balance inquiry or when transferring EMBR to another user, like any other request to Embercoin the values are determined functionally - that is, they are calculated at the time it's needed to be across a number of peer instances until the provided confidence threshold is met.

## Contracts

Contracts are agreements between participants in a transaction that are specified in the request by their string name (e.g. `{ contract: "standard" }`). Currently there are 2 kinds of contracts:

**[Standard](https://github.com/exactchange/native-ember-token/blob/master/src/contracts/contracts.standard.js)**: The standard transaction agreement for selling and/or transferring tokens between users where EMBR is transferred for an optional USD payment, and rewards are mined, if applicable.

**[Exchange](https://github.com/exactchange/native-ember-token/blob/master/src/contracts/contracts.exchange.js)**: The transaction agreement for liquidating a foreign token in order to supply a native token.

Contracts can encompass just one, or many transactions, and even establish long-term payment schedules involving various layers of validation and user interaction.

## Validations

Validations are lifecycle hooks that run before a transaction is completed, and their `Boolean` return value determines whether or not the transaction will continue. Currently there are 2 kinds of validations:

**[Standard](https://github.com/exactchange/embercoin/blob/master/validations/validations.standard.js)**: The standard validation for transferring EMBR between users.

**[Exchange](https://github.com/exactchange/embercoin/blob/master/validations/validations.exchange.js)**: The exchange validation for liquidating a foreign token in order to supply a native token.

In order to make low-risk transactions fully-automatic, ML/AI and other forms of model- or pattern-based learning might be implemented as additional validations, directed by special contracts. Validations might also include manual user approvals through authentication services.

## Enforcements

Enforcements are lifecycle hooks that run after a transaction has completed. The [Standard](https://github.com/exactchange/embercoin/blob/master/enforcements/enforcements.standard.js) enforcement included in this distribution ensures that a transaction is broadcasted to a list of peers for consensus.

## Redundancy & Echo Fees

Any node that processes peer transactions can be paid a percentage of the transaction amount called an echo fee, set by the initiator of the transaction. This small tax is a payment sent in the token being transferred, to a random node in exchange for their witness of the transaction, by validating and entering it into their own ledger. The fee is only paid if the transaction is successful (whether or not it's valid). The standard enforcement requires at least 4 peers to establish redundancy in order to move a transaction into the completed state, and to ensure randomness, no 2 nodes can request each other twice in a row. Transactions are propagated throughout the larger network in a cascading fashion: 4 peers are each paid to echo a transaction, but to receive that echo fee each peer needs to get another 4 peers to echo the echo fee, and so-on. Eventually all transactions are maximally redundant in the larger network. When the fee becomes diluted to effectively a zero amount, then there is no longer monetary incentive for peers to echo it, but some nodes offering free processing may still choose to.

## Trading

Special kinds of tokens may emerge for trading purposes where the token is not accepted at any store or for any product or service, and it only exists to be purchased by other traders. Traders are effectively buying and selling the underlying Embercoin amount, regardless of the token held, and any token can be liquidated or exchanged at any time. The purpose of buying a token outside of trading it is specific to its market utility in its economy.

## Anonymous Tokens

An anonymous token is any EMBR amount accounted for by a blockchain participant where the participant does not host their own instance of Embercoin, and is not broadcasting anything from an `/info` NET endpoint about their token name, logo, or denomination.
