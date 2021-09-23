
var admin = require("firebase-admin");

let privateKey;

if ( process.env.PRIVATE_KEY ) {
	privateKey = JSON.parse(process.env.PRIVATE_KEY)
} else {
	privateKey =  require("./secrets/firebase-key.json");
}

//var serviceAccount = require("./secrets/firebase-key.json");

function connect() {
    const app = !admin.apps.length ? admin.initializeApp({
		credential: admin.credential.cert(privateKey)
	}) : admin.app()
	const db = admin.firestore()
	return db
}


module.exports = { connect }
