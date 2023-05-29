const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@twiliocallback.nzfysz8.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let _db;

module.exports = {
  connectToDb: async (cb) => {
    try {
      await client.connect();
      _db = await client.db("twilio");
      return cb();
    } catch (error) {
      console.error(error);
      return cb(error);
    }
  },
  getDb: () => _db,
};
