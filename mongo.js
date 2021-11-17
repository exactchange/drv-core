const { MongoClient } = require('mongodb');

module.exports = (url, callback) => {
  const client = new MongoClient(
    url,
    {
      useUnifiedTopology: true
    }
  );

  client.connect(callback);
};
