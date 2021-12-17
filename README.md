# Electronic Monetary Block Rewards (EMBR)

## Abstract

With the advent of Bitcoin's blockchain, a purely peer-to-peer version of electronic cash was introduced to the world that allows online payments to be sent directly from one party to another without going through a financial institution. A solution to the double-spending problem was proposed through a hash-based concept called Proof of Work, forming a record that cannot be changed without redoing the work. The so-called "proof" refers to CPU-intensive work performed by an ever-increasing pool of CPU power, so that as long as a majority of CPU power is controlled by nodes that are not cooperating to attack the network, they'll always be able to outpace potential lone wolf attackers by generating a longer chain of transactions, thus invalidating the attacks.

Because the weight of a single node in the consensus voting process is directly proportional to the computing power that the node brings, Proof of Work as a security mechanism falls apart when computing innovation enables smaller groups, or lone wolves, to outpace - with or without conspiring - the computing output of the rest of the network, as in the case of GPU mining (which has become a standard out of necessity). This vulnerability can be exploited every time computing capabilities increase, so the network must continually increase its own computing output in order to stay ahead. It's important to note that there will always be periods of vulnerability that can last days or weeks in a Proof of Work system, while transactions themselves can take several minutes, hours, or days to process. Further, because Proof of Work incentivizes miners to consume more power than everyone else, there is also a growing concern about the long-term environmental implications of competing to consume more power.

Another concept called Proof of Stake aims to solve this problem, as well as provide faster transaction times than Proof of Work by ignoring power output, and instead calculating the weight of a node as being proportional to its currency holdings - in other words, the wealthier you are the more voting power you have. It is asserted in Ethereum's white paper that *"both approaches can be used to serve as the backbone of a cryptocurrency"* but the notion that arbitrary, artificial consensus especially in the latter concept that bases it on individual wealth should be, and has been, met with wide skepticism relating to its security.

EMBR proposes a different concept called Proof of Value where the supply of EMBR is only ever increased when it is proven to have increased in value, and the miner who reaps that reward is the merchant who created that value. The weight of an assertion of value, called the Proof of Value Assertion, is directly proportional to its redundancy, or natural consensus, in the network. Because EMBR transactions are not limited by intensive computing or complex consensus algorithms, actual transaction times can be as instant as USD transactions.

Refer to the [Embercoin Blue Paper](./blue-paper.md) for technical specifics on "Proof of Value".

## EMBR Protocol

*Electronic Monetary Block Rewards (EMBR)* describes a system of validating, accepting, and rejecting blockchain transactions, as well as increasing supply of cryptocurrency in the network through a unique reward system.

## Privacy

Embercoin transactions may be announced publicly in the form of a publicly-viewable blockchain that can be read from a number of random peers. Only transactions with a high confidence level that are corroborated in multiple instances of Embercoin should be included, although transactions that were recently added may be shown in an unverified state until their validation process is complete. The public can see the amount and kind of currency transferred in every transaction, but the identities of the parties involved is obfuscated behind their respective address hashes in order to maintain a level of individual privacy.

## Native Ember Token (NET)

[Native Ember Token](https://github.com/exactchange/native-ember-token) is a deployable digital currency that operates on Embercoin via the EMBR protocol. Any user with a minimum account balance of 0.0000000001 EMBR may define and alias (name) their new token to sell or freely distribute to their users in any amount and denomination they choose, limited to their account balance. Token denomination itself is untracked and unregulated in order to extend price flexibility to the token merchant. A blockchain transaction occurs only when tokens are transferred between users.

Native Ember Tokens are bound to, and can only be spent in whichever economy they were disbursed. In addition to spending NETs, assuming a minimum account value of 0.0000000001 EMBR, they can be liquidated, or converted back into EMBR in order to be traded or disbursed in a new, private economy to which their native status will be migrated. Therefore, decentralized exchange (or DEX) is a built-in feature the token system, and runs a special validation case in the blockchain where tokens are shuffled through an arbitrary third party in order to yield the desired exchange.

## Decentralization

Anyone can create their own token by forking the [Native Ember Token](https://github.com/exactchange/native-ember-token) repository and serving it to the web with their new token name and configuration. The codebase installs a local copy of Embercoin, so that every instance of Native Ember Token runs its own instance of the Embercoin blockchain.

Whenever a merchant sells a token, the transaction is broadcasted to other token merchants in the peer network, who run their own Embercoin transaction validation logic to determine if the transaction should be entered into their blockchain instance. Because everyone installs the same Embercoin blockchain, the validation logic should be identical if a token merchant does not tamper with the code. If they do tamper with it, they may yield different validation results than other nodes.

Any user can thus determine the validity of a transaction by checking at any time how many instances of Embercoin validated it against how many instances are running: For example if 100 instances of Embercoin are live in a network, and 99 of those instances do not validate an incoming transaction based on what was submitted by the merchant, but 1 instance does validate it, the transaction enters only that 1 blockchain instance and is rejected by the other 99. When any user wants to verify that a transaction is valid in that network, they only need to check with a number of peers of those nodes at random to build confidence in the validity. As more peers corroborate the transaction, confidence is built, and upon a certain threshold determined by the user a transaction can be deemed valid.

When performing a basic balance inquiry or when transferring EMBR to another user, like any other request to Embercoin the values are determined functionally - that is, they are calculated at the time it's needed to be across a number of peer instances until the provided confidence threshold is met.

Buyers and sellers may reserve a right to only agree to transactions of a certain level of confidence or within certain networks, and are encouraged to deal in only high-confidence or specified transactions. In scenarios where a lot of capital is at stake, extended closing periods may become the norm where a target confidence level must be retained for a period of time, or throughout a certain number of networks, before the token sale is finalized, at the discretion of the parties involved.

## Contracts

Contracts are agreements between participants in a transaction that are specified in the request by their string name (e.g. `{ contract: "standard" }`). Currently there are 2 kinds of contracts:

**Standard**: The standard transaction agreement for selling and/or transferring tokens between users where EMBR is transferred for an optional USD payment, and rewards are mined, if applicable.

**Exchange**: The transaction agreement for liquidating a foreign token in order to supply a native token.

## Validations

Validations are lifecycle hooks that run before a transaction is completed, and their `Boolean` return value determines whether or not the transaction will continue. Currently there are 2 kinds of validations:

**Standard**: The standard validation for transferring EMBR between users.

**Exchange**: The exchange validation for liquidating a foreign token in order to supply a native token.

## Enforcements

Enforcements are lifecycle hooks that run after a transaction has completed. The standard enforcement included in this distribution ensures that a transaction is broadcasted to a list of peers passed in by the processor.

## Consensus Tax

Any node that processes peer EMBR transactions may be paid a small percentage of the transaction amount called a consensus tax. The payment is received in the token being transferred. Transactions requiring a high level of confidence might have a higher consensus tax, as more peers are required to validate it. However, the consensus tax amount is set by either the buyer or the seller, it can be 0, and peers reserve the right to process transaction requests or not based on the tax offering. If a buyer or seller wanted to achieve very high confidence in a transaction quickly, they could offer to pay a higher tax to incentivize peers to process it; on the other hand, peers interested in processing as many transactions as possible might set a low tax rate in order to "win" transactions (to earn passive revenues); others may offer to process transactions entirely for free. The standard enforcement, called "block consensus" requires 4 peers to establish consensus and move a transaction into the completed state, with the first and last peer being the same node, the initiator and verifier of the block.

## Block Consensus

In block consensus, the initiating node broadcasts a transaction to 3 other peers, offering the optional consensus tax as incentive to each node to echo the transaction:

- Peer A initiates a transaction: _Anonymous Token 123 sent Peer A 1.00 EMBR_
- Peer A offers Peer B _0.01 EMBR_ to echo the transaction
- Peer B echoes both transactions (the initial transfer of _1.00 EMBR_ and the tax payment of _0.01 EMBR_)
- Peer B offers Peer C _0.005 EMBR_ to echo these transactions
- Peer C echoes the transactions
- Peer C offers Peer D _0.002 EMBR_ to echo these transactions
- Peer D echoes the transactions
- Peer D offers Peer A _0.001 EMBR_ to verify the block
- Peer A echoes the transactions
- Peer A completes the transaction with the required confidence level

```
A → B
↑   ↓
D ← C
```

By the end of the block, Peer A spent _0.009 EMBR_ in consensus tax to Peers B, C, and D who received _0.005_, _0.003_, and _0.001 EMBR_ in tax payments respectively, in order to establish consensus that an anonymous token sent them _1.00 EMBR_. The initiator of a block (Peer A) is always the last peer who verifies it. So if Peers B, C, or D had tampered with the transaction payload at any point during consensus, Peer A would reject the block during its final validation, and could try again with different peers while that faulty block remains in a pending state, having insufficient consensus.

Block consensus is one of many possible ways to establish redundancy - its main value is that it's quick, anonymous, and automatic, so it works well for everyday transactions. Vendors can achieve higher levels of confidence however by scaling up the number of required peers ("super block transactions"), or by relying on manual approvals at each step, or by inventing special means of consensus and enacting them through token contracts.

## Trading

Special kinds of tokens may emerge for trading purposes where the token is not accepted at any store or for any product or service, and it only exists to be purchased by other traders. Traders are effectively buying and selling the underlying Embercoin amount, regardless of the token held, and any token can be liquidated or exchanged at any time. The purpose of buying a token outside of trading it is specific to its market utility in its economy.

## Anonymous Tokens

An anonymous token is any EMBR amount accounted for by a blockchain participant where the participant does not host their own instance of Embercoin, and is not broadcasting anything from an `/info` NET endpoint about their token name, logo, or denomination.
