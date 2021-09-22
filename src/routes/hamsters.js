

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
    if (array) {
        res.status(200).send(array)
    } else {
        res.sendStatus(404)
    }
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
    
    if (!isHamsterObject(body, 'every')) {
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
        }else if (!isHamsterObject(maybeHamster, 'some')) {
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
//kontrollerar att det är ett korrekt hamsterobjekt


const isHamsterObject = (body, option) => {
    //BODY IS OBJECT ?
    if ( (typeof body) !== 'object' ) {
        return false 
    }

    const possibleKeys = ['name', 'age', 'favFood', 'loves', 'imgName', 'wins', 'defeats', 'games']
    let numberKeys = [ 'wins', 'defeats', 'games', 'age']
    let stringKeys = ['name', 'favFood', 'loves', 'imgName']

    let values = Object.values(body)
    let keys = Object.keys(body) 
    //kontrollera att keys är korrekta, post= alla keys, put= minst en key
    let allKeysExist = possibleKeys.every( key => keys.includes(key) )
    let someKeysExist = possibleKeys.some( key => keys.includes(key) )
    //ny array med siffror, ny med strängar
    if ( !allKeysExist && someKeysExist ) {
        numberKeys = keys.filter(key => numberKeys.includes(key))
        stringKeys = keys.filter(key => stringKeys.includes(key))
    }
    
    //kontrollerar types
    let numberType = numberKeys.every(key=> {
        return typeof body[key] === 'number' && body[key] >= 0
    })

    let stringType = stringKeys.every(key=> {   
        return typeof body[key] === 'string'
    })

    //kontrollerar att inga values är tomma
    let noEmptyValues = values.every( x => x.toString().length > 0 )

    console.log('numberType: ', numberType, 'stringType: ', stringType, 'noEmptyValues: ', noEmptyValues, 'allKeysExist: ', noEmptyValues);
    //POST
    if ( option === 'every' ) {
        console.log('Option: ', option);
        return numberType && stringType && noEmptyValues && allKeysExist
    //PUT
    } else if ( option === 'some' ) {
        console.log('Option: ', option);
        return numberType && stringType && noEmptyValues && someKeysExist
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
    console.log(`Updated hamster named ${maybeHamster.name} with id ${docRef.id}.`);
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

