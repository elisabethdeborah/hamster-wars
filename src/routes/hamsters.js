

const express = require('express')
const router = express.Router()
const { connect } = require('../database.js') 
const db = connect()

const HAMSTERS = 'hamsters'

//ENDPOINTS:

//GET /hamsters -> array med alla hamsterobjekt
router.get('/', async(req, res) => { 
    let array = await getAll()
    res.send(array)
})

//GET /hamsters/random -> slumpat hamsterobj
router.get('/random', async(req, res) => { 
    let hamster = await getRandom()
    res.send(hamster)
})

//GET /hamsters/:id -> Hamsterobjekt med ett specifikt id. 404 om inget objekt med detta id finns.
router.get('/:id', async(req, res) => { 
    let maybeHamster = await getOne(req.params.id)
    if (maybeHamster) {
        res.send(maybeHamster) 
    } else {
        res.sendStatus(404)
    }
})

//FUNCTIONS
//GET ALL
const getAll = async() => {
	const hamstersRef = db.collection(HAMSTERS)

	const hamstersSnapshot = await hamstersRef.get()
    console.log(hamstersSnapshot);
	if( hamstersSnapshot.empty ) {
		return []
	}

	const array = []
	await hamstersSnapshot.forEach(async docRef => {
		const data = await docRef.data()
		data.id = docRef.id
		array.push(data)
	})
    return array
}

const getRandom = async() => {
    let array = await getAll()
    let randomNumber = Math.floor(Math.random()*array.length)
    let randomHamster =array[randomNumber];
    console.log(randomHamster, randomNumber);
    return randomHamster
}


const getOne = async(id) => {
    const docRef = db.collection(HAMSTERS).doc(id)
        const docSnapshot = await docRef.get()
    
        if( docSnapshot.exists ) {
            return await docSnapshot.data()
        } else {
            return null
        }
}


module.exports = router

