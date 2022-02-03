/*
Validations.Exchange
 */

const {
  DRV_TEXT,
  TREASURY_ADDRESS
} = require('../currency');

module.exports = ({
  senderAddress,
  recipientAddress,
  currency,
  drvAmount
}) => Boolean(
  (senderAddress.length === 36) &&
  (
    (senderAddress === recipientAddress) ||
    (recipientAddress === TREASURY_ADDRESS)
  ) &&
  (currency === DRV_TEXT && drvAmount)
);
