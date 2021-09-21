

const express = require('express')
const router = express.Router()
const { connect } = require('../database.js') 
const db = connect()

const HAMSTERS = 'hamsters'

//GET /cutest -> objekt för den hamster som vunnit högst procent av sina matcher

router.get('/', async(req, res) => { 
    let array = await getTopLosers()
    res.send(array)
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