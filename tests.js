(() => {

  /*
  Dependencies
  */

  const blockchain = require('.');

  const runTests = async () => {
    let data;

    try {
      data = await blockchain.onHttpPost(
        {
          method: 'POST',
          path: 'transaction',
          route: {
            path: '/transaction'
          },
          body: {
            senderAddress: '00000000-0000-0000-0000-000000000000',
            recipientAddress: '11111111-1111-1111-1111-111111111111',
            currency: 'usd',
            usdAmount: 1,
            embrAmount: 1,
            isTest: true
          }
        },
        {
          send: () => ({ code: 200 }),
          status: code => ({
            send: () => ({ code }),
            end: () => ({ code })
          })
        }
      );

      if (data && data.code === 200) {
        console.log('PASSED!');

        return true;
      }
    } catch (error) {
      console.log('FAILED.', error);

      return false;
    }

    console.log('FAILED.');

    return false;
  };

  runTests();
})();
