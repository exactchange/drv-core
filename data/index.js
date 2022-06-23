/* eslint-disable no-magic-numbers */

const fs = require('fs').promises;

const generateUUID = () => {
  const g4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0)
      .toString(16)
      .substring(1);
  };

  return (
    `${g4()}${g4()}-${g4()}-${g4()}-${g4()}-${g4()}${g4()}${g4()}`
  );
};

let getCollection, updateCollection;

getCollection = async (collectionName, query) => {
  const data = await fs.readFile(`${__dirname}/${collectionName}.json`, 'utf8');

  let result = Object.values(JSON.parse(data));

  if (query) {
    result.forEach(record => {
      Object.keys(record).forEach(key => {
        // eslint-disable-next-line no-magic-numbers
        if (key === Object.keys(query)[0] && record[key] === query[key]) {
          result = record[key];
        }
      });
    });
  }

  return {
    data: result,
    write: updateCollection
  };
};

updateCollection = async (collectionName, query, collectionItem) => {
  const data = await fs.readFile(`${__dirname}/${collectionName}.json`, 'utf8');

  const collection = JSON.parse(data);

  let result

  if (query) {
    Object.values(collection).forEach(record => {
      Object.keys(record).forEach(key => {
        // eslint-disable-next-line no-magic-numbers
        if (key === Object.keys(query)[0] && record[key] === query[key]) {
          result = {
            [record._id]: {
              ...record,

              ...collectionItem
            }
          };
        }
      });
    });
  } else {
    result = {
      id: generateUUID(),
      collectionItem
    };
  }

  await fs.writeFile(
    `${__dirname}/${collectionName}.json`,
    JSON.stringify({
      ...collection,
      ...result
    }),
    'utf8'
  );

  return {
    data: result,
    read: getCollection
  };
};

module.exports = {
  getCollection,
  updateCollection,
  read: getCollection,
  write: updateCollection
};
