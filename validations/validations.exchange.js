/*
Validations.Exchange
 */

const {
  EMBR_TEXT,
  TREASURY_ADDRESS
} = require('../currency');

module.exports = ({
  senderAddress,
  recipientAddress,
  currency,
  embrAmount
}) => Boolean(
  (senderAddress.length === 36) &&
  (
    (senderAddress === recipientAddress) ||
    (recipientAddress === TREASURY_ADDRESS)
  ) &&
  (currency === EMBR_TEXT && embrAmount)
);
