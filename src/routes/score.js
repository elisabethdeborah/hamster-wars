
const express = require('express')
const router = express.Router()
const { connect } = require('../database.js') 
const db = connect()

const HAMSTERS = 'hamsters'
const MATCHES = 'matches'


//GET /score/:challenger/:defender - två hamster-id som parameter. 
//Respons ska vara ett objekt { challengerWins, defenderWins } med antal vinster för respektive hamster, när de har mött varandra.

router.get('/:challengerid/:defenderid', async(req, res) => { 
    let scoresObject = await getScores(req.params.challengerid,req.params.defenderid)
    if (scoresObject) {
        res.status(200).send(scoresObject) 
    } else {
        res.sendStatus(404)
    }
})


const getScores = async(challengerId, defenderId) => {
    const docRefChallenger = db.collection(HAMSTERS).doc(challengerId)
    const docRefDefender = db.collection(HAMSTERS).doc(defenderId)

    const challengerSnapshot = await docRefChallenger.get()
    const defenderSnapshot = await docRefDefender.get()

    const matchesRef = db.collection(MATCHES)
	const matchesSnapshot = await matchesRef.get()


    if (challengerSnapshot.empty || defenderSnapshot.empty || matchesSnapshot.empty) {
        return false
    }        
    
    
    const matchadeArray = []


	await matchesSnapshot.forEach(async docRef => {
		const data = await docRef.data()
        if(data.winnerId === challengerId && data.loserId === defenderId || data.winnerId === defenderId && data.loserId === challengerId ) {
            matchadeArray.push(data)
        }
	})

    let scoresObject = {
        challengerWins: 0,
        defenderWins: 0
    }

    matchadeArray.map(match => {
        if ( match.winnerId === challengerId ) {
            scoresObject.challengerWins++
        } else if ( match.winnerId === defenderId ) {
            scoresObject.defenderWins++
        }
    })

        return scoresObject
}

module.exports = router

