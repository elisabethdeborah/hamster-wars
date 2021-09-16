

const express = require('express')
const router = express.Router()
const { connect } = require('../database.js') 
const db = connect()

const HAMSTERS = 'hamsters'

//GET /cutest -> objekt för den hamster som vunnit högst procent av sina matcher

router.get('/', async(req, res) => { 
    let array = await getCutest()
    res.send(array)
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
        let aPercentage = (Number(a.wins) / Number(a.games))*100
        let bPercentage = (Number(b.wins) / Number(b.games))*100
        return bPercentage - aPercentage
    })
    return array[0]
}


module.exports = router