
var admin = require("firebase-admin");

var serviceAccount = require("./secrets/firebase-key.json");

function connect() {
    const app = !admin.apps.length ? admin.initializeApp({
		credential: admin.credential.cert(serviceAccount)
	}) : admin.app()
	const db = admin.firestore()
	return db
}


module.exports = { connect }
