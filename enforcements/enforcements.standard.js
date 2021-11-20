/*
Enforcements.Standard
 */

const { COMPLETE, PENDING } = require('../statuses');

module.exports = async transaction => {
  let didConnectAndSend = false;

  /*
   * TODO Broadcast the transaction to a peer connection
   */

  if (!didConnectAndSend) {
    console.log('<Embercoin> :: There are no peers online to echo the transaction. It will remain in a pending state until the next enforcement attempt.');
  }

  return didConnectAndSend ? COMPLETE : PENDING;
};
