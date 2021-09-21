

const express = require('express')
const router = express.Router()
const { connect } = require('../database.js') 
const db = connect()

const HAMSTERS = 'hamsters'

//ENDPOINTS:

//GET /hamsters -> array med alla hamsterobjekt
router.get('/', async(req, res) => { 
    let array = await getAll()
    if (array) {
        res.send(array)
    } else {
        res.sendStatus(404)
    }
})

//GET /cutest -> objekt för den hamster som vunnit högst procent av sina matcher

router.get('/cutest', async(req, res) => { 
    let array = await getCutest()
    res.status(200).send(array)
})

//GET /hamsters/random -> slumpat hamsterobj
router.get('/random', async(req, res) => { 
    let hamster = await getRandom()
   // res.send(hamster)
    if (hamster) {
        res.send(hamster)
    } else {
        res.sendStatus(404)
    }
})

//GET /hamsters/:id -> Hamsterobjekt med ett specifikt id. 404 om inget objekt med detta id finns.
router.get('/:id', async(req, res) => { 
    let maybeHamster = await getOne(req.params.id)
    if (maybeHamster) {
        res.status(200).send(maybeHamster) 
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
    //let newHamster = await addOne( body.name, body.age, body.favFood, body.loves, body.imgName, body.wins, body.defeats, body.games )
    let newHamster = await addOne( body )
    
    res.status(200).send(newHamster)
    }
    
})

//PUT hamsters/:id -> req.body: obj med ändringar. respons: statuskod
router.put('/:id', async(req, res) => {
    let isHamster = await getOne(req.params.id)
    const maybeHamster = req.body
    try {
        //kontrollera att hamster med angivet id finns
        if (!isHamster) {
            res.sendStatus(404)
        //kontrollera att body är okej valideringsfunktion
        }else if (!isHamsterUpdateObject(maybeHamster)) {
            res.sendStatus(400)
        } else {
        await updateOne(req.params.id, maybeHamster)
        res.sendStatus(200)
        }
    } catch (error) {
        console.log('error: ', error);
    }
    
})

//DELETE hamsters/:id -> respons: status
router.delete('/:id', async(req, res) => {
    let array = await deleteOne(req.params.id)
    //console.log('params: ', req.params.id, array);
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
    let possibleKeys = ['name', 'age', 'favFood', 'loves', 'imgName', 'wins', 'defeats', 'games']
    let keys = Object.keys(maybe) 
    console.log('keys:', keys);
    let values = Object.values(maybe)
    console.log('values: ', values);

    let numberKeys = [ 'wins', 'defeats', 'games', 'age']
    let stringKeys = ['name', 'favFood', 'loves', 'imgName']
   

    //kontrollera att key ska finnas i objekt
    if ( possibleKeys.some(x=>keys.includes(x)) ) {
       console.log('possibleKeys match?: ', possibleKeys.some(x=>keys.includes(x)));
           //kontrollerar att values är rätt type
       let trueOrFalse = keys.map( key => {
           console.log('key: ', key,maybe[key], 'is it a number?: ' ,typeof maybe[key] === 'number', 'is it a string?: ', typeof maybe[key] === 'string');
           if (numberKeys.includes(key) && ( typeof maybe[key] === 'number')) {
                console.log('number', typeof maybe[key] === 'number');
                return true 
           } else if (stringKeys.includes(key) && (typeof maybe[key] === 'string')) {
                console.log('string', typeof maybe[key] === 'string');
                return true
           } 
       })
       console.log('trueOrFalse:', trueOrFalse[0]===true );
       return trueOrFalse[0]===true
    } else {
        return false
    }
   
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

const addOne = async( body ) => {

	const docRef = await db.collection(HAMSTERS).add(body)
	console.log(`Added hamster named ${body.name} with id ${docRef.id}.`);
    const idObject = {
        id: docRef.id
    }
    return idObject;
}

//PUT

const updateOne = async(id, maybeHamster) => {
	const docRef = db.collection(HAMSTERS).doc(id)
    //const updates = maybeHamster
    const settings = { merge: true }
	return docRef.set(maybeHamster, settings)
}


//DELETE


const deleteOne = async(id) => {
	const docRef = db.collection(HAMSTERS).doc(id)
	const docSnapshot = await docRef.get()
    if( docSnapshot.exists ) {
        console.log(`Deleting hamster with id ${id} ...`);
         await docRef.delete()
         return true
    } else {
        return false
    }
}


// GET /HAMSTERS/CUTEST

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
    //sorterar alla hamstrar i fallande ordning baserat på diff
    array.sort((a, b) => {
        let aDiff = a.wins-a.defeats
        let bDiff = b.wins-b.defeats
        return bDiff - aDiff
    })
    //högsta diff-värde
	let maxScore = array[0].wins-array[0].defeats
    //kollar om flera har samma score
	let allWinners = array.filter(x => x.wins-x.defeats === maxScore)

    return allWinners
}


module.exports = router

