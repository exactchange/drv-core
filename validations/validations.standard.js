/*
Validations.Standard
 */

const { DRV_TEXT, USD_TEXT } = require('../currency');

module.exports = ({
  senderAddress,
  recipientAddress,
  tokenAddress,
  currency,
  drvAmount,
  usdAmount
}) => Boolean(
  (senderAddress !== recipientAddress) &&
  (senderAddress.length === 36 && recipientAddress.length === 36) &&
  (tokenAddress === senderAddress || tokenAddress === recipientAddress) &&
  (currency === USD_TEXT || currency === DRV_TEXT) &&
  (drvAmount && usdAmount)
);
