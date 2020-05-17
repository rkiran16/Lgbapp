const admin = require("firebase-admin");

const serviceAccount = require("../localgreenbook-firebase-adminsdk-hv9ft-0acd9fa5ed.json");

module.exports = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://localgreenbook.firebaseio.com"
});

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://localgreenbook.firebaseio.com"
// });