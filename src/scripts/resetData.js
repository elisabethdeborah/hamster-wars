//lägg till testdata till databasen


const express = require('express')
const router = express.Router()
const { connect } = require('../database.js') 
const db = connect()

const HAMSTERS = 'hamsters'



const data = require('../data.json')


populate();
async function populate() {
    data.forEach(object => {
        console.log(object);
        delete object.id
        console.log(object);
        db.collection(HAMSTERS).add(object)
    })
    
}