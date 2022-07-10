/* eslint-disable no-magic-numbers */

/*
Validations.Record
 */

module.exports = ({
  senderAddress,
  recipientAddress,
  drvValue,
  usdValue
}) => Boolean(
  (senderAddress !== recipientAddress) &&
  (senderAddress.length === 36 && recipientAddress.length === 36) &&
  (drvValue && usdValue)
);
