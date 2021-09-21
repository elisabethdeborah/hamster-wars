

const express = require('express')
const router = express.Router()
const { connect } = require('../database.js') 
const db = connect()

const HAMSTERS = 'hamsters'

//GET /cutest -> objekt för den hamster som vunnit högst procent av sina matcher

router.get('/', async(req, res) => { 
    let array = await getCutest()
    res.status(200).send(array)
})


const getCutest = async() => {
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

    array.sort((a, b) => {
        let aDiff = a.wins-a.defeats
        let bDiff = b.wins-b.defeats
        return bDiff - aDiff
    })
	let maxScore = array[0].wins-array[0].defeats
	//console.log('maxScore: ', maxScore);

	let allWinners = array.filter(x => x.wins-x.defeats=== maxScore)
	//console.log('allWinners:',allWinners);

    return allWinners
}


module.exports = router