const dns = require("dns");

// System DNS often fails SRV lookups on Windows; use reliable resolvers.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
require("dotenv").config();

mongoose.set("strictQuery", false);

const connection = mongoose.connect(process.env.mongourl, {
  serverSelectionTimeoutMS: 10000,
});

module.exports = connection;
