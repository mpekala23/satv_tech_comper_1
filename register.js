// This script registers a user

const bcrypt = require('bcrypt');
const mongodb = require('mongodb');

if(process.argv.length != 4) {
  console.log("Usage: node register.js [username] [password]");
  return;
}

let username = process.argv[2];
let password = process.argv[3];

const db_name = "uc";
const mongo_url = "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false";

const client = new mongodb.MongoClient(mongo_url, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect().then(() => {
  const db = client.db(db_name);
  const users = db.collection("users");

  users.findOne({ username: username }, (err, existing) => {
    if(err) {
      console.log("Error getting user info");
      return;
    }
    if(existing) {
      console.log("Username exists");
      return;
    }
    bcrypt.hash(password, 10, (err, hash) => {
      if(err) {
        console.log("Error hashing password");
        return;
      }
      users.insertOne({ username: username, password: hash }, (err) => {
        if(err) {
          console.log("Error inserting user");
          return;
        }
        console.log("Success!");
      });
    });
  });
}, () => {
  console.log("Failed to connect to database");
});
