const PASS = 'PASSED!';
const FAIL = 'FAILED.';
const TEST_ADDRESS_0 = '00000000-0000-0000-0000-000000000000';
const TEST_ADDRESS_1 = '11111111-1111-1111-1111-111111111111';

(() => {

  /*
  Dependencies
  */

  const drv = require('.');

  const runTests = async () => {
    let data;

    try {
      data = await drv.onHttpPost(
        {
          method: 'POST',
          path: 'transaction',
          route: {
            path: '/transaction'
          },
          body: {
            senderAddress: TEST_ADDRESS_0,
            recipientAddress: TEST_ADDRESS_1,
            usdAmount: 1,
            drvAmount: 1,
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
        console.log(PASS);

        return true;
      }
    } catch (error) {
      console.log(FAIL, error);

      return false;
    }

    console.log(FAIL);

    return false;
  };

  runTests();
})();
