/*
Validations.Exchange
 */

module.exports = ({
  senderAddress,
  recipientAddress,
  currency,
  embrAmount,
  denomination
}) => Boolean(
  (senderAddress.length === 36) &&
  (
    (senderAddress === recipientAddress) ||
    (recipientAddress.match('treasury'))
  ) &&
  (currency === 'embr' && embrAmount && denomination >= 0.0000000001)
);
