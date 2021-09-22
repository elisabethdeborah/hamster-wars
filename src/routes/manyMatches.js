

const express = require('express')
const router = express.Router()
const { connect } = require('../database.js') 
const db = connect()

const HAMSTERS = 'hamsters'


//GET /cutest -> objekt för den hamster som vunnit högst procent av sina matcher

router.get('/', async(req, res) => { 
    let array = await getMany()
    res.status(200).send(array)
})


const getMany = async() => {
	const hamstersRef = db.collection(HAMSTERS)
	const hamstersSnapshot = await hamstersRef.get()
	if( hamstersSnapshot.empty ) {
		return false
	}

	const array = []
	await hamstersSnapshot.forEach(async docRef => {
		const data = await docRef.data()
		array.push(data)
	})
    //sorterar alla hamstrar i fallande ordning baserat på diff
    array.sort((a, b) => b.games-a.games)
    //högsta diff-värde
	let highestCount = array[0].games
    console.log('array: ',array, 'highest: ', highestCount);
    //kollar om flera har samma score
	let allHighest = array.filter(x => x.games === highestCount)
    console.log(allHighest);

    return allHighest
}


module.exports = router

