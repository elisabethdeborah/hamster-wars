
const express = require('express')
const router = express.Router()
const { connect } = require('../database.js') 
const db = connect()

const HAMSTERS = 'hamsters'
const MATCHES = 'matches'

//GET /defeated/:hamsterId - array med id för alla hamstrar den valda hamstern har besegrat

router.get('/:id', async(req, res) => { 
    let defeatedList = await getDefeated(req.params.id)
    if (defeatedList) {
        res.status(200).send(defeatedList) 
    } else {
        res.sendStatus(404)
    }
})


const getDefeated = async(id) => {
    const docRef = db.collection(HAMSTERS).doc(id)
    const docSnapshot = await docRef.get()
    const matchesRef = db.collection(MATCHES)
	const matchesSnapshot = await matchesRef.get()
	if( matchesSnapshot.empty ) {
		return []
	}
    if( docSnapshot.empty ) {
        return []
    } 
        let hamsterData = await docSnapshot.data()

         let array = []
        await matchesSnapshot.forEach(async docRef => {
            const matchData = await docRef.data()
            if(matchData.winnerId === id) {
                array.push(matchData.loserId)
            }
        })
        console.log('array: ',array);
        return array
}

module.exports = router

