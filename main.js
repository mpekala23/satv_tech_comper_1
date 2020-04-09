const express = require('express');
const passportLocal = require('passport-local');
const fs = require('fs');
const bcrypt = require('bcrypt');
const mongodb = require('mongodb');
const bodyParser = require('body-parser');
const uuid = require('uuid/v4');
const session = require('express-session');
const passport = require('passport');

const app = express();
const port = 3000;
// Normally, this would be an environment variable
const session_secret = "secret_cat";
const db_name = "uc";
const mongo_url = "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false";

app.use(session({
  genid: uuid,
  secret: session_secret,
  resave: false,
  saveUninitialized: false
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

function edit_item(items, idx, progress, callback) {
  if(!items || !items.length) {
    return callback(null);
  }
  let item = items[0];
  console.log(item);
  let item_data = {
    title: item.title,
    progress_val: item.progress_val,
    order: idx,
    points: item.points ? item.points : []
  };
  progress.insertOne(item_data, (err) => {
    if(err) return callback(err);
    edit_item(items.slice(1), idx + 1, progress, callback);
  });
}

const client = new mongodb.MongoClient(mongo_url, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect().then(() => {
  const db = client.db(db_name);
  const users = db.collection("users");
  const progress = db.collection("progressbars");

  passport.use(new passportLocal.Strategy((username, password, done) => {
    users.findOne({ username: username }, (err, user) => {
      if(err) return done(err);
      if(!user) return done(null, false, { message: "Invalid username" });
      bcrypt.compare(password, user.password, (err, res) => {
        if(!res) return done(null, false, { message: "Incorrect password" });
        return done(null, user);
      });
    });
  }));
  passport.serializeUser((user, done) => {
    done(null, user._id)
  });
  passport.deserializeUser((user_id, done) => {
    users.findOne({ _id: mongodb.ObjectId(user_id) }, done);
  });

  app.use(passport.initialize());
  app.use(passport.session());

  console.log("Successfully connected to database");

  app.post("/login_user", passport.authenticate("local", { failureRedirect: "/login?failed=true" }), (req, res) => {
    res.redirect("/progress-bars");
  });

  app.get("/get_progress", (req, res, next) => {
    fs.readFile("master_progress", (err, master) => {
      if(err) return next(err);
      progress.find({}).sort({ order: -1 }).toArray((err, progress_data) => {
        if(err) return next(err);
        return res.json({ master: master.toString(), items: progress_data });
      });
    });
  });

  app.get("/check_logged", (req, res) => {
    res.send(req.isAuthenticated().toString());
  });
  
  app.post("/save_progress", (req, res) => {
    if(!req.isAuthenticated()) {
      return res.status(403).send("Not logged in");
    }
    fs.writeFile("master_progress", parseFloat(req.body.master), (err) => {
      if(err) return res.status(500).send("Failed");

      progress.remove({}, (err) => {
        if(err) return res.status(500).send("Failed");
        if(req.body.items && req.body.items.length) {
          edit_item(req.body.items, 0, progress, (err) => {
            if(err) return res.status(500).send("Failed");
            res.send("success");
          });
        } else {
          res.send("success");
        }
      });
    });
  });

  app.listen(port, () => {
    console.log("Listening on port " + port);
  });
}, (err) => {
  console.log("Failed to connect to database: " + err);
});

