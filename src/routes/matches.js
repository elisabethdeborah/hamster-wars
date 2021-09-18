

const express = require('express')
const router = express.Router()
const { connect } = require('../database.js') 
const db = connect()

const MATCHES = 'matches'
const HAMSTERS ='hamsters'

//GET /matches -> respons: array med alla matchobject
router.get('/', async(req, res) => { 
    let array = await getAllMatches()
    res.send(array)
})

//GET /matches:id -> respons: matchobjekt med ett specifikt id
router.get('/:id', async(req, res) => { 
    let matchIdExists = await getOne(req.params.id)
    if (matchIdExists) {
        res.send(matchIdExists) 
    } else {
        res.sendStatus(404)
    }
})

//POST /matches -> body: matchobjekt (utan id), respons: ett objekt med id för det nya objekt som skapats i db
router.post('/', async(req, res) => {
    let body = await req.body
    console.log('body in router-function: ', body);
    if (!isMatchObject(body)) {
        res.sendStatus(400)
    } else {
    let newMatchObject = await addMatch( body.winnerId, body.loserId)
    res.send(newMatchObject)
    }
})


//DELETE /MATCHES/:ID -> respons: statuskod
router.delete('/:id', async(req, res) => {
    let array = await deleteMatch(req.params.id)
    console.log('params: ', req.params.id, array);
    if (array) {
        res.sendStatus(200)
    } else {
        res.sendStatus(404)
    }
})






//FUNCTIONS
const isMatchObject = (body) => {
    console.log('body in ismatchobj: ', body);
    let values = Object.values(body)
    let keys = Object.keys(body) 
    //TYPE ?
    if ( (typeof body) !== 'object' ) {
        return false 
    }
    //kontrollera att keys är korrekta
    if (  !keys.includes('winnerId') || !keys.includes('loserId') ) {
        console.log('keys: ', keys);
        return false   
    } 
    values.map(x=> console.log(typeof x, x.length))
    //kolla att id:n är inte tomma strängar
    let notEmpty = values[0].length && values[1].length > 0
    console.log(notEmpty );
    return notEmpty
}




//GET
const getAllMatches = async() => {
	const matchesRef = db.collection(MATCHES)
	const matchesSnapshot = await matchesRef.get()
	if( matchesSnapshot.empty ) {
		return []
	}

	const array = []
	matchesSnapshot.forEach(async docRef => {
		const data = await docRef.data()
		data.id = docRef.id
		array.push(data)
	})
    return array
}

const getOne = async(id) => {
    const docRef = db.collection(MATCHES).doc(id)
    const docSnapshot = await docRef.get()
    if( docSnapshot.exists ) {
        return docSnapshot.data()
    } else {
        return null
    }
}

//POST
const addMatch = async( winnerId, loserId ) => {
	const object = {
        winnerId: winnerId,
        loserId: loserId
	}

	const docRef = await db.collection(MATCHES).add(object)
	console.log(`Added a match with winner-ID: ${object.winnerId} and loser-ID: ${object.loserId}. Match-ID: ${docRef.id}.`);
    const idObject = {
        id: docRef.id
    }
    return idObject;
}


//DELETE
const deleteMatch = async(id) => {
	console.log('Deleting match...');

	const docRef = db.collection(MATCHES).doc(id)
	const docSnapshot = await docRef.get()
	console.log('Match exists? ', docSnapshot.exists);
    if( docSnapshot.exists ) {
         await docRef.delete()
         return true
    } else {
        return false
    }
	
}


///SENARE: GET /MATCHWINNERS, /WINNERS /LOSERS


module.exports = router