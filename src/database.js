
var admin = require("firebase-admin");

var serviceAccount = require("./secrets/firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});