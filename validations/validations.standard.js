/*
Validations.Standard
 */

module.exports = ({
  senderAddress,
  recipientAddress,
  tokenAddress,
  currency,
  embrAmount,
  usdAmount,
  denomination
}) => Boolean(
  (senderAddress !== recipientAddress) &&
  (senderAddress.length === 36 && recipientAddress.length === 36) &&
  (tokenAddress === senderAddress || tokenAddress === recipientAddress) &&
  (currency === 'usd' || currency === 'embr') &&
  (embrAmount && usdAmount) &&
  denomination >= 0.0000000001
);
