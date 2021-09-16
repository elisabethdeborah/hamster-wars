//töm databasen (loopa docRef.delete)

const express = require('express')
const router = express.Router()
const { connect } = require('../database.js') 
const db = connect()

const HAMSTERS = 'hamsters'


clear()

async function  clear() {
    console.log('retrieving all hamsters from database...');
    const hamstersRef = db.collection(HAMSTERS)
    const hamstersSnapshot = await hamstersRef.get()
    if ( hamstersSnapshot.empty ) {
        console.log('no documents in collection');
        return
    }
     hamstersSnapshot.forEach(docRef => { //Kom ihåg att vänta på att foreach ska bli färdig, annars får du en tom array
        console.log('deleting...');
         hamstersRef.doc(docRef.id).delete() // we behöver inte await här eftersom vi inte bryr oss om resultatet, inget att vänta på och inte viktigt vilken ordning

    })
}
