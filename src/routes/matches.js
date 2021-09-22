

const express = require('express')
const router = express.Router()
const { connect } = require('../database.js') 
const db = connect()

const MATCHES = 'matches'
const HAMSTERS ='hamsters'

//GET /matches -> respons: array med alla matchobject
router.get('/', async(req, res) => { 
    let array = await getAllMatches()
    if ( array.length > 0 ) {
        res.status(200).send(array)
    } else {
        res.sendStatus(404)
    }
})

//GET /matches:id -> respons: matchobjekt med ett specifikt id
router.get('/:id', async(req, res) => { 
    let matchIdExists = await getOne(req.params.id)
    if (matchIdExists) {
        res.status(200).send(matchIdExists) 
    } else {
        res.sendStatus(404)
    }
})

//POST /matches -> body: matchobjekt (utan id), respons: ett objekt med id för det nya objekt som skapats i db
router.post('/', async(req, res) => {
    let body = await req.body
    if (!isMatchObject(body)) {
        res.sendStatus(400)
    } else {
    let newMatchObject = await addMatch( body.winnerId, body.loserId)
    res.status(200).send(newMatchObject)
    }
})


//DELETE /MATCHES/:ID -> respons: statuskod
router.delete('/:id', async(req, res) => {
    let array = await deleteMatch(req.params.id)
    if (array) {
        res.sendStatus(200)
    } else {
        res.sendStatus(404)
    }
})


//FUNCTIONS
const isMatchObject = (body) => {
    let values = Object.values(body)
    let keys = Object.keys(body) 
    //TYPE ?
    if ( (typeof body) !== 'object' ) {
        return false 
    }
    //kontrollera att keys är korrekta
    if (  !keys.includes('winnerId') || !keys.includes('loserId') ) {
        return false   
    } 
    //kolla att id:n är inte tomma strängar
    let notEmpty = values[0].length && values[1].length > 0
    return notEmpty
}

const updateMatchResults = async(winnerId, loserId) => {
    //update winner hamster-object
    const winnerRef = db.collection(HAMSTERS).doc(winnerId)
    const winnerSnapShot = await winnerRef.get()
    if (winnerSnapShot.exists ){
        const winnerData = winnerSnapShot.data()

        const winnerUpdates = {
            wins: winnerData.wins+1,
            games: winnerData.games+1
        }
    
        const winnerSettings = { merge: true }
        await winnerRef.set(winnerUpdates, winnerSettings) 
    } else {
        return false
    }

    //update loser hamster-object
    const loserRef = db.collection(HAMSTERS).doc(loserId)
    const loserSnapShot = await loserRef.get()
    if (loserSnapShot.exists) {
        const loserData = loserSnapShot.data()
        
          const loserUpdates = {
              defeats: loserData.defeats+1,
              games: loserData.games+1
          }
      
          const loserSettings = { merge: true }
          await loserRef.set(loserUpdates, loserSettings)
    } else {
        return false
    }
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

    //add ny match-object
    const object = {
        winnerId: winnerId,
        loserId: loserId
	}

	const docRef = await db.collection(MATCHES).add(object)
	console.log(`Added a match with winner-ID: ${object.winnerId} and loser-ID: ${object.loserId}. Match-ID: ${docRef.id}.`);
    const idObject = {
        id: docRef.id
    }
    updateMatchResults(winnerId, loserId)
    return idObject;
}


//DELETE
const deleteMatch = async(id) => {
	console.log('Deleting match...');

	const docRef = db.collection(MATCHES).doc(id)
	const docSnapshot = await docRef.get()
    if( docSnapshot.exists ) {
         await docRef.delete()
         return true
    } else {
        return false
    }
	
}


module.exports = router