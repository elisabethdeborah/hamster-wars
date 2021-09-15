

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

//POST /hamsters -> req.body: hamster-objekt med id som skapas i db 
router.post('/', async(req, res) => {
    let body = await req.body
    console.log('Inside router.post: req.body: ', body);
    let newHamster = await addOne( body.name , body.age, body.favFood, body.loves, body.imgName, body.wins, body.defeats, body.games )
    res.send(newHamster)
})

//FUNCTIONS

//GET
const getAll = async() => {
	const hamstersRef = db.collection(HAMSTERS)
	const hamstersSnapshot = await hamstersRef.get()
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


//POST 

const addOne = async( name, age, favfood, loves, imgname, wins, defeats, games ) => {
	const object = {
        name: name,
        age: age,
        favFood: favfood,
        loves: loves,
        imgName: imgname,
        wins: wins,
        defeats: defeats,
        games: games
	}

	const docRef = await db.collection(HAMSTERS).add(object)
	console.log(`Added hamster named ${object.name} with id ${docRef.id}.`);
    const idObject = {
        id: docRef.id
    }
    return idObject;
}




module.exports = router

