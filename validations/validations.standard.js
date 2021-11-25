/*
Validations.Standard
 */

const { EMBR_TEXT, USD_TEXT } = require('../currency');

module.exports = ({
  senderAddress,
  recipientAddress,
  tokenAddress,
  currency,
  embrAmount,
  usdAmount
}) => Boolean(
  (senderAddress !== recipientAddress) &&
  (senderAddress.length === 36 && recipientAddress.length === 36) &&
  (tokenAddress === senderAddress || tokenAddress === recipientAddress) &&
  (currency === USD_TEXT || currency === EMBR_TEXT) &&
  (embrAmount && usdAmount)
);
