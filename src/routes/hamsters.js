

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

//POST /hamsters -> req.body: hamster-objekt utan id. respons: objekt med id som skapas i db 
router.post('/', async(req, res) => {
    let body = await req.body
    
    if (!isHamsterObject(body)) {
        res.sendStatus(400)
    } else {
    let newHamster = await addOne( body.name, body.age, body.favFood, body.loves, body.imgName, body.wins, body.defeats, body.games )
    res.send(newHamster)
    }
    
})

//PUT hamsters/:id -> req.body: obj med ändringar. respons: statuskod
router.put('/:id', async(req, res) => {
    const maybeHamster = req.body
    const wins = maybeHamster.wins 
    const defeats = maybeHamster.defeats
    const games = maybeHamster.games
    //kontrollera att body är okej valideringsfunktion
    if (!isHamsterUpdateObject(maybeHamster)) {
        res.sendStatus(404)
    }else {
     await updateOne(req.params.id, wins, defeats, games)
    res.sendStatus(200)
    }
})

//DELETE hamsters/:id -> respons: status
router.delete('/:id', async(req, res) => {
    let array = await deleteOne(req.params.id)
    console.log('params: ', req.params.id, array);
    if (array) {
        res.sendStatus(200)
    } else {
        res.sendStatus(404)
    }
})



//FUNCTIONS
//kontrollerar att det är ett korrekt och fullständigt hamsterobjekt
const isHamsterObject = (body) => {
    let values = Object.values(body)
    let keys = Object.keys(body) 
    let scores = [body.wins, body.defeats, body.games]
    //TYPE ?
    if ( (typeof body) !== 'object' ) {
        return false 
    }
    //EMPTY STRING?
    let emptyValue = values.filter(x => (x.toString().split('')))
    if (emptyValue.length <1) {
        return false
    } 
    
    //kontrollera att keys är korrekta
    if (  !keys.includes('wins') || !keys.includes('defeats')  || !keys.includes('games') || !keys.includes('age') || !keys.includes('name') || !keys.includes('favFood') || !keys.includes('loves')|| !keys.includes('imgName')  ) {
        return false   
    } 
    //kontrollera att numeriska värden är positiva
    let filter = scores.filter( x => (x>=0 && typeof x === 'number' ))
    return filter.length === 3 
}












//Kollar att det är ett korrekt uppdateringsobjekt
const isHamsterUpdateObject = (maybe) => {
    if ( (typeof maybe) !== 'object' ) {
        return false 
    } 
    let keys = Object.keys(maybe) 
    let values = Object.values(maybe)
    //kontrollera att keys är korrekta
    if ( !keys.includes('wins') || !keys.includes('defeats') || !keys.includes('games') ) {
        return false 
    }
    //kontrollera att värdena är positiva
    let filter = values.filter( x => (x>=0 && typeof x === 'number' ))
    return filter.length === 3 
}





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

//PUT

const updateOne = async(id, wins, defeats, games) => {
	const docRef = db.collection(HAMSTERS).doc(id)
    const updates = {
        wins: wins,
        defeats: defeats,
        games: games
    }
    const settings = { merge: true }
	await docRef.set(updates, settings)
}


//DELETE


const deleteOne = async(id) => {
	console.log('Deleting a document...');

	const docRef = db.collection(HAMSTERS).doc(id)
	const docSnapshot = await docRef.get()
	console.log('Document exists? ', docSnapshot.exists);
    if( docSnapshot.exists ) {
         await docRef.delete()
         return true
    } else {
        return false
    }
}


module.exports = router

