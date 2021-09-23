
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
    console.log('challengerId: ', challengerId, 'defenderId: ', defenderId);

    const challengerSnapshot = await docRefChallenger.get()
    const defenderSnapshot = await docRefDefender.get()

    const matchesRef = db.collection(MATCHES)
	const matchesSnapshot = await matchesRef.get()


    if (challengerSnapshot.empty || defenderSnapshot.empty || matchesSnapshot.empty) {
        return false
    }        
    
    let challengerData = await challengerSnapshot.data()
    let defenderData = await defenderSnapshot.data()
    
    const testarray = []


	await matchesSnapshot.forEach(async docRef => {
		const data = await docRef.data()
        console.log('data: ', data);
        if(data.winnerId === challengerId && data.loserId === defenderId || data.winnerId === defenderId && data.loserId === challengerId ) {
		testarray.push(data)
        }
	})

    let scoresObject = {
        challengerWins: 0,
        defenderWins: 0
    }

    let challengerWins = 0
    let defenderWins = 0

    testarray.map(match => {
        console.log('match: ',match, 'winnerId: ', match.winnerId, 'challengerId: ', challengerId, 'defenderId: ',defenderId);
        if ( match.winnerId === challengerId ) {
            challengerWins ++
            scoresObject.challengerWins++
        } else if ( match.winnerId === defenderId ) {
            defenderWins ++
            scoresObject.defenderWins++
        }
    })

         console.log('matchData: ', testarray, 'challengerWins: ', challengerWins, 'defenderWins: ', defenderWins, 'OBJECT: ', scoresObject);


         //KOLLA CHALLENGER/DEFENDER-MATCHER
         //RÄKNA ANTAL VUNNA AV CHALLENGER
         //RÄKNAA ANTAL VUNNA AV DEFENDER
         //RETURNERA OBJECT MED ANTAL VINSTER FÖR RESP HAMSTER NÄR DE MÖTT VARANDRA
        /* await matchesSnapshot.forEach(async docRef => {
            const matchData = await docRef.data()
            console.log('winnerId: ', matchData.winnerId, 'valdId: ', id, 'loserId: ', matchData.loserId );
            if(matchData.winnerId === id) {
                array.push(matchData.loserId)
            }
        }) */
        //console.log('array: ',array);
        return scoresObject
}

module.exports = router

