//töm databasen (loopa docRef.delete)

const express = require('express')
const router = express.Router()
const { connect } = require('../database.js') 
const db = connect()

const MATCHES = 'matches'


clear()

async function  clear() {
    console.log('retrieving all matches from database...');
    const matchesRef = db.collection(MATCHES)
    const matchesSnapshot = await matchesRef.get()
    if ( matchesSnapshot.empty ) {
        console.log('no documents in collection');
        return
    }
    matchesSnapshot.forEach(docRef => { 
        console.log('deleting...');
         matchesRef.doc(docRef.id).delete()

    })
}
