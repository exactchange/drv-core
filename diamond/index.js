/* eslint-disable no-magic-numbers */

(() => {
  const { http } = require('node-service-client');

  const dss = require('diamond-search-and-store/src/services/diamond');

  /*
  Service (HTTP)
  */

  const backup = async ({ collectionName }) => {
    console.log('<DRV> :: POST /diamond/backup');

    const result = await dss.onHttpPost(
      {
        method: 'backup',
        body: {
          collectionName
        },
        route: {
          path: 'dss'
        },
        path: 'backup'
      },
      {
        status: code => ({
          end: () => ({
            error: {
              code,
              message: '<DRV> Service error (POST).'
            }
          })
        }),
        send: body => ({
          status: 200,
          success: true,
          data: body
        })
      }
    );

    return result;
  };

  module.exports = http({
    GET: {},
    POST: {
      read: async ({ collectionName, query }) => {
        console.log('<DRV> :: POST /diamond/read');

        const result = await dss.onHttpPost(
          {
            method: 'read',
            body: {
              collectionName,
              query
            },
            route: {
              path: 'dss'
            },
            path: 'read'
          },
          {
            status: code => ({
              end: () => ({
                error: {
                  code,
                  message: '<DRV> Service error (POST).'
                }
              })
            }),
            send: body => ({
              status: 200,
              success: true,
              data: body
            })
          }
        );

        return result;
      },
      write: async ({ collectionName, query, payload }) => {
        console.log('<DRV> :: POST /diamond/write');

        const result = await dss.onHttpPost(
          {
            method: 'write',
            body: {
              collectionName,
              query,
              payload
            },
            route: {
              path: 'dss'
            },
            path: 'write'
          },
          {
            status: code => ({
              end: () => ({
                error: {
                  code,
                  message: '<DRV> Service error (POST).'
                }
              })
            }),
            send: body => ({
              status: 200,
              success: true,
              data: body
            })
          }
        );

        return result;
      },
      backup,
      search: async ({ mediaAddress }) => {
        console.log('<DRV> :: POST /diamond/search');

        const result = await dss.onHttpPost(
          {
            method: 'search',
            body: {
              mediaAddress
            },
            route: {
              path: 'dss'
            },
            path: 'search'
          },
          {
            status: code => ({
              end: () => ({
                error: {
                  code,
                  message: '<DRV> Service error (POST).'
                }
              })
            }),
            send: body => ({
              status: 200,
              success: true,
              data: body
            })
          }
        );

        return result;
      },
      store: async ({ media }) => {
        console.log('<DRV> :: POST /diamond/store');

        const result = await dss.onHttpPost(
          {
            method: 'store',
            body: {
              media
            },
            route: {
              path: 'dss'
            },
            path: 'store'
          },
          {
            status: code => ({
              end: () => ({
                error: {
                  code,
                  message: '<DRV> Service error (POST).'
                }
              })
            }),
            send: body => ({
              status: 200,
              success: true,
              data: body
            })
          }
        );

        return result;
      }
    },
    PUT: {},
    DELETE: {}
  });
})();
