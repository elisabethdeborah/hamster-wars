

const express = require('express')
const router = express.Router()
const { connect } = require('../database.js') 
const db = connect()

const HAMSTERS = 'hamsters'

//GET /losers -> top 5 losers

router.get('/', async(req, res) => { 
    let array = await getTopLosers()
    if (array) {
        res.status(200).send(array)
    } else {
        res.sendStatus(404)
    }
})


const getTopLosers = async() => {
	const hamstersRef = db.collection(HAMSTERS)
	const hamstersSnapshot = await hamstersRef.get()
	if( hamstersSnapshot.empty ) {
		return false
	}

	const array = []
	await hamstersSnapshot.forEach(async docRef => {
		const data = await docRef.data()
		data.id = docRef.id
		array.push(data)
	})

	array.sort((a, b) => b.defeats - a.defeats)
	let topFive = array.slice(0, 5)
    return topFive;
}


module.exports = router